import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import {
  getCompanyBySlug,
  getCompanyByUsername,
  getServiceByIdOrSlug,
} from '../../../src/lib/buzke-api';

export const alt = 'Buzke servico';
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

export default async function OpenGraphImage({ params }: { params: { username: string; serviceSlug: string } }) {
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
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '22px', color: '#bdd3e8' }}>{company.name}</span>
              <span style={{ fontSize: '26px', fontWeight: 700 }}>Agende pelo Buzke</span>
            </div>
            <div style={{ display: 'flex', padding: '12px 18px', borderRadius: '999px', background: 'rgba(155,166,255,0.14)', border: '1px solid rgba(155,166,255,0.24)', color: '#c7d0ff', fontSize: '22px' }}>
              {service.tipo || 'Servico'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '920px' }}>
            <div style={{ fontSize: '72px', fontWeight: 800, lineHeight: 1.02 }}>{service.name}</div>
            <div style={{ marginTop: '20px', fontSize: '28px', color: '#bdd3e8', lineHeight: 1.35 }}>
              {service.description || `Agende ${service.name} em ${company.name} com confirmacao online.`}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '22px', color: '#9fb4c9' }}>{location}</div>
              <div style={{ fontSize: '24px', color: '#ffffff' }}>{service.duration || 'Consulte duracao'}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
              <div style={{ fontSize: '22px', color: '#9fb4c9' }}>Valor inicial</div>
              <div style={{ fontSize: '36px', color: '#9ba6ff', fontWeight: 800 }}>
                {service.price > 0 ? `R$ ${service.price}` : 'Consulte'}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}