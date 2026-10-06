"use client";

import { useSyncExternalStore } from "react";
import PageHeaderSkeleton from "@/components/PageHeaderSkeleton";
import SkeletonCard from "@/components/SkeletonCard";

type DashboardView = "student" | "studentPreview" | "admin" | "operations" | "users" | "questions";

export default function DashboardLoading() {
  const requestedView = useSyncExternalStore(
    (callback) => { window.addEventListener("popstate", callback); return () => window.removeEventListener("popstate", callback); },
    () => new URLSearchParams(window.location.search).get("view"),
    () => null,
  );
  const view: DashboardView = requestedView === "student" ? "studentPreview"
    : ["admin", "operations", "users", "questions"].includes(requestedView || "") ? requestedView as DashboardView
    : "student";

  if (view === "admin") return <AdminDashboardSkeleton />;
  if (view === "operations") return <OperationsDashboardSkeleton />;
  if (view === "users") return <UsersDashboardSkeleton />;
  if (view === "questions") return <QuestionsDashboardSkeleton />;
  if (view === "studentPreview") return <StudentPreviewSkeleton />;
  return <StudentDashboardSkeleton />;
}

function StudentPreviewSkeleton() {
  return (
    <div className="w-full space-y-6 pb-16" aria-busy="true" aria-label="Loading student preview">
      <div className="h-20 animate-pulse rounded-xl border border-primary/20 bg-primary/5" />
      <section className="h-56 animate-pulse rounded-2xl border border-border bg-surface/60 p-6 sm:p-8" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <SkeletonCard key={item} />)}</div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2"><div className="h-44 animate-pulse rounded-2xl border border-border bg-surface/50" /><div className="h-44 animate-pulse rounded-2xl border border-border bg-surface/50" /></div>
        <div className="h-72 animate-pulse rounded-2xl border border-border bg-surface/50" />
      </div>
    </div>
  );
}

