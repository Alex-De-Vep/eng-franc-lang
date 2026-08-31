export function Button({ label, href = null, modifier = 'primary', className = '' }) {
  const classes = `button button--${modifier} ${className}`.trim();

  if (href) {
    return `<a class="${classes}" href="${href}">${label}</a>`;
  }

  return `<button class="${classes}" type="submit">${label}</button>`;
}
