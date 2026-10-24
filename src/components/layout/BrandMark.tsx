/** The paw logo from the scroll story: white paw on a coral rounded square. */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-9 place-items-center rounded-[11px] bg-coral ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
        <circle cx="6" cy="9" r="2.2" />
        <circle cx="10" cy="5" r="2.2" />
        <circle cx="14" cy="5" r="2.2" />
        <circle cx="18" cy="9" r="2.2" />
        <path d="M12 11c-3 0-6 4-6 6.5 0 1.5 1.2 2.5 2.7 2.5 1.3 0 2.1-.7 3.3-.7s2 .7 3.3.7c1.5 0 2.7-1 2.7-2.5C18 15 15 11 12 11z" />
      </svg>
    </span>
  );
}
