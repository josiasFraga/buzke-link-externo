import { AppleLogo, GooglePlayLogo } from '../Icons/StoreIcons';

const BuzkeAppBanner = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="https://buzke.com.br/logo_white.png" 
            alt="Buzke" 
            className="h-6 mr-2"
          />
        </div>
        <div className="flex gap-2">
          <a href="https://apps.apple.com/br/app/buzke/id1622471470" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">
            <AppleLogo size={14} className="mr-1" />
            <span className="hidden sm:inline">App Store</span>
          </a>
          <a href="https://play.google.com/store/apps/details?id=com.buzke&hl=pt" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">
            <GooglePlayLogo size={14} className="mr-1" />
            <span className="hidden sm:inline">Google Play</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default BuzkeAppBanner;