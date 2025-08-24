import { getStore } from '@netlify/blobs';

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

    const store = getStore({ name: "ecc-state" });
    await store.setJSON(`room:${room}`, { state, updatedAt: Date.now(), room });

    return { statusCode: 200, headers: { "Content-Type": "application/json", ...cors, "X-Storage": "blobs" }, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: String(err) }) };
  }
}
