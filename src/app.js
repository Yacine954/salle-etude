function startApp() {
  "use strict";

  var STORAGE_KEY = "salle-etude-progress-v2";
  var LEGACY_KEY = "salle-etude-progress-v1";
  var PREF_KEY = "salle-etude-prefs-v1";
  var EXAM_KEY = "salle-etude-examens-v1";
  var NEWS_KEY = "salle-etude-nouveautes-v1";

  /* ---------- Dates (format AAAA-MM-JJ, en heure locale) ---------- */
  function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function todayISO() { return isoDate(new Date()); }
  function addDays(iso, n) { var p = iso.split("-"); var d = new Date(+p[0], +p[1] - 1, +p[2] + n); return isoDate(d); }
  function daysBetween(a, b) { var pa = a.split("-"), pb = b.split("-"); return Math.round((new Date(+pb[0], +pb[1] - 1, +pb[2]) - new Date(+pa[0], +pa[1] - 1, +pa[2])) / 86400000); }
  function frDate(iso, long) {
    var p = iso.split("-"); var d = new Date(+p[0], +p[1] - 1, +p[2]);
    if (!long) return p[2] + "/" + p[1] + "/" + p[0];
    var jours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    var mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    return jours[d.getDay()] + " " + d.getDate() + " " + mois[d.getMonth()] + (d.getFullYear() !== new Date().getFullYear() ? " " + d.getFullYear() : "");
  }

  var PRIO_LABEL = CONFIG.priorites || { 1: "Priorité 1", 2: "Priorité 2", 3: "Priorité 3" };
  /* Groupes (semestres) dans l'ordre d'apparition des modules */
  function codes() { var seen = []; MODULES.forEach(function (m) { if (seen.indexOf(m.code) === -1) seen.push(m.code); }); return seen; }
  function groupLabel(c) { return (CONFIG.groupes && CONFIG.groupes[c]) || c; }

  var ICONS = {
    home: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg>',
    sigma: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 5H6l7 7-7 7h12"/></svg>',
    scroll: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7"/><path d="M5 3a2 2 0 0 0-2 2v2h4V5a2 2 0 0 0-2-2z"/><path d="M7 21a2 2 0 0 1-2-2V7"/><path d="M11 8h6M11 12h6M11 16h4"/></svg>',
    book: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    cards: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="14" height="13" rx="2"/><path d="M7 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2"/></svg>',
    timer: '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6M12 2v3"/></svg>'
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
      formulasKnown: {},
      leitner: {}   // "definitions:3" → [boîte, à revoir le, dernière révision, créée le]
    };
  }
  function cleanLeitner(src) {
    var out = {};
    if (!src || typeof src !== "object") return out;
    Object.keys(src).forEach(function (k) {
      var e = src[k];
      if (!/^(definitions|formules):\d+$/.test(k) || !Array.isArray(e) || typeof e[0] !== "number") return;
      out[k] = [Math.max(1, Math.min(LEITNER_DAYS.length - 1, e[0])), String(e[1] || todayISO()), String(e[2] || todayISO()), String(e[3] || e[2] || todayISO())];
    });
    return out;
  }
  function mergeLeitner(a, b) {
    var out = {};
    Object.keys(a).concat(Object.keys(b)).forEach(function (k) {
      var ea = a[k], eb = b[k];
      out[k] = !ea ? eb : !eb ? ea : (eb[2] > ea[2] || (eb[2] === ea[2] && eb[0] > ea[0])) ? eb : ea;
    });
    return out;
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
      dst.leitner = cleanLeitner(src.leitner);
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
      po.leitner = mergeLeitner(pa.leitner || {}, pb.leitner || {});
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

  /* ---------- Révision espacée : boîtes de Leitner ----------
     Chaque carte (définition ou formule) est dans une boîte de 1 à 6. « Je savais » la fait monter
     d'une boîte, « Je ne savais pas » la ramène en boîte 1. L'écart entre deux révisions double à
     chaque boîte : 1, 2, 4, 8, 16 puis 32 jours. Une carte jamais révisée est « nouvelle » :
     on en propose au plus NEW_PER_DAY par jour pour ne pas noyer la file. */
  var LEITNER_DAYS = [0, 1, 2, 4, 8, 16, 32];
  var NEW_PER_DAY = 10;

  function cardKey(kind, i) { return kind + ":" + i; }
  function cardItem(m, kind, i) { return kind === "definitions" ? m.glossary[i] : m.formulas[i]; }
  function leitnerOf(mid, key) { return state.progress[mid].leitner[key] || null; }

  function rateCard(mid, key, ok) {
    var pr = state.progress[mid];
    var today = todayISO();
    var e = pr.leitner[key];
    var box = ok ? Math.min(LEITNER_DAYS.length - 1, (e ? e[0] : 0) + 1) : 1;
    pr.leitner[key] = [box, addDays(today, LEITNER_DAYS[box]), today, e ? e[3] : today];
    // À partir de la boîte 4, la carte est considérée maîtrisée (compte dans l'avancement).
    if (ok && box >= 4) { var parts = key.split(":"); (parts[0] === "definitions" ? pr.termsKnown : pr.formulasKnown)[parts[1]] = true; }
    saveProgress();
  }

  function allCards() {
    var out = [];
    MODULES.forEach(function (m) {
      m.glossary.forEach(function (it, i) { out.push({ m: m, kind: "definitions", i: i, key: cardKey("definitions", i), it: it, e: leitnerOf(m.id, cardKey("definitions", i)) }); });
      m.formulas.forEach(function (it, i) { out.push({ m: m, kind: "formules", i: i, key: cardKey("formules", i), it: it, e: leitnerOf(m.id, cardKey("formules", i)) }); });
    });
    return out;
  }
  function reviewPlan() {
    var today = todayISO();
    var cards = allCards();
    var due = cards.filter(function (c) { return c.e && c.e[1] <= today; }).sort(function (a, b) { return a.e[1] < b.e[1] ? -1 : a.e[1] > b.e[1] ? 1 : 0; });
    var newToday = cards.filter(function (c) { return c.e && c.e[3] === today; }).length;
    var fresh = cards.filter(function (c) { return !c.e; }).sort(function (a, b) { return (a.m.priority - b.m.priority) || (moduleIndex(a.m) - moduleIndex(b.m)); });
    var news = fresh.slice(0, Math.max(0, NEW_PER_DAY - newToday));
    var next = null;
    cards.forEach(function (c) { if (c.e && c.e[1] > today && (!next || c.e[1] < next)) next = c.e[1]; });
    return { due: due, news: news, fresh: fresh.length, next: next, seen: cards.length - fresh.length, total: cards.length };
  }
  function shuffle(arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }

  function startReview(random) {
    var plan = reviewPlan();
    var queue = random ? shuffle(allCards()).slice(0, 10) : plan.due.concat(plan.news);
    state.rev = { queue: queue.map(function (c) { return { mid: c.m.id, kind: c.kind, i: c.i }; }), idx: 0, revealed: false, ok: 0, ko: 0 };
    state.view = "revision"; state.navOpen = false; state.scrollTop = true;
    render();
  }

  /* ---------- Examens blancs : historique ---------- */
  function loadExams() { try { var raw = localStorage.getItem(EXAM_KEY); var a = raw ? JSON.parse(raw) : []; return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function saveExams(list) { try { localStorage.setItem(EXAM_KEY, JSON.stringify(list.slice(-50))); } catch (e) {} }
  function noteSur20(score, total) { return total ? Math.round((score / total) * 40) / 2 : 0; }
  function frNote(n) { return String(n).replace(".", ","); }
  function fmtClock(secs) { secs = Math.max(0, Math.round(secs)); return Math.floor(secs / 60) + ":" + pad(secs % 60); }

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
    corrigeOpen: {},
    resetArmed: false,
    search: "",
    lastModule: prefs.lastModule || null,
    navOpen: false,
    scrollTop: false,
    rev: null,                 // session de révision espacée en cours
    exam: null,                // examen blanc en cours (setup / run / done)
    exams: loadExams(),        // historique des examens blancs
    importMsg: ""
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
    var plan = reviewPlan();
    var nDue = plan.due.length + plan.news.length;
    var expire = window.SalleEtudeAccesInfo && SalleEtudeAccesInfo.expire;
    return '<aside class="sidebar' + (state.navOpen ? ' open' : '') + '" id="sidebar">' +
      '<div class="brand"><div class="mark">' + brandMark() + '</div><div><div class="t">' + esc(CONFIG.titre) + '</div><div class="s">' + esc(CONFIG.sousTitre || "") + '</div></div></div>' +
      '<div class="side-search">' + ICONS.search + '<input type="search" placeholder="Chercher un terme, une formule…" value="' + esc(state.search) + '" data-search="1" aria-label="Rechercher"></div>' +
      '<div class="side-group">' +
        '<button class="nav-item' + (state.view === "home" ? ' active' : '') + '" data-go="home">' + ICONS.home + 'Accueil</button>' +
        '<button class="nav-item' + (state.view === "formulaire" ? ' active' : '') + '" data-go="formulaire">' + ICONS.sigma + 'Formulaire complet</button>' +
        '<button class="nav-item' + (state.view === "glossaire" ? ' active' : '') + '" data-go="glossaire">' + ICONS.book + 'Glossaire complet</button>' +
        '<button class="nav-item' + (state.view === "annales" ? ' active' : '') + '" data-go="annales">' + ICONS.scroll + 'Annales' + (ANNALES.length ? '<span class="count">' + ANNALES.length + '</span>' : '') + '</button>' +
      '</div>' +
      '<div class="side-group"><div class="side-label">S\'entraîner</div>' +
        '<button class="nav-item' + (state.view === "revision" ? ' active' : '') + '" data-go="revision">' + ICONS.cards + 'Révision du jour' + (nDue ? '<span class="count' + (plan.due.length ? ' due' : '') + '">' + nDue + '</span>' : '') + '</button>' +
        '<button class="nav-item' + (state.view === "examen" ? ' active' : '') + '" data-go="examen">' + ICONS.timer + 'Examen blanc</button>' +
      '</div>' +
      codes().map(function (c) { return '<div class="side-group"><div class="side-label">' + esc(groupLabel(c)) + '</div>' + modItems(c) + '</div>'; }).join("") +
      '<div class="side-foot"><div>Avancement global · <b class="mono">' + g + ' %</b></div><div class="bar"><span style="width:' + g + '%"></span></div>' +
        '<div class="sync" data-sync="' + sync.status + '"><i></i>' + syncLabel() + '</div>' +
        (window.SalleEtudePWA && SalleEtudePWA.installable() ? '<button class="btn ghost sm" data-pwa-install="1" style="justify-content:center">Installer l\'application</button>' : '') +
        '<button class="btn ghost sm" data-theme-toggle="1" style="justify-content:center">' + ({ auto: "Thème : automatique", light: "Thème : clair", dark: "Thème : sombre" })[state.theme] + '</button>' +
        '<button class="btn ghost sm" data-ambiance="1" style="justify-content:center">' + (state.ambiance === "lofi" ? "Ambiance lofi ✓" : "Ambiance lofi") + '</button>' +
        '<button class="btn ghost sm" data-export="1" style="justify-content:center">Exporter ma progression</button>' +
        '<label class="btn ghost sm" style="justify-content:center">Importer une sauvegarde<input type="file" accept=".json,application/json" data-import="1" hidden></label>' +
        (state.importMsg ? '<div class="side-msg">' + esc(state.importMsg) + '</div>' : '') +
        '<button class="btn ghost sm" data-reset="1" style="justify-content:center">' + (state.resetArmed ? "Confirmer la réinitialisation" : "Réinitialiser ma progression") + '</button>' +
        (window.VERROU ? '<button class="btn ghost sm" data-logout="1" style="justify-content:center">Se déconnecter</button>' : '') +
        (expire ? '<div class="side-expire">Accès valable jusqu\'au ' + frDate(expire) + '</div>' : '') + '</div>' +
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

  /* Bannière « Nouveautés » : config.nouveautes = { version, titre, texte } ; se ferme jusqu'à la version suivante. */
  function renderNews() {
    var n = CONFIG.nouveautes;
    if (!n || !n.version || !n.texte) return "";
    var seen = "";
    try { seen = localStorage.getItem(NEWS_KEY) || ""; } catch (e) {}
    if (seen === String(n.version)) return "";
    return '<div class="news"><div><div class="k">Nouveautés' + (n.version ? ' · version ' + esc(n.version) : '') + '</div>' + (n.titre ? '<div class="t">' + esc(n.titre) + '</div>' : '') + '<p>' + esc(n.texte) + '</p></div><button class="pwa-close" data-news-close="1" aria-label="Fermer">×</button></div>';
  }

  /* Carte « À revoir aujourd'hui » de l'accueil. */
  function renderReviewCard() {
    var plan = reviewPlan();
    var nDue = plan.due.length, nNew = plan.news.length;
    var body, cta;
    if (nDue || nNew) {
      var parts = [];
      if (nDue) parts.push(nDue + ' carte' + (nDue > 1 ? 's' : '') + ' à revoir');
      if (nNew) parts.push(nNew + ' nouvelle' + (nNew > 1 ? 's' : ''));
      body = parts.join(" · ");
      cta = '<button class="btn acc sm" data-review-start="1">Commencer' + (nDue + nNew <= 15 ? ' · ' + Math.max(2, Math.round((nDue + nNew) / 2)) + ' min' : '') + '</button>';
    } else {
      body = plan.seen ? 'Rien à revoir aujourd\'hui. ' + (plan.next ? 'Prochaine révision le ' + frDate(plan.next) + '.' : '') : 'Commence par quelques cartes : elles reviendront au bon moment.';
      cta = '<button class="btn ghost sm" data-review-start="random">Réviser 10 cartes au hasard</button>';
    }
    return '<div class="widget rev"><div class="k">Révision espacée</div><div class="v">' + (nDue + nNew || '✓') + '</div><div class="d">' + body + '</div>' +
      '<div class="d2">' + plan.seen + '/' + plan.total + ' cartes déjà vues</div><div class="a">' + cta + '</div></div>';
  }

  /* Compte à rebours : config.examens = [{ titre, date: "AAAA-MM-JJ", modules: [ids] }]. */
  function upcomingExams() {
    var today = todayISO();
    return (CONFIG.examens || []).filter(function (x) { return x && /^\d{4}-\d{2}-\d{2}$/.test(String(x.date)) && x.date >= today; })
      .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  }
  function renderExamsCard() {
    var list = upcomingExams().slice(0, 4);
    if (!list.length) return "";
    var today = todayISO();
    var rows = list.map(function (x, idx) {
      var j = daysBetween(today, x.date);
      var mods = (x.modules || []).map(getModule).filter(Boolean);
      var chips = mods.map(function (m) { return '<button class="chip go hued" style="--h:' + hue(m) + '" data-open-module="' + m.id + '">' + pad(moduleIndex(m)) + ' · ' + esc(m.title) + '</button>'; }).join("");
      return '<div class="exam-row' + (idx === 0 ? ' first' : '') + (j <= 7 ? ' soon' : '') + '"><div class="j">' + (j === 0 ? 'Aujourd\'hui' : 'J-' + j) + '</div>' +
        '<div><div class="t">' + esc(x.titre || "Examen") + '</div><div class="dt">' + frDate(x.date, true) + (x.heure ? ' · ' + esc(x.heure) : '') + (x.lieu ? ' · ' + esc(x.lieu) : '') + '</div>' + (chips ? '<div class="chips">' + chips + '</div>' : '') + '</div></div>';
    }).join("");
    return '<div class="widget exams"><div class="k">Prochains examens</div>' + rows + '</div>';
  }

  function renderHome() {
    var g = globalPct();
    var strip = MODULES.map(function (m) {
      return '<button class="hued" style="--h:' + hue(m) + ';--w:' + moduleStats(m).overall + '%" data-open-module="' + m.id + '" title="' + esc(m.title) + '"><i></i><span>' + pad(moduleIndex(m)) + '</span></button>';
    }).join("");
    var last = state.lastModule ? getModule(state.lastModule) : null;
    var resume = last ? '<button class="resume hued" style="--h:' + hue(last) + '" data-open-module="' + last.id + '"><div><div class="l">Reprendre</div><div class="n">' + pad(moduleIndex(last)) + '</div></div><div><div class="t">' + last.title + '</div><div class="go">' + moduleStats(last).overall + ' % complété · continuer là où tu t\'es arrêté</div></div><div class="go">→</div></button>' : "";
    var grid = function (code) { return '<div class="grid2">' + MODULES.filter(function (m) { return m.code === code; }).map(renderModuleCard).join("") + '</div>'; };

    var examsCard = renderExamsCard();
    return renderNews() +
      '<div class="home-hero"><div><h1>' + CONFIG.accueilTitre + '</h1><p>' + CONFIG.accueilTexte + ' <span data-sync-copy>' + syncCopy() + '</span></p></div>' +
      '<div class="big-pct"><div class="v">' + g + '<span style="font-size:0.5em">%</span></div><div class="l">Avancement global</div></div></div>' +
      '<div class="widgets' + (examsCard ? '' : ' single') + '">' + renderReviewCard() + examsCard + '</div>' +
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
    var nAnn = annalesOf(m.id).length;
    if (nAnn) tabs.push(["annales", "Annales", String(nAnn)]);
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
        ? "Chaque terme avec sa définition. En mode cartes, réponds de tête, révèle, puis dis si tu savais : la carte reviendra au bon moment dans ta révision du jour."
        : "Les formules et repères à connaître par cœur. En mode cartes, seul le nom apparaît : retrouve la formule, révèle, puis dis si tu savais.") + '</span>' +
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
      var le = leitnerOf(m.id, key);
      var boxTag = le ? '<span class="box-tag" title="Boîte ' + le[0] + ' sur ' + (LEITNER_DAYS.length - 1) + '">' + boxDots(le[0]) + (le[1] <= todayISO() ? 'à revoir' : 'le ' + frDate(le[1])) + '</span>' : '';
      var rate = (cardMode && flipped) ? '<div class="rate"><button class="btn ghost sm" data-rate="' + key + ':0">Je ne savais pas</button><button class="btn acc sm" data-rate="' + key + ':1">Je savais</button></div>' : '';
      return '<div class="fc' + (isKnown ? ' known' : '') + '"><div class="top"><div class="term' + (isDef ? '' : ' mono') + '">' + (isDef ? it.term : it.name) + '</div>' +
        toggleBtn(isKnown, 'data-known="' + key + '"', 'Maîtrisée', 'Je maîtrise') + '</div>' + face + rate + boxTag + '</div>';
    }).join("");

    return bar + '<div class="cards">' + list + '</div>';
  }
  function boxDots(box) {
    var s = '<i class="dots">';
    for (var b = 1; b < LEITNER_DAYS.length; b++) s += '<b' + (b <= box ? ' class="on"' : '') + '></b>';
    return s + '</i>';
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
      case "annales": body = renderAnnalesList(annalesOf(m.id), false); break;
      default: body = renderCours(m);
    }
    var st = moduleStats(m);
    return '<div class="back-row"><button class="back" data-go="home">← Tous les modules</button><button class="btn ghost sm" data-fiche="' + m.id + '">Fiche de révision imprimable</button></div>' +
      '<div class="banner"><div><div class="chips"><span class="chip">' + m.code + '</span><span class="chip' + (m.priority === 1 ? ' p1' : ' acc') + '">' + PRIO_LABEL[m.priority] + '</span></div>' +
        '<h1>' + m.title + '</h1><p>' + m.tagline + '</p></div>' + bigRing(st.overall) + '<div class="wm">' + pad(moduleIndex(m)) + '</div></div>' +
      renderSeg(m) + '<div>' + body + '</div>';
  }

  /* ---------- Fiche de révision imprimable (un module) ---------- */

  function renderFiche(m) {
    var retenir = [];
    m.lessons.forEach(function (l) {
      var re = /<div class="retenir">[\s\S]*?<\/div>/g, hit;
      while ((hit = re.exec(l.html))) retenir.push({ lesson: l.title, html: hit[0] });
    });
    var formules = m.formulas.map(function (f) { return '<div class="fc"><div class="top"><div class="term mono">' + f.name + '</div></div><div class="f">' + esc(f.f) + '</div>' + (f.note ? '<div class="note">' + f.note + '</div>' : '') + '</div>'; }).join("");
    var defs = m.glossary.map(function (g) { return '<div class="fc"><div class="top"><div class="term">' + g.term + '</div></div><div class="def">' + g.def + '</div></div>'; }).join("");
    return '<div class="back-row no-print"><button class="back" data-open-module="' + m.id + '">← Retour au module</button><button class="btn acc sm" data-print="1">Imprimer</button></div>' +
      '<div class="fiche hued" style="--h:' + hue(m) + '">' +
        '<div class="fiche-head"><span class="n">' + pad(moduleIndex(m)) + '</span><div><h1>' + m.title + '</h1><p>' + m.tagline + ' · Fiche de révision, ' + m.formulas.length + ' formules, ' + m.glossary.length + ' définitions' + (retenir.length ? ', ' + retenir.length + ' points à retenir' : '') + '.</p></div></div>' +
        (retenir.length ? '<h2>À retenir</h2><div class="fiche-retenir">' + retenir.map(function (r) { return '<div class="fiche-r"><div class="src">' + r.lesson + '</div>' + r.html + '</div>'; }).join("") + '</div>' : '') +
        (m.formulas.length ? '<h2>Formules</h2><div class="cards">' + formules + '</div>' : '') +
        (m.glossary.length ? '<h2>Définitions</h2><div class="cards">' + defs + '</div>' : '') +
      '</div>';
  }

  /* ---------- Révision du jour (session de cartes) ---------- */

  function renderRevision() {
    var rev = state.rev;
    var plan = reviewPlan();
    var intro = '<div class="ptitle"><h1>Révision du jour</h1><p>Les cartes que tu as déjà vues reviennent à intervalles croissants (1, 2, 4, 8, 16 puis 32 jours) : celles que tu rates reviennent dès demain, celles que tu sais s\'espacent. Chaque jour, au plus ' + NEW_PER_DAY + ' nouvelles cartes s\'ajoutent, en commençant par les modules prioritaires.</p></div>';

    if (!rev) {
      var nDue = plan.due.length, nNew = plan.news.length;
      var boxes = [0, 0, 0, 0, 0, 0, 0];
      allCards().forEach(function (c) { if (c.e) boxes[c.e[0]]++; });
      var boxesHtml = '<div class="boxes">' + [1, 2, 3, 4, 5, 6].map(function (b) { return '<div class="bx"><div class="v">' + boxes[b] + '</div><div class="l">Boîte ' + b + '<br><span>tous les ' + LEITNER_DAYS[b] + ' j</span></div></div>'; }).join("") + '<div class="bx new"><div class="v">' + plan.fresh + '</div><div class="l">Jamais vues</div></div></div>';
      var start = (nDue || nNew)
        ? '<div class="qresult"><div class="v">' + (nDue + nNew) + '</div><div class="m">' + (nDue ? nDue + ' carte' + (nDue > 1 ? 's' : '') + ' à revoir' : '') + (nDue && nNew ? ' et ' : '') + (nNew ? nNew + ' nouvelle' + (nNew > 1 ? 's' : '') : '') + '.<br><button class="btn acc" data-review-start="1" style="margin-top:0.6rem">Commencer la session</button></div></div>'
        : '<div class="qresult"><div class="v">✓</div><div class="m">Rien à revoir aujourd\'hui. ' + (plan.next ? 'Prochaine révision le ' + frDate(plan.next) + '.' : 'Ouvre un module en mode cartes pour commencer.') + '<br><button class="btn ghost" data-review-start="random" style="margin-top:0.6rem">Réviser 10 cartes au hasard</button></div></div>';
      return intro + start + boxesHtml;
    }

    if (rev.idx >= rev.queue.length) {
      var total = rev.ok + rev.ko;
      return intro + '<div class="qresult"><div class="v">' + rev.ok + '/' + total + '</div><div class="m">Session terminée : ' + rev.ok + ' carte' + (rev.ok > 1 ? 's' : '') + ' sue' + (rev.ok > 1 ? 's' : '') + ', ' + rev.ko + ' à retravailler' + (rev.ko ? ' (elles reviennent dès demain)' : '') + '.<br>' +
        '<button class="btn ghost" data-go="home" style="margin-top:0.6rem">Retour à l\'accueil</button> ' + (reviewPlan().due.length ? '<button class="btn acc" data-review-start="1" style="margin-top:0.6rem">Continuer</button>' : '') + '</div></div>';
    }

    var c = rev.queue[rev.idx];
    var m = getModule(c.mid);
    var it = cardItem(m, c.kind, c.i);
    var isDef = c.kind === "definitions";
    var le = leitnerOf(m.id, cardKey(c.kind, c.i));
    var front = isDef ? it.term : it.name;
    var back = isDef ? '<div class="def">' + it.def + '</div>' : '<div class="f">' + esc(it.f) + '</div>' + (it.note ? '<div class="note">' + it.note + '</div>' : '');
    return '<div class="rev-top"><button class="back" data-review-stop="1">← Arrêter</button><span class="mono">' + (rev.idx + 1) + ' / ' + rev.queue.length + '</span></div>' +
      '<div class="bar rev-bar"><span style="width:' + Math.round((rev.idx / rev.queue.length) * 100) + '%"></span></div>' +
      '<div class="rev-card hued" style="--h:' + hue(m) + '">' +
        '<div class="chips"><button class="chip go" data-open-module-tab="' + m.id + ':' + c.kind + '">' + pad(moduleIndex(m)) + ' · ' + esc(m.title) + '</button><span class="chip">' + (isDef ? 'Définition' : 'Formule') + '</span>' + (le ? '<span class="chip">Boîte ' + le[0] + '</span>' : '<span class="chip acc">Nouvelle</span>') + '</div>' +
        '<div class="front' + (isDef ? '' : ' mono') + '">' + front + '</div>' +
        (rev.revealed
          ? '<div class="answer">' + back + '</div><div class="rate big"><button class="btn ghost" data-rev-rate="0">Je ne savais pas</button><button class="btn acc" data-rev-rate="1">Je savais</button></div>'
          : '<div class="reveal"><button class="btn acc" data-rev-reveal="1">Révéler ' + (isDef ? 'la définition' : 'la formule') + '</button><p class="lock-hint">Réponds de tête avant de révéler.</p></div>') +
      '</div>';
  }

  /* ---------- Examen blanc ---------- */

  function examPool(ids) {
    var pool = [];
    MODULES.forEach(function (m) { if (ids.indexOf(m.id) === -1) return; m.quiz.forEach(function (q, qi) { pool.push({ mid: m.id, qi: qi }); }); });
    return pool;
  }
  function examStart(ids, n, minutes) {
    var pool = shuffle(examPool(ids)).slice(0, n);
    if (!pool.length) return;
    // L'ordre des réponses est mélangé à chaque examen : dans les modules, la bonne réponse est
    // très souvent en position B, ce qui se devinerait sans rien savoir.
    pool.forEach(function (q) { q.perm = shuffle(getModule(q.mid).quiz[q.qi].options.map(function (_, k) { return k; })); });
    state.exam = { phase: "run", modules: ids, n: pool.length, minutes: minutes, questions: pool, answers: {}, start: Date.now(), end: null, limit: minutes ? Date.now() + minutes * 60000 : null };
    examTick();
    state.scrollTop = true;
    render();
  }
  var examTimer = null;
  function examTick() {
    clearInterval(examTimer);
    examTimer = setInterval(function () {
      var ex = state.exam;
      if (!ex || ex.phase !== "run") { clearInterval(examTimer); return; }
      var el = document.querySelector("[data-exam-clock]");
      var left = ex.limit ? (ex.limit - Date.now()) / 1000 : (Date.now() - ex.start) / 1000;
      if (el) { el.textContent = fmtClock(left); el.classList.toggle("late", !!ex.limit && left < 60); }
      if (ex.limit && left <= 0) examSubmit(true);
    }, 500);
  }
  function examSubmit(auto) {
    var ex = state.exam;
    if (!ex || ex.phase !== "run") return;
    clearInterval(examTimer);
    var score = 0;
    ex.questions.forEach(function (q, i) { if (ex.answers[i] === getModule(q.mid).quiz[q.qi].correct) score++; });
    ex.end = Date.now();
    ex.phase = "done";
    ex.score = score;
    ex.auto = !!auto;
    state.exams.push({ d: new Date().toISOString(), n: ex.n, s: score, note: noteSur20(score, ex.n), mods: ex.modules.length, secs: Math.round((ex.end - ex.start) / 1000) });
    saveExams(state.exams);
    state.scrollTop = true;
    render();
  }

  function renderExamen() {
    var ex = state.exam;
    var letters = ["A", "B", "C", "D"];

    if (!ex || ex.phase === "setup") {
      var sel = (ex && ex.modules) || MODULES.map(function (m) { return m.id; });
      var n = (ex && ex.n) || 20, minutes = ex && ex.minutes !== undefined ? ex.minutes : 20;
      var available = examPool(sel).length;
      var mods = MODULES.map(function (m) {
        return '<label class="pick hued' + (sel.indexOf(m.id) !== -1 ? ' on' : '') + '" style="--h:' + hue(m) + '"><input type="checkbox" data-exam-mod="' + m.id + '"' + (sel.indexOf(m.id) !== -1 ? ' checked' : '') + '><span class="n">' + pad(moduleIndex(m)) + '</span><span>' + m.title + '</span><span class="c mono">' + m.quiz.length + ' q.</span></label>';
      }).join("");
      var opt = function (attr, values, cur, label) { return values.map(function (v) { return '<button class="pill' + (v[0] === cur ? ' on' : '') + '" data-' + attr + '="' + v[0] + '">' + v[1] + '</button>'; }).join(""); };
      var hist = state.exams.slice().reverse().slice(0, 8);
      var best = state.exams.reduce(function (b, e) { return e.note > b ? e.note : b; }, 0);
      var histHtml = hist.length ? '<h2 class="h2">Tes derniers examens' + (state.exams.length ? ' <span class="mono" style="font-size:0.78rem;color:var(--ink-3)">· meilleure note ' + frNote(best) + '/20</span>' : '') + '</h2><table class="hist"><thead><tr><th>Date</th><th>Modules</th><th>Score</th><th>Note</th><th>Durée</th></tr></thead><tbody>' +
        hist.map(function (e) { return '<tr><td>' + frDate(e.d.slice(0, 10)) + '</td><td>' + e.mods + '</td><td class="mono">' + e.s + '/' + e.n + '</td><td class="mono"><b>' + frNote(e.note) + '</b>/20</td><td class="mono">' + fmtClock(e.secs) + '</td></tr>'; }).join("") + '</tbody></table>' : '';
      return '<div class="ptitle"><h1>Examen blanc</h1><p>Des questions tirées au hasard dans les modules choisis, un chronomètre, une note sur 20 et la correction détaillée. Choisis tes modules, puis lance-toi comme le jour J : sans le cours à côté.</p></div>' +
        '<div class="exam-setup"><h2 class="h2">Modules <span class="mono" style="font-size:0.78rem;color:var(--ink-3)">· ' + available + ' questions disponibles</span> <button class="pill sm" data-exam-all="1">Tout</button> <button class="pill sm" data-exam-all="0">Aucun</button> <button class="pill sm" data-exam-all="p1">Priorité 1</button></h2><div class="picks">' + mods + '</div>' +
        '<div class="exam-opts"><div><div class="k">Questions</div>' + opt("exam-n", [[10, "10"], [20, "20"], [30, "30"], [40, "40"]], n) + '</div><div><div class="k">Durée</div>' + opt("exam-min", [[10, "10 min"], [20, "20 min"], [30, "30 min"], [45, "45 min"], [0, "Sans limite"]], minutes) + '</div></div>' +
        '<button class="btn acc" data-exam-start="1"' + (available ? '' : ' disabled') + '>Commencer l\'examen · ' + Math.min(n, available) + ' questions</button></div>' + histHtml;
    }

    var qs = ex.questions.map(function (q, i) {
      var m = getModule(q.mid), qq = m.quiz[q.qi];
      var selA = ex.answers[i];
      var done = ex.phase === "done";
      var opts = (q.perm || qq.options.map(function (_, k) { return k; })).map(function (oi, pos) {
        var o = qq.options[oi];
        var cls = "opt";
        if (done) { if (oi === qq.correct) cls += " correct"; else if (oi === selA) cls += " incorrect"; }
        else if (selA === oi) cls += " sel";
        return '<label class="' + cls + '"><input type="radio" name="ex-' + i + '" value="' + oi + '"' + (selA === oi ? ' checked' : '') + (done ? ' disabled' : '') + ' data-exam-answer="' + i + ':' + oi + '"><span class="letter">' + letters[pos] + '</span><span>' + o + '</span></label>';
      }).join("");
      var explain = done ? '<div class="qx' + (selA === qq.correct ? '' : ' ko') + '"><span class="tag">' + (selA === qq.correct ? 'Correct' : selA === undefined ? 'Sans réponse' : 'Incorrect') + '</span>' + qq.explain + '</div>' : '';
      return '<div class="qq"><div class="qt"><span class="qn">' + pad(i + 1) + '</span><span>' + qq.q + '</span></div><div class="qmod"><span class="chip go hued" style="--h:' + hue(m) + '" data-open-module-tab="' + m.id + ':evaluation">' + pad(moduleIndex(m)) + ' · ' + esc(m.title) + '</span></div><div class="opts">' + opts + '</div>' + explain + '</div>';
    }).join("");

    if (ex.phase === "run") {
      var answered = Object.keys(ex.answers).length;
      return '<div class="exam-bar"><div><div class="k">Examen blanc</div><div class="t">' + ex.n + ' questions · ' + ex.modules.length + ' module' + (ex.modules.length > 1 ? 's' : '') + '</div></div>' +
        '<div class="clock mono" data-exam-clock>' + fmtClock(ex.limit ? (ex.limit - Date.now()) / 1000 : (Date.now() - ex.start) / 1000) + '</div>' +
        '<button class="btn acc sm" data-exam-submit="1">Rendre la copie</button></div>' +
        '<p class="lock-hint" style="margin:0 0 1rem">' + (ex.limit ? 'Le chronomètre rend la copie automatiquement à la fin du temps. ' : '') + 'Réponses données : <span data-exam-count>' + answered + '</span>/' + ex.n + '.</p>' + qs +
        '<button class="btn acc" data-exam-submit="1">Rendre la copie</button>';
    }

    var note = noteSur20(ex.score, ex.n);
    var verdict = note >= 16 ? "Excellent. Tu es prêt sur ces modules." : note >= 12 ? "Bien. Relis les explications des questions manquées, puis refais un examen dans quelques jours." : note >= 8 ? "Juste. Reprends les leçons des modules où tu as perdu des points avant de recommencer." : "Reprends le cours de ces modules avant de refaire un examen blanc.";
    return '<div class="ptitle"><h1>Correction</h1></div>' +
      '<div class="qresult"><div class="v">' + frNote(note) + '<span style="font-size:0.5em">/20</span></div><div class="m">' + ex.score + ' bonne' + (ex.score > 1 ? 's' : '') + ' réponse' + (ex.score > 1 ? 's' : '') + ' sur ' + ex.n + ' en ' + fmtClock((ex.end - ex.start) / 1000) + (ex.auto ? ' — temps écoulé, copie rendue automatiquement' : '') + '. ' + verdict + '<br>' +
        '<button class="btn ghost" data-exam-again="1" style="margin-top:0.6rem">Nouvel examen</button> <button class="btn ghost" data-go="home" style="margin-top:0.6rem">Accueil</button></div></div>' + qs;
  }

  /* ---------- Global pages ---------- */

  /* ---------- Annales ---------- */

  function annalesOf(moduleId) { return ANNALES.filter(function (a) { return a.module === moduleId; }); }

  function renderAnnale(a, showModule) {
    var m = a.module ? getModule(a.module) : null;
    var chips = [];
    if (a.annee) chips.push('<span class="chip acc">' + esc(a.annee) + '</span>');
    if (a.session) chips.push('<span class="chip">' + esc(a.session) + '</span>');
    if (a.type) chips.push('<span class="chip">' + esc(a.type) + '</span>');
    if (a.duree) chips.push('<span class="chip">' + esc(a.duree) + '</span>');
    if (showModule && m) chips.push('<button class="chip go" data-open-module="' + m.id + '">' + pad(moduleIndex(m)) + ' · ' + esc(m.title) + '</button>');
    var pdfs = a.files.filter(function (f) { return f.kind !== "image"; });
    var imgs = a.files.filter(function (f) { return f.kind === "image"; });
    var files = pdfs.map(function (f) {
      return '<a class="btn ghost sm" href="' + f.url + '" target="_blank" rel="noopener">' + (f.kind === "pdf" ? "Ouvrir le PDF" : "Télécharger") + ' <span class="mono" style="opacity:.7">' + esc(f.name) + ' · ' + f.size + '</span></a>';
    }).join("");
    var gallery = imgs.length ? '<div class="an-gallery">' + imgs.map(function (f) {
      return '<a href="' + f.url + '" target="_blank" rel="noopener" title="' + esc(f.name) + '"><img src="' + f.url + '" alt="' + esc(f.name) + '" loading="lazy"></a>';
    }).join("") + '</div>' : '';
    var open = !!state.corrigeOpen[a.id];
    var corrige = a.corrige
      ? (open ? '<div class="sol"><span class="label">Corrigé</span><div class="lesson-body">' + a.corrige + '</div></div><button class="btn ghost sm" data-corrige-hide="' + a.id + '">Masquer le corrigé</button>'
              : '<button class="btn ghost sm" data-corrige-show="' + a.id + '">Voir le corrigé</button>')
      : '';
    return '<article class="an hued" id="an-' + a.id + '" style="--h:' + (m ? hue(m) : 185) + '">' +
      '<div class="an-head"><h3>' + esc(a.title) + '</h3><div class="chips">' + chips.join("") + '</div></div>' +
      (files ? '<div class="an-files">' + files + '</div>' : '') + gallery +
      (a.sujet ? '<div class="lesson-body an-sujet">' + a.sujet + '</div>' : '') +
      (corrige ? '<div class="an-corrige">' + corrige + '</div>' : '') +
    '</article>';
  }

  function renderAnnalesList(list, groupByModule) {
        if (!list.length) { var c = (CONFIG.acces && CONFIG.acces.contact) || ""; var lien = c ? '<a href="mailto:' + c + '?subject=' + encodeURIComponent("Salle d'étude — sujet d'examen") + '">' + c + '</a>' : "l'administrateur du site"; return '<div class="notes-empty"><p>Aucun sujet pour l\'instant.</p><p>Les sujets sont ajoutés au fil de l\'année. Si tu as un sujet, un corrigé ou une photo d\'énoncé, envoie-le à ' yacineguett@gmail.com ' : il sera mis en ligne pour tout le monde.</p></div>'; }
    if (!groupByModule) return list.map(function (a) { return renderAnnale(a, false); }).join("");
    var groups = [], byKey = {};
    list.forEach(function (a) {
      var key = a.module && getModule(a.module) ? a.module : "_autres";
      if (!byKey[key]) { byKey[key] = []; groups.push(key); }
      byKey[key].push(a);
    });
    groups.sort(function (x, y) { var mx = getModule(x), my = getModule(y); return (mx ? moduleIndex(mx) : 999) - (my ? moduleIndex(my) : 999); });
    return groups.map(function (key) {
      var m = getModule(key);
      var head = m ? '<div class="ghead hued" style="--h:' + hue(m) + '"><span class="n">' + pad(moduleIndex(m)) + '</span><h2>' + esc(m.title) + '</h2></div>' : '<div class="ghead"><h2>Autres sujets</h2></div>';
      return head + byKey[key].map(function (a) { return renderAnnale(a, false); }).join("");
    }).join("");
  }

  function renderAnnales() {
    var years = {};
    ANNALES.forEach(function (a) { if (a.annee) years[a.annee] = true; });
    var yl = Object.keys(years).sort().reverse();
    return '<div class="ptitle"><h1>Annales</h1><p>' + (ANNALES.length ? ANNALES.length + ' sujet' + (ANNALES.length > 1 ? 's' : '') + (yl.length ? ' · ' + yl.join(", ") : '') + ', classés par module. Les corrigés se déplient sujet par sujet.' : 'Les sujets d\'examen, partiels et devoirs, avec leurs corrigés.') + '</p>' +
      (ANNALES.length ? '<div style="margin-top:0.9rem"><button class="btn ghost sm" data-print="1">Imprimer</button></div>' : '') + '</div>' +
      renderAnnalesList(ANNALES, true);
  }

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
    ANNALES.forEach(function (a) {
      var txt = a.title + " " + a.annee + " " + a.session + " " + a.type + " " + (a.sujet + " " + a.corrige).replace(/<[^>]+>/g, " ") + " " + a.files.map(function (f) { return f.name; }).join(" ");
      if (norm(txt).indexOf(q) !== -1) { var m = a.module ? getModule(a.module) : null; hits.push({ k: "Annale", t: a.title, d: [a.annee, a.session, a.type].filter(Boolean).join(" · ") || "Sujet d'examen", m: m, tab: "annales", annale: a.id }); }
    });
    var list = hits.slice(0, 60).map(function (h) {
      return '<div class="hit hued" style="--h:' + (h.m ? hue(h.m) : 185) + '"><div><div class="k">' + h.k + (h.m ? ' · module ' + pad(moduleIndex(h.m)) : '') + '</div><div class="t">' + h.t + '</div></div>' +
        (h.m ? '<button class="go" data-open-module-tab="' + h.m.id + ':' + h.tab + '">Ouvrir →</button>' : '<button class="go" data-go="annales">Ouvrir →</button>') +
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
    } else if (state.view === "fiche") {
      var mf = getModule(state.moduleId);
      if (mf) { main = renderFiche(mf); h = hue(mf); } else main = renderHome();
    } else if (state.view === "formulaire" || state.view === "glossaire") main = renderGlobal(state.view);
    else if (state.view === "revision") main = renderRevision();
    else if (state.view === "examen") main = renderExamen();
    else if (state.view === "annales") main = renderAnnales();
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
    if ((el = t.closest("[data-go]"))) { state.view = el.getAttribute("data-go"); state.search = ""; state.resetArmed = false; state.navOpen = false; state.scrollTop = true; if (state.view !== "revision") state.rev = null; render(); return; }
    if ((el = t.closest("[data-tab]"))) { state.tab = el.getAttribute("data-tab"); render(); return; }

    if ((el = t.closest("[data-lesson-toggle]"))) { var li = parseInt(el.getAttribute("data-lesson-toggle"), 10); var pr = state.progress[state.moduleId]; pr.lessonsRead[li] = !pr.lessonsRead[li]; saveProgress(); render(); return; }
    if ((el = t.closest("[data-ex-toggle]"))) { var ei = parseInt(el.getAttribute("data-ex-toggle"), 10); var pr2 = state.progress[state.moduleId]; pr2.exercisesDone[ei] = !pr2.exercisesDone[ei]; saveProgress(); render(); return; }
    if ((el = t.closest("[data-ex-reveal]"))) { state.revealed[state.moduleId] = state.revealed[state.moduleId] || {}; state.revealed[state.moduleId][parseInt(el.getAttribute("data-ex-reveal"), 10)] = true; render(); return; }
    if ((el = t.closest("[data-corrige-show]"))) { state.corrigeOpen[el.getAttribute("data-corrige-show")] = true; render(); return; }
    if ((el = t.closest("[data-corrige-hide]"))) { state.corrigeOpen[el.getAttribute("data-corrige-hide")] = false; render(); return; }
    if ((el = t.closest("[data-ex-hide]"))) { state.revealed[state.moduleId] = state.revealed[state.moduleId] || {}; state.revealed[state.moduleId][parseInt(el.getAttribute("data-ex-hide"), 10)] = false; render(); return; }

    if ((el = t.closest("[data-cardmode]"))) { var kind = el.getAttribute("data-cardmode"); state.cardMode[kind] = !state.cardMode[kind]; state.flipped[state.moduleId] = {}; savePrefs(); render(); return; }
    if ((el = t.closest("[data-flip-all]"))) { var k2 = el.getAttribute("data-flip-all"); var m2 = getModule(state.moduleId); var items = k2 === "definitions" ? m2.glossary : m2.formulas; state.flipped[state.moduleId] = state.flipped[state.moduleId] || {}; items.forEach(function (_, i) { state.flipped[state.moduleId][k2 + ":" + i] = true; }); render(); return; }
    if ((el = t.closest("[data-flip]"))) { state.flipped[state.moduleId] = state.flipped[state.moduleId] || {}; state.flipped[state.moduleId][el.getAttribute("data-flip")] = true; render(); return; }
    if ((el = t.closest("[data-known]"))) { var parts = el.getAttribute("data-known").split(":"); var store = parts[0] === "definitions" ? state.progress[state.moduleId].termsKnown : state.progress[state.moduleId].formulasKnown; if (store[parts[1]]) delete store[parts[1]]; else store[parts[1]] = true; saveProgress(); render(); return; }

    if ((el = t.closest("[data-quiz-submit]"))) { var mid = el.getAttribute("data-quiz-submit"); var mq = getModule(mid); var answers = state.quizAnswers[mid] || {}; var score = 0; mq.quiz.forEach(function (q, i) { if (answers[i] === q.correct) score++; }); state.quizSubmitted[mid] = true; var pr3 = state.progress[mid]; if (!pr3.quizBest || score > pr3.quizBest.score) { pr3.quizBest = { score: score, total: mq.quiz.length }; saveProgress(); } state.scrollTop = true; render(); return; }
    if ((el = t.closest("[data-quiz-retry]"))) { var mid2 = el.getAttribute("data-quiz-retry"); state.quizSubmitted[mid2] = false; state.quizAnswers[mid2] = {}; state.scrollTop = true; render(); return; }

    if ((el = t.closest("[data-rate]"))) { var rp = el.getAttribute("data-rate").split(":"); rateCard(state.moduleId, rp[0] + ":" + rp[1], rp[2] === "1"); render(); return; }

    /* Révision du jour */
    if ((el = t.closest("[data-review-start]"))) { startReview(el.getAttribute("data-review-start") === "random"); return; }
    if ((el = t.closest("[data-review-stop]"))) { state.rev = null; render(); return; }
    if ((el = t.closest("[data-rev-reveal]"))) { if (state.rev) { state.rev.revealed = true; render(); } return; }
    if ((el = t.closest("[data-rev-rate]"))) {
      var rv = state.rev; if (!rv) return;
      var rc = rv.queue[rv.idx];
      var ok = el.getAttribute("data-rev-rate") === "1";
      rateCard(rc.mid, cardKey(rc.kind, rc.i), ok);
      if (ok) rv.ok++; else rv.ko++;
      rv.idx++; rv.revealed = false; state.scrollTop = true; render(); return;
    }

    /* Examen blanc */
    if ((el = t.closest("[data-exam-mod]"))) { return; } // géré dans « change »
    if ((el = t.closest("[data-exam-all]"))) {
      var mode = el.getAttribute("data-exam-all");
      state.exam = state.exam && state.exam.phase === "setup" ? state.exam : { phase: "setup", modules: MODULES.map(function (m) { return m.id; }), n: 20, minutes: 20 };
      state.exam.modules = MODULES.filter(function (m) { return mode === "1" || (mode === "p1" && m.priority === 1); }).map(function (m) { return m.id; });
      render(); return;
    }
    if ((el = t.closest("[data-exam-n]"))) { examSetup().n = parseInt(el.getAttribute("data-exam-n"), 10); render(); return; }
    if ((el = t.closest("[data-exam-min]"))) { examSetup().minutes = parseInt(el.getAttribute("data-exam-min"), 10); render(); return; }
    if ((el = t.closest("[data-exam-start]"))) { var es = examSetup(); examStart(es.modules, es.n, es.minutes); return; }
    if ((el = t.closest("[data-exam-submit]"))) { examSubmit(false); return; }
    if ((el = t.closest("[data-exam-again]"))) { var prev = state.exam; state.exam = { phase: "setup", modules: prev.modules, n: prev.n, minutes: prev.minutes }; state.scrollTop = true; render(); return; }

    /* Fiche, nouveautés, sauvegarde */
    if ((el = t.closest("[data-fiche]"))) { state.view = "fiche"; state.moduleId = el.getAttribute("data-fiche"); state.navOpen = false; state.scrollTop = true; render(); return; }
    if ((el = t.closest("[data-news-close]"))) { try { localStorage.setItem(NEWS_KEY, String(CONFIG.nouveautes.version)); } catch (err) {} render(); return; }
    if ((el = t.closest("[data-export]"))) { exportProgress(); return; }

    if ((el = t.closest("[data-print]"))) { window.print(); return; }
    if ((el = t.closest("[data-logout]"))) { window.SalleEtudeGate.logout(); return; }
    if ((el = t.closest("[data-pwa-install]"))) { SalleEtudePWA.install().then(function () { render(); }); return; }
    if ((el = t.closest("[data-theme-toggle]"))) { state.theme = state.theme === "auto" ? "dark" : state.theme === "dark" ? "light" : "auto"; savePrefs(); render(); return; }
    if ((el = t.closest("[data-ambiance]"))) { state.ambiance = state.ambiance === "lofi" ? "neutre" : "lofi"; savePrefs(); render(); return; }
    if ((el = t.closest("[data-reset]"))) {
      if (!state.resetArmed) { state.resetArmed = true; render(); }
      else { state.progress = defaultProgress(); state.resetArmed = false; state.quizSubmitted = {}; state.quizAnswers = {}; state.flipped = {}; saveProgress(); render(); }
      return;
    }
  });

  function examSetup() {
    if (!state.exam || state.exam.phase !== "setup") state.exam = { phase: "setup", modules: MODULES.map(function (m) { return m.id; }), n: 20, minutes: 20 };
    return state.exam;
  }

  /* ---------- Sauvegarde : export / import d'un fichier JSON ---------- */
  function exportProgress() {
    var body = { app: "salle-etude", v: 1, date: new Date().toISOString(), progress: state.progress, examens: state.exams, prefs: loadPrefs() };
    var blob = new Blob([JSON.stringify(body, null, 1)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "salle-etude-progression-" + todayISO() + ".json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (!data || data.app !== "salle-etude" || !data.progress) throw new Error("Ce fichier n'est pas une sauvegarde de la salle d'étude.");
        state.progress = mergeProgress(state.progress, normalizeProgress(data.progress));
        if (Array.isArray(data.examens)) {
          var seen = {}; state.exams.forEach(function (x) { seen[x.d] = true; });
          data.examens.forEach(function (x) { if (x && x.d && !seen[x.d]) state.exams.push(x); });
          state.exams.sort(function (a, b) { return a.d < b.d ? -1 : 1; });
          saveExams(state.exams);
        }
        saveProgress();
        state.importMsg = "Sauvegarde importée : ta progression a été fusionnée (rien n'est perdu).";
      } catch (err) { state.importMsg = "Import impossible : " + err.message; }
      render();
      setTimeout(function () { state.importMsg = ""; render(); }, 6000);
    };
    reader.readAsText(file);
  }

  app.addEventListener("change", function (e) {
    var imp = e.target.closest("[data-import]");
    if (imp && imp.files && imp.files[0]) { importProgress(imp.files[0]); return; }

    var mod = e.target.closest("[data-exam-mod]");
    if (mod) {
      var es = examSetup(), id = mod.getAttribute("data-exam-mod");
      es.modules = es.modules.filter(function (x) { return x !== id; });
      if (mod.checked) es.modules.push(id);
      render(); return;
    }

    var ans = e.target.closest("[data-exam-answer]");
    if (ans && state.exam && state.exam.phase === "run") {
      var pa = ans.getAttribute("data-exam-answer").split(":");
      state.exam.answers[parseInt(pa[0], 10)] = parseInt(pa[1], 10);
      var lab = ans.closest("label");
      if (lab && lab.parentNode) { var sb = lab.parentNode.querySelectorAll(".opt"); for (var j = 0; j < sb.length; j++) sb[j].classList.remove("sel"); lab.classList.add("sel"); }
      var cnt = document.querySelector("[data-exam-count]");
      if (cnt) cnt.textContent = Object.keys(state.exam.answers).length;
      return;
    }

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

  /* Petite API pour les modules annexes (assistant IA) */
  var renderHooks = [];
  var baseRender = render;
  render = function () { baseRender(); renderHooks.forEach(function (fn) { try { fn(); } catch (e) {} }); };
  window.SalleEtude = {
    currentModule: function () { return state.view === "module" ? getModule(state.moduleId) : null; },
    esc: esc,
    onRender: function (fn) { renderHooks.push(fn); }
  };

  render();
  initSync();
}
if (window.VERROU) window.SalleEtudeGate.run(startApp); else startApp();