function QuestionsDashboardSkeleton() {
  return (
    <div className="w-full space-y-6 pb-16" aria-busy="true" aria-label="Loading question bank">
      <PageHeaderSkeleton titleWidth="w-64" descriptionWidth="w-96" actionWidth="w-[28rem]" />
      <section className="animate-pulse space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="h-4 w-64 max-w-full rounded bg-surface-light/30" />
          <div className="h-10 w-full rounded-xl border border-border bg-surface/60 sm:w-72" />
        </div>
        {[0, 1, 2].map((module) => (
          <section key={module} className="space-y-3">
            <div className="flex items-end justify-between px-1">
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-primary/20" />
                <div className="h-6 w-44 rounded bg-surface-light/35" />
              </div>
              <div className="h-3 w-16 rounded bg-surface-light/20" />
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((lesson) => (
                <article key={lesson} className="min-h-44 rounded-2xl border border-border bg-surface/55 p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-xl border border-primary/15 bg-primary/10" />
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="h-4 w-4/5 rounded bg-surface-light/35" />
                      <div className="h-3 w-full rounded bg-surface-light/20" />
                      <div className="h-3 w-2/3 rounded bg-surface-light/20" />
                    </div>
                  </div>
                  <div className="mt-5 flex gap-4 border-t border-border/70 pt-3">
                    <div className="h-3 w-24 rounded bg-surface-light/20" />
                    <div className="h-3 w-28 rounded bg-surface-light/20" />
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>
    </div>
  );
}

function UsersDashboardSkeleton() {
  return (
    <div className="w-full space-y-6 pb-20" aria-busy="true" aria-label="Loading agent roster">
      <PageHeaderSkeleton titleWidth="w-56" descriptionWidth="w-80" actionWidth="w-[28rem]" actionHeight="h-24" />
      <section className="animate-pulse overflow-hidden rounded-2xl border border-border bg-surface/50">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[3rem_minmax(12rem,2fr)_minmax(8rem,1fr)_minmax(7rem,1fr)_minmax(5rem,1fr)_minmax(8rem,1fr)] gap-4 border-b border-border bg-background/60 px-4 py-4">
              {["w-4", "w-20", "w-16", "w-14", "w-12", "w-16"].map((width, index) => (
                <div key={index} className={`h-3 rounded bg-surface-light/30 ${width}`} />
              ))}
            </div>
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="grid grid-cols-[3rem_minmax(12rem,2fr)_minmax(8rem,1fr)_minmax(7rem,1fr)_minmax(5rem,1fr)_minmax(8rem,1fr)] items-center gap-4 border-b border-border/70 px-4 py-4 last:border-0">
                <div className="h-4 w-4 rounded bg-surface-light/20" />
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-surface-light/30" />
                  <div className="h-4 w-40 max-w-full rounded bg-surface-light/35" />
                </div>
                <div className="space-y-2"><div className="h-3 w-20 rounded bg-surface-light/30" /><div className="h-3 w-10 rounded bg-surface-light/20" /></div>
                <div className="space-y-2"><div className="ml-auto h-4 w-16 rounded bg-surface-light/35" /><div className="ml-auto h-3 w-10 rounded bg-surface-light/20" /></div>
                <div className="mx-auto h-6 w-14 rounded bg-surface-light/20" />
                <div className="ml-auto flex gap-2"><div className="h-9 w-9 rounded-lg bg-surface-light/25" /><div className="h-9 w-9 rounded-lg bg-surface-light/25" /><div className="h-9 w-9 rounded-lg bg-surface-light/25" /></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StudentDashboardSkeleton() {
  return (
    <div className="w-full space-y-6 pb-20" aria-busy="true" aria-label="Loading dashboard">
      {/* DashboardHero: identity and global standing */}
      <section className="relative animate-pulse overflow-hidden rounded-2xl border border-border bg-surface/50 p-6 shadow-2xl sm:p-8">
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="relative flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex w-full items-center gap-6 md:w-auto">
            <div className="relative shrink-0">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/35 via-primary/20 to-primary/10 p-1">
                <div className="h-full w-full rounded-full border-4 border-background bg-surface-light/30" />
              </div>
              <div className="absolute -bottom-3 left-1/2 h-6 w-12 -translate-x-1/2 rounded-md border border-border bg-background" />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-9 w-56 max-w-full rounded bg-surface-light/35" />
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-5 w-28 rounded border border-primary/15 bg-primary/10" />
                <div className="h-3 w-24 rounded bg-surface-light/20" />
              </div>
            </div>
          </div>
          <div className="flex w-full items-center gap-6 rounded-2xl border border-border bg-background/40 p-5 md:w-auto md:min-w-60">
            <div className="flex-1 space-y-2 text-right">
              <div className="ml-auto h-3 w-28 rounded bg-surface-light/25" />
              <div className="ml-auto h-10 w-36 rounded bg-surface-light/35" />
              <div className="ml-auto h-3 w-20 rounded bg-success/15" />
            </div>
            <div className="h-12 w-12 shrink-0 rounded-xl border border-warning/15 bg-warning/10" />
          </div>
        </div>
      </section>

      {/* DashboardStats spans the content width above the two-column panels. */}
      <section className="grid animate-pulse grid-cols-2 gap-4 sm:grid-cols-4" aria-label="Loading student stats">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="flex min-h-28 items-start justify-between gap-3 rounded-2xl border border-border bg-surface/50 p-4 sm:p-5">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-3 w-24 max-w-full rounded bg-surface-light/25" />
              <div className="h-7 w-20 max-w-full rounded bg-surface-light/40" />
            </div>
            <div className="h-10 w-10 shrink-0 rounded-xl border border-primary/15 bg-primary/10" />
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* RivalsWidget */}
          <section className="animate-pulse rounded-2xl border border-border bg-surface/50 p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="h-4 w-28 rounded bg-surface-light/35" />
              <div className="h-5 w-20 rounded border border-border bg-background/50" />
            </div>
            <div className="space-y-2">
              {[0, 1, 2].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/30 p-2.5">
                  <div className="h-3 w-5 rounded bg-surface-light/20" />
                  <div className="h-8 w-8 shrink-0 rounded-full bg-surface-light/30" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3 w-32 max-w-full rounded bg-surface-light/30" />
                    <div className="h-2 w-24 max-w-full rounded bg-surface-light/15" />
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-surface-light/15" />
                </div>
              ))}
            </div>
          </section>

          {/* RecentActivity */}
          <section className="relative animate-pulse overflow-hidden rounded-2xl border border-border bg-surface/50 p-6">
            <div className="mb-6 h-4 w-28 rounded bg-surface-light/30" />
            <div className="space-y-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="flex items-start gap-4 rounded-xl border border-border/60 bg-background/30 p-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-surface-light/35" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-surface-light/30" />
                    <div className="h-2.5 w-28 rounded bg-surface-light/15" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* NextObjective */}
        <aside className="h-fit animate-pulse rounded-2xl border border-border bg-surface/50 p-6 lg:sticky lg:top-8">
          <div className="mb-7 h-4 w-32 rounded bg-surface-light/30" />
          <div className="mb-3 h-12 w-24 rounded bg-surface-light/35" />
          <div className="mb-6 h-5 w-3/4 rounded bg-primary/15" />
          <div className="mb-7 space-y-2 rounded-xl border border-primary/15 bg-primary/5 p-4">
            <div className="h-3 w-full rounded bg-surface-light/20" />
            <div className="h-3 w-4/5 rounded bg-surface-light/20" />
          </div>
          <div className="h-12 w-full rounded-xl bg-primary/20" />
        </aside>
      </div>
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="w-full space-y-7 pb-16" aria-busy="true" aria-label="Loading admin dashboard">
      <section className="animate-pulse rounded-2xl border border-border bg-surface/60 p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 shrink-0 rounded-full bg-primary/25 p-1 sm:h-24 sm:w-24" />
            <div className="h-8 w-64 max-w-full rounded bg-surface-light/40" />
          </div>
          <div className="h-10 w-48 max-w-full rounded-xl border border-border bg-background/50" />
        </div>
      </section>

      <section className="grid animate-pulse grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Season totals">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="flex min-h-28 items-start justify-between gap-3 rounded-2xl border border-border bg-surface/50 p-4 sm:p-5">
            <div className="space-y-3">
              <div className="h-4 w-24 rounded bg-surface-light/30" />
              <div className="h-8 w-16 rounded bg-surface-light/45" />
              <div className="h-3 w-32 max-w-full rounded bg-surface-light/20" />
            </div>
            <div className="h-10 w-10 rounded-xl border border-primary/15 bg-primary/10" />
          </div>
        ))}
      </section>

      <section className="animate-pulse rounded-2xl border border-border bg-surface/50 p-5 sm:p-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-surface-light/20" />
            <div className="h-6 w-40 rounded bg-surface-light/35" />
            <div className="h-4 w-52 rounded bg-surface-light/20" />
          </div>
          <div className="flex gap-6">
            <div className="h-10 w-20 rounded bg-surface-light/25" />
            <div className="h-10 w-16 rounded bg-surface-light/25" />
          </div>
        </div>
        <div className="grid h-36 grid-cols-7 gap-2 sm:gap-4">
          {[0, 1, 2, 3, 4, 5, 6].map((day, index) => (
            <div key={day} className="flex flex-col items-center gap-2">
              <div className="h-3 w-5 rounded bg-surface-light/15" />
              <div className="flex w-full flex-1 items-end rounded-t-md bg-surface-light/10">
                <div className="w-full rounded-t-md bg-primary/20" style={{ height: `${[48, 68, 38, 82, 56, 72, 44][index]}%` }} />
              </div>
              <div className="h-3 w-8 rounded bg-surface-light/15" />
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminPanelSkeleton rows={4} />
        <AdminPanelSkeleton rows={4} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <AdminPanelSkeleton rows={3} />
        <AdminPanelSkeleton rows={3} />
      </div>
    </div>
  );
}

function AdminPanelSkeleton({ rows }: { rows: number }) {
  return (
    <section className="min-h-64 animate-pulse rounded-2xl border border-border bg-surface/50 p-5 sm:p-6">
      <div className="mb-2 h-3 w-24 rounded bg-surface-light/20" />
      <div className="mb-2 h-6 w-40 rounded bg-surface-light/35" />
      <div className="mb-6 h-4 w-64 max-w-full rounded bg-surface-light/20" />
      <div className="space-y-4">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index}>
            <div className="mb-2 flex justify-between gap-4">
              <div className="h-3 w-2/3 rounded bg-surface-light/25" />
              <div className="h-3 w-12 rounded bg-surface-light/20" />
            </div>
            <div className="h-2 rounded-full bg-surface-light/15" />
          </div>
        ))}
      </div>
    </section>
  );
}

