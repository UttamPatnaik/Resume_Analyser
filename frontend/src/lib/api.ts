/**
 * API layer for the Resume Analyzer backend (FastAPI).
 * Contract preserved from the original frontend:
 *   POST {API_BASE}/api/analyze  multipart/form-data  field: resume_file
 */

export const API_BASE_URL: string =
  (import.meta.env['VITE_API_URL'] as string | undefined)?.replace(/\/$/, "") ||
  "https://resume-analyser-dbrh.onrender.com";

export const ANALYZE_ENDPOINT = `${API_BASE_URL}/api/analyze`;

export type SectionKey =
  | "content_quality"
  | "formatting_structure"
  | "keywords_skills"
  | "ats_compatibility";

export interface AnalysisSection {
  score: number;
  feedback: string;
}

export interface AnalysisResult {
  is_resume: boolean;
  overall_score: number;
  resume_level: string;
  sections: Partial<Record<SectionKey, AnalysisSection>>;
  major_issues: string[];
  missing_elements: string[];
  strengths: string[];
  improvement_suggestions: string[];
  ats_verdict: string;
  recruiter_verdict: string;
}

export class ApiError extends Error {
  status?: number | undefined;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function validateResumeFile(file: File): string | null {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Please upload a PDF file. Other formats aren't supported.";
  if (file.size === 0) return "That file appears to be empty. Choose a valid resume PDF.";
  if (file.size > MAX_FILE_BYTES)
    return "File is larger than 5 MB. Please compress it and try again.";
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function isAnalysisShape(data: unknown): data is AnalysisResult {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return typeof d['overall_score'] === "number" && typeof d['sections'] === "object";
}

/** Normalizes optional/missing array fields so the UI never crashes. */
function normalize(data: AnalysisResult): AnalysisResult {
  const arr = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : [];
  return {
    ...data,
    is_resume: data.is_resume !== false,
    resume_level: typeof data.resume_level === "string" ? data.resume_level : "",
    sections: (data.sections ?? {}) as AnalysisResult["sections"],
    major_issues: arr(data.major_issues),
    missing_elements: arr(data.missing_elements),
    strengths: arr(data.strengths),
    improvement_suggestions: arr(data.improvement_suggestions),
    ats_verdict: typeof data.ats_verdict === "string" ? data.ats_verdict : "",
    recruiter_verdict: typeof data.recruiter_verdict === "string" ? data.recruiter_verdict : "",
  };
}

/** Cold starts on free hosting can be slow — allow up to 3 minutes. */
const REQUEST_TIMEOUT_MS = 180_000;

export async function analyzeResume(
  file: File,
  signal?: AbortSignal,
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("resume_file", file);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true });

  let response: Response;
  try {
    response = await fetch(ANALYZE_ENDPOINT, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (controller.signal.aborted) {
      throw new ApiError(
        "The analysis took too long to respond. The server may be waking up — please try again.",
      );
    }
    throw new ApiError(
      "Couldn't reach the analysis service. Check your connection and try again.",
    );
  }
  clearTimeout(timeout);

  if (!response.ok) {
    let detail = "";
    try {
      const body = (await response.json()) as { detail?: unknown };
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(detail || friendlyStatusMessage(response.status), response.status);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiError("The server returned an unreadable response. Please try again.");
  }

  if (!isAnalysisShape(data)) {
    throw new ApiError("The analysis response was incomplete. Please try again.");
  }

  return normalize(data);
}

function friendlyStatusMessage(status: number): string {
  if (status === 400) return "That file couldn't be processed. Please upload a valid resume PDF.";
  if (status === 413) return "The file is too large for the server. Try a smaller PDF.";
  if (status === 429) return "Too many requests right now. Please wait a moment and retry.";
  if (status === 502 || status === 503 || status === 504)
    return "The analysis service is temporarily unavailable or waking up. Please try again in a minute.";
  if (status >= 500) return "The analysis service hit an unexpected error. Please try again.";
  return "The request failed. Please try again.";
}
