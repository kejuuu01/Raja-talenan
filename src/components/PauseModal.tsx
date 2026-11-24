import React, { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { formatNumberID, getKitchenZoneById } from '../game/data';
import { SaveData } from '../game/types';
import { PWAInstallButton } from './PWAInstallButton';

interface PauseModalProps {
  save: SaveData;
  onResume: () => void;
  onToggleMute: () => void;
  onImportSave: (imported: Partial<SaveData>) => boolean;
  onResetSave: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  save,
  onResume,
  onToggleMute,
  onImportSave,
  onResetSave,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [backupNotice, setBackupNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeZone = getKitchenZoneById(save.activeZoneId);

  const handleExportFile = () => {
    try {
      const payload = JSON.stringify(save, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `raja-talenan-save-lv${save.playerLevel}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupNotice({ ok: true, text: 'File cadangan tersimpan di perangkat!' });
    } catch {
      setBackupNotice({ ok: false, text: 'Gagal mengekspor data.' });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<SaveData>;
      const success = onImportSave(parsed);
      if (success) {
        setBackupNotice({ ok: true, text: 'Data offline berhasil dimuat!' });
      } else {
        setBackupNotice({ ok: false, text: 'Format file cadangan tidak sesuai.' });
      }
    } catch {
      setBackupNotice({ ok: false, text: 'File tidak bisa dibaca.' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#2B1D14]/65 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
    >
      <div className="pixel-panel w-full max-w-md max-h-[92dvh] overflow-y-auto pixel-scroll p-5 text-[#2B1D14]">
        <div className="bg-[#FFE6B8] border-2 border-[#3B2314] py-2 px-3 mb-4 text-center shadow-[0_2px_0_#3B2314]">
          <h2 id="pause-title" className="font-pixel text-xl text-[#3B2314]">
            Dapur Dijeda
          </h2>
        </div>

        <div className="bg-[#F5E7CE] border-2 border-[#3B2314] p-3.5 space-y-2 text-xs mb-4 shadow-[inset_0_2px_0_rgba(255,255,255,0.4)]">
          <div className="flex items-center justify-between">
            <span className="text-[#6E4D36]">Zona Dapur</span>
            <span className="flex items-center gap-1.5 font-bold text-[#15803D]">
              <span
                className="inline-grid grid-cols-2 grid-rows-2 w-3.5 h-3.5 border border-[#3B2314]"
                aria-hidden="true"
              >
                <span style={{ backgroundColor: activeZone.theme.tileA }} />
                <span style={{ backgroundColor: activeZone.theme.tileB }} />
                <span style={{ backgroundColor: activeZone.theme.boardWood }} />
                <span style={{ backgroundColor: activeZone.theme.clothColor }} />
              </span>
              {activeZone.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6E4D36]">Level Dapur</span>
            <span className="font-mono-num font-bold text-[#9A3412]">Level {save.playerLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6E4D36]">Total Skor</span>
            <span className="font-mono-num font-bold">{formatNumberID(save.totalScore)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6E4D36]">Total Irisan</span>
            <span className="font-mono-num font-bold">{formatNumberID(save.lifetimeSlices)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6E4D36]">Irisan Sempurna</span>
            <span className="font-mono-num font-bold text-[#B45309]">
              {formatNumberID(save.perfectSlices)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6E4D36]">Kombo Tertinggi</span>
            <span className="font-mono-num font-bold text-[#15803D]">{save.bestCombo}x</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6E4D36]">Bintang Koki</span>
            <span className="font-mono-num font-bold text-[#B45309]">{save.prestigeStars}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6E4D36]">Penyimpanan</span>
            <span className="font-bold text-[#15803D]">100% Offline Lokal</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="pixel-btn w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-pixel text-sm py-3 cursor-pointer"
          >
            Lanjutkan Memotong (Esc)
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="pixel-btn w-full bg-[#FFFBF2] hover:bg-[#FEF3C7] text-[#3B2314] font-pixel text-xs py-2.5 cursor-pointer"
          >
            Efek Suara: {save.muted ? 'Mati' : 'Aktif'}
          </button>

          <PWAInstallButton variant="panel" />

          {/* Offline Backup Export / Import */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleExportFile}
              className="pixel-btn bg-[#FFFBF2] hover:bg-[#FEF3C7] text-[#3B2314] font-pixel text-[11px] py-2 px-2 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Simpan Backup</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="pixel-btn bg-[#FFFBF2] hover:bg-[#FEF3C7] text-[#3B2314] font-pixel text-[11px] py-2 px-2 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span>Muat Backup</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {backupNotice && (
            <div
              className={`border-2 border-[#3B2314] px-2.5 py-1.5 text-[11px] font-bold text-center ${
                backupNotice.ok
                  ? 'bg-[#DCFCE7] text-[#166534]'
                  : 'bg-[#FEE2E2] text-[#991B1B]'
              }`}
            >
              {backupNotice.text}
            </div>
          )}

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="pixel-btn w-full bg-[#FEE2E2] hover:bg-[#FECACA] text-[#991B1B] font-pixel text-xs py-2.5 cursor-pointer"
            >
              Reset Semua Progres
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmReset(false);
                  onResetSave();
                }}
                className="pixel-btn flex-1 bg-[#EF4444] text-white font-pixel text-xs py-2.5 cursor-pointer"
              >
                Ya, Hapus Data
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="pixel-btn flex-1 bg-[#FFFBF2] text-[#3B2314] font-pixel text-xs py-2.5 cursor-pointer"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
