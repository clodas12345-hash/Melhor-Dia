import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, User, X, ArrowRight, Award } from 'lucide-react';
import { CreditCard } from '../types';
import { BankLogo } from './BankLogo';

interface GreetingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  creditCards: CreditCard[];
}

export const GreetingPopup: React.FC<GreetingPopupProps> = ({
  isOpen,
  onClose,
  creditCards,
}) => {
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('gkb_user_name') || '';
  });
  const [isEditingName, setIsEditingName] = useState<boolean>(() => {
    return !localStorage.getItem('gkb_user_name');
  });
  const [tempName, setTempName] = useState(userName);

  useEffect(() => {
    const saved = localStorage.getItem('gkb_user_name');
    if (saved) {
      setUserName(saved);
      setTempName(saved);
      setIsEditingName(false);
    } else {
      setIsEditingName(true);
    }
  }, [isOpen]);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem('gkb_user_name', tempName.trim());
      setIsEditingName(false);
    }
  };

  if (!isOpen) return null;

  // Calculate best card today
  const today = new Date();
  const currentDay = today.getDate();

  const getDaysSince = (day: number, queryDay: number) => {
    let diff = queryDay - day;
    if (diff < 0) diff += 31;
    return diff;
  };

  const sortedCards = [...creditCards].sort(
    (a, b) => getDaysSince(a.bestDay, currentDay) - getDaysSince(b.bestDay, currentDay)
  );

  const bestCard = sortedCards[0];
  const secondCard = sortedCards[1];

  // Calculate when it changes
  // The best card changes when the query day reaches the next card's best cycle.
  // Or simply when does the best card switch?
  // Let's find how many days until the next card becomes better.
  let daysUntilChange = 1;
  let nextCardName = secondCard ? secondCard.name : 'Nenhum outro cartão';

  if (bestCard && secondCard) {
    // Check upcoming days to see when secondCard or another card beats bestCard
    for (let d = 1; d <= 31; d++) {
      const futureDay = ((currentDay - 1 + d) % 31) + 1;
      const futureSorted = [...creditCards].sort(
        (a, b) => getDaysSince(a.bestDay, futureDay) - getDaysSince(b.bestDay, futureDay)
      );
      if (futureSorted[0].id !== bestCard.id) {
        daysUntilChange = d;
        nextCardName = futureSorted[0].name;
        break;
      }
    }
  }

  // Time of day greeting
  const hour = today.getHours();
  let timeGreeting = 'Bom dia';
  if (hour >= 12 && hour < 18) timeGreeting = 'Boa tarde';
  else if (hour >= 18 || hour < 5) timeGreeting = 'Boa noite';

  const formattedDate = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const normalizedCardName = bestCard ? bestCard.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') : '';
  
  let cardTheme = {
    bgGradient: 'from-purple-950/80 via-indigo-950/60 to-slate-950',
    borderColor: 'border-purple-500/40',
    glowColor: 'bg-purple-600/30',
    accentText: 'text-purple-400',
    badgeBg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
    buttonGradient: 'from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25',
  };

  if (normalizedCardName.includes('nubank') || normalizedCardName.includes('nu')) {
    cardTheme = {
      bgGradient: 'from-purple-950/80 via-purple-900/50 to-slate-950',
      borderColor: 'border-purple-500/40',
      glowColor: 'bg-purple-600/35',
      accentText: 'text-purple-400',
      badgeBg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
      buttonGradient: 'from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 shadow-purple-500/25',
    };
  } else if (normalizedCardName.includes('itau')) {
    cardTheme = {
      bgGradient: 'from-blue-950/80 via-blue-900/50 to-slate-950',
      borderColor: 'border-blue-500/40',
      glowColor: 'bg-blue-600/35',
      accentText: 'text-blue-400',
      badgeBg: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
      buttonGradient: 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25',
    };
  } else if (normalizedCardName.includes('bradesco') || normalizedCardName.includes('santander') || normalizedCardName.includes('rural') || normalizedCardName.includes('24horas')) {
    cardTheme = {
      bgGradient: 'from-red-950/80 via-rose-900/50 to-slate-950',
      borderColor: 'border-rose-500/40',
      glowColor: 'bg-rose-600/35',
      accentText: 'text-rose-400',
      badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      buttonGradient: 'from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-500/25',
    };
  } else if (normalizedCardName.includes('inter') || normalizedCardName.includes('bmg')) {
    cardTheme = {
      bgGradient: 'from-amber-950/80 via-orange-950/50 to-slate-950',
      borderColor: 'border-amber-500/40',
      glowColor: 'bg-amber-600/35',
      accentText: 'text-amber-400',
      badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      buttonGradient: 'from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-500/25',
    };
  } else if (normalizedCardName.includes('bancodobrasil') || normalizedCardName.includes('bb') || normalizedCardName.includes('alfa')) {
    cardTheme = {
      bgGradient: 'from-yellow-950/80 via-amber-950/50 to-slate-950',
      borderColor: 'border-yellow-500/40',
      glowColor: 'bg-yellow-600/35',
      accentText: 'text-yellow-400',
      badgeBg: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300',
      buttonGradient: 'from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 shadow-yellow-500/25',
    };
  } else if (normalizedCardName.includes('caixa') || normalizedCardName.includes('brb') || normalizedCardName.includes('unibanco')) {
    cardTheme = {
      bgGradient: 'from-sky-950/80 via-blue-950/50 to-slate-950',
      borderColor: 'border-sky-500/40',
      glowColor: 'bg-sky-600/35',
      accentText: 'text-sky-400',
      badgeBg: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
      buttonGradient: 'from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 shadow-sky-500/25',
    };
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className={`bg-gradient-to-br ${cardTheme.bgGradient} border ${cardTheme.borderColor} rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden transition-all duration-500`}>
        {/* Decorative background glow */}
        <div className={`absolute -top-24 -right-24 w-48 h-48 ${cardTheme.glowColor} rounded-full blur-3xl pointer-events-none`} />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Greeting */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${cardTheme.badgeBg}`}>
              {timeGreeting}
            </span>
            <span className="text-xs text-slate-400 capitalize">{formattedDate}</span>
          </div>

          <div className="flex items-center justify-between">
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex flex-col gap-2 mt-2 w-full">
                <label className="text-xs font-bold text-slate-300">Como você gostaria de ser chamado(a)?</label>
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Seu nome..."
                    className={`bg-black/60 border ${cardTheme.borderColor} rounded-xl px-3 py-2 text-white font-bold text-base focus:outline-none w-full`}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className={`bg-gradient-to-r ${cardTheme.buttonGradient} text-white font-bold px-4 py-2 rounded-xl text-xs transition whitespace-nowrap cursor-pointer shadow-lg`}
                  >
                    Salvar
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Olá, <span className={`${cardTheme.accentText} underline decoration-current/40 underline-offset-4`}>{userName}</span>!
                </h2>
                <User className={`w-4 h-4 text-slate-500 group-hover:${cardTheme.accentText} transition`} />
              </div>
            )}
          </div>
        </div>

        {/* Best Card Highlight Box */}
        {creditCards.length === 0 ? (
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center text-sm text-slate-400 mb-6">
            Nenhum cartão cadastrado. Adicione cartões para ver a recomendação.
          </div>
        ) : bestCard ? (
          <div className={`bg-gradient-to-r from-black/60 via-black/40 to-black/60 border ${cardTheme.borderColor} rounded-2xl p-4 sm:p-5 mb-6 relative shadow-inner`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold ${cardTheme.accentText} flex items-center gap-1.5`}>
                <Award className={`w-4 h-4 ${cardTheme.accentText}`} />
                Melhor cartão para hoje ({currentDay})
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
                Melhor dia: {bestCard.bestDay}
              </span>
            </div>

            <div className="flex items-center gap-3.5 bg-black/40 p-3.5 rounded-xl border border-white/10">
              <BankLogo name={bestCard.name} customLogo={bestCard.customLogo} className="w-12 h-12 shadow-md shrink-0" />
              <div className="min-w-0 flex-1">
                <h4 className="text-white font-black text-base truncate">{bestCard.name}</h4>
                <p className="text-xs text-emerald-400 font-medium">
                  Fatura fechou recentemente. Máximo prazo sem juros!
                </p>
              </div>
            </div>

            {/* When it changes */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar className={`w-3.5 h-3.5 ${cardTheme.accentText}`} />
                Próxima troca de melhor cartão:
              </span>
              <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg">
                Em {daysUntilChange} {daysUntilChange === 1 ? 'dia' : 'dias'} ({nextCardName})
              </span>
            </div>
          </div>
        ) : null}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className={`w-full py-3 bg-gradient-to-r ${cardTheme.buttonGradient} text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-sm`}
          >
            <span>Começar a usar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
