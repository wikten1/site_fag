(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const fields = [...form.querySelectorAll('input, textarea')];
  const fieldset = form.querySelector('fieldset');
  const button = form.querySelector('[type="submit"]');
  const buttonLabel = button.querySelector('span');
  const status = document.getElementById('contact-status');
  const availability = document.getElementById('contact-availability');
  const endpoint = new URL(form.getAttribute('action'), location.href);
  let ready = false;
  let busy = false;
  let previousPayload = '';
  let submissionId = '';
  form.noValidate = true;

  function feedback(state, title, message, focus = false) {
    status.dataset.state = state;
    const heading = document.createElement('strong');
    heading.textContent = title;
    status.replaceChildren(heading, document.createTextNode(message));
    if (focus) status.focus();
  }
  function fieldError(field, message) {
    const error = document.getElementById(field.id + '-error');
    error.textContent = message;
    error.hidden = !message;
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  }
  function validate(field) {
    const value = field.value.trim();
    let message = '';
    if (field.required && !value) {
      message = { name: 'Informe seu nome.', email: 'Informe seu e-mail.', subject: 'Informe o assunto da mensagem.', message: 'Escreva sua mensagem.' }[field.name];
    } else if (field.name === 'email' && (field.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) {
      message = 'Informe um endereço de e-mail válido.';
    } else if (value.length > field.maxLength) {
      message = `Use até ${field.maxLength} caracteres.`;
    }
    fieldError(field, message);
    return !message;
  }
  fields.forEach(field => {
    field.addEventListener('blur', () => { if (field.value || field.hasAttribute('aria-invalid')) validate(field); });
    field.addEventListener('input', () => { if (field.hasAttribute('aria-invalid')) validate(field); });
  });

  async function checkAvailability() {
    availability.hidden = false;
    try {
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(8000) });
      const data = await response.json();
      if (!response.ok || data.available !== true) throw new Error('unavailable');
      ready = true;
      fieldset.disabled = false;
      button.disabled = false;
      availability.hidden = true;
    } catch {
      availability.replaceChildren(document.createTextNode('O envio pelo formulário ainda não está disponível. Você pode consultar o endereço da FAG nesta página. '));
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'contact-retry';
      retry.textContent = 'Verificar novamente';
      retry.addEventListener('click', () => { retry.disabled = true; checkAvailability(); });
      availability.append(retry);
    }
  }
  checkAvailability();

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !ready) return;
    const valid = fields.map(validate).every(Boolean);
    if (!valid) {
      feedback('error', 'Revise os campos indicados.', 'Preencha as informações para continuar.');
      fields.find(field => field.hasAttribute('aria-invalid')).focus();
      return;
    }
    const data = Object.fromEntries(fields.map(field => [field.name, field.value.trim()]));
    const payload = JSON.stringify(data);
    // Reuse the identifier on manual retries of the same message.
    if (payload !== previousPayload) {
      submissionId = crypto.randomUUID();
      previousPayload = payload;
    }
    busy = true;
    button.disabled = true;
    fieldset.disabled = true;
    form.setAttribute('aria-busy', 'true');
    buttonLabel.textContent = 'Enviando mensagem…';
    feedback('loading', 'Enviando sua mensagem…', 'Aguarde a confirmação antes de sair desta página.');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'Idempotency-Key': submissionId },
        body: payload,
        signal: AbortSignal.timeout(45000)
      });
      const result = await response.json();
      if (response.ok && result.ok === true) {
        form.reset();
        fields.forEach(field => fieldError(field, ''));
        previousPayload = '';
        feedback('success', 'Mensagem enviada', 'Sua mensagem foi encaminhada ao e-mail de atendimento da FAG. Obrigado por entrar em contato.', true);
      } else if (response.status === 422 && result.errors) {
        fields.forEach(field => fieldError(field, result.errors[field.name] || ''));
        feedback('error', 'Revise os campos indicados.', 'Sua mensagem ainda não foi enviada.');
      } else {
        throw new Error(response.status === 429 ? 'rate-limit' : 'send-failed');
      }
    } catch (error) {
      feedback('error', 'Não foi possível confirmar o envio.', error.message === 'rate-limit'
        ? 'Houve várias tentativas em sequência. Aguarde alguns minutos antes de tentar novamente. Sua mensagem foi mantida.'
        : 'Tente novamente em instantes. Os campos foram mantidos para que você não precise escrever tudo de novo.', true);
    } finally {
      busy = false;
      button.disabled = false;
      fieldset.disabled = false;
      buttonLabel.textContent = 'Enviar mensagem';
      form.removeAttribute('aria-busy');
      const invalid = fields.find(field => field.hasAttribute('aria-invalid'));
      if (invalid) invalid.focus();
    }
  });
})();
