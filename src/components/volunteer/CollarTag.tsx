/**
 * The reward: a gold collar tag like the one on Brownie's collar, hanging from a string and swinging gently,
 * with the volunteer's name on it. It drops in when it appears.
 */
export function CollarTag({ name, role, skills }: { name: string; role: string; skills: string[] }) {
  return (
    <div className="mx-auto flex w-full max-w-[17rem] animate-[tag-drop_0.9s_cubic-bezier(0.34,1.4,0.64,1)_backwards] flex-col items-center">
      <span aria-hidden="true" className="h-10 w-px bg-[#8a5b2b]/70" />
      <div className="w-full origin-top animate-[tag-swing_5s_ease-in-out_infinite]">
        <div className="relative rounded-[28px] bg-linear-to-b from-[#ffd778] via-[#f2b544] to-[#dd9420] p-2 shadow-[0_22px_30px_-16px_rgb(120_70_10/0.75),inset_0_1px_0_rgb(255_255_255/0.6)]">
          <span aria-hidden="true" className="absolute left-1/2 top-3.5 size-3.5 -translate-x-1/2 rounded-full bg-[#b87413]/70 shadow-[inset_0_1px_2px_rgb(0_0_0/0.4)]" />
          <div className="mt-8 flex flex-col items-center gap-1 rounded-[20px] border border-[#b87413]/25 bg-white/80 px-4 py-5 text-center text-midnight">
            <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="#c4401b">
              <circle cx="6" cy="9" r="2.2" />
              <circle cx="10" cy="5" r="2.2" />
              <circle cx="14" cy="5" r="2.2" />
              <circle cx="18" cy="9" r="2.2" />
              <path d="M12 11c-3 0-6 4-6 6.5 0 1.5 1.2 2.5 2.7 2.5 1.3 0 2.1-.7 3.3-.7s2 .7 3.3.7c1.5 0 2.7-1 2.7-2.5C18 15 15 11 12 11z" />
            </svg>
            <strong className="font-heading text-2xl font-extrabold leading-tight [overflow-wrap:anywhere]">{name}</strong>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a4a12]">{role}</span>
            {skills.length > 0 && <span className="mt-1 text-[13px] font-semibold text-[#6b4a1e]">{skills.join(" · ")}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
