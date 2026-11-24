import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Volume2, VolumeX } from 'lucide-react';
import { OfflineEarningsModal } from './components/OfflineEarningsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PauseModal } from './components/PauseModal';
import { PixelIngredientIcon } from './components/PixelIcon';
import { TitleScreen } from './components/TitleScreen';
import { UpgradePanel } from './components/UpgradePanel';
import { soundEngine } from './game/audio';
import {
  BOWLS,
  calculateOfflineEarnings,
  checkAndUnlockZones,
  CUTTING_BOARDS,
  DEFAULT_SAVE,
  DEFAULT_UPGRADES,
  formatNumberID,
  getBowlById,
  getCuttingBoardById,
  getKitchenZoneById,
  getKnifeById,
  getLevelDifficultyMultiplier,
  getNextUnlockForLevel,
  getUpgradeCost,
  getXpForNextLevel,
  isZoneRequirementMet,
  KITCHEN_ZONES,
  KNIVES,
  PRESTIGE_SCORE_THRESHOLD,
} from './game/data';
import { GameCanvas } from './game/GameCanvas';
import { GameScreen, HudSnapshot, OfflineEarningsSummary, SaveData, UpgradeState } from './game/types';

const STORAGE_KEY = 'raja_talenan_save_v1';

function sanitizeSave(parsed: Partial<SaveData>): SaveData {
  const loaded: SaveData = {
    ...DEFAULT_SAVE,
    ...parsed,
    coins: typeof parsed.coins === 'number' && parsed.coins >= 0 ? parsed.coins : DEFAULT_SAVE.coins,
    totalScore:
      typeof parsed.totalScore === 'number' && parsed.totalScore >= 0
        ? parsed.totalScore
        : DEFAULT_SAVE.totalScore,
    playerLevel:
      typeof parsed.playerLevel === 'number' && parsed.playerLevel >= 1
        ? parsed.playerLevel
        : DEFAULT_SAVE.playerLevel,
    levelXp:
      typeof parsed.levelXp === 'number' && parsed.levelXp >= 0
        ? parsed.levelXp
        : DEFAULT_SAVE.levelXp,
    activeZoneId:
      typeof parsed.activeZoneId === 'string' && parsed.activeZoneId
        ? parsed.activeZoneId
        : DEFAULT_SAVE.activeZoneId,
    unlockedZones:
      Array.isArray(parsed.unlockedZones) && parsed.unlockedZones.length > 0
        ? parsed.unlockedZones
        : [...DEFAULT_SAVE.unlockedZones],
    upgrades: {
      ...DEFAULT_UPGRADES,
      ...(parsed.upgrades ?? {}),
    },
    unlockedKnives:
      Array.isArray(parsed.unlockedKnives) && parsed.unlockedKnives.length > 0
        ? parsed.unlockedKnives
        : [...DEFAULT_SAVE.unlockedKnives],
    equippedBoardId:
      typeof parsed.equippedBoardId === 'string' && parsed.equippedBoardId
        ? parsed.equippedBoardId
        : DEFAULT_SAVE.equippedBoardId,
    unlockedBoards:
      Array.isArray(parsed.unlockedBoards) && parsed.unlockedBoards.length > 0
        ? parsed.unlockedBoards
        : [...DEFAULT_SAVE.unlockedBoards],
    equippedBowlId:
      typeof parsed.equippedBowlId === 'string' && parsed.equippedBowlId
        ? parsed.equippedBowlId
        : DEFAULT_SAVE.equippedBowlId,
    unlockedBowls:
      Array.isArray(parsed.unlockedBowls) && parsed.unlockedBowls.length > 0
        ? parsed.unlockedBowls
        : [...DEFAULT_SAVE.unlockedBowls],
    slicedByIngredient: parsed.slicedByIngredient ?? {},
    lastSavedAt:
      typeof parsed.lastSavedAt === 'number' && parsed.lastSavedAt > 0
        ? parsed.lastSavedAt
        : Date.now(),
  };
  checkAndUnlockZones(loaded);
  return loaded;
}

