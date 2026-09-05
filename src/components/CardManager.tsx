import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, AlertCircle, Info, ShieldCheck, MessageCircle } from 'lucide-react';
import { CreditCard } from '../types';
import { BankLogo } from './BankLogo';

interface CardManagerProps {
  creditCards: CreditCard[];
  onAddCard: (card: Omit<CreditCard, 'id'>) => void;
  onUpdateCard: (card: CreditCard) => void;
  onDeleteCard: (id: string) => void;
  onClose: () => void;
}

const BANK_PRESETS = [
  { name: 'Nubank', defaultBestDay: 5 },
  { name: 'Itaú', defaultBestDay: 1 },
  { name: 'Bradesco', defaultBestDay: 10 },
  { name: 'Santander', defaultBestDay: 8 },
  { name: 'Caixa', defaultBestDay: 12 },
  { name: 'Banco do Brasil', defaultBestDay: 15 },
  { name: 'Inter', defaultBestDay: 6 },
  { name: 'C6 Bank', defaultBestDay: 2 },
  { name: 'Banco24Horas', defaultBestDay: 10 },
  { name: 'Banco Alfa', defaultBestDay: 14 },
  { name: 'BRB', defaultBestDay: 7 },
  { name: 'Banco Central', defaultBestDay: 20 },
  { name: 'BDMG', defaultBestDay: 15 },
  { name: 'Banco Real', defaultBestDay: 5 },
  { name: 'Banco Rural', defaultBestDay: 10 },
  { name: 'Banco BMG', defaultBestDay: 18 },
  { name: 'BNDES', defaultBestDay: 12 },
  { name: 'Citibank', defaultBestDay: 25 },
  { name: 'HSBC', defaultBestDay: 10 },
  { name: 'Mercantil do Brasil', defaultBestDay: 9 },
  { name: 'Unibanco', defaultBestDay: 11 },
  { name: 'XP Investimentos', defaultBestDay: 20 },
  { name: 'PicPay', defaultBestDay: 11 },
  { name: 'Neon', defaultBestDay: 4 }
];

