/* ---------- Assistant IA : panneau de discussion relié au relais (assistant-worker) ---------- */
(function () {
  "use strict";
  var API = window.SalleEtude;
  if (!API) return;
  var cfg = (window.CONFIG && CONFIG.assistant) || {};
  if (cfg.enabled === false) return;

  var KEY = "salle-etude-assistant-v1";
  function loadLocal() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function saveLocal() { try { localStorage.setItem(KEY, JSON.stringify({ code: chat.code, url: chat.customUrl })); } catch (e) {} }

  var local = loadLocal();
  var chat = {
    open: false, messages: [], busy: false, status: "", error: "", draft: "",
    live: null, showSettings: false,
    code: local.code || "", customUrl: local.url || ""
  };
  var esc = API.esc;
  var NAME = cfg.nom || "Assistant";
  var SUGGESTIONS = cfg.suggestions || [
    "Explique-moi la différence entre fonds de roulement et BFR avec un exemple chiffré.",
    "Fais-moi un exercice corrigé sur le calcul du WACC.",
    "Quel est le taux directeur actuel de la BCE et quel effet sur le coût de la dette ?"
  ];
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>';

  function serviceUrl() { return String(cfg.url || chat.customUrl || "").replace(/\/+$/, ""); }

  /* ---------- Markdown léger pour les réponses ---------- */
  function inline(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[\s(])\*([^*\s][^*\n]*?)\*(?=[\s.,;:!?)]|$)/g, "$1<em>$2</em>");
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
    return s;
  }
  function mdLite(src) {
    var lines = String(src || "").split("\n"), out = [], i = 0;
    var isBullet = function (l) { return /^\s*[-*•]\s+/.test(l); };
    var isNum = function (l) { return /^\s*\d+[.)]\s+/.test(l); };
    var isHead = function (l) { return /^#{1,4}\s+/.test(l); };
    while (i < lines.length) {
      var l = lines[i];
      if (/^```/.test(l)) { var code = []; i++; while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]); i++; out.push("<pre>" + esc(code.join("\n")) + "</pre>"); continue; }
      if (/^\s*$/.test(l)) { i++; continue; }
      if (isHead(l)) { out.push("<h4>" + inline(l.replace(/^#{1,4}\s+/, "")) + "</h4>"); i++; continue; }
      if (isBullet(l)) { var ul = []; while (i < lines.length && isBullet(lines[i])) ul.push("<li>" + inline(lines[i++].replace(/^\s*[-*•]\s+/, "")) + "</li>"); out.push("<ul>" + ul.join("") + "</ul>"); continue; }
      if (isNum(l)) { var ol = []; while (i < lines.length && isNum(lines[i])) ol.push("<li>" + inline(lines[i++].replace(/^\s*\d+[.)]\s+/, "")) + "</li>"); out.push("<ol>" + ol.join("") + "</ol>"); continue; }
      var p = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^```/.test(lines[i]) && !isHead(lines[i]) && !isBullet(lines[i]) && !isNum(lines[i])) p.push(lines[i++]);
      out.push("<p>" + p.map(inline).join("<br>") + "</p>");
    }
    return out.join("");
  }

  /* ---------- Contexte : le module ouvert, en texte brut ---------- */
  function strip(html) { return String(html).replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim(); }
  function moduleText(m) {
    var parts = ["MODULE : " + m.title + "\n" + m.tagline];
    m.lessons.forEach(function (l, i) { parts.push("LEÇON " + (i + 1) + " — " + l.title + "\n" + strip(l.html)); });
    if (m.glossary.length) parts.push("DÉFINITIONS\n" + m.glossary.map(function (g) { return "- " + g.term + " : " + strip(g.def); }).join("\n"));
    if (m.formulas.length) parts.push("FORMULES\n" + m.formulas.map(function (f) { return "- " + f.name + " : " + f.f + (f.note ? " (" + strip(f.note) + ")" : ""); }).join("\n"));
    if (m.notes) parts.push("NOTES DE L'ÉTUDIANT\n" + strip(m.notes));
    return parts.join("\n\n").slice(0, 60000);
  }

  /* ---------- Rendu ---------- */
  var root = document.createElement("div");
  root.id = "chat";
  document.body.appendChild(root);

  function sourcesHtml(sources) {
    if (!sources || !sources.length) return "";
    return '<div class="msg-sources">' + sources.map(function (s) {
      var host = ""; try { host = new URL(s.url).hostname.replace(/^www\./, ""); } catch (e) {}
      return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener" title="' + esc(s.title || s.url) + '">' + esc(s.title ? s.title.slice(0, 48) : host) + '</a>';
    }).join("") + "</div>";
  }
  function messageHtml(msg) {
    return '<div class="msg ' + msg.role + '"><div class="msg-body">' + (msg.role === "user" ? esc(msg.content).replace(/\n/g, "<br>") : mdLite(msg.content)) + '</div>' + sourcesHtml(msg.sources) + '</div>';
  }

  function render() {
    var m = API.currentModule();
    var configured = !!serviceUrl();
    var html = '<button class="chat-fab" data-chat-toggle aria-label="' + esc(NAME) + '">' + ICON + '<span>' + esc(NAME) + '</span></button>';
    if (chat.open) {
      var body;
      if (!chat.messages.length && !chat.busy) {
        body = '<div class="chat-empty"><p>Pose ta question sur le cours, un exercice ou un point d\'actualité. ' + (m ? 'Je connais le contenu du module ouvert.' : 'Ouvre un module pour que je m\'appuie sur son contenu.') + '</p>' +
          '<div class="chat-suggest">' + SUGGESTIONS.map(function (s) { return '<button data-chat-suggest>' + esc(s) + '</button>'; }).join("") + '</div></div>';
      } else {
        body = chat.messages.map(messageHtml).join("");
        if (chat.busy) body += '<div class="msg assistant" id="chat-live"><div class="msg-status"><i></i><span>' + esc(chat.status || "Réflexion…") + '</span></div><div class="msg-body">' + mdLite(chat.live ? chat.live.content : "") + '</div></div>';
      }
      var settings = (chat.showSettings || !chat.code || !configured)
        ? '<div class="chat-settings">' +
            (!configured ? '<label>Adresse du service<input type="url" data-chat-url value="' + esc(chat.customUrl) + '" placeholder="https://….workers.dev"></label>' : '') +
            '<label>Code d\'accès (donné par le professeur)<input type="password" data-chat-code value="' + esc(chat.code) + '" autocomplete="off"></label>' +
            '<div><button class="btn sm" data-chat-save>Enregistrer</button></div></div>'
        : '';
      html += '<aside class="chat-drawer" role="dialog" aria-label="' + esc(NAME) + '">' +
        '<div class="chat-head">' + ICON + '<h2>' + esc(NAME) + '</h2>' +
          '<button class="chat-iconbtn" data-chat-new title="Nouvelle conversation">↺</button>' +
          '<button class="chat-iconbtn" data-chat-settings title="Réglages">⚙</button>' +
          '<button class="chat-iconbtn" data-chat-toggle title="Fermer">✕</button></div>' +
        '<div class="chat-ctx">' + (m ? 'Contexte · ' + esc(m.title) : 'Contexte · aucun module ouvert') + '</div>' +
        '<div class="chat-body" id="chat-body">' + body + '</div>' +
        (chat.error ? '<div class="chat-error">' + esc(chat.error) + '</div>' : '') +
        settings +
        '<div class="chat-foot"><textarea data-chat-input rows="1" placeholder="Ta question…" ' + (chat.busy ? 'disabled' : '') + '>' + esc(chat.draft) + '</textarea>' +
          '<button class="btn acc" data-chat-send ' + (chat.busy ? 'disabled' : '') + '>Envoyer</button></div>' +
      '</aside>';
    }
    root.innerHTML = html;
    scrollBottom();
    if (chat.open && !chat.busy) { var ta = root.querySelector("[data-chat-input]"); if (ta) { ta.focus(); autosize(ta); } }
  }
  function scrollBottom() { var b = root.querySelector("#chat-body"); if (b) b.scrollTop = b.scrollHeight; }
  function autosize(ta) { ta.style.height = "auto"; ta.style.height = Math.min(140, ta.scrollHeight) + "px"; }

  var liveTimer = null;
  function updateLive() {
    if (liveTimer) return;
    liveTimer = requestAnimationFrame(function () {
      liveTimer = null;
      var el = root.querySelector("#chat-live");
      if (!el) return;
      el.querySelector(".msg-status span").textContent = chat.status || (chat.live && chat.live.content ? "" : "Réflexion…");
      el.querySelector(".msg-status").style.display = chat.status ? "" : "none";
      el.querySelector(".msg-body").innerHTML = mdLite(chat.live.content);
      scrollBottom();
    });
  }

  /* ---------- Échange avec le relais ---------- */
  function readSSE(body, onEvent) {
    var reader = body.getReader(), decoder = new TextDecoder(), buffer = "";
    return reader.read().then(function step(r) {
      if (r.done) return;
      buffer += decoder.decode(r.value, { stream: true });
      var chunks = buffer.split("\n\n");
      buffer = chunks.pop();
      chunks.forEach(function (c) {
        c.split("\n").forEach(function (line) {
          if (line.indexOf("data: ") === 0) { try { onEvent(JSON.parse(line.slice(6))); } catch (e) {} }
        });
      });
      return reader.read().then(step);
    });
  }

  function onEvent(ev) {
    if (ev.type === "error") throw new Error(ev.message || "Erreur du service");
    if (ev.type === "content_block_start") {
      var b = ev.content_block || {};
      if (b.type === "server_tool_use") { chat.status = "Recherche sur le web…"; chat.live.partialJson = ""; }
      else if (b.type === "web_search_tool_result") {
        chat.status = "Lecture des résultats…";
        (Array.isArray(b.content) ? b.content : []).forEach(function (r) {
          if (r.url && !chat.live.sources.some(function (s) { return s.url === r.url; })) chat.live.sources.push({ url: r.url, title: r.title || "" });
        });
      }
      else if (b.type === "text") chat.status = "";
      updateLive();
    } else if (ev.type === "content_block_delta") {
      var d = ev.delta || {};
      if (d.type === "text_delta") { chat.live.content += d.text; chat.status = ""; updateLive(); }
      else if (d.type === "input_json_delta") {
        chat.live.partialJson = (chat.live.partialJson || "") + d.partial_json;
        var q = chat.live.partialJson.match(/"query"\s*:\s*"([^"]{3,})/);
        if (q) { chat.status = "Recherche sur le web : " + q[1]; updateLive(); }
      }
    } else if (ev.type === "message_delta") {
      var stop = ev.delta && ev.delta.stop_reason;
      if (stop === "max_tokens") chat.live.content += "\n\n*(réponse tronquée : pose une question plus précise)*";
      if (stop === "refusal") chat.error = "L'assistant a décliné cette demande.";
    }
  }

  function send(text) {
    text = String(text || "").trim();
    if (!text || chat.busy) return;
    if (!serviceUrl()) { chat.showSettings = true; chat.error = "Le service de l'assistant n'est pas encore configuré."; render(); return; }
    if (!chat.code) { chat.showSettings = true; chat.error = "Entre d'abord le code d'accès."; render(); return; }
    chat.messages.push({ role: "user", content: text });
    chat.draft = ""; chat.busy = true; chat.status = "Réflexion…"; chat.error = ""; chat.showSettings = false;
    chat.live = { content: "", sources: [] };
    render();
    var m = API.currentModule();
    var payload = {
      code: chat.code,
      messages: chat.messages.map(function (x) { return { role: x.role, content: x.content }; }),
      context: m ? { title: m.title, text: moduleText(m) } : { title: "", text: "" }
    };
    fetch(serviceUrl() + "/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (res) {
        if (!res.ok) {
          return res.json().catch(function () { return {}; }).then(function (j) {
            if (res.status === 401) chat.showSettings = true;
            throw new Error(j.message || ("Le service a répondu " + res.status + "."));
          });
        }
        return readSSE(res.body, onEvent);
      })
      .catch(function (e) { chat.error = e.message || "Connexion impossible au service."; })
      .then(function () {
        var reply = chat.live ? chat.live.content.trim() : "";
        if (reply) chat.messages.push({ role: "assistant", content: reply, sources: chat.live.sources });
        else if (!chat.error) chat.error = "Réponse vide. Réessaie.";
        chat.busy = false; chat.status = ""; chat.live = null;
        render();
      });
  }

  /* ---------- Événements ---------- */
  root.addEventListener("click", function (e) {
    var t = e.target, el;
    if ((el = t.closest("[data-chat-toggle]"))) { chat.open = !chat.open; render(); return; }
    if ((el = t.closest("[data-chat-new]"))) { if (!chat.busy) { chat.messages = []; chat.error = ""; render(); } return; }
    if ((el = t.closest("[data-chat-settings]"))) { chat.showSettings = !chat.showSettings; render(); return; }
    if ((el = t.closest("[data-chat-save]"))) {
      var c = root.querySelector("[data-chat-code]"), u = root.querySelector("[data-chat-url]");
      chat.code = c ? c.value.trim() : chat.code;
      if (u) chat.customUrl = u.value.trim();
      saveLocal(); chat.showSettings = false; chat.error = ""; render(); return;
    }
    if ((el = t.closest("[data-chat-suggest]"))) { send(el.textContent); return; }
    if ((el = t.closest("[data-chat-send]"))) { var ta = root.querySelector("[data-chat-input]"); send(ta ? ta.value : ""); return; }
  });
  root.addEventListener("input", function (e) {
    var ta = e.target.closest("[data-chat-input]");
    if (ta) { chat.draft = ta.value; autosize(ta); }
  });
  root.addEventListener("keydown", function (e) {
    if (e.target.closest("[data-chat-input]") && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e.target.value); }
    if (e.key === "Escape" && chat.open) { chat.open = false; render(); }
  });

  render();
  API.onRender(function () { var c = root.querySelector(".chat-ctx"); var m = API.currentModule(); if (c) c.textContent = m ? "Contexte · " + m.title : "Contexte · aucun module ouvert"; });
})();
