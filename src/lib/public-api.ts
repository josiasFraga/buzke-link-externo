const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export function buildPublicApiUrl(path: string) {
  if (!PUBLIC_API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL não configurada.');
  }

  const normalizedBaseUrl = PUBLIC_API_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}
