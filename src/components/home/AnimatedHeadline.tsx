const words = (text: string) => text.split(" ").filter(Boolean);

/**
 * The hero heading. Every word floats up out of a blur one after another, the highlighted words
 * (for example "a home") are filled with a warm gradient, and a hand-drawn line draws itself underneath.
 * Pure CSS, so it runs without any JavaScript; reduced motion shows the final heading at once.
 */
export function AnimatedHeadline({ text, highlight, className }: { text: string; highlight: string; className?: string }) {
  const at = highlight ? text.indexOf(highlight) : -1;
  const before = at >= 0 ? text.slice(0, at) : text;
  const marked = at >= 0 ? text.slice(at, at + highlight.length) : "";
  const after = at >= 0 ? text.slice(at + highlight.length) : "";

  let index = 0;
  const renderWords = (part: string, extra = "") =>
    words(part).map((word) => {
      const delay = 150 + index++ * 90;
      return (
        <span key={`${index}-${word}`}>
          <span
            aria-hidden="true"
            className={`inline-block animate-[word-in_0.9s_cubic-bezier(0.2,0.8,0.2,1)_backwards] ${extra}`}
            style={{ animationDelay: `${delay}ms` }}
          >
            {word}
          </span>{" "}
        </span>
      );
    });

  return (
    <h1 aria-label={text} className={className}>
      {renderWords(before)}
      {marked && (
        <span className="relative inline-block">
          {renderWords(marked, "-mx-[0.1em] -my-[0.18em] bg-linear-to-r from-coral via-[#f0793f] to-brownie bg-clip-text px-[0.1em] py-[0.18em] text-transparent")}
          <svg
            aria-hidden="true"
            viewBox="0 0 100 12"
            preserveAspectRatio="none"
            className="absolute -bottom-[0.12em] left-0 h-[0.28em] w-full overflow-visible text-coral"
          >
            <path
              d="M2 8 Q 14 1 26 7 T 50 7 T 74 7 T 98 6"
              pathLength={100}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              style={{ strokeDasharray: 100, animation: "draw-line 1.1s ease-out 1.1s backwards" }}
            />
          </svg>
        </span>
      )}
      {/* a space only when one followed the highlight, so "a home." keeps its full stop attached */}
      {after.startsWith(" ") ? " " : null}
      {renderWords(after)}
    </h1>
  );
}
