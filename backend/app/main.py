from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.routers import auth, data, query

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Cognitive Search API", version="1.0.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.codesandbox.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(data.router, prefix="/api/v1/data", tags=["Data"])
app.include_router(query.router, prefix="/api/v1/query", tags=["Query"])


@app.get("/")
async def root():
    return {"message": "Cognitive Search API - Powered by Gemini 2.0 Flash"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}