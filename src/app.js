(function () {
  "use strict";

  var STORAGE_KEY = "salle-etude-progress-v2";
  var LEGACY_KEY = "salle-etude-progress-v1";
  var PREF_KEY = "salle-etude-prefs-v1";

  var PRIO_LABEL = CONFIG.priorites || { 1: "Priorité 1", 2: "Priorité 2", 3: "Priorité 3" };
  /* Groupes (semestres) dans l'ordre d'apparition des modules */
  function codes() { var seen = []; MODULES.forEach(function (m) { if (seen.indexOf(m.code) === -1) seen.push(m.code); }); return seen; }
  function groupLabel(c) { return (CONFIG.groupes && CONFIG.groupes[c]) || c; }

  var ICONS = {
    home: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg>',
    sigma: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 5H6l7 7-7 7h12"/></svg>',
    book: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
  };

  function getModule(id) {
    for (var i = 0; i < MODULES.length; i++) if (MODULES[i].id === id) return MODULES[i];
    return null;
  }
  function moduleIndex(m) { return MODULES.indexOf(m) + 1; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function hue(m) { return m.hue || 185; }
  function brandMark() { return CONFIG.logo ? '<img src="' + CONFIG.logo + '" alt="">' : esc(CONFIG.sigle || "SÉ"); }

  function emptyModuleProgress(m) {
    return {
      lessonsRead: m.lessons.map(function () { return false; }),
      exercisesDone: m.exercises.map(function () { return false; }),
      quizBest: null,
      termsKnown: {},
      formulasKnown: {}
    };
  }
  function defaultProgress() {
    var p = {};
    MODULES.forEach(function (m) { p[m.id] = emptyModuleProgress(m); });
    return p;
  }

  var LEGACY_MAP = {
    risques: { lessons: [0, 2, 3, 4, 5], exercises: [0, 1, 3] },
    tresorerie: { lessons: [0, 1, 2, 4, 6], exercises: [2, 1, 0, 3] }
  };
  function migrateLegacy(base) {
    try {
      var raw = localStorage.getItem(LEGACY_KEY);
      if (!raw) return base;
      var old = JSON.parse(raw);
      Object.keys(LEGACY_MAP).forEach(function (id) {
        if (!old[id] || !base[id]) return;
        var map = LEGACY_MAP[id];
        (old[id].lessonsRead || []).forEach(function (v, i) { if (v && map.lessons[i] !== undefined) base[id].lessonsRead[map.lessons[i]] = true; });
        (old[id].exercisesDone || []).forEach(function (v, i) { if (v && map.exercises[i] !== undefined) base[id].exercisesDone[map.exercises[i]] = true; });
        if (old[id].quizBest) base[id].quizBest = old[id].quizBest;
      });
    } catch (e) {}
    return base;
  }
  function normalizeProgress(parsed) {
    var base = defaultProgress();
    if (!parsed || typeof parsed !== "object") return base;
    MODULES.forEach(function (m) {
      var src = parsed[m.id];
      if (!src) return;
      var dst = base[m.id];
      dst.lessonsRead = m.lessons.map(function (_, i) { return !!(src.lessonsRead && src.lessonsRead[i]); });
      dst.exercisesDone = m.exercises.map(function (_, i) { return !!(src.exercisesDone && src.exercisesDone[i]); });
      dst.quizBest = (src.quizBest && typeof src.quizBest.score === "number") ? { score: src.quizBest.score, total: src.quizBest.total || m.quiz.length } : null;
      dst.termsKnown = src.termsKnown || {};
      dst.formulasKnown = src.formulasKnown || {};
    });
    return base;
  }
  /* Union of two progress sets: nothing learned on either device is ever lost. */
  function mergeProgress(a, b) {
    var out = defaultProgress();
    MODULES.forEach(function (m) {
      var pa = a[m.id], pb = b[m.id], po = out[m.id];
      po.lessonsRead = m.lessons.map(function (_, i) { return !!(pa.lessonsRead[i] || pb.lessonsRead[i]); });
      po.exercisesDone = m.exercises.map(function (_, i) { return !!(pa.exercisesDone[i] || pb.exercisesDone[i]); });
      var qa = pa.quizBest, qb = pb.quizBest;
      po.quizBest = !qa ? qb : !qb ? qa : (qb.score > qa.score ? qb : qa);
      po.termsKnown = {}; po.formulasKnown = {};
      Object.keys(pa.termsKnown).concat(Object.keys(pb.termsKnown)).forEach(function (k) { if (pa.termsKnown[k] || pb.termsKnown[k]) po.termsKnown[k] = true; });
      Object.keys(pa.formulasKnown).concat(Object.keys(pb.formulasKnown)).forEach(function (k) { if (pa.formulasKnown[k] || pb.formulasKnown[k]) po.formulasKnown[k] = true; });
    });
    return out;
  }
  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return migrateLegacy(defaultProgress());
      return normalizeProgress(JSON.parse(raw));
    } catch (e) { return defaultProgress(); }
  }
  function saveLocal() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress)); } catch (e) {} }
  function saveProgress() { saveLocal(); pushRemote(); }
  function loadPrefs() { try { var raw = localStorage.getItem(PREF_KEY); return raw ? JSON.parse(raw) : {}; } catch (e) { return {}; } }
  function savePrefs() { try { localStorage.setItem(PREF_KEY, JSON.stringify({ cardMode: state.cardMode, lastModule: state.lastModule, ambiance: state.ambiance, theme: state.theme })); } catch (e) {} }

  /* ---------- Sync with the artifact store: progress follows the user across devices ---------- */
  var sync = { ref: null, status: "local", timer: null, last: "" };
  var SYNC_DOC = "salle/progress";
  function syncLabel() {
    return sync.status === "synced" ? "Progression synchronisée sur tous tes appareils"
      : sync.status === "syncing" ? "Synchronisation…"
      : sync.status === "error" ? "Synchronisation indisponible · sauvegarde sur cet appareil"
      : "Progression sauvegardée sur cet appareil";
  }
  function syncCopy() {
    return sync.status === "synced" || sync.status === "syncing"
      ? "Tout ce que tu fais ici est sauvegardé et retrouvé sur tous tes appareils."
      : "Tout ce que tu fais ici est sauvegardé sur cet appareil.";
  }
  function setSync(status) {
    if (sync.status === status) return;
    sync.status = status;
    var el = document.querySelector("[data-sync]");
    if (el) { el.setAttribute("data-sync", status); el.lastChild.nodeValue = syncLabel(); }
    var copy = document.querySelector("[data-sync-copy]");
    if (copy) copy.textContent = syncCopy();
  }
  function remotePayload() { return { v: 2, progress: state.progress, updatedAt: new Date().toISOString() }; }
  function pushRemote() {
    if (!sync.ref) return;
    clearTimeout(sync.timer);
    sync.timer = setTimeout(function () {
      var body = remotePayload();
      sync.last = JSON.stringify(body.progress);
      setSync("syncing");
      sync.ref.set(body).then(function () { setSync("synced"); }).catch(function (e) {
        if (e && e.code === "unavailable") {
          setTimeout(function () {
            sync.ref.set(remotePayload()).then(function () { setSync("synced"); }).catch(function () { setSync("error"); });
          }, 800 + Math.random() * 700);
        } else setSync("error");
      });
    }, 350);
  }
  function applyRemote(data) {
    if (!data || !data.progress) return;
    var remote = normalizeProgress(data.progress);
    var incoming = JSON.stringify(remote);
    if (incoming === sync.last || incoming === JSON.stringify(state.progress)) return;
    state.progress = mergeProgress(state.progress, remote);
    sync.last = JSON.stringify(state.progress);
    saveLocal();
    render();
  }
  function initSync() {
    if (!window.claude || typeof window.claude.use !== "function") return;
    var p;
    try { p = window.claude.use("db"); } catch (e) { return; }
    Promise.resolve(p).then(function (db) {
      if (!db) return;
      sync.ref = db.doc(SYNC_DOC);
      return sync.ref.get().then(function (snap) {
        var remote = snap.exists ? normalizeProgress((snap.data() || {}).progress) : defaultProgress();
        var merged = mergeProgress(state.progress, remote);
        var mergedStr = JSON.stringify(merged), remoteStr = JSON.stringify(remote);
        if (mergedStr !== JSON.stringify(state.progress)) { state.progress = merged; saveLocal(); render(); }
        sync.last = mergedStr;
        if (!snap.exists || mergedStr !== remoteStr) return sync.ref.set(remotePayload());
      }).then(function () {
        setSync("synced");
        sync.ref.onSnapshot(function (snap) {
          if (snap.exists && !snap.metadata.hasPendingWrites) applyRemote(snap.data());
        }, function () { setSync("error"); });
      });
    }).catch(function () { setSync("error"); });
  }

  var prefs = loadPrefs();
  var state = {
    progress: loadProgress(),
    view: "home",
    moduleId: null,
    tab: "cours",
    cardMode: prefs.cardMode || { definitions: false, formules: false },
    ambiance: prefs.ambiance || CONFIG.ambiance || "neutre",
    theme: prefs.theme || CONFIG.theme || "auto",
    flipped: {},
    quizSubmitted: {},
    quizAnswers: {},
    revealed: {},
    resetArmed: false,
    search: "",
    lastModule: prefs.lastModule || null,
    navOpen: false,
    scrollTop: false
  };

  function pct(n, d) { return d === 0 ? 0 : Math.round((n / d) * 100); }
  function countTrue(arr) { return arr.filter(Boolean).length; }
  function countKeys(obj) { return Object.keys(obj).filter(function (k) { return obj[k]; }).length; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

  function moduleStats(m) {
    var pr = state.progress[m.id];
    var lessons = countTrue(pr.lessonsRead);
    var ex = countTrue(pr.exercisesDone);
    var cards = countKeys(pr.termsKnown) + countKeys(pr.formulasKnown);
    var cardsTotal = m.glossary.length + m.formulas.length;
    var quizPct = pr.quizBest ? pct(pr.quizBest.score, pr.quizBest.total) : 0;
    var overall = Math.round((pct(lessons, m.lessons.length) + pct(ex, m.exercises.length) + pct(cards, cardsTotal) + quizPct) / 4);
    return { lessons: lessons, ex: ex, cards: cards, cardsTotal: cardsTotal, quizBest: pr.quizBest, overall: overall };
  }
  function globalPct() { return Math.round(MODULES.reduce(function (a, m) { return a + moduleStats(m).overall; }, 0) / MODULES.length); }

  function ring(p, cls) {
    var r = 10.5, c = 2 * Math.PI * r;
    return '<svg class="' + (cls || "ring") + '" viewBox="0 0 26 26" aria-hidden="true"><circle class="bg" cx="13" cy="13" r="' + r + '"/><circle class="fg" cx="13" cy="13" r="' + r + '" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + (c * (1 - p / 100)).toFixed(2) + '"/></svg>';
  }
  function bigRing(p) {
    var r = 34, c = 2 * Math.PI * r;
    return '<svg class="bigring" viewBox="0 0 84 84" aria-label="Progression ' + p + ' %"><circle class="bg" cx="42" cy="42" r="' + r + '"/><circle class="fg" cx="42" cy="42" r="' + r + '" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + (c * (1 - p / 100)).toFixed(2) + '"/><text x="42" y="42">' + p + '%</text></svg>';
  }
  function toggleBtn(on, attr, labelOn, labelOff) {
    return '<button class="toggle' + (on ? ' on' : '') + '" ' + attr + '><span class="box">' + ICONS.check + '</span>' + (on ? labelOn : labelOff) + '</button>';
  }

  /* ---------- Sidebar ---------- */

  function renderSidebar() {
    var modItems = function (code) {
      return MODULES.filter(function (m) { return m.code === code; }).map(function (m) {
        var st = moduleStats(m);
        var active = state.view === "module" && state.moduleId === m.id;
        return '<button class="mod-item hued' + (active ? ' active' : '') + '" style="--h:' + hue(m) + '" data-open-module="' + m.id + '">' +
          '<span class="n">' + pad(moduleIndex(m)) + '</span><span class="name">' + m.title + '</span>' + ring(st.overall) + '</button>';
      }).join("");
    };
    var g = globalPct();
    return '<aside class="sidebar' + (state.navOpen ? ' open' : '') + '" id="sidebar">' +
      '<div class="brand"><div class="mark">' + brandMark() + '</div><div><div class="t">' + esc(CONFIG.titre) + '</div><div class="s">' + esc(CONFIG.sousTitre || "") + '</div></div></div>' +
      '<div class="side-search">' + ICONS.search + '<input type="search" placeholder="Chercher un terme, une formule…" value="' + esc(state.search) + '" data-search="1" aria-label="Rechercher"></div>' +
      '<div class="side-group">' +
        '<button class="nav-item' + (state.view === "home" ? ' active' : '') + '" data-go="home">' + ICONS.home + 'Accueil</button>' +
        '<button class="nav-item' + (state.view === "formulaire" ? ' active' : '') + '" data-go="formulaire">' + ICONS.sigma + 'Formulaire complet</button>' +
        '<button class="nav-item' + (state.view === "glossaire" ? ' active' : '') + '" data-go="glossaire">' + ICONS.book + 'Glossaire complet</button>' +
      '</div>' +
      codes().map(function (c) { return '<div class="side-group"><div class="side-label">' + esc(groupLabel(c)) + '</div>' + modItems(c) + '</div>'; }).join("") +
      '<div class="side-foot"><div>Avancement global · <b class="mono">' + g + ' %</b></div><div class="bar"><span style="width:' + g + '%"></span></div>' +
        '<div class="sync" data-sync="' + sync.status + '"><i></i>' + syncLabel() + '</div>' +
        '<button class="btn ghost sm" data-theme-toggle="1" style="justify-content:center">' + ({ auto: "Thème : automatique", light: "Thème : clair", dark: "Thème : sombre" })[state.theme] + '</button>' +
        '<button class="btn ghost sm" data-ambiance="1" style="justify-content:center">' + (state.ambiance === "lofi" ? "Ambiance lofi ✓" : "Ambiance lofi") + '</button>' +
        '<button class="btn ghost sm" data-reset="1" style="justify-content:center">' + (state.resetArmed ? "Confirmer la réinitialisation" : "Réinitialiser ma progression") + '</button></div>' +
    '</aside>';
  }

  function renderTopbar() {
    return '<div class="topbar"><div class="brand"><div class="mark">' + brandMark() + '</div><div><div class="t">' + esc(CONFIG.titre) + '</div></div></div>' +
      '<button class="menu-btn" data-nav-toggle="1" aria-label="Menu">' + ICONS.menu + '</button></div>';
  }

  /* ---------- Home ---------- */

  function renderModuleCard(m) {
    var st = moduleStats(m);
    var quizText = st.quizBest ? (st.quizBest.score + "/" + st.quizBest.total) : "—";
    return '<button class="mcard hued" style="--h:' + hue(m) + '" data-open-module="' + m.id + '">' +
      '<div class="row"><span class="n">' + pad(moduleIndex(m)) + '</span><span class="chip' + (m.priority === 1 ? ' p1' : '') + '">' + PRIO_LABEL[m.priority] + '</span></div>' +
      '<h3>' + m.title + '</h3><p>' + m.tagline + '</p>' +
      '<div class="stats"><span class="st">Cours <b>' + st.lessons + '/' + m.lessons.length + '</b></span><span class="st">Cartes <b>' + st.cards + '/' + st.cardsTotal + '</b></span><span class="st">Quiz <b>' + quizText + '</b></span><span class="st">Exos <b>' + st.ex + '/' + m.exercises.length + '</b></span></div>' +
      '<div class="bar"><span style="width:' + st.overall + '%"></span></div>' +
    '</button>';
  }

  function renderHome() {
    var g = globalPct();
    var strip = MODULES.map(function (m) {
      return '<button class="hued" style="--h:' + hue(m) + ';--w:' + moduleStats(m).overall + '%" data-open-module="' + m.id + '" title="' + esc(m.title) + '"><i></i><span>' + pad(moduleIndex(m)) + '</span></button>';
    }).join("");
    var last = state.lastModule ? getModule(state.lastModule) : null;
    var resume = last ? '<button class="resume hued" style="--h:' + hue(last) + '" data-open-module="' + last.id + '"><div><div class="l">Reprendre</div><div class="n">' + pad(moduleIndex(last)) + '</div></div><div><div class="t">' + last.title + '</div><div class="go">' + moduleStats(last).overall + ' % complété · continuer là où tu t\'es arrêté</div></div><div class="go">→</div></button>' : "";
    var grid = function (code) { return '<div class="grid2">' + MODULES.filter(function (m) { return m.code === code; }).map(renderModuleCard).join("") + '</div>'; };

    return '<div class="home-hero"><div><h1>' + CONFIG.accueilTitre + '</h1><p>' + CONFIG.accueilTexte + ' <span data-sync-copy>' + syncCopy() + '</span></p></div>' +
      '<div class="big-pct"><div class="v">' + g + '<span style="font-size:0.5em">%</span></div><div class="l">Avancement global</div></div></div>' +
      '<div class="strip">' + strip + '</div>' + resume +
      codes().map(function (c) { var n = MODULES.filter(function (m) { return m.code === c; }).length; return '<div class="sem-head"><h2>' + esc(groupLabel(c)) + '</h2><span>' + n + ' module' + (n > 1 ? 's' : '') + '</span></div>' + grid(c); }).join("") +
      '<div class="foot"><span>' + (CONFIG.pied || "") + '</span></div>';
  }

  /* ---------- Module ---------- */

  function renderSeg(m) {
    var st = moduleStats(m), pr = state.progress[m.id];
    var tabs = [
      ["cours", "Cours", st.lessons + "/" + m.lessons.length],
      ["definitions", "Définitions", countKeys(pr.termsKnown) + "/" + m.glossary.length],
      ["formules", "Formules", countKeys(pr.formulasKnown) + "/" + m.formulas.length],
      ["evaluation", "Quiz", st.quizBest ? st.quizBest.score + "/" + st.quizBest.total : "—"],
      ["exercices", "Exercices", st.ex + "/" + m.exercises.length],
      ["notes", "Notes", m.notes ? "✎" : "—"]
    ];
    return '<div class="seg" role="tablist">' + tabs.map(function (t) {
      return '<button role="tab" class="' + (state.tab === t[0] ? 'active' : '') + '" data-tab="' + t[0] + '">' + t[1] + '<span class="c">' + t[2] + '</span></button>';
    }).join("") + '</div>';
  }

  function renderCours(m) {
    var pr = state.progress[m.id];
    return m.lessons.map(function (lesson, i) {
      var read = pr.lessonsRead[i];
      return '<article class="lesson"><div class="lesson-head"><span class="n">' + pad(i + 1) + '</span><h3>' + lesson.title + '</h3>' +
        toggleBtn(read, 'data-lesson-toggle="' + i + '"', 'Lu', 'Marquer comme lu') + '</div>' +
        '<div class="lesson-body">' + lesson.html + '</div></article>';
    }).join("");
  }

  function renderCards(m, kind) {
    var isDef = kind === "definitions";
    var items = isDef ? m.glossary : m.formulas;
    var known = isDef ? state.progress[m.id].termsKnown : state.progress[m.id].formulasKnown;
    var cardMode = !!state.cardMode[kind];
    var knownCount = countKeys(known);

    var bar = '<div class="toolbar"><span class="hint">' + (isDef
        ? "Chaque terme avec sa définition. En mode cartes, réponds de tête, révèle, puis coche « Je maîtrise »."
        : "Les formules et repères à connaître par cœur. En mode cartes, seul le nom apparaît : retrouve la formule, puis révèle.") + '</span>' +
      '<div class="right"><button class="pill' + (cardMode ? ' on' : '') + '" data-cardmode="' + kind + '">' + (cardMode ? 'Mode cartes ✓' : 'Mode cartes') + '</button>' +
      (cardMode ? '<button class="pill" data-flip-all="' + kind + '">Tout révéler</button>' : '') +
      '<span class="mono" style="font-size:0.76rem;color:var(--ink-3)">' + knownCount + '/' + items.length + ' maîtrisées</span></div></div>';

    var list = items.map(function (it, i) {
      var key = kind + ":" + i;
      var isKnown = !!known[i];
      var flipped = !!(state.flipped[m.id] && state.flipped[m.id][key]);
      var face;
      if (cardMode && !flipped) {
        face = '<button class="front" data-flip="' + key + '"><span><b>?</b><span>Révéler ' + (isDef ? 'la définition' : 'la formule') + '</span></span></button>';
      } else if (isDef) {
        face = '<div class="def">' + it.def + '</div>';
      } else {
        face = '<div class="f">' + esc(it.f) + '</div>' + (it.note ? '<div class="note">' + it.note + '</div>' : '');
      }
      return '<div class="fc' + (isKnown ? ' known' : '') + '"><div class="top"><div class="term' + (isDef ? '' : ' mono') + '">' + (isDef ? it.term : it.name) + '</div>' +
        toggleBtn(isKnown, 'data-known="' + key + '"', 'Maîtrisée', 'Je maîtrise') + '</div>' + face + '</div>';
    }).join("");

    return bar + '<div class="cards">' + list + '</div>';
  }

  function renderEvaluation(m) {
    var submitted = !!state.quizSubmitted[m.id];
    var answers = state.quizAnswers[m.id] || {};
    var pr = state.progress[m.id];
    var letters = ["A", "B", "C", "D"];

    var bar = '<div class="qbar"><div>' + m.quiz.length + ' questions, une réponse par question. Chaque question est expliquée après correction.</div>' +
      '<div class="best"><div class="v">' + (pr.quizBest ? pr.quizBest.score + '/' + pr.quizBest.total : '—') + '</div><div class="l">Meilleur score</div></div></div>';

    var result = "";
    if (submitted) {
      var score = 0;
      m.quiz.forEach(function (q, i) { if (answers[i] === q.correct) score++; });
      var verdict = score === m.quiz.length ? "Sans faute. Passe aux exercices ou au module suivant." : score >= m.quiz.length * 0.75 ? "Solide. Relis les explications des questions manquées." : score >= m.quiz.length * 0.5 ? "À retravailler : reprends les leçons concernées avant de refaire le quiz." : "Reprends le cours en entier, puis refais le quiz.";
      result = '<div class="qresult"><div class="v">' + score + '/' + m.quiz.length + '</div><div class="m">' + verdict + '</div></div>';
    }

    var qs = m.quiz.map(function (q, i) {
      var sel = answers[i];
      var opts = q.options.map(function (opt, oi) {
        var cls = "opt";
        if (submitted) { if (oi === q.correct) cls += " correct"; else if (oi === sel) cls += " incorrect"; }
        else if (sel === oi) cls += " sel";
        return '<label class="' + cls + '"><input type="radio" name="q-' + m.id + '-' + i + '" value="' + oi + '" ' + (sel === oi ? 'checked' : '') + (submitted ? ' disabled' : '') + ' data-quiz-answer="' + m.id + ':' + i + ':' + oi + '"><span class="letter">' + letters[oi] + '</span><span>' + opt + '</span></label>';
      }).join("");
      var explain = "";
      if (submitted) {
        var ok = sel === q.correct;
        explain = '<div class="qx' + (ok ? '' : ' ko') + '"><span class="tag">' + (ok ? 'Correct' : (sel === undefined ? 'Sans réponse' : 'Incorrect')) + '</span>' + q.explain + '</div>';
      }
      return '<div class="qq"><div class="qt"><span class="qn">' + pad(i + 1) + '</span><span>' + q.q + '</span></div><div class="opts">' + opts + '</div>' + explain + '</div>';
    }).join("");

    var action = submitted
      ? '<button class="btn ghost" data-quiz-retry="' + m.id + '">Refaire le quiz</button>'
      : '<button class="btn acc" data-quiz-submit="' + m.id + '">Corriger le quiz</button>';
    return bar + result + qs + action;
  }

  function renderExercices(m) {
    var pr = state.progress[m.id];
    return m.exercises.map(function (ex, i) {
      var done = pr.exercisesDone[i];
      var revealed = !!(state.revealed[m.id] && state.revealed[m.id][i]);
      return '<div class="ex"><div class="head"><span class="n">' + pad(i + 1) + '</span><h3>' + ex.title + '</h3>' + toggleBtn(done, 'data-ex-toggle="' + i + '"', 'Fait', 'Marquer comme fait') + '</div>' +
        '<p class="st">' + ex.statement + '</p>' +
        (revealed ? '<div class="sol"><span class="label">Solution</span><p>' + ex.solution + '</p></div><button class="btn ghost sm" data-ex-hide="' + i + '">Masquer la solution</button>'
                  : '<button class="btn ghost sm" data-ex-reveal="' + i + '">Voir la solution</button>') +
      '</div>';
    }).join("");
  }

  function renderNotes(m) {
    if (!m.notes) {
      return '<div class="notes-empty"><p>Pas encore de notes pour ce module.</p><p>Pour en ajouter : ouvre le fichier du module dans <code>content/modules/</code>, écris sous la section <code># Notes</code>, puis relance <code>npm run build</code>.</p></div>';
    }
    return '<article class="lesson"><div class="lesson-body notes">' + m.notes + '</div></article>';
  }

  function renderModule(m) {
    var body;
    switch (state.tab) {
      case "notes": body = renderNotes(m); break;
      case "definitions": body = renderCards(m, "definitions"); break;
      case "formules": body = renderCards(m, "formules"); break;
      case "evaluation": body = renderEvaluation(m); break;
      case "exercices": body = renderExercices(m); break;
      default: body = renderCours(m);
    }
    var st = moduleStats(m);
    return '<button class="back" data-go="home">← Tous les modules</button>' +
      '<div class="banner"><div><div class="chips"><span class="chip">' + m.code + '</span><span class="chip' + (m.priority === 1 ? ' p1' : ' acc') + '">' + PRIO_LABEL[m.priority] + '</span></div>' +
        '<h1>' + m.title + '</h1><p>' + m.tagline + '</p></div>' + bigRing(st.overall) + '<div class="wm">' + pad(moduleIndex(m)) + '</div></div>' +
      renderSeg(m) + '<div>' + body + '</div>';
  }

  /* ---------- Global pages ---------- */

  function renderGlobal(kind) {
    var isDef = kind === "glossaire";
    var groups = MODULES.map(function (m) {
      var items = isDef ? m.glossary : m.formulas;
      var known = isDef ? state.progress[m.id].termsKnown : state.progress[m.id].formulasKnown;
      var cards = items.map(function (it, i) {
        return '<div class="fc' + (known[i] ? ' known' : '') + '"><div class="top"><div class="term' + (isDef ? '' : ' mono') + '">' + (isDef ? it.term : it.name) + '</div><span class="mod">' + m.code + '</span></div>' +
          (isDef ? '<div class="def">' + it.def + '</div>' : '<div class="f">' + esc(it.f) + '</div>' + (it.note ? '<div class="note">' + it.note + '</div>' : '')) + '</div>';
      }).join("");
      return '<div class="hued" style="--h:' + hue(m) + '"><div class="ghead"><span class="n">' + pad(moduleIndex(m)) + '</span><h2>' + m.title + '</h2></div><div class="cards">' + cards + '</div></div>';
    }).join("");
    var total = MODULES.reduce(function (a, m) { return a + (isDef ? m.glossary.length : m.formulas.length); }, 0);
    return '<div class="ptitle"><h1>' + (isDef ? 'Glossaire complet' : 'Formulaire complet') + '</h1><p>' + total + (isDef ? ' définitions' : ' formules et repères') + ' regroupés par module, dans l\'ordre du programme. Pour une fiche papier avant l\'examen, imprime cette page.</p>' +
      '<div style="margin-top:0.9rem"><button class="btn ghost sm" data-print="1">Imprimer</button></div></div>' + groups;
  }

  function renderSearch() {
    var q = norm(state.search.trim());
    var hits = [];
    MODULES.forEach(function (m) {
      m.glossary.forEach(function (g) { if (norm(g.term + " " + g.def).indexOf(q) !== -1) hits.push({ k: "Définition", t: g.term, d: g.def, m: m, tab: "definitions" }); });
      m.formulas.forEach(function (f) { if (norm(f.name + " " + f.f + " " + (f.note || "")).indexOf(q) !== -1) hits.push({ k: "Formule", t: f.name, f: f.f, d: f.note || "", m: m, tab: "formules" }); });
      m.lessons.forEach(function (l) { var txt = l.html.replace(/<[^>]+>/g, " "); if (norm(l.title + " " + txt).indexOf(q) !== -1) hits.push({ k: "Leçon", t: l.title, d: "Dans le cours du module " + pad(moduleIndex(m)), m: m, tab: "cours" }); });
      if (m.notes && norm(m.notes.replace(/<[^>]+>/g, " ")).indexOf(q) !== -1) hits.push({ k: "Notes", t: "Notes du module " + pad(moduleIndex(m)), d: m.title, m: m, tab: "notes" });
    });
    var list = hits.slice(0, 60).map(function (h) {
      return '<div class="hit hued" style="--h:' + hue(h.m) + '"><div><div class="k">' + h.k + ' · module ' + pad(moduleIndex(h.m)) + '</div><div class="t">' + h.t + '</div></div>' +
        '<button class="go" data-open-module-tab="' + h.m.id + ':' + h.tab + '">Ouvrir →</button>' +
        (h.f ? '<div class="f">' + esc(h.f) + '</div>' : '') + (h.d ? '<div class="d">' + h.d + '</div>' : '') + '</div>';
    }).join("");
    return '<div class="ptitle"><h1>Recherche</h1><p>' + hits.length + ' résultat' + (hits.length > 1 ? 's' : '') + ' pour « ' + esc(state.search) + ' »' + (hits.length > 60 ? ' (60 affichés)' : '') + '.</p></div>' +
      (list || '<p class="empty">Rien trouvé. Essaie un autre mot-clé (ex. « BFR », « swap », « APA »).</p>');
  }

  /* ---------- Render ---------- */

  function render() {
    var app = document.getElementById("app");
    var main;
    var h = 185;
    if (state.view === "module") {
      var m = getModule(state.moduleId);
      if (m) { main = renderModule(m); h = hue(m); } else main = renderHome();
    } else if (state.view === "formulaire" || state.view === "glossaire") main = renderGlobal(state.view);
    else if (state.view === "search") main = renderSearch();
    else main = renderHome();

    document.body.classList.toggle("ambiance-lofi", state.ambiance === "lofi");
    if (state.theme === "light" || state.theme === "dark") document.documentElement.setAttribute("data-theme", state.theme);
    else document.documentElement.removeAttribute("data-theme");
    app.innerHTML = '<div class="app hued" style="--h:' + h + '">' + renderSidebar() +
      '<div style="min-width:0">' + renderTopbar() + (state.navOpen ? '<div class="scrim" data-nav-toggle="1"></div>' : '') +
      '<main class="main">' + main + '</main></div></div>';
    if (state.scrollTop) { window.scrollTo({ top: 0 }); state.scrollTop = false; }
  }

  function openModule(id, tab) {
    state.view = "module";
    state.moduleId = id;
    state.tab = tab || "cours";
    state.lastModule = id;
    state.navOpen = false;
    state.scrollTop = true;
    savePrefs();
    render();
  }

  var app = document.getElementById("app");

  app.addEventListener("click", function (e) {
    var t = e.target, el;

    if ((el = t.closest("[data-open-module-tab]"))) { var p = el.getAttribute("data-open-module-tab").split(":"); openModule(p[0], p[1]); return; }
    if ((el = t.closest("[data-open-module]"))) { openModule(el.getAttribute("data-open-module")); return; }
    if ((el = t.closest("[data-nav-toggle]"))) { state.navOpen = !state.navOpen; render(); return; }
    if ((el = t.closest("[data-go]"))) { state.view = el.getAttribute("data-go"); state.search = ""; state.resetArmed = false; state.navOpen = false; state.scrollTop = true; render(); return; }
    if ((el = t.closest("[data-tab]"))) { state.tab = el.getAttribute("data-tab"); render(); return; }

    if ((el = t.closest("[data-lesson-toggle]"))) { var li = parseInt(el.getAttribute("data-lesson-toggle"), 10); var pr = state.progress[state.moduleId]; pr.lessonsRead[li] = !pr.lessonsRead[li]; saveProgress(); render(); return; }
    if ((el = t.closest("[data-ex-toggle]"))) { var ei = parseInt(el.getAttribute("data-ex-toggle"), 10); var pr2 = state.progress[state.moduleId]; pr2.exercisesDone[ei] = !pr2.exercisesDone[ei]; saveProgress(); render(); return; }
    if ((el = t.closest("[data-ex-reveal]"))) { state.revealed[state.moduleId] = state.revealed[state.moduleId] || {}; state.revealed[state.moduleId][parseInt(el.getAttribute("data-ex-reveal"), 10)] = true; render(); return; }
    if ((el = t.closest("[data-ex-hide]"))) { state.revealed[state.moduleId] = state.revealed[state.moduleId] || {}; state.revealed[state.moduleId][parseInt(el.getAttribute("data-ex-hide"), 10)] = false; render(); return; }

    if ((el = t.closest("[data-cardmode]"))) { var kind = el.getAttribute("data-cardmode"); state.cardMode[kind] = !state.cardMode[kind]; state.flipped[state.moduleId] = {}; savePrefs(); render(); return; }
    if ((el = t.closest("[data-flip-all]"))) { var k2 = el.getAttribute("data-flip-all"); var m2 = getModule(state.moduleId); var items = k2 === "definitions" ? m2.glossary : m2.formulas; state.flipped[state.moduleId] = state.flipped[state.moduleId] || {}; items.forEach(function (_, i) { state.flipped[state.moduleId][k2 + ":" + i] = true; }); render(); return; }
    if ((el = t.closest("[data-flip]"))) { state.flipped[state.moduleId] = state.flipped[state.moduleId] || {}; state.flipped[state.moduleId][el.getAttribute("data-flip")] = true; render(); return; }
    if ((el = t.closest("[data-known]"))) { var parts = el.getAttribute("data-known").split(":"); var store = parts[0] === "definitions" ? state.progress[state.moduleId].termsKnown : state.progress[state.moduleId].formulasKnown; if (store[parts[1]]) delete store[parts[1]]; else store[parts[1]] = true; saveProgress(); render(); return; }

    if ((el = t.closest("[data-quiz-submit]"))) { var mid = el.getAttribute("data-quiz-submit"); var mq = getModule(mid); var answers = state.quizAnswers[mid] || {}; var score = 0; mq.quiz.forEach(function (q, i) { if (answers[i] === q.correct) score++; }); state.quizSubmitted[mid] = true; var pr3 = state.progress[mid]; if (!pr3.quizBest || score > pr3.quizBest.score) { pr3.quizBest = { score: score, total: mq.quiz.length }; saveProgress(); } state.scrollTop = true; render(); return; }
    if ((el = t.closest("[data-quiz-retry]"))) { var mid2 = el.getAttribute("data-quiz-retry"); state.quizSubmitted[mid2] = false; state.quizAnswers[mid2] = {}; state.scrollTop = true; render(); return; }

    if ((el = t.closest("[data-print]"))) { window.print(); return; }
    if ((el = t.closest("[data-theme-toggle]"))) { state.theme = state.theme === "auto" ? "dark" : state.theme === "dark" ? "light" : "auto"; savePrefs(); render(); return; }
    if ((el = t.closest("[data-ambiance]"))) { state.ambiance = state.ambiance === "lofi" ? "neutre" : "lofi"; savePrefs(); render(); return; }
    if ((el = t.closest("[data-reset]"))) {
      if (!state.resetArmed) { state.resetArmed = true; render(); }
      else { state.progress = defaultProgress(); state.resetArmed = false; state.quizSubmitted = {}; state.quizAnswers = {}; state.flipped = {}; saveProgress(); render(); }
      return;
    }
  });

  app.addEventListener("change", function (e) {
    var radio = e.target.closest("[data-quiz-answer]");
    if (radio) {
      var parts = radio.getAttribute("data-quiz-answer").split(":");
      var mid = parts[0], qi = parseInt(parts[1], 10), oi = parseInt(parts[2], 10);
      state.quizAnswers[mid] = state.quizAnswers[mid] || {};
      state.quizAnswers[mid][qi] = oi;
      // Light-touch: update selection styling without a full re-render (keeps scroll position).
      var lab = radio.closest("label");
      if (lab && lab.parentNode) {
        var sib = lab.parentNode.querySelectorAll(".opt");
        for (var i = 0; i < sib.length; i++) sib[i].classList.remove("sel");
        lab.classList.add("sel");
      }
    }
  });

  app.addEventListener("input", function (e) {
    var s = e.target.closest("[data-search]");
    if (s) {
      state.search = s.value;
      var pos = s.selectionStart;
      if (state.search.trim().length >= 2) state.view = "search";
      else if (state.view === "search") state.view = "home";
      render();
      var again = document.querySelector("[data-search]");
      if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (err) {} }
    }
  });

  render();
  initSync();
})();
