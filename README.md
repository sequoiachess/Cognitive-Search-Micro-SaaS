# README.md

# Cognitive Search Micro-SaaS

A full-stack application that enables document ingestion and intelligent querying using Google's Gemini 2.0 Flash API with RAG (Retrieval-Augmented Generation).

## Technology Stack

- **Frontend:** React (no build tool required for CodeSandbox)
- **Backend:** Python FastAPI
- **LLM:** Google Gemini 2.0 Flash API
- **RAG:** Vector embeddings with semantic search
- **Database:** PostgreSQL with pgvector extension
- **Container:** Docker Compose

## Features

✅ **Document Processing**
- Upload PDF documents
- Automatic text extraction
- Intelligent text chunking with overlap
- Vector embeddings using Gemini

✅ **Semantic Search**
- RAG-powered query system
- Searches uploaded documents for relevant context
- Cosine similarity matching

✅ **Context-Aware Responses**
- Answers based on YOUR uploaded documents
- Source attribution to specific documents
- Falls back to general knowledge when needed

✅ **Document Management**
- List all uploaded documents
- View document statistics
- Delete documents and their embeddings

## Prerequisites

- Node.js 18+ and npm (for local development)
- Python 3.11+
- Docker and Docker Compose
- **Google Cloud API Key with Gemini API access** (Required)

## Getting Your Gemini API Key

Before running the application, you need to obtain a Google Gemini API key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated API key
5. Keep it secure - you'll need it in the setup steps below

## 🔑 Where to Add Your API Key

**You ONLY need to edit ONE file:** `backend/.env`

### Method 1: Create the .env file (Recommended)
```bash
# Navigate to backend directory
cd backend

# Copy the example file
cp .env.example .env

# Edit the .env file
nano .env  # or use any text editor (VS Code, vim, etc.)
```

**Open `backend/.env` and find this line:**
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Replace `your_gemini_api_key_here` with your actual API key:**
```env
GEMINI_API_KEY=AIza***********************************
```

### Method 2: Using Terminal Commands
```bash
cd backend

# Create .env file with your API key in one command
cat > .env << 'EOF'
DATABASE_URL=postgresql://dbuser:dbpassword@localhost:5432/cognitive_search
GEMINI_API_KEY=PASTE_YOUR_API_KEY_HERE
SECRET_KEY=change-this-to-a-secure-random-string-min-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EOF
```

**Then edit the file to replace `PASTE_YOUR_API_KEY_HERE` with your actual key.**

### ⚠️ IMPORTANT: Never Edit Python Files

**DO NOT** put your API key in any `.py` files! The application reads it from the `.env` file automatically through `backend/app/config.py`.

**File locations:**
- ✅ **CORRECT:** `backend/.env` ← Put your API key here
- ❌ **WRONG:** `backend/app/routers/query.py` ← Never hardcode keys here
- ❌ **WRONG:** `backend/app/config.py` ← Never hardcode keys here
- ❌ **WRONG:** Any other `.py` file

## Setup Instructions

### Option 1: CodeSandbox (Easiest)

1. Fork or clone this repository to CodeSandbox
2. **Configure Backend Environment Variables:**
```bash
   cd backend
   cp .env.example .env
```
3. **Edit the `backend/.env` file and add your Gemini API key:**
```env
   DATABASE_URL=postgresql://dbuser:dbpassword@localhost:5432/cognitive_search
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   SECRET_KEY=your-secret-key-change-this-to-something-random-32-chars
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
```
4. **IMPORTANT:** Replace `your_actual_gemini_api_key_here` with your actual API key from Google AI Studio
5. Install frontend dependencies (CodeSandbox may do this automatically)
6. For backend, you'll need to run it separately (see Local Development)

### Option 2: Local Development

#### 1. Clone and Configure Environment
```bash
# Clone the repository
git clone https://github.com/sequoiachess/Cognitive-Search-Micro-SaaS
cd Cognitive-Search-Micro-SaaS

# Navigate to backend directory
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use any text editor
```

**⚠️ CRITICAL STEP:** Open the `backend/.env` file and replace the placeholder values with your actual credentials:
```env
DATABASE_URL=postgresql://dbuser:dbpassword@localhost:5432/cognitive_search
GEMINI_API_KEY=AIzaSy...your-actual-key-here  # ⚠️ REPLACE THIS
SECRET_KEY=your-secure-random-string-at-least-32-characters-long  # ⚠️ CHANGE THIS
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### 2. Start Database with Docker Compose
```bash
# From project root
docker-compose up -d
```

#### 3. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database with pgvector extension
python init_db.py

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Keep this terminal running!** Backend will be available at `http://localhost:8000`

#### 4. Frontend Setup (Open a NEW Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will be available at `http://localhost:3000`

## Running Both Backend and Frontend Simultaneously

