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
  const compactCatalog = matchMedia('(max-width: 767px)');
  let activeCard = null;
  let activePlans = [];
  const providerPanels = new Map();
  let desktopPlanAnimations = [];

  function animateDesktopPlans(entering) {
    const frames = [{ opacity: 0 }, { opacity: 1 }];
    if (!entering) frames.reverse();
    return activePlans.map((plan, index) =>
      plan.animate(frames, {
        duration: entering ? 150 : 65,
        delay: index * (entering ? 35 : 15),
        easing: 'ease-out',
        fill: entering ? 'backwards' : 'forwards',
      })
    );
  }

  async function changeDesktopPlans(change, animate) {
    desktopPlanAnimations.forEach(animation => animation.cancel());
    desktopPlanAnimations = [];
    const playMotion = animate && !reducedMotion.matches;
    if (playMotion && !plansPanel.hidden) {
      const leaving = animateDesktopPlans(false);
      desktopPlanAnimations = leaving;
      await Promise.allSettled(leaving.map(animation => animation.finished));
      if (desktopPlanAnimations !== leaving) return;
      leaving.forEach(animation => animation.cancel());
      desktopPlanAnimations = [];
    }
    change();
    if (playMotion && !plansPanel.hidden) desktopPlanAnimations = animateDesktopPlans(true);
  }

  function closePlans() {
    plansPanel.hidden = true;
    activeCard.setAttribute('aria-expanded', 'false');
    catalog.classList.remove('has-selection');
    activeCard.focus();
    activeCard = null;
  }

  function showPlans(provider, card) {
    if (activeCard === card) {
      if (compactCatalog.matches) return;
      closePlans();
      return;
    }

    activeCard?.setAttribute('aria-expanded', 'false');
    activeCard = card;
    card.setAttribute('aria-expanded', 'true');
    catalog.classList.add('has-selection');
    catalog.dataset.tone = provider.tone;

    let panel = providerPanels.get(provider);
    if (!panel) {
      panel = renderProviderPanel(provider);
      providerPanels.set(provider, panel);
    }
    activePlans = [...panel.plans.children];
    activePlans.forEach((plan, index) => {
      plan.open = index === 0;
      plan.style.removeProperty('opacity');
    });
    plansPanel.replaceChildren(panel.header, panel.plans);
    plansPanel.hidden = false;
    if (compactCatalog.matches) {
      updateGalleryArrows(card);
      return;
    }
    const heading = plansPanel.querySelector('h3');
    heading.focus({ preventScroll: true });
    const top = heading.getBoundingClientRect().top;
    if (top < 0 || top > innerHeight - 180) {
      plansPanel.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    }
  }

  function renderProviderPanel(provider) {
    const header = element('header', '', 'company-plans-header');
    const heading = element('h3', provider.name);
    heading.id = 'company-plans-title';
    heading.tabIndex = -1;
    const close = element('button', 'Ver todas', 'text-link');
    close.type = 'button';
    close.onclick = event => {
      const animate = event.detail > 0;
      changeDesktopPlans(closePlans, animate);
    };
    const icon = element('img', '', 'company-brand-icon');
    icon.src = 'assets/cabecera-' + provider.id + '.png';
    icon.alt = '';
    header.append(heading, icon, close);

    const plans = element('div', '', 'provider-plans');
    plans.append(...provider.plans.map(plan => renderPlan(provider, plan)));
    return { header, plans };
  }

  function renderProvider(provider) {
    const card = element('button', '', 'provider-card');
    card.type = 'button';
    card.dataset.tone = provider.tone;
    card.setAttribute('aria-expanded', 'false');
    card.setAttribute('aria-controls', 'company-plans');

    card.setAttribute('aria-label', 'Planes de ' + provider.name);
    if (provider.image) {
      const picture = element('picture', '', 'provider-picture');
      const compactIcon = element('source');
      compactIcon.media = compactCatalog.media;
      compactIcon.srcset = 'assets/cabecera-' + provider.id + '.png';
      const logo = element('img', '', 'provider-artwork');
      logo.src = provider.image;
      logo.alt = '';
      logo.loading = 'lazy';
      logo.decoding = 'async';
      picture.append(compactIcon, logo);
      card.append(picture);
      if (provider.id === 'doctored') {
        const lockup = element('span', '', 'doctored-desktop-logo');
        const symbol = element('img');
        symbol.src = compactIcon.srcset;
        symbol.alt = '';
        lockup.setAttribute('aria-hidden', 'true');
        lockup.append(symbol, element('span', provider.name));
        card.append(lockup);
      }
    } else {
      card.append(element('span', provider.name, 'provider-wordmark'));
    }
    card.onclick = event => {
      if (compactCatalog.matches) {
        navigateGallery(card);
      } else {
        const animate = event.detail > 0;
        changeDesktopPlans(() => showPlans(provider, card), animate);
      }
    };
    return card;
  }

  rail.append(...providers.map(renderProvider));
  const gallery = element('div', '', 'provider-gallery');
  rail.before(gallery);
  gallery.append(rail);
  const cards = [...rail.children];
  const brandColors = cards.map(card => getComputedStyle(card).getPropertyValue('--brand').trim());
  let destination = null;
  let frameOnDrag = false;
  let galleryOffsets = [];
  let galleryFrame = 0;
  function stepButton(step, label) {
    const button = element('button', '', 'gallery-step');
    const arrow = element('span', step < 0 ? '‹' : '›');
    arrow.setAttribute('aria-hidden', 'true');
    button.append(arrow);
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.onclick = () => {
      const index = cards.indexOf(destination || activeCard) + step;
      if (cards[index]) navigateGallery(cards[index]);
    };
    gallery.append(button);
    return button;
  }
  const back = stepButton(-1, 'Prepaga anterior');
  const forward = stepButton(1, 'Prepaga siguiente');
  function updateGalleryArrows(card) {
    back.disabled = card === cards[0];
    forward.disabled = card === cards[cards.length - 1];
  }
  function centeredOffset(card) {
    return card.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2;
  }
  function frameGallery() {
    const viewport = window.visualViewport;
    const top = viewport?.offsetTop ?? 0;
    const bottom = top + (viewport?.height ?? innerHeight);
    const banner = gallery.getBoundingClientRect();
    const firstPlan = plansPanel.querySelector('.provider-plan');
    const planBottom = firstPlan?.getBoundingClientRect().bottom ?? banner.bottom;
    const summaryBottom = firstPlan?.querySelector('summary').getBoundingClientRect().bottom ?? banner.bottom;
    const visibleEnd = planBottom - banner.top <= bottom - top - 24 ? planBottom : summaryBottom;
    if (banner.top < top || visibleEnd > bottom) {
      window.scrollBy({
        top: banner.top - top - 12,
        behavior: reducedMotion.matches ? 'instant' : 'smooth',
      });
    }
  }
  function navigateGallery(card) {
    destination = card;
    updateGalleryArrows(card);
    frameGallery();
    const left = centeredOffset(card);
    const instant = reducedMotion.matches || Math.abs(rail.scrollLeft - left) < 1;
    rail.scrollTo({ left, behavior: instant ? 'instant' : 'smooth' });
    if (instant) finishGalleryScroll();
  }
  function syncGallery() {
    cancelAnimationFrame(galleryFrame);
    galleryFrame = 0;
    desktopPlanAnimations.forEach(animation => animation.cancel());
    desktopPlanAnimations = [];
    destination = null;
    frameOnDrag = false;
    clearGalleryEffects();
    if (!compactCatalog.matches || !cards.length) return;
    const card = activeCard || cards[0];
    if (!activeCard) showPlans(providers[0], card);
    galleryOffsets = cards.map(centeredOffset);
    updateGalleryArrows(card);
    rail.scrollTo({ left: centeredOffset(card), behavior: 'instant' });
  }
  function clearGalleryEffects() {
    gallery.style.removeProperty('background-color');
    plansPanel.firstElementChild?.style.removeProperty('background-color');
    activePlans.forEach(plan => plan.style.removeProperty('opacity'));
  }
  function updateGallery() {
    if (!compactCatalog.matches || !cards.length) return;
    const left = rail.scrollLeft;
    const next = galleryOffsets.findIndex(offset => offset >= left);
    const end = next === -1 ? cards.length - 1 : next;
    const start = Math.max(0, end - 1);
    const from = galleryOffsets[start];
    const span = galleryOffsets[end] - from;
    const progress = span ? Math.max(0, Math.min(1, (left - from) / span)) : 0;
    const index = progress < .5 ? start : end;
    if (cards[index] !== activeCard) showPlans(providers[index], cards[index]);
    if (destination) updateGalleryArrows(destination);
    if (reducedMotion.matches) return;
    const color = 'color-mix(in srgb, ' + brandColors[start] + ', ' + brandColors[end] + ' ' + progress * 100 + '%)';
    gallery.style.backgroundColor = color;
    plansPanel.firstElementChild.style.backgroundColor = color;
    const reveal = Math.abs(2 * progress - 1);
    activePlans.forEach((plan, order) => {
      const stagger = .4 * order / Math.max(1, activePlans.length - 1);
      const opacity = Math.max(0, Math.min(1, (reveal - stagger) / .6));
      plan.style.opacity = opacity;
    });
  }
  function finishGalleryScroll() {
    cancelAnimationFrame(galleryFrame);
    galleryFrame = 0;
    destination = null;
    updateGallery();
    clearGalleryEffects();
  }
  rail.addEventListener('pointerdown', () => { frameOnDrag = true; });
  rail.addEventListener('scroll', () => {
    if (frameOnDrag && compactCatalog.matches) {
      frameOnDrag = false;
      frameGallery();
    }
    if (!galleryFrame) {
      galleryFrame = requestAnimationFrame(() => {
        galleryFrame = 0;
        updateGallery();
      });
    }
  }, { passive: true });
  reducedMotion.addEventListener('change', syncGallery);
  if ('onscrollend' in rail) {
    rail.addEventListener('scrollend', finishGalleryScroll);
  } else {
    let settleTimer;
    rail.addEventListener('scroll', () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(finishGalleryScroll, 150);
    }, { passive: true });
  }
  compactCatalog.addEventListener('change', syncGallery);
  syncGallery();
  new ResizeObserver(() => {
    if (compactCatalog.matches) galleryOffsets = cards.map(centeredOffset);
  }).observe(rail);
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



