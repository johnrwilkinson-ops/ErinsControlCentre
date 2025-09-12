import { getStore } from '@netlify/blobs';

const STORE = 'ecc-state';

function makeStore() {
  // Use platform-provided context if available
  try { return getStore({ name: STORE }); } catch (_) {}
  // Manual fallback via env variables
  const siteID = process.env.BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID;
  const token  = process.env.BLOBS_TOKEN  || process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_AUTH_TOKEN;
  if (!siteID || !token) {
    throw new Error('Blobs not configured. Set BLOBS_SITE_ID and BLOBS_TOKEN in your site env vars.');
  }
  return getStore({ name: STORE, siteID, token });
}

export async function handler(event) {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Cache-Control": "no-store"
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };

  try {
    const room = (event.queryStringParameters && event.queryStringParameters.room) || "main";
    const store = makeStore();
    const rec = await store.get(`room:${room}`);
    const j = rec ? (typeof rec === "string" ? JSON.parse(rec) : rec) : null;
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", ...cors, "X-Storage": "blobs" },
      body: JSON.stringify({ state: j?.state ?? null, updatedAt: j?.updatedAt ?? 0, room })
    };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: String(err) }) };
  }
}
