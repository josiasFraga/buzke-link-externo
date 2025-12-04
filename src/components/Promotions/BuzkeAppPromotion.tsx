import React from 'react';
import { AppleLogo, GooglePlayLogo } from '../Icons/StoreIcons';

const BuzkeAppPromotion: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-indigo-600 to-indigo-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white max-w-xl">
            <h2 className="text-3xl font-bold mb-4">Baixe o App Buzke</h2>
            <p className="text-indigo-100 mb-6">
              Agende seus serviços com facilidade, receba lembretes e aproveite ofertas exclusivas.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://apps.apple.com/br/app/buzke/id1622471470"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                <AppleLogo size={20} />
                App Store
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.buzke&hl=pt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                <GooglePlayLogo size={20} />
                Google Play
              </a>
            </div>
          </div>
          <div className="w-full md:w-1/3 relative">
            {/* iPhone Frame */}
            <div className="relative mx-auto" style={{ maxWidth: '280px' }}>
              <div className="absolute inset-0 bg-black rounded-[3rem] shadow-xl"></div>
              <div className="absolute inset-2 bg-black rounded-[2.5rem]">
                <div className="absolute top-0 w-full h-6 bg-black rounded-t-[2.5rem]">
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-black rounded-full"></div>
                </div>
              </div>
              <img
                src="https://buzke-images.s3.sa-east-1.amazonaws.com/site/IMG_3842.PNG"
                alt="Buzke App Preview"
                className="relative rounded-[2.5rem] border-8 border-black shadow-xl"
                style={{ aspectRatio: '9/19.5' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuzkeAppPromotion;
