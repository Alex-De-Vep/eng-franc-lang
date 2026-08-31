function normalizeBasePath(basePath) {
  const normalized = String(basePath || '/').replace(/^\/+|\/+$/g, '');
  return normalized ? `/${normalized}/` : '/';
}

export const siteBasePath = normalizeBasePath(import.meta.env.BASE_URL);

export function withBasePath(path = '', basePath = siteBasePath) {
  return `${normalizeBasePath(basePath)}${String(path).replace(/^\/+/, '')}`;
}

export function resolveAssetMarkup(markup, basePath = siteBasePath) {
  const normalizedBase = normalizeBasePath(basePath);
  if (normalizedBase === '/') return markup;
  return markup.replaceAll('/assets/', `${normalizedBase}assets/`);
}

export function basePathSegmentCount(basePath = siteBasePath) {
  return normalizeBasePath(basePath).split('/').filter(Boolean).length;
}
