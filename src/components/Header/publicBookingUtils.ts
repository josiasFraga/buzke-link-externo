import { Company } from '../../types';

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function getPrimaryCategory(company: Company) {
  if (company.categories?.length) {
    return company.categories.slice(0, 2).join(' • ');
  }

  return company.description || 'Agendamento online';
}

export function getLocationSummary(company: Company) {
  const city = company.address?.city?.trim();
  const state = company.address?.state?.trim();

  if (city && state) {
    return `${city}, ${state}`;
  }

  return city || state || null;
}

export function getAddressLabel(company: Company) {
  if (!company.address) {
    return null;
  }

  const parts = [
    company.address.street?.trim(),
    company.address.number?.trim(),
    company.address.neighborhood?.trim(),
    getLocationSummary(company),
  ].filter(Boolean);

  if (!parts.length) {
    return null;
  }

  return parts.join(', ');
}

export function getMapsHref(company: Company) {
  const address = getAddressLabel(company);

  if (!address) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function getPhoneHref(phone?: string) {
  if (!phone) {
    return null;
  }

  const digits = phone.replace(/\D/g, '');

  if (!digits) {
    return null;
  }

  return `tel:+${digits}`;
}

export function getWhatsappHref(whatsapp: string | undefined, companyName: string) {
  if (!whatsapp) {
    return null;
  }

  const digits = whatsapp.replace(/\D/g, '');

  if (!digits) {
    return null;
  }

  const message = encodeURIComponent(`Olá! Vim pela página de agendamento da ${companyName} e gostaria de mais informações.`);

  return `https://wa.me/${digits}?text=${message}`;
}

export function formatPriceLabel(priceFrom?: number | null) {
  if (!priceFrom || priceFrom <= 0) {
    return null;
  }

  return `A partir de ${new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(priceFrom)}`;
}

export function getTodayBusinessHours(company: Company) {
  if (!company.businessHours?.length) {
    return null;
  }

  const weekday = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date());

  const normalizedWeekday = normalizeText(weekday);
  const entry = company.businessHours.find((item) => normalizeText(item.day) === normalizedWeekday);

  if (!entry?.hours) {
    return null;
  }

  return entry.hours;
}

export function formatRating(company: Company) {
  if (company.media_avaliacoes === null) {
    return null;
  }

  const totalReviews = Number(company.total_avaliacoes || 0);
  const ratingValue = company.media_avaliacoes.toFixed(1).replace('.', ',');

  if (totalReviews > 0) {
    return `${ratingValue} (${totalReviews} avaliações)`;
  }

  return ratingValue;
}