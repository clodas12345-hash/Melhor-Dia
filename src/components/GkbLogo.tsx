import React from 'react';

interface GkbLogoProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const GkbLogo: React.FC<GkbLogoProps> = ({ variant = 'full', className = "" }) => {
  // Usando a imagem oficial presente no sistema
  const logoSrc = "/src/assets/images/logo_gkd_mobility_1788525652610.jpg";

  if (variant === 'compact') {
    return (
      <div className={`relative flex items-center justify-center bg-white rounded-lg overflow-hidden shadow-sm shrink-0 h-9 w-auto min-w-[36px] ${className}`}>
        <img 
          src={logoSrc} 
          alt="GKD Mobility" 
          className="h-full w-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-3xl shadow-xl flex items-center justify-center select-none ${className} mx-auto overflow-hidden w-full max-w-[320px] aspect-square`}>
      <img 
        src={logoSrc} 
        alt="GKD Mobility" 
        className="w-full h-full object-contain p-1"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
