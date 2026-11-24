import React, { useEffect } from 'react';
import { formatNumberID } from '../game/data';
import { PWAInstallButton } from './PWAInstallButton';

interface TitleScreenProps {
  onStart: () => void;
  bestScore: number;
  prestigeStars: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  bestScore,
  prestigeStars,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStart]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between py-8 px-4 pointer-events-none">
      {/* Upper calm space: Bespoke SVG Pixel Lockup + Primary CTA */}
      <div className="w-full max-w-2xl flex flex-col items-center text-center mt-4 sm:mt-8 pointer-events-auto">
        {/* Bespoke Pixel Cleaver, Crown & Butcher-Block Emblem */}
        <svg
          viewBox="0 0 340 108"
          className="w-[300px] sm:w-[400px] h-auto mb-3 drop-shadow-[0_5px_0_#3B2314]"
          aria-label="Raja Talenan"
          role="img"
        >
          {/* Golden Crown Accent */}
          <rect x="150" y="2" width="40" height="8" fill="#FACC15" stroke="#3B2314" strokeWidth="2.5" />
          <rect x="150" y="0" width="8" height="6" fill="#FACC15" stroke="#3B2314" strokeWidth="2" />
          <rect x="166" y="-1" width="8" height="7" fill="#FEF08A" stroke="#3B2314" strokeWidth="2" />
          <rect x="182" y="0" width="8" height="6" fill="#FACC15" stroke="#3B2314" strokeWidth="2" />
          {/* Pixel Cleaver Blade */}
          <rect x="132" y="13" width="60" height="20" fill="#DCE4EC" stroke="#3B2314" strokeWidth="3" />
          <rect x="135" y="27" width="54" height="4" fill="#FFFFFF" />
          <rect x="135" y="16" width="54" height="3" fill="#94A3B8" />
          <rect x="176" y="17" width="6" height="6" fill="#3B2314" />
          {/* Cleaver Handle */}
          <rect x="192" y="17" width="26" height="10" fill="#B45309" stroke="#3B2314" strokeWidth="3" />
          <rect x="198" y="20" width="4" height="4" fill="#FACC15" />
          <rect x="208" y="20" width="4" height="4" fill="#FACC15" />
          {/* Pixel Sparkle Crosses */}
          <rect x="112" y="16" width="6" height="2" fill="#FACC15" />
          <rect x="114" y="14" width="2" height="6" fill="#FACC15" />
          <rect x="232" y="18" width="6" height="2" fill="#FACC15" />
          <rect x="234" y="16" width="2" height="6" fill="#FACC15" />
          {/* Butcher-Block Wooden Banner Plate */}
          <rect x="14" y="38" width="312" height="58" rx="4" fill="#E6B17A" stroke="#3B2314" strokeWidth="4" />
          <rect x="20" y="44" width="300" height="46" fill="#FFFBF2" stroke="#C88A4B" strokeWidth="2.5" />
          {/* Corner Brass Rivets */}
          <rect x="26" y="50" width="5" height="5" fill="#D97706" />
          <rect x="309" y="50" width="5" height="5" fill="#D97706" />
          <rect x="26" y="79" width="5" height="5" fill="#D97706" />
          <rect x="309" y="79" width="5" height="5" fill="#D97706" />
          <text
            x="170"
            y="76"
            textAnchor="middle"
            fill="#3B2314"
            fontFamily="Silkscreen, monospace"
            fontWeight="700"
            fontSize="28"
            letterSpacing="2"
          >
            RAJA TALENAN
          </text>
        </svg>

        <p className="text-sm sm:text-base font-semibold text-[#3B2314] bg-[#FFFBF2] border-3 border-[#3B2314] px-4 py-1.5 mb-5 shadow-[inset_0_2px_0_#FFFFFF,0_3px_0_#3B2314]">
          Iris sayur, buah &amp; daging segar — kejar kombo sempurna!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onStart}
            className="pixel-btn bg-[#FF6B35] hover:bg-[#FF571A] text-white font-pixel text-base sm:text-lg px-9 py-3.5 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FACC15]"
          >
            {bestScore > 0 ? 'Lanjutkan Dapur' : 'Mulai Memotong'}
          </button>

          <PWAInstallButton variant="title" />
        </div>

        {(bestScore > 0 || prestigeStars > 0) && (
          <div className="mt-3.5 flex items-center gap-3 text-xs font-semibold text-[#4A3020] bg-[#FFFBF2]/95 border-2 border-[#3B2314] px-3.5 py-1.5 shadow-[0_2px_0_#3B2314]">
            <span className="font-mono-num">Skor Terbaik: {formatNumberID(bestScore)}</span>
            {prestigeStars > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num text-[#B45309]">Bintang Koki: {prestigeStars}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom single flat control hint line */}
      <div className="pointer-events-auto bg-[#FFFBF2] border-2 border-[#3B2314] px-4 py-1.5 text-[11px] sm:text-xs font-medium text-[#4A3020] shadow-[0_3px_0_#3B2314] text-center">
        Game Offline 100% · Klik / Spasi: Potong · Tahan: Iris Otomatis · 1-5: Upgrade · Esc: Jeda
      </div>
    </div>
  );
};
