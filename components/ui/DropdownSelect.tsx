"use client";

import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import Dropdown from "@/components/ui/Dropdown";

export interface DropdownSelectOption {
  value: string;
  label: string;
}

interface DropdownSelectProps {
  value: string;
  options: DropdownSelectOption[];
  onChange: (value: string) => void;
  leadingIcon?: ReactNode;
  ariaLabel: string;
  disabled?: boolean;
}

export default function DropdownSelect({ value, options, onChange, leadingIcon, ariaLabel, disabled = false }: DropdownSelectProps) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Dropdown
      portal
      panelRole="menu"
      panelClassName="instrument-panel min-w-56 max-w-[calc(100vw-1rem)] border-primary/25 bg-slate-950/95 p-1 text-sm"
      trigger={({ open, toggle, panelId }) => (
        <button
          type="button"
          disabled={disabled}
          onClick={toggle}
          aria-label={ariaLabel}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={panelId}
          className="console-control flex min-h-11 w-full items-center gap-2 border border-border bg-background/75 px-3 py-2.5 text-left text-sm font-semibold text-foreground outline-none transition hover:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {leadingIcon && <span aria-hidden="true" className="shrink-0 text-muted">{leadingIcon}</span>}
          <span className="min-w-0 flex-1 truncate">{selectedOption?.label || "Select an option"}</span>
          <ChevronDown size={15} className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      )}
    >
      {({ close }) => options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="menuitemradio"
          aria-checked={value === option.value}
          onClick={() => { onChange(option.value); close(); }}
          className="console-control flex min-h-10 w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm font-semibold text-muted transition hover:bg-primary/10 hover:text-foreground aria-checked:bg-primary/10 aria-checked:text-primary"
        >
          <span className="truncate">{option.label}</span>
          {value === option.value && <Check size={14} className="shrink-0" />}
        </button>
      ))}
    </Dropdown>
  );
}
