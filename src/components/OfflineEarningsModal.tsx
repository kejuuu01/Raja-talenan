import React from 'react';
import { Clock, Coins, Utensils } from 'lucide-react';
import { formatNumberID } from '../game/data';
import { OfflineEarningsSummary } from '../game/types';

interface OfflineEarningsModalProps {
  summary: OfflineEarningsSummary;
  onClaim: () => void;
}

function formatDurationID(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  if (hrs > 0 && mins > 0) return `${hrs} jam ${mins} menit`;
  if (hrs > 0) return `${hrs} jam`;
  return `${Math.max(1, mins)} menit`;
}

export const OfflineEarningsModal: React.FC<OfflineEarningsModalProps> = ({
  summary,
  onClaim,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B1D14]/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offline-earnings-title"
    >
      <div className="pixel-panel w-full max-w-md p-5 text-[#2B1D14]">
        <div className="bg-[#FFE6B8] border-2 border-[#3B2314] py-2 px-3 mb-4 text-center shadow-[0_2px_0_#3B2314]">
          <h2 id="offline-earnings-title" className="font-pixel text-base sm:text-lg text-[#3B2314]">
            Hasil Dapur Offline
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-[#4A3020] font-medium text-center mb-4 leading-relaxed">
          Asisten Sous-Chef tetap memotong bahan secara otomatis selama kamu pergi!
        </p>

        <div className="bg-[#F5E7CE] border-2 border-[#3B2314] p-3.5 space-y-2.5 text-xs mb-5 shadow-[inset_0_2px_0_rgba(255,255,255,0.4)]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#6E4D36]">
              <Clock className="w-3.5 h-3.5" />
              Waktu Offline
            </span>
            <span className="font-mono-num font-bold text-[#3B2314]">
              {formatDurationID(summary.elapsedSeconds)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#6E4D36]">
              <Utensils className="w-3.5 h-3.5" />
              Bahan Terpotong
            </span>
            <span className="font-mono-num font-bold text-[#15803D]">
              +{formatNumberID(summary.estimatedSlices)} irisan
            </span>
          </div>
          <div className="h-[2px] bg-[#E5D3B3]" aria-hidden="true" />
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-bold text-[#9A3412]">
              <Coins className="w-4 h-4 text-[#D97706]" />
              Koin Didapat
            </span>
            <span className="font-pixel text-base text-[#D97706] font-mono-num">
              +{formatNumberID(summary.earnedCoins)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClaim}
          className="pixel-btn w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-pixel text-sm py-3 cursor-pointer"
        >
          Klaim Hasil Offline
        </button>
      </div>
    </div>
  );
};
