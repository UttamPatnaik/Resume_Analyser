from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import io
import requests
import json
import os
import time # <--- ADD THIS
from dotenv import load_dotenv

# Load secret key
load_dotenv()
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

app = FastAPI()

# Enable CORS so your HTML frontend can communicate with this server
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # This is the magic line that fixes the block!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze_resume(resume_file: UploadFile = File(...)):
    if not NVIDIA_API_KEY:
        raise HTTPException(status_code=500, detail="Server configuration error: API key missing.")

    try:
        # 1. Read and Extract PDF
        content = await resume_file.read()
        text = ""
        
        if not resume_file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Currently, only PDF files are supported.")

        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"

        if len(text.strip()) == 0:
            raise HTTPException(status_code=400, detail="Could not extract any text from the PDF.")

        # --- ADD THESE 3 LINES ---
        print("\n=== EXTRACTED RESUME TEXT ===")
        print(text[:500]) # Prints the first 500 characters
        print("=============================\n")

        # 2. Call NVIDIA API
        invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {NVIDIA_API_KEY}",
            "Accept": "application/json"
        }
        
        # Generate a unique timestamp string
        request_id = str(time.time())
        
        prompt = f"""
        [Request ID: {request_id}] 
        You are an advanced ATS (Applicant Tracking System) and senior technical recruiter with expertise in evaluating resumes for software engineering, data science, and IT roles.

        Your task is to critically analyze the provided resume text exactly like a real ATS + recruiter screening process.

        IMPORTANT RULES:
        - Be highly strict and realistic in scoring.
        - Do NOT inflate scores.
        - Most average student resumes should score between 45-70.
        - Only highly optimized resumes with measurable impact, strong projects, proper keywords, and excellent structure should exceed 80.
        - Penalize vague claims, weak project descriptions, poor formatting, lack of metrics, missing keywords, grammatical issues, keyword stuffing, and generic summaries.
        - Evaluate both ATS compatibility and recruiter appeal.
        - Consider the resume from the perspective of:
          1. ATS parsing systems
          2. Technical recruiters
          3. Hiring managers

        SCORING CRITERIA:
        1. Content Quality (0-100)
        2. Formatting & Structure (0-100)
        3. Keywords & Skills Match (0-100)
        4. ATS Compatibility (0-100)

        FINAL SCORE CALCULATION:
        Use weighted scoring: Content (40%), Formatting (20%), Keywords (20%), ATS (20%).

        RETURN RULES:
        - Return ONLY valid JSON.
        - Do NOT include markdown.
        - Do NOT include explanations outside JSON.
        - Scores must be integers.
        - Feedback must be highly specific and evidence-based.

        JSON FORMAT:
        {{
          "overall_score": 0,
          "resume_level": "Poor | Average | Good | Strong | Excellent",
          "sections": {{
            "content_quality": {{"score": 0, "feedback": ""}},
            "formatting_structure": {{"score": 0, "feedback": ""}},
            "keywords_skills": {{"score": 0, "feedback": ""}},
            "ats_compatibility": {{"score": 0, "feedback": ""}}
          }},
          "major_issues": [""],
          "missing_elements": [""],
          "strengths": [""],
          "improvement_suggestions": [""],
          "ats_verdict": "",
          "recruiter_verdict": ""
        }}

        Resume Text:
        {text}
        """

        payload = {
            "model": "meta/llama-3.1-8b-instruct",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 1024,
            "temperature": 0.5,
            "stream": False
        }

        # Timeout set to 60 seconds
        response = requests.post(invoke_url, headers=headers, json=payload, timeout=60)
        
        if response.status_code == 200:
            ai_response_text = response.json()['choices'][0]['message']['content']
            
            # Safely strip out any conversational markdown the AI adds
            clean_json_string = ai_response_text.strip()
            if "```json" in clean_json_string:
                clean_json_string = clean_json_string.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_json_string:
                clean_json_string = clean_json_string.split("```")[1].split("```")[0].strip()
                
            return json.loads(clean_json_string)
        else:
            # This will force the backend to show us NVIDIA's exact error message!
            error_msg = f"NVIDIA Error {response.status_code}: {response.text}"
            print(error_msg) 
            raise HTTPException(status_code=500, detail=error_msg)
            
    # This is the line that was missing!
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))