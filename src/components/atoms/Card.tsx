import { cn } from "@/lib/cn";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "glass relative rounded-3xl shadow-[0_30px_80px_-30px_rgb(0_0_0/0.8)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-b before:from-white/[0.06] before:to-transparent",
        className,
      )}
    >
      {children}
    </div>
  );
}