function OperationsDashboardSkeleton() {
  return (
    <div className="w-full space-y-7 pb-16" aria-busy="true" aria-label="Loading league operations">
      <PageHeaderSkeleton titleWidth="w-64" descriptionWidth="w-96" actionWidth="w-48" />
      <section className="grid animate-pulse grid-cols-1 gap-4 xl:grid-cols-3" aria-label="League tools">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-72 rounded-2xl border border-border bg-surface/50 p-5">
            <div className="mb-6 h-5 w-40 rounded bg-surface-light/35" />
            <div className="space-y-4">
              <div className="h-10 w-full rounded-lg bg-surface-light/20" />
              <div className="h-10 w-full rounded-lg bg-surface-light/20" />
              <div className="h-24 w-full rounded-lg bg-surface-light/15" />
              <div className="h-10 w-full rounded-lg bg-primary/20" />
            </div>
          </div>
        ))}
      </section>
      <section className="h-72 animate-pulse rounded-2xl border border-border bg-surface/40 p-6">
        <div className="mb-6 h-5 w-44 rounded bg-surface-light/35" />
        <div className="space-y-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-4 border-b border-border/70 pb-4">
              <div className="h-8 w-8 rounded-full bg-surface-light/20" />
              <div className="h-4 flex-1 rounded bg-surface-light/20" />
              <div className="h-4 w-24 rounded bg-surface-light/15" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
