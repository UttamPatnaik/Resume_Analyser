# 📄 Resume Analyzer (Full-Stack AI Application)

A modern, full-stack AI-powered resume analysis application that evaluates resumes using deterministic document analysis and NVIDIA-hosted LLM inference. The system combines PDF extraction, document validation, resume structure analysis, and AI-based evaluation to provide realistic ATS-style feedback.

---

## 🚀 Overview

**Resume Analyzer** allows users to upload a resume and receive a structured analysis covering:

- Resume validity
- Content quality
- Formatting and structure
- Technical skills and keywords
- ATS compatibility
- Major issues
- Missing elements
- Strengths
- Improvement suggestions
- Recruiter-oriented feedback

The application has evolved from a simple AI-powered analyzer into a more structured backend architecture where deterministic checks are performed before the resume is sent to the LLM.

The goal is to reduce AI hallucinations and make the analysis more evidence-based.

---

## 🔗 Live Demo

👉 https://resume-analyser-black.vercel.app/

> The frontend is deployed on Vercel. The backend API is deployed separately and communicates with the NVIDIA API for AI analysis.

---

# ✨ Current Features

## 📄 Resume Upload

Users can upload a resume PDF through the web interface.

The backend:

1. Receives the uploaded PDF.
2. Extracts its text.
3. Evaluates extraction quality.
4. Determines whether the document appears to be a resume.
5. Performs deterministic resume structure analysis.
6. Sends the extracted resume and structural facts to the AI model.
7. Validates the AI response.
8. Calculates the final weighted score.
9. Returns structured JSON to the frontend.

---

## 🔍 Smart PDF Text Extraction

The backend uses a two-stage extraction strategy.

```text
                Resume PDF
                    │
                    ▼
               PyMuPDF
                    │
                    ▼
           Extraction Quality
                    │
             ┌──────┴──────┐
             │             │
           Good          Poor
             │             │
             ▼             ▼
           Return      pdfplumber
                         │
                         ▼
                    Return Result
```

**Primary Parser**: PyMuPDF  
**Fallback Parser**: pdfplumber  

The system records:
- Parser used
- Number of pages
- Character count
- Word count
- Extraction quality
- Whether text was detected
- Whether the PDF appears to be scanned

---

## 🧪 Deterministic Resume Analysis

Before sending the resume to the LLM, the backend performs deterministic analysis. This is important because the LLM should not be responsible for detecting facts that can be reliably determined using code.

The structure analyzer detects:
- Resume sections
- Project count
- Education entries
- Dates
- URLs
- Email
- Phone number
- LinkedIn
- GitHub
- Portfolio
- Structural issues

**Example:**
```text
====== RESUME STRUCTURE ======

Sections   : career_summary, education, technical_skills,
             experience, projects, certifications, activities

Projects   : 2
Education  : 3
Dates      : True
URLs       : True

Contact:
 - Email    : True
 - Phone    : True
 - LinkedIn : True
 - GitHub   : True
 - Portfolio: False
```

These deterministic facts are passed to the AI as additional context.

---

## 🧠 AI Resume Analysis

The application uses an NVIDIA-hosted Llama model for qualitative resume evaluation.
The AI evaluates four major categories:

| Category | Weight |
| --- | --- |
| Content Quality | 40% |
| Formatting & Structure | 20% |
| Keywords & Skills | 20% |
| ATS Compatibility | 20% |

The final score is calculated by the backend rather than trusting the LLM's calculated score.

> **Overall Score** = (Content Quality × 0.40) + (Formatting & Structure × 0.20) + (Keywords & Skills × 0.20) + (ATS Compatibility × 0.20)

This prevents the model from returning an inconsistent overall score.

---

## 🛡️ AI Output Validation

The backend expects the model to return structured JSON. The response is then parsed and validated before being returned to the frontend.

The expected structure includes:

```json
{
  "is_resume": true,
  "overall_score": 83,
  "resume_level": "Strong",
  "sections": {
    "content_quality": {
      "score": 82,
      "feedback": "..."
    },
    "formatting_structure": {
      "score": 75,
      "feedback": "..."
    },
    "keywords_skills": {
      "score": 90,
      "feedback": "..."
    },
    "ats_compatibility": {
      "score": 85,
      "feedback": "..."
    }
  },
  "major_issues": [],
  "missing_elements": [],
  "strengths": [],
  "improvement_suggestions": [],
  "ats_verdict": "...",
  "recruiter_verdict": "..."
}
```

The backend also handles:
- AI connection failures
- Unexpected API responses
- Invalid JSON responses
- Invalid structured output

---

## 👁️ Image & Scanned Resume Considerations

The analyzer is designed to handle resumes that may contain images, icons, logos, or other visual elements without allowing the LLM to incorrectly assume that those elements are present.

The system distinguishes between:
- Extracted text
- Deterministic document information
- AI-based interpretation

