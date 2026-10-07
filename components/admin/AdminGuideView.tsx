import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import GuideContentsDropdown from "@/components/admin/GuideContentsDropdown";

const textLink = "font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary";

function Chapter({ number, id, title, children }: { number: string; id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-border/70 py-6 first:pt-0 last:border-0 sm:scroll-mt-8 sm:py-8">
      <div className="mb-4 flex items-baseline gap-4">
        <span className="font-mono text-sm font-semibold tabular-nums text-primary">{number}</span>
        <h2 className="app-section-title font-bold tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="space-y-4 text-sm leading-7 text-muted sm:text-[15px]">{children}</div>
    </section>
  );
}

function Steps({ items }: { items: ReactNode[] }) {
  return <ol className="list-decimal space-y-2 pl-6 marker:font-mono marker:text-primary">{items.map((item, index) => <li key={index} className="pl-1">{item}</li>)}</ol>;
}

function Operation({ title, children }: { title: string; children: ReactNode }) {
  return <div className="grid gap-1 border-b border-border/50 py-3 last:border-0 sm:grid-cols-[9rem_1fr] sm:gap-5"><h3 className="font-semibold text-foreground">{title}</h3><p>{children}</p></div>;
}

export default function AdminGuideView({ seasonId, activeSeasonId }: { seasonId: string; activeSeasonId: string }) {
  const readOnly = seasonId !== activeSeasonId;
  const contents = [
    ["01", "Orientation", "orientation"],
    ["02", "Prepare a season", "setup"],
    ["03", "Manage students", "students"],
    ["04", "Question bank", "questions"],
    ["05", "League operations", "operations"],
    ["06", "Teaching and communication", "teaching"],
    ["07", "Terms used in the system", "terms"],
  ];

  return <article id="top" className="mx-auto w-full max-w-4xl pb-16">
    <header className="border-b border-border pb-7">
      <p className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[.16em] text-primary"><BookOpen size={15} /> SSC League · Administrator handbook</p>
      <h1 className="app-page-title mt-4 font-black tracking-tight text-foreground">Using the admin system</h1>
      <p className="mt-3 max-w-3xl text-base leading-7 text-muted">A practical reference for preparing a season, managing students and course questions, and running league sessions.</p>
      {readOnly && <p className="mt-5 border-l-2 border-amber-300 px-4 py-2 text-sm leading-6 text-amber-100">The selected season is archived. You can review its records, but you cannot change them. Choose the active season in the season selector to manage current data.</p>}
    </header>

    <nav aria-label="Handbook contents" className="border-b border-border/70 py-6">
      <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[.14em] text-muted">Contents</h2>
      <div className="sm:hidden"><GuideContentsDropdown contents={contents.map(([, label, id]) => ({ label, id }))} /></div>
      <ol className="hidden gap-x-8 gap-y-2 sm:grid sm:grid-cols-2">
        {contents.map(([number, label, id]) => <li key={id} className="flex gap-3 text-sm"><span className="font-mono text-xs text-primary">{number}</span><a href={`#${id}`} className="text-foreground decoration-border underline-offset-4 hover:text-primary hover:underline">{label}</a></li>)}
      </ol>
    </nav>

    <div className="divide-y-0">
      <Chapter number="01" id="orientation" title="Orientation">
        <p>The selected season determines which students and records appear across the admin tools. Check the season selector before making changes. Archived seasons are for review; use the active season to manage the current league.</p>
        <p>The <Link href="/admin" className={textLink}>Dashboard</Link> is the season overview. It shows the roster size, how many students have attempted questions, the question and attempt totals, activity over the recent week, lesson reach, answer accuracy, and recent attempts.</p>
        <p>If you use the student view to check a learner’s experience, choose <strong className="text-foreground">Return to student view</strong> when you are finished.</p>
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Open the dashboard <ArrowRight size={14} /></Link>
      </Chapter>

      <Chapter number="02" id="setup" title="Prepare a season">
        <p>Set up the calendar before recording attendance or issuing dated rewards. Then load the roster and check the practice content.</p>
        <Steps items={[
          <>Select the active season.</>,
          <>Open <strong className="text-foreground">Operations → Schedule</strong>. Add each season week with its start date, end date, and XP multiplier. Add the section outline with dates, topics, coverage status, and any useful notes.</>,
          <>Open <strong className="text-foreground">Students → Import students</strong>. Upload a CSV or paste the roster. Required fields are email, full name, and student ID. Group is optional and defaults to G1.</>,
          <>Check the import preview and fix invalid rows. Valid rows can be imported while invalid rows are skipped.</>,
          <>Copy or download the temporary passwords before leaving the import page. The system only shows these credentials there.</>,
          <>Open the <strong className="text-foreground">Question bank</strong>. Check that lessons have the questions students need for practice.</>,
        ]} />
        <p>CSV headers may be Email, Full Name, Student ID, and Group. If the file has no header row, use those columns in that order.</p>
      </Chapter>

      <Chapter number="03" id="students" title="Manage students">
        <p>Open <Link href="/admin/users" className={textLink}>Students</Link> to search by name or student ID, sort the roster, and export it as a CSV. The roster follows the selected season.</p>
        <dl className="divide-y divide-border/50 border-y border-border/50">
          <Operation title="Edit profile">Change the student’s name, ID, group, or directly replace their XP balance.</Operation>
          <Operation title="Add XP">Use the XP tab to add points with a reason. This creates an adjustment record. For normal corrections, use this instead of replacing the balance directly.</Operation>
          <Operation title="Reset password">Use the Security tab. A temporary password is generated and shown on screen; pass it to the student.</Operation>
          <Operation title="Admin access">Choose <strong className="text-foreground">Admin</strong> above the roster to create an administrator with a name, email, and password. The shield action on a roster row grants or removes admin access for an existing account.</Operation>
          <Operation title="View as student">Use the eye action to open the site as that student. Return to the student view when you are done.</Operation>
          <Operation title="Delete accounts">Select one or more roster rows and choose delete. The system asks for confirmation. Deletion is permanent.</Operation>
        </dl>
        <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Open Students <ArrowRight size={14} /></Link>
      </Chapter>

      <Chapter number="04" id="questions" title="Question bank">
        <p>Open <Link href="/admin/questions" className={textLink}>Question bank</Link> to browse lessons, search questions within a lesson, or add practice questions for the selected season. The lesson list also shows how many written prompts are associated with each lesson; their full text is not shown on this page.</p>
        <h3 className="font-semibold text-foreground">Add one multiple-choice question</h3>
        <Steps items={[
          <>Choose <strong className="text-foreground">Add question</strong> and select a lesson.</>,
          <>Write the question and four answer choices. Mark the correct choice.</>,
          <>Give each choice a reason explaining why it is right or wrong. An overall explanation is optional.</>,
          <>Set the points and choose <strong className="text-foreground">Add to bank</strong>.</>,
        ]} />
        <h3 className="font-semibold text-foreground">Import multiple questions</h3>
        <p>Choose <strong className="text-foreground">Import</strong>. Put one question on each line and separate fields with a vertical bar (<code className="rounded bg-background px-1.5 py-0.5 font-mono text-xs text-foreground">|</code>). The fields must be in this order:</p>
        <pre className="whitespace-pre-wrap break-words border-l-2 border-primary/50 bg-background/45 px-4 py-3 font-mono text-xs leading-6 text-foreground sm:whitespace-pre"><code>Lesson | Question | Option A | Option B | Option C | Option D | Correct choice (1–4) | Points</code></pre>
        <p>Lesson names must match the curriculum. Review the wording, marked answer, reasons, and points before adding questions.</p>
        <Link href="/admin/questions" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Open the question bank <ArrowRight size={14} /></Link>
      </Chapter>

      <Chapter number="05" id="operations" title="League operations">
        <p>Open <Link href="/admin/operations" className={textLink}>Operations</Link> and choose the matching tab. The tools are grouped by task:</p>
        <dl className="divide-y divide-border/50 border-y border-border/50">
          <Operation title="Rewards">Choose a reward task, enter an event name if requested, set the award date, select students, and issue the award. A season week must cover the award date. Recent awards appear below the form.</Operation>
          <Operation title="XP values">Set the XP amount for each reward task. Values must be whole numbers from 1 to 1,000. Save to apply the new values to future awards.</Operation>
          <Operation title="Attendance">Choose a session date, then mark each student present, tardy, excused, absent, or on vacation. Search or filter the roster. Attendance summaries can be exported as CSV.</Operation>
          <Operation title="Schedule">Create and edit season weeks and the section outline. Set up the week dates before issuing rewards for those dates.</Operation>
          <Operation title="Recognition">Record extra effort or knowledge sharing and peer support. Choose a student and date; section number and notes are optional. Export the log or remove an entry.</Operation>
          <Operation title="Reports">Review season standings, XP, activity, attendance, rank points, and leaders for accuracy, streak, and answers. Export standings as CSV. Summaries from earlier leagues appear when available.</Operation>
          <Operation title="More · Quick muster">Marks an entire group as present, tardy, excused, absent, or on vacation for today. Check the group first; this action applies the same status to everyone in it.</Operation>
          <Operation title="More · Broadcast">Choose all students or one group, write an announcement, and confirm. Students can see broadcasts in Comms.</Operation>
          <Operation title="More · Additional XP">Choose a group or everyone, enter an XP amount and reason, and confirm. This awards the same amount to every student in the target.</Operation>
          <Operation title="More · Audit log">Review the admin actions recorded by the system.</Operation>
        </dl>
        <p><strong className="text-foreground">Before a group-wide action:</strong> verify the selected group, date, and amount. The system asks for confirmation for quick attendance, broadcasts, and bulk XP.</p>
        <Link href="/admin/operations" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Open Operations <ArrowRight size={14} /></Link>
      </Chapter>

      <Chapter number="06" id="teaching" title="Teaching and communication">
        <p><Link href="/modules" className={textLink}>Modules</Link> shows the course map and lesson progress. <Link href="/playground" className={textLink}>Playground</Link> opens the browser-based coding practice area. These pages let you inspect the student experience; the admin guide and roster remain available in the admin navigation when you leave student view.</p>
        <p><Link href="/leaderboard" className={textLink}>Leaderboard</Link> shows league rankings. <Link href="/comms" className={textLink}>Comms</Link> displays messages and broadcasts. To send an announcement, use <strong className="text-foreground">Operations → More → Broadcast</strong>.</p>
      </Chapter>

      <Chapter number="07" id="terms" title="Terms used in the system">
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          <div><dt className="font-semibold text-foreground">Season</dt><dd>The league period whose students and records are currently selected.</dd></div>
          <div><dt className="font-semibold text-foreground">Group</dt><dd>A class label such as G1. Groups are used for filtering and group-wide actions.</dd></div>
          <div><dt className="font-semibold text-foreground">XP</dt><dd>Points earned from practice and league rewards.</dd></div>
          <div><dt className="font-semibold text-foreground">Week multiplier</dt><dd>A setting that changes the amount awarded for protocol rewards dated within that week.</dd></div>
        </dl>
        <p>If a change is unavailable, check whether the selected season is archived. If records appear to be missing, confirm the season selector and read any message shown by the page.</p>
      </Chapter>
    </div>
    <footer className="mt-6 flex items-center justify-between border-t border-border/70 pt-4 text-xs text-muted"><span>SSC League · Admin handbook</span><a href="#top" className="inline-flex items-center gap-1 hover:text-primary">Back to top <ArrowRight size={12} className="-rotate-90" /></a></footer>
  </article>;
}
