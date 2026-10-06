import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export default function PageHeader({ title, icon, actions }: PageHeaderProps) {
  return (
    <header className="instrument-panel relative isolate overflow-hidden rounded-2xl border border-border bg-[linear-gradient(115deg,rgb(var(--surface-hero)),rgb(var(--surface))_58%,rgb(var(--surface-node)))] p-5 shadow-xl shadow-black/20 sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_82%_0%,rgb(var(--primary)/0.14),transparent_45%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-1/3 bg-dot-grid opacity-[0.08]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {icon && <span className="shrink-0 text-primary">{icon}</span>}
            {title}
          </h1>
        </div>
        {actions && <div className="flex w-full flex-wrap items-center gap-3 xl:w-auto xl:justify-end">{actions}</div>}
      </div>
    </header>
  );
}
