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

## 🏆 Hackathon Evaluation Criteria Mapping

This table directly maps NyaySetu AI’s implementation to the **6 evaluation criteria** of the PromptWars challenge:

| Evaluation Criterion | How NyaySetu AI Solves It | Implementation Location |
|---|---|---|
| **1. Problem Statement Alignment** | Solves India's real justice gap: **Language + Literacy**. Moves beyond generic English simplification to provide a **Hindi/Hinglish-first** document simplification and voice-driven Q&A platform for unrepresented citizens. | [DocumentViewer.tsx](file:///c:/Users/mohdu/OneDrive/Desktop/nyaysetu-ai/frontend/src/components/DocumentViewer.tsx), [ChatPanel.tsx](file:///c:/Users/mohdu/OneDrive/Desktop/nyaysetu-ai/frontend/src/components/ChatPanel.tsx), [llm.py](file:///c:/Users/mohdu/OneDrive/Desktop/nyaysetu-ai/backend/app/services/llm.py) |
| **2. Accessibility (Judged Priority)** | **Voice input (Speech-to-Text) + Voice output (Text-to-Speech)** in Hindi (`hi-IN`) and English (`en-IN`) for low-literacy users. Full keyboard navigation, `aria-live` status regions, WCAG AA color contrast, and clauses rendered with **icons + text labels** (never color alone). | [ChatPanel.tsx](file:///c:/Users/mohdu/OneDrive/Desktop/nyaysetu-ai/frontend/src/components/ChatPanel.tsx), [ClauseHighlighter.tsx](file:///c:/Users/mohdu/OneDrive/Desktop/nyaysetu-ai/frontend/src/components/ClauseHighlighter.tsx) |
| **3. Code Quality** | Clean modular architecture with strict separation of concerns (`services/`, `routers/`, `models/`). Strongly typed Pydantic models for backend and TypeScript interfaces for frontend. Zero implicit any. | [schemas.py](file:///c:/Users/mohdu/OneDrive/Desktop/nyaysetu-ai/backend/app/models/schemas.py), [api.ts](file:///c:/Users/mohdu/OneDrive/Desktop/nyaysetu-ai/frontend/src/lib/api.ts) |
| **4. Security & Safety Guardrails** | Strict SlowAPI rate limiting (`60/hr` for chat/upload, `30/hr` for comparison). Magic-byte file validation preventing executable execution. Content sanitization (removes script/JS injection, no PII stored). Strict negative prompt constraints preventing definitive legal conclusions. | [main.py](file:///c:/Users/mohdu/OneDrive/Desktop/nyaysetu-ai/backend/app/main.py), [parser.py](file:///c:/Users/mohdu/OneDrive/Desktop/nyaysetu-ai/backend/app/services/parser.py), [llm.py](file:///c:/Users/mohdu/OneDrive/Desktop/nyaysetu-ai/backend/app/services/llm.py) |
| **5. Efficiency & Scalability** | Cosine similarity vector search over tokenized chunks (RAG) for instant Q&A. Async FastAPI endpoints with non-blocking I/O. In-memory session cache with TTL. Minimal bundle size (Vite tree-shaking). | [embeddings.py](file:///c:/Users/mohdu/OneDrive/Desktop/nyaysetu-ai/backend/app/services/embeddings.py), [session_store.py](file:///c:/Users/mohdu/OneDrive/Desktop/nyaysetu-ai/backend/app/services/session_store.py) |
| **6. Testing & Reliability** | **43 automated unit tests across frontend & backend**: 27 pytest tests covering document parsing, magic bytes, XSS sanitization, and clause detection; 16 Vitest tests covering upload, bilingual toggling, clause display, and speech controls. | [test_parser.py](file:///c:/Users/mohdu/OneDrive/Desktop/nyaysetu-ai/backend/app/tests/test_parser.py), [test_clause_detector.py](file:///c:/Users/mohdu/OneDrive/Desktop/nyaysetu-ai/backend/app/tests/test_clause_detector.py), [src/tests/](file:///c:/Users/mohdu/OneDrive/Desktop/nyaysetu-ai/frontend/src/tests/) |

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

### 4. Document Comparison Mode
- Compares two versions of a document side-by-side (e.g., old lease vs. renewal lease).
- Semantic diff identifies additions, deletions, and modifications.
- AI generates a summary indicating which version is more favorable to the tenant/employee.

### 5. "Prepare for a Lawyer" Brief Generator
- Converts complex contracts into a 1-page consultation brief.
- Generates categorized concerns, financial liabilities, and specific, targeted questions to ask an attorney.
- Instant PDF download formatted for easy reading by legal counsel in billable consultations.

---

## 🏛️ System Architecture

```mermaid
graph TB
    User["👤 Citizen / User (Desktop & Mobile)"]
    Mic["🎙️ Web Speech STT\n(Hindi / English Voice Input)"]
    Speaker["🔊 Web Speech TTS\n(Spoken Audio Output)"]
    
    subgraph Frontend ["Frontend (React 19 + Vite + TailwindCSS)"]
        UI["Accessible Responsive UI\n(WCAG AA Compliant)"]
        Toggle["Language Toggle\n(English ⇋ हिन्दी / Hinglish)"]
        Components["DocumentViewer • ClauseHighlighter\nChatPanel • ActionChecklist • LawyerBrief"]
    end
    
    subgraph Backend ["Backend API (FastAPI + SlowAPI)"]
        RateLimiter["SlowAPI Rate Limiter\n(60 req/hr IP protection)"]
        Parser["Document Parser\n(Magic Byte Validation + XSS Sanitizer)"]
        RAG["Vector Embeddings Engine\n(Chunking + Cosine Retrieval)"]
        Guardrails["Safety & Disclaimer Guardrails\n(Legal Verdict Stripper)"]
    end
    
    subgraph CloudAI ["AI & Storage Infrastructure"]
        Gemini["☁️ Google Gemini API\n(gemini-2.5-flash via google-genai)"]
        Supabase["☁️ Supabase\n(Auth & Document Vault - Optional)"]
    end

    User -->|"Voice In"| Mic --> UI
    UI -->|"Audio Out"| Speaker --> User
    User -->|"Interactions & Uploads"| UI
    UI --> Toggle
    UI --> Components
    Components -->|"REST API / JSON"| RateLimiter
    RateLimiter --> Parser
    Parser --> RAG
    RAG --> Gemini
    Gemini --> Guardrails
    Guardrails --> UI
    RateLimiter -.-> Supabase
```

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion | High performance, instant HMR, fluid micro-animations, accessible design. |
| **Backend** | Python 3.11+, FastAPI, Uvicorn | Async performance, auto-generated OpenAPI documentation, fast execution. |
| **LLM & AI** | Google GenAI SDK (`google-genai`), Gemini 2.5 Flash | Google Antigravity native integration, cost-efficient, low-latency reasoning. |
| **Voice / Speech** | Browser-native Web Speech API | Zero client bandwidth overhead, native Hindi & English acoustic models. |
| **Parsing & Magic** | PyMuPDF, python-docx, python-magic | Byte-level validation, multi-format parsing, security verification. |
| **Testing** | pytest, pytest-asyncio, Vitest, Testing Library | End-to-end regression prevention and component assertion. |
| **Rate Limiting** | SlowAPI | Protection against API exhaustion and denial-of-service attempts. |

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
git clone https://github.com/YOUR_USERNAME/nyaysetu-ai.git
cd nyaysetu-ai/backend

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
