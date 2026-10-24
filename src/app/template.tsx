// A template re-mounts on every navigation, which replays this short fade between pages.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-[page-in_0.4s_ease-out]">{children}</div>;
}
