exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };

  try {
    const params = event.queryStringParameters || {};
    const room = params.room || "main";

    let state = null, updatedAt = 0;
    try {
      const { getStore } = await import("@netlify/blobs");
      const store = getStore({ name: "ecc-state" });
      const rec = await store.get(`room:${room}`);
      if (rec) {
        const j = typeof rec === "string" ? JSON.parse(rec) : rec;
        state = j.state || null;
        updatedAt = j.updatedAt || 0;
      }
    } catch {
      globalThis.__ECC_STATE__ = globalThis.__ECC_STATE__ || {};
      const j = globalThis.__ECC_STATE__[`room:${room}`];
      if (j) { state = j.state || null; updatedAt = j.updatedAt || 0; }
    }

    return { statusCode: 200, headers: { "Content-Type": "application/json", ...cors }, body: JSON.stringify({ state, updatedAt, room }) };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: String(err) }) };
  }
};
