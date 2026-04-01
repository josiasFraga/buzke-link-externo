import React from 'react';

export const AppleLogo = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g transform="translate(12 12) scale(1.14) translate(-12 -12)">
      <path fill="currentColor" d="M16.72 12.61c.02 2.13 1.87 2.84 1.89 2.85-.02.05-.29 1-.96 1.98-.58.84-1.18 1.67-2.13 1.69-.93.02-1.23-.55-2.3-.55-1.06 0-1.4.53-2.28.57-.91.03-1.6-.9-2.19-1.74-1.2-1.73-2.11-4.89-.88-7.04.61-1.07 1.71-1.74 2.9-1.76.9-.02 1.76.61 2.31.61.55 0 1.58-.76 2.66-.65.45.02 1.72.18 2.54 1.38-.07.05-1.51.88-1.5 2.66Zm-1.88-5.53c.49-.6.86-1.44.76-2.27-.71.03-1.57.47-2.08 1.06-.46.54-.86 1.39-.75 2.21.79.06 1.62-.51 2.07-1Z" />
    </g>
  </svg>
);

export const GooglePlayLogo = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M3.88 2.53c-.24.26-.38.63-.38 1.1v16.74c0 .46.14.84.39 1.09L13.2 12 3.88 2.53Z" fill="#0F9D58" />
    <path d="M16.31 15.1 13.2 12l3.12-3.1 3.84 2.19c1.07.61 1.07 1.6 0 2.21l-3.85 1.8Z" fill="#FFD400" />
    <path d="M16.32 15.1 13.2 12 3.88 21.47c.38.42.98.47 1.66.08l10.78-6.45Z" fill="#FF3333" />
    <path d="M16.32 8.9 5.54 2.45c-.68-.4-1.28-.34-1.66.08L13.2 12l3.12-3.1Z" fill="#3A86F7" />
  </svg>
);
