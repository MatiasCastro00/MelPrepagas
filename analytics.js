const SendaAnalytics = (() => {
  'use strict';

  const { config } = SendaData;
  const storageKey = 'senda:preferencias:v1';
  const hasGoogle = /^G-[A-Z0-9]+$/.test(config.gaId);
  const hasMeta = /^\d+$/.test(config.pixelId);
  const eventNames = new Set(['quote_start', 'whatsapp_click']);
  let choices = { google: false, meta: false };
  let googleLoaded = false;
  let metaLoaded = false;
  let initialized = false;
  let notice;
  let preferences;
  function loadScript(src) {
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    document.head.append(script);
  }
  function campaignFields() {
    const query = new URLSearchParams(location.search);
    const fields = {};
    const parameters = { source: 'source', medium: 'medium', campaign: 'name', content: 'content', term: 'term' };
    for (const [key, field] of Object.entries(parameters)) {
      const value = query.get('utm_' + key);
      if (value && /^[\w .+/-]{1,100}$/u.test(value)) fields['campaign_' + field] = value;
    }
    return fields;
  }
  function applyChoices() {
    if (hasGoogle) window['ga-disable-' + config.gaId] = !choices.google;
    if (hasGoogle && choices.google && !googleLoaded) {
      googleLoaded = true;
      window.dataLayer ||= [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', config.gaId, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: location.origin + location.pathname,
        ...campaignFields(),
      });
      loadScript('https://www.googletagmanager.com/gtag/js?id=' + config.gaId);
    }
    if (hasMeta && choices.meta && !metaLoaded) {
      metaLoaded = true;
      const fbq = function () {
        if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
        else fbq.queue.push(arguments);
      };
      window.fbq = window._fbq = fbq;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [];
      fbq('set', 'autoConfig', false, config.pixelId);
      fbq('init', config.pixelId);
      fbq('track', 'PageView');
      loadScript('https://connect.facebook.net/en_US/fbevents.js');
    }
    if (metaLoaded) window.fbq('consent', choices.meta ? 'grant' : 'revoke');
  }
  function trackEvent(name) {
    if (!eventNames.has(name)) return;
    if (choices.google && googleLoaded) window.gtag('event', name, campaignFields());
    if (choices.meta && metaLoaded) window.fbq('trackCustom', name, campaignFields());
  }
  function save(google, meta) {
    const removing = (choices.google && !google) || (choices.meta && !meta);
    choices = { google: google && hasGoogle, meta: meta && hasMeta };
    try { localStorage.setItem(storageKey, JSON.stringify(choices)); } catch { /* Memoria de esta visita. */ }
    applyChoices();
    preferences.close();
    notice.hidden = true;
    // Descarta los SDK y sus escuchadores al retirar consentimiento.
    if (removing) location.reload();
  }
  function openMeasurementPreferences() {
    if (!preferences || preferences.open) return;
    preferences.querySelector('[name=google]').checked = choices.google;
    preferences.querySelector('[name=meta]').checked = choices.meta;
    preferences.showModal();
  }
  function initAnalytics() {
    if (initialized || (!hasGoogle && !hasMeta)) return;
    initialized = true;
    let decided = false;
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      if (typeof stored?.google === 'boolean' && typeof stored?.meta === 'boolean') {
        choices = stored;
        decided = true;
      }
    } catch { /* Si el navegador no admite almacenamiento, preguntar en esta visita. */ }
    notice = document.createElement('aside');
    notice.className = 'measurement-notice';
    notice.setAttribute('aria-label', 'Preferencias de medición');
    notice.innerHTML = '<p>¿Nos permitís medir las visitas y los clics de las campañas?</p><div><button type="button" data-settings>Elegir preferencias</button><button type="button" data-deny>Rechazar</button></div>';
    notice.hidden = decided;
    preferences = document.createElement('dialog');
    preferences.className = 'measurement-settings';
    preferences.setAttribute('aria-labelledby', 'measurement-title');
    preferences.innerHTML = `<h2 id="measurement-title">Preferencias de medición</h2>
      <p>Podés cotizar con todas las opciones desactivadas. Estas herramientas miden visitas y clics para evaluar nuestras campañas.</p>
      <label ${hasGoogle ? '' : 'hidden'}><input type="checkbox" name="google"> Permitir Google Analytics</label>
      <label ${hasMeta ? '' : 'hidden'}><input type="checkbox" name="meta"> Permitir Meta Pixel</label>
      <div><button type="button" data-save>Guardar preferencias</button><button type="button" data-close>Cancelar</button></div>`;
    document.body.append(notice, preferences);
    notice.querySelector('[data-settings]').onclick = openMeasurementPreferences;
    notice.querySelector('[data-deny]').onclick = () => save(false, false);
    preferences.querySelector('[data-close]').onclick = () => preferences.close();
    preferences.querySelector('[data-save]').onclick = () => save(
      preferences.querySelector('[name=google]').checked,
      preferences.querySelector('[name=meta]').checked,
    );
    for (const button of document.querySelectorAll('[data-measurement-preferences]')) {
      button.hidden = false;
      button.addEventListener('click', openMeasurementPreferences);
    }
    window.addEventListener('conversion', event => trackEvent(event.detail));
    applyChoices();
  }

  return { initAnalytics, trackEvent };
})();
