// Assistant IA de la Salle d'étude — relais sécurisé entre la page (publique) et l'API Claude.
//
// La page envoie : POST /chat  { code, messages: [{role, content}], context: { title, text } }
// Le worker vérifie le code d'accès, applique un quota, construit le prompt du tuteur,
// appelle Claude avec la recherche web, et renvoie la réponse en flux (SSE), événement par événement.
// La clé API ne quitte jamais ce worker.

import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `Tu es l'assistant de « La Salle d'Étude », une application de révision pour des étudiants en Master 2 Finance d'entreprise (université Paris Nanterre, en alternance). Tu aides à comprendre les cours, à résoudre des exercices et à trouver des informations fiables.

Règles :
- Réponds en français, de façon claire et pédagogique. Va à l'essentiel : un étudiant révise, il ne veut pas une dissertation.
- Quand un contexte de module est fourni, appuie-toi d'abord dessus et reste cohérent avec ses définitions et ses formules. Signale poliment si le cours et une source externe divergent.
- Pour un exercice, guide le raisonnement étape par étape et donne le résultat chiffré ; vérifie tes calculs.
- Utilise la recherche web quand la question porte sur des faits actuels (taux, lois, normes, chiffres, actualité), sur une source précise, ou sur un sujet absent du cours. Cite alors tes sources (nom et lien). N'invente jamais un chiffre, une référence ou un article de loi : si tu ne sais pas, dis-le.
- Écris les formules en texte simple (par exemple : Post-money = Pre-money + Montant levé), pas en LaTeX.
- Mise en forme légère : paragraphes courts, listes à puces si utile, titres seulement pour une réponse longue.
- Si la demande n'a aucun rapport avec les études (finance, gestion, droit, méthodologie, anglais des affaires, outils numériques, mémoire), réponds brièvement et ramène vers le travail.`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" } });

// Ne garde que des tours bien formés, alternés, et borne leur taille.
function sanitizeMessages(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const m of raw.slice(-24)) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) continue;
    const content = String(m.content ?? "").slice(0, 12000).trim();
    if (!content) continue;
    if (out.length && out[out.length - 1].role === m.role) out[out.length - 1].content += "\n\n" + content;
    else out.push({ role: m.role, content });
  }
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}

async function checkQuota(env, request) {
  if (!env.QUOTA) return true;
  const ip = request.headers.get("cf-connecting-ip") || "inconnu";
  const key = ip + ":" + new Date().toISOString().slice(0, 10);
  const used = parseInt((await env.QUOTA.get(key)) || "0", 10);
  const max = parseInt(env.DAILY_LIMIT || "40", 10);
  if (used >= max) return false;
  await env.QUOTA.put(key, String(used + 1), { expirationTtl: 2 * 86400 });
  return true;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);

    if (url.pathname === "/health") return json({ ok: true, model: env.MODEL || "claude-opus-5" });
    if (url.pathname !== "/chat" || request.method !== "POST") return json({ error: "not_found" }, 404);

    if (!env.ANTHROPIC_API_KEY) return json({ error: "server_not_configured", message: "Clé API absente : lance `npm run secret:key`." }, 500);

    let body;
    try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }

    if (env.ACCESS_CODE && String(body.code || "") !== env.ACCESS_CODE) {
      return json({ error: "bad_code", message: "Code d'accès incorrect." }, 401);
    }
    if (!(await checkQuota(env, request))) {
      return json({ error: "quota", message: "Limite quotidienne atteinte pour cet appareil. Réessaie demain." }, 429);
    }

    const messages = sanitizeMessages(body.messages);
    if (!messages.length) return json({ error: "empty" }, 400);

    const system = [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }];
    const ctx = body.context || {};
    const ctxText = String(ctx.text || "").slice(0, 60000).trim();
    if (ctxText) {
      system.push({
        type: "text",
        text: `Contexte : l'étudiant travaille le module « ${String(ctx.title || "").slice(0, 200)} ». Voici le contenu du cours, à utiliser en priorité :\n\n${ctxText}`,
        cache_control: { type: "ephemeral" },
      });
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const params = {
      model: env.MODEL || "claude-opus-5",
      max_tokens: 8000,
      system,
      messages,
      thinking: { type: "adaptive" },
      output_config: { effort: env.EFFORT || "medium" },
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: parseInt(env.MAX_SEARCHES || "5", 10) }],
    };
    const useFallbacks = (env.FALLBACKS || "on") !== "off";
    const stream = useFallbacks
      ? client.beta.messages.stream({ ...params, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" })
      : client.messages.stream(params);

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const enc = new TextEncoder();
    const send = (ev) => writer.write(enc.encode("data: " + JSON.stringify(ev) + "\n\n"));

    (async () => {
      try {
        for await (const ev of stream) {
          // Les deltas de réflexion sont vides (display omis) : inutile de les transmettre.
          if (ev.type === "content_block_delta" && (ev.delta?.type === "thinking_delta" || ev.delta?.type === "signature_delta")) continue;
          if (ev.type === "content_block_start" && ev.content_block?.type === "thinking") continue;
          await send(ev);
        }
      } catch (e) {
        const status = e?.status;
        const message = status === 401 ? "Clé API refusée par Anthropic."
          : status === 429 ? "Trop de demandes en même temps, réessaie dans quelques secondes."
          : status === 529 ? "Le service Anthropic est surchargé, réessaie dans un instant."
          : "Erreur du service : " + (e?.message || "inconnue");
        await send({ type: "error", message });
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...CORS, "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache", "X-Accel-Buffering": "no" },
    });
  },
};
