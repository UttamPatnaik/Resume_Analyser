import { RotateCcw, AlertTriangle, ListChecks, Sparkles, Lightbulb, Bot, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreBar, ScoreRing } from "@/components/score-visuals";
import { InsightList } from "@/components/insight-list";
import type { AnalysisResult, SectionKey } from "@/lib/api";

const SECTION_LABELS: Record<SectionKey, string> = {
  content_quality: "Content Quality",
  formatting_structure: "Formatting & Structure",
  keywords_skills: "Keywords & Skills",
  ats_compatibility: "ATS Compatibility",
};

const SECTION_ORDER: SectionKey[] = [
  "content_quality",
  "formatting_structure",
  "keywords_skills",
  "ats_compatibility",
];

function VerdictCard({
  title,
  body,
  icon: Icon,
}: {
  title: string;
  body: string;
  icon: typeof Bot;
}) {
  if (!body) return null;
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h3 className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 truncate">{title}</span>
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-foreground/90">{body}</p>
    </section>
  );
}

export function ResultsDashboard({
  result,
  fileName,
  onReset,
}: {
  result: AnalysisResult;
  fileName: string;
  onReset: () => void;
}) {
  const sections = SECTION_ORDER.filter((key) => result.sections?.[key]);
  const hasInsights =
    result.major_issues.length ||
    result.missing_elements.length ||
    result.strengths.length ||
    result.improvement_suggestions.length;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-8">
        <div className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
          <div className="flex justify-center sm:justify-start">
            <ScoreRing score={result.overall_score} label={result.resume_level} />
          </div>
          <div className="min-w-0 space-y-4">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Resume Analysis
              </h2>
              <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{fileName}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium tabular-nums">
                {Math.round(result.overall_score)} / 100
              </span>
              {result.resume_level && (
                <span className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground">
                  {result.resume_level}
                </span>
              )}
            </div>
            {!result.is_resume && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-foreground"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                <span>
                  This document may not be a resume. The analysis below may be less reliable.
                </span>
              </p>
            )}
            <Button variant="outline" onClick={onReset} className="w-full sm:w-auto">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Analyze Another Resume
            </Button>
          </div>
        </div>
      </section>

      {sections.length > 0 && (
        <section aria-label="Category scores" className="grid gap-4 sm:grid-cols-2">
          {sections.map((key) => {
            const section = result.sections[key]!;
            return (
              <article
                key={key}
                className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="min-w-0 truncate text-sm font-semibold tracking-tight">
                    {SECTION_LABELS[key]}
                  </h3>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {Math.round(section.score)}
                    <span className="text-muted-foreground">/100</span>
                  </span>
                </div>
                <div className="mt-3">
                  <ScoreBar score={section.score} />
                </div>
                {section.feedback && (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {section.feedback}
                  </p>
                )}
              </article>
            );
          })}
        </section>
      )}

      {hasInsights ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <InsightList
            title="Major Issues"
            items={result.major_issues}
            icon={AlertTriangle}
            tone="destructive"
          />
          <InsightList
            title="Missing Elements"
            items={result.missing_elements}
            icon={ListChecks}
            tone="warning"
          />
          <InsightList
            title="Strengths"
            items={result.strengths}
            icon={Sparkles}
            tone="success"
          />
          <InsightList
            title="Improvement Suggestions"
            items={result.improvement_suggestions}
            icon={Lightbulb}
            tone="primary"
          />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <VerdictCard title="ATS Verdict" body={result.ats_verdict} icon={Bot} />
        <VerdictCard title="Recruiter Verdict" body={result.recruiter_verdict} icon={UserCheck} />
      </div>
    </div>
  );
}
