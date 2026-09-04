// Faux assistant pour tester l'interface sans clé API ni Cloudflare.
// Usage : node tools/mock-assistant.js   puis, dans l'application, adresse http://localhost:8787 et code "test".
const http = require("http");
const PORT = 8787;
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };

const REPLY = "Le **post-money** est la valorisation juste après le tour : pre-money + montant levé.\n\nExemple : 6 M€ de pre-money et 2 M€ levés donnent un post-money de **8 M€**, soit une part de 2 ÷ 8 = 25 % pour l'investisseur.\n\n- Pre-money : avant l'entrée des investisseurs\n- Post-money : après le tour\n\nD'après la source Bpifrance ci-dessous, la médiane des tours d'amorçage en France en 2025 était autour de 1,5 M€.";

http.createServer((req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, CORS); return res.end(); }
  if (req.url === "/health") { res.writeHead(200, { ...CORS, "Content-Type": "application/json" }); return res.end('{"ok":true,"model":"mock"}'); }
  if (req.url !== "/chat" || req.method !== "POST") { res.writeHead(404, CORS); return res.end(); }
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    let body = {};
    try { body = JSON.parse(raw); } catch {}
    console.log("→", (body.messages || []).length, "message(s), contexte :", body.context && body.context.title, "(" + ((body.context && body.context.text) || "").length + " car.)");
    if (body.code !== "test") { res.writeHead(401, { ...CORS, "Content-Type": "application/json" }); return res.end(JSON.stringify({ error: "bad_code", message: "Code d'accès incorrect." })); }
    res.writeHead(200, { ...CORS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" });
    const send = (ev) => res.write("data: " + JSON.stringify(ev) + "\n\n");
    const events = [
      { type: "message_start", message: { id: "msg_mock", role: "assistant", content: [] } },
      { type: "content_block_start", index: 0, content_block: { type: "server_tool_use", id: "srvtoolu_1", name: "web_search", input: { query: "montant médian levée amorçage France 2025" } } },
      { type: "content_block_stop", index: 0 },
      { type: "content_block_start", index: 1, content_block: { type: "web_search_tool_result", tool_use_id: "srvtoolu_1", content: [
        { type: "web_search_result", url: "https://www.bpifrance.fr/", title: "Bpifrance — Observatoire du capital-risque", page_age: "2025-06-01" },
        { type: "web_search_result", url: "https://www.example.org/", title: "Exemple de seconde source", page_age: null }
      ] } },
      { type: "content_block_stop", index: 1 },
      { type: "content_block_start", index: 2, content_block: { type: "text", text: "" } },
    ];
    let i = 0;
    const words = REPLY.split(/(?<=\s)/);
    const tick = () => {
      if (i < events.length) { send(events[i++]); return setTimeout(tick, 250); }
      const w = words.shift();
      if (w !== undefined) { send({ type: "content_block_delta", index: 2, delta: { type: "text_delta", text: w } }); return setTimeout(tick, 40); }
      send({ type: "content_block_stop", index: 2 });
      send({ type: "message_delta", delta: { stop_reason: "end_turn" }, usage: { output_tokens: 120 } });
      send({ type: "message_stop" });
      res.end();
    };
    tick();
  });
}).listen(PORT, () => console.log("faux assistant sur http://localhost:" + PORT + " (code : test)"));
