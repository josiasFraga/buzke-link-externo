import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import favicon from '../src/assets/favicon.png';
import ThemeProvider from '../src/components/theme/ThemeProvider';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agendar.buzke.com.br';
const themeBootScript = `(function(){try{var savedTheme=localStorage.getItem('buzke-theme');document.documentElement.setAttribute('data-theme',savedTheme||'dark');}catch(error){document.documentElement.setAttribute('data-theme','dark');}})();`;
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: favicon.src,
    shortcut: favicon.src,
    apple: favicon.src,
  },
  title: {
    default: 'Buzke | Agendamento online para empresas',
    template: '%s | Buzke',
  },
  description: 'Páginas de agendamento online do Buzke para empresas receberem reservas sem exigir o app.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: 'Buzke',
    url: siteUrl,
    title: 'Buzke | Agendamento online para empresas',
    description: 'Páginas de agendamento online do Buzke para empresas receberem reservas sem exigir o app.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buzke | Agendamento online para empresas',
    description: 'Páginas de agendamento online do Buzke para empresas receberem reservas sem exigir o app.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
