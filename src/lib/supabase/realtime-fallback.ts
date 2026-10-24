/**
 * Supabase's client expects a built-in WebSocket. Browsers and Node 22+ have one; Node 20 does not,
 * and the client throws while it is being created. Sarana does not use Supabase Realtime,
 * so on Node 20 we hand it a stand-in that is never called.
 * Remove this file once local development runs on Node 22 or newer.
 */
class UnavailableWebSocket {
  constructor() {
    throw new Error("Supabase Realtime is not available on this Node version (needs Node 22+).");
  }
}

export const realtimeFallback =
  typeof WebSocket === "undefined"
    ? { realtime: { transport: UnavailableWebSocket as never } }
    : {};
