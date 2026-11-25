const SendaQuote = (() => {
  'use strict';

  const { config, providers } = SendaData;
  const provinces = [
    'Ciudad Autónoma de Buenos Aires', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut',
    'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
    'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
    'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
  ];
  const sentences = {
    individual: 'para mí',
    pareja: 'para mi pareja y para mí',
    familiar: 'para mi familia',
  };
  const jobs = {
    dependencia: 'Recibo de Sueldo',
    monotributo: 'Monotributo',
    particular: 'Plan particular',
  };
  function options(items, prompt) {
    const select = document.createElement('select');
    select.add(new Option(prompt, ''));
    for (const item of items) select.add(new Option(item, item));
    return select.innerHTML;
  }
  function createDialog() {
    const dialog = document.createElement('dialog');
    dialog.className = 'quote-dialog';
    dialog.setAttribute('aria-labelledby', 'quote-heading');
    dialog.innerHTML = `
      <div class="quote-top"><span>Tu cotización</span><button type="button" class="quote-close" aria-label="Cerrar cotización">×</button></div>
      <div class="quote-content">
        <p class="quote-counter"></p>
        <div class="quote-progress" aria-hidden="true"><i></i><i></i><i></i></div>
        <h2 id="quote-heading" tabindex="-1"></h2>
        <form novalidate>
          <section data-step="0">
            <label for="quote-province">Provincia</label>
            <select id="quote-province" name="province" required>${options(provinces, 'Elegí tu provincia')}</select>
            <label for="quote-city">Localidad o barrio</label>
            <input id="quote-city" name="city" autocomplete="address-level2" maxlength="90" required>
          </section>
          <section data-step="1">
            <fieldset><legend>Tipo de cobertura</legend>
              <div class="quote-options">
                <label><input name="type" value="individual" type="radio" required>Individual</label>
                <label><input name="type" value="pareja" type="radio">Pareja</label>
                <label><input name="type" value="familiar" type="radio">Familiar</label>
              </div>
            </fieldset>
            <div class="quote-count" hidden>
              <label for="quote-count">Cantidad de personas</label>
              <input id="quote-count" name="count" type="number" inputmode="numeric" min="2" step="1" value="3">
            </div>
            <div class="quote-ages" hidden>
              <label for="quote-ages">Edades aproximadas</label>
              <p id="quote-age-hint" class="quote-hint"></p>
              <input id="quote-ages" name="ages" required aria-describedby="quote-age-hint">
            </div>
          </section>
          <section data-step="2">
            <label for="quote-job">Situación laboral o modalidad</label>
            <select id="quote-job" name="job" required>
              <option value="">Elegí una opción</option><option value="dependencia">Relación de dependencia</option>
              <option value="monotributo">Monotributista</option><option value="particular">Plan particular</option>
            </select>
            <label for="quote-provider">Prepaga de interés <small>(opcional)</small></label>
            <select id="quote-provider" name="provider">${options(providers.map(p => p.name), 'Quiero comparar opciones')}</select>
            <label for="quote-fullname">Nombre completo</label>
            <input id="quote-fullname" name="fullName" autocomplete="name" required>
            <label for="quote-phone">Número de WhatsApp</label>
            <input id="quote-phone" name="phone" type="tel" autocomplete="tel" required>
            <label for="quote-email">Email</label>
            <input id="quote-email" name="email" type="email" autocomplete="email" required>
          </section>
          <p class="quote-error" id="quote-error" role="alert"></p>
          <div class="quote-actions"><button type="button" class="quote-back">Volver</button>
            <button type="submit" class="quote-next">Continuar</button>
          </div>
        </form>
      </div>`;
    document.body.append(dialog);
    return dialog;
  }
  function openQuote(prepaga = '', coverage = '', plan = '') {
    if (document.querySelector('dialog.quote-dialog[open]')) return;
    const previousFocus = document.activeElement;
    const dialog = createDialog();
    const get = selector => dialog.querySelector(selector);
    const form = get('form');
    const fields = form.elements;
    const sections = Array.from(form.querySelectorAll('[data-step]'));
    const headings = ['¿En qué zona vivís?', '¿Para quién es la cobertura?', '¿Qué opciones buscás?'];
    let step = 0;
    if (providers.some(provider => provider.name === prepaga)) fields.provider.value = prepaga;
    if (Object.hasOwn(sentences, coverage)) {
      fields.type.value = coverage;
      updateHousehold();
    }
    function peopleCount() {
      if (fields.type.value === 'individual') return 1;
      if (fields.type.value === 'pareja') return 2;
      return Number(fields.count.value);
    }
    function updateHousehold() {
      const type = fields.type.value;
      get('.quote-count').hidden = type !== 'familiar';
      get('.quote-ages').hidden = !type;
      const total = peopleCount();
      get('#quote-age-hint').textContent = total === 1
        ? 'Ingresá tu edad en años.'
        : 'Escribí una edad por persona, separada por comas. Para menores de un año, ingresá 0.';
    }
    function clearError() {
      get('.quote-error').textContent = '';
      dialog.querySelectorAll('[aria-invalid]').forEach(el => {
        el.removeAttribute('aria-invalid');
        el.removeAttribute('aria-errormessage');
      });
    }
    function fail(field, message) {
      get('.quote-error').textContent = message;
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-errormessage', 'quote-error');
      field.focus();
      return false;
    }
    function validate() {
      clearError();
      if (step === 0) {
        if (!fields.province.value) return fail(fields.province, 'Elegí la provincia donde vivís.');
        if (!fields.city.value.trim()) return fail(fields.city, 'Escribí tu localidad o barrio.');
      }
      if (step === 1) {
        if (!fields.type.value) return fail(fields.type[0], 'Elegí un tipo de cobertura.');
        const count = peopleCount();
        if (fields.type.value === 'familiar' && (!Number.isSafeInteger(count) || count < 2)) {
          return fail(fields.count, 'Ingresá la cantidad de integrantes, al menos dos.');
        }
        const ages = fields.ages.value.trim().split(/\s*[,;]\s*/);
        if (ages.length !== count || ages.some(age => !/^\d{1,3}$/.test(age) || Number(age) > 125)) {
          return fail(fields.ages, count === 1 ? 'Ingresá una edad aproximada entre 0 y 125 años.' : `Ingresá ${count} edades de 0 a 125 años, separadas por comas.`);
        }
      }
      if (step === 2 && !fields.job.value) return fail(fields.job, 'Elegí tu situación laboral o modalidad.');
      if (step === 2) {
        if (!fields.fullName.value.trim()) return fail(fields.fullName, 'Ingresá tu nombre completo.');
        if (!/^\+?\d{7,15}$/.test(fields.phone.value.replace(/[\s()-]/g, ''))) return fail(fields.phone, 'Ingresá tu número de WhatsApp con código de área.');
        if (!fields.email.validity.valid) return fail(fields.email, 'Ingresá un email válido.');
      }
      return true;
    }
    function openWhatsApp() {
      const province = fields.province.value;
      const location = province === provinces[0] ? 'CABA' : fields.city.value.trim() + ', ' + province;
      const ages = fields.ages.value.trim().split(/\s*[,;]\s*/).map(Number);
      const ageText = ages.map(age => age >= 36 && age <= 49 ? '36 - 49 años' : age + ' años').join(', ');
      const lines = [
        '¡Hola! Completé el formulario y me gustaría obtener más información sobre el negocio.',
        '',
        'Usted vive en:: ' + location,
        'Usted cuenta con:: ' + jobs[fields.job.value],
        'La persona para la cual cotizarle tiene:: ' + ageText,
        'Full name: ' + fields.fullName.value.trim(),
        'WhatsApp number: ' + fields.phone.value.trim(),
        'Email: ' + fields.email.value.trim(),
      ];
      if (fields.provider.value) lines.push('Prepaga: ' + fields.provider.value);
      if (plan && fields.provider.value === prepaga) lines.push('Plan: ' + plan);
      const message = lines.join('\n');
      if (!/^[1-9]\d{6,14}$/.test(config.whatsapp)) {
        get('.quote-error').textContent = 'El contacto de WhatsApp está pendiente de configuración.';
        return;
      }
      const url = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`;
      window.dispatchEvent(new CustomEvent('conversion', { detail: 'whatsapp_click' }));
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    function render() {
      clearError();
      sections.forEach((section, index) => { section.hidden = index !== step; });
      get('.quote-counter').textContent = `Paso ${step + 1} de ${sections.length}`;
      dialog.querySelectorAll('.quote-progress i').forEach((bar, i) => bar.classList.toggle('filled', i <= step));
      get('#quote-heading').textContent = headings[step];
      get('.quote-back').hidden = step === 0;
      get('.quote-next').textContent = step === sections.length - 1 ? 'Abrir WhatsApp' : 'Continuar';
      dialog.scrollTop = 0;
      get('#quote-heading').focus({ preventScroll: true });
    }
    form.addEventListener('input', event => {
      clearError();
      if (event.target.name === 'type' || event.target.name === 'count') updateHousehold();
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!validate()) return;
      if (step === sections.length - 1) {
        openWhatsApp();
        return;
      }
      step++;
      render();
    });
    get('.quote-back').addEventListener('click', () => { if (step > 0) step--; render(); });
    get('.quote-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      dialog.remove();
      document.documentElement.classList.remove('quote-open');
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    }, { once: true });
    document.documentElement.classList.add('quote-open');
    dialog.showModal();
    render();
  }

  return { openQuote };
})();
