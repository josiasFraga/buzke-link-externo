import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import { getCompanyBySlug, getCompanyByUsername } from '../../src/lib/buzke-api';

export const alt = 'Buzke empresa';
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

export default async function OpenGraphImage({ params }: { params: { username: string } }) {
  const company = isUsernameLanding(params.username)
    ? await getCompanyByUsername(params.username)
    : await getCompanyBySlug(params.username);

  if (!company) {
    notFound();
  }

  const location = company.address?.city
    ? company.address.state
      ? `${company.address.city} - ${company.address.state}`
      : company.address.city
    : 'Agendamento online';
  const categories = company.categories?.slice(0, 3).join(' • ') || 'Reserva online simplificada';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #07111a 0%, #102436 48%, #193247 100%)',
          color: '#ffffff',
          padding: '56px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 12% 14%, rgba(111,97,255,0.32), transparent 28%), radial-gradient(circle at 88% 18%, rgba(102,193,242,0.18), transparent 22%)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ display: 'flex', width: '72px', height: '72px', borderRadius: '22px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: 700 }}>
              B
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '22px', opacity: 0.76 }}>Buzke</span>
              <span style={{ fontSize: '28px', fontWeight: 700 }}>Agendamento online</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '880px' }}>
            <div style={{ fontSize: '68px', fontWeight: 800, lineHeight: 1.04 }}>{company.name}</div>
            <div style={{ marginTop: '20px', fontSize: '28px', color: '#bdd3e8', lineHeight: 1.35 }}>{categories}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', padding: '14px 22px', borderRadius: '999px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)', fontSize: '24px' }}>
              {location}
            </div>
            <div style={{ fontSize: '24px', color: '#9ba6ff' }}>agendar.buzke.com.br</div>
          </div>
        </div>
      </div>
    ),
    size
  );
}