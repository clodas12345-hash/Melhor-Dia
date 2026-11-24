import React from 'react';
import logoGkdClean from '../assets/images/logo_gkd_mobility_clean.png';

interface GkbLogoProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const GkbLogo: React.FC<GkbLogoProps> = ({ variant = 'full', className = "" }) => {
  if (variant === 'compact') {
    return (
      <div className={`relative flex items-center justify-center bg-white rounded-xl overflow-hidden shadow-sm shrink-0 h-10 w-[42px] p-1 ${className}`}>
        <img 
          src={logoGkdClean} 
          alt="GKD Mobility" 
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl inline-flex items-center justify-center select-none mx-auto overflow-hidden w-full max-w-[210px] aspect-[666/631] p-3 ${className}`}>
      <img 
        src={logoGkdClean} 
        alt="GKD Mobility" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};