export const CardManager: React.FC<CardManagerProps> = ({
  creditCards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState<string | null>(null); // card ID if editing, or 'new' for adding
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [segment, setSegment] = useState('');
  const [bestDay, setBestDay] = useState<number | ''>(5);
  const [customLogo, setCustomLogo] = useState('');
  const [error, setError] = useState('');

  const BANK_SEGMENTS: Record<string, string[]> = {
    'itau': ['Varejo', 'Click', 'Uniclass', 'Personnalité', 'Private'],
    'santander': ['Varejo', 'SX', 'Elite', 'Select', 'Private'],
    'bradesco': ['Varejo', 'Exclusive', 'Prime', 'Private'],
    'nubank': ['Padrão', 'Ultravioleta'],
    'inter': ['Padrão', 'One', 'Black', 'Win'],
    'banco do brasil': ['Varejo', 'Estilo', 'Private'],
    'caixa': ['Varejo', 'Azul', 'Elo Nanquim'],
    'c6 bank': ['Padrão', 'Carbon'],
    'xp': ['One', 'Visa Infinite'],
    'btg': ['Padrão', 'Black']
  };

  const getSuggestedSegments = () => {
    const normalized = name.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    for (const [bank, segments] of Object.entries(BANK_SEGMENTS)) {
      if (normalized.includes(bank)) return segments;
    }
    return [];
  };

  const handleOpenNew = () => {
    setName('');
    setSegment('');
    setBestDay(5);
    setCustomLogo('');
    setIsEditing('new');
    setError('');
  };

  const handleOpenEdit = (card: CreditCard) => {
    setName(card.name);
    setSegment(card.segment || '');
    setBestDay(card.bestDay);
    setCustomLogo(card.customLogo || '');
    setIsEditing(card.id);
    setError('');
  };

  const selectPreset = (preset: typeof BANK_PRESETS[0]) => {
    setName(preset.name);
    setBestDay(preset.defaultBestDay);
    setSegment('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome do cartão.');
      return;
    }
    
    const parsedBestDay = typeof bestDay === 'number' ? bestDay : parseInt(bestDay, 10);
    if (isNaN(parsedBestDay) || parsedBestDay < 1 || parsedBestDay > 31) {
      setError('O melhor dia de compra deve ser entre 1 e 31.');
      return;
    }

    const cardData = { 
      name: name.trim(), 
      segment: segment.trim() || undefined,
      bestDay: parsedBestDay, 
      customLogo: customLogo.trim() || undefined 
    };

    if (isEditing === 'new') {
      onAddCard(cardData);
    } else if (isEditing) {
      onUpdateCard({ id: isEditing, ...cardData });
    }
    
    // Pequeno atraso para o usuário perceber que foi salvo antes de fechar
    setTimeout(() => {
      setIsEditing(null);
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn" id="card-manager-modal">
      <div className="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Gerenciar Cartões</h2>
            <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full font-semibold">
              {creditCards.length} {creditCards.length === 1 ? 'Cartão' : 'Cartões'}
            </span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Educational banner */}
          <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-4 text-xs text-purple-200 flex gap-3">
            <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-purple-300">O que é o "Melhor Dia"?</p>
              <p className="leading-relaxed opacity-90">
                O melhor dia de compra (fechamento da fatura) ocorre cerca de 10 dias antes do vencimento do cartão. 
                Ao fazer uma compra neste dia ou logo após, a cobrança cai apenas no mês seguinte, gerando até 40 dias de prazo para pagar!
              </p>
            </div>
          </div>

          {isEditing ? (
            /* Create / Edit Form */
            <form onSubmit={handleSubmit} className="space-y-5 bg-white/5 p-5 rounded-2xl border border-white/10 animate-fadeIn">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {isEditing === 'new' ? 'Adicionar Novo Cartão' : 'Editar Cartão'}
              </h3>

              {/* Presets when creating */}
              {isEditing === 'new' && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400">Atalhos para Bancos Populares:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {BANK_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => selectPreset(preset)}
                        className="text-xs px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-purple-600 hover:border-purple-600 transition cursor-pointer font-medium"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Card Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Nome ou Instituição do Cartão</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Nubank, Itaú, Inter"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                {/* Segment Selection */}
                {getSuggestedSegments().length > 0 && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-xs font-semibold text-slate-300">Segmento do Cartão</label>
                    <div className="flex flex-wrap gap-1.5">
                      {getSuggestedSegments().map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSegment(s)}
                          className={`text-xs px-3 py-1.5 rounded-xl border transition cursor-pointer font-medium ${
                            segment === s 
                              ? 'bg-purple-600 border-purple-600 text-white' 
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSegment('')}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition cursor-pointer font-medium ${
                          segment === '' 
                            ? 'bg-purple-600 border-purple-600 text-white' 
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        Nenhum
                      </button>
                    </div>
                  </div>
                )}

                {/* Best Buy Day */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    Melhor Dia de Compra
                    <span className="text-[10px] text-purple-400 font-normal">(Fechamento da Fatura)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={bestDay}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setBestDay('');
                      } else {
                        const num = parseInt(val, 10);
                        if (!isNaN(num)) {
                          setBestDay(num);
                        }
                      }
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                {/* Optional Custom Logo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Link para Logotipo Customizado (Opcional)</label>
                  <input
                    type="url"
                    value={customLogo}
                    onChange={(e) => setCustomLogo(e.target.value)}
                    placeholder="Ex: https://exemplo.com/logo.png"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition cursor-pointer text-center"
                >
                  Salvar Cartão
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(null)}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-sm transition cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            /* Cards List */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Cartões Cadastrados</span>
                <button
                  onClick={handleOpenNew}
                  className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Novo Cartão
                </button>
              </div>

              {creditCards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 bg-white/5 border border-white/10 border-dashed rounded-2xl text-center gap-2">
                  <AlertCircle className="w-8 h-8 text-slate-500" />
                  <p className="text-sm font-semibold text-slate-300">Nenhum cartão cadastrado</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">Adicione seus cartões para simular qual o melhor dia de compra automaticamente!</p>
                  <button
                    onClick={handleOpenNew}
                    className="mt-2 text-xs text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    Adicionar Primeiro Cartão
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {creditCards.map((card) => {
                    return (
                      <div
                        key={card.id}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-purple-500/40 transition"
                      >
                        <div className="flex items-center gap-3">
                          <BankLogo name={card.name} segment={card.segment} customLogo={card.customLogo} className="w-10 h-10 rounded-xl shrink-0" />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{card.name}</h4>
                              {card.segment && (
                                <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded-full font-bold">
                                  {card.segment}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-purple-400">Melhor dia: <strong className="font-bold">Dia {card.bestDay}</strong></p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {deleteConfirmId === card.id ? (
                            <div className="flex items-center gap-1 bg-rose-500/10 p-1 rounded-xl border border-rose-500/30 animate-fadeIn">
                              <span className="text-[10px] text-rose-300 font-bold px-1">Excluir?</span>
                              <button
                                onClick={() => {
                                  onDeleteCard(card.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                              >
                                Sim
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg text-xs transition cursor-pointer"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOpenEdit(card)}
                                className="p-2 text-slate-400 hover:text-purple-400 bg-white/5 hover:bg-purple-500/10 rounded-lg border border-white/10 hover:border-purple-500/20 transition cursor-pointer"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(card.id)}
                                className="p-2 text-slate-400 hover:text-rose-500 bg-white/5 hover:bg-rose-500/10 rounded-lg border border-white/10 hover:border-rose-500/20 transition cursor-pointer"
                                title="Deletar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0c0c0e] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <button
            onClick={() => {
              const phone = "5511953292570";
              const message = encodeURIComponent("Olá! Tenho uma sugestão para o aplicativo GKD Melhor Dia: ");
              window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
            }}
            className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30 transition cursor-pointer font-semibold"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fale Conosco / Sugestões</span>
          </button>

          {!isEditing && (
            <button
              onClick={onClose}
              className="bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 font-bold py-1.5 px-4 rounded-xl border border-purple-500/20 transition cursor-pointer"
            >
              Concluir
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
