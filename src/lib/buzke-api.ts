import { Company, Service } from '../types';

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
  const data = await fetchFromApi<RawService[]>(`/services/index?data=${formattedDate}&limit=50&offset=0&cliente_id=${companyId}`);

  return data.map((service) => mapServiceToModel(service, companyId));
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

export function buildCompanyLandingDescription(company: Company) {
  const categories = company.categories?.slice(0, 3).join(', ');
  const location = company.address?.city && company.address?.state
    ? `${company.address.city} - ${company.address.state}`
    : null;

  return [
    `${company.name} no Buzke.`,
    categories ? `Especialidades: ${categories}.` : null,
    location ? `Atendimento em ${location}.` : null,
    'Veja os dados da empresa e siga para a página de agendamento.',
  ]
    .filter(Boolean)
    .join(' ');
}

export function buildCompanySeoDescription(company: Company, services: Service[]) {
  const categories = company.categories?.slice(0, 3).join(', ');
  const highlightedServices = services.slice(0, 3).map((service) => service.name).join(', ');

  return [
    `${company.name} no Buzke.`,
    categories ? `Especialidades: ${categories}.` : null,
    highlightedServices ? `Agende online serviços como ${highlightedServices}.` : 'Agende online sem precisar baixar o app.',
  ]
    .filter(Boolean)
    .join(' ');
}
