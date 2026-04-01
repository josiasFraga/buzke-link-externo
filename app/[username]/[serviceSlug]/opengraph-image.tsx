import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import buzkeLogo from '../../../src/assets/logo.png';
import {
  getCompanyBySlug,
  getCompanyByUsername,
  getServiceByIdOrSlug,
} from '../../../src/lib/buzke-api';

export const alt = 'Buzke servico';
export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';
export const revalidate = 300;

function isUsernameLanding(identifier: string) {
  try {
    return decodeURIComponent(identifier).trim().startsWith('@');
  } catch {
    return identifier.trim().startsWith('@');
  }
}

async function imageUrlToDataUrl(url: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = Buffer.from(await response.arrayBuffer());

    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage({ params }: { params: { username: string; serviceSlug: string } }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agendar.buzke.com.br';
  const company = isUsernameLanding(params.username)
    ? await getCompanyByUsername(params.username)
    : await getCompanyBySlug(params.username);

  if (!company) {
    notFound();
  }

  const service = await getServiceByIdOrSlug(params.serviceSlug, company.id);

  if (!service) {
    notFound();
  }

  const location = company.address?.city
    ? company.address.state
      ? `${company.address.city} - ${company.address.state}`
      : company.address.city
    : 'Agendamento online';
  const mediaUrl = service.images?.[0] || company.logo || company.coverPhoto || new URL(buzkeLogo.src, siteUrl).toString();
  const mediaDataUrl = await imageUrlToDataUrl(mediaUrl);
  const description = service.description || `Reserve ${service.name} com confirmacao online pelo Buzke.`;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0c1722 0%, #132536 50%, #1a2f46 100%)',
          color: '#ffffff',
          padding: '56px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 12% 14%, rgba(111,97,255,0.28), transparent 28%), radial-gradient(circle at 84% 18%, rgba(102,193,242,0.18), transparent 22%), radial-gradient(circle at 55% 72%, rgba(31,166,105,0.14), transparent 30%)' }} />
        <div style={{ display: 'flex', width: '100%', position: 'relative', justifyContent: 'space-between', gap: '38px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '60%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '21px', color: '#bdd3e8' }}>{company.name}</span>
                <span style={{ fontSize: '34px', fontWeight: 800 }}>Reserva online</span>
              </div>
              <div style={{ display: 'flex', padding: '12px 18px', borderRadius: '999px', background: 'rgba(155,166,255,0.14)', border: '1px solid rgba(155,166,255,0.24)', color: '#c7d0ff', fontSize: '22px' }}>
                {service.tipo || 'Servico'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', padding: '10px 18px', borderRadius: '999px', background: 'rgba(31,166,105,0.16)', border: '1px solid rgba(31,166,105,0.28)', color: '#d7ffea', fontSize: '20px', width: 'fit-content' }}>
                Agende sem sair do WhatsApp ou navegador
              </div>
              <div style={{ marginTop: '22px', fontSize: '60px', fontWeight: 900, lineHeight: 1.02 }}>
                Agende {service.name}
              </div>
              <div style={{ marginTop: '18px', fontSize: '26px', color: '#bdd3e8', lineHeight: 1.32 }}>
                {description}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '22px', color: '#9fb4c9' }}>{location}</div>
                <div style={{ fontSize: '24px', color: '#ffffff' }}>{service.duration || 'Consulte duracao'}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{ display: 'flex', padding: '18px 26px', borderRadius: '999px', background: '#66c1f2', color: '#07111a', fontSize: '25px', fontWeight: 800 }}>
                  Reserve seu horario agora
                </div>
                <div style={{ fontSize: '22px', color: '#9ba6ff', fontWeight: 800 }}>
                  {service.price > 0 ? `A partir de R$ ${service.price}` : 'Consulte valores'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', width: '40%', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', width: '100%', height: '100%', maxHeight: '518px', borderRadius: '34px', overflow: 'hidden', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 24px 80px rgba(0,0,0,0.28)' }}>
              {mediaDataUrl ? (
                <img
                  src={mediaDataUrl}
                  alt={service.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(102,193,242,0.2), rgba(155,166,255,0.16))', fontSize: '120px', fontWeight: 900, color: '#ffffff' }}>
                  B
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}