/* Codex reader of the Home (webflow/CUSTOM-CODE.md, block "Three depths"): the tabs, the panel and the dock of the
   prototype (webflow/src/js/olimpo.js, lines 501 to 880), reading the Codex from the CMS instead of a script. The list
   of entries comes from the hidden Collection List [data-codex-data] (Code, Slug, Family, Short label, Name as
   attributes, in Sort order); the article of a tab is the article of its own page, /codex/<slug>, fetched once.
   Built by webflow/build-home-body.mjs into page-code-home-body.html (Home, Page settings, Before </body> tag). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = $('[data-codex-root]'), panel = $('[data-codex-panel]'), backdrop = $('[data-codex-backdrop]');
  var dock = $('[data-dock]'), tabsEl = $('[data-codex-tabs]'), panesEl = $('[data-codex-panes]');
  var indexEl = $('[data-codex-index]'), dockHome = $('[data-dock-home]'), dockCount = $('[data-dock-count]');
  var dockMore = $('[data-dock-more]'), dockMin = $('[data-codex-min]'), navCount = $('[data-nav-count]');
  var live = $('[data-live]');
  if (!root || !panel || !dock || !tabsEl || !panesEl) return;
  var mqReduce = matchMedia('(prefers-reduced-motion: reduce)'), mqMobile = matchMedia('(max-width: 767px)');
  var gsap = window.gsap || null, Flip = window.Flip || null;
  var say = function (msg) { if (live) { live.textContent = ''; setTimeout(function () { live.textContent = msg; }, 30); } };

  /* the language of the page: the Home is English, /es and /pt are its Spanish and Portuguese copies (João, 08/10/2026:
     "o webflow so tem ingles, sendo que deveria ter es/pt tbm"); the Codex entries carry the three languages in the CMS */
  var LANG = /^\/(es|pt)(\/|$)/.test(location.pathname) ? location.pathname.slice(1, 3) : 'en';
  /* the visitor text of the reader, per language (Spanish and Portuguese from the prototypes, src-es/ and src/) */
  var TEXTS = {
    en: {
      index: 'Index', indexMeta: 'Codex · index',
      indexIntro: 'Everything in the Codex: foundations, pantheon, method, origin, archetypes and legal documents. Each item opens as a tab in this same reader.',
      loading: 'Opening…', failed: 'This entry did not load here.', openPage: 'Open it as a page', moreInCodex: 'More in the Codex',
      tab: ' tab', tabs: ' tabs', more: function (n) { return n + ' more in the Codex'; },
      dockIndex: 'Open the Codex index', dockIndexOpen: 'Open the Codex index, ',
      closeTab: 'Close the tab ', opened: 'Tab opened: ', inCodex: ' in the Codex.', focused: 'Tab already open, now in focus: ',
      closed: 'Tab closed: ', lastClosed: 'Last tab closed: ', dockEmpty: '. The dock shows only the Codex again.',
      minimized: 'Codex minimized, ', kept: ' kept in the dock.', minimize: 'Minimize the Codex'
    },
    es: {
      index: 'Índice', indexMeta: 'Códex · índice',
      indexIntro: 'Todo lo que está en el Códex: fundamentos, panteón, método, origen, arquetipos y documentos legales. Cada elemento se abre como pestaña en este mismo lector.',
      loading: 'Abriendo…', failed: 'Esta entrada no se cargó aquí.', openPage: 'Ábrela como página', moreInCodex: 'Más en el Códex',
      tab: ' pestaña', tabs: ' pestañas', more: function (n) { return n + ' más en el Códex'; },
      dockIndex: 'Abrir el Códex en el índice', dockIndexOpen: 'Abrir el Códex en el índice, ',
      closeTab: 'Cerrar la pestaña ', opened: 'Pestaña abierta: ', inCodex: ' en el Códex.', focused: 'Pestaña ya abierta, en foco: ',
      closed: 'Pestaña cerrada: ', lastClosed: 'Última pestaña cerrada: ', dockEmpty: '. El dock vuelve a mostrar solo el Códex.',
      minimized: 'Códex minimizado, ', kept: ' guardadas en el dock.', minimize: 'Minimizar el Códex'
    },
    pt: {
      index: 'Índice', indexMeta: 'Códex · índice',
      indexIntro: 'Tudo o que está no Códex: fundamentos, panteão, método, origem, arquétipos e documentos legais. Cada item abre como aba neste mesmo leitor.',
      loading: 'Abrindo…', failed: 'Este verbete não carregou aqui.', openPage: 'Abrir como página', moreInCodex: 'Mais no Códex',
      tab: ' aba', tabs: ' abas', more: function (n) { return 'Mais ' + n + ' no Códex'; },
      dockIndex: 'Abrir o Códex no índice', dockIndexOpen: 'Abrir o Códex no índice, ',
      closeTab: 'Fechar a aba ', opened: 'Aba aberta: ', inCodex: ' no Códex.', focused: 'Aba já aberta, em foco: ',
      closed: 'Aba fechada: ', lastClosed: 'Última aba fechada: ', dockEmpty: '. O dock volta a mostrar só o Códex.',
      minimized: 'Códex minimizado, ', kept: ' guardadas no dock.', minimize: 'Minimizar o Códex'
    }
  };
  var TEXT = TEXTS[LANG];
  /* the Codex families in the order of the index: the option name of the CMS field Family (the key, English), the
     name and description shown, the singular and plural of its items, and its letter */
  var FAMILY_TEXT = {
    en: [['Foundations', 'Foundations', 'The psychology and philosophy behind the method', ['article', 'articles'], 'A'],
      ['The pantheon', 'The pantheon', 'Where each name in the product comes from', ['article', 'articles'], 'B'],
      ['The method', 'The method', 'How the product works, from the inside', ['article', 'articles'], 'C'],
      ['The origin', 'The origin', 'Who made Olimpo, why, and where it is going', ['article', 'articles'], 'D'],
      ['Archetypes', 'Archetypes', 'The 16 MBTI types', ['archetype', 'archetypes'], 'T'],
      ['Temperaments', 'Temperaments', 'The four rhythms of reaction', ['temperament', 'temperaments'], 'P'],
      ['Legal', 'Legal', 'Terms, privacy and cookies', ['document', 'documents'], 'L']],
    es: [['Foundations', 'Fundamentos', 'La psicología y la filosofía detrás del método', ['artículo', 'artículos'], 'A'],
      ['The pantheon', 'El panteón', 'De dónde viene cada nombre del producto', ['artículo', 'artículos'], 'B'],
      ['The method', 'El método', 'Cómo funciona el producto, por dentro', ['artículo', 'artículos'], 'C'],
      ['The origin', 'El origen', 'Quién hizo Olimpo, por qué y hacia dónde va', ['artículo', 'artículos'], 'D'],
      ['Archetypes', 'Arquetipos', 'Los 16 tipos del MBTI', ['arquetipo', 'arquetipos'], 'T'],
      ['Temperaments', 'Temperamentos', 'Los cuatro ritmos de reacción', ['temperamento', 'temperamentos'], 'P'],
      ['Legal', 'Legal', 'Términos, privacidad y cookies', ['documento', 'documentos'], 'L']],
    pt: [['Foundations', 'Fundamentos', 'A psicologia e a filosofia por trás do método', ['artigo', 'artigos'], 'A'],
      ['The pantheon', 'O panteão', 'De onde vem cada nome do produto', ['artigo', 'artigos'], 'B'],
      ['The method', 'O método', 'Como o produto funciona, por dentro', ['artigo', 'artigos'], 'C'],
      ['The origin', 'A origem', 'Quem fez o Olimpo, por que e para onde vai', ['artigo', 'artigos'], 'D'],
      ['Archetypes', 'Arquétipos', 'Os 16 tipos do MBTI', ['arquétipo', 'arquétipos'], 'T'],
      ['Temperaments', 'Temperamentos', 'Os quatro ritmos de reação', ['temperamento', 'temperamentos'], 'P'],
      ['Legal', 'Legal', 'Termos, privacidade e cookies', ['documento', 'documentos'], 'L']]
  };
  var FAMILIES = FAMILY_TEXT[LANG];
  var familyName = function (key) { var f = FAMILIES.filter(function (x) { return x[0] === key; })[0]; return f ? f[1] : key; };
  /* one icon per Codex entry and per family (Lucide, ISC), as in the prototype */
  var CODEX_ICO = {"MEL":"<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/>",
    "CHO":"<path d=\"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z\"/>",
    "SAN":"<path d=\"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z\"/>",
    "PHL":"<path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z\"/><path d=\"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12\"/>",
    "A1":"<path d=\"M2.5 16.88a1 1 0 0 1-.32-1.43l9-13.02a1 1 0 0 1 1.64 0l9 13.01a1 1 0 0 1-.32 1.44l-8.51 4.86a2 2 0 0 1-1.98 0Z\"/><path d=\"M12 2v20\"/>",
    "A2":"<path d=\"m17 2 4 4-4 4\"/><path d=\"M3 11v-1a4 4 0 0 1 4-4h14\"/><path d=\"m7 22-4-4 4-4\"/><path d=\"M21 13v1a4 4 0 0 1-4 4H3\"/>",
    "A3":"<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2\"/><path d=\"M12 20v2\"/><path d=\"m4.93 4.93 1.41 1.41\"/><path d=\"m17.66 17.66 1.41 1.41\"/><path d=\"M2 12h2\"/><path d=\"M20 12h2\"/><path d=\"m6.34 17.66-1.41 1.41\"/><path d=\"m19.07 4.93-1.41 1.41\"/>",
    "A4":"<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"6\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/>",
    "A5":"<path d=\"M12 3v18\"/><path d=\"M3 12h18\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/>",
    "A6":"<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\"/><rect width=\"7\" height=\"7\" x=\"14\" y=\"3\" rx=\"1\"/><rect width=\"7\" height=\"7\" x=\"14\" y=\"14\" rx=\"1\"/><rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\"/>",
    "A7":"<path d=\"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z\"/><circle cx=\"12\" cy=\"12\" r=\"10\"/>",
    "A8":"<path d=\"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z\"/><path d=\"M20 3v4\"/><path d=\"M22 5h-4\"/><path d=\"M4 17v2\"/><path d=\"M5 18H3\"/>",
    "A9":"<path d=\"M18 6 7 17l-5-5\"/><path d=\"m22 10-7.5 7.5L13 16\"/>",
    "A10":"<path d=\"m12 14 4-4\"/><path d=\"M3.34 19a10 10 0 1 1 17.32 0\"/>",
    "B1":"<line x1=\"3\" x2=\"21\" y1=\"22\" y2=\"22\"/><line x1=\"6\" x2=\"6\" y1=\"18\" y2=\"11\"/><line x1=\"10\" x2=\"10\" y1=\"18\" y2=\"11\"/><line x1=\"14\" x2=\"14\" y1=\"18\" y2=\"11\"/><line x1=\"18\" x2=\"18\" y1=\"18\" y2=\"11\"/><polygon points=\"12 2 20 7 4 7\"/>",
    "B2":"<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
    "B4":"<path d=\"M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14\"/><path d=\"m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9\"/><path d=\"m2 13 6 6\"/>",
    "B5":"<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"/>",
    "B6":"<path d=\"M13 4h3a2 2 0 0 1 2 2v14\"/><path d=\"M2 20h3\"/><path d=\"M13 20h9\"/><path d=\"M10 12v.01\"/><path d=\"M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z\"/>",
    "B7":"<circle cx=\"6\" cy=\"19\" r=\"3\"/><path d=\"M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15\"/><circle cx=\"18\" cy=\"5\" r=\"3\"/>",
    "B8":"<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/><path d=\"M20 3v4\"/><path d=\"M22 5h-4\"/>",
    "C1":"<path d=\"M21 12h-8\"/><path d=\"M21 6H8\"/><path d=\"M21 18h-8\"/><path d=\"M3 6v4c0 1.1.9 2 2 2h3\"/><path d=\"M3 10v6c0 1.1.9 2 2 2h3\"/>",
    "C2":"<path d=\"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z\"/><path d=\"M15 5.764v15\"/><path d=\"M9 3.236v15\"/>",
    "C3":"<path d=\"M7.9 20A9 9 0 1 0 4 16.1L2 22Z\"/>",
    "C4":"<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M3 7V5a2 2 0 0 1 2-2h2\"/><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"/><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"/><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"/>",
    "C7":"<path d=\"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z\"/>",
    "C8":"<path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"/><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"/><path d=\"M4 22h16\"/><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"/><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"/><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"/>",
    "C9":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\"/><path d=\"M18 17V9\"/><path d=\"M13 17V5\"/><path d=\"M8 17v-3\"/>",
    "C10":"<line x1=\"21\" x2=\"14\" y1=\"4\" y2=\"4\"/><line x1=\"10\" x2=\"3\" y1=\"4\" y2=\"4\"/><line x1=\"21\" x2=\"12\" y1=\"12\" y2=\"12\"/><line x1=\"8\" x2=\"3\" y1=\"12\" y2=\"12\"/><line x1=\"21\" x2=\"16\" y1=\"20\" y2=\"20\"/><line x1=\"12\" x2=\"3\" y1=\"20\" y2=\"20\"/><line x1=\"14\" x2=\"14\" y1=\"2\" y2=\"6\"/><line x1=\"8\" x2=\"8\" y1=\"10\" y2=\"14\"/><line x1=\"16\" x2=\"16\" y1=\"18\" y2=\"22\"/>",
    "D2":"<path d=\"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5\"/><path d=\"M9 18h6\"/><path d=\"M10 22h4\"/>",
    "D3":"<path d=\"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z\"/><line x1=\"4\" x2=\"4\" y1=\"22\" y2=\"15\"/>",
    "D1":"<path d=\"M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z\"/><path d=\"M16 8 2 22\"/><path d=\"M17.5 15H9\"/>"};
  var FAM_ICO = {
    A: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    B: '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
    C: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
    D: '<path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/>',
    P: '<path d="M12 3v18"/><path d="M3 12h18"/><rect x="3" y="3" width="18" height="18" rx="2"/>',
    T: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    L: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    IDX: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>'
  };
  /* the close and minimize icons (Lucide, ISC): a text × sits off the middle of its button, a line did not read as
     minimize */
  var ICON = { close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', minimize: '<path d="m14 10 7-7"/><path d="M20 10h-6V4"/><path d="m3 21 7-7"/><path d="M4 14h6v6"/>' };
  var svgIco = function (paths, cls) { return '<svg class="' + cls + '" viewBox="0 0 24 24" aria-hidden="true">' + paths + '</svg>'; };
  var ico = function (c, cls) { return CODEX_ICO[c] ? svgIco(CODEX_ICO[c], cls || 'codex-door_icon') : ''; };
  var plural = function (n) { return n + (n === 1 ? TEXT.tab : TEXT.tabs); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); };
  var slugify = function (s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); };

  /* the entries, from the hidden Collection List */
  var ENTRIES = new Map(), BY_SLUG = new Map();
  $$('[data-codex-data] [data-code]').forEach(function (el) {
    var e = { code: el.dataset.code, slug: el.dataset.slug, fam: el.dataset.family, title: el.dataset.title, short: el.dataset.short || el.dataset.title };
    if (!e.code || !e.slug) return;
    ENTRIES.set(e.code, e); BY_SLUG.set(e.slug, e);
  });
  ENTRIES.set('IDX', { code: 'IDX', slug: 'index', fam: '', title: TEXT.index, short: TEXT.index });
  BY_SLUG.set('index', ENTRIES.get('IDX'));

  if (dockMin) dockMin.innerHTML = svgIco(ICON.minimize, 'dock_minimize-icon');
  /* the reader's own minimize button, at its top right corner (João, 03/10/2026: the modal had none; the one in the
     dock stays). Built here, like the tabs, so its styles are in the page's Embed (.codex_minimize). */
  var panelMin = document.createElement('button');
  panelMin.type = 'button'; panelMin.className = 'codex_minimize'; panelMin.setAttribute('aria-label', TEXT.minimize);
  panelMin.innerHTML = svgIco(ICON.minimize, 'dock_minimize-icon');
  panel.appendChild(panelMin);
  /* elements that start hidden: the paste drops the hidden attribute, so they carry data-start-hidden until now */
  $$('[data-start-hidden]').forEach(function (el) { el.hidden = true; el.removeAttribute('data-start-hidden'); });

  var inertTargets = [$('.nav_component'), $('main'), $('footer'), $('.skip-link')];
  var MAX_CHIPS = 4, tabs = [], active = null, isOpen = false, opener = null, anim = null;
  var reduce = function () { return mqReduce.matches; };

  var scrollZones = [];
  function preventScroll(e) { for (var i = 0; i < scrollZones.length; i++) if (scrollZones[i].contains(e.target)) return; e.preventDefault(); }
  function lockScroll() {
    scrollZones = Array.prototype.slice.call(arguments);
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('wheel', preventScroll, { passive: false });
  }
  function unlockScroll() {
    scrollZones = [];
    document.documentElement.style.overflow = '';
    document.removeEventListener('touchmove', preventScroll);
    document.removeEventListener('wheel', preventScroll);
  }

  var doors = function (list) {
    return '<div class="learn-more_component">' + list.map(function (e) {
      return '<button class="codex-door_component" type="button" data-codex="' + e.code + '">' + ico(e.code) + esc(e.title) + '</button>';
    }).join('') + '</div>';
  };
  var inFamily = function (name) { return Array.from(ENTRIES.values()).filter(function (e) { return e.fam === name; }); };

  if (indexEl) indexEl.innerHTML = '<button class="codex_link is-index" type="button" data-codex="IDX"><span class="codex_link-code">' + svgIco(FAM_ICO.IDX, 'codex_icon') + '</span><span>' + TEXT.index + '</span></button>' +
    FAMILIES.map(function (f) {
      return '<div class="codex_family"><p class="codex_family-title">' + f[1] + '</p><div class="codex_family-list">' + inFamily(f[0]).map(function (e) {
        return '<button class="codex_link" type="button" data-codex="' + e.code + '"><span class="codex_link-code">' + (ico(e.code, 'codex_icon') || (f[4] === 'T' ? e.code : '')) + '</span><span>' + esc(e.title) + '</span></button>';
      }).join('') + '</div></div>';
    }).join('');

  function indexHTML() {
    return '<article class="article_component"><div class="article_meta"><span class="section-label_dot"></span><span>' + TEXT.indexMeta + '</span></div>' +
      '<h1 class="article_title" tabindex="-1">' + TEXT.index + '</h1><p class="article_index-intro">' + TEXT.indexIntro + '</p>' +
      '<div class="article_index-grid">' + FAMILIES.map(function (f) {
        var items = inFamily(f[0]), n = items.length;
        return '<details class="family_card"><summary class="family_header"><span class="family_icon">' + svgIco(FAM_ICO[f[4]], 'family_icon-graphic') + '</span>' +
          '<span class="family_text"><span class="family_name">' + f[1] + '</span><span class="family_description">' + f[2] + '</span></span>' +
          '<span class="family_count">' + n + ' ' + (n === 1 ? f[3][0] : f[3][1]) + '</span><span class="family_chevron" aria-hidden="true"></span></summary>' + doors(items) + '</details>';
      }).join('') + '</div></article>';
  }

  /* the article of an entry is the article of its CMS page; the parts the page hides by CSS are taken out here, and
     the cover position (a style rule on the page) becomes the image's own style, so panes do not share it */
  var cache = new Map();
  function loadArticle(e) {
    if (!cache.has(e.slug)) cache.set(e.slug, fetch('/codex/' + e.slug, { credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var art = doc.querySelector('.article_component');
      if (!art) throw new Error('no article');
      var pos = '';
      $$('style', art).forEach(function (s) { var m = s.textContent.match(/object-position:\s*([^;}]+)/); if (m) pos = m[1].trim(); s.parentNode.removeChild(s); });
      var img = $('.article_cover .media-cover', art);
      if (img && pos) img.style.objectPosition = pos;
      $$('.w-dyn-bind-empty', art).forEach(function (el) { var cover = el.closest('.article_cover'); (cover || el).remove(); });
      if (art.dataset.family !== 'Archetypes') $$('.article_type', art).forEach(function (el) { el.remove(); });
      $$('.w-condition-invisible', art).forEach(function (el) { el.remove(); });
      /* /es and /pt: the title, the phrase and the body come from the hidden block of the entry page (article_i18n,
         bound to the CMS fields name-es, phrase-es, body-es...), and the family name, the related heading and the
         names of the related entries from this page's language; the block goes away in every language */
      var store = $('.article_i18n', art);
      if (LANG !== 'en' && store) {
        var pick = function (k) { return $('[data-i18n="' + k + '-' + LANG + '"]', store); };
        var t = pick('title'), ph = pick('phrase'), bd = pick('body');
        var h = $('.article_title', art), p = $('.article_phrase', art), b = $('.article_body', art);
        if (t && h && t.textContent.trim()) h.textContent = t.textContent;
        if (ph && p) p.textContent = ph.textContent;
        if (bd && b && bd.innerHTML.trim()) b.innerHTML = bd.innerHTML;
      }
      if (store) store.remove();
      if (LANG !== 'en') {
        var meta = $$('.article_meta span', art).filter(function (sp) { return !sp.classList.contains('section-label_dot'); })[0];
        if (meta) meta.textContent = familyName(meta.textContent.trim());
        var rel = $('.article_related h3', art); if (rel) rel.textContent = TEXT.moreInCodex;
        $$('.article_related a[href^="/codex/"]', art).forEach(function (a) { var x = BY_SLUG.get(a.getAttribute('href').slice(7)); if (x) a.textContent = x.title; });
      }
      var h1 = $('.article_title', art); if (h1) h1.setAttribute('tabindex', '-1');
      /* archetypes: the god and the goddess of the type, from its card on the Home (the prototype's reader showed them;
         the CMS has no field for them) */
      var card = e.fam === 'Archetypes' ? document.querySelector('.personality-types_card[data-codex="' + e.code + '"]') : null;
      if (card) {
        var duo = doc.createElement('div');
        duo.className = 'deities_duo'; duo.setAttribute('aria-hidden', 'true');
        duo.innerHTML = $$('.personality-types_deity-image', card).map(function (img) {
          var slug = img.dataset.deity || '';
          return '<figure class="deities_portrait"><img src="' + esc(img.currentSrc || img.src) + '" alt="" loading="lazy"><figcaption>' + esc(slug.charAt(0).toUpperCase() + slug.slice(1)) + '</figcaption></figure>';
        }).join('');
        art.insertBefore(duo, art.firstChild);
      }
      return art.outerHTML;
    }));
    return cache.get(e.slug);
  }

  function layoutChips() {
    var limit = !isOpen && !mqMobile.matches;
    var hidden = limit ? Math.max(0, tabs.length - MAX_CHIPS) : 0;
    tabs.forEach(function (t, i) { t.tab.classList.toggle('is-overflow', i < hidden); });
    if (dockMore) { dockMore.hidden = !hidden; dockMore.textContent = '+' + hidden; dockMore.setAttribute('aria-label', TEXT.more(plural(hidden))); }
  }
  function updateCounts() {
    var n = tabs.length;
    if (navCount) { navCount.hidden = !n; navCount.textContent = n; }
    if (dockCount) { dockCount.hidden = !n; dockCount.textContent = n; }
    if (dockHome) dockHome.setAttribute('aria-label', n ? TEXT.dockIndexOpen + plural(n) : TEXT.dockIndex);
    var open = function (code) { return tabs.some(function (t) { return t.code === code; }); };
    $$('.personality-types_card').forEach(function (c) { c.classList.toggle('is-open-tab', open(c.dataset.codex)); });
    $$('main .codex-door_component[data-codex]').forEach(function (p) { p.classList.toggle('is-open', open(p.dataset.codex)); });
    if (indexEl) $$('.codex_link', indexEl).forEach(function (l) { l.classList.toggle('is-current', l.dataset.codex === active); });
    layoutChips();
  }

  function setHash(e, replace) {
    var want = '#codex/' + e.slug;
    if (location.hash === want) return;
    try { history[replace ? 'replaceState' : 'pushState']({ codex: e.code }, '', want); } catch (_) { location.hash = want; }
  }
  function clearHash() { if (!location.hash) return; try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {} }

  /* a heading of the article by its name (links /codex/<slug>#<section>), headings first, then bold text */
  function scrollToSection(rec, section) {
    var found = null;
    [$$('.article_body h2, .article_body h3', rec.pane), $$('.article_body strong', rec.pane)].some(function (list) {
      found = list.filter(function (h) { return slugify(h.textContent) === section; })[0] || null; return !!found;
    });
    if (!found) return;
    rec.pane.scrollTop += found.getBoundingClientRect().top - rec.pane.getBoundingClientRect().top - 24;
    found.setAttribute('tabindex', '-1');
    found.focus({ preventScroll: true });
  }

  function createTab(code) {
    var e = ENTRIES.get(code);
    var tab = document.createElement('div');
    tab.className = 'codex_tab'; tab.dataset.code = code;
    tab.innerHTML = '<button class="codex_tab-button" type="button" role="tab" id="tab-' + code + '" aria-controls="pane-' + code + '" aria-selected="false" title="' + esc(e.title) + '">' +
      '<span class="codex_tab-code">' + (code === 'IDX' ? svgIco(FAM_ICO.IDX, 'codex_icon') : (ico(code, 'codex_icon') || (e.fam === 'Archetypes' ? code : ''))) + '</span><span class="codex_tab-title">' + esc(e.short) + '</span></button>' +
      '<button class="codex_tab-close" type="button" aria-label="' + esc(TEXT.closeTab + e.title) + '">' + svgIco(ICON.close, 'codex_tab-close-icon') + '</button>';
    var pane = document.createElement('div');
    pane.className = 'codex_pane'; pane.id = 'pane-' + code;
    pane.setAttribute('role', 'tabpanel'); pane.setAttribute('aria-labelledby', 'tab-' + code);
    pane.hidden = true;
    var rec = { code: code, tab: tab, pane: pane, scroll: 0, ready: null };
    if (code === 'IDX') { pane.innerHTML = indexHTML(); rec.ready = Promise.resolve(); } else {
      pane.innerHTML = '<article class="article_component"><p class="article_phrase">' + TEXT.loading + '</p></article>';
      rec.ready = loadArticle(e).then(function (html) { pane.innerHTML = html; }, function () {
        pane.innerHTML = '<article class="article_component"><h1 class="article_title" tabindex="-1">' + esc(e.title) + '</h1><p class="article_phrase">' + TEXT.failed + '</p>' +
          '<p><a href="/codex/' + e.slug + '">' + TEXT.openPage + '</a></p></article>';
      }).then(function () { if (active === code && isOpen) { var h = $('.article_title', pane); if (h) h.focus({ preventScroll: true }); } });
    }
    $('.codex_tab-button', tab).addEventListener('click', function () { if (!isOpen) show(tab); activate(code, { focus: isOpen }); });
    $('.codex_tab-close', tab).addEventListener('click', function (ev) { ev.stopPropagation(); closeTab(code); });
    tabsEl.appendChild(tab); panesEl.appendChild(pane);
    tabs.push(rec);
    return rec;
  }

  function activate(code, opts) {
    opts = opts || {};
    var rec = tabs.filter(function (t) { return t.code === code; })[0];
    if (!rec) return;
    var prev = tabs.filter(function (t) { return t.code === active; })[0];
    if (prev && prev !== rec) { prev.scroll = prev.pane.scrollTop; prev.pane.hidden = true; prev.tab.classList.remove('is-active'); $('.codex_tab-button', prev.tab).setAttribute('aria-selected', 'false'); }
    active = code;
    rec.pane.hidden = false; rec.pane.scrollTop = rec.scroll;
    rec.tab.classList.add('is-active');
    $('.codex_tab-button', rec.tab).setAttribute('aria-selected', 'true');
    var tr = rec.tab.getBoundingClientRect(), sr = tabsEl.getBoundingClientRect();
    if (tr.left < sr.left || tr.right > sr.right) tabsEl.scrollLeft += (tr.left - sr.left) - 8;
    if (isOpen && !opts.noHash) setHash(ENTRIES.get(code), opts.replace);
    if (opts.focus) { var h = $('.article_title', rec.pane); if (h) h.focus({ preventScroll: true }); }
    updateCounts();
  }

  /* the chip is born at the click point and flies to the dock (Flip, .5s), while the reader rises */
  function fly(rec, pt) {
    if (reduce() || !gsap || !pt) return;
    var chip = rec.tab, w = chip.offsetWidth, h = chip.offsetHeight;
    if (!w) return;
    if (Flip) {
      chip.classList.add('is-flying');
      chip.style.left = (pt.x - w / 2) + 'px'; chip.style.top = (pt.y - h / 2) + 'px'; chip.style.width = w + 'px';
      var start = Flip.getState(chip);
      chip.classList.remove('is-flying'); chip.style.left = chip.style.top = chip.style.width = '';
      Flip.from(start, { duration: .5, ease: 'power2.inOut', absolute: true, zIndex: 2300, scale: false });
    } else {
      var r = chip.getBoundingClientRect();
      gsap.from(chip, { x: pt.x - (r.left + w / 2), y: pt.y - (r.top + h / 2), duration: .5, ease: 'power2.inOut' });
    }
  }

  function openTab(code, from, opts) {
    opts = opts || {};
    var e = ENTRIES.get(code);
    if (!e) return;
    var rec = tabs.filter(function (t) { return t.code === code; })[0];
    var isNew = !rec;
    if (isNew) rec = createTab(code);
    var wasOpen = isOpen;
    if (!isOpen) show(from, true);
    activate(code, { replace: opts.replace, noHash: opts.noHash, focus: true });
    if (!wasOpen && !opts.noHash) setHash(e, opts.replace);
    if (isNew) { tabsEl.scrollLeft = tabsEl.scrollWidth; fly(rec, opts.pt); }
    if (opts.section) rec.ready.then(function () { scrollToSection(rec, opts.section); });
    say(isNew ? TEXT.opened + e.title + '. ' + plural(tabs.length) + TEXT.inCodex : TEXT.focused + e.title + '.');
  }

  function show(from, skipActivate) {
    if (!isOpen) opener = from || document.activeElement;
    isOpen = true;
    if (anim) anim.kill();
    panel.hidden = false; if (backdrop) backdrop.hidden = false;
    dock.classList.add('is-open'); if (dockMin) dockMin.hidden = false;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'codex-title');
    inertTargets.forEach(function (el) { if (el) el.inert = true; });
    lockScroll(panel, tabsEl);
    var a = tabs.filter(function (t) { return t.code === active; })[0];
    if (a) a.pane.scrollTop = a.scroll;
    if (gsap && !reduce()) {
      anim = gsap.timeline()
        .fromTo(panel, { clipPath: 'inset(100% 0% 0% 0% round 20px)', y: 24 }, { clipPath: 'inset(0% 0% 0% 0% round 20px)', y: 0, duration: .5, ease: 'power2.inOut' }, 0)
        .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: .5, ease: 'power2.inOut' }, 0);
    } else { panel.style.clipPath = ''; if (backdrop) backdrop.style.opacity = 1; }
    updateCounts();
    if (!skipActivate && a) { setHash(ENTRIES.get(a.code)); var h = $('.article_title', a.pane); if (h) h.focus({ preventScroll: true }); }
  }

  function hide() {
    if (!isOpen) return;
    var a = tabs.filter(function (t) { return t.code === active; })[0];
    if (a) a.scroll = a.pane.scrollTop;
    isOpen = false;
    root.removeAttribute('role'); root.removeAttribute('aria-modal'); root.removeAttribute('aria-labelledby');
    unlockScroll();
    inertTargets.forEach(function (el) { if (el) el.inert = false; });
    clearHash();
    dock.classList.remove('is-open'); if (dockMin) dockMin.hidden = true;
    var done = function () { panel.hidden = true; if (backdrop) backdrop.hidden = true; };
    if (anim) anim.kill();
    if (gsap && !reduce()) {
      anim = gsap.timeline({ onComplete: done })
        .to(panel, { clipPath: 'inset(100% 0% 0% 0% round 20px)', y: 24, duration: .5, ease: 'power2.inOut' }, 0)
        .to(backdrop, { opacity: 0, duration: .5, ease: 'power2.inOut' }, 0);
    } else done();
    updateCounts();
    var back = opener && document.contains(opener) && !opener.closest('[data-codex-panel]') ? opener : dockHome;
    if (back) back.focus({ preventScroll: true });
    opener = null;
  }
  function minimize() { hide(); say(TEXT.minimized + plural(tabs.length) + TEXT.kept); }

  function closeTab(code) {
    var i = tabs.findIndex(function (t) { return t.code === code; });
    if (i < 0) return;
    var rec = tabs[i];
    rec.tab.remove(); rec.pane.remove();
    tabs.splice(i, 1);
    var title = ENTRIES.get(code).title;
    if (!tabs.length) { active = null; hide(); updateCounts(); say(TEXT.lastClosed + title + TEXT.dockEmpty); return; }
    if (active === code) {
      active = null;
      var next = tabs[Math.min(i, tabs.length - 1)];
      if (isOpen) { activate(next.code, { replace: true }); var b = $('.codex_tab-button', next.tab); if (b) b.focus(); }
      else activate(next.code, { noHash: true });
    }
    updateCounts();
    say(TEXT.closed + title + '. ' + plural(tabs.length) + TEXT.inCodex);
  }

  var pointOf = function (ev, el) {
    if (ev.clientX || ev.clientY) return { x: ev.clientX, y: ev.clientY };
    var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  /* any [data-codex] opens (or focuses) its tab; inside the reader, a link to /codex/<slug> does the same */
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-codex]');
    if (t) { ev.preventDefault(); openTab(t.dataset.codex, t, { pt: pointOf(ev, t), section: t.dataset.section }); return; }
    var a = ev.target.closest('[data-codex-panes] a[href]');
    if (!a || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
    var url = new URL(a.getAttribute('href'), location.href), m = url.pathname.match(/^\/codex\/([a-z0-9-]+)\/?$/);
    var e = m && url.origin === location.origin && BY_SLUG.get(m[1]);
    if (!e) return;
    ev.preventDefault();
    openTab(e.code, a, { pt: pointOf(ev, a), section: url.hash ? decodeURIComponent(url.hash.slice(1)) : '' });
  });
  if (dockHome) dockHome.addEventListener('click', function (ev) { openTab('IDX', dockHome, { pt: pointOf(ev, dockHome) }); });
  if (dockMore) dockMore.addEventListener('click', function () { show(dockMore); });
  if (dockMin) dockMin.addEventListener('click', minimize);
  panelMin.addEventListener('click', minimize);
  if (backdrop) backdrop.addEventListener('click', minimize);
  if (mqMobile.addEventListener) mqMobile.addEventListener('change', layoutChips);

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { if (isOpen) { ev.preventDefault(); minimize(); } return; }
    if (!isOpen) return;
    if (ev.key === 'Tab') {
      var f = [panel, dock].reduce(function (all, z) { return all.concat($$('button, a[href], summary, [tabindex]:not([tabindex="-1"])', z)); }, [])
        .filter(function (el) { return !el.closest('[hidden]') && el.offsetParent !== null && !el.hidden; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1], inside = f.indexOf(document.activeElement) >= 0;
      if (ev.shiftKey && (document.activeElement === first || !inside)) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && (document.activeElement === last || !inside)) { ev.preventDefault(); first.focus(); }
    }
    if ((ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') && ev.target.matches('.codex_tab-button')) {
      var i = tabs.findIndex(function (t) { return t.code === active; });
      var n = tabs[(i + (ev.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      activate(n.code); $('.codex_tab-button', n.tab).focus();
    }
  });

  /* #codex/<slug> opens that tab: on load, on back and forward, and from the nav of the other pages (/#codex/index) */
  function fromHash() {
    var m = location.hash.match(/^#codex\/([a-z0-9-]+)$/);
    if (m) { var e = BY_SLUG.get(m[1]); if (e) { openTab(e.code, null, { replace: true }); return; } }
    if (isOpen && !m) hide();
  }
  addEventListener('popstate', fromHash);
  addEventListener('hashchange', fromHash);
  if (/^#codex\//.test(location.hash)) setTimeout(fromHash, reduce() ? 0 : 300);
  updateCounts();

  window.OlimpoCodex = {
    open: function (code) { openTab(code, null); }, close: closeTab, minimize: minimize,
    state: function () { return { open: isOpen, active: active, tabs: tabs.map(function (t) { return t.code; }), hash: location.hash, entries: ENTRIES.size }; }
  };
})();