**You need BOTH servers running at the same time:**

### Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

The frontend automatically proxies API requests to the backend via the configuration in `package.json`.

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user

### Data Management
- `POST /api/v1/data/ingest` - Upload and process PDF document
- `GET /api/v1/data/documents` - List all uploaded documents
- `DELETE /api/v1/data/documents/{id}` - Delete a document

### Query
- `POST /api/v1/query/llm` - Query using Gemini 2.0 Flash with RAG

## Testing the Application

### Step 1: Upload a Test Document

First, you need to upload a PDF document. You can use any PDF, but here are some suggestions:

**Option A: Create a Simple Test PDF**
Create a text file and convert it to PDF, or use any existing PDF like:
- Company handbook
- Research paper
- Product manual
- Meeting notes
- Technical documentation

**Option B: Use a Sample Document**
Download a sample PDF from the internet (e.g., a whitepaper, guide, or report)

**Upload Process:**
1. Go to the "Upload Document" section
2. Select your PDF file
3. Click "Upload Document"
4. Wait for the success message showing:
   - Document ingested successfully
   - Number of chunks created (e.g., "chunks_created: 15")

**⏱️ Note:** Processing may take 30-60 seconds depending on document size, as the system:
- Extracts text from the PDF
- Splits it into chunks
- Creates embeddings for each chunk
- Stores everything in the database

---

### Step 2: Query Your Uploaded Document

Now you can ask questions about your uploaded document!

#### Example Queries (Document-Specific):

**If you uploaded a company handbook:**
```
What is the vacation policy mentioned in the document?
```

**If you uploaded a technical document:**
```
What are the main technical specifications described in the document?
```

**If you uploaded a research paper:**
```
What is the main hypothesis or conclusion of this research?
```

**If you uploaded meeting notes:**
```
What action items were discussed in the meeting?
```

**General document queries:**
```
Summarize the key points from the uploaded document
```
```
What topics are covered in the document?
```
```
Extract the main findings from the document
```

---

### Step 3: Test Without Documents (General Knowledge)

You can also test queries that don't rely on uploaded documents:

#### Simple Queries (High Confidence Expected):

**1. Basic Factual Query:**
```
What is photosynthesis?
```
**Expected:** High confidence, clear scientific explanation, general knowledge sources.

**2. Definition Query:**
```
Explain what machine learning is
```
**Expected:** High confidence, comprehensive definition, technical documentation sources.

**3. How-to Query:**
```
How does a blockchain work?
```
**Expected:** High confidence, step-by-step explanation.

---

#### Medium Complexity Queries:

**4. Comparison Query:**
```
What are the differences between React and Vue.js?
```
**Expected:** Medium confidence, detailed comparison.

**5. Business/Technical Query:**
```
What are the best practices for API security?
```
**Expected:** Medium confidence, comprehensive list.

**6. Multi-aspect Query:**
```
Explain the benefits and challenges of cloud computing for small businesses
```
**Expected:** Medium confidence, balanced analysis.

---

#### Complex Queries (Lower Confidence Expected):

**7. Analytical Query:**
```
What factors should a startup consider when choosing between PostgreSQL and MongoDB?
```
**Expected:** Medium to low confidence, detailed analysis.

**8. Strategic Query:**
```
How can companies implement AI while maintaining data privacy?
```
**Expected:** Medium confidence, strategic recommendations.

**9. Speculative Query:**
```
What will be the impact of quantum computing on cybersecurity in the next decade?
```
**Expected:** Low confidence, forward-looking analysis.

---

### Understanding the Response

#### When Documents Are Used (RAG Active):
```json
{
  "query": "What is the vacation policy?",
  "response": {
    "answer": "According to the Employee Handbook, employees receive 15 days of paid vacation annually...",
    "confidence": "high",
    "sources": ["Company Handbook 2024", "HR Policy Document"],
    "follow_up_questions": [
      "How do vacation days accrue over time?",
      "Can unused vacation days be carried over?"
    ]
  },
  "model": "gemini-2.0-flash-exp",
  "sources_used": ["company_handbook.pdf"]  // ← Your uploaded document!
}
```

**Look for:**
- 📄 **"Documents Used"** section showing your PDF filename (highlighted in blue)
- ✓ **"Using RAG with uploaded documents"** indicator at the bottom
- **Higher confidence** when answering from your documents

#### When No Relevant Documents Found:
```json
{
  "query": "What is photosynthesis?",
  "response": {
    "answer": "Photosynthesis is the process by which plants convert light energy...",
    "confidence": "high",
    "sources": ["Plant Biology Fundamentals", "Cellular Processes Guide"],
    "follow_up_questions": [...]
  },
  "model": "gemini-2.0-flash-exp",
  "sources_used": []  // ← No documents used, general knowledge
}
```

---

