import { getStore } from '@netlify/blobs';

const STORE = 'ecc-state';
function makeStore() {
  try { return getStore({ name: STORE }); } catch (_) {}
  const siteID = process.env.BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID;
  const token  = process.env.BLOBS_TOKEN  || process.env.NETLIFY_API_TOKEN || process.env.NETLIFY_AUTH_TOKEN;
  if (!siteID || !token) throw new Error('Blobs not configured.');
  return getStore({ name: STORE, siteID, token });
}

export async function handler(event) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Cache-Control': 'no-store'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: cors, body: 'Use POST' };

  const token = (event.headers['authorization'] || '').replace(/^Bearer\s+/i, '');
  const expect = process.env.C4_TOKEN;
  if (expect && token !== expect) return { statusCode: 401, headers: cors, body: 'Unauthorized' };

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const room = (body.room || 'main').toLowerCase();
    const cmd = String(body.cmd || '').toLowerCase();
    const map = new Set(['start-prep-session','start-session','pause','resume','reset','panic','lock']);
    if (!map.has(cmd)) return { statusCode: 400, headers: cors, body: 'Bad command' };

    const store = makeStore();
    // Read existing
    const rec = await store.get(`room:${room}`);
    const j = rec ? (typeof rec === 'string' ? JSON.parse(rec) : rec) : { state: {}, updatedAt: 0, room };
    const state = j.state || {};

    // write control command
    state.control = { cmd, at: Date.now() };

    await store.setJSON(`room:${room}`, { state, updatedAt: Date.now(), room });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...cors }, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: String(err) }) };
  }
}
