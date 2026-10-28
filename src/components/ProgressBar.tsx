type Props = { label: string; percent: number; tone?: "indigo" | "emerald" };

export default function ProgressBar({ label, percent, tone = "indigo" }: Props) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200"
    >
      <div
        className={`h-full rounded-full transition-[width] duration-300 ${tone === "emerald" ? "bg-emerald-500" : "bg-indigo-500"}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
