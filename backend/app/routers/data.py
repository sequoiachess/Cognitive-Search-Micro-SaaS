from fastapi import APIRouter, UploadFile, File, HTTPException, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from pydantic import BaseModel

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class IngestResponse(BaseModel):
    message: str
    filename: str
    file_size: int


@router.post("/ingest", response_model=IngestResponse)
@limiter.limit("10/minute")
async def ingest_document(file: UploadFile = File(...)):
    """
    Accept PDF document upload for ingestion.
    This is a placeholder that logs the filename and returns success.
    """
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported"
        )
    
    file_content = await file.read()
    file_size = len(file_content)
    
    print(f"[INGEST] Received file: {file.filename} ({file_size} bytes)")
    
    return IngestResponse(
        message="Document ingested successfully",
        filename=file.filename,
        file_size=file_size
    )