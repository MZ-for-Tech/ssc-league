export default function DashboardEmptyChart({ message }: { message: string }) {
  return <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-slate-800 px-5 text-center text-sm text-slate-500">{message}</div>;
}
