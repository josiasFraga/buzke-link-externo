import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <section className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Página não encontrada</h1>
        <p className="text-gray-600 mb-6">
          A empresa que você está procurando não existe ou não está disponível neste link.
        </p>
        <Link href="/" className="inline-flex w-full items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Voltar para o Buzke
        </Link>
      </section>
    </main>
  );
}
