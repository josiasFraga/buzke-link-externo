import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="theme-page flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
        <h2 className="theme-text-primary mb-1 text-xl font-semibold">Carregando...</h2>
        <p className="theme-text-secondary">Aguarde enquanto buscamos as informações</p>
      </div>
    </div>
  );
};

export default LoadingScreen;