from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
import google.generativeai as genai
from app.config import get_settings

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
settings = get_settings()

genai.configure(api_key=settings.GEMINI_API_KEY)


class QueryRequest(BaseModel):
    user_query: str


class QueryResponse(BaseModel):
    query: str
    response: dict
    model: str


@router.post("/llm", response_model=QueryResponse)
@limiter.limit("10/minute")
async def query_llm(request: QueryRequest):
    """
    Query the Gemini 2.0 Flash API with user input.
    Returns structured JSON response.
    """
    
    if not request.user_query or len(request.user_query.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty"
        )
    
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Updated system_prompt for Cognitive Search relevance
        system_prompt = """
You are the **Cognitive Search Engine** backend. Your primary function is to analyze a user's query and provide a precise, structured summary of the best available information.

**You MUST adhere to these critical rules:**
1.  **Structure:** Always respond with a single, valid JSON object. Do not include any text, thoughts, or markdown (like ```json) outside of the JSON block itself.
2.  **Focus:** Act as if you are summarizing content you've retrieved from a set of technical or legal documents. Your answers must be factual and directly address the user's request.
3.  **Sources:** If you had access to real documents, you would list the source documents (e.g., "Document ID: XYZ", "Chapter 5"). Since you are currently generating the information, you **MUST** generate 2-3 plausible, specific-sounding document titles or internal references (e.g., "The 2024 Policy Review", "Appendix A of the Technical Spec V1.2") for the 'sources' array. Do not use generic placeholders.
4.  **Confidence:** Your confidence level must reflect the complexity of the query. Use 'high' for simple fact retrieval, 'medium' for synthesis of multiple concepts, and 'low' if the query is highly speculative or outside your defined scope.

**JSON Schema Required:**
```json
{
    "answer": "Your detailed, summarized answer (minimum 50 words) here. Begin with a direct one-sentence summary.",
    "confidence": "[must be 'high', 'medium', or 'low']",
    "sources": ["Plausible Source Title 1", "Plausible Source Title 2"],
    "follow_up_questions": ["Question that extends the user's initial topic", "Question that clarifies a point in your answer"]
}
```
"""
        
        full_prompt = f"{system_prompt}\n\nUser Query: {request.user_query}"
        
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
            # Fallback if JSON parsing fails
            parsed_response = {
                "answer": response_text,
                "confidence": "medium",
                "sources": ["Generated Response"],
                "follow_up_questions": []
            }
        
        return QueryResponse(
            query=request.user_query,
            response=parsed_response,
            model="gemini-2.0-flash-exp"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error querying Gemini API: {str(e)}"
        )