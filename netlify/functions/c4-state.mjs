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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'no-store'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };

  try {
    const room = (event.queryStringParameters && event.queryStringParameters.room) || 'main';
    const store = makeStore();
    const rec = await store.get(`room:${room}`);
    const j = rec ? (typeof rec === 'string' ? JSON.parse(rec) : rec) : null;
    const st = j?.state || {};

    // Flatten for Web-to-Variables (strings/numbers/bools only)
    const timers = st.timers || {};
    const out = {
      room,
      updatedAt: j?.updatedAt || 0,
      // timers (in seconds, rounded)
      prep_seconds: Math.round((timers.prep || 0) / 1000),
      session_seconds: Math.round((timers.session || 0) / 1000),
      which: timers.which || '',
      running: !!(timers.which && timers.end),
      // lengths
      prep_minutes: st.prepMins ?? null,
      session_minutes: st.lengthMins ?? null,
      // meta
      difficulty: st.difficulty || '',
      d10: st.d10 || null,
      punishment: (st.picks && (st.picks.punishment || st.picks.Punishment)) || '',
      reward: (st.picks && (st.picks.reward || st.picks.Reward)) || '',
      notes_count: Array.isArray(st.notes) ? st.notes.length : 0
    };

    return { statusCode: 200, headers: { 'Content-Type': 'application/json', ...cors }, body: JSON.stringify(out) };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: String(err) }) };
  }
}
