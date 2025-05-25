import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Carregando...</h2>
        <p className="text-gray-600">Aguarde enquanto buscamos as informações</p>
      </div>
    </div>
  );
};

export default LoadingScreen;