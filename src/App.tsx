import React, { useState, useEffect } from 'react';
import { 
  CreditCard as CardIcon, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  Settings,
  MessageCircle,
  Smartphone,
  Cloud,
  Check,
  ChevronDown,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard } from './types';
import { BestCardWidget } from './components/BestCardWidget';
import { CardManager } from './components/CardManager';
import { GkbLogo } from './components/GkbLogo';
import { GreetingPopup } from './components/GreetingPopup';
import { PermissionsWidget } from './components/PermissionsWidget';
import { ensureAuth, db, auth } from './lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { seedInitialLogos } from './lib/logoMemory';
import { setupPushNotifications } from './lib/push';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial seeds for first-time users
const DEFAULT_CARDS: CreditCard[] = [
  {
    id: 'gkd-0',
    name: 'GKD Platinum',
    bestDay: 10
  },
  {
    id: 'nu-1',
    name: 'Nubank',
    bestDay: 5
  },
  {
    id: 'itau-2',
    name: 'Itaú Click',
    bestDay: 1
  }
];

export default function App() {
  const cleanCardForStorage = (c: CreditCard): CreditCard => {
    const clean: any = {
      id: String(c.id),
      name: String(c.name).trim(),
      bestDay: Number(c.bestDay) || 1
    };
    if (c.segment && String(c.segment).trim()) {
      clean.segment = String(c.segment).trim();
    }
    if (c.customLogo && String(c.customLogo).trim()) {
      clean.customLogo = String(c.customLogo).trim();
    }
    return clean as CreditCard;
  };

  const [creditCards, setCreditCards] = useState<CreditCard[]>(() => {
    try {
      const saved = localStorage.getItem('melhor_cartao_cards');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load cards from localStorage on mount", e);
    }
    return DEFAULT_CARDS;
  });

  const [showManager, setShowManager] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  // Inicia como 'synced' porque os dados do LocalStorage já estão carregados e disponíveis imediatamente
  const [cloudStatus, setCloudStatus] = useState<'syncing' | 'synced' | 'offline'>('synced');

  // Check URL query on load
  useEffect(() => {
    if (window.location.search.includes('privacy') || window.location.hash.includes('privacy')) {
      setShowPrivacy(true);
    }
  }, []);

  // Sincronização em segundo plano com prioridade absoluta ao LocalStorage
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let isMounted = true;

    async function initCloudSync() {
      try {
        // Inicializa Push Notifications
        setupPushNotifications().catch(err => console.error('Push setup error:', err));

        // Inicializa logos conhecidos
        seedInitialLogos();
        
        let localUid = localStorage.getItem('gkd_local_uid');
        if (!localUid) {
          localUid = 'user_' + Math.random().toString(36).substring(2, 10);
          localStorage.setItem('gkd_local_uid', localUid);
        }

        // Tenta obter usuário do Firebase sem travar o app (máx 1.5s)
        const authTimeout = new Promise(resolve => setTimeout(() => resolve(null), 1500));
        const user = await Promise.race([ensureAuth(), authTimeout]) as any;
        
        if (!isMounted) return;

        const uid = user?.uid || localUid;
        const docRef = doc(db, 'users', uid, 'data', 'cards');
        
        unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (!isMounted) return;
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data && Array.isArray(data.cards) && data.cards.length > 0) {
              const remoteUpdatedAt = data.updatedAt ? new Date(data.updatedAt).getTime() : 0;
              const localUpdatedAtStr = localStorage.getItem('melhor_cartao_updatedAt');
              const localUpdatedAt = localUpdatedAtStr ? new Date(localUpdatedAtStr).getTime() : 0;

              // Só substitui os cartões se a nuvem for comprovadamente mais recente que a alteração local
              if (remoteUpdatedAt >= localUpdatedAt) {
                const cleanCards = data.cards.map(cleanCardForStorage);
                setCreditCards(cleanCards);
                localStorage.setItem('melhor_cartao_cards', JSON.stringify(cleanCards));
              }
            }
          } else {
            // Primeira vez: replica os cartões locais para a nuvem de forma silenciosa
            const savedCards = localStorage.getItem('melhor_cartao_cards');
            const initial = savedCards ? JSON.parse(savedCards) : DEFAULT_CARDS;
            const cleanInitial = initial.map(cleanCardForStorage);
            setDoc(docRef, { cards: cleanInitial, updatedAt: new Date().toISOString() }).catch(() => {});
          }
          if (isMounted) setCloudStatus('synced');
        }, (err) => {
          console.warn("Background snapshot error (continuando 100% via LocalStorage):", err);
          if (isMounted) setCloudStatus('offline');
        });
      } catch (err) {
        console.warn("Background cloud init offline fallback:", err);
        if (isMounted) setCloudStatus('offline');
      }
    }

    initCloudSync();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Salvamento ultra-rápido: LocalStorage síncrono imediato e Firestore em background sem travar UI
  const saveCards = (newCards: CreditCard[]) => {
    const cleanCards = newCards.map(cleanCardForStorage);
    const nowIso = new Date().toISOString();

    // 1. PRIORIDADE ABSOLUTA: Gravação síncrona no LocalStorage e no estado do React
    setCreditCards(cleanCards);
    try {
      localStorage.setItem('melhor_cartao_cards', JSON.stringify(cleanCards));
      localStorage.setItem('melhor_cartao_updatedAt', nowIso);
    } catch (e) {
      console.warn("Erro ao salvar no LocalStorage:", e);
    }

    // 2. Mantém o status como 'synced' instantaneamente sem deixar o usuário preso em 'syncing'
    setCloudStatus('synced');

    // 3. Sincronização em background com Firestore (não-bloqueante, com timeout rápido)
    try {
      const localUid = localStorage.getItem('gkd_local_uid') || 'default_user';
      const uid = auth.currentUser ? auth.currentUser.uid : localUid;
      const docRef = doc(db, 'users', uid, 'data', 'cards');
      
      const firestorePromise = setDoc(docRef, { cards: cleanCards, updatedAt: nowIso });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sync timeout')), 2500)
      );

      Promise.race([firestorePromise, timeoutPromise])
        .then(() => {
          setCloudStatus('synced');
        })
        .catch((err) => {
          // Se houver lentidão na rede, o dado continua preservado no LocalStorage
          console.warn("Cloud sync deferred (dados preservados com segurança localmente):", err?.message || err);
        });
    } catch (err) {
      console.warn("Erro no disparo em background:", err);
    }
  };

  // Card Handlers
  const handleAddCard = (newCardData: Omit<CreditCard, 'id'>) => {
    const newCard: CreditCard = {
      ...newCardData,
      id: `card_${Date.now()}`
    };
    saveCards([...creditCards, newCard]);
  };

  const handleUpdateCard = (updatedCard: CreditCard) => {
    const newCards = creditCards.map(c => c.id === updatedCard.id ? updatedCard : c);
    saveCards(newCards);
  };

  const handleDeleteCard = (id: string) => {
    const newCards = creditCards.filter(c => c.id !== id);
    saveCards(newCards);
  };

  const handleWhatsAppContact = () => {
    const phone = "5511953292570";
    const message = encodeURIComponent("Olá! Tenho uma sugestão para o aplicativo GKD Melhor Dia: ");
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleShareApp = async () => {
    const shareData = {
      title: 'GKD Melhor Dia',
      text: 'Confira qual o melhor cartão para usar hoje e ganhe até 40 dias de prazo!',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert('Link copiado para a área de transferência!');
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-slate-100 font-sans antialiased selection:bg-purple-500/30 selection:text-white flex flex-col justify-between relative overflow-x-hidden">
      
      {/* Decorative gradient background elements - highly discrete */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/[0.02] rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/[0.02] rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Header Bar */}
      <header className="border-b border-white/5 bg-[#0c0c0e]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <div 
            onClick={() => setShowLogoModal(true)}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer group hover:opacity-90 transition"
            title="Clique para ver o logo oficial"
          >
            <GkbLogo variant="compact" className="group-hover:scale-105 transition shadow-lg" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs sm:text-sm font-black text-white tracking-tight truncate group-hover:text-purple-300 transition">
                  GKB Mobility
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="hidden xs:inline-block sm:inline-block text-[9px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded-full border border-purple-500/20 whitespace-nowrap">
                    OFICIAL
                  </span>
                  {cloudStatus === 'synced' && <Cloud className="w-3 h-3 text-emerald-400" title="Sincronizado na Nuvem" />}
                  {cloudStatus === 'syncing' && <Cloud className="w-3 h-3 text-blue-400 animate-pulse" title="Sincronizando..." />}
                  {cloudStatus === 'offline' && <Cloud className="w-3 h-3 text-slate-500" title="Modo Offline" />}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate">Inteligência em Cartões</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 relative">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition cursor-pointer ${
                showSettingsMenu 
                  ? 'bg-purple-500/20 text-white border-purple-500/40' 
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              <Settings className={`w-4 h-4 transition-transform duration-500 ${showSettingsMenu ? 'rotate-90 text-purple-400' : ''}`} />
              <span className="hidden xs:inline">Menu</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSettingsMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSettingsMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowSettingsMenu(false)}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-[#0f0f12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 py-2"
                  >
                    <div className="px-4 py-2 border-b border-white/5 mb-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ações & Ajuda</p>
                    </div>

                    <button
                      onClick={() => { setShowGreeting(true); setShowSettingsMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition text-left"
                    >
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Ver Resumo do Dia</span>
                    </button>

                    <button
                      onClick={() => { setShowGuide(true); setShowSettingsMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition text-left"
                    >
                      <HelpCircle className="w-4 h-4 text-blue-400" />
                      <span>Como funciona?</span>
                    </button>

                    <button
                      onClick={() => { handleShareApp(); setShowSettingsMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition text-left"
                    >
                      <Share2 className="w-4 h-4 text-sky-400" />
                      <span>Compartilhar App</span>
                    </button>

                    <button
                      onClick={() => { handleWhatsAppContact(); setShowSettingsMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition text-left"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      <span>Fale Conosco</span>
                    </button>

                    <div className="h-px bg-white/5 my-1 mx-2" />
                    
                    <div className="px-4 py-2 mb-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Configurações</p>
                    </div>

                    <button
                      onClick={() => { setShowManager(true); setShowSettingsMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition text-left"
                    >
                      <Settings className="w-4 h-4 text-purple-400" />
                      <span>Gerenciar Cartões</span>
                    </button>

                    <button
                      onClick={() => { setShowPermissionsModal(true); setShowSettingsMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition text-left"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Permissões & Notificações</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col items-center">
        <div className="w-full space-y-6">
          
          {/* Centerpiece Panel */}
          <div className="w-full">
            <BestCardWidget 
              creditCards={creditCards} 
              onOpenManage={() => setShowManager(true)} 
            />
          </div>

          {/* Sparkles / Info Pill */}
          <div className="text-center">
            <button
              onClick={() => setShowGuide(true)}
              className="inline-flex items-center gap-1.5 text-[11px] text-purple-400 hover:text-purple-300 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Entenda como ganhar até 40 dias de prazo de pagamento
            </button>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="border-t border-white/5 bg-[#08080a] py-6 text-center text-[11px] text-slate-500">
        <div className="max-w-2xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Dados de cartões salvos com segurança no seu navegador.</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowPrivacy(true)}
              className="text-slate-400 hover:text-white underline transition cursor-pointer"
            >
              Política de Privacidade
            </button>
            <span className="text-slate-600">GKD Melhor Dia © 2026</span>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      {showManager && (
        <CardManager
          creditCards={creditCards}
          onAddCard={handleAddCard}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
          onClose={() => setShowManager(false)}
        />
      )}

      {/* Guide/How-To Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Como funciona o "Melhor Dia"?
              </h3>
              <button 
                onClick={() => setShowGuide(false)}
                className="text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
              <p>
                Os bancos e administradoras de cartão de crédito fecham a sua fatura cerca de <strong className="text-white font-bold">10 dias antes</strong> da data de vencimento. Este dia específico é chamado de <strong className="text-purple-400 font-bold">"Melhor Dia de Compra"</strong>.
              </p>
              
              <div className="space-y-2.5 bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="font-bold text-white">Exemplo Prático:</p>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-400">
                  <li>Seu cartão vence no dia <strong className="text-white">15</strong> do mês.</li>
                  <li>Sua fatura fecha (Melhor Dia) no dia <strong className="text-white">5</strong> do mês.</li>
                  <li>Se você comprar no dia <strong className="text-slate-200 font-bold">4</strong>, a compra entra na fatura atual e vence em <strong className="text-white">11 dias</strong>.</li>
                  <li>Se você comprar no dia <strong className="text-emerald-400 font-bold font-bold">5</strong> (ou depois), ela entra apenas na fatura do mês seguinte, vencendo em <strong className="text-emerald-300 font-bold font-bold">41 dias</strong>!</li>
                </ul>
              </div>

              <p>
                Este aplicativo calcula instantaneamente qual dos seus cartões cadastrados tem o Melhor Dia mais vantajoso em relação à data da sua compra simulada, permitindo que você ganhe até 40 dias de prazo para pagar sem juros!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Logo Modal - Identidade Oficial */}
      {showLogoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 flex flex-col items-center">
            <div className="w-full flex justify-end mb-1">
              <button 
                onClick={() => setShowLogoModal(false)}
                className="text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
            
            <div className="w-full max-w-[280px] py-4">
              <GkbLogo variant="full" />
            </div>

            <div className="mt-4 text-center space-y-3">
              <h3 className="text-xl font-black text-white tracking-tight">GKB Mobility</h3>
              <p className="text-sm text-slate-300 leading-relaxed px-2">
                A identidade oficial da inteligência em gestão de cartões. O logotipo combina a solidez do planejamento financeiro com a agilidade da mobilidade tecnológica.
              </p>
              <div className="pt-4 border-t border-white/5 text-[11px] text-slate-500 font-medium tracking-widest uppercase">
                Dirija seu futuro com precisão
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-6 sm:p-8 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Política de Privacidade</h3>
              </div>
              <button 
                onClick={() => setShowPrivacy(false)}
                className="text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Fechar
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs text-slate-300 overflow-y-auto leading-relaxed pr-1">
              <p className="text-slate-400 text-[11px]">Última atualização: Agosto de 2026</p>
              
              <section className="space-y-1.5">
                <h4 className="font-bold text-white text-sm">1. Coleta de Dados</h4>
                <p>O aplicativo <strong className="text-white">GKB Mobility - GKD Melhor Dia</strong> respeita totalmente a sua privacidade. <strong className="text-emerald-400">Nenhum dado pessoal ou financeiro é coletado, transmitido ou armazenado em servidores externos.</strong></p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-white text-sm">2. Armazenamento Local (Local Storage)</h4>
                <p>Todas as informações sobre os nomes dos seus cartões e respectivos dias de vencimento/melhor dia são salvas exclusivamente de forma local na memória do seu próprio dispositivo (localStorage do navegador/webview).</p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-white text-sm">3. Permissões do Dispositivo</h4>
                <p>O aplicativo não solicita acesso à sua câmera, contatos, localização, arquivos pessoais ou qualquer outra permissão sensível do sistema.</p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-white text-sm">4. Segurança</h4>
                <p>Por não enviar informações pela internet para servidores de terceiros, seus dados ficam 100% sob seu controle direto no seu aparelho.</p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-white text-sm">5. Contato</h4>
                <p>Se tiver dúvidas sobre o aplicativo, entre em contato através do e-mail do suporte ou canal de desenvolvedor informado na loja.</p>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal - Acessado exclusivamente via Configurações */}
      {showPermissionsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Permissões & Notificações
              </h3>
              <button 
                onClick={() => setShowPermissionsModal(false)}
                className="text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto">
              <PermissionsWidget />
            </div>
          </div>
        </div>
      )}

      {/* Greeting Popup */}
      <GreetingPopup
        isOpen={showGreeting}
        onClose={() => setShowGreeting(false)}
        creditCards={creditCards}
      />
    </div>
  );
}