### What to Look For in Responses:

✅ **RAG-Powered Responses (with uploaded documents):**
- Your PDF filename appears in "📄 Documents Used"
- Answer references specific content from your document
- Higher confidence (usually "high")
- Sources include your actual document names
- More accurate and specific to your content

✅ **General Knowledge Responses:**
- No documents listed in "Documents Used"
- Answer from Gemini's training data
- Confidence varies by query complexity
- Sources are AI-generated placeholders

✅ **All responses should have:**
- A detailed answer (minimum 50 words)
- Confidence level (high/medium/low)
- 2-3 source references
- 2 relevant follow-up questions

---

### Testing PDF Upload:

**Test the upload feature:**
1. Select a PDF file (any PDF document)
2. Upload it through the "Upload Document" section
3. You should see:
   - Success message: "Document ingested successfully"
   - Filename and file size
   - Number of chunks created (e.g., 15 chunks)
   - Document ID

**Verify it worked:**
- Ask a question about the content
- Check if your filename appears in "Documents Used"
- The answer should reference content from your PDF

---

## How RAG Works in This Application

### The RAG Pipeline:

1. **Document Upload** → PDF is uploaded
2. **Text Extraction** → Extract text from PDF using PyPDF2
3. **Chunking** → Split text into overlapping chunks (~1000 chars each)
4. **Embedding** → Create vector embeddings using Gemini's embedding model
5. **Storage** → Store chunks and embeddings in PostgreSQL
6. **Query Processing** → When user asks a question:
   - Create embedding for the query
   - Search for similar chunks using cosine similarity
   - Retrieve top 3 most relevant chunks
   - Include chunks in Gemini prompt as context
7. **Response Generation** → Gemini answers using document context
8. **Source Attribution** → System tracks which documents were used

### Benefits:

- 📄 **Accurate answers** from YOUR documents
- 🎯 **Relevant context** automatically found
- 🔍 **Semantic search** understands meaning, not just keywords
- 📊 **Source tracking** shows which documents were used
- 🔄 **Falls back** to general knowledge when needed

---

## Testing
```bash
cd backend
pytest tests/test_api.py -v
```

## Security Notes

- **NEVER commit your `.env` file to GitHub** - it contains your API keys
- The `.gitignore` file is configured to exclude `.env` files
- Rate limiting implemented (5 requests per minute per IP for document processing)
- Passwords hashed with bcrypt
- API keys stored in environment variables only
- CORS configured for frontend domain

## Production Deployment (GCP)

1. Build Docker images
2. Push to Google Container Registry
3. Deploy to Cloud Run
4. Configure Cloud SQL for PostgreSQL with pgvector extension
5. Set environment variables in Cloud Run (including your Gemini API key)
6. **Never hardcode API keys in your source code**

## Troubleshooting

### "Invalid API Key" Error or "Settings object has no attribute" Error
- **Solution:** Make sure you've created a `backend/.env` file (not just `.env.example`)
- Verify your Gemini API key is correct and has Gemini API access enabled
- Check that there are no extra spaces or quotes around the API key in `.env`
- Ensure the `.env` file is in the `backend/` directory, not the project root
- **DO NOT** hardcode the API key in any Python files

**To verify your .env file exists:**
```bash
cd backend
ls -la .env  # Should show the file
cat .env     # Should display your environment variables
```

### "Invalid Host header" (Frontend)
- Create a `.env` file in `frontend/` directory with:
```
  DANGEROUSLY_DISABLE_HOST_CHECK=true
  WDS_SOCKET_PORT=0
```

### Backend won't start
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Make sure your virtual environment is activated
- Check that the `.env` file exists and has all required variables
- Verify you're in the `backend/` directory when running uvicorn
- Run `python init_db.py` to initialize the database with pgvector

### Frontend can't connect to Backend
- Verify both servers are running (backend on :8000, frontend on :3000)
- Check the proxy setting in `frontend/package.json` points to `http://localhost:8000`

### Document upload fails or takes too long
- **Rate Limit:** Gemini API has embedding rate limits (15 RPM free tier)
- **Solution:** Upload smaller documents first, or wait between uploads
- **Large PDFs:** May take 1-2 minutes to process due to rate limiting
- Check backend logs for specific errors

### No documents found in queries
- Verify documents were uploaded successfully (check "chunks_created" in response)
- Run `python init_db.py` to ensure pgvector extension is installed
- Check database connection is working

### Rate Limit (429) Errors
- Free tier limits: 15 requests per minute, 1,500 per day
- Wait 5-10 minutes between large batches of requests
- Consider upgrading to paid tier for higher limits

## Environment Variables Reference