The LLM is explicitly instructed not to claim visual characteristics that cannot be observed from extracted text. For example, the AI should not claim: *"The resume uses blue fonts."* unless visual analysis is actually available. 

Similarly, an image-containing resume should not automatically be considered ATS-incompatible. Future versions can introduce dedicated PDF layout/image analysis if required.

---

## 🏗️ Architecture

The current architecture separates document processing, deterministic analysis, AI communication, and API routing.

```text
                         User
                           │
                           ▼
                    Frontend Application
                           │
                           │ PDF Upload
                           ▼
                     FastAPI Backend
                           │
                           ▼
                  Resume Analysis Service
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   PDF Extraction    Quality Analysis   Document
          │                            Classification
          │
          ▼
   Resume Structure Analyzer
          │
          │ Deterministic Facts
          ▼
      Prompt Builder
          │
          ▼
     NVIDIA LLM API
          │
          ▼
      JSON Parser
          │
          ▼
   Pydantic Validation
          │
          ▼
     Final Analysis
          │
          ▼
       Frontend
```

---

## 💻 Tech Stack

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Python
- FastAPI
- Uvicorn
- Pydantic

**Document Processing**
- PyMuPDF
- pdfplumber

**AI**
- NVIDIA API
- Llama 3.1
- Prompt Engineering
- Structured JSON Output

**Deployment**
- Vercel (Frontend)
- Render (Backend)

---

## 📁 Current Project Structure

```text
Resume_Analyser/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── backend/
    │
    ├── .env
    ├── .gitignore
    ├── requirements.txt
    │
    ├── app/
    │   ├── __init__.py
    │   ├── main.py
    │   │
    │   ├── api/
    │   │   ├── auth.py
    │   │   ├── chat.py
    │   │   ├── job.py
    │   │   └── resume.py
    │   │
    │   ├── core/
    │   │   ├── config.py
    │   │   ├── exception_handlers.py
    │   │   ├── exceptions.py
    │   │   └── logger.py
    │   │
    │   ├── models/
    │   │   ├── analysis.py
    │   │   └── user.py
    │   │
    │   ├── prompts/
    │   │   └── resume_prompt.txt
    │   │
    │   ├── schemas/
    │   │   ├── common.py
    │   │   ├── error.py
    │   │   └── resume.py
    │   │
    │   ├── services/
    │   │   ├── structure_analyzer.py
    │   │   │
    │   │   ├── ai/
    │   │   │   ├── base_client.py
    │   │   │   ├── json_parser.py
    │   │   │   ├── nvidia_client.py
    │   │   │   └── prompt_builder.py
    │   │   │
    │   │   ├── document/
    │   │   │   ├── classifier_service.py
    │   │   │   ├── parser_service.py
    │   │   │   └── quality_service.py
    │   │   │
    │   │   └── resume/
    │   │       ├── analysis_service.py
    │   │       ├── ats_service.py
    │   │       └── scoring_service.py
    │   │
    │   └── utils/
    │       └── helpers.py
    │
    └── tests/
```

---

## 🔄 Resume Analysis Workflow

The current analysis pipeline is:

```text
1. Upload Resume
        │
        ▼
2. Read PDF Bytes
        │
        ▼
3. Extract Text
        │
        ├── PyMuPDF
        │
        └── pdfplumber fallback
        │
        ▼
4. Evaluate Extraction Quality
        │
        ▼
5. Classify Document
        │
        ├── Resume
        │
        └── Reject
        │
        ▼
6. Deterministic Resume Structure Analysis
        │
        ▼
7. Build AI Prompt
        │
        ├── Resume Text
        │
        └── Deterministic Facts
        │
        ▼
8. NVIDIA LLM
        │
        ▼
9. Parse JSON
        │
        ▼
10. Validate Response
        │
        ▼
11. Calculate Final Score
        │
        ▼
12. Return JSON
        │
        ▼
13. Frontend Displays Results
```

---

## 📊 Example Analysis

A typical response may look like:

**Overall Score:** 83  
**Resume Level:** Strong  

- **Content Quality:** 82  
- **Formatting & Structure:** 75  
- **Keywords & Skills:** 90  
- **ATS Compatibility:** 85  

The system also provides qualitative feedback rather than returning only a numerical score.

---

## 🛠️ Local Development

**Prerequisites:**
- Python 3.10+
- Git
- NVIDIA API key
- Modern web browser

**1. Clone the Repository**
```bash
git clone [https://github.com/UttamPatnaik/Resume_Analyser.git](https://github.com/UttamPatnaik/Resume_Analyser.git)
cd Resume_Analyser
```

**2. Backend Setup**
Navigate to the backend:
```bash
cd backend
```
Create a virtual environment:
```bash
python -m venv .venv
```
Activate it on Windows:
```bash
.venv\Scripts\activate
```
Install dependencies:
```bash
pip install -r requirements.txt
```

