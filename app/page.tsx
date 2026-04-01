import Link from 'next/link';
import ThemeToggle from '../src/components/theme/ThemeToggle';

export default function HomePage() {
  return (
    <main className="theme-page min-h-screen px-4 py-8">
      <div className="mx-auto flex max-w-5xl justify-end">
        <ThemeToggle />
      </div>
      <section className="theme-card mx-auto mt-8 max-w-2xl p-10 text-center">
        <span className="theme-chip text-sm font-medium theme-text-accent">
          Buzke
        </span>
        <h1 className="theme-text-primary mt-6 text-4xl font-bold tracking-tight">
          Agendamento online para empresas parceiras
        </h1>
        <p className="theme-text-secondary mt-4 text-lg">
          Cada empresa do Buzke possui uma página própria, com dados estruturados e conteúdo renderizado no servidor para melhorar descoberta e indexação no Google.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/" className="theme-primary-btn rounded-full px-6 py-3 font-medium">
            Compartilhe o link da sua empresa
          </Link>
        </div>
      </section>
    </main>
  );
}