### Backend (.env) - Location: `backend/.env`
```env
DATABASE_URL=postgresql://dbuser:dbpassword@localhost:5432/cognitive_search
GEMINI_API_KEY=<your-gemini-api-key>           # Required - Get from Google AI Studio
SECRET_KEY=<random-32-character-string>         # Required - Generate a secure random string
ALGORITHM=HS256                                 # Optional - Default is HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30                  # Optional - Default is 30
```

### Frontend (.env) - Location: `frontend/.env` - Optional
```env
DANGEROUSLY_DISABLE_HOST_CHECK=true  # Only needed for CodeSandbox/remote environments
WDS_SOCKET_PORT=0                     # Only needed for CodeSandbox/remote environments
```

## Project Structure
```
cognitive-search-micro-saas/
├── backend/
│   ├── .env                    ← PUT YOUR API KEY HERE
│   ├── .env.example            ← Template (don't edit this)
│   ├── requirements.txt        ← Python dependencies (includes RAG libs)
│   ├── init_db.py              ← Database initialization script
│   ├── app/
│   │   ├── config.py           ← Reads .env file (don't edit)
│   │   ├── database.py         ← Database connection
│   │   ├── models.py           ← Database models (User, Document, DocumentChunk)
│   │   ├── main.py             ← FastAPI app
│   │   ├── rag_utils.py        ← RAG utility functions (NEW)
│   │   └── routers/
│   │       ├── query.py        ← RAG-powered query endpoint (UPDATED)
│   │       ├── auth.py         ← User authentication
│   │       └── data.py         ← Document upload & processing (UPDATED)
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── homepage.jsx    ← Main UI (shows RAG status)
│   │   └── components/
│   │       └── FileUpload.jsx  ← Document upload component
│   ├── public/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Key Dependencies Added for RAG
```
pypdf2==3.0.1                    # PDF text extraction
pgvector==0.2.4                  # PostgreSQL vector extension
sentence-transformers==2.2.2     # Text embeddings (fallback)
```

## License

MIT

---

## Important Security Reminders

🔒 **Your `backend/.env` file should NEVER be committed to version control**

🔒 **Each person running this application needs their own Gemini API key**

🔒 **Change the `SECRET_KEY` to a unique, random value for production**

🔒 **Only edit the `.env` file - never hardcode API keys in Python files**

---

## Quick Start Checklist

- [ ] Get Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] Create `backend/.env` file from `backend/.env.example`
- [ ] Add your API key to `backend/.env` (line: `GEMINI_API_KEY=your_key_here`)
- [ ] Verify `.env` file exists: `ls backend/.env`
- [ ] Install backend dependencies: `pip install -r backend/requirements.txt`
- [ ] Initialize database: `python backend/init_db.py`
- [ ] Install frontend dependencies: `npm install` (in frontend directory)
- [ ] Start database: `docker-compose up -d`
- [ ] Start backend server (Terminal 1)
- [ ] Start frontend server (Terminal 2)
- [ ] **Upload a test PDF document** (wait for "chunks_created" confirmation)
- [ ] Test with document-specific query: "Summarize the key points from the document"
- [ ] Verify your PDF filename appears in "📄 Documents Used"
- [ ] Test with general query: "What is photosynthesis?" (should use general knowledge)

---

## RAG System Architecture
```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         Frontend (React)            │
│  - Upload PDF                       │
│  - Submit Query                     │
│  - Display Results with Sources     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│      Backend API (FastAPI)          │
│                                     │
│  Upload Pipeline:                  │
│  1. Extract text from PDF          │
│  2. Chunk text (1000 chars)        │
│  3. Create embeddings              │
│  4. Store in database              │
│                                     │
│  Query Pipeline:                   │
│  1. Create query embedding         │
│  2. Search for similar chunks      │
│  3. Retrieve top 3 matches         │
│  4. Add context to prompt          │
│  5. Generate response              │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  PostgreSQL + pgvector              │
│  - Documents table                  │
│  - DocumentChunks table             │
│  - Vector embeddings                │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│   Google Gemini API                 │
│  - text-embedding-004 (embeddings) │
│  - gemini-2.0-flash-exp (answers)  │
└─────────────────────────────────────┘
```

## What Makes This a Complete Micro-SaaS

✅ **Full-Stack Application** - Frontend + Backend + Database
✅ **AI-Powered** - Uses state-of-the-art LLM (Gemini 2.0 Flash)
✅ **RAG Implementation** - Searches and uses your own documents
✅ **Vector Search** - Semantic similarity matching
✅ **User Authentication** - Secure user registration
✅ **Document Management** - Upload, list, delete documents
✅ **Rate Limiting** - Production-ready API protection
✅ **Error Handling** - Graceful degradation and retry logic
✅ **Source Attribution** - Tracks which documents were used
✅ **Responsive UI** - Clean, modern interface
✅ **Scalable Architecture** - Ready for production deployment

---

**Ready to test?** Upload a document and start querying! 🚀
