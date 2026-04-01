import { Company, Service } from '../types';
import {
  mergeServicesWithSlugEntries,
  parseServiceSlugEntries,
} from './service-slugs';

const DEFAULT_COVER_PHOTO = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=400&q=80';
const WEEK_DAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'] as const;

interface RawBusinessSubcategory {
  subcategoria: {
    nome: string;
  };
}

interface RawBusinessHour {
  horario_dia_semana: number;
  abertura: string;
  fechamento: string;
}

interface RawBusiness {
  id: number | string;
  slug?: string;
  usuario?: string;
  nome: string;
  logo: string;
  capa?: string;
  empresaSubcategorias?: RawBusinessSubcategory[];
  telefone?: string;
  wp?: string;
  pais: string;
  endereco: string;
  endereco_n: string;
  bairro: string;
  cidadeBr?: {
    loc_no: string;
    ufe_sg: string;
  };
  cidadeUi?: {
    nome: string;
  };
  estadoUi?: {
    nome: string;
  };
  horarios_atendimento?: RawBusinessHour[];
  media_avaliacoes: number | null;
  total_avaliacoes: string;
}

interface RawServiceSchedule {
  duracao: string;
  valor_padrao: number | string;
}

interface RawServicePhoto {
  imagem: string;
}

interface RawService {
  id: number | string;
  slug?: string;
  nome: string;
  descricao: string;
  horarios_atendimento?: RawServiceSchedule[];
  fotos?: RawServicePhoto[];
  media_avaliacoes?: number;
  tipo?: string;
}

function getServerApiBaseUrl() {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('API_URL ou NEXT_PUBLIC_API_URL não configurada.');
  }

  return apiUrl.replace(/\/$/, '');
}

async function fetchFromApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getServerApiBaseUrl()}${path}`, {
    ...init,
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Erro ao consultar API: ${response.status}`);
  }

  return response.json();
}

function getUsernameCandidates(username: string) {
  let normalizedUsername = username;

  try {
    normalizedUsername = decodeURIComponent(username);
  } catch {
    normalizedUsername = username;
  }

  const trimmedUsername = normalizedUsername.trim();

  if (!trimmedUsername) {
    return [];
  }

  if (trimmedUsername.startsWith('@')) {
    return [trimmedUsername, trimmedUsername.slice(1)].filter(Boolean);
  }

  return [trimmedUsername, `@${trimmedUsername}`];
}

function normalizeBusinessIdentifier(identifier: string) {
  let normalizedIdentifier = identifier;

  try {
    normalizedIdentifier = decodeURIComponent(identifier);
  } catch {
    normalizedIdentifier = identifier;
  }

  return normalizedIdentifier.trim();
}

function getBusinessLookupPath(identifier: string) {
  return `/business/${encodeURIComponent(identifier).replace(/%40/g, '@')}`;
}

function getBusinessSlugLookupPath(slug: string) {
  return `/business/slug/${encodeURIComponent(slug)}`;
}

export function getTodayDateInSaoPaulo() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(new Date());
}

