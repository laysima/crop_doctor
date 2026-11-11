export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 text-[17px] font-semibold tracking-tight ${className}`}>
      <span className="grid size-8 place-items-center rounded-full bg-ink text-lime">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-[18px]">
          <path d="M4 16c0-7 4-12 12.5-12.5C16.5 12 11 16 4 16Z" fill="currentColor" />
          <path d="M10.2 7.4v5M7.7 9.9h5" stroke="#12291f" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      Crop Doctor
    </span>
  );
}
