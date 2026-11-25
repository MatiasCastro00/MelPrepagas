(() => {
  'use strict';

  const { config, navigation, providers } = SendaData;
  const { openQuote } = SendaQuote;
  const { initAnalytics, trackEvent } = SendaAnalytics;
  const info = document.querySelector('#info');
  const catalog = document.querySelector('#companies');
  function element(tag, content, className) {
    const node = document.createElement(tag);
    if (content) node.textContent = content;
    if (className) node.className = className;
    return node;
  }
  function startQuote(provider = '', coverage = '', plan = '') {
    trackEvent('quote_start');
    openQuote(provider, coverage, plan);
  }
  function showInfo(title, paragraphs) {
    document.querySelector('#infoTitle').textContent = title;
    document.querySelector('#infoBody').replaceChildren(...paragraphs.map(text => element('p', text)));
    info.showModal();
  }
  function contact() {
    if (!/^[1-9]\d{6,14}$/.test(config.whatsapp)) {
      showInfo('Contacto por WhatsApp', ['El número de atención está pendiente de configuración.']);
      return;
    }
    trackEvent('whatsapp_click');
    const message = encodeURIComponent('¡Hola! Quisiera asesoramiento sobre medicina prepaga.');
    window.open('https://wa.me/' + config.whatsapp + '?text=' + message, '_blank', 'noopener,noreferrer');
  }
  function renderPlan(provider, plan) {
    const details = element('details', '', 'provider-plan');
    const summary = element('summary', '', 'plan-summary');
    summary.append(element('span', 'Plan ' + plan.code));
    if (plan.line) summary.append(element('small', plan.line));
    const content = element('div', '', 'plan-content');
    const coverage = element('dl', '', 'coverage-list');
    for (const [name, description] of plan.coverage) {
      const row = element('div');
      row.append(element('dt', name), element('dd', description));
      coverage.append(row);
    }
    const quote = element('button', 'Consultar por el plan ' + plan.code, 'cta');
    quote.type = 'button';
    quote.onclick = () => startQuote(provider.name, '', plan.code);
    content.append(coverage, quote);
    details.append(summary, content);
    return details;
  }
  const plansPanel = document.querySelector('#company-plans');
  const rail = element('div', '', 'brand-rail');
  rail.setAttribute('role', 'group');
  rail.setAttribute('aria-label', 'Prepagas');
  plansPanel.before(rail);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let activeCard = null;

  function moveBrands(change, animate) {
    const cards = [...rail.children];
    const before = cards.map(card => card.getBoundingClientRect());
    cards.forEach(card => card.getAnimations().forEach(animation => animation.cancel()));
    change();
    if (!animate || reducedMotion.matches) return;
    cards.forEach((card, index) => {
      const from = before[index];
      const to = card.getBoundingClientRect();
      const offset = 'translate(' + (from.left - to.left) + 'px,' + (from.top - to.top) + 'px)';
      const scale = 'scale(' + from.width / to.width + ',' + from.height / to.height + ')';
      card.animate([{ transform: offset + ' ' + scale }, { transform: 'none' }], {
        duration: card === activeCard ? 400 : 340,
        easing: 'cubic-bezier(.22,1,.36,1)',
      });
    });
  }

  function closePlans(animate) {
    moveBrands(() => {
      plansPanel.hidden = true;
      activeCard.setAttribute('aria-expanded', 'false');
      catalog.classList.remove('has-selection');
      activeCard.focus({ preventScroll: true });
      activeCard = null;
    }, animate);
  }

  function showPlans(provider, card, animate) {
    if (activeCard === card) {
      closePlans(animate);
      return;
    }

    moveBrands(() => {
      activeCard?.setAttribute('aria-expanded', 'false');
      activeCard = card;
      card.setAttribute('aria-expanded', 'true');
      catalog.classList.add('has-selection');
      plansPanel.dataset.tone = provider.tone;

      const header = element('header', '', 'company-plans-header');
      const heading = element('h3', provider.name);
      heading.id = 'company-plans-title';
      heading.tabIndex = -1;
      const close = element('button', 'Ver todas', 'text-link');
      close.type = 'button';
      close.onclick = event => closePlans(event.detail > 0);
      const icon = element('img', '', 'company-brand-icon');
      icon.src = 'assets/cabecera-' + provider.id + '.png';
      icon.alt = '';
      header.append(heading, icon, close);

      const plans = element('div', '', 'provider-plans');
      plans.append(...provider.plans.map(plan => renderPlan(provider, plan)));
      plans.firstElementChild.open = true;

      plansPanel.replaceChildren(header, plans);

      plansPanel.hidden = false;
    }, animate);
    const heading = plansPanel.querySelector('h3');
    heading.focus({ preventScroll: true });
    const top = heading.getBoundingClientRect().top;
    if (top < 0 || top > innerHeight - 180) {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      plansPanel.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    }
  }

  function renderProvider(provider) {
    const card = element('button', '', 'provider-card');
    card.type = 'button';
    card.dataset.tone = provider.tone;
    card.setAttribute('aria-expanded', 'false');
    card.setAttribute('aria-controls', 'company-plans');

    card.setAttribute('aria-label', 'Planes de ' + provider.name);
    if (provider.image) {
      const logo = element('img', '', 'provider-artwork');
      logo.src = provider.image;
      logo.alt = '';
      card.append(logo);
    } else {
      card.append(element('span', provider.name, 'provider-wordmark'));
    }
    card.onclick = event => showPlans(provider, card, event.detail > 0);
    return card;
  }

  rail.append(...providers.map(renderProvider));

  const explorer = document.querySelector('#prepagas');
  for (const link of document.querySelectorAll('a[href="#prepagas"]')) {
    link.addEventListener('click', navigateToExplorer);
  }
  function navigateToExplorer(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (location.hash !== '#prepagas') history.pushState(null, '', '#prepagas');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    explorer.querySelector('h2').focus({ preventScroll: true });
    explorer.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
  }
  for (const [href, label] of navigation) {
    const link = element('a', label);
    link.href = href;
    if (href === '#prepagas') link.addEventListener('click', navigateToExplorer);
    document.querySelector('#navigation').append(link);
  }
  document.querySelectorAll('[data-brand]').forEach(node => node.textContent = config.brand);
  document.querySelectorAll('[data-quote]').forEach(button => button.onclick = () => startQuote());
  document.querySelectorAll('[data-coverage]').forEach(button => {
    button.onclick = () => startQuote('', button.dataset.coverage);
  });
  if (config.email) {
    const email = element('a', config.email);
    email.href = 'mailto:' + config.email;
    document.querySelector('#email').append(email);
  }
  document.querySelectorAll('#floating,#contact').forEach(button => button.onclick = contact);
  info.querySelector('.close').onclick = () => info.close();
  initAnalytics();
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const advice = document.querySelector('.advice');
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      advice.classList.add('in-view');
      observer.disconnect();
    }, { threshold: .25 });
    observer.observe(advice);
  }
})();



