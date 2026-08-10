import { useCallback, useId, useRef, useState } from "react";
import { FileText, UploadCloud, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize, validateResumeFile } from "@/lib/api";
import { cn } from "@/lib/utils";

interface UploadPanelProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onAnalyze: () => void;
  isSubmitting: boolean;
}

export function UploadPanel({
  file,
  onFileChange,
  onAnalyze,
  isSubmitting,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const accept = useCallback(
    (candidate: File | undefined) => {
      if (!candidate) return;
      const problem = validateResumeFile(candidate);
      if (problem) {
        setError(problem);
        onFileChange(null);
        return;
      }
      setError(null);
      onFileChange(candidate);
    },
    [onFileChange],
  );

  const clear = () => {
    onFileChange(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section
      aria-labelledby="upload-heading"
      className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-8"
    >
      <div className="mb-5 space-y-1.5">
        <h2 id="upload-heading" className="text-lg font-semibold tracking-tight">
          Upload your resume
        </h2>
        <p className="text-sm text-muted-foreground">
          PDF only, up to 5&nbsp;MB. Your file is sent to the analysis service and is not stored
          in the browser.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "rounded-xl border-2 border-dashed p-6 text-center transition-colors sm:p-10",
          dragging ? "border-primary bg-accent/60" : "border-border bg-surface",
        )}
      >
        <UploadCloud
          className={cn(
            "mx-auto h-9 w-9 transition-colors",
            dragging ? "text-primary" : "text-muted-foreground",
          )}
          aria-hidden="true"
        />
        <p className="mt-3 text-sm font-medium">Drag and drop your resume PDF here</p>
        <p className="mt-1 text-sm text-muted-foreground">or</p>
        <div className="mt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={isSubmitting}
          >
            Browse files
          </Button>
        </div>
        <label htmlFor={inputId} className="sr-only">
          Choose a resume PDF to analyze
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          disabled={isSubmitting}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          onChange={(e) => accept(e.target.files?.[0])}
        />
      </div>

      {file && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">PDF • {formatFileSize(file.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clear}
            disabled={isSubmitting}
            aria-label={`Remove ${file.name}`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          First analysis can take up to 90 seconds while the server wakes up.
        </p>
        <Button
          type="button"
          size="lg"
          className="w-full sm:w-auto"
          disabled={!file || isSubmitting}
          onClick={onAnalyze}
        >
          {isSubmitting ? "Analyzing…" : "Analyze Resume"}
        </Button>
      </div>
    </section>
  );
}
