import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { AlertCircle, ShieldCheck, Gauge, FileSearch } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { UploadPanel } from "@/components/upload-panel";
import { AnalysisProgress } from "@/components/analysis-progress";
import { ResultsDashboard } from "@/components/results-dashboard";
import { Button } from "@/components/ui/button";
import { analyzeResume, type AnalysisResult } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resume Analyzer — AI Resume Score, ATS Check & Feedback" },
      {
        name: "description",
        content:
          "Upload your resume PDF and get an AI-powered score, ATS compatibility check, recruiter verdict and specific improvement suggestions.",
      },
      { property: "og:title", content: "Resume Analyzer — AI Resume Score, ATS Check & Feedback" },
      {
        property: "og:description",
        content:
          "Upload your resume PDF and get an AI-powered score, ATS compatibility check, recruiter verdict and specific improvement suggestions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Status = "idle" | "loading" | "done" | "error";

const HIGHLIGHTS = [
  { icon: Gauge, title: "Scored breakdown", body: "Content, formatting, keywords and ATS, each scored with written feedback." },
  { icon: ShieldCheck, title: "ATS compatibility", body: "See how parsing systems are likely to read your document." },
  { icon: FileSearch, title: "Recruiter view", body: "A plain-language verdict on how a recruiter would skim your resume." },
] as const;

function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzedName, setAnalyzedName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const handleAnalyze = useCallback(async () => {
    if (!file || inFlight.current) return;
    inFlight.current = true;
    setStatus("loading");
    setError(null);
    setResult(null);
    try {
      const data = await analyzeResume(file);
      setResult(data);
      setAnalyzedName(file.name);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    } finally {
      inFlight.current = false;
    }
  }, [file]);

  const reset = useCallback(() => {
    setFile(null);
    setResult(null);
    setAnalyzedName("");
    setError(null);
    setStatus("idle");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const showUpload = status === "idle" || status === "error";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {showUpload && (
          <section className="mb-8 max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
              Get an honest read on your resume
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Upload a PDF and receive a scored analysis across content, formatting, keywords and
              ATS compatibility — plus concrete suggestions you can act on.
            </p>
          </section>
        )}

        {status === "loading" && <AnalysisProgress fileName={file?.name ?? "resume.pdf"} />}

        {showUpload && (
          <>
            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-destructive">Analysis failed</p>
                  <p className="mt-1 text-sm text-foreground/80">{error}</p>
                </div>
                {file && (
                  <Button variant="outline" size="sm" onClick={handleAnalyze} className="shrink-0">
                    Retry
                  </Button>
                )}
              </div>
            )}

            <UploadPanel
              file={file}
              onFileChange={setFile}
              onAnalyze={handleAnalyze}
              isSubmitting={false}
            />

            <section aria-label="What you get" className="mt-8 grid gap-4 sm:grid-cols-3">
              {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
                <article key={title} className="rounded-2xl border border-border bg-card p-5">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h2 className="mt-3 text-sm font-semibold tracking-tight">{title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </article>
              ))}
            </section>
          </>
        )}

        {status === "done" && result && (
          <ResultsDashboard result={result} fileName={analyzedName} onReset={reset} />
        )}
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-sm text-muted-foreground sm:px-6">
          Resume Analyzer — Job Match and Interview Prep coming soon.
        </div>
      </footer>
    </div>
  );
}
