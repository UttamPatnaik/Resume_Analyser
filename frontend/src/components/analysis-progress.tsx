import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  "Reading resume",
  "Checking document structure",
  "Evaluating resume",
  "Generating recruiter insights",
] as const;

const STAGE_INTERVAL_MS = 6000;

/** Purely a UI progression — the backend does not stream real progress. */
export function AnalysisProgress({ fileName }: { fileName: string }) {
  const [active, setActive] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const stageTimer = setInterval(() => {
      setActive((s) => Math.min(s + 1, STAGES.length - 1));
    }, STAGE_INTERVAL_MS);
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      clearInterval(stageTimer);
      clearInterval(tick);
    };
  }, []);

  return (
    <section
      aria-live="polite"
      aria-busy="true"
      className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-8"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight">Analyzing resume</h2>
          <p className="truncate text-sm text-muted-foreground">{fileName}</p>
        </div>
      </div>

      <ol className="mt-6 space-y-3">
        {STAGES.map((stage, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li key={stage} className="flex items-center gap-3">
              <span
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs",
                  done && "border-success bg-success text-success-foreground",
                  current && "border-primary text-primary",
                  !done && !current && "border-border text-muted-foreground",
                )}
                aria-hidden="true"
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" />
                ) : current ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={cn(
                  "text-sm",
                  done || current ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {stage}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="mt-6 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        Elapsed {elapsed}s. The service may be starting from cold — this can take up to 90
        seconds on the first request.
      </p>
    </section>
  );
}
