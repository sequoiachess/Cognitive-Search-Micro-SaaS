# README.md

# Cognitive Search Micro-SaaS

A full-stack application that enables document ingestion and intelligent querying using Google's Gemini 2.0 Flash API.

## Technology Stack

- **Frontend:** React (no build tool required for CodeSandbox)
- **Backend:** Python FastAPI
- **LLM:** Google Gemini 2.0 Flash API
- **Database:** PostgreSQL
- **Container:** Docker Compose

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
GEMINI_API_KEY=AIza******************************************
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
git clone https://github.com/YOUR_USERNAME/cognitive-search-micro-saas.git
cd cognitive-search-micro-saas

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

# Run migrations (create tables)
python -c "from app.database import engine; from app.models import Base; Base.metadata.create_all(bind=engine)"

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
- `POST /api/v1/data/ingest` - Upload PDF document

### Query
- `POST /api/v1/query/llm` - Query using Gemini 2.0 Flash

## Testing the Application

### Simple Queries (High Confidence Expected):

#### 1. Basic Factual Query:
```
What is photosynthesis?
```
**Expected:** High confidence, clear scientific explanation with educational sources.

#### 2. Definition Query:
```
Explain what machine learning is
```
**Expected:** High confidence, comprehensive definition with technical sources.

#### 3. How-to Query:
```
How does a blockchain work?
```
**Expected:** High confidence, step-by-step explanation with technical documentation sources.

---

### Medium Complexity Queries:

#### 4. Comparison Query:
```
What are the differences between React and Vue.js?
```
**Expected:** Medium confidence, detailed comparison with framework documentation sources.

#### 5. Business/Technical Query:
```
What are the best practices for API security?
```
**Expected:** Medium confidence, comprehensive list with security guide sources.

#### 6. Multi-aspect Query:
```
Explain the benefits and challenges of cloud computing for small businesses
```
**Expected:** Medium confidence, balanced analysis with business strategy sources.

---

### Complex Queries (Lower Confidence Expected):

#### 7. Analytical Query:
```
What factors should a startup consider when choosing between PostgreSQL and MongoDB?
```
**Expected:** Medium to low confidence, detailed analysis with database comparison sources.

#### 8. Strategic Query:
```
How can companies implement AI while maintaining data privacy?
```
**Expected:** Medium confidence, strategic recommendations with policy and compliance sources.

#### 9. Speculative Query:
```
What will be the impact of quantum computing on cybersecurity in the next decade?
```
**Expected:** Low confidence, forward-looking analysis with research paper sources.

---

### Expected Response Format:
```json
{
  "answer": "Photosynthesis is the process by which plants convert light energy into chemical energy. During this process, plants use sunlight, water, and carbon dioxide to produce glucose and oxygen. This occurs primarily in the chloroplasts of plant cells, where chlorophyll absorbs light energy. The process consists of two main stages: the light-dependent reactions and the Calvin cycle...",
  "confidence": "high",
  "sources": [
    "Plant Biology Fundamentals 2024",
    "Cellular Processes in Botany - Chapter 3",
    "Photosynthesis Research Handbook Vol. 12"
  ],
  "follow_up_questions": [
    "What role does chlorophyll play in photosynthesis?",
    "How do different wavelengths of light affect photosynthesis efficiency?"
  ]
}
```

### What to Look For in Responses:

✅ **Good responses should have:**
- A detailed answer (minimum 50 words)
- Confidence level appropriate to query complexity (high/medium/low)
- 2-3 plausible, specific source titles (e.g., "Database Design Guide 2024" or "Cloud Architecture Best Practices Vol. 3")
- 2 relevant follow-up questions that extend or clarify the topic

✅ **Confidence Levels:**
- **High:** Simple factual queries, definitions, well-established concepts
- **Medium:** Comparisons, synthesis of multiple concepts, technical best practices
- **Low:** Speculative queries, future predictions, highly context-dependent questions

---

### Testing PDF Upload:

1. Create or download any PDF file
2. Use the "Upload Document" section
3. You should see a success message with filename and size
4. **Note:** This is currently a placeholder - the PDF content is not processed yet

## Testing
```bash
cd backend
pytest tests/test_api.py -v
```

## Security Notes

- **NEVER commit your `.env` file to GitHub** - it contains your API keys
- The `.gitignore` file is configured to exclude `.env` files
- Rate limiting implemented (10 requests per minute per IP)
- Passwords hashed with bcrypt
- API keys stored in environment variables only
- CORS configured for frontend domain

## Production Deployment (GCP)

1. Build Docker images
2. Push to Google Container Registry
3. Deploy to Cloud Run
4. Configure Cloud SQL for PostgreSQL
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

### Frontend can't connect to Backend
- Verify both servers are running (backend on :8000, frontend on :3000)
- Check the proxy setting in `frontend/package.json` points to `http://localhost:8000`

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
│   ├── requirements.txt
│   ├── app/
│   │   ├── config.py           ← Reads .env file (don't edit)
│   │   ├── main.py
│   │   └── routers/
│   │       ├── query.py        ← Uses API key from .env (don't edit)
│   │       ├── auth.py
│   │       └── data.py
│   └── tests/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── docker-compose.yml
└── README.md
```

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
- [ ] Install frontend dependencies: `npm install` (in frontend directory)
- [ ] Start backend server (Terminal 1)
- [ ] Start frontend server (Terminal 2)
- [ ] Test with Query #1: "What is photosynthesis?"
- [ ] Test with Query #4: "What are the differences between React and Vue.js?"
- [ ] Test with Query #9: "What will be the impact of quantum computing on cybersecurity in the next decade?"
