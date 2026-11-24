import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  BOWLS,
  CUTTING_BOARDS,
  formatNumberID,
  getBowlById,
  getComboMultiplier,
  getCutPower,
  getCuttingBoardById,
  getKitchenZoneById,
  getKnifeById,
  getSweetSpotHalfWidth,
  getUpgradeCost,
  INGREDIENTS,
  isZoneReadyToOpen,
  isZoneRequirementMet,
  KITCHEN_ZONES,
  KNIVES,
  PRESTIGE_SCORE_THRESHOLD,
} from '../game/data';
import { HudSnapshot, SaveData, UpgradeState } from '../game/types';
import {
  PixelBoardIcon,
  PixelBowlIcon,
  PixelIngredientIcon,
  PixelKnifeIcon,
} from './PixelIcon';

type PanelTab = 'upgrade' | 'alat' | 'zona' | 'koleksi';
type ArmoryTab = 'pisau' | 'talenan' | 'mangkuk';

interface UpgradePanelProps {
  save: SaveData;
  hud: HudSnapshot;
  onBuyUpgrade: (key: keyof UpgradeState) => void;
  onBuyOrEquipKnife: (knifeId: string) => void;
  onBuyOrEquipBoard: (boardId: string) => void;
  onBuyOrEquipBowl: (bowlId: string) => void;
  onSwitchZone: (zoneId: string) => void;
  onPrestige: () => void;
}

