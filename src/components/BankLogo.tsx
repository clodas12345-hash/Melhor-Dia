import React from 'react';

interface BankLogoProps {
  name: string;
  segment?: string;
  customLogo?: string;
  className?: string;
}

export const BankLogo: React.FC<BankLogoProps> = ({ name, segment, customLogo, className = "" }) => {
  const normalized = (name || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  const normalizedSegment = (segment || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  // If user provided a custom image URL (and it's not a broken logodownload.org link)
  if (customLogo && !customLogo.includes('logodownload.org')) {
    return (
      <div className={`bg-white p-1 rounded-xl flex items-center justify-center overflow-hidden shadow-sm border border-white/10 ${className}`}>
        <img
          src={customLogo}
          alt={name}
          className="w-full h-full object-contain"
          onError={(e) => {
            // If custom image fails, hide it and let container fallback
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // --- ITAÚ ---
  if (normalized.includes('itau')) {
    if (normalizedSegment.includes('personnalite') || normalized.includes('personnalite')) {
      return (
        <svg viewBox="0 0 100 100" className={`rounded-xl overflow-hidden shadow-md ${className}`} xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="22" fill="#121214" stroke="#D4AF37" strokeWidth="2.5" />
          <text x="50" y="52" fill="#D4AF37" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="26" textAnchor="middle" letterSpacing="-1">itaú</text>
          <text x="50" y="70" fill="#E5C158" fontFamily="Georgia, serif" fontStyle="italic" fontSize="10.5" textAnchor="middle" letterSpacing="0.5">Personnalité</text>
        </svg>
      );
    }
    if (normalizedSegment.includes('uniclass') || normalized.includes('uniclass')) {
      return (
        <svg viewBox="0 0 100 100" className={`rounded-xl overflow-hidden shadow-md ${className}`} xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="22" fill="#002D72" stroke="#E5A823" strokeWidth="2.5" />
          <text x="50" y="52" fill="#FFD100" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="26" textAnchor="middle" letterSpacing="-1">itaú</text>
          <text x="50" y="70" fill="#E5A823" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="10" textAnchor="middle" letterSpacing="1">UNICLASS</text>
        </svg>
      );
    }
    // Itaú Tradicional / Click / Private
    return (
      <svg viewBox="0 0 100 100" className={`rounded-xl overflow-hidden shadow-md ${className}`} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="22" fill="#EC7000" />
        <rect x="15" y="15" width="70" height="70" rx="18" fill="#002D72" />
        <text x="50" y="58" fill="#FFD100" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="28" textAnchor="middle" letterSpacing="-1">itaú</text>
      </svg>
    );
  }

  // --- C6 BANK ---
  if (normalized.includes('c6')) {
    const isCarbon = normalizedSegment.includes('carbon') || normalized.includes('carbon') || normalizedSegment.includes('black');
    return (
      <svg viewBox="0 0 100 100" className={`rounded-xl overflow-hidden shadow-md ${className}`} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="22" fill={isCarbon ? "#141416" : "#202022"} stroke={isCarbon ? "#404044" : "#2e2e32"} strokeWidth="2" />
        <g fill="#FFFFFF" textAnchor="middle">
          <text x="50" y="54" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="33" letterSpacing="-1">C6</text>
          <text x="50" y="74" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="10" letterSpacing="3.5" fill={isCarbon ? "#D1D1D6" : "#A1A1A6"}>
            {isCarbon ? "CARBON" : "BANK"}
          </text>
        </g>
      </svg>
    );
  }

  // --- BRADESCO ---
  if (normalized.includes('bradesco')) {
    const isPrime = normalizedSegment.includes('prime') || normalized.includes('prime');
    const bgFill = isPrime ? "#5C0012" : "#CC092F";
    return (
      <svg viewBox="0 0 100 100" className={`rounded-xl overflow-hidden shadow-md ${className}`} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="22" fill={bgFill} stroke={isPrime ? "#B38728" : "none"} strokeWidth={isPrime ? "2" : "0"} />
        <g fill="#FFFFFF">
          {/* Duas colunas do tronco */}
          <rect x="36" y="44" width="9" height="24" rx="3.5" />
          <rect x="55" y="44" width="9" height="24" rx="3.5" />
          {/* Copa arqueada característica da árvore Bradesco */}
          <path d="M 23 38 C 23 21 41 16 50 16 C 59 16 77 21 77 38 C 69 38 63 26 50 26 C 37 26 31 38 23 38 Z" />
          {/* Entalhe circular superior */}
          <circle cx="50" cy="20" r="3" fill={bgFill} />
        </g>
        <text x="50" y="84" fill="#FFFFFF" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="11" textAnchor="middle" letterSpacing="-0.3">
          {isPrime ? "PRIME" : "bradesco"}
        </text>
      </svg>
    );
  }

  // --- NUBANK ---
  if (normalized.includes('nubank') || normalized.includes('roxinho') || normalized === 'nu') {
    const isUltravioleta = normalizedSegment.includes('ultravioleta') || normalized.includes('ultravioleta');
    return (
      <svg viewBox="0 0 100 100" className={`rounded-xl overflow-hidden shadow-md ${className}`} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="22" fill={isUltravioleta ? "#12001F" : "#820AD1"} stroke={isUltravioleta ? "#9D4EDD" : "none"} strokeWidth={isUltravioleta ? "2" : "0"} />
        {/* Logotipo NU estilizado */}
        <g fill={isUltravioleta ? "#E0AAFF" : "#FFFFFF"}>
          <text x="50" y="63" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="42" textAnchor="middle" letterSpacing="-3">nu</text>
        </g>
      </svg>
    );
  }

  // --- SANTANDER ---
  if (normalized.includes('santander')) {
    return (
      <svg viewBox="0 0 100 100" className={`rounded-xl overflow-hidden shadow-md ${className}`} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="22" fill="#EC0000" />
        {/* Chama clássica Santander */}
        <g fill="#FFFFFF" transform="translate(18, 16) scale(0.64)">
          <path d="M 50 10 C 40 28 30 42 30 58 C 30 75 40 85 50 90 C 60 85 70 75 70 58 C 70 42 60 28 50 10 Z" opacity="0.95" />
          <path d="M 28 32 C 18 45 12 56 12 70 C 12 84 22 92 32 94 C 24 86 24 74 28 62 C 32 50 38 42 28 32 Z" />
          <path d="M 72 32 C 82 45 88 56 88 70 C 88 84 78 92 68 94 C 76 86 76 74 72 62 C 68 50 62 42 72 32 Z" />
        </g>
      </svg>
    );
  }

  // --- BANCO DO BRASIL ---
  if (normalized.includes('banco do brasil') || normalized.includes('bb') || normalized === 'brasil') {
    return (
      <svg viewBox="0 0 100 100" className={`rounded-xl overflow-hidden shadow-md ${className}`} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="22" fill="#FCED00" />
        {/* Fita geométrica entrelaçada clássica do BB */}
        <g fill="#003882" transform="translate(15, 15) scale(0.7)">
          <path d="M 20 20 L 50 50 L 20 80 L 35 95 L 65 65 L 50 50 L 65 35 L 50 20 Z" />
          <path d="M 80 20 L 50 50 L 80 80 L 65 95 L 35 65 L 50 50 L 35 35 L 50 20 Z" />
        </g>
        <text x="50" y="90" fill="#003882" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="13" textAnchor="middle" letterSpacing="1">BB</text>
      </svg>
    );
  }

  // --- INTER ---
  if (normalized.includes('inter')) {
    return (
      <svg viewBox="0 0 100 100" className={`rounded-xl overflow-hidden shadow-md ${className}`} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="22" fill="#FF7A00" />
        <text x="50" y="58" fill="#FFFFFF" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="23" textAnchor="middle" letterSpacing="-0.5">inter</text>
        <circle cx="73" cy="42" r="3.5" fill="#FFFFFF" />
      </svg>
    );
  }

  // --- CAIXA ---
  if (normalized.includes('caixa')) {
    return (
      <svg viewBox="0 0 100 100" className={`rounded-xl overflow-hidden shadow-md ${className}`} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="22" fill="#005CA9" />
        <g transform="translate(16, 16) scale(0.68)">
          {/* X da Caixa com azul e laranja */}
          <path d="M 15 15 L 45 50 L 15 85 L 35 85 L 55 60 L 40 45 L 35 15 Z" fill="#FFFFFF" />
          <path d="M 85 15 L 55 50 L 85 85 L 65 85 L 45 60 L 60 45 L 65 15 Z" fill="#F37021" />
        </g>
        <text x="50" y="86" fill="#FFFFFF" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="11" textAnchor="middle" letterSpacing="1">CAIXA</text>
      </svg>
    );
  }

  // --- XP INVESTIMENTOS ---
  if (normalized.includes('xp')) {
    return (
      <svg viewBox="0 0 100 100" className={`rounded-xl overflow-hidden shadow-md ${className}`} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="22" fill="#000000" stroke="#333" strokeWidth="1.5" />
        <text x="50" y="62" fill="#FFD700" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="42" textAnchor="middle" letterSpacing="-1">XP</text>
      </svg>
    );
  }

  // --- BTG PACTUAL ---
  if (normalized.includes('btg')) {
    return (
      <svg viewBox="0 0 100 100" className={`rounded-xl overflow-hidden shadow-md ${className}`} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="22" fill="#001E3D" stroke="#003566" strokeWidth="2" />
        <text x="50" y="58" fill="#FFFFFF" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="24" textAnchor="middle" letterSpacing="0.5">BTG</text>
        <text x="50" y="74" fill="#90CAF9" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="9" textAnchor="middle" letterSpacing="1.5">PACTUAL</text>
      </svg>
    );
  }

  // --- PICPAY ---
  if (normalized.includes('picpay') || normalized.includes('pic pay')) {
    return (
      <svg viewBox="0 0 100 100" className={`rounded-xl overflow-hidden shadow-md ${className}`} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="22" fill="#11C76F" />
        <text x="46" y="62" fill="#FFFFFF" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="44" textAnchor="middle">P</text>
        <circle cx="70" cy="55" r="5" fill="#FFFFFF" />
      </svg>
    );
  }

  // --- MERCADO PAGO ---
  if (normalized.includes('mercado') || normalized.includes('mercadopago')) {
    return (
      <svg viewBox="0 0 100 100" className={`rounded-xl overflow-hidden shadow-md ${className}`} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="22" fill="#009EE3" />
        {/* Aperto de mão simplificado */}
        <g fill="#FFFFFF" textAnchor="middle">
          <text x="50" y="52" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="26" letterSpacing="-1">MP</text>
          <text x="50" y="72" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="9" letterSpacing="1">MERCADO PAGO</text>
        </g>
      </svg>
    );
  }

  // --- NEON ---
  if (normalized.includes('neon')) {
    return (
      <svg viewBox="0 0 100 100" className={`rounded-xl overflow-hidden shadow-md ${className}`} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="22" fill="#00E5C9" />
        <text x="50" y="60" fill="#051726" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="26" textAnchor="middle" letterSpacing="-0.5">neon</text>
      </svg>
    );
  }

  // --- GKD MOBILITY (APP BRAND) ---
  if (normalized.includes('gkd') || normalized.includes('mobility')) {
    return (
      <svg viewBox="0 0 100 100" className={`rounded-xl overflow-hidden shadow-md ${className}`} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="22" fill="#0B132B" stroke="#0077FE" strokeWidth="2" />
        <text x="50" y="52" fill="#FFFFFF" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="22" textAnchor="middle" letterSpacing="-0.5">GKD</text>
        <text x="50" y="70" fill="#00A2FE" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="9" textAnchor="middle" letterSpacing="1.5">MOBILITY</text>
      </svg>
    );
  }

  // --- FALLBACK ELEGANTE PARA BANCOS NÃO MAPEADOS ---
  const initial = name ? name.substring(0, 1).toUpperCase() : '?';
  return (
    <div className={`bg-gradient-to-br from-purple-700 to-indigo-900 flex items-center justify-center rounded-xl font-black text-white shadow-md border border-white/10 ${className}`}>
      {initial}
    </div>
  );
};