function formatDuration(duration: string) {
  const [hours, minutes] = duration.split(':').map(Number);

  if (hours === 0) {
    return `${minutes}min`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}min`;
}

export function mapBusinessToCompany(data: RawBusiness): Company {
  const username = data.usuario?.trim() || '';
  const slug = data.slug?.trim() || '';

  return {
    id: data.id.toString(),
    slug,
    username,
    name: data.nome,
    logo: data.logo,
    coverPhoto: data.capa || DEFAULT_COVER_PHOTO,
    description: data.empresaSubcategorias?.map((item) => item.subcategoria.nome).join(', ') || 'Agendamento online pelo Buzke.',
    phone: data.telefone,
    whatsapp: data.wp,
    address: {
      pais: data.pais,
      street: data.endereco,
      number: data.endereco_n,
      neighborhood: data.bairro,
      city: data.cidadeBr?.loc_no || data.cidadeUi?.nome || '',
      state: data.cidadeBr?.ufe_sg || data.estadoUi?.nome || '',
    },
    businessHours: (data.horarios_atendimento || []).map((horario) => ({
      day: WEEK_DAYS[horario.horario_dia_semana] || 'Não informado',
      hours: `${horario.abertura.substring(0, 5)} - ${horario.fechamento.substring(0, 5)}`,
    })),
    categories: data.empresaSubcategorias?.map((item) => item.subcategoria.nome) || [],
    media_avaliacoes: data.media_avaliacoes,
    total_avaliacoes: data.total_avaliacoes,
  };
}

export function mapServiceToModel(service: RawService, companyId: string): Service {
  const schedule = service.horarios_atendimento?.[0];

  return {
    id: service.id.toString(),
    slug: service.slug?.trim() || undefined,
    companyId,
    name: service.nome,
    description: service.descricao,
    duration: schedule ? formatDuration(schedule.duracao) : 'Consulte',
    price: schedule ? Number(schedule.valor_padrao) : 0,
    images: (service.fotos || []).map((foto) => foto.imagem),
    rating: service.media_avaliacoes,
    reviewCount: 0,
    tipo: service.tipo,
  };
}

export async function getServiceSlugsByCompanyId(companyId: string) {
  try {
    const data = await fetchFromApi<unknown>(`/services/slugs?empresa=${encodeURIComponent(companyId)}`);

    return parseServiceSlugEntries(data);
  } catch {
    return [];
  }
}

export async function getServiceByIdOrSlug(idOrSlug: string, companyId: string) {
  const normalizedIdentifier = normalizeBusinessIdentifier(idOrSlug);

  if (!normalizedIdentifier) {
    return null;
  }

  try {
    const data = await fetchFromApi<RawService>(`/services/${encodeURIComponent(normalizedIdentifier)}`);
    const service = mapServiceToModel(data, companyId);

    if (service.slug) {
      return service;
    }

    const slugEntries = await getServiceSlugsByCompanyId(companyId);
    const [serviceWithSlug] = mergeServicesWithSlugEntries([service], slugEntries);

    return {
      ...serviceWithSlug,
      slug: serviceWithSlug.slug,
    };
  } catch {
    return null;
  }
}

export async function getCompanyByUsername(username: string) {
  const candidates = getUsernameCandidates(username);

  for (const candidate of candidates) {
    try {
      const data = await fetchFromApi<RawBusiness>(getBusinessLookupPath(candidate));
      return mapBusinessToCompany(data);
    } catch {
      continue;
    }
  }

  return null;
}

export async function getCompanyBySlug(slug: string) {
  const normalizedSlug = normalizeBusinessIdentifier(slug);

  if (!normalizedSlug) {
    return null;
  }

  try {
    const data = await fetchFromApi<RawBusiness>(getBusinessSlugLookupPath(normalizedSlug));
    return mapBusinessToCompany(data);
  } catch {
    return null;
  }
}

export async function getServicesByCompanyId(companyId: string, selectedDate: string) {
  const [year, month, day] = selectedDate.split('-');
  const formattedDate = `${day}/${month}/${year}`;
  const [data, slugEntries] = await Promise.all([
    fetchFromApi<RawService[]>(`/services/index?data=${formattedDate}&limit=50&offset=0&cliente_id=${companyId}`),
    getServiceSlugsByCompanyId(companyId),
  ]);

  const services = data.map((service) => mapServiceToModel(service, companyId));

  return mergeServicesWithSlugEntries(services, slugEntries);
}

export async function getEligibleBusinessUsernames() {
  try {
    const data = await fetchFromApi<string[]>('/business/usernames');

    return data
      .filter((username) => typeof username === 'string')
      .map((username) => username.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function getEligibleBusinessSlugs() {
  try {
    const data = await fetchFromApi<string[]>('/business/slugs');

    return data
      .filter((slug) => typeof slug === 'string')
      .map((slug) => slug.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function normalizeMetaText(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function trimMetaPart(text: string, maxLength: number) {
  const normalized = normalizeMetaText(text);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const truncated = normalized.slice(0, Math.max(0, maxLength - 3));
  const boundary = truncated.lastIndexOf(' ');

  return `${(boundary > 60 ? truncated.slice(0, boundary) : truncated).trim()}...`;
}

function buildMetaDescription(parts: Array<string | null | undefined>, maxLength = 160) {
  const validParts = parts
    .filter((part): part is string => Boolean(part && normalizeMetaText(part)))
    .map((part) => normalizeMetaText(part));

  const assembled: string[] = [];

  for (const part of validParts) {
    const candidate = assembled.length ? `${assembled.join(' ')} ${part}` : part;

    if (candidate.length <= maxLength) {
      assembled.push(part);
      continue;
    }

    const remaining = maxLength - (assembled.join(' ').length + (assembled.length ? 1 : 0));

    if (remaining > 20) {
      assembled.push(trimMetaPart(part, remaining));
    }

    break;
  }

  return assembled.join(' ');
}

export function buildCompanyLandingDescription(company: Company) {
  const categories = company.categories?.slice(0, 3).join(', ');
  const location = company.address?.city && company.address?.state
    ? `${company.address.city} - ${company.address.state}`
    : null;

  return buildMetaDescription([
    `${company.name} no Buzke.`,
    categories ? `Especialidades: ${categories}.` : null,
    location ? `Atendimento em ${location}.` : null,
    'Veja os dados da empresa e siga para a página de agendamento.',
  ]);
}

export function buildCompanySeoDescription(company: Company, services: Service[]) {
  const categories = company.categories?.slice(0, 3).join(', ');
  const highlightedServices = services.slice(0, 3).map((service) => service.name).join(', ');
  const location = company.address?.city && company.address?.state
    ? `${company.address.city} - ${company.address.state}`
    : company.address?.city || null;

  return buildMetaDescription([
    `${company.name} no Buzke.`,
    location ? `Agendamento online em ${location}.` : null,
    categories ? `Especialidades: ${categories}.` : null,
    highlightedServices ? `Agende online serviços como ${highlightedServices}.` : 'Agende online sem precisar baixar o app.',
    company.media_avaliacoes !== null ? `Empresa avaliada em ${company.media_avaliacoes.toFixed(1)} de 5.` : null,
  ]);
}

export function buildServiceSeoDescription(company: Company, service: Service) {
  const categories = company.categories?.slice(0, 3).join(', ');
  const location = company.address?.city && company.address?.state
    ? `${company.address.city} - ${company.address.state}`
    : company.address?.city || null;

  return buildMetaDescription([
    `${service.name} em ${company.name}.`,
    location ? `Atendimento em ${location}.` : null,
    service.description || null,
    categories ? `Especialidades da empresa: ${categories}.` : null,
    service.duration ? `Duracao estimada de ${service.duration}.` : null,
    service.price > 0 ? `Agende online a partir de R$ ${service.price}.` : 'Agende online sem precisar baixar o app.',
  ]);
}
