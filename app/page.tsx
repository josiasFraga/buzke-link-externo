import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <section className="max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
        <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
          Buzke
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900">
          Agendamento online para empresas parceiras
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Cada empresa do Buzke possui uma página própria, com dados estruturados e conteúdo renderizado no servidor para melhorar descoberta e indexação no Google.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/" className="inline-flex items-center rounded-full bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700 transition-colors">
            Compartilhe o link da sua empresa
          </Link>
        </div>
      </section>
    </main>
  );
}
