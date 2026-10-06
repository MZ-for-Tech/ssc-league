import type { ReactNode, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type SelectDropdownProps = SelectHTMLAttributes<HTMLSelectElement> & {
  leadingIcon?: ReactNode;
};

const defaultClassName = "w-full rounded-xl border border-border bg-surface px-3 py-2.5  font-semibold text-foreground outline-none transition focus:border-primary/60 disabled:cursor-not-allowed disabled:opacity-60";

export default function SelectDropdown({
  children,
  className = defaultClassName,
  leadingIcon,
  ...selectProps
}: SelectDropdownProps) {
  return (
    <div className="relative min-w-0">
      {leadingIcon && (
        <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted">
          {leadingIcon}
        </span>
      )}
      <select
        {...selectProps}
        className={twMerge(
          defaultClassName,
          className,
          clsx("w-full appearance-none pr-9", leadingIcon ? "pl-9" : "pl-3"),
        )}
      >
        {children}
      </select>
      <ChevronDown aria-hidden="true" size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
    </div>
  );
}
