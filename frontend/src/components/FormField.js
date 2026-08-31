export function FormField({ id, name = id, label, type = 'text', placeholder = '', textarea = false }) {
  const control = textarea
    ? `<textarea class="form-field__control form-field__control--textarea" id="${id}" name="${name}" placeholder="${placeholder}"></textarea>`
    : `<input class="form-field__control" id="${id}" name="${name}" type="${type}" placeholder="${placeholder}" />`;

  return `
    <div class="form-field">
      <label class="form-field__label" for="${id}">${label}</label>
      ${control}
      <p class="form-field__error" id="${id}-error" data-form-error="${name}" aria-live="polite"></p>
    </div>
  `;
}
