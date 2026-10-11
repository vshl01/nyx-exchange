import { cn } from "@/lib/cn";

type Props = { children: React.ReactNode; tone?: "live" | "muted"; className?: string };

export function Badge({ children, tone = "muted", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        tone === "live" ? "border-status-success/25 bg-status-success/10 text-status-success" : "border-white/10 bg-white/5 text-moon-300",
        className,
      )}
    >
      {tone === "live" && (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-status-success opacity-70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-status-success" />
        </span>
      )}
      {children}
    </span>
  );
}
