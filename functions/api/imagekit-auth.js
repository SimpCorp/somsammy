// functions/api/imagekit-auth.js
export async function onRequestGet(context) {
  // Add IMAGEKIT_PRIVATE_KEY in Cloudflare Pages -> Settings -> Environment Variables
  const privateKey = context.env.IMAGEKIT_PRIVATE_KEY;
  
  if (!privateKey) {
    return new Response(JSON.stringify({ error: "Private key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 1800; // 30-minute validity

  // Web Crypto API HMAC-SHA1 computation (native on Cloudflare Workers / Pages)
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(privateKey),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const dataToSign = encoder.encode(token + expire);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, dataToSign);
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return new Response(
    JSON.stringify({
      token,
      expire,
      signature
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
}
