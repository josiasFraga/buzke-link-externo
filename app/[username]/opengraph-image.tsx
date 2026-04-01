import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import buzkeLogo from '../../src/assets/logo.png';
import { getCompanyBySlug, getCompanyByUsername } from '../../src/lib/buzke-api';

export const alt = 'Buzke empresa';
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

export default async function OpenGraphImage({ params }: { params: { username: string } }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agendar.buzke.com.br';
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
  const mediaUrl = company.logo || company.coverPhoto || new URL(buzkeLogo.src, siteUrl).toString();
  const mediaDataUrl = await imageUrlToDataUrl(mediaUrl);

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
        <div style={{ display: 'flex', width: '100%', position: 'relative', justifyContent: 'space-between', gap: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '63%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ display: 'flex', width: '72px', height: '72px', borderRadius: '22px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: 700 }}>
                B
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '20px', opacity: 0.76 }}>Buzke</span>
                <span style={{ fontSize: '34px', fontWeight: 800 }}>Agenda aberta</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', padding: '10px 18px', borderRadius: '999px', background: 'rgba(102,193,242,0.16)', border: '1px solid rgba(102,193,242,0.24)', fontSize: '20px', color: '#cde7f7', width: 'fit-content' }}>
                Agende online em poucos toques
              </div>
              <div style={{ marginTop: '22px', fontSize: '62px', fontWeight: 900, lineHeight: 1.02 }}>
                Agende com {company.name}
              </div>
              <div style={{ marginTop: '18px', fontSize: '27px', color: '#bdd3e8', lineHeight: 1.35 }}>
                {categories}
              </div>
              <div style={{ marginTop: '14px', fontSize: '22px', color: '#dbe9f6' }}>
                {location}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ display: 'flex', padding: '18px 28px', borderRadius: '999px', background: '#66c1f2', color: '#07111a', fontSize: '26px', fontWeight: 800 }}>
                Escolha seu horario agora
              </div>
              <div style={{ fontSize: '22px', color: '#9ba6ff' }}>agendar.buzke.com.br</div>
            </div>
          </div>

          <div style={{ display: 'flex', width: '37%', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', width: '100%', height: '100%', maxHeight: '520px', borderRadius: '34px', overflow: 'hidden', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 24px 80px rgba(0,0,0,0.28)' }}>
              {mediaDataUrl ? (
                <img
                  src={mediaDataUrl}
                  alt={company.name}
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