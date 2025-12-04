import React from 'react';

export const AppleLogo = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.86-1.09 1.54-2.51 1.35-3.5-1.27.06-2.81.84-3.71 1.91-.81.96-1.51 2.52-1.32 3.54 1.42.11 2.89-.81 3.68-1.95" />
  </svg>
);

export const GooglePlayLogo = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L14.25,12.56L16.81,10L21.5,12.69C22.17,13.08 22.17,14.04 21.5,14.43L16.81,15.12M14.82,12L5,2.18L15.38,12.56L14.82,12M5,21.82L14.82,12L15.38,11.44L5,21.82Z" />
  </svg>
);
