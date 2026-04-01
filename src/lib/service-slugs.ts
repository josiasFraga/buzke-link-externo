import { Service } from '../types';

export interface ServiceSlugEntry {
  id?: string;
  slug?: string;
  name?: string;
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function slugifyServiceName(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function toEntry(value: unknown): ServiceSlugEntry | null {
  if (typeof value === 'string') {
    const slug = value.trim();

    return slug ? { slug } : null;
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  const entry = value as Record<string, unknown>;
  const id = entry.id ?? entry.service_id ?? entry.servico_id;
  const slug = entry.slug ?? entry.service_slug ?? entry.servico_slug;
  const name = entry.name ?? entry.nome ?? entry.service_name ?? entry.servico_nome;

  return {
    id: typeof id === 'number' || typeof id === 'string' ? String(id).trim() : undefined,
    slug: typeof slug === 'string' ? slug.trim() : undefined,
    name: typeof name === 'string' ? name.trim() : undefined,
  };
}

export function parseServiceSlugEntries(payload: unknown) {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map(toEntry)
    .filter((entry): entry is ServiceSlugEntry => Boolean(entry?.slug || entry?.id || entry?.name));
}

export function mergeServicesWithSlugEntries(services: Service[], entries: ServiceSlugEntry[]) {
  if (!entries.length) {
    return services;
  }

  const byId = new Map<string, ServiceSlugEntry>();

  entries.forEach((entry) => {
    if (entry.id && entry.slug) {
      byId.set(entry.id, entry);
    }
  });

  return services.map((service) => {
    const byServiceId = byId.get(service.id);

    return {
      ...service,
      slug: service.slug || byServiceId?.slug,
    };
  });
}