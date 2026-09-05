import React, { useEffect, useState } from 'react';
import { getStoredLogo, normalizeBankName } from '../lib/logoMemory';

interface BankLogoProps {
  name: string;
  segment?: string;
  customLogo?: string;
  className?: string;
}

export const BankLogo: React.FC<BankLogoProps> = ({ name, segment, customLogo, className = "" }) => {
  const [error, setError] = useState(false);
  const [memoryUrl, setMemoryUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function loadLogo() {
      if (customLogo) {
        setLoading(false);
        return;
      }

      setLoading(true);
      // Busca combinando nome e segmento para maior precisão
      const fullName = segment ? `${name} ${segment}` : name;
      const stored = await getStoredLogo(fullName);
      
      if (isMounted) {
        if (stored) {
          setMemoryUrl(stored);
        } else if (segment) {
          // Tenta buscar apenas pelo nome se o segmento falhar
          const storedOnlyName = await getStoredLogo(name);
          if (storedOnlyName) setMemoryUrl(storedOnlyName);
        }
        setLoading(false);
      }
    }

    loadLogo();
    return () => { isMounted = false; };
  }, [name, segment, customLogo]);

  const normalized = normalizeBankName(name);
  const normalizedSegment = segment ? normalizeBankName(segment) : '';

  // Mapeamento de logotipos fallback (URLs estáveis se o Firestore falhar ou estiver vazio)
  const getFallbackLogoUrl = () => {
    if (customLogo) return customLogo;

    if (normalized.includes('itau')) {
      if (normalizedSegment.includes('personnalite')) {
        return 'https://logodownload.org/wp-content/uploads/2014/05/itau-personnalite-logo.png';
      }
      if (normalizedSegment.includes('uniclass')) {
        return 'https://logodownload.org/wp-content/uploads/2014/05/itau-uniclass-logo.png';
      }
      // Logo clássico oficial do Itaú - Usando Wikimedia para máxima estabilidade e transparência
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Logo_Ita%C3%BA.svg/100px-Logo_Ita%C3%BA.svg.png';
    }
    if (normalized.includes('nubank') || normalized.includes('nu bank') || normalized.includes(' roxinho')) {
      return 'https://logodownload.org/wp-content/uploads/2019/08/nubank-logo-3.png';
    }
    if (normalized.includes('bradesco')) {
      return 'https://logodownload.org/wp-content/uploads/2014/05/bradesco-logo-1.png';
    }
    if (normalized.includes('santander')) {
      return 'https://logodownload.org/wp-content/uploads/2014/05/santander-logo-1.png';
    }
    if (normalized.includes('banco do brasil') || normalized.includes(' bb ') || normalized === 'bb') {
      return 'https://logodownload.org/wp-content/uploads/2014/05/banco-do-brasil-logo-1.png';
    }
    if (normalized.includes('inter')) {
      return 'https://logodownload.org/wp-content/uploads/2018/11/banco-inter-logo-1.png';
    }
    if (normalized.includes('c6')) {
      return 'https://logodownload.org/wp-content/uploads/2019/09/c6-bank-logo-1.png';
    }
    if (normalized.includes('xp')) {
      return 'https://logodownload.org/wp-content/uploads/2018/10/xp-investimentos-logo-1.png';
    }
    if (normalized.includes('btg')) {
      return 'https://logodownload.org/wp-content/uploads/2018/10/btg-pactual-logo-1.png';
    }
    if (normalized.includes('caixa')) {
      return 'https://logodownload.org/wp-content/uploads/2014/02/caixa-logo-1.png';
    }
    if (normalized.includes('safra')) {
      return 'https://logodownload.org/wp-content/uploads/2018/10/banco-safra-logo-1.png';
    }
    if (normalized.includes('digio')) {
      return 'https://logodownload.org/wp-content/uploads/2018/10/digio-logo.png';
    }
    if (normalized.includes('pagbank') || normalized.includes('pagseguro')) {
      return 'https://logodownload.org/wp-content/uploads/2019/06/pagbank-logo-0.png';
    }
    
    // Fallback para UI Avatars se não houver mapeamento
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&bold=true`;
  };

  const finalUrl = customLogo || memoryUrl || getFallbackLogoUrl();

  // Cores de fundo para o fallback baseadas no banco
  const getFallbackBg = () => {
    if (normalized.includes('itau')) return 'bg-[#EC7000]';
    if (normalized.includes('nubank')) return 'bg-[#8A05BE]';
    if (normalized.includes('santander')) return 'bg-[#CC0000]';
    if (normalized.includes('bradesco')) return 'bg-[#CC092F]';
    return 'bg-purple-600';
  };

  // Se houver erro, mostra a letra. Se estiver carregando mas já temos o fallback do código, mostra o fallback.
  if (error) {
    return (
      <div className={`${getFallbackBg()} flex items-center justify-center rounded-xl font-bold text-white shadow-sm border border-white/10 ${className}`}>
        {name.substring(0, 1).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`bg-white p-1 rounded-lg flex items-center justify-center overflow-hidden shadow-sm border border-black/5 ${className}`}>
      <img
        src={finalUrl}
        alt={name}
        className={`w-full h-full object-contain transition-opacity duration-300 ${loading && !memoryUrl ? 'opacity-50' : 'opacity-100'}`}
        onError={() => setError(true)}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
