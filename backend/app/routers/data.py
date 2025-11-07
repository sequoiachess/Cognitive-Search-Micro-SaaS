from fastapi import APIRouter, UploadFile, File, HTTPException, status, Request, Depends
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from pydantic import BaseModel
from typing import List
import time

from app.database import get_db
from app.models import Document, DocumentChunk
from app.rag_utils import extract_text_from_pdf, chunk_text, create_embedding

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class IngestResponse(BaseModel):
    message: str
    filename: str
    file_size: int
    document_id: int
    chunks_created: int


class DocumentInfo(BaseModel):
    id: int
    filename: str
    file_size: int
    total_chunks: int
    upload_date: str


@router.post("/ingest", response_model=IngestResponse)
@limiter.limit("5/minute")
async def ingest_document(request: Request, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Accept PDF document upload, extract text, create embeddings, and store in database.
    """
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported"
        )
    
    try:
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        print(f"[INGEST] Processing file: {file.filename} ({file_size} bytes)")
        
        # Extract text from PDF
        text = extract_text_from_pdf(file_content)
        print(f"[INGEST] Extracted {len(text)} characters of text")
        
        if len(text) < 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PDF appears to be empty or text could not be extracted"
            )
        
        # Create document record
        document = Document(
            filename=file.filename,
            file_size=file_size,
            total_chunks=0
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        
        # Split text into chunks
        chunks = chunk_text(text)
        print(f"[INGEST] Created {len(chunks)} chunks")
        
        # Create embeddings and store chunks
        chunks_created = 0
        for idx, chunk_content in enumerate(chunks):
            try:
                # Create embedding
                embedding = create_embedding(chunk_content)
                
                # Store chunk
                chunk = DocumentChunk(
                    document_id=document.id,
                    chunk_index=idx,
                    content=chunk_content,
                    embedding=embedding
                )
                db.add(chunk)
                chunks_created += 1
                
                # Add small delay to avoid rate limits
                if idx > 0 and idx % 5 == 0:
                    time.sleep(1)
                    
            except Exception as e:
                print(f"[INGEST] Error processing chunk {idx}: {str(e)}")
                continue
        
        # Update document with chunk count
        document.total_chunks = chunks_created
        db.commit()
        
        print(f"[INGEST] Successfully processed {chunks_created} chunks")
        
        return IngestResponse(
            message="Document ingested successfully",
            filename=file.filename,
            file_size=file_size,
            document_id=document.id,
            chunks_created=chunks_created
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing document: {str(e)}"
        )


@router.get("/documents", response_model=List[DocumentInfo])
async def list_documents(db: Session = Depends(get_db)):
    """List all uploaded documents"""
    documents = db.query(Document).order_by(Document.upload_date.desc()).all()
    
    return [
        DocumentInfo(
            id=doc.id,
            filename=doc.filename,
            file_size=doc.file_size,
            total_chunks=doc.total_chunks,
            upload_date=doc.upload_date.isoformat()
        )
        for doc in documents
    ]


@router.delete("/documents/{document_id}")
async def delete_document(document_id: int, db: Session = Depends(get_db)):
    """Delete a document and all its chunks"""
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Delete chunks
    db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()
    
    # Delete document
    db.delete(document)
    db.commit()
    
    return {"message": f"Document '{document.filename}' deleted successfully"}
