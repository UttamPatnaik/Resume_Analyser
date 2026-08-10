import type { LucideIcon } from "lucide-react";

export function InsightList({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: LucideIcon;
  tone: "destructive" | "warning" | "success" | "primary";
}) {
  if (items.length === 0) return null;

  const toneClasses: Record<typeof tone, string> = {
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/15 text-success",
    primary: "bg-accent text-accent-foreground",
  };

  const markerClasses: Record<typeof tone, string> = {
    destructive: "bg-destructive",
    warning: "bg-warning",
    success: "bg-success",
    primary: "bg-primary",
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h3 className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${toneClasses[tone]}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 truncate">{title}</span>
        <span className="ml-auto shrink-0 rounded-md border border-border px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
          {items.length}
        </span>
      </h3>
      <ul className="mt-4 space-y-3">
        {items.map((item, i) => (
          <li key={`${i}-${item.slice(0, 24)}`} className="flex gap-3 text-sm leading-relaxed">
            <span
              className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${markerClasses[tone]}`}
              aria-hidden="true"
            />
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
