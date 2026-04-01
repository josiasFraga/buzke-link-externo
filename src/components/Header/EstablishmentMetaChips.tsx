import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetaChipItem {
  id: string;
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  tone?: 'default' | 'accent' | 'muted';
}

interface EstablishmentMetaChipsProps {
  items: MetaChipItem[];
}

function getChipClassName(tone: MetaChipItem['tone']) {
  if (tone === 'accent') {
    return 'theme-chip min-h-10 rounded-full px-3.5 py-2 text-sm font-medium theme-text-accent';
  }

  if (tone === 'muted') {
    return 'theme-chip min-h-10 rounded-full px-3.5 py-2 text-sm font-medium theme-text-secondary';
  }

  return 'theme-chip min-h-10 rounded-full px-3.5 py-2 text-sm font-medium theme-text-secondary';
}

function getIconClassName(tone: MetaChipItem['tone']) {
  if (tone === 'muted') {
    return 'theme-text-secondary shrink-0';
  }

  return 'theme-text-accent shrink-0';
}

const EstablishmentMetaChips = ({ items }: EstablishmentMetaChipsProps) => {
  if (!items.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3 sm:gap-3.5">
      {items.map(({ id, icon: Icon, label, href, onClick, tone = 'default' }) => {
        if (href) {
          return (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={getChipClassName(tone)}
            >
              <Icon size={16} className={getIconClassName(tone)} />
              <span>{label}</span>
            </a>
          );
        }

        if (onClick) {
          return (
            <button key={id} type="button" onClick={onClick} className={getChipClassName(tone)}>
              <Icon size={16} className={getIconClassName(tone)} />
              <span>{label}</span>
            </button>
          );
        }

        return (
          <div key={id} className={getChipClassName(tone)}>
            <Icon size={16} className={getIconClassName(tone)} />
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
};

export type { MetaChipItem };
export default EstablishmentMetaChips;