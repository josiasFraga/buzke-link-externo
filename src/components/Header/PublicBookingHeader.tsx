import Image from 'next/image';
import logo from '../../assets/logo.png';
import { AppleLogo, GooglePlayLogo } from '../Icons/StoreIcons';
import ThemeToggle from '../theme/ThemeToggle';

interface PublicBookingHeaderProps {
  showStoreLinks?: boolean;
  fixed?: boolean;
}

const PublicBookingHeader = ({ showStoreLinks = true, fixed = false }: PublicBookingHeaderProps) => {
  return (
    <div className={fixed ? 'fixed inset-x-0 top-0 z-50 border-b border-[color:color-mix(in_srgb,var(--color-border)_70%,transparent)] bg-[var(--color-background)]' : 'absolute inset-x-0 top-0 z-30'}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 pb-3 pt-3 sm:px-6 lg:px-8 lg:pt-5">
        <Image src={logo} alt="Buzke" className="h-7 w-auto max-w-none" priority />

        <div className="flex items-center gap-2">
          {showStoreLinks ? (
            <div className="hidden items-center gap-1.5 md:flex">
              <a
                href="https://apps.apple.com/br/app/buzke/id1622471470"
                target="_blank"
                rel="noopener noreferrer"
                className="theme-secondary-btn px-2.5 py-1.5 text-[11px] font-medium"
              >
                <AppleLogo size={12} />
                App Store
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.buzke&hl=pt"
                target="_blank"
                rel="noopener noreferrer"
                className="theme-secondary-btn px-2.5 py-1.5 text-[11px] font-medium"
              >
                <GooglePlayLogo size={12} />
                Google Play
              </a>
            </div>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default PublicBookingHeader;