import React from 'react';
import { Smartphone } from 'lucide-react';

const BuzkeAppBanner = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="https://buzke.com.br/img/logo_white.png" 
            alt="Buzke" 
            className="h-6 mr-2"
          />
        </div>
        <a href="#" className="flex items-center text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">
          <Smartphone size={14} className="mr-1" />
          <span className="hidden sm:inline">Baixe o app</span>
          <span className="sm:hidden">App</span>
        </a>
      </div>
    </div>
  );
};

export default BuzkeAppBanner;