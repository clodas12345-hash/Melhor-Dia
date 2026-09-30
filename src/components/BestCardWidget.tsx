import React, { useState } from 'react';
import { ArrowLeft, CreditCard as CardIcon, Calendar, CheckCircle2 } from 'lucide-react';
import { CreditCard } from '../types';
import { BankLogo } from './BankLogo';
import { motion } from 'motion/react';

interface BestCardWidgetProps {
  creditCards: CreditCard[];
  onOpenManage: () => void;
  onOpenNfc?: () => void;
}

const getCardStyle = (name: string, segment?: string) => {
  if (!name) return 'bg-gradient-to-br from-slate-700 to-slate-900 text-white';
  const normalized = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  const normalizedSegment = segment?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') || '';
  
  if (normalized.includes('nubank') || normalized.includes('nu')) {
    if (normalizedSegment.includes('ultravioleta')) return 'bg-gradient-to-br from-[#1a0124] via-[#2d023d] to-[#000000] text-white border-purple-900/50';
    return 'bg-gradient-to-br from-[#8A05BE] to-[#5a0380] text-white';
  }
  
  if (normalized.includes('itau')) {
    if (normalizedSegment.includes('personnalite')) return 'bg-gradient-to-br from-[#1a1a1a] via-[#333333] to-[#000000] text-[#D4AF37] border-[#D4AF37]/30';
    if (normalizedSegment.includes('uniclass')) return 'bg-gradient-to-br from-[#EC7000] via-[#B8860B] to-[#140B03] text-white border-yellow-600/30';
    if (normalizedSegment.includes('private')) return 'bg-gradient-to-br from-[#0a0a0a] to-[#262626] text-[#C0C0C0] border-slate-500/30';
    return 'bg-gradient-to-br from-[#EC7000] to-[#E84E1B] text-white';
  }

  if (normalized.includes('santander')) {
    if (normalizedSegment.includes('select')) return 'bg-gradient-to-br from-[#CC0000] via-[#660000] to-[#000000] text-white border-red-500/30';
    return 'bg-gradient-to-br from-[#CC0000] to-[#800000] text-white';
  }

  if (normalized.includes('bradesco')) {
    if (normalizedSegment.includes('prime')) return 'bg-gradient-to-br from-[#8C001A] via-[#4D000E] to-[#000000] text-white border-red-900/40';
    return 'bg-gradient-to-br from-[#CC092F] to-[#8C001A] text-white';
  }

  if (normalized.includes('inter')) {
    if (normalizedSegment.includes('black') || normalizedSegment.includes('win')) return 'bg-gradient-to-br from-[#000000] via-[#1a1a1a] to-[#262626] text-white border-zinc-700';
    return 'bg-gradient-to-br from-[#FF7A00] to-[#CC6200] text-white';
  }
  
  if (normalized.includes('gkd') || normalized.includes('mobility')) return 'bg-gradient-to-br from-[#0c2340] to-[#1e293b] text-white border-white/10';
  if (normalized.includes('caixa')) return 'bg-gradient-to-br from-[#005CA9] to-[#003B73] text-white';
  if (normalized.includes('bancodobrasil') || normalized.includes('bb')) return 'bg-gradient-to-br from-[#F9D308] to-[#D4B506] text-slate-900';
  if (normalized.includes('c6')) return 'bg-gradient-to-br from-[#242424] to-[#000000] text-white';
  if (normalized.includes('xp')) return 'bg-gradient-to-br from-[#000000] to-[#1a1a1a] text-[#FFD700]';
  if (normalized.includes('btg')) return 'bg-gradient-to-br from-[#002B49] to-[#001726] text-white';
  if (normalized.includes('picpay')) return 'bg-gradient-to-br from-[#11C76F] to-[#0B8A4D] text-white';
  if (normalized.includes('pagbank')) return 'bg-gradient-to-br from-[#00B962] to-[#008A49] text-white';
  if (normalized.includes('neon')) return 'bg-gradient-to-br from-[#00E5C9] to-[#00A38C] text-[#000000]';
  
  return 'bg-gradient-to-br from-slate-700 to-slate-800 text-white';
};

