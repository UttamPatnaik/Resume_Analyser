import { Link } from "@tanstack/react-router";
import { FileSearch, Sparkles, MessagesSquare, ScanLine } from "lucide-react";

const navItems = [
  { label: "Resume Analysis", icon: ScanLine, active: true },
  { label: "Job Match", icon: FileSearch, active: false },
  { label: "Interview Prep", icon: MessagesSquare, active: false },
] as const;

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 rounded-md">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight">
              Resume Analyzer
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              AI resume evaluation
            </span>
          </span>
        </Link>

        <nav aria-label="Product sections">
          <ul className="flex items-center gap-1">
            {navItems.map(({ label, icon: Icon, active }) => (
              <li key={label}>
                {active ? (
                  <span
                    aria-current="page"
                    className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">{label}</span>
                  </span>
                ) : (
                  <span
                    title={`${label} — coming soon`}
                    className="flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground"
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="hidden md:inline">{label}</span>
                    <span className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide lg:inline">
                      Soon
                    </span>
                    <span className="sr-only">{label} coming soon</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
