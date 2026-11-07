export async function onRequest(context) {
  const kv = context.env.SOMSAMMY_KV;

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Cache-Control": "no-cache, no-store, must-revalidate"
  };

  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (!kv) {
    return new Response(JSON.stringify({ error: "KV binding missing" }), { status: 500, headers });
  }

  const KEY = "lemon_count";

  // POST: Squeeze / Increment
  if (context.request.method === "POST") {
    const raw = await kv.get(KEY);
    const count = (raw ? parseInt(raw, 10) : 0) + 1;
    await kv.put(KEY, count.toString());
    return new Response(JSON.stringify({ count }), { headers });
  }

  // GET: Fetch live count
  const raw = await kv.get(KEY);
  const count = raw ? parseInt(raw, 10) : 0;
  return new Response(JSON.stringify({ count }), { headers });
}