function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_SAVE);
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return sanitizeSave(parsed);
  } catch {
    return structuredClone(DEFAULT_SAVE);
  }
}

export default function App() {
  const saveRef = useRef<SaveData>(loadSave());
  const triggerActionRef = useRef<{ chopNow: () => void } | null>(null);

  const [screen, setScreen] = useState<GameScreen>('TITLE_MENU');
  const [offlineEarnings, setOfflineEarnings] = useState<OfflineEarningsSummary | null>(() =>
    calculateOfflineEarnings(saveRef.current)
  );
  const [, setUiTick] = useState(0);

  const [hud, setHud] = useState<HudSnapshot>(() => ({
    coins: saveRef.current.coins,
    totalScore: saveRef.current.totalScore,
    playerLevel: saveRef.current.playerLevel,
    levelXp: saveRef.current.levelXp,
    levelXpMax: getXpForNextLevel(saveRef.current.playerLevel),
    difficultyMult: getLevelDifficultyMultiplier(saveRef.current.playerLevel),
    perfectSlices: saveRef.current.perfectSlices,
    activeZoneId: saveRef.current.activeZoneId,
    unlockedZonesCount: saveRef.current.unlockedZones.length,
    nextUnlockIngredient: getNextUnlockForLevel(saveRef.current.playerLevel),
    combo: 0,
    comboMultiplier: 1,
    bestCombo: saveRef.current.bestCombo,
    feverProgress: 0,
    feverActive: false,
    feverTimeLeft: 0,
    lastJudgment: null,
    activeOrder: null,
    ordersCompleted: 0,
    dpsEstimate: 0,
    cutPower: 1,
    autoRate: 0,
    sweetSpotWidth: 44,
    prestigeReady: saveRef.current.totalScore >= PRESTIGE_SCORE_THRESHOLD,
    prestigeRewardStars: Math.max(1, Math.floor(saveRef.current.totalScore / PRESTIGE_SCORE_THRESHOLD)),
  }));

  useEffect(() => {
    soundEngine.setMuted(saveRef.current.muted);
  }, []);

  const persistSave = useCallback(() => {
    try {
      saveRef.current.lastSavedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveRef.current));
    } catch {
      // Ignore storage quota issues
    }
  }, []);

  useEffect(() => {
    const flushSave = () => {
      persistSave();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        persistSave();
      }
    };
    window.addEventListener('pagehide', flushSave);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flushSave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [persistSave]);

  const forceRefreshUi = useCallback(() => {
    const cur = saveRef.current;
    setHud((prev) => ({
      ...prev,
      coins: cur.coins,
      totalScore: cur.totalScore,
      playerLevel: cur.playerLevel,
      levelXp: cur.levelXp,
      levelXpMax: getXpForNextLevel(cur.playerLevel),
      difficultyMult: getLevelDifficultyMultiplier(cur.playerLevel),
      perfectSlices: cur.perfectSlices,
      activeZoneId: cur.activeZoneId,
      unlockedZonesCount: cur.unlockedZones.length,
      nextUnlockIngredient: getNextUnlockForLevel(cur.playerLevel),
      bestCombo: cur.bestCombo,
      prestigeReady: cur.totalScore >= PRESTIGE_SCORE_THRESHOLD,
      prestigeRewardStars: Math.max(
        1,
        Math.floor(cur.totalScore / PRESTIGE_SCORE_THRESHOLD)
      ),
    }));
    setUiTick((t) => t + 1);
  }, []);

  const handleBuyUpgrade = useCallback(
    (key: keyof UpgradeState) => {
      const save = saveRef.current;
      const level = save.upgrades[key];

      const cost = getUpgradeCost(key, level);
      if (save.coins < cost) return;

      save.coins -= cost;
      save.upgrades[key] = level + 1;
      soundEngine.playUpgrade();
      persistSave();
      forceRefreshUi();
    },
    [forceRefreshUi, persistSave]
  );

  const handleBuyOrEquipKnife = useCallback(
    (knifeId: string) => {
      const save = saveRef.current;
      const knife = KNIVES.find((k) => k.id === knifeId);
      if (!knife) return;

      if (save.unlockedKnives.includes(knifeId)) {
        save.equippedKnifeId = knifeId;
        soundEngine.playUpgrade();
        persistSave();
        forceRefreshUi();
        return;
      }

      if (save.coins >= knife.cost) {
        save.coins -= knife.cost;
        save.unlockedKnives.push(knifeId);
        save.equippedKnifeId = knifeId;
        soundEngine.playUpgrade();
        persistSave();
        forceRefreshUi();
      }
    },
    [forceRefreshUi, persistSave]
  );

  const handleBuyOrEquipBoard = useCallback(
    (boardId: string) => {
      const save = saveRef.current;
      const board = CUTTING_BOARDS.find((b) => b.id === boardId);
      if (!board) return;

      if (save.unlockedBoards.includes(boardId)) {
        save.equippedBoardId = boardId;
        soundEngine.playUpgrade();
        persistSave();
        forceRefreshUi();
        return;
      }

      if (save.coins >= board.cost) {
        save.coins -= board.cost;
        save.unlockedBoards.push(boardId);
        save.equippedBoardId = boardId;
        soundEngine.playUpgrade();
        persistSave();
        forceRefreshUi();
      }
    },
    [forceRefreshUi, persistSave]
  );

  const handleBuyOrEquipBowl = useCallback(
    (bowlId: string) => {
      const save = saveRef.current;
      const bowl = BOWLS.find((b) => b.id === bowlId);
      if (!bowl) return;

      if (save.unlockedBowls.includes(bowlId)) {
        save.equippedBowlId = bowlId;
        soundEngine.playUpgrade();
        persistSave();
        forceRefreshUi();
        return;
      }

      if (save.coins >= bowl.cost) {
        save.coins -= bowl.cost;
        save.unlockedBowls.push(bowlId);
        save.equippedBowlId = bowlId;
        soundEngine.playUpgrade();
        persistSave();
        forceRefreshUi();
      }
    },
    [forceRefreshUi, persistSave]
  );

  const handleSwitchZone = useCallback(
    (zoneId: string) => {
      const save = saveRef.current;
      const zone = KITCHEN_ZONES.find((z) => z.id === zoneId);
      if (!zone) return;

      if (save.unlockedZones.includes(zoneId)) {
        if (save.activeZoneId === zoneId) return;
        save.activeZoneId = zoneId;
        soundEngine.playOrderBell();
        persistSave();
        forceRefreshUi();
        return;
      }

      if (isZoneRequirementMet(zone, save) && save.coins >= zone.unlockCost) {
        save.coins -= zone.unlockCost;
        save.unlockedZones.push(zoneId);
        save.activeZoneId = zoneId;
        soundEngine.playLevelUp();
        persistSave();
        forceRefreshUi();
      }
    },
    [forceRefreshUi, persistSave]
  );

  const handlePrestige = useCallback(() => {
    const save = saveRef.current;
    if (save.totalScore < PRESTIGE_SCORE_THRESHOLD) return;
    const rewardStars = Math.max(1, Math.floor(save.totalScore / PRESTIGE_SCORE_THRESHOLD));
    const nextStars = save.prestigeStars + rewardStars;

    saveRef.current = {
      ...structuredClone(DEFAULT_SAVE),
      prestigeStars: nextStars,
      bestCombo: save.bestCombo,
      lifetimeSlices: save.lifetimeSlices,
      perfectSlices: save.perfectSlices,
      slicedByIngredient: { ...save.slicedByIngredient },
      muted: save.muted,
    };
    soundEngine.playFeverStart();
    persistSave();
    forceRefreshUi();
  }, [forceRefreshUi, persistSave]);

  const handleToggleMute = useCallback(() => {
    saveRef.current.muted = !saveRef.current.muted;
    soundEngine.setMuted(saveRef.current.muted);
    persistSave();
    forceRefreshUi();
  }, [forceRefreshUi, persistSave]);

  const handleResetSave = useCallback(() => {
    const muted = saveRef.current.muted;
    saveRef.current = {
      ...structuredClone(DEFAULT_SAVE),
      muted,
      lastSavedAt: Date.now(),
    };
    setOfflineEarnings(null);
    persistSave();
    forceRefreshUi();
    setScreen('PLAYING');
  }, [forceRefreshUi, persistSave]);

  const handleImportSave = useCallback(
    (imported: Partial<SaveData>): boolean => {
      if (
        !imported ||
        typeof imported !== 'object' ||
        typeof imported.coins !== 'number' ||
        typeof imported.upgrades !== 'object'
      ) {
        return false;
      }
      saveRef.current = sanitizeSave(imported);
      soundEngine.setMuted(saveRef.current.muted);
      setOfflineEarnings(null);
      persistSave();
      forceRefreshUi();
      return true;
    },
    [forceRefreshUi, persistSave]
  );

  const handleClaimOfflineEarnings = useCallback(() => {
    if (!offlineEarnings) return;
    const save = saveRef.current;
    save.coins += offlineEarnings.earnedCoins;
    save.totalScore += offlineEarnings.earnedScore;
    save.lifetimeSlices += offlineEarnings.estimatedSlices;
    checkAndUnlockZones(save);
    soundEngine.playLevelUp();
    setOfflineEarnings(null);
    persistSave();
    forceRefreshUi();
  }, [forceRefreshUi, offlineEarnings, persistSave]);

  // Global keyboard shortcuts (Escape, Mute, Hotkeys 1-5)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        setScreen((prev) =>
          prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev
        );
      } else if (e.code === 'KeyM' && screen !== 'TITLE_MENU') {
        handleToggleMute();
      } else if (screen === 'PLAYING') {
        if (e.code === 'Digit1') handleBuyUpgrade('sharpnessLevel');
        else if (e.code === 'Digit2') handleBuyUpgrade('speedLevel');
        else if (e.code === 'Digit3') handleBuyUpgrade('precisionLevel');
        else if (e.code === 'Digit4') handleBuyUpgrade('menuLevel');
        else if (e.code === 'Digit5') handleBuyUpgrade('sousChefLevel');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleBuyUpgrade, handleToggleMute, screen]);

  const save = saveRef.current;
  const equippedKnife = getKnifeById(save.equippedKnifeId);
  const equippedBoard = getCuttingBoardById(save.equippedBoardId);
  const equippedBowl = getBowlById(save.equippedBowlId);
  const activeZone = getKitchenZoneById(hud.activeZoneId);

  return (
    <div className="h-dvh w-screen overflow-hidden flex flex-col lg:flex-row bg-[#FFF7E8]">
      {/* Primary Playfield Container */}
      <main className="relative flex-1 h-full overflow-hidden">
        <GameCanvas
          screen={screen}
          saveRef={saveRef}
          onHudUpdate={setHud}
          onPersistNeeded={persistSave}
          triggerExternalActionRef={triggerActionRef}
        />

        {screen === 'TITLE_MENU' && (
          <TitleScreen
            onStart={() => setScreen('PLAYING')}
            bestScore={save.totalScore}
            prestigeStars={save.prestigeStars}
          />
        )}

        {/* World-Matched, Low-Occlusion HUD */}
        {screen !== 'TITLE_MENU' && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-3">
            {/* Top Perimeter HUD Bar */}
            <div className="flex items-start justify-between gap-2 sm:gap-4">
              {/* Top-Left: Coins & Score */}
              <div className="bg-[#FFFBF2] border-3 border-[#3B2314] shadow-[inset_0_2px_0_#FFFFFF,0_3px_0_#3B2314] px-3 py-2 flex items-center gap-3.5">
                <div>
                  <div className="text-[10px] font-pixel text-[#8F5729]">Koin Dapur</div>
                  <div className="text-lg sm:text-xl font-pixel text-[#D97706] font-mono-num leading-tight">
                    {formatNumberID(hud.coins)}
                  </div>
                </div>
                <div className="h-7 w-[2px] bg-[#E5D3B3]" aria-hidden="true" />
                <div>
                  <div className="text-[10px] font-pixel text-[#8F5729]">Skor Total</div>
                  <div className="text-sm sm:text-base font-pixel text-[#2B1D14] font-mono-num leading-tight">
                    {formatNumberID(hud.totalScore)}
                  </div>
                </div>
                <div className="md:hidden h-7 w-[2px] bg-[#E5D3B3]" aria-hidden="true" />
                <div className="md:hidden">
                  <div className="text-[10px] font-pixel text-[#9A3412]">
                    Lv.{hud.playerLevel}
                  </div>
                  <div className="text-[11px] font-mono-num font-bold text-[#6E4D36]">
                    {hud.difficultyMult.toFixed(1)}x
                  </div>
                </div>
                <div className="hidden sm:block h-7 w-[2px] bg-[#E5D3B3]" aria-hidden="true" />
                <div
                  className="hidden sm:flex items-center gap-2"
                  title={`Pisau: ${equippedKnife.name} · ${equippedBoard.name} · ${equippedBowl.name}`}
                >
                  <div
                    className="w-6 h-6 border-2 border-[#3B2314] grid grid-cols-2 grid-rows-2 shrink-0"
                    aria-hidden="true"
                  >
                    <div style={{ backgroundColor: activeZone.theme.tileA }} />
                    <div style={{ backgroundColor: activeZone.theme.tileB }} />
                    <div style={{ backgroundColor: equippedBoard.woodColor }} />
                    <div style={{ backgroundColor: equippedBowl.outerColor }} />
                  </div>
                  <div>
                    <div className="text-[10px] font-pixel text-[#8F5729] truncate max-w-[140px]">
                      {activeZone.name} · {activeZone.coinMultiplier}x
                    </div>
                    <div className="text-xs font-mono-num font-bold text-[#15803D]">
                      Daya {hud.cutPower.toFixed(1)}
                      {hud.autoRate > 0 ? ` · ${hud.autoRate.toFixed(1)}/dtk` : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Top-Center: Level Progress & Fever Meter */}
              <div className="hidden md:flex items-center gap-2.5">
                {/* Level & Next Unlock Progress */}
                <div className="bg-[#FFFBF2] border-3 border-[#3B2314] shadow-[inset_0_2px_0_#FFFFFF,0_3px_0_#3B2314] px-3 py-1.5 flex items-center gap-2.5 min-w-[215px]">
                  {hud.nextUnlockIngredient && (
                    <PixelIngredientIcon
                      id={hud.nextUnlockIngredient.id}
                      size={28}
                      locked={true}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[11px] font-pixel mb-1 gap-2">
                      <span className="text-[#9A3412]">Level {hud.playerLevel}</span>
                      <span className="font-mono-num text-[#6E4D36] truncate">
                        {hud.nextUnlockIngredient
                          ? `Buka: ${hud.nextUnlockIngredient.name}`
                          : `Kesulitan ${hud.difficultyMult.toFixed(1)}x`}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#E5D3B3] border-2 border-[#3B2314] overflow-hidden">
                      <div
                        className="h-full bg-[#38BDF8] transition-transform duration-150 origin-left"
                        style={{
                          transform: `scaleX(${Math.max(
                            0,
                            Math.min(1, hud.levelXp / Math.max(1, hud.levelXpMax))
                          )})`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Combo & Fever Meter */}
                <div
                  className={`flex flex-col items-center border-3 px-3 py-1.5 min-w-[185px] shadow-[inset_0_2px_0_#FFFFFF,0_3px_0_#3B2314] ${
                    hud.feverActive
                      ? 'bg-[#FFF0F6] border-[#FF006E]'
                      : 'bg-[#FFFBF2] border-[#3B2314]'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-[11px] font-pixel mb-1 gap-2">
                    <span className={hud.feverActive ? 'text-[#FF006E]' : 'text-[#3B2314]'}>
                      {hud.feverActive
                        ? `DEMAM ${hud.feverTimeLeft.toFixed(1)}d`
                        : 'Demam'}
                    </span>
                    <span className="font-mono-num text-[#B45309]">
                      {hud.combo > 0 ? `${hud.combo}x (${hud.comboMultiplier.toFixed(2)}x)` : 'Siap Iris'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#E5D3B3] border-2 border-[#3B2314] overflow-hidden">
                    <div
                      className={`h-full transition-transform duration-100 origin-left ${
                        hud.feverActive ? 'bg-[#FF006E]' : 'bg-[#FACC15]'
                      }`}
                      style={{ transform: `scaleX(${Math.max(0, Math.min(1, hud.feverProgress / 100))})` }}
                    />
                  </div>
                </div>
              </div>

              {/* Top-Right: Customer Order Ticket + Audio/Pause Controls */}
              <div className="flex items-start gap-2">
                {hud.activeOrder && (
                  <div className="bg-[#FFFBF2] border-3 border-[#3B2314] shadow-[inset_0_2px_0_#FFFFFF,0_3px_0_#3B2314] px-2.5 py-1.5 flex items-center gap-2.5">
                    <PixelIngredientIcon id={hud.activeOrder.ingredientId} size={30} />
                    <div>
                      <div className="text-[10px] font-pixel text-[#15803D]">
                        Pesanan · +{formatNumberID(hud.activeOrder.rewardCoins)}
                      </div>
                      <div className="text-xs font-bold text-[#2B1D14] font-mono-num">
                        {hud.activeOrder.ingredientName}: {hud.activeOrder.currentSlices}/
                        {hud.activeOrder.targetSlices}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5 pointer-events-auto">
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    aria-label={save.muted ? 'Aktifkan Suara' : 'Matikan Suara'}
                    title="Suara (M)"
                    className="pixel-btn bg-[#FFFBF2] hover:bg-[#FEF3C7] text-[#3B2314] w-10 h-10 flex items-center justify-center cursor-pointer"
                  >
                    {save.muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreen('PAUSED')}
                    aria-label="Jeda Game"
                    title="Jeda (Esc)"
                    className="pixel-btn bg-[#FFFBF2] hover:bg-[#FEF3C7] text-[#3B2314] w-10 h-10 flex items-center justify-center cursor-pointer"
                  >
                    <Pause className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Perimeter Strip: Mobile Combo + Touch Chop CTA + Hint */}
            <div className="flex items-end justify-between sm:justify-between gap-2">
              <div className="hidden sm:block bg-[#FFFBF2] border-2 border-[#3B2314] px-2.5 py-0.5 text-[10px] font-medium text-[#4A3020] shadow-[0_2px_0_#3B2314]">
                Klik / Spasi tepat di garis emas: <strong className="text-[#B45309]">Sempurna!</strong> · Hindari Panci Bom [!]
              </div>

              <button
                type="button"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  triggerActionRef.current?.chopNow();
                }}
                className="lg:hidden ml-auto pointer-events-auto pixel-btn bg-[#FF6B35] active:bg-[#E04E1B] text-white font-pixel text-xs px-4 py-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                POTONG!
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Upgrade & Armory Side Dock */}
      {screen !== 'TITLE_MENU' && (
        <UpgradePanel
          save={save}
          hud={hud}
          onBuyUpgrade={handleBuyUpgrade}
          onBuyOrEquipKnife={handleBuyOrEquipKnife}
          onBuyOrEquipBoard={handleBuyOrEquipBoard}
          onBuyOrEquipBowl={handleBuyOrEquipBowl}
          onSwitchZone={handleSwitchZone}
          onPrestige={handlePrestige}
        />
      )}

      {screen === 'PAUSED' && (
        <PauseModal
          save={save}
          onResume={() => setScreen('PLAYING')}
          onToggleMute={handleToggleMute}
          onImportSave={handleImportSave}
          onResetSave={handleResetSave}
        />
      )}

      {screen === 'PLAYING' && offlineEarnings && (
        <OfflineEarningsModal
          summary={offlineEarnings}
          onClaim={handleClaimOfflineEarnings}
        />
      )}

      <OfflineIndicator />
    </div>
  );
}
