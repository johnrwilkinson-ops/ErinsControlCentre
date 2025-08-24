exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Cache-Control": "no-store"
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };

  try {
    const room = (event.queryStringParameters && event.queryStringParameters.room) || "main";
    const { getStore } = await import("@netlify/blobs");
    const store = getStore({ name: "ecc-state" });
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
};