export const UpgradePanel: React.FC<UpgradePanelProps> = ({
  save,
  hud,
  onBuyUpgrade,
  onBuyOrEquipKnife,
  onBuyOrEquipBoard,
  onBuyOrEquipBowl,
  onSwitchZone,
  onPrestige,
}) => {
  const [tab, setTab] = useState<PanelTab>('upgrade');
  const [armoryTab, setArmoryTab] = useState<ArmoryTab>('pisau');
  const [confirmPrestige, setConfirmPrestige] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const knife = getKnifeById(save.equippedKnifeId);
  const board = getCuttingBoardById(save.equippedBoardId);
  const equippedBowl = getBowlById(save.equippedBowlId);
  const cutPower = getCutPower(save.upgrades, knife, save.prestigeStars);
  const sweetWidth = Math.round(
    getSweetSpotHalfWidth(save.upgrades, knife, save.playerLevel, board) * 2
  );
  const maxComboMult = getComboMultiplier(999, save.upgrades);

  const upgradeRows: {
    key: keyof UpgradeState;
    hotkey: string;
    title: string;
    detail: string;
    level: number;
    maxLevel?: number;
  }[] = [
    {
      key: 'sharpnessLevel',
      hotkey: '1',
      title: 'Asah Pisau',
      detail: `Daya ${cutPower.toFixed(1)} · Nilai +16%/lv`,
      level: save.upgrades.sharpnessLevel,
    },
    {
      key: 'speedLevel',
      hotkey: '2',
      title: 'Kecepatan Potong',
      detail: `Iris lebih cepat · Tahan & Asisten`,
      level: save.upgrades.speedLevel,
    },
    {
      key: 'precisionLevel',
      hotkey: '3',
      title: 'Fokus Presisi',
      detail: `Zona ${sweetWidth}px · Kombo maks ${maxComboMult.toFixed(1)}x`,
      level: save.upgrades.precisionLevel,
    },
    {
      key: 'menuLevel',
      hotkey: '4',
      title: 'Bumbu Rahasia',
      detail: `+${(save.upgrades.menuLevel - 1) * 10}% XP · +${(save.upgrades.menuLevel - 1) * 16}% Nilai`,
      level: save.upgrades.menuLevel,
    },
    {
      key: 'sousChefLevel',
      hotkey: '5',
      title: 'Asisten Koki',
      detail:
        save.upgrades.sousChefLevel === 0
          ? 'Potong otomatis pasif tiap detik'
          : `${hud.autoRate.toFixed(1)} potong/dtk otomatis`,
      level: save.upgrades.sousChefLevel,
    },
  ];

  const collectibleItems = INGREDIENTS.filter((i) => !i.isGoldenChili && !i.isHazard);
  const unlockedCount = collectibleItems.filter(
    (i) => i.tierRequired <= save.playerLevel
  ).length;
  const activeZone = getKitchenZoneById(save.activeZoneId);
  const activeZoneIdx = KITCHEN_ZONES.findIndex((z) => z.id === activeZone.id);
  const hasHigherUnlockedZone = KITCHEN_ZONES.some(
    (z, idx) =>
      (idx > activeZoneIdx && save.unlockedZones.includes(z.id)) ||
      (isZoneReadyToOpen(z, save) && hud.coins >= z.unlockCost)
  );

  return (
    <aside
      className={`w-full lg:w-[304px] shrink-0 bg-[#F5E7CE] border-t-4 lg:border-t-0 lg:border-l-4 border-[#3B2314] flex flex-col overflow-hidden transition-[height] duration-150 ${
        isCollapsed ? 'h-[42px] lg:h-full' : 'h-[156px] sm:h-[168px] lg:h-full'
      }`}
      aria-label="Panel Upgrade Dapur"
    >
      {/* Segmented Tab Bar */}
      <div className="p-1.5 bg-[#EBD4AF] border-b-3 border-[#3B2314] flex items-center gap-1 shrink-0">
        {(
          [
            { id: 'upgrade', label: 'Upgrade' },
            { id: 'alat', label: 'Alat' },
            { id: 'zona', label: 'Zona', alert: hasHigherUnlockedZone },
            { id: 'koleksi', label: 'Koleksi' },
          ] as { id: PanelTab; label: string; alert?: boolean }[]
        ).map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTab(item.id);
                if (isCollapsed) setIsCollapsed(false);
              }}
              className={`relative flex-1 py-1 px-1 text-[10px] sm:text-[11px] font-pixel border-2 border-[#3B2314] whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                active
                  ? 'bg-[#FF6B35] text-white shadow-[0_2px_0_#3B2314]'
                  : 'bg-[#FFFBF2] text-[#3B2314] hover:bg-[#FFF0D4]'
              }`}
            >
              {item.label}
              {item.alert && !active && (
                <span
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#22C55E] border border-[#3B2314]"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? 'Buka Panel Upgrade' : 'Perkecil Panel Upgrade'}
          title={isCollapsed ? 'Buka Panel Upgrade' : 'Perkecil Panel Upgrade'}
          className="lg:hidden py-1 px-1.5 bg-[#FFFBF2] hover:bg-[#FFF0D4] text-[#3B2314] border-2 border-[#3B2314] shrink-0 cursor-pointer flex items-center justify-center"
        >
          {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Scrollable Body */}
      <div
        className={`flex-1 overflow-y-auto pixel-scroll p-2 space-y-1.5 ${
          isCollapsed ? 'hidden lg:block' : ''
        }`}
      >
        {tab === 'upgrade' && (
          <>
            {upgradeRows.map((u) => {
              const isMax = u.maxLevel !== undefined && u.level >= u.maxLevel;
              const cost = getUpgradeCost(u.key, u.level);
              const canAfford = !isMax && hud.coins >= cost;

              return (
                <div
                  key={u.key}
                  className="bg-[#FFFBF2] border-2 border-[#3B2314] px-2 py-1.5 flex items-center justify-between gap-2 shadow-[0_2px_0_#3B2314]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#2B1D14]">
                      <span className="font-mono-num text-[11px] text-[#8F5729]">[{u.hotkey}]</span>
                      <span className="truncate">{u.title}</span>
                      <span className="text-[11px] font-mono-num text-[#B45309] shrink-0">
                        Lv.{u.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6E4D36] truncate">{u.detail}</p>
                  </div>

                  <button
                    type="button"
                    disabled={!canAfford || isMax}
                    onClick={() => onBuyUpgrade(u.key)}
                    className={`pixel-btn px-2.5 py-1.5 text-[11px] font-pixel whitespace-nowrap shrink-0 cursor-pointer ${
                      isMax
                        ? 'bg-[#D1D5DB] text-[#4B5563]'
                        : canAfford
                          ? 'bg-[#22C55E] hover:bg-[#16A34A] text-white'
                          : 'bg-[#E5D3B3] text-[#7A5C43]'
                    }`}
                  >
                    {isMax ? 'MAKS' : `${formatNumberID(cost)}`}
                  </button>
                </div>
              );
            })}

            {/* Prestige Bintang Koki Box */}
            <div className="bg-[#FFF4D6] border-2 border-[#3B2314] px-2.5 py-2 mt-1 shadow-[0_2px_0_#3B2314]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-pixel text-[#9A3412]">Bintang Koki (Prestige)</div>
                  <div className="text-xs text-[#6E4D36] mt-0.5 font-mono-num">
                    Saat ini: {save.prestigeStars} Bintang · +{save.prestigeStars * 25}% Skor
                  </div>
                </div>
                {!confirmPrestige ? (
                  <button
                    type="button"
                    disabled={!hud.prestigeReady}
                    onClick={() => setConfirmPrestige(true)}
                    className={`pixel-btn px-3 py-1.5 text-xs font-pixel whitespace-nowrap shrink-0 cursor-pointer ${
                      hud.prestigeReady
                        ? 'bg-[#FACC15] hover:bg-[#EAB308] text-[#3B2314]'
                        : 'bg-[#E5D3B3] text-[#7A5C43]'
                    }`}
                  >
                    {hud.prestigeReady
                      ? `+${hud.prestigeRewardStars} Bintang`
                      : `Perlu ${formatNumberID(PRESTIGE_SCORE_THRESHOLD)}`}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmPrestige(false);
                        onPrestige();
                      }}
                      className="pixel-btn bg-[#EF4444] text-white px-2.5 py-1.5 text-xs font-pixel whitespace-nowrap cursor-pointer"
                    >
                      Reset &amp; Klaim
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmPrestige(false)}
                      className="pixel-btn bg-[#FFFBF2] text-[#3B2314] px-2 py-1.5 text-xs font-pixel whitespace-nowrap cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {tab === 'alat' && (
          <div className="space-y-1.5">
            {/* 3-Way Armory Sub-Tabs: Pisau | Talenan | Mangkuk */}
            <div className="bg-[#EBD4AF] border-2 border-[#3B2314] p-1 flex items-center gap-1">
              {(
                [
                  { id: 'pisau', label: 'Pisau' },
                  { id: 'talenan', label: 'Talenan' },
                  { id: 'mangkuk', label: 'Mangkuk' },
                ] as { id: ArmoryTab; label: string }[]
              ).map((sub) => {
                const subActive = armoryTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setArmoryTab(sub.id)}
                    className={`flex-1 py-1 px-1 text-[10px] font-pixel border-2 border-[#3B2314] whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                      subActive
                        ? 'bg-[#3B2314] text-[#FACC15]'
                        : 'bg-[#FFFBF2] text-[#3B2314] hover:bg-[#FEF3C7]'
                    }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>

            {armoryTab === 'pisau' && (
              <>
                <div className="bg-[#FFFBF2] border-2 border-[#3B2314] px-2.5 py-1.5 flex items-center justify-between text-[11px]">
                  <span className="font-pixel text-[#9A3412]">Koleksi Pisau</span>
                  <span className="font-mono-num font-bold text-[#3B2314]">
                    {save.unlockedKnives.length}/{KNIVES.length} Terbuka
                  </span>
                </div>
                {KNIVES.map((k) => {
                  const unlocked = save.unlockedKnives.includes(k.id);
                  const equipped = save.equippedKnifeId === k.id;
                  const canAfford = hud.coins >= k.cost;

                  return (
                    <div
                      key={k.id}
                      className={`border-2 border-[#3B2314] px-2 py-1.5 flex items-center justify-between gap-2 shadow-[0_2px_0_#3B2314] ${
                        equipped ? 'bg-[#FEF3C7]' : 'bg-[#FFFBF2]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-10 h-8 bg-[#EBD4AF] border-2 border-[#3B2314] flex items-center justify-center shrink-0">
                          <PixelKnifeIcon knife={k} size={34} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#2B1D14] truncate">{k.name}</div>
                          <div className="text-[10px] font-mono-num text-[#B45309] leading-snug">
                            Daya {k.powerMultiplier}x · Kritis {Math.round(k.critChance * 100)}%
                            {k.perfectBonus > 0 ? ` · +${k.perfectBonus}px` : ''}
                            {k.speedBonus ? ` · +${Math.round(k.speedBonus * 100)}% Cepat` : ''}
                          </div>
                          <p className="text-[10px] text-[#6E4D36] leading-snug truncate">
                            {k.description}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={equipped || (!unlocked && !canAfford)}
                        onClick={() => onBuyOrEquipKnife(k.id)}
                        className={`pixel-btn px-2.5 py-1.5 text-[11px] font-pixel whitespace-nowrap shrink-0 cursor-pointer ${
                          equipped
                            ? 'bg-[#3B2314] text-[#FACC15]'
                            : unlocked
                              ? 'bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#0F172A]'
                              : canAfford
                                ? 'bg-[#22C55E] hover:bg-[#16A34A] text-white'
                                : 'bg-[#E5D3B3] text-[#7A5C43]'
                        }`}
                      >
                        {equipped ? 'Dipakai' : unlocked ? 'Pakai' : formatNumberID(k.cost)}
                      </button>
                    </div>
                  );
                })}
              </>
            )}

            {armoryTab === 'talenan' && (
              <>
                <div className="bg-[#FFFBF2] border-2 border-[#3B2314] px-2.5 py-1.5 flex items-center justify-between text-[11px]">
                  <span className="font-pixel text-[#9A3412]">
                    Talenan ({save.unlockedBoards.length}/{CUTTING_BOARDS.length})
                  </span>
                  <span className="font-mono-num font-bold text-[#15803D]">
                    {board.coinMultiplier}x Koin
                  </span>
                </div>
                {CUTTING_BOARDS.map((b) => {
                  const unlocked = save.unlockedBoards.includes(b.id);
                  const equipped = save.equippedBoardId === b.id;
                  const canAfford = hud.coins >= b.cost;

                  return (
                    <div
                      key={b.id}
                      className={`border-2 border-[#3B2314] px-2 py-1.5 flex items-center justify-between gap-2 shadow-[0_2px_0_#3B2314] ${
                        equipped ? 'bg-[#FEF3C7]' : 'bg-[#FFFBF2]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-10 h-8 bg-[#EBD4AF] border-2 border-[#3B2314] flex items-center justify-center shrink-0">
                          <PixelBoardIcon board={b} size={32} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#2B1D14] truncate">{b.name}</div>
                          <div className="text-[10px] font-mono-num text-[#15803D] font-bold leading-snug">
                            Koin {b.coinMultiplier}x · XP {b.xpMultiplier}x
                            {b.perfectBonus > 0 ? ` · +${b.perfectBonus}px` : ''}
                          </div>
                          <p className="text-[10px] text-[#6E4D36] leading-snug truncate">
                            {b.description}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={equipped || (!unlocked && !canAfford)}
                        onClick={() => onBuyOrEquipBoard(b.id)}
                        className={`pixel-btn px-2.5 py-1.5 text-[11px] font-pixel whitespace-nowrap shrink-0 cursor-pointer ${
                          equipped
                            ? 'bg-[#3B2314] text-[#FACC15]'
                            : unlocked
                              ? 'bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#0F172A]'
                              : canAfford
                                ? 'bg-[#22C55E] hover:bg-[#16A34A] text-white'
                                : 'bg-[#E5D3B3] text-[#7A5C43]'
                        }`}
                      >
                        {equipped ? 'Dipakai' : unlocked ? 'Pakai' : formatNumberID(b.cost)}
                      </button>
                    </div>
                  );
                })}
              </>
            )}

            {armoryTab === 'mangkuk' && (
              <>
                <div className="bg-[#FFFBF2] border-2 border-[#3B2314] px-2.5 py-1.5 flex items-center justify-between text-[11px]">
                  <span className="font-pixel text-[#9A3412]">
                    Mangkuk ({save.unlockedBowls.length}/{BOWLS.length})
                  </span>
                  <span className="font-mono-num font-bold text-[#0369A1]">
                    Isi {equippedBowl.capacity} · +{Math.round(equippedBowl.fullBonusRatio * 100)}%
                  </span>
                </div>
                {BOWLS.map((m) => {
                  const unlocked = save.unlockedBowls.includes(m.id);
                  const equipped = save.equippedBowlId === m.id;
                  const canAfford = hud.coins >= m.cost;

                  return (
                    <div
                      key={m.id}
                      className={`border-2 border-[#3B2314] px-2 py-1.5 flex items-center justify-between gap-2 shadow-[0_2px_0_#3B2314] ${
                        equipped ? 'bg-[#FEF3C7]' : 'bg-[#FFFBF2]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-10 h-8 bg-[#EBD4AF] border-2 border-[#3B2314] flex items-center justify-center shrink-0">
                          <PixelBowlIcon bowl={m} size={26} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#2B1D14] truncate">{m.name}</div>
                          <div className="text-[10px] font-mono-num text-[#0369A1] font-bold leading-snug">
                            Kapasitas {m.capacity} iris · Bonus +{Math.round(m.fullBonusRatio * 100)}%
                          </div>
                          <p className="text-[10px] text-[#6E4D36] leading-snug truncate">
                            {m.description}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={equipped || (!unlocked && !canAfford)}
                        onClick={() => onBuyOrEquipBowl(m.id)}
                        className={`pixel-btn px-2.5 py-1.5 text-[11px] font-pixel whitespace-nowrap shrink-0 cursor-pointer ${
                          equipped
                            ? 'bg-[#3B2314] text-[#FACC15]'
                            : unlocked
                              ? 'bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#0F172A]'
                              : canAfford
                                ? 'bg-[#22C55E] hover:bg-[#16A34A] text-white'
                                : 'bg-[#E5D3B3] text-[#7A5C43]'
                        }`}
                      >
                        {equipped ? 'Dipakai' : unlocked ? 'Pakai' : formatNumberID(m.cost)}
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {tab === 'zona' && (
          <div className="space-y-1.5">
            <div className="bg-[#FFFBF2] border-2 border-[#3B2314] px-2.5 py-1.5 text-[11px]">
              <div className="flex items-center justify-between font-pixel text-[#9A3412]">
                <span>Zona Dapur ({save.unlockedZones.length}/{KITCHEN_ZONES.length})</span>
                <span className="font-mono-num text-[#15803D]">{activeZone.coinMultiplier}x Koin</span>
              </div>
              <p className="text-[10px] text-[#6E4D36] mt-0.5">
                Capai target Level, Skor &amp; Sempurna lalu bayar biaya renovasi untuk pindah dapur lebih sulit.
              </p>
            </div>

            {KITCHEN_ZONES.map((z) => {
              const isUnlocked = save.unlockedZones.includes(z.id);
              const isActive = save.activeZoneId === z.id;
              const reqMet = isZoneRequirementMet(z, save);
              const canOpen = !isUnlocked && reqMet && hud.coins >= z.unlockCost;
              const lvPct = Math.min(1, save.playerLevel / Math.max(1, z.reqLevel));
              const scorePct =
                z.reqScore <= 0 ? 1 : Math.min(1, hud.totalScore / z.reqScore);
              const perfPct =
                z.reqPerfectSlices <= 0
                  ? 1
                  : Math.min(1, hud.perfectSlices / z.reqPerfectSlices);

              return (
                <div
                  key={z.id}
                  className={`border-2 border-[#3B2314] px-2 py-1.5 flex items-center justify-between gap-2 shadow-[0_2px_0_#3B2314] ${
                    isActive
                      ? 'bg-[#FEF3C7]'
                      : isUnlocked || canOpen
                        ? 'bg-[#FFFBF2]'
                        : 'bg-[#E5D3B3]/75'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Crisp 2x2 Theme Swatch */}
                    <div
                      className="w-9 h-9 border-2 border-[#3B2314] grid grid-cols-2 grid-rows-2 shrink-0"
                      aria-hidden="true"
                    >
                      <div style={{ backgroundColor: z.theme.tileA }} />
                      <div style={{ backgroundColor: z.theme.tileB }} />
                      <div style={{ backgroundColor: z.theme.boardWood }} />
                      <div style={{ backgroundColor: z.theme.clothColor }} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#2B1D14] truncate">{z.name}</div>
                      <div className="text-[10px] font-mono-num text-[#15803D] font-bold">
                        Koin {z.coinMultiplier}x · XP {z.xpMultiplier}x ·{' '}
                        <span className="text-[#9A3412]">Keras {z.hardnessMultiplier}x</span>
                      </div>

                      {!isUnlocked ? (
                        <div className="mt-1 space-y-0.5">
                          <div className="text-[10px] font-mono-num text-[#6E4D36] leading-tight">
                            Lv.{save.playerLevel}/{z.reqLevel} · Skor {formatNumberID(hud.totalScore)}/{formatNumberID(z.reqScore)} · Sempurna {formatNumberID(hud.perfectSlices)}/{formatNumberID(z.reqPerfectSlices)}
                          </div>
                          <div className="w-full h-1.5 bg-[#D6C3A1] border border-[#3B2314] overflow-hidden">
                            <div
                              className="h-full bg-[#38BDF8] origin-left"
                              style={{ transform: `scaleX(${(lvPct + scorePct + perfPct) / 3})` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-[#6E4D36] truncate">{z.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isActive || (!isUnlocked && !canOpen)}
                    onClick={() => onSwitchZone(z.id)}
                    className={`pixel-btn px-2 py-1.5 text-[10px] font-pixel whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#3B2314] text-[#FACC15]'
                        : isUnlocked
                          ? 'bg-[#22C55E] hover:bg-[#16A34A] text-white'
                          : canOpen
                            ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#2B1D14]'
                            : reqMet
                              ? 'bg-[#FDE68A] text-[#78350F]'
                              : 'bg-[#D6C3A1] text-[#7A5C43]'
                    }`}
                  >
                    {isActive
                      ? 'Aktif'
                      : isUnlocked
                        ? 'Pindah'
                        : reqMet
                          ? `Buka ${formatNumberID(z.unlockCost)}`
                          : 'Terkunci'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'koleksi' && (
          <div className="space-y-3">
            <div className="bg-[#FFFBF2] border-2 border-[#3B2314] p-2.5 text-xs">
              <div className="flex items-center justify-between font-pixel text-[#9A3412]">
                <span>Koleksi ({unlockedCount}/{collectibleItems.length}) · Lv.{save.playerLevel}</span>
                <span className="font-mono-num">Kesulitan {hud.difficultyMult.toFixed(1)}x</span>
              </div>
              <p className="text-[11px] text-[#6E4D36] mt-1">
                Tiap naik level membuka bahan baru yang lebih bernilai dan lebih tebal dipotong.
              </p>
            </div>
            {(['sayur', 'buah', 'daging'] as const).map((cat) => {
              const itemsInCat = collectibleItems.filter((i) => i.category === cat);
              const catUnlocked = itemsInCat.filter((i) => i.tierRequired <= save.playerLevel).length;
              const catLabel =
                cat === 'sayur'
                  ? `Sayuran Segar (${catUnlocked}/${itemsInCat.length})`
                  : cat === 'buah'
                    ? `Buah-buahan Tropis (${catUnlocked}/${itemsInCat.length})`
                    : `Daging & Hidangan (${catUnlocked}/${itemsInCat.length})`;
              const catColor =
                cat === 'sayur'
                  ? 'text-[#15803D]'
                  : cat === 'buah'
                    ? 'text-[#B45309]'
                    : 'text-[#991B1B]';
              return (
                <div key={cat}>
                  <div className={`text-xs font-pixel mb-1.5 ${catColor}`}>{catLabel}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {itemsInCat.map((ing) => {
                      const unlocked = ing.tierRequired <= save.playerLevel;
                      const count = save.slicedByIngredient[ing.id] ?? 0;
                      return (
                        <div
                          key={ing.id}
                          className={`border-2 border-[#3B2314] p-2 flex items-center gap-2 shadow-[0_2px_0_#3B2314] ${
                            unlocked ? 'bg-[#FFFBF2]' : 'bg-[#E5D3B3]/70 opacity-75'
                          }`}
                        >
                          <PixelIngredientIcon id={ing.id} size={32} locked={!unlocked} />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#2B1D14] truncate">
                              {unlocked ? ing.name : `Buka Lv.${ing.tierRequired}`}
                            </div>
                            <div className="text-[11px] font-mono-num text-[#6E4D36]">
                              {unlocked ? `${formatNumberID(count)} iris` : 'Terkunci'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
