/* Cookie notice and Google Analytics behind the visitor's choice (12/10/2026), as on olimpoap.com (olimpo-react,
   landing/js/consent.js and landing/js/ga.js), for the Webflow landing, which mirrors that site (João, 12/10/2026).
   This landing is a portfolio piece: the measurement id below is a demonstration one, and with a demonstration id
   Google's gtag.js is never added to the page, so nothing is sent to Google here. With a real id the same code
   measures: GA4 with Consent Mode v2, everything denied until the visitor accepts statistics, gtag.js added only then.
   The notice ([data-cookie], Webflow element cookie_component) shows until the visitor picks; "Manage cookies" in the
   footer ([data-cookie-open]) opens it again on the preferences. The choice is kept in the cookie
   'olimpo-cookie-consent' = { v, at, preferences, statistics, marketing } and sent in the 'olimpo:cookie-consent'
   event. */
(function () {
  var ID = 'G-XXXXXXXXXX';
  var DEMO = /X{6,}/.test(ID);
  var KEY = 'olimpo-cookie-consent';
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('js', new Date());
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied', functionality_storage: 'denied',
    personalization_storage: 'denied', security_storage: 'granted'
  });
  function consentFrom(c) {
    return {
      analytics_storage: c.statistics ? 'granted' : 'denied',
      functionality_storage: c.preferences ? 'granted' : 'denied',
      personalization_storage: c.preferences ? 'granted' : 'denied',
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied'
    };
  }
  /* the config goes into the queue after the consent update, never before: queued first, the first page_view leaves
     as a hit without consent (measured on olimpoap.com, 12/10/2026) */
  var loaded = false, configured = false;
  function load() {
    if (loaded || DEMO) return;
    loaded = true;
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
  }
  function clearGoogleCookies() {
    var host = location.hostname, domains = ['', host, '.' + host, '.' + host.split('.').slice(-2).join('.')];
    document.cookie.split('; ').forEach(function (pair) {
      var name = pair.split('=')[0];
      if (!/^(_ga|_gid|_gat|_gcl)/.test(name)) return;
      domains.forEach(function (d) { document.cookie = name + '=; max-age=0; path=/' + (d ? '; domain=' + d : ''); });
    });
  }
  function apply(c) {
    var on = !!(c && c.statistics);
    window['ga-disable-' + ID] = !on;
    gtag('consent', 'update', consentFrom(c || {}));
    if (!on) { clearGoogleCookies(); return; }
    if (!configured) { configured = true; gtag('config', ID, { anonymize_ip: true }); }
    load();
  }
  function read() {
    try {
      var m = document.cookie.match(/(?:^|; )olimpo-cookie-consent=([^;]*)/);
      if (m) return JSON.parse(decodeURIComponent(m[1]));
    } catch (_) {}
    return null;
  }
  var saved = read();
  apply(saved);

  /* the notice */
  var box = document.querySelector('[data-cookie]');
  if (!box) return;
  var prefsButton = box.querySelector('[data-cookie-choice="prefs"]');
  var toggles = [].slice.call(box.querySelectorAll('[data-cookie-toggle]'));
  /* what a screen reader says follows the words on the page, which each language sets (Component props) */
  var title = box.querySelector('.cookie_title');
  if (title) box.setAttribute('aria-label', title.textContent.replace(/.s*$/, ''));
  toggles.forEach(function (t) {
    var name = t.parentNode && t.parentNode.querySelector('.cookie_row-name');
    if (name) t.setAttribute('aria-label', name.textContent);
  });
  function setSwitch(t, on) { t.setAttribute('aria-checked', on ? 'true' : 'false'); }
  function setPrefs(open) {
    box.classList.toggle('is-prefs', open);
    if (prefsButton) prefsButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (!open) return;
    var now = read() || {};
    toggles.forEach(function (t) { setSwitch(t, !!now[t.getAttribute('data-cookie-toggle')]); });
  }
  function show(open) { box.classList.add('is-open'); setPrefs(open); }
  function save(choice) {
    var data = { v: 1, at: Date.now(), preferences: !!choice.preferences, statistics: !!choice.statistics, marketing: !!choice.marketing };
    document.cookie = KEY + '=' + encodeURIComponent(JSON.stringify(data)) + '; max-age=' + (60 * 60 * 24 * 365) + '; path=/; SameSite=Lax';
    document.dispatchEvent(new CustomEvent('olimpo:cookie-consent', { detail: data }));
    apply(data);
    box.classList.remove('is-open', 'is-prefs');
  }
  box.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cookie-toggle]');
    if (t) { setSwitch(t, t.getAttribute('aria-checked') !== 'true'); return; }
    var b = e.target.closest && e.target.closest('[data-cookie-choice]');
    if (!b) return;
    var kind = b.getAttribute('data-cookie-choice');
    if (kind === 'prefs') { setPrefs(!box.classList.contains('is-prefs')); if (box.classList.contains('is-prefs') && toggles[0]) toggles[0].focus(); return; }
    if (kind === 'save') {
      var picked = {};
      toggles.forEach(function (x) { picked[x.getAttribute('data-cookie-toggle')] = x.getAttribute('aria-checked') === 'true'; });
      save(picked); return;
    }
    var all = kind === 'accept';
    save({ preferences: all, statistics: all, marketing: all });
  });
  document.addEventListener('click', function (e) {
    var o = e.target.closest && e.target.closest('[data-cookie-open]');
    if (!o) return;
    e.preventDefault();
    show(true);
    if (toggles[0]) toggles[0].focus();
  });
  if (!saved) show(false);
})();
