import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-3 left-3 z-50 pointer-events-none bg-[#FEF3C7] border-2 border-[#3B2314] px-3 py-1.5 shadow-[0_3px_0_#3B2314] flex items-center gap-2 text-[11px] font-bold text-[#9A3412]"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Mode Offline Aktif · Semua Fitur Berjalan Lokal</span>
    </div>
  );
};
