import React, { useState, useEffect } from 'react';
import { Shield, Bell, MapPin, Camera, Mic, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export const PermissionsWidget: React.FC = () => {
  const [notificationStatus, setNotificationStatus] = useState<string>('default');
  const [locationStatus, setLocationStatus] = useState<string>('default');
  const [cameraStatus, setCameraStatus] = useState<string>('default');
  const [micStatus, setMicStatus] = useState<string>('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check initial permissions
  const updatePermissions = async () => {
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
    
    if (navigator.permissions) {
      try {
        const geo = await navigator.permissions.query({ name: 'geolocation' });
        setLocationStatus(geo.state);
        geo.onchange = () => setLocationStatus(geo.state);
      } catch (e) {
        console.log("Geolocation API query not fully supported");
      }

      try {
        const cam = await navigator.permissions.query({ name: 'camera' as any });
        setCameraStatus(cam.state);
        cam.onchange = () => setCameraStatus(cam.state);
      } catch (e) {
        console.log("Camera API query not fully supported");
      }

      try {
        const mic = await navigator.permissions.query({ name: 'microphone' as any });
        setMicStatus(mic.state);
        mic.onchange = () => setMicStatus(mic.state);
      } catch (e) {
        console.log("Microphone API query not fully supported");
      }
    }
  };

  useEffect(() => {
    updatePermissions();
  }, []);

  const requestAllPermissions = async () => {
    setIsRequesting(true);
    setSuccessMessage(null);

    // 1. Request Notification Permission
    if ('Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setNotificationStatus(res);
      } catch (e) {
        console.error("Failed to request notification permission", e);
      }
    }

    // 2. Request Geolocation Permission
    try {
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => {
            setLocationStatus('granted');
            resolve();
          },
          () => {
            setLocationStatus('denied');
            resolve();
          },
          { timeout: 3000 }
        );
      });
    } catch (e) {
      console.error("Failed to request location", e);
    }

    // 3. Request Camera and Microphone Permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraStatus('granted');
      setMicStatus('granted');
      // Stop stream immediately to release hardware
      stream.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.error("Failed to request camera/mic or user denied", e);
      // Fallback state update
      updatePermissions();
    }

    setIsRequesting(false);
    setSuccessMessage("Solicitações de permissão concluídas! Verifique as configurações de sistema do seu celular.");
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  const hasPending = 
    notificationStatus !== 'granted' || 
    locationStatus !== 'granted' || 
    cameraStatus !== 'granted' || 
    micStatus !== 'granted';

  return (
    <div className="w-full bg-[#111114]/90 border border-white/5 rounded-3xl p-5 sm:p-6 backdrop-blur-md relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Permissões & Notificações</h3>
        </div>
        {hasPending ? (
          <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
            Ação Recomendada
          </span>
        ) : (
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
            Tudo Autorizado
          </span>
        )}
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-5">
        Para que os alertas do Melhor Dia de Compra e notificações em segundo plano funcionem perfeitamente no seu celular, habilite as permissões necessárias abaixo.
      </p>

      {/* Permissions Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Notification */}
        <div className="flex items-center justify-between p-3 bg-black/30 border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2 min-w-0">
            <Bell className={`w-4 h-4 shrink-0 ${notificationStatus === 'granted' ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className="text-xs text-slate-300 font-medium truncate">Notificações</span>
          </div>
          {notificationStatus === 'granted' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          )}
        </div>

        {/* Location */}
        <div className="flex items-center justify-between p-3 bg-black/30 border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className={`w-4 h-4 shrink-0 ${locationStatus === 'granted' ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className="text-xs text-slate-300 font-medium truncate">Localização</span>
          </div>
          {locationStatus === 'granted' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          )}
        </div>

        {/* Camera */}
        <div className="flex items-center justify-between p-3 bg-black/30 border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2 min-w-0">
            <Camera className={`w-4 h-4 shrink-0 ${cameraStatus === 'granted' ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className="text-xs text-slate-300 font-medium truncate">Câmera</span>
          </div>
          {cameraStatus === 'granted' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          )}
        </div>

        {/* Microphone */}
        <div className="flex items-center justify-between p-3 bg-black/30 border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2 min-w-0">
            <Mic className={`w-4 h-4 shrink-0 ${micStatus === 'granted' ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className="text-xs text-slate-300 font-medium truncate">Microfone</span>
          </div>
          {micStatus === 'granted' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          )}
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {hasPending ? (
        <button
          onClick={requestAllPermissions}
          disabled={isRequesting}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/15 transition cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-purple-200" />
          <span>{isRequesting ? 'Solicitando Permissões...' : 'Ativar Todas as Permissões e Alertas'}</span>
        </button>
      ) : (
        <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center text-xs text-emerald-400 font-semibold flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Todas as permissões do app estão ativas e funcionando!</span>
        </div>
      )}
    </div>
  );
};
