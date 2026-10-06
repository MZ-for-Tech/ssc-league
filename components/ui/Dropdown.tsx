"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

interface DropdownRenderProps {
  open: boolean;
  toggle: () => void;
  close: () => void;
  panelId: string;
}

interface DropdownProps {
  trigger: (props: DropdownRenderProps) => ReactNode;
  children: ReactNode | ((props: DropdownRenderProps) => ReactNode);
  align?: "left" | "right";
  panelClassName?: string;
  panelRole?: "menu" | "listbox" | "dialog";
  portal?: boolean;
}

export default function Dropdown({
  trigger,
  children,
  align = "right",
  panelClassName,
  panelRole,
  portal = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const renderProps: DropdownRenderProps = {
    open,
    toggle: () => {
      setPanelPosition(null);
      setOpen((current) => !current);
    },
    close: () => {
      setPanelPosition(null);
      setOpen(false);
    },
    panelId,
  };

  useEffect(() => {
    if (!open) return;

    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !portal) return;

    const updatePosition = () => {
      const triggerElement = rootRef.current;
      const panelElement = panelRef.current;
      if (!triggerElement || !panelElement) return;

      const triggerRect = triggerElement.getBoundingClientRect();
      const panelRect = panelElement.getBoundingClientRect();
      const margin = 8;
      const maxLeft = Math.max(margin, window.innerWidth - panelRect.width - margin);
      const left = Math.min(maxLeft, Math.max(margin, align === "right" ? triggerRect.right - panelRect.width : triggerRect.left));
      const below = triggerRect.bottom + margin;
      const top = below + panelRect.height <= window.innerHeight - margin
        ? below
        : Math.max(margin, triggerRect.top - panelRect.height - margin);
      setPanelPosition({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, open, portal]);

  const panel = open ? (
    <div
      ref={panelRef}
      id={panelId}
      role={panelRole}
      style={portal ? {
        position: "fixed",
        top: panelPosition?.top ?? 0,
        left: panelPosition?.left ?? 0,
        visibility: panelPosition ? "visible" : "hidden",
      } : undefined}
      className={clsx(
        portal
          ? "z-[100] max-h-[calc(100vh-1rem)] overflow-y-auto border border-slate-700 bg-slate-900 shadow-2xl"
          : "absolute top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl",
        !portal && (align === "right" ? "right-0" : "left-0"),
        panelClassName,
      )}
    >
      {typeof children === "function" ? children(renderProps) : children}
    </div>
  ) : null;

  return (
    <div ref={rootRef} className="relative">
      {trigger(renderProps)}
      {portal && panel && typeof document !== "undefined" ? createPortal(panel, document.body) : panel}
    </div>
  );
}
