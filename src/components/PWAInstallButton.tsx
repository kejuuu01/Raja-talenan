import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  MoreVertical,
  PlusSquare,
  Share,
  Smartphone,
  X,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'title' | 'panel';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'title',
}) => {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    if (variant === 'panel') {
      return (
        <div className="w-full bg-[#DCFCE7] border-2 border-[#3B2314] px-3 py-2 flex items-center justify-center gap-2 text-xs font-bold text-[#166534]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Sudah Terpasang sebagai Aplikasi</span>
        </div>
      );
    }
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await promptInstall();
      if (!accepted) {
        return;
      }
      return;
    }
    setShowGuideModal(true);
  };

  const buttonLabel = isInstallable
    ? 'Install Aplikasi di HP'
    : isIOS
      ? 'Install di iPhone / iPad'
      : 'Install Aplikasi di HP';

  const buttonClass =
    variant === 'title'
      ? 'pixel-btn bg-[#22C55E] hover:bg-[#16A34A] text-white font-pixel text-xs sm:text-sm px-5 py-2.5 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap'
      : 'pixel-btn w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-pixel text-xs py-2.5 flex items-center justify-center gap-2 cursor-pointer';

  return (
    <>
      <button type="button" onClick={handleClick} className={buttonClass}>
        {isInstallable ? (
          <Download className="w-4 h-4 shrink-0" />
        ) : (
          <Smartphone className="w-4 h-4 shrink-0" />
        )}
        <span>{buttonLabel}</span>
      </button>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B1D14]/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-guide-title"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="pixel-panel w-full max-w-md p-5 text-[#2B1D14] text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 bg-[#FFE6B8] border-2 border-[#3B2314] px-3 py-2 mb-4 shadow-[0_2px_0_#3B2314]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#9A3412]" />
                <h3
                  id="pwa-install-guide-title"
                  className="font-pixel text-sm sm:text-base text-[#3B2314]"
                >
                  Pasang Raja Talenan di HP
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="Tutup panduan"
                className="w-7 h-7 bg-[#FFFBF2] border-2 border-[#3B2314] flex items-center justify-center hover:bg-[#FECACA] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#4A3020] font-medium mb-3.5 leading-relaxed">
              Mainkan <strong>Raja Talenan</strong> layar penuh langsung dari layar utama HP dan tetap berjalan lancar meski offline!
            </p>

            <div className="space-y-3 mb-4">
              {/* Android Chrome Instructions */}
              <div
                className={`border-2 border-[#3B2314] p-3 ${
                  !isIOS ? 'bg-[#ECFDF5]' : 'bg-[#F5E7CE]'
                }`}
              >
                <div className="font-pixel text-xs text-[#15803D] mb-1.5">
                  Android (Google Chrome)
                </div>
                <ol className="text-xs text-[#3B2314] space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold">1.</span>
                    <span>
                      Buka tautan game ini langsung di browser{' '}
                      <strong>Chrome</strong> (bukan di dalam pratinjau).
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold">2.</span>
                    <span>
                      Ketuk ikon menu titik tiga{' '}
                      <MoreVertical className="inline w-3.5 h-3.5 align-text-bottom" />{' '}
                      di pojok kanan atas Chrome.
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold">3.</span>
                    <span>
                      Pilih <strong>&ldquo;Install aplikasi&rdquo;</strong> atau{' '}
                      <strong>&ldquo;Tambahkan ke layar utama&rdquo;</strong>.
                    </span>
                  </li>
                </ol>
              </div>

              {/* iPhone Safari Instructions */}
              <div
                className={`border-2 border-[#3B2314] p-3 ${
                  isIOS ? 'bg-[#EFF6FF]' : 'bg-[#F5E7CE]'
                }`}
              >
                <div className="font-pixel text-xs text-[#1D4ED8] mb-1.5">
                  iPhone &amp; iPad (Safari)
                </div>
                <ol className="text-xs text-[#3B2314] space-y-1.5">
                  <li className="flex items-center gap-1.5">
                    <span className="font-bold">1.</span>
                    <span>
                      Buka di browser <strong>Safari</strong>, lalu ketuk ikon{' '}
                      <strong>Bagikan</strong>{' '}
                      <Share className="inline w-3.5 h-3.5 text-[#1D4ED8] align-text-bottom" />{' '}
                      di bawah layar.
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="font-bold">2.</span>
                    <span>
                      Gulir dan pilih{' '}
                      <strong>&ldquo;Tambah ke Layar Utama&rdquo;</strong>{' '}
                      <PlusSquare className="inline w-3.5 h-3.5 text-[#3B2314] align-text-bottom" />
                      .
                    </span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="font-bold">3.</span>
                    <span>
                      Ketuk <strong>Tambah</strong> di pojok kanan atas.
                    </span>
                  </li>
                </ol>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="pixel-btn w-full bg-[#FF6B35] hover:bg-[#FF571A] text-white font-pixel text-xs py-2.5 cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
