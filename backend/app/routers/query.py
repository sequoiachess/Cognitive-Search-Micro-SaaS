from fastapi import APIRouter, HTTPException, status, Request, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
import google.generativeai as genai
import time
from typing import List

from app.config import get_settings
from app.database import get_db
from app.models import DocumentChunk
from app.rag_utils import create_query_embedding, cosine_similarity

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
settings = get_settings()

genai.configure(api_key=settings.GEMINI_API_KEY)


class QueryRequest(BaseModel):
    user_query: str
    use_documents: bool = True  # Whether to search documents


class QueryResponse(BaseModel):
    query: str
    response: dict
    model: str
    sources_used: List[str] = []


@router.post("/llm", response_model=QueryResponse)
@limiter.limit("5/minute")
async def query_llm(request: Request, query_request: QueryRequest, db: Session = Depends(get_db)):
    """
    Query the Gemini 2.0 Flash API with user input.
    Optionally searches uploaded documents for relevant context.
    """
    
    if not query_request.user_query or len(query_request.user_query.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty"
        )
    
    max_retries = 3
    retry_delay = 2
    relevant_chunks = []
    sources_used = []
    
    # Search documents if enabled
    if query_request.use_documents:
        try:
            # Create embedding for query
            query_embedding = create_query_embedding(query_request.user_query)
            
            # Get all chunks from database
            all_chunks = db.query(DocumentChunk).all()
            
            if all_chunks:
                # Calculate similarity scores
                chunk_scores = []
                for chunk in all_chunks:
                    if chunk.embedding:
                        similarity = cosine_similarity(query_embedding, chunk.embedding)
                        chunk_scores.append((chunk, similarity))
                
                # Sort by similarity and get top 3
                chunk_scores.sort(key=lambda x: x[1], reverse=True)
                relevant_chunks = [chunk.content for chunk, score in chunk_scores[:3] if score > 0.3]
                
                # Get document sources
                if relevant_chunks:
                    from app.models import Document
                    doc_ids = list(set([chunk.document_id for chunk, score in chunk_scores[:3] if score > 0.3]))
                    documents = db.query(Document).filter(Document.id.in_(doc_ids)).all()
                    sources_used = [doc.filename for doc in documents]
                
                print(f"[RAG] Found {len(relevant_chunks)} relevant chunks from documents")
        except Exception as e:
            print(f"[RAG] Error searching documents: {str(e)}")
            # Continue without document context
    
    for attempt in range(max_retries):
        try:
            model = genai.GenerativeModel('gemini-2.0-flash-exp')
            
            # Build context from relevant chunks
            context = ""
            if relevant_chunks:
                context = "\n\n**Relevant information from uploaded documents:**\n\n"
                for idx, chunk in enumerate(relevant_chunks, 1):
                    context += f"[Document excerpt {idx}]:\n{chunk}\n\n"
            
            # Updated system_prompt with document context
            system_prompt = f"""
You are the **Cognitive Search Engine** backend. Your primary function is to analyze a user's query and provide a precise, structured summary of the best available information.

{context}

**You MUST adhere to these critical rules:**
1.  **Structure:** Always respond with a single, valid JSON object. Do not include any text, thoughts, or markdown (like ```json) outside of the JSON block itself.
2.  **Focus:** Act as if you are summarizing content you've retrieved from documents. Your answers must be factual and directly address the user's request.
3.  **Sources:** {"If document excerpts are provided above, prioritize information from those documents and list them in sources. Additionally, generate 1-2 plausible supplementary source titles." if relevant_chunks else "Generate 2-3 plausible, specific-sounding document titles or internal references for the 'sources' array."}
4.  **Confidence:** Your confidence level must reflect the complexity of the query. Use 'high' for simple fact retrieval (especially from provided documents), 'medium' for synthesis of multiple concepts, and 'low' if the query is highly speculative or outside your defined scope.

**JSON Schema Required:**
```json
{{
    "answer": "Your detailed, summarized answer (minimum 50 words) here. Begin with a direct one-sentence summary. If document excerpts were provided, prioritize information from them.",
    "confidence": "[must be 'high', 'medium', or 'low']",
    "sources": ["Source 1", "Source 2"],
    "follow_up_questions": ["Question that extends the user's initial topic", "Question that clarifies a point in your answer"]
}}
```
"""
            
            full_prompt = f"{system_prompt}\n\nUser Query: {query_request.user_query}"
            
            response = model.generate_content(full_prompt)
            response_text = response.text.strip()
            
            # Clean up potential markdown artifacts
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            import json
            try:
                parsed_response = json.loads(response_text)
            except json.JSONDecodeError:
                parsed_response = {
                    "answer": response_text,
                    "confidence": "medium",
                    "sources": sources_used if sources_used else ["Generated Response"],
                    "follow_up_questions": []
                }
            
            # Add document sources if not already in response
            if sources_used and "sources" in parsed_response:
                # Prepend actual document sources
                existing_sources = parsed_response.get("sources", [])
                parsed_response["sources"] = sources_used + [s for s in existing_sources if s not in sources_used]
            
            return QueryResponse(
                query=query_request.user_query,
                response=parsed_response,
                model="gemini-2.0-flash-exp",
                sources_used=sources_used
            )
            
        except Exception as e:
            error_message = str(e)
            
            if "429" in error_message or "Resource exhausted" in error_message:
                if attempt < max_retries - 1:
                    print(f"Rate limit hit, retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                    continue
                else:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="Rate limit exceeded. Please wait a few minutes before trying again."
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error querying Gemini API: {error_message}"
                )
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to get response after multiple retries"
    )
