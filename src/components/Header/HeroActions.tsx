import React from 'react';
import { ArrowRight, MessageCircle, Navigation } from 'lucide-react';

interface HeroActionsProps {
  whatsappHref?: string | null;
  mapsHref?: string | null;
}

const secondaryButtonClassName = 'inline-flex min-h-[3.15rem] items-center justify-center gap-2.5 rounded-full border border-slate-200 bg-white/92 px-4.5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-violet-50/35 hover:text-slate-950 sm:min-w-[11.25rem]';

const HeroActions = ({ whatsappHref, mapsHref }: HeroActionsProps) => {
  return (
    <div className="flex flex-col gap-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:gap-4.5">
      <a
        href="#section-services"
        className="theme-primary-btn min-h-[3.15rem] rounded-full px-6 py-2.5 text-sm font-semibold sm:min-w-[10.5rem] sm:px-6.5"
      >
        Ver horarios
        <ArrowRight size={16} className="shrink-0" />
      </a>

      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${secondaryButtonClassName} theme-secondary-btn`}
        >
          <MessageCircle size={16} className="theme-text-accent shrink-0" />
          Falar no WhatsApp
        </a>
      ) : null}

      {mapsHref ? (
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${secondaryButtonClassName} theme-secondary-btn`}
        >
          <Navigation size={16} className="theme-text-accent shrink-0" />
          Como chegar
        </a>
      ) : null}
    </div>
  );
};

export default HeroActions;