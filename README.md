# 📄 Resume Analyzer (Full-Stack AI Application)

A modern, production-ready web application that provides instant, AI-powered feedback on resumes. Originally designed as a frontend UI, this project has been upgraded into a complete full-stack application utilizing a decoupled architecture, Python API backend, and NVIDIA's Llama 3.1 AI model to simulate a strict, real-world Applicant Tracking System (ATS).

---

## 🚀 Overview

**Resume Analyzer** lets users upload their resumes and receive a highly specific, mathematically scored assessment covering content quality, formatting, keyword optimization, and ATS compatibility. By utilizing advanced prompt engineering, the AI acts as a ruthless technical recruiter, ensuring users get realistic feedback rather than inflated scores.

---

## 🔗 Live Demo

👉 [Click here to try Resume Analyzer](https://resume-analyser-black.vercel.app/)

---

## ✨ Key Features & Engineering Highlights

* ⚡ **Full-Stack AI Integration:** Connects a vanilla JavaScript frontend to a Python/FastAPI backend API.
* 🧠 **Advanced Prompt Engineering:** Utilizes Llama 3.1 to enforce a strict JSON output schema, preventing AI hallucinations and ensuring consistent scoring structures.
* 🔄 **Cache-Busting Logic:** Implements unique timestamp injection in the AI prompt payload to bypass server-side caching and guarantee fresh analysis for every upload.
* 🛡️ **Cross-Origin Security:** Configured CORS middleware to securely allow communications between the deployed frontend and cloud backend.
* 📂 **Smart File Parsing:** Extracts raw text from complex PDF documents using the `pdfplumber` library before sending it to the AI.
* 📱 **Mobile & Accessibility Optimized:** Clean, responsive UI with semantic HTML and accessibility-focused design.

---

## 💻 Tech Stack

**Frontend:** HTML5, CSS3, Vanilla JavaScript
**Backend:** Python 3, FastAPI, Uvicorn, `pdfplumber`
**AI & Inference:** Llama 3.1 8B Instruct (via NVIDIA API)
**Deployment:** Vercel (Frontend), Render (Backend API)

---

## 📁 Folder Structure

```text
Resume-Analyzer/
│
├── frontend/             # Deployed on Vercel
│   ├── index.html        # Semantic HTML UI structure
│   ├── style.css         # Clean, responsive, minimal styling
│   └── script.js         # Handles file uploads, API fetches, and UI population
│
└── backend/              # Deployed on Render
    ├── app.py            # FastAPI server, CORS middleware, and AI routing
    ├── requirements.txt  # Python dependencies for cloud deployment
    └── .gitignore        # Prevents pycache and env files from uploading

```

---

## 🛠️ Getting Started (Local Development)

### Prerequisites

* Python 3.8+
* An API Key from NVIDIA API / NIM

### 1. Backend Setup

1. Clone the repository and navigate to the backend folder:
```bash
git clone https://github.com/YourUsername/Resume-Analyzer.git
cd Resume-Analyzer/backend

```


2. Install the required Python dependencies:
```bash
pip install -r requirements.txt

```


3. Create a `.env` file in the `backend` folder and add your API key:
```env
NVIDIA_API_KEY=your_secret_api_key_here

```


4. Start the local server:
```bash
uvicorn app:app --reload

```



### 2. Frontend Setup

1. Open `frontend/script.js` and ensure the `fetch` URL points to your local backend (e.g., `http://localhost:8000/api/analyze`) for local testing.
2. Open `frontend/index.html` in your web browser (or use VS Code Live Server).

---

## 🔮 Future Enhancements

* Database integration (PostgreSQL) for user authentication and tracking resume score history.
* NLP pre-processing (spaCy) to extract specific entities like GitHub links and phone numbers.
* Automated LaTeX export to generate an ATS-optimized PDF directly from the AI's suggestions.

---

## 📜 License

This project is licensed under the **MIT License**.
