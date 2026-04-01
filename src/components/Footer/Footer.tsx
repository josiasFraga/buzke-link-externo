import React from 'react';
import { Instagram, Facebook, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="theme-footer py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Sobre Nós</h3>
            <p className="text-white/70">
              Facilitamos a conexão entre profissionais e clientes, tornando o agendamento de serviços mais simples e eficiente.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Úteis</h3>
            <ul className="space-y-2">
              <li><a href="https://buzke.com.br/termos-de-uso" target="_blank" rel="noopener noreferrer" className="text-white/70 transition-colors hover:text-white">Termos de Uso</a></li>
              <li><a href="https://buzke.com.br/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="text-white/70 transition-colors hover:text-white">Política de Privacidade</a></li>
              <li><a href="#" className="text-white/70 transition-colors hover:text-white">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Redes Sociais</h3>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/buzke_app/" target="_blank" rel="noopener noreferrer" className="text-white/70 transition-colors hover:text-white">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://www.facebook.com/people/Buzke-App/61580959713969/" target="_blank" rel="noopener noreferrer" className="text-white/70 transition-colors hover:text-white">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://www.linkedin.com/company/buzke-app/" target="_blank" rel="noopener noreferrer" className="text-white/70 transition-colors hover:text-white">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-8 text-center text-white/60">
          <p>&copy; {new Date().getFullYear()} Buzke App. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;