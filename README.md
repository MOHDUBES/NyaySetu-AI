# ⚖️ NyaySetu AI (न्यायसेतु)
### End-to-End GenAI Legal Accessibility Platform for India
**Built for the Hack2Skill PromptWars — "AI for Legal Assistance & Access" Challenge**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-61DAFB?logo=react&logoColor=black)](https://vitejs.dev)
[![Google Gemini](https://img.shields.io/badge/LLM-Google%20GenAI%20SDK%20(Gemini)-4285F4?logo=google&logoColor=white)](https://ai.google.dev)
[![Web Speech API](https://img.shields.io/badge/Voice-STT%20%2B%20TTS%20(Hindi%2FEnglish)-FFB300)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
[![Tests](https://img.shields.io/badge/Tests-43%20Passed%20(pytest%20%2B%20vitest)-brightgreen)](#-testing--code-quality)
[![Repository Size](https://img.shields.io/badge/Repo%20Size-%3C%201MB%20(Clean)-blue)](#-repository-constraints--cleanliness)

> ⚠️ **Persistent Legal Disclaimer**: NyaySetu AI provides **informational framing only** and is **not legal advice**. It does not establish an attorney-client relationship. Always consult a licensed legal professional for actionable decisions.

---

## 📌 Problem Statement & Solution

### The Real Indian Legal Barrier: Language + Literacy
Over **85% of India's population** does not read, write, or conduct daily transactions in legal English ("legalese"). When confronted with rental agreements, employment contracts, loan agreements, or service terms:
- Citizens sign without understanding binding obligations, unfair penalties, or forfeiture clauses.
- Even in regional languages, legal text remains dense and inaccessible for citizens with limited literacy.
- Commercial legal consultation is prohibitively expensive for everyday queries.

### How NyaySetu AI (न्यायसेतु) Bridges the Gap
NyaySetu AI serves as an accessible digital bridge (*सेतु*) between complex legal agreements and the common citizen through:
1. **Hindi/Hinglish-First Bilingual Intelligence**: Translates dense legal syntax into simple conversational vocabulary ("सरल बोलचाल की भाषा").
2. **Voice-First Accessibility**: Allows users to speak queries via microphone in Hindi/English and listens to complete spoken explanations through browser-native Text-to-Speech (TTS).
3. **WCAG AA Visual Intelligence**: Automatically tags risks, deadlines, duties, and financial terms with distinct icons and labels (never relying on color alone).
4. **Side-by-Side Comparison with Spoken Diff**: Compares two versions of a contract (e.g. original lease vs. renewal lease) and reads out exact modifications.
5. **Strict Ethical Guardrails**: Strips definitive verdicts (e.g., *"you will win"*) to ensure safe, responsible legal assistance.

---

## 🏆 Hackathon Evaluation Criteria Mapping

This table directly maps NyaySetu AI’s implementation to the **6 evaluation criteria** of the PromptWars challenge:

| Evaluation Criterion | How NyaySetu AI Solves It | Implementation Location |
|---|---|---|
| **1. Problem Statement Alignment** | Solves India's real justice gap: **Language + Literacy**. Moves beyond generic English simplification to provide a **Hindi/Hinglish-first** document simplification, comparison, and voice-driven Q&A platform for unrepresented citizens. | [DocumentViewer.tsx](frontend/src/components/DocumentViewer.tsx), [ComparisonView.tsx](frontend/src/components/ComparisonView.tsx), [ChatPanel.tsx](frontend/src/components/ChatPanel.tsx), [llm.py](backend/app/services/llm.py) |
| **2. Accessibility (Judged Priority)** | **Voice input (Speech-to-Text) + Voice output (Text-to-Speech)** in Hindi (`hi-IN`) and English (`en-IN`) for low-literacy citizens. Complete audio readout on comparison diffs, full keyboard navigation, `aria-live` regions, WCAG AA color contrast, and badges rendered with **icons + text labels** (never color alone). | [ChatPanel.tsx](frontend/src/components/ChatPanel.tsx), [ComparisonView.tsx](frontend/src/components/ComparisonView.tsx), [ClauseHighlighter.tsx](frontend/src/components/ClauseHighlighter.tsx) |
| **3. Code Quality** | Clean modular architecture with strict separation of concerns (`services/`, `routers/`, `models/`). Strongly typed Pydantic v2 schemas for backend and TypeScript interfaces for frontend. Zero implicit `any`. | [schemas.py](backend/app/models/schemas.py), [api.ts](frontend/src/lib/api.ts) |
| **4. Security & Safety Guardrails** | Strict SlowAPI rate limiting (`60/hr` for chat, upload, and comparison). Magic-byte file validation preventing executable disguised uploads. In-memory content sanitization (removes script/JS injection, no permanent PII stored). Strict negative prompt constraints preventing definitive legal verdicts. | [main.py](backend/app/main.py), [parser.py](backend/app/services/parser.py), [llm.py](backend/app/services/llm.py) |
| **5. Efficiency & Scalability** | Cosine similarity vector search over tokenized chunks (RAG) with instant on-the-fly embedding fallback. Non-blocking async FastAPI endpoints with Uvicorn. Mobile-optimized responsive frontend with Vite proxy routing and HMR. | [embeddings.py](backend/app/services/embeddings.py), [session_store.py](backend/app/services/session_store.py), [vite.config.ts](frontend/vite.config.ts) |
| **6. Testing & Reliability** | **43 automated unit tests across frontend & backend**: 27 pytest tests covering document parsing, magic bytes, XSS sanitization, and clause detection; 16 Vitest tests covering upload, bilingual toggling, clause display, and speech controls. | [test_parser.py](backend/app/tests/test_parser.py), [test_clause_detector.py](backend/app/tests/test_clause_detector.py), [src/tests/](frontend/src/tests/) |

---

## 🌟 The Key Differentiator: Language + Voice-First Access

> **Why this matters**: Over 85% of Indians do not read or conduct business in English legalese. Furthermore, millions struggle with dense written text even in their native script. Generic legal AI hackathon projects merely rewrite English contracts into simplified English. 
> 
> **NyaySetu AI is built Hindi/Hinglish-first with full voice input/output**:
> 1. **Bilingual Simplification**: Every agreement is synthesized into both conversational English and natural Hindi/Hinglish ("सरल बोलचाल की भाषा") with instant 1-click toggle.
> 2. **Voice-Driven Q&A (STT)**: Users can speak questions into the microphone in Hindi or English (e.g., *"क्या मकान मालिक बिना नोटिस के निकाल सकता है?"*).
> 3. **Spoken Answers (TTS)**: Answers are read aloud using browser-native speech synthesis with accurate `hi-IN` and `en-IN` vocal models — critical for illiterate or visually impaired citizens.
> 4. **Strict Safety Guardrails**: Answers are scoped strictly to the uploaded document and automatically sanitized to prevent definitive verdicts (e.g., changing *"you will win"* to informational framing).

---

## 🏛️ System Architecture Diagrams

### 1. High-Level Platform Architecture
```mermaid
graph TB
    User["👤 Citizen / User (Desktop & Mobile Browser)"]
    
    subgraph ClientLayer ["Frontend Client (React 19 + Vite + TailwindCSS)"]
        UI["Accessible Responsive UI (WCAG AA)"]
        STT["🎙️ Web Speech STT (Hindi / English Voice Input)"]
        TTS["🔊 Web Speech TTS (Spoken Audio Output)"]
        LangToggle["🌐 Language Switcher (हिन्दी ⇋ English)"]
        Viewers["DocumentViewer • ClauseHighlighter\nComparisonView • ChatPanel • LawyerBrief"]
    end
    
    subgraph APILayer ["Backend API Gateway (FastAPI + SlowAPI)"]
        Limiter["🛡️ Rate Limiter (60 req/hr IP Protection)"]
        UploadRouter["📁 /api/documents (Upload & Validate)"]
        AnalysisRouter["🔍 /api/analysis (Summarize & Clauses)"]
        ChatRouter["💬 /api/chat (Grounded RAG Q&A)"]
        CompareRouter["⚖️ /api/comparison (Bilingual Diff & Verdict)"]
    end
    
    subgraph CoreServices ["Core AI & Processing Services"]
        Parser["📄 Parser (Magic Byte Check + XSS Sanitizer)"]
        RAG["📐 Embeddings & Cosine Similarity Engine"]
        LLMService["🤖 Google GenAI SDK (Gemini 2.5 Flash / Lite)"]
        Guardrails["⚖️ Safety Guardrails (Legal Verdict Stripper)"]
        SessionMemory["💾 Ephemeral In-Memory Document Store"]
    end

    User -->|"Mic Voice In"| STT --> UI
    User -->|"File Upload / Click"| UI
    UI --> LangToggle
    UI --> Viewers
    Viewers -->|"REST API via Proxy"| Limiter
    Limiter --> UploadRouter & AnalysisRouter & ChatRouter & CompareRouter
    UploadRouter --> Parser --> SessionMemory
    AnalysisRouter --> LLMService --> Guardrails
    ChatRouter --> RAG --> LLMService --> Guardrails
    CompareRouter --> LLMService --> Guardrails
    Guardrails -->|"Structured JSON"| Viewers
    Viewers -->|"Speech Audio Out"| TTS --> User
```

### 2. Dual-Engine RAG & Comparison Flow
```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Citizen / User
    participant FE as 🖥️ Frontend (Vite Proxy)
    participant BE as ⚙️ FastAPI Backend
    participant AI as 🧠 Google Gemini 2.5
    participant Voice as 🔊 Web Speech TTS

    Note over User,Voice: Flow 1: Document Upload & Bilingual Simplification
    User->>FE: Uploads PDF / DOCX
    FE->>BE: POST /api/documents/upload (Magic Byte Check)
    BE->>AI: Generate Bilingual Summary + Risk Clauses
    AI-->>BE: Returns JSON (English + Hindi / Hinglish)
    BE-->>FE: Structured Analysis Response
    FE-->>User: Visual Section Cards + WCAG Risk Badges

    Note over User,Voice: Flow 2: Voice-Driven Grounded Q&A
    User->>FE: Speaks question in Hindi (e.g., "क्या नोटिस ज़रूरी है?")
    FE->>BE: POST /api/chat (Query + Document ID)
    BE->>BE: Cosine Similarity Chunk Retrieval (RAG)
    BE->>AI: Grounded Prompt (Strict Negative Constraint)
    AI-->>BE: Safe Informational Answer
    BE-->>FE: Grounded Answer + Excerpt Sources
    FE->>Voice: Speaks Answer in natural hi-IN voice
    Voice-->>User: 🔊 Plays clear audio response

    Note over User,Voice: Flow 3: Contract Comparison with Voice Readout
    User->>FE: Uploads Agreement V1 & Agreement V2
    FE->>BE: POST /api/comparison/compare
    BE->>AI: Generate Diff, Favorable Verdict & Key Differences
    AI-->>BE: Bilingual Comparison JSON
    BE-->>FE: Side-by-Side Diff Cards
    User->>FE: Clicks "बोलकर सुनें (Voice TTS)" on Modified Section
    FE->>Voice: Speaks exact clause difference
    Voice-->>User: 🔊 Explains what changed between contracts
```

---

## 📂 Project Structure

```
nyaysetu-ai/
├── .env.example                     # Environment template (Gemini API, Supabase)
├── render.yaml                      # 1-Click Render Cloud deployment configuration
├── run.bat                          # 1-Command shortcut to run backend (.\run)
├── start-backend.bat                # 1-Click launcher for FastAPI backend server
├── start-all.bat                    # 1-Click launcher for both Backend & Frontend
├── sample_rental_agreement.pdf      # Sample rental contract V1 for instant testing
├── sample_rental_agreement_v2.pdf   # Sample rental renewal contract V2 for comparison
│
├── backend/                         # FastAPI Python Backend
│   ├── run.py                       # Python runner (python run.py)
│   ├── requirements.txt             # Backend dependencies (FastAPI, google-genai, PyMuPDF)
│   ├── pytest.ini                   # Pytest configuration
│   └── app/
│       ├── main.py                  # App entrypoint, CORS, SlowAPI rate limiting
│       ├── models/
│       │   └── schemas.py           # Pydantic v2 data models for requests & responses
│       ├── routers/
│       │   ├── analysis.py          # /api/analysis (Summaries, clauses, checklist, lawyer brief)
│       │   ├── auth.py              # /api/auth (User session & token management)
│       │   ├── chat.py              # /api/chat (RAG grounded Q&A with cosine similarity)
│       │   ├── comparison.py        # /api/comparison (Side-by-side contract diff)
│       │   └── documents.py         # /api/documents (Upload, magic bytes, text extraction)
│       ├── services/
│       │   ├── clause_detector.py   # Normalizes obligations, risks, deadlines, financial terms
│       │   ├── comparison.py        # Semantic text diff & change categorizer
│       │   ├── embeddings.py        # Vector embedding generator with gemini-embedding-001
│       │   ├── llm.py               # Google GenAI SDK (Gemini 2.5 Flash / Lite multi-model fallback)
│       │   ├── parser.py            # PDF/DOCX magic-byte validator & script sanitizer
│       │   └── session_store.py     # Ephemeral in-memory document store with TTL
│       └── tests/
│           ├── test_clause_detector.py # Unit tests for clause categorization & schemas
│           └── test_parser.py       # Unit tests for magic bytes, sanitization & XSS
│
└── frontend/                        # React 19 + Vite + TailwindCSS Frontend
    ├── package.json                 # Frontend dependencies (React, Framer Motion, Lucide, Vitest)
    ├── vite.config.ts               # Vite config with network hosting (host: true) & API reverse proxy
    ├── vercel.json                  # SPA routing configuration for Vercel deployment
    ├── public/
    │   └── favicon.svg              # Scales of Justice + Bridge accessible SVG favicon
    └── src/
        ├── App.tsx                  # Root application router & layout
        ├── index.css                # Custom design system tokens, gradients & glassmorphism
        ├── components/
        │   ├── ActionChecklist.tsx  # Interactive checklist of action items & verification steps
        │   ├── ChatPanel.tsx        # Voice STT / TTS chat panel with document grounding
        │   ├── ClauseHighlighter.tsx# WCAG AA clause cards with icons, labels & explanations
        │   ├── ComparisonView.tsx   # Side-by-side diff with dual Voice TTS buttons
        │   ├── DisclaimerBanner.tsx # Persistent legal advisory disclaimer banner
        │   ├── DocumentViewer.tsx   # Bilingual document summary, sections & jargon glossary
        │   ├── FileUpload.tsx       # Drag-and-drop file upload with validation feedback
        │   ├── LawyerBrief.tsx      # 1-Page lawyer consultation brief & PDF export
        │   └── Navbar.tsx           # Navigation bar with user name display & inline edit
        ├── pages/
        │   ├── Landing.tsx          # Landing page with value proposition & ethical AI badge
        │   ├── Dashboard.tsx        # Document upload workspace & quick start guide
        │   ├── DocumentAnalysis.tsx # Main analysis dashboard with all interactive tools
        │   ├── Comparison.tsx       # Two-document comparison upload & diff viewer
        │   └── Auth.tsx             # User authentication (Sign In & Sign Up with Full Name)
        ├── lib/
        │   ├── api.ts               # Axios client configured for seamless local & mobile proxy
        │   └── supabase.ts          # Supabase client initialization & types
        └── tests/
            ├── ClauseHighlighter.test.tsx # Vitest unit tests for clause cards & badges
            ├── DocumentViewer.test.tsx    # Vitest unit tests for bilingual toggle & glossary
            ├── FileUpload.test.tsx        # Vitest unit tests for drag-and-drop & file validation
            └── setup.ts                   # Test environment setup
```

---

## 📋 Core Features (In Priority Order)

### 1. Document Upload & Bilingual Simplification
- Upload PDF or DOCX (rental agreements, employment letters, ToS, loan notes).
- Magic-byte validation & sanitization removes any script/eval injections before processing.
- Gemini 2.5 generates structured summaries in **both plain English and Hindi/Hinglish**.
- Section-by-section breakdown with original excerpts vs. plain-language explanations.
- Interactive Jargon Glossary translating intimidating legal terms into conversational vocabulary.

### 2. Voice-First Q&A with Document Grounding (RAG)
- User speaks queries using the microphone in Hindi or English.
- Semantic vector chunking with cosine similarity retrieves the top relevant excerpts.
- Response is framed informationally and spoken back to the user via TTS.
- Strict refusal when queries fall outside the document scope.

### 3. Clause & Risk Highlighter (WCAG AA)
- Auto-classifies document terms into 4 semantic categories:
  - 🛡️ **Obligations (Blue)**: Mandated duties.
  - ⚠️ **Risks & Red Flags (Red)**: Liabilities, uncapped penalties, unilateral changes.
  - 📅 **Deadlines (Amber)**: Expiry dates, notice windows.
  - 💰 **Financial Terms (Green)**: Deposits, fees, forfeiture clauses.
- Adheres to accessibility requirements: **Always pairs icon + text label alongside color**, never relying on color alone.
- Plain-language "Why this matters" tooltip with audio pronunciation.

### 4. Document Comparison Mode with Voice TTS
- Compares two versions of a document side-by-side (e.g., old lease vs. renewal lease).
- Semantic diff identifies additions, deletions, and modifications.
- AI generates a summary indicating which version is more favorable to the tenant/employee.
- Dual Voice TTS buttons on both Doc 1 and Doc 2 diff sections for low-literacy users.

### 5. "Prepare for a Lawyer" Brief Generator
- Converts complex contracts into a 1-page consultation brief.
- Generates categorized concerns, financial liabilities, and specific, targeted questions to ask an attorney.
- Instant PDF download formatted for easy reading by legal counsel in billable consultations.

### 6. User Profile & Identity
- Displays clean, formatted user name in the top navigation bar instead of raw email addresses.
- One-click inline editing (pencil icon) allowing users to personalize their display name.
- Sign-up form includes a dedicated Full Name field.

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion | High performance, instant HMR, fluid micro-animations, accessible design. |
| **Backend** | Python 3.11+, FastAPI, Uvicorn | Async performance, auto-generated OpenAPI documentation, fast execution. |
| **LLM & AI** | Google GenAI SDK (`google-genai`), Gemini 2.5 Flash | Google Antigravity native integration, cost-efficient, low-latency reasoning. |
| **Voice / Speech** | Browser-native Web Speech API | Zero client bandwidth overhead, native Hindi & English acoustic models. |
| **Parsing & Magic** | PyMuPDF, python-docx, python-magic | Byte-level validation, multi-format parsing, security verification. |
| **Testing** | pytest, pytest-asyncio, Vitest, Testing Library | End-to-end regression prevention and component assertion (43 tests). |
| **Rate Limiting** | SlowAPI | Protection against API exhaustion and denial-of-service attempts. |

---

## ⚡ Quick Launch Scripts

To eliminate the need to memorize or type long terminal commands, convenient launcher scripts are provided:

| Method | Command / Action | Description |
|---|---|---|
| **Short Command** | `.\run` | Runs the backend from project root |
| **Backend Folder** | `python run.py` | Direct launcher inside `backend/` directory |
| **1-Click Backend** | Double-click `start-backend.bat` | Opens and runs backend on `http://localhost:8000` |
| **1-Click Full Stack** | Double-click `start-all.bat` | Launches **both** backend (port 8000) and frontend (port 5173) in separate windows |

---

## 📱 Mobile Device & Local Network Testing

The frontend is configured with `host: true` and smart Vite reverse-proxy routing:
- **Same Wi-Fi / Hotspot Access**: Open `http://<your-pc-ip>:5173/` on any smartphone or tablet connected to the same network.
- **Relative API Proxy**: All API calls route through Vite proxy (`/api`), ensuring document uploads and comparisons work on mobile without CORS or localhost issues.
- **Browser Mobile Mode**: Press `F12` followed by `Ctrl + Shift + M` on desktop browsers to preview touch interactions and responsive layouts immediately.

---

## 🧪 Testing & Code Quality

Both backend and frontend feature comprehensive test suites configured for CI/CD:

### Backend Tests (27 passed)
```bash
cd backend
python -m pytest app/tests/ -v
```
- `test_parser.py`: Tests XSS sanitization, script removal, javascript protocol blocking, magic-byte PDF/DOCX identification, EXE rejection, empty byte handling.
- `test_clause_detector.py`: Tests normalization of arbitrary clause categories, count aggregations, unique ID assignment, and character truncation.

### Frontend Tests (16 passed)
```bash
cd frontend
npm test -- --run
```
- `FileUpload.test.tsx`: Tests drag-and-drop, file type validation (PDF/DOCX), rejection of invalid files, and progress indicators.
- `ClauseHighlighter.test.tsx`: Tests WCAG AA badge rendering (icon + label), filtering by risk/obligation/deadline/financial, and collapsible explanations.
- `DocumentViewer.test.tsx`: Tests instant English-to-Hindi language switching, section accordion toggle, jargon glossary expansion, and ARIA roles.

---

## 🔒 Security, Privacy & Ethics Guardrails

1. **No Legal Verdicts**: Every LLM prompt is injected with an immutable preamble preventing verdicts (e.g., *"this is illegal"*, *"you will win"*). Post-processing filters regex-strip and replace any unauthorized conclusion patterns in both English and Hindi.
2. **Rate Limiting**: Critical endpoints (`/api/documents/upload`, `/api/chat/*`, `/api/comparison`) enforce rate limits via SlowAPI to prevent token depletion and DoS.
3. **Magic-Byte File Verification**: Uploads are verified by their file header bytes (`%PDF-`, `PK\x03\x04`), preventing executable files disguised with fake extensions from ever being processed.
4. **Zero Persistent PII**: Documents are cached only within ephemeral session memory with automatic cleanup.
5. **Secret Hygiene**: Real API keys are never committed; `.env` is rigorously ignored, and `.env.example` provides sanitized templates.

---

## 🚀 Deployment Guide

NyaySetu AI is pre-configured for 1-click cloud deployment:

### Deploy Backend to Render
1. Push this repository to GitHub.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New > Blueprint** and select your repository (Render automatically reads `render.yaml`).
4. Set the environment variable `GEMINI_API_KEY` in the Render dashboard.
5. Your backend service will be live at `https://nyaysetu-backend.onrender.com`.

### Deploy Frontend to Vercel
1. Log into [Vercel](https://vercel.com).
2. Import the repository and set **Root Directory** to `frontend`.
3. Set the Environment Variable:
   ```
   VITE_API_BASE_URL=https://your-backend-app.onrender.com
   ```
4. Click **Deploy**. Vercel will build using Vite and route all client paths through `frontend/vercel.json`.

---

## 💻 Local Setup Instructions

### 1. Prerequisites
- Python 3.11+
- Node.js 18+
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/MOHDUBES/NyaySetu-AI.git
cd NyaySetu-AI/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp ../.env.example .env
# Open .env and add your GEMINI_API_KEY

# Run server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be accessible at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```
Open `http://localhost:5173` (or `http://localhost:5174`) in Google Chrome or Microsoft Edge for optimal Web Speech API voice support.

---

## 📦 Repository Constraints & Cleanliness

- **Single Branch**: All development consolidated cleanly on the primary branch.
- **Repository Size**: Under **0.4 MB** total clean code footprint (strictly excludes `node_modules`, `dist`, `.venv`, and sample PDFs).
- **Environment Safety**: Zero committed credentials or API keys.

---

## ⚖️ Disclaimer
NyaySetu AI is an assistive GenAI tool developed for research and educational purposes during Hack2Skill PromptWars. It is not an attorney and does not replace human legal counsel.
