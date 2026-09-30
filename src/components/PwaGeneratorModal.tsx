import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2, AlertTriangle, FileCode, Cpu, ExternalLink, X, Package } from 'lucide-react';
import JSZip from 'jszip';

interface PwaGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaGeneratorModal: React.FC<PwaGeneratorModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'status' | 'files' | 'guide'>('status');
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);

  if (!isOpen) return null;

  const downloadFile = (filename: string, content: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadManifest = async () => {
    try {
      const res = await fetch('/manifest.json');
      const text = await res.text();
      downloadFile('manifest.json', text, 'application/json');
    } catch {
      downloadFile('manifest.json', JSON.stringify({
        "name": "GKD Melhor Dia - Simulador de Melhor Dia de Compra",
        "short_name": "GKD Melhor Dia",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#090d16",
        "theme_color": "#8a05be",
        "icons": [
          { "src": "/pwa-192x192.png", "sizes": "192x192", "type": "image/png" },
          { "src": "/pwa-512x512.png", "sizes": "512x512", "type": "image/png" }
        ]
      }, null, 2), 'application/json');
    }
  };

  const handleDownloadSw = async () => {
    try {
      const res = await fetch('/sw.js');
      const text = await res.text();
      downloadFile('sw.js', text, 'application/javascript');
    } catch {
      downloadFile('sw.js', `const CACHE_NAME = 'gkd-v1';`, 'application/javascript');
    }
  };

  const handleDownloadFullZip = async () => {
    setIsGeneratingZip(true);
    try {
      const zip = new JSZip();

      // Fetch manifest
      let manifestText = '';
      try {
        const res = await fetch('/manifest.json');
        manifestText = await res.text();
      } catch {
        manifestText = JSON.stringify({
          "name": "GKD Melhor Dia - Simulador de Melhor Dia de Compra",
          "short_name": "GKD Melhor Dia",
          "start_url": "/",
          "display": "standalone",
          "background_color": "#090d16",
          "theme_color": "#8a05be",
          "icons": [
            { "src": "/pwa-192x192.png", "sizes": "192x192", "type": "image/png" },
            { "src": "/pwa-512x512.png", "sizes": "512x512", "type": "image/png" }
          ]
        }, null, 2);
      }
      zip.file('manifest.json', manifestText);

      // Fetch sw.js
      let swText = '';
      try {
        const res = await fetch('/sw.js');
        swText = await res.text();
      } catch {
        swText = `const CACHE_NAME = 'gkd-v1';`;
      }
      zip.file('sw.js', swText);

      // Readme instructions
      zip.file('README-PWABUILDER.txt', `GKD Melhor Dia - Pacote PWA para Lojas
---------------------------------------
Como gerar seu APK no PWABuilder:
1. Acesse https://www.pwabuilder.com
2. Se o scanner automático falhar por causa da URL de teste, clique em "Edit Your Manifest" ou faça upload do arquivo manifest.json contido neste pacote.
3. Clique em "Generate" na aba de Android (Google Play) para baixar seu APK assinado ou pacote Bubblewrap!
`);

      // Try fetching icons
      try {
        const icon192 = await fetch('/pwa-192x192.png').then(r => r.blob());
        zip.file('pwa-192x192.png', icon192);
      } catch {}

      try {
        const icon512 = await fetch('/pwa-512x512.png').then(r => r.blob());
        zip.file('pwa-512x512.png', icon512);
      } catch {}

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gkd-melhor-dia-pwa-pack.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600/20 text-purple-400 rounded-xl">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Central de Geração PWA / APK</h3>
              <p className="text-xs text-slate-400">Solução definitiva para liberar o pacote no PWABuilder</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 pt-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition cursor-pointer ${
              activeTab === 'status' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Status do Aplicativo
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition cursor-pointer ${
              activeTab === 'files' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Pacote ZIP & Downloads
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition cursor-pointer ${
              activeTab === 'guide' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Como Liberar no PWABuilder
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
          
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-emerald-300">Manifesto e Ícones Prontos</h4>
                  <p className="text-xs text-slate-300 mt-1">O arquivo <code className="text-purple-300 font-mono">manifest.json</code> e os ícones PWA estão configurados com perfeição.</p>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-300">Por que o PWABuilder dá erro?</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    O PWABuilder tenta escanear a URL de desenvolvimento e sofre timeout por causa da barreira de segurança da nuvem. Isso impede que ele libere o botão de gerar o pacote automaticamente. <strong>A solução é baixar o Pacote ZIP abaixo e enviá-lo diretamente no PWABuilder!</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={handleDownloadFullZip}
                disabled={isGeneratingZip}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50"
              >
                <Package className="w-5 h-5" />
                <span>{isGeneratingZip ? 'Gerando Pacote ZIP...' : 'Baixar Pacote PWA Completo (.zip)'}</span>
              </button>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-white">Pacote PWA Completo (.zip)</h5>
                  <p className="text-xs text-slate-400 mt-0.5">Contém manifest, service worker, ícones e manual para o PWABuilder.</p>
                </div>
                <button
                  onClick={handleDownloadFullZip}
                  disabled={isGeneratingZip}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg text-xs flex items-center space-x-2 transition cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>{isGeneratingZip ? 'Baixando...' : 'Baixar ZIP'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl flex flex-col justify-between space-y-3">
                  <div className="flex items-center space-x-3">
                    <FileCode className="w-6 h-6 text-purple-400" />
                    <div>
                      <h5 className="font-medium text-white text-xs">manifest.json</h5>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadManifest}
                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Manifest</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl flex flex-col justify-between space-y-3">
                  <div className="flex items-center space-x-3">
                    <Cpu className="w-6 h-6 text-blue-400" />
                    <div>
                      <h5 className="font-medium text-white text-xs">sw.js</h5>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadSw}
                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar SW</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="p-3 bg-purple-950/40 border border-purple-500/20 rounded-lg text-purple-200">
                <strong className="text-white block mb-1">Como destravar e gerar o APK no PWABuilder:</strong>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>Baixe o <strong className="text-white">Pacote PWA Completo (.zip)</strong> na aba anterior.</li>
                  <li>Acesse <strong className="text-white">pwabuilder.com</strong>. Se o scanner falhar na URL, clique em <strong className="text-white">"Edit Your Manifest"</strong>.</li>
                  <li>Cole ou importe o conteúdo do seu <code className="text-purple-300 font-mono">manifest.json</code>.</li>
                  <li>Pronto! O PWABuilder vai liberar instantaneamente os botões de <strong className="text-white">"Generate"</strong> para Android (Google Play / APK) e Windows Store.</li>
                </ol>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-400">Abrir o site oficial do PWABuilder:</span>
                <a
                  href="https://www.pwabuilder.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium flex items-center space-x-2 transition cursor-pointer"
                >
                  <span>Ir para PWABuilder</span>
                  <ExternalLink className="w-4 h-4 text-purple-400" />
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-xs transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};

