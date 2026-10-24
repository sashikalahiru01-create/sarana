// Checks that .env.local and the Supabase project are set up correctly.
// Run with: npm run check:supabase
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok, detail });

if (!url || url.includes("YOUR-PROJECT-REF") || !key || key.includes("xxxxxxxx") || key.includes("PASTE_YOUR")) {
  console.error("✗ .env.local is missing or still has the placeholder values.");
  console.error("  Copy .env.example to .env.local and paste your project URL and publishable key.");
  process.exit(1);
}

// Node 20 has no built-in WebSocket and the client would throw; we never use Realtime, so pass a stand-in.
class UnavailableWebSocket {
  constructor() {
    throw new Error("Realtime is not available on this Node version");
  }
}
const supabase = createClient(url, key, typeof WebSocket === "undefined" ? { realtime: { transport: UnavailableWebSocket } } : {});

for (const table of ["pets", "reports", "profiles"]) {
  const { error } = await supabase.from(table).select("id", { count: "exact", head: true });
  check(`table ${table} is readable`, !error, error?.message);
}

// volunteers and pet_contacts are private: an anonymous visitor must NOT be able to read them
for (const table of ["volunteers", "pet_contacts"]) {
  const { data, error } = await supabase.from(table).select("*").limit(1);
  const blocked = !!error || (data ?? []).length === 0;
  check(`table ${table} is private`, blocked, error ? "" : data?.length ? "ANONYMOUS USERS CAN READ IT" : "");
}

const stats = await supabase.rpc("get_public_stats");
check("get_public_stats() works", !stats.error, stats.error?.message ?? JSON.stringify(stats.data));

// A visitor cannot list buckets, so ask for a file that does not exist: a real bucket answers
// "NoSuchKey" (object not found), a missing bucket answers "NoSuchBucket".
const probe = await fetch(`${url}/storage/v1/object/public/pet-photos/does-not-exist.webp`);
const probeBody = await probe.json().catch(() => ({}));
check("bucket pet-photos exists and is public", probeBody.code === "NoSuchKey", probeBody.code ?? `HTTP ${probe.status}`);

for (const { name, ok, detail } of results) {
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? "  — " + detail : ""}`);
}
process.exit(results.every((r) => r.ok) ? 0 : 1);