**3. Environment Variables**
Create `backend/.env` and add:
```env
NVIDIA_API_KEY=your_nvidia_api_key
NVIDIA_API_URL=your_nvidia_api_endpoint
MODEL_NAME=your_model_name
REQUEST_TIMEOUT=60
```
*Never commit `.env` to GitHub.*

**4. Run the Backend**
From the backend directory:
```bash
python -m uvicorn app.main:app --reload
```
- The API will be available at: `http://some-ip-addr:port_no`
- Swagger documentation: `http://some-ip-addr:port_no/docs`

**5. Run the Frontend**
The frontend is a static application. Open `frontend/index.html` using a local development server such as VS Code Live Server.

Make sure the frontend API URL points to the local backend during development. Example:
```javascript
const API_URL = "[http://some-ip-addr:port_no](http://some-ip-addr:port_no)";
```

---

## ☁️ Deployment

The application uses a decoupled deployment architecture.

```text
Frontend
   │
   ▼
Vercel
   │
   │ HTTPS API Request
   ▼
Render
   │
   ▼
FastAPI
   │
   ▼
NVIDIA API
```

- **Frontend:** Deployed using Vercel
- **Backend:** Deployed using Render

*The backend requires the appropriate environment variables to be configured in the Render dashboard.*

---

## 🧪 Testing

The backend can be tested using Swagger (`/api/docs`) or directly through the API.

**Example:**
```bash
curl -X POST "[http://some-ip-addr:port_no/api/analyze](http://some-ip-addr:port_no/api/analyze)" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "resume_file=@RESUME.pdf;type=application/pdf"
```

---

## 📌 Version History

The project is being developed incrementally rather than making all planned features part of a single release.

### v1.0 — Initial Resume Analyzer
The original version focused primarily on:
- Resume PDF upload
- PDF text extraction
- AI-based resume analysis
- ATS-style scoring
- Basic frontend presentation
- NVIDIA Llama integration

### v1.1 — Structured Backend & Deterministic Analysis
Current development version.

**Added:**
- Modular FastAPI backend architecture
- PyMuPDF extraction
- pdfplumber fallback extraction
- Extraction quality evaluation
- Resume/document classification
- Deterministic resume structure analysis
- Contact information detection
- Section detection
- Project counting
- Education detection
- Date detection
- URL detection
- Structured AI prompt generation
- JSON response parsing
- Pydantic response validation
- Backend-side weighted score calculation
- Improved error handling
- Separation between deterministic analysis and LLM analysis
- Improved handling of image/scanned-document considerations

**Current Architecture:**
```text
PDF
 │
 ├── Extraction
 │
 ├── Quality Analysis
 │
 ├── Document Classification
 │
 ├── Deterministic Structure Analysis
 │
 └── LLM Analysis
          │
          ▼
      Final Result
```

### 🔮 v1.2 — Planned Resume Intelligence Upgrade
The next version will extend the analyzer without introducing the major architectural changes planned for v2.

**Planned features:**
- Job description upload/input
- Resume-to-job-description matching
- Skill matching
- Missing keyword detection
- Match percentage
- Job-specific recommendations
- Better deterministic ATS checks
- Improved frontend result visualization
- Deployment of the updated frontend and backend

*The primary goal of v1.2 is to make the analyzer more useful for actual job applications.*

### 🤖 v2.0 — AI Career Assistant
The major next-generation version will introduce conversational capabilities.

**Planned features may include:**
- Resume analysis chatbot
- RAG over the user's resume
- Interactive resume questions
- Job-specific interview preparation
- Resume improvement conversations
- Context-aware recommendations
- Conversation history
- Potential job-description-aware conversations

*This will represent a significant architectural expansion and therefore will be treated as v2.0 rather than another minor release.*

### 🧠 Future Multi-Agent Architecture
A future version may evolve the system toward a multi-agent resume screening and interview preparation platform.

**Potential architecture:**
```text
                         Resume + Job Description
                                  │
                                  ▼
                           Orchestrator
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
       Parser Agent         Scoring Agent       Ranking Agent
             │                    │                    │
             └────────────────────┼────────────────────┘
                                  │
                                  ▼
                       Interview Question Agent
                                  │
                                  ▼
                         Final Candidate Report
```

**Potential future capabilities:**
- Parser Agent
- Scoring Agent
- Ranking Agent
- Interview Question Agent
- LangGraph/CrewAI orchestration
- Explicit agent state management
- Langfuse observability
- Human-vs-AI evaluation
- Resume ranking
- Skill mismatch detection
- Date-gap detection
- Role-specific interview questions

*These capabilities are intentionally not part of the current release.*

---

## ⚠️ Responsible Use

Resume scoring should be treated as decision-support rather than an automated hiring decision. The system should not be used as the sole basis for:
- Hiring decisions
- Candidate rejection
- Candidate ranking
- Employment eligibility

*AI-generated recommendations may contain errors and should be reviewed by a human.*

---

## 📜 License

This project is licensed under the MIT License.
