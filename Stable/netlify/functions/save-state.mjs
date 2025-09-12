import { getStore } from '@netlify/blobs';

const STORE = 'ecc-state';

function makeStore() {
  try { return getStore({ name: STORE }); } catch (_) {}
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
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: cors, body: "Use POST" };

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const room = body.room || "main";
    const state = body.state || null;

    const store = makeStore();
    await store.setJSON(`room:${room}`, { state, updatedAt: Date.now(), room });

    return { statusCode: 200, headers: { "Content-Type": "application/json", ...cors, "X-Storage": "blobs" }, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: String(err) }) };
  }
}