export const BestCardWidget: React.FC<BestCardWidgetProps> = ({ creditCards, onOpenManage }) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [queryDate, setQueryDate] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const queryDay = new Date(queryDate + 'T00:00:00').getDate() || 1;
  const [isScanning, setIsScanning] = useState(false);

  // Trigger scan animation on date change
  React.useEffect(() => {
    setIsScanning(true);
    const timer = setTimeout(() => setIsScanning(false), 600);
    return () => clearTimeout(timer);
  }, [queryDate]);

  const getDaysSince = (day: number) => {
    let diff = queryDay - day;
    if (diff < 0) diff += 31;
    return diff;
  };

  const sortedCards = [...creditCards].sort((a, b) => getDaysSince(a.bestDay) - getDaysSince(b.bestDay));
  const bestCard = sortedCards[0];
  const activeCard = selectedCardId 
    ? (creditCards.find(c => c.id === selectedCardId) || bestCard)
    : bestCard;

  const getPaymentDetails = (card: CreditCard) => {
    const diff = queryDay - card.bestDay;
    if (diff >= 0) {
      return {
        isClosed: true,
        daysToPay: Math.min(40, 40 - diff),
        status: diff === 0 
          ? '🎯 Melhor dia para comprar! A fatura fecha HOJE.' 
          : `✓ Fatura fechou há ${diff} ${diff === 1 ? 'dia' : 'dias'}. A cobrança entra no mês seguinte.`
      };
    } else {
      const daysUntilClose = Math.abs(diff);
      return {
        isClosed: false,
        daysToPay: 10 + daysUntilClose,
        status: `⏳ Fatura fecha em ${daysUntilClose} ${daysUntilClose === 1 ? 'dia' : 'dias'}.`
      };
    }
  };

  const getCardContainerStyle = (name: string, segment?: string) => {
    if (!name) return 'bg-[#18181B] border-white/10';
    const normalized = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
    const normalizedSegment = segment?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') || '';
    
    if (normalized.includes('nubank') || normalized.includes('nu')) {
      if (normalizedSegment.includes('ultravioleta')) return 'bg-gradient-to-br from-[#1a0124]/40 via-[#000000] to-[#000000] border-[#8A05BE]/40 shadow-[0_0_50px_rgba(138,5,190,0.3)]';
      return 'bg-gradient-to-br from-[#8A05BE]/30 via-[#180824] to-[#0c0414] border-[#8A05BE]/50 shadow-[0_0_50px_rgba(138,5,190,0.3)]';
    }

    if (normalized.includes('itau')) {
      if (normalizedSegment.includes('personnalite')) return 'bg-gradient-to-br from-[#1a1a1a]/60 via-[#0a0a0a] to-[#000000] border-[#D4AF37]/40 shadow-[0_0_50px_rgba(212,175,55,0.25)]';
      return 'bg-gradient-to-br from-[#EC7000]/30 via-[#211104] to-[#0d0702] border-[#EC7000]/50 shadow-[0_0_50px_rgba(236,112,0,0.3)]';
    }
    if (normalized.includes('bradesco')) return 'bg-gradient-to-br from-[#CC092F]/30 via-[#20050a] to-[#0d0204] border-[#CC092F]/50 shadow-[0_0_50px_rgba(204,9,47,0.3)]';
    if (normalized.includes('santander')) return 'bg-gradient-to-br from-[#CC0000]/30 via-[#200404] to-[#0d0202] border-[#CC0000]/50 shadow-[0_0_50px_rgba(204,0,0,0.3)]';
    if (normalized.includes('caixa')) return 'bg-gradient-to-br from-[#005CA9]/30 via-[#051524] to-[#020b12] border-[#005CA9]/50 shadow-[0_0_50px_rgba(0,92,169,0.3)]';
    if (normalized.includes('bancodobrasil') || normalized.includes('bb')) return 'bg-gradient-to-br from-[#F9D308]/20 via-[#1a1602] to-[#0d0b01] border-[#F9D308]/50 shadow-[0_0_50px_rgba(249,211,8,0.25)]';
    if (normalized.includes('inter')) return 'bg-gradient-to-br from-[#FF7A00]/30 via-[#201203] to-[#0d0701] border-[#FF7A00]/50 shadow-[0_0_50px_rgba(255,122,0,0.3)]';
    if (normalized.includes('c6')) return 'bg-gradient-to-br from-zinc-700/40 via-zinc-900 to-black border-zinc-500 shadow-[0_0_50px_rgba(255,255,255,0.15)]';
    if (normalized.includes('xp')) return 'bg-gradient-to-br from-yellow-400/20 via-zinc-900 to-black border-yellow-400/50 shadow-[0_0_50px_rgba(250,204,21,0.25)]';
    if (normalized.includes('btg')) return 'bg-gradient-to-br from-[#002B49]/50 via-[#06111a] to-[#02060a] border-[#004B7C]/50 shadow-[0_0_50px_rgba(0,75,124,0.3)]';
    if (normalized.includes('picpay')) return 'bg-gradient-to-br from-[#11C76F]/30 via-[#041f11] to-[#010d07] border-[#11C76F]/50 shadow-[0_0_50px_rgba(17,199,111,0.3)]';
    
    return 'bg-[#18181B] border-white/20 shadow-xl';
  };

  // Reorder cards so the active card is always at the front of the wallet
  const displayCardsList = React.useMemo(() => {
    if (!activeCard) return sortedCards;
    const others = sortedCards.filter(c => c.id !== activeCard.id);
    return [activeCard, ...others];
  }, [sortedCards, activeCard]);

  // Dynamic height calculation so the wallet stack NEVER overflows onto other components
  const cardStepY = 72; // Spacing between card heads in the wallet
  const cardHeight = 160; // Physical card height
  const walletHeight = Math.max(220, cardHeight + (displayCardsList.length - 1) * cardStepY + 20);

  const cardToDisplay = (hoveredCardId && creditCards.find(c => c.id === hoveredCardId)) || activeCard;
  const currentDetails = cardToDisplay ? getPaymentDetails(cardToDisplay) : null;

  return (
    <div className={`rounded-3xl p-4 sm:p-6 border relative flex flex-col transition-all duration-700 ${getCardContainerStyle(activeCard?.name || '', activeCard?.segment)}`}>
      {/* Scanning Effect Overlay */}
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-3xl">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-scan" />
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
            <CardIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm sm:text-base">Carteira de Cartões</h3>
            <p className="text-[11px] text-slate-400">Toque em qualquer cartão para puxar para a frente</p>
          </div>
        </div>
        
        <button
          onClick={onOpenManage}
          className="text-[10px] sm:text-xs font-semibold text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-xl transition border border-purple-500/20 cursor-pointer"
        >
          Gerenciar
        </button>
      </div>

      {/* Date Picker Bar */}
      <div className="mb-4 bg-black/60 border border-white/10 rounded-2xl p-3 flex flex-col gap-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-200">Escolha a data da compra:</span>
          <div className="flex items-center gap-1.5 bg-slate-900 border border-white/20 rounded-xl px-2.5 py-1.5">
            <Calendar className="w-4 h-4 text-purple-400" />
            <input
              type="date"
              value={queryDate}
              onChange={(e) => e.target.value && setQueryDate(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {bestCard && (
          <div className="text-[11px] text-slate-200 bg-white/5 px-3 py-2 rounded-xl border border-white/10 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-slate-300">Melhor opção para o dia {queryDay}:</span>
              <strong className="text-white font-bold flex items-center gap-1">
                {bestCard.name}
                {bestCard.segment && (
                  <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded-full font-bold">
                    {bestCard.segment}
                  </span>
                )}
              </strong>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30 font-semibold whitespace-nowrap">
              Melhor dia: {bestCard.bestDay}
            </span>
          </div>
        )}
      </div>

      {/* Informações de Status e Prazo (Posicionado com espaço garantido e independente, NUNCA sobreposto) */}
      {cardToDisplay && currentDetails && (
        <div className="mb-4 bg-black/70 border border-white/15 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md flex flex-col gap-1.5 shadow-xl transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              Status para <strong className="text-purple-300 font-bold">{cardToDisplay.name}</strong>:
            </span>
            <span className="text-xs font-black text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-500/30 whitespace-nowrap">
              Prazo Est. ~{currentDetails.daysToPay} dias
            </span>
          </div>
          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            {currentDetails.status}
          </p>
        </div>
      )}

      {/* Main Content Area - Formato de Carteira (Wallet Stack) */}
      <div className="relative w-full flex flex-col">
        {creditCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 p-4 bg-white/5 border border-white/5 border-dashed rounded-2xl text-center gap-2">
            <CardIcon className="w-8 h-8 text-slate-500" />
            <p className="text-xs text-slate-400">Nenhum cartão cadastrado.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Cartões na Carteira ({creditCards.length}):</span>
              </span>
              {selectedCardId && (
                <button
                  onClick={() => setSelectedCardId(null)}
                  className="text-[10px] text-purple-300 hover:text-white flex items-center gap-1 bg-purple-500/20 hover:bg-purple-500/30 px-2.5 py-1 rounded-lg border border-purple-500/30 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Voltar ao Recomendado
                </button>
              )}
            </div>

            {/* Container da Carteira com Altura Dinâmica Garantida (evita colisão de layout) */}
            <div 
              className="relative w-full transition-all duration-300 select-none"
              style={{ height: `${walletHeight}px` }}
            >
              {displayCardsList.map((card, idx) => {
                const isActive = activeCard?.id === card.id;
                const isHovered = hoveredCardId === card.id;
                const isTopRecommended = card.id === bestCard?.id;
                
                // Profundidade e espaçamento da carteira
                const translateY = idx * cardStepY;
                const scale = isActive ? 1 : Math.max(0.88, 1 - (idx * 0.025));
                const zIndex = 40 - idx;
                const opacity = isActive || isHovered ? 1 : Math.max(0.7, 1 - (idx * 0.08));

                return (
                  <motion.div
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    onMouseEnter={() => setHoveredCardId(card.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    style={{ 
                      zIndex,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      opacity
                    }}
                    animate={{
                      y: translateY,
                      scale: scale,
                    }}
                    whileHover={{
                      y: Math.max(0, translateY - 12),
                      scale: scale + 0.015,
                      transition: { duration: 0.15 }
                    }}
                    whileTap={{
                      y: translateY + 2,
                      scale: scale - 0.01,
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    className={`w-full rounded-2xl p-4 sm:p-5 flex flex-col justify-between border shadow-2xl cursor-pointer transition-colors ${getCardStyle(card.name, card.segment)} ${
                      isActive
                        ? 'ring-2 ring-white/60 border-white shadow-[0_10px_30px_rgba(0,0,0,0.6)]'
                        : 'border-white/20 hover:border-white/40'
                    } h-40 sm:h-44`}
                  >
                    {/* Linha Superior do Cartão */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <BankLogo 
                          name={card.name} 
                          segment={card.segment} 
                          customLogo={card.customLogo} 
                          className="w-10 h-10 rounded-xl shadow-md shrink-0" 
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-extrabold tracking-wider text-base sm:text-lg drop-shadow-sm truncate max-w-[180px] sm:max-w-[240px]">
                              {card.name}
                            </p>
                            {card.segment && (
                              <span className="text-[9px] bg-black/40 text-white border border-white/20 px-2 py-0.5 rounded-full font-bold backdrop-blur-md shrink-0">
                                {card.segment}
                              </span>
                            )}
                          </div>
                          {(isActive || isHovered) && (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-black/50 text-white font-bold px-2 py-0.5 rounded-full border border-white/30 backdrop-blur-md mt-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              {isActive ? 'Selecionado' : 'Visualizar'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="text-right bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20">
                          <span className="text-[8px] opacity-80 uppercase tracking-widest font-bold block">Fechamento</span>
                          <span className="text-xs sm:text-sm font-black">Dia {card.bestDay}</span>
                        </div>

                        {isTopRecommended && (
                          <span className="text-[9px] bg-emerald-500 text-white font-black px-2 py-0.5 rounded-md shadow-md tracking-wider uppercase border border-emerald-300">
                            ★ Melhor Escolha
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Linha Inferior do Cartão */}
                    <div className="flex justify-between items-end pt-2 border-t border-white/10">
                      <div className="text-left">
                        <span className="text-[9px] uppercase tracking-widest opacity-80 font-semibold block">Cartão de Crédito</span>
                        <span className="text-xs font-bold opacity-95">•••• •••• {card.bestDay < 10 ? `0${card.bestDay}` : card.bestDay}</span>
                      </div>

                      <div className="flex items-center gap-1 opacity-70">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
