export function ProgressDots({ count, size = 6 }: { count: number; size?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2, 3].map((step) => (
        <span
          key={step}
          style={{
            width: size,
            height: size,
            animationDelay: `${step * 60}ms`,
          }}
          className={`rounded-full transition-transform group-hover:[animation:mini-dot-pulse_180ms_ease-out] ${
            step < count ? "bg-[var(--amber-500)]" : "bg-[var(--ink-100)]"
          }`}
        />
      ))}
    </div>
  );
}
