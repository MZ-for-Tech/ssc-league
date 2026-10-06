import type { ReactNode } from "react";

export default function OperationsCardHeader({
  id,
  title,
  icon,
  actions,
  headingLevel = "h2",
}: {
  id: string;
  title: string;
  icon: ReactNode;
  actions?: ReactNode;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;

  return (
    <header className="mb-4 flex min-h-11 flex-wrap items-start justify-between gap-3">
      <Heading id={id} className="flex items-center gap-2 text-base font-semibold leading-6 text-foreground">
        <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">{icon}</span>
        {title}
      </Heading>
      {actions && <div className="flex shrink-0 items-start gap-2">{actions}</div>}
    </header>
  );
}
