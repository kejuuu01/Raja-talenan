import React, { useEffect, useRef } from 'react';
import { soundEngine } from './audio';
import {
  checkAndUnlockZones,
  getAutoChopRate,
  getBowlById,
  getComboMultiplier,
  getCutPower,
  getCuttingBoardById,
  getHoldChopRate,
  getKitchenZoneById,
  getKnifeById,
  getLevelDifficultyMultiplier,
  getManualCooldown,
  getMaxComboCap,
  getNextUnlockForLevel,
  getSweetSpotHalfWidth,
  getUnlockedIngredients,
  getXpForNextLevel,
  INGREDIENTS,
  isZoneReadyToOpen,
  KITCHEN_ZONES,
  PRESTIGE_SCORE_THRESHOLD,
} from './data';
import { getIngredientSprite, getKnifeSprite, getSliceSprite } from './pixelSprites';
import { BowlShape, GameScreen, HudSnapshot, IngredientDef, OrderQuest, SaveData } from './types';
import { drawZoneDecorations, drawZoneTileAccents } from './zoneDecorations';

interface ActiveItem {
  uid: number;
  def: IngredientDef;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  scaleX: number;
  scaleY: number;
  flashTimer: number;
  bobPhase: number;
  dodgedAwarded: boolean;
}

interface FlyingSlice {
  sprite: HTMLCanvasElement;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rot: number;
  vRot: number;
  life: number;
  maxLife: number;
  size: number;
  bitColor: string;
  bitValue: number;
}

interface DepartingBowl {
  x: number;
  y: number;
  vx: number;
  vy: number;
  shape: BowlShape;
  rimColor: string;
  innerColor: string;
  depthColor: string;
  accentColor: string;
  bits: { dx: number; dy: number; color: string }[];
  life: number;
  maxLife: number;
}

interface PixelParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  gravity: number;
  kind: 'chunk' | 'droplet' | 'spark';
  outlined?: boolean;
  bounced?: boolean;
}

interface BoardSplat {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  life: number;
  maxLife: number;
}

interface FloatingLabel {
  x: number;
  y: number;
  vy: number;
  text: string;
  subText?: string;
  color: string;
  scale: number;
  life: number;
  maxLife: number;
}

interface SlashTrail {
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
  isPerfect: boolean;
}

interface ImpactRing {
  x: number;
  y: number;
  size: number;
  maxSize: number;
  color: string;
  life: number;
  maxLife: number;
}

interface KnifeTrailNode {
  swingId: number;
  tipX: number;
  tipY: number;
  heelX: number;
  heelY: number;
  color: string;
  edgeColor: string;
  isBoosted: boolean;
  life: number;
  maxLife: number;
}

interface SteamPuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  wobblePhase: number;
}

interface AmbientLeaf {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  flutterPhase: number;
  color: string;
  stemColor: string;
  scale: number;
  life: number;
  maxLife: number;
}

interface WindStreak {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  maxLife: number;
}

interface GameCanvasProps {
  screen: GameScreen;
  saveRef: React.MutableRefObject<SaveData>;
  onHudUpdate: (snapshot: HudSnapshot) => void;
  onPersistNeeded: () => void;
  triggerExternalActionRef: React.MutableRefObject<{
    chopNow: () => void;
  } | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  screen,
  saveRef,
  onHudUpdate,
  onPersistNeeded,
  triggerExternalActionRef,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const screenRef = useRef<GameScreen>(screen);
  screenRef.current = screen;

  const onHudUpdateRef = useRef(onHudUpdate);
  onHudUpdateRef.current = onHudUpdate;

  const onPersistRef = useRef(onPersistNeeded);
  onPersistRef.current = onPersistNeeded;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Logical canvas dimensions synced via ResizeObserver
    let width = container.clientWidth || 960;
    let height = container.clientHeight || 640;

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    };

    updateCanvasSize();
    const ro = new ResizeObserver(updateCanvasSize);
    ro.observe(container);

    // Simulation state (never triggers React re-renders per frame)
    let nextUid = 1;
    const items: ActiveItem[] = [];
    const slices: FlyingSlice[] = [];
    const particles: PixelParticle[] = [];
    const boardSplats: BoardSplat[] = [];
    const labels: FloatingLabel[] = [];
    const slashes: SlashTrail[] = [];
    const impactRings: ImpactRing[] = [];
    const knifeTrails: KnifeTrailNode[] = [];
    const sousTrails: KnifeTrailNode[] = [];
    const steamPuffs: SteamPuff[] = [];
    const ambientLeaves: AmbientLeaf[] = [];
    const windStreaks: WindStreak[] = [];

    let combo = 0;
    let feverProgress = 0;
    let feverActive = false;
    let feverTimeLeft = 0;
    let ordersCompleted = 0;
    let activeOrder: OrderQuest | null = null;
    let judgmentId = 0;
    let lastJudgment: HudSnapshot['lastJudgment'] = null;

    let spawnTimer = 0.25;
    let itemCounter = 0;
    let hitstopTimer = 0;
    let shakeIntensity = 0;
    let conveyorOffset = 0;
    let knifeAnimProgress = 0; // 0 = idle up, 1 = just chopped down
    let sousKnifeAnim = 0;
    let activeSwingId = 1;
    let activeSousSwingId = 1;
    let activeSwingBoosted = false;
    let activeSwingColorOverride: string | null = null;
    let manualCooldown = 0;
    let holdChopTimer = 0;
    let autoChopTimer = 0;
    let hudSyncTimer = 0;
    let persistTimer = 0;
    let bowlFillAnim = 0;
    let bowlSwapAnim = 0;
    let activeBowlColorIdx = 0;
    let bowlValueSum = 0;
    let ambientTime = 0;
    let steamTimer = 0.4;
    let breezeTimer = 1.6;
    let activeBreezeTime = 0;
    const BOWL_RIM_COLORS = ['#38BDF8', '#34D399', '#FB923C', '#FACC15', '#C084FC', '#FB7185'];
    const bowlBits: { dx: number; dy: number; color: string }[] = [];
    const departingBowls: DepartingBowl[] = [];

    // Input separation: held vs edge-triggered
    let isPointerHeld = false;
    let isKeyHeld = false;
    let bufferedChop = false;

    const announcedReadyZones = new Set<string>(
      KITCHEN_ZONES.filter((z) => isZoneReadyToOpen(z, saveRef.current)).map((z) => z.id)
    );

    const createOrder = (): OrderQuest => {
      const unlocked = getUnlockedIngredients(saveRef.current.playerLevel);
      const zone = getKitchenZoneById(saveRef.current.activeZoneId);
      const pick = unlocked[Math.floor(Math.random() * unlocked.length)] ?? unlocked[0];
      const targetSlices = Math.min(18, 5 + Math.floor(saveRef.current.playerLevel * 0.6));
      const rewardCoins = Math.floor(
        pick.baseValue *
          targetSlices *
          1.35 *
          zone.coinMultiplier *
          (1 + saveRef.current.prestigeStars * 0.25)
      );
      return {
        id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        ingredientId: pick.id,
        ingredientName: pick.name,
        targetSlices,
        currentSlices: 0,
        rewardCoins: Math.max(45, rewardCoins),
      };
    };

    const checkZoneUnlocks = () => {
      const save = saveRef.current;
      const unlockedZonesNow = checkAndUnlockZones(save);
      if (unlockedZonesNow.length > 0) {
        const { cutLineX: cx, centerY: cy } = getBoardGeometry();
        for (const z of unlockedZonesNow) {
          soundEngine.playLevelUp();
          shakeIntensity = Math.max(shakeIntensity, 8);
          spawnParticles(cx, cy, '#38BDF8', 18, 250, 6, 'spark');
          addFloatingLabel(
            width * 0.5,
            cy - 108,
            `ZONA BARU TERBUKA!`,
            '#38BDF8',
            1.4,
            `${z.name} (${z.coinMultiplier}x Koin)`
          );
          lastJudgment = {
            text: `ZONA TERBUKA: ${z.name}!`,
            tier: 'fever',
            id: ++judgmentId,
          };
        }
        onPersistRef.current();
      }

      for (const z of KITCHEN_ZONES) {
        if (!announcedReadyZones.has(z.id) && isZoneReadyToOpen(z, save)) {
          announcedReadyZones.add(z.id);
          const { cutLineX: cx, centerY: cy } = getBoardGeometry();
          soundEngine.playOrderBell();
          spawnParticles(cx, cy, '#38BDF8', 14, 220, 5, 'spark');
          addFloatingLabel(
            width * 0.5,
            cy - 106,
            `SYARAT ZONA TERCAPAI!`,
            '#38BDF8',
            1.3,
            `Buka ${z.name} di tab Zona!`
          );
          lastJudgment = {
            text: `SIAP BUKA ZONA: ${z.name}!`,
            tier: 'fever',
            id: ++judgmentId,
          };
        }
      }
    };

    const grantLevelXp = (baseXp: number) => {
      const save = saveRef.current;
      const zone = getKitchenZoneById(save.activeZoneId);
      const boardDef = getCuttingBoardById(save.equippedBoardId);
      const xpMult =
        (1 + (save.upgrades.menuLevel - 1) * 0.1) * zone.xpMultiplier * boardDef.xpMultiplier;
      save.levelXp += Math.max(1, Math.round(baseXp * xpMult));

      let leveledUp = false;
      while (save.levelXp >= getXpForNextLevel(save.playerLevel)) {
        save.levelXp -= getXpForNextLevel(save.playerLevel);
        save.playerLevel += 1;
        leveledUp = true;

        const unlockedNow = INGREDIENTS.find(
          (i) => !i.isGoldenChili && !i.isHazard && i.tierRequired === save.playerLevel
        );
        const { cutLineX: cx, centerY: cy } = getBoardGeometry();
        soundEngine.playLevelUp();
        shakeIntensity = Math.max(shakeIntensity, 7);
        spawnParticles(cx, cy, '#FACC15', 20, 260, 7, 'spark');
        addFloatingLabel(
          width * 0.5,
          cy - 86,
          `NAIK LEVEL ${save.playerLevel}!`,
          '#FACC15',
          1.45,
          unlockedNow
            ? `Terbuka: ${unlockedNow.name}!`
            : `Kesulitan ${getLevelDifficultyMultiplier(save.playerLevel).toFixed(1)}x!`
        );
        lastJudgment = {
          text: unlockedNow ? `LEVEL ${save.playerLevel}: ${unlockedNow.name}!` : `LEVEL ${save.playerLevel}!`,
          tier: 'fever',
          id: ++judgmentId,
        };
      }
      if (leveledUp) {
        checkZoneUnlocks();
        onPersistRef.current();
      }
    };

    activeOrder = createOrder();

    const getBoardGeometry = () => {
      const centerY = Math.round(height * 0.56);
      const boardW = Math.min(520, Math.max(280, width * 0.58));
      const boardH = Math.min(210, Math.max(146, Math.round(height * 0.34)));
      const boardX = Math.round(width * 0.54 - boardW * 0.5);
      const boardY = Math.round(centerY - boardH * 0.5);
      const cutLineX = Math.round(boardX + boardW * 0.38);
      const bowlX = Math.max(54, boardX - 66);
      const bowlY = centerY;
      return { centerY, boardX, boardY, boardW, boardH, cutLineX, bowlX, bowlY };
    };

    const getPlayerKnifePose = (cutLineX: number, centerY: number, progress: number, time: number) => {
      const chopPress = progress > 0 ? Math.sin(progress * Math.PI) : 0;
      const elevation = (1 - chopPress) * 16;
      const scale = 1.08 - chopPress * 0.14;
      const x = cutLineX + 18 - chopPress * 14;
      const y = centerY + 62 - chopPress * 54;
      const angle = -1.12 - chopPress * 0.36 + Math.sin(time * 3.5) * 0.03;
      return { chopPress, elevation, scale, x, y, angle };
    };

    const getSousKnifePose = (cutLineX: number, boardY: number, progress: number, time: number) => {
      const chopPress = progress > 0 ? Math.sin(progress * Math.PI) : 0;
      const elevation = (1 - chopPress) * 14;
      const scale = 1.04 - chopPress * 0.12;
      const x = cutLineX + 84;
      const y = boardY + 36 + Math.sin(time * 4) * 4;
      const angle = 1.18 - chopPress * 0.24;
      return { chopPress, elevation, scale, x, y, angle };
    };

    const sampleBladePoints = (
      kx: number,
      ky: number,
      angle: number,
      scale: number,
      tipLocalX: number,
      heelLocalX: number,
      edgeLocalY: number
    ) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const tx = tipLocalX * scale;
      const hx = heelLocalX * scale;
      const ey = edgeLocalY * scale;
      return {
        tipX: kx + tx * cos - ey * sin,
        tipY: ky + tx * sin + ey * cos,
        heelX: kx + hx * cos - ey * sin,
        heelY: ky + hx * sin + ey * cos,
      };
    };

    const spawnParticles = (
      x: number,
      y: number,
      color: string,
      count: number,
      speed = 240,
      size = 6,
      kind: PixelParticle['kind'] = 'chunk'
    ) => {
      for (let i = 0; i < count; i++) {
        if (particles.length > 280) particles.shift();
        const angle = Math.random() * Math.PI * 2;
        const mag = speed * (0.4 + Math.random() * 0.8);
        particles.push({
          x,
          y,
          z: 6,
          vx: Math.cos(angle) * mag,
          vy: Math.sin(angle) * mag,
          vz: 120 + Math.random() * 140,
          size: size + (Math.random() > 0.5 ? 2 : 0),
          color,
          life: 0.45 + Math.random() * 0.25,
          maxLife: 0.7,
          gravity: kind === 'spark' ? 220 : 760,
          kind,
          outlined: kind === 'chunk' && size >= 6,
          bounced: false,
        });
      }
    };

    const spawnIngredientBurst = (
      def: IngredientDef,
      x: number,
      y: number,
      quality: 'perfect' | 'good' | 'normal' | 'crit',
      isFinish: boolean
    ) => {
      const palette = def.particleColors.length > 0 ? def.particleColors : [def.pixelColor, def.juiceColor];
      const isFruit = def.category === 'buah';
      const isMeat = def.category === 'daging';
      const isPerfectOrCrit = quality === 'perfect' || quality === 'crit';

      // 1. 360-degree top-down pixel chunks (skin, flesh, marbling, rind)
      const chunkCount = isFinish ? 14 : isPerfectOrCrit ? 10 : 6;
      for (let i = 0; i < chunkCount; i++) {
        if (particles.length > 280) particles.shift();
        const color = palette[i % palette.length];
        const angle = Math.random() * Math.PI * 2;
        const speed = (isFinish ? 210 : 165) * (0.45 + Math.random() * 0.85);
        const size = isMeat ? 6 + Math.floor(Math.random() * 3) : 5 + Math.floor(Math.random() * 3);
        const life = 0.55 + Math.random() * 0.3;
        particles.push({
          x: x + (Math.random() - 0.5) * 14,
          y: y + (Math.random() - 0.5) * 14,
          z: 6,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          vz: (isMeat ? 130 : 175) + Math.random() * 110,
          size,
          color,
          life,
          maxLife: life,
          gravity: isMeat ? 820 : 720,
          kind: 'chunk',
          outlined: true,
          bounced: false,
        });
      }

      // 2. 360-degree juicy pixel droplets splashing across the cutting board
      const dropletCount = (isFruit ? 12 : 7) + (isFinish ? 6 : 0) + (isPerfectOrCrit ? 5 : 0);
      for (let i = 0; i < dropletCount; i++) {
        if (particles.length > 280) particles.shift();
        const dropletColor =
          i % 3 === 0 ? def.juiceColor : palette[Math.floor(Math.random() * palette.length)];
        const angle = Math.random() * Math.PI * 2;
        const speed = (isFruit ? 240 : 185) * (0.4 + Math.random() * 0.9);
        const life = 0.4 + Math.random() * 0.25;
        particles.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          z: 5,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          vz: 140 + Math.random() * 130,
          size: 3 + (Math.random() > 0.6 ? 2 : 0),
          color: dropletColor,
          life,
          maxLife: life,
          gravity: 780,
          kind: 'droplet',
          outlined: false,
          bounced: false,
        });
      }

      // 3. Top-down colorful juice splat spots around the cut point on the board
      const { boardX, boardY, boardW, boardH } = getBoardGeometry();
      const splatCount = isFinish ? 4 : 2;
      for (let i = 0; i < splatCount; i++) {
        if (boardSplats.length > 42) boardSplats.shift();
        const sx = Math.max(boardX + 14, Math.min(boardX + boardW - 22, x + (Math.random() - 0.5) * 72));
        const sy = Math.max(boardY + 14, Math.min(boardY + boardH - 20, y + (Math.random() - 0.5) * 72));
        const splatColor = i === 0 ? def.juiceColor : palette[i % palette.length];
        boardSplats.push({
          x: Math.round(sx),
          y: Math.round(sy),
          w: 6 + Math.floor(Math.random() * 8),
          h: 5 + Math.floor(Math.random() * 6),
          color: splatColor,
          life: 2.5,
          maxLife: 2.5,
        });
      }

      // 4. Twinkling golden/ingredient sparks on Perfect / Crit / Golden Chili
      if (isPerfectOrCrit || def.isGoldenChili) {
        const sparkCount = def.isGoldenChili ? 12 : 8;
        for (let i = 0; i < sparkCount; i++) {
          if (particles.length > 280) particles.shift();
          const angle = Math.random() * Math.PI * 2;
          const speed = 130 + Math.random() * 165;
          const life = 0.35 + Math.random() * 0.22;
          particles.push({
            x,
            y,
            z: 14,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            vz: 110 + Math.random() * 90,
            size: 6,
            color: i % 2 === 0 ? '#FFD60A' : '#FFFFFF',
            life,
            maxLife: life,
            gravity: 340,
            kind: 'spark',
            outlined: false,
            bounced: false,
          });
        }
      }
    };

    const addFloatingLabel = (
      x: number,
      y: number,
      text: string,
      color: string,
      scale = 1,
      subText?: string
    ) => {
      if (labels.length > 24) labels.shift();
      labels.push({
        x,
        y,
        vy: -78,
        text,
        subText,
        color,
        scale,
        life: 0.85,
        maxLife: 0.85,
      });
    };

    const spawnIngredient = (isTitleDemo = false) => {
      const { centerY } = getBoardGeometry();
      const save = saveRef.current;
      const unlocked = getUnlockedIngredients(save.playerLevel);
      itemCounter++;

      let def: IngredientDef;
      const hazardPeriod = Math.max(5, 10 - Math.floor(save.playerLevel / 4));
      if (!isTitleDemo && itemCounter % 18 === 0) {
        def = INGREDIENTS.find((i) => i.id === 'cabai_emas')!;
      } else if (!isTitleDemo && save.playerLevel >= 2 && itemCounter % hazardPeriod === 3) {
        def = INGREDIENTS.find((i) => i.id === 'bom_gosong')!;
      } else {
        // Weight slightly toward newer unlocked ingredients so level unlocks appear prominently
        const weights = unlocked.map((_, idx) => 1 + idx * 0.35);
        const totalW = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * totalW;
        def = unlocked[unlocked.length - 1];
        for (let i = 0; i < unlocked.length; i++) {
          r -= weights[i];
          if (r <= 0) {
            def = unlocked[i];
            break;
          }
        }
      }

      const diffScale = getLevelDifficultyMultiplier(save.playerLevel);
      const activeZone = getKitchenZoneById(save.activeZoneId);
      const hp =
        def.isHazard || def.isGoldenChili
          ? def.baseHp
          : Math.max(2, Math.round(def.baseHp * diffScale * activeZone.hardnessMultiplier));

      items.push({
        uid: nextUid++,
        def,
        x: width + 52,
        y: centerY + (Math.random() - 0.5) * 22,
        hp,
        maxHp: hp,
        scaleX: 1,
        scaleY: 1,
        flashTimer: 0,
        bobPhase: Math.random() * Math.PI * 2,
        dodgedAwarded: false,
      });
    };

    const performChop = (source: 'manual' | 'hold' | 'sous') => {
      if (screenRef.current !== 'PLAYING') return;
      const save = saveRef.current;
      const knife = getKnifeById(save.equippedKnifeId);
      const boardDef = getCuttingBoardById(save.equippedBoardId);
      const { boardX, boardW, cutLineX, bowlX, bowlY } = getBoardGeometry();

      if (source === 'manual') {
        knifeAnimProgress = 1;
        activeSwingId += 1;
        activeSwingBoosted = false;
        activeSwingColorOverride = null;
        manualCooldown = getManualCooldown(save.upgrades, knife);
      } else if (source === 'hold') {
        knifeAnimProgress = 1;
        activeSwingId += 1;
        activeSwingBoosted = false;
        activeSwingColorOverride = null;
      } else {
        sousKnifeAnim = 1;
        activeSousSwingId += 1;
      }

      // Find closest active item in chopping reach
      const boardLeft = boardX - 24;
      const boardRight = boardX + boardW + 24;
      let target: ActiveItem | null = null;
      let bestDist = Infinity;

      for (const it of items) {
        if (it.x >= boardLeft && it.x <= boardRight) {
          // Auto/Hold sources safely ignore hazards
          if (source !== 'manual' && it.def.isHazard) continue;
          const d = Math.abs(it.x - cutLineX);
          if (d < bestDist) {
            bestDist = d;
            target = it;
          }
        }
      }

      if (!target) {
        // Empty whiff chop on board penalizes active combo
        if (source === 'manual') {
          if (combo > 0) {
            combo = Math.floor(combo * 0.5);
            addFloatingLabel(cutLineX, getBoardGeometry().boardY + 18, 'MELESET!', '#EF4444', 0.95);
            lastJudgment = { text: 'MELESET! KOMBO TURUN', tier: 'hazard', id: ++judgmentId };
          }
          slashes.push({
            x: cutLineX,
            y: getBoardGeometry().boardY - 12,
            color: knife.slashColor,
            life: 0.14,
            maxLife: 0.14,
            isPerfect: false,
          });
        }
        return;
      }

      // Check hazard collision on manual chop
      if (target.def.isHazard) {
        if (bestDist <= 74) {
          soundEngine.playHazardClang();
          combo = Math.floor(combo * 0.25);
          feverProgress = Math.max(0, feverProgress - 20);
          shakeIntensity = 13;
          hitstopTimer = 0.065;
          spawnParticles(target.x, target.y, '#FF4500', 18, 320, 7);
          spawnParticles(target.x, target.y, '#3E4152', 12, 260, 6);
          addFloatingLabel(target.x, target.y - 38, 'AWAS BOM!', '#FF3B30', 1.25, 'Kombo -75%');
          lastJudgment = { text: 'KENA BOM! KOMBO TURUN', tier: 'hazard', id: ++judgmentId };
          const idx = items.indexOf(target);
          if (idx >= 0) items.splice(idx, 1);
          return;
        }
        return;
      }

      const sweetHalf = getSweetSpotHalfWidth(save.upgrades, knife, save.playerLevel, boardDef);
      const goldHalf = sweetHalf * 0.38;

      let quality: 'perfect' | 'good' | 'normal' | 'crit' = 'normal';
      let qualityMult = 1;
      let offBeatPenalty = false;

      if (source === 'manual') {
        if (bestDist <= goldHalf) {
          quality = 'perfect';
          qualityMult = 2.2;
          combo = Math.min(getMaxComboCap(save.upgrades), combo + 1);
          save.perfectSlices += 1;
        } else if (bestDist <= sweetHalf) {
          quality = 'good';
          qualityMult = 1.4;
          combo = Math.min(getMaxComboCap(save.upgrades), combo + 1);
        } else {
          quality = 'normal';
          qualityMult = 0.9;
          if (bestDist > sweetHalf * 1.65 && combo > 0) {
            combo = Math.floor(combo * 0.5);
            offBeatPenalty = true;
          }
        }
      } else if (source === 'hold') {
        // Hold-to-chop is steady but weaker and does not build combo
        quality = 'normal';
        qualityMult = 0.75;
      } else {
        // Sous-chef maintains gentle passive rhythm
        quality = 'normal';
        qualityMult = 0.9;
      }

      // Critical strike roll
      const isCrit = Math.random() < knife.critChance;
      if (isCrit) {
        quality = 'crit';
        qualityMult *= 1.75;
      }

      const cutPower = getCutPower(save.upgrades, knife, save.prestigeStars);
      const holdFactor = source === 'hold' ? 0.72 : 1;
      const damage =
        cutPower * holdFactor * (quality === 'perfect' ? 1.3 : isCrit ? 1.45 : 1);
      target.hp -= damage;
      target.flashTimer = 0.08;
      target.scaleX = 1.28;
      target.scaleY = 0.72;

      // Combo & Fever multipliers
      if (combo > save.bestCombo) {
        save.bestCombo = combo;
      }
      const activeZone = getKitchenZoneById(save.activeZoneId);
      const comboMult = getComboMultiplier(combo, save.upgrades);
      const feverMult = feverActive ? 2.2 : 1;
      const sharpnessValueBoost = 1 + (save.upgrades.sharpnessLevel - 1) * 0.16;
      const recipeValueBoost = 1 + (save.upgrades.menuLevel - 1) * 0.16;
      const prestigeMult = 1 + save.prestigeStars * 0.25;

      const rawSliceEarn =
        target.def.baseValue *
        sharpnessValueBoost *
        recipeValueBoost *
        qualityMult *
        comboMult *
        feverMult *
        activeZone.coinMultiplier *
        boardDef.coinMultiplier *
        prestigeMult;
      const earned = Math.max(1, Math.round(rawSliceEarn));

      save.coins += earned;
      save.totalScore += earned;
      save.lifetimeSlices += 1;
      save.slicedByIngredient[target.def.id] = (save.slicedByIngredient[target.def.id] ?? 0) + 1;

      const sliceXp =
        (quality === 'crit' ? 6 : quality === 'perfect' ? 5 : quality === 'good' ? 3 : 1) +
        Math.floor(target.def.tierRequired * 0.2);
      grantLevelXp(sliceXp);
      checkZoneUnlocks();

      // Order progress
      if (activeOrder && activeOrder.ingredientId === target.def.id) {
        activeOrder.currentSlices += 1;
        if (activeOrder.currentSlices >= activeOrder.targetSlices) {
          save.coins += activeOrder.rewardCoins;
          save.totalScore += activeOrder.rewardCoins;
          ordersCompleted += 1;
          soundEngine.playOrderBell();
          grantLevelXp(15);
          addFloatingLabel(
            width * 0.5,
            height * 0.3,
            `PESANAN SELESAI! +${activeOrder.rewardCoins}`,
            '#10B981',
            1.35
          );
          activeOrder = createOrder();
        }
      }

      // Fever progress
      if (!feverActive) {
        const feverGain = quality === 'perfect' ? 14 : quality === 'crit' ? 12 : quality === 'good' ? 7 : 3;
        feverProgress = Math.min(100, feverProgress + feverGain);
        if (feverProgress >= 100 || target.def.isGoldenChili) {
          feverActive = true;
          feverTimeLeft = 10;
          feverProgress = 100;
          soundEngine.playFeverStart();
          shakeIntensity = 9;
          addFloatingLabel(cutLineX, target.y - 72, 'DEMAM PISAU 2.5x!', '#FF006E', 1.5);
          lastJudgment = { text: 'DEMAM PISAU AKTIF!', tier: 'fever', id: ++judgmentId };
        }
      }

      // Sound + Hitstop + Shake + Particles
      soundEngine.playSlice(target.def.category, quality, combo);

      if (quality === 'perfect' || isCrit) {
        hitstopTimer = 0.032;
        shakeIntensity = Math.max(shakeIntensity, isCrit ? 6.5 : 4.5);
      } else {
        shakeIntensity = Math.max(shakeIntensity, 2.2);
      }

      if (quality === 'perfect' || isCrit) {
        activeSwingBoosted = true;
        activeSwingColorOverride = quality === 'crit' ? '#FF2A85' : '#FACC15';
      }

      slashes.push({
        x: target.x,
        y: target.y,
        color: quality === 'perfect' ? '#FFD60A' : knife.slashColor,
        life: 0.16,
        maxLife: 0.16,
        isPerfect: quality === 'perfect' || isCrit,
      });

      if (quality === 'perfect' || isCrit) {
        if (impactRings.length > 12) impactRings.shift();
        impactRings.push({
          x: target.x,
          y: target.y,
          size: 16,
          maxSize: isCrit ? 76 : 62,
          color: isCrit ? '#FF2A85' : '#FACC15',
          life: 0.24,
          maxLife: 0.24,
        });
      }

      spawnIngredientBurst(target.def, target.x, target.y, quality, false);

      // Spawn spinning cross-section slice flying in 3D arc into top-down bowl
      const sliceSprite = getSliceSprite(
        target.def.id,
        target.def.pixelColor,
        target.def.juiceColor,
        target.def.seedColor
      );
      const flightTime = 0.55;
      const toBowlVx = (bowlX - target.x) / flightTime + (Math.random() - 0.5) * 28;
      const toBowlVy = (bowlY - target.y) / flightTime + (Math.random() - 0.5) * 32;
      slices.push({
        sprite: sliceSprite,
        x: target.x,
        y: target.y,
        z: 8,
        vx: toBowlVx,
        vy: toBowlVy,
        vz: 240 + Math.random() * 60,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 14,
        life: flightTime + 0.08,
        maxLife: flightTime + 0.08,
        size: 32,
        bitColor: target.def.pixelColor,
        bitValue: earned,
      });

      // Judgment & floating text
      if (isCrit) {
        addFloatingLabel(
          target.x,
          target.y - 44,
          `KRITIS! +${earned}`,
          '#FF2A85',
          1.3,
          combo > 1 ? `Kombo ${combo}x` : undefined
        );
        lastJudgment = { text: `KRITIS! +${earned}`, tier: 'crit', id: ++judgmentId };
      } else if (quality === 'perfect') {
        addFloatingLabel(
          target.x,
          target.y - 44,
          `SEMPURNA! +${earned}`,
          '#D97706',
          1.22,
          combo > 1 ? `Kombo ${combo}x` : undefined
        );
        lastJudgment = { text: `SEMPURNA! (${combo}x)`, tier: 'perfect', id: ++judgmentId };
      } else if (quality === 'good') {
        addFloatingLabel(target.x, target.y - 38, `PRESISI +${earned}`, '#15803D', 1.05);
        lastJudgment = { text: `PRESISI! +${earned}`, tier: 'good', id: ++judgmentId };
      } else {
        addFloatingLabel(
          target.x,
          target.y - 32,
          offBeatPenalty ? `KURANG PAS +${earned}` : `+${earned}`,
          offBeatPenalty ? '#B91C1C' : '#3B2314',
          0.92
        );
      }

      // Check if ingredient is completely chopped
      if (target.hp <= 0) {
        const finishBonus = Math.max(
          2,
          Math.round(
            target.def.baseValue *
              0.65 *
              comboMult *
              feverMult *
              activeZone.coinMultiplier *
              boardDef.coinMultiplier
          )
        );
        save.coins += finishBonus;
        save.totalScore += finishBonus;
        soundEngine.playCompleteItem();
        grantLevelXp(3);
        checkZoneUnlocks();
        spawnIngredientBurst(target.def, target.x, target.y, quality, true);
        addFloatingLabel(target.x + 14, target.y - 62, `TUNTAS +${finishBonus}`, '#EA580C', 1.1);
        const idx = items.indexOf(target);
        if (idx >= 0) items.splice(idx, 1);
      }
    };

    if (triggerExternalActionRef) {
      triggerExternalActionRef.current = {
        chopNow: () => {
          bufferedChop = true;
        },
      };
    }

    const onPointerDown = (e: PointerEvent) => {
      if (screenRef.current !== 'PLAYING') return;
      if (e.button !== 0) return;
      isPointerHeld = true;
      bufferedChop = true;
    };

    const onPointerUp = () => {
      isPointerHeld = false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (screenRef.current !== 'PLAYING') return;
      if (e.code === 'Space' || e.code === 'KeyJ' || e.code === 'Enter') {
        if (!e.repeat) {
          bufferedChop = true;
        }
        isKeyHeld = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyJ' || e.code === 'Enter') {
        isKeyHeld = false;
      }
    };

    const onWindowBlur = () => {
      isPointerHeld = false;
      isKeyHeld = false;
      bufferedChop = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onWindowBlur);

    // Pre-populate 2 items so board feels alive immediately
    spawnIngredient(true);

    let lastTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);

      const isTitle = screenRef.current === 'TITLE_MENU';
      const isPaused = screenRef.current === 'PAUSED';

      if (!isPaused) {
        ambientTime += dt;
      }

      if (!isPaused && hitstopTimer > 0) {
        hitstopTimer = Math.max(0, hitstopTimer - dt);
      } else if (!isPaused) {
        const save = saveRef.current;
        const knife = getKnifeById(save.equippedKnifeId);
        const boardDef = getCuttingBoardById(save.equippedBoardId);
        const bowlDef = getBowlById(save.equippedBowlId);
        const { boardX, boardW, cutLineX, bowlX, bowlY } = getBoardGeometry();

        // Fever countdown
        if (feverActive) {
          feverTimeLeft -= dt;
          feverProgress = Math.max(0, (feverTimeLeft / 10) * 100);
          if (feverTimeLeft <= 0) {
            feverActive = false;
            feverProgress = 0;
            feverTimeLeft = 0;
          }
        }

        // Manual buffered input
        manualCooldown = Math.max(0, manualCooldown - dt);
        if (bufferedChop && manualCooldown <= 0 && !isTitle) {
          bufferedChop = false;
          performChop('manual');
        } else if (!isTitle && (isPointerHeld || isKeyHeld)) {
          holdChopTimer += dt;
          const holdInterval = 1 / getHoldChopRate(save.upgrades, feverActive, knife);
          if (holdChopTimer >= holdInterval) {
            holdChopTimer = 0;
            performChop('hold');
          }
        } else {
          holdChopTimer = 0;
        }

        // Sous-chef auto-chopper
        const autoRate = getAutoChopRate(save.upgrades, feverActive);
        if (!isTitle && autoRate > 0) {
          autoChopTimer += dt;
          const interval = 1 / autoRate;
          if (autoChopTimer >= interval) {
            autoChopTimer = 0;
            performChop('sous');
          }
        }

        // Conveyor & Ingredient movement (faster and denser as playerLevel & zone rise)
        const zoneIdx = Math.max(
          0,
          KITCHEN_ZONES.findIndex((z) => z.id === save.activeZoneId)
        );
        const levelSpeedBoost = Math.min(125, (save.playerLevel - 1) * 7.5 + zoneIdx * 14);
        const baseConveyorSpeed = isTitle
          ? 85
          : feverActive
            ? 220 + levelSpeedBoost * 0.5
            : 142 + levelSpeedBoost + Math.min(40, save.upgrades.speedLevel * 3);
        conveyorOffset = (conveyorOffset + baseConveyorSpeed * dt) % 32;

        spawnTimer -= dt;
        const spawnInterval = isTitle
          ? 1.55
          : feverActive
            ? 0.64
            : Math.max(0.62, 1.44 - (save.playerLevel - 1) * 0.042);
        if (spawnTimer <= 0 && items.length < 7) {
          spawnTimer = spawnInterval;
          spawnIngredient(isTitle);
        }

        for (let i = items.length - 1; i >= 0; i--) {
          const it = items[i];
          const inSweetZone = Math.abs(it.x - cutLineX) <= 34;
          // Tighter cutting-line deceleration so players must time slices cleanly
          const slowFactor = !isTitle && !it.def.isHazard && inSweetZone ? 0.52 : 1;
          it.x -= baseConveyorSpeed * slowFactor * dt;
          it.bobPhase += dt * 7;

          // Recover squash & stretch
          it.scaleX += (1 - it.scaleX) * Math.min(1, dt * 16);
          it.scaleY += (1 - it.scaleY) * Math.min(1, dt * 16);
          it.flashTimer = Math.max(0, it.flashTimer - dt);

          // Hazard dodge bonus or unchopped ingredient escape penalty
          if (!isTitle && it.def.isHazard && !it.dodgedAwarded && it.x < boardX - 10) {
            it.dodgedAwarded = true;
            feverProgress = Math.min(100, feverProgress + 8);
            addFloatingLabel(boardX + 20, it.y - 36, 'AMAN! +DEMAM', '#10B981', 0.95);
          } else if (
            !isTitle &&
            !it.def.isHazard &&
            !it.def.isGoldenChili &&
            !it.dodgedAwarded &&
            it.hp >= it.maxHp &&
            it.x < boardX - 18
          ) {
            it.dodgedAwarded = true;
            if (combo > 0) {
              combo = Math.max(0, combo - 2);
              addFloatingLabel(boardX + 18, it.y - 34, 'TERLEWAT!', '#EF4444', 0.9);
            }
          }

          if (it.x < -70) {
            items.splice(i, 1);
          }
        }

        // Flying slices top-down arc physics toward bowl
        for (let i = slices.length - 1; i >= 0; i--) {
          const s = slices[i];
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.z += s.vz * dt;
          s.vz -= 880 * dt;
          s.rot += s.vRot * dt;
          s.life -= dt;
          const distToBowl = Math.hypot(s.x - bowlX, s.y - bowlY);
          if (s.life <= 0 || (s.z <= 2 && distToBowl < 42 && s.vz < 0)) {
            bowlFillAnim = 1;
            bowlBits.push({
              dx: (Math.random() - 0.5) * 32,
              dy: (Math.random() - 0.5) * 26,
              color: s.bitColor,
            });
            bowlValueSum += s.bitValue;

            if (bowlBits.length >= bowlDef.capacity) {
              const curRim = bowlDef.rotatingRim
                ? BOWL_RIM_COLORS[activeBowlColorIdx % BOWL_RIM_COLORS.length]
                : bowlDef.outerColor;
              departingBowls.push({
                x: bowlX,
                y: bowlY,
                vx: -185,
                vy: -95,
                shape: bowlDef.shape,
                rimColor: curRim,
                innerColor: bowlDef.innerColor,
                depthColor: bowlDef.depthColor,
                accentColor: bowlDef.accentColor,
                bits: [...bowlBits],
                life: 0.65,
                maxLife: 0.65,
              });
              bowlBits.length = 0;
              activeBowlColorIdx = (activeBowlColorIdx + 1) % BOWL_RIM_COLORS.length;
              bowlSwapAnim = 1;

              const bowlBonus = Math.max(18, Math.round(bowlValueSum * bowlDef.fullBonusRatio));
              bowlValueSum = 0;
              save.coins += bowlBonus;
              save.totalScore += bowlBonus;
              soundEngine.playOrderBell();
              grantLevelXp(4);
              checkZoneUnlocks();
              spawnParticles(bowlX, bowlY, '#FACC15', 10, 180, 5, 'spark');
              addFloatingLabel(
                bowlX + 6,
                bowlY - 46,
                `MANGKUK PENUH! +${bowlBonus}`,
                '#0EA5E9',
                1.08
              );
            }

            slices.splice(i, 1);
          }
        }

        // Departing full bowls sliding away off the counter
        for (let i = departingBowls.length - 1; i >= 0; i--) {
          const db = departingBowls[i];
          db.x += db.vx * dt;
          db.y += db.vy * dt;
          db.vx *= 0.96;
          db.life -= dt;
          if (db.life <= 0) departingBowls.splice(i, 1);
        }

        // Top-down 360° particles physics with Z-height hop & surface friction
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.z += p.vz * dt;
          p.vz -= p.gravity * dt;

          if (p.z <= 0) {
            p.z = 0;
            if (!p.bounced && p.kind !== 'spark') {
              p.vz = -p.vz * (p.kind === 'chunk' ? 0.38 : 0.15);
              p.bounced = true;
            } else {
              p.vz = 0;
            }
            p.vx *= 0.82;
            p.vy *= 0.82;
          }

          p.life -= dt;
          if (p.life <= 0) particles.splice(i, 1);
        }

        // Board splats fade slowly on the wood
        for (let i = boardSplats.length - 1; i >= 0; i--) {
          boardSplats[i].life -= dt;
          if (boardSplats[i].life <= 0) boardSplats.splice(i, 1);
        }

        // Floating labels
        for (let i = labels.length - 1; i >= 0; i--) {
          const l = labels[i];
          l.y += l.vy * dt;
          l.vy *= 0.94;
          l.life -= dt;
          if (l.life <= 0) labels.splice(i, 1);
        }

        // Slash trails, impact rings & fluid knife motion ribbon
        for (let i = slashes.length - 1; i >= 0; i--) {
          slashes[i].life -= dt;
          if (slashes[i].life <= 0) slashes.splice(i, 1);
        }
        for (let i = impactRings.length - 1; i >= 0; i--) {
          const ir = impactRings[i];
          ir.life -= dt;
          const progress = 1 - Math.max(0, ir.life / ir.maxLife);
          ir.size = 14 + (ir.maxSize - 14) * progress;
          if (ir.life <= 0) impactRings.splice(i, 1);
        }

        if (!isTitle && knifeAnimProgress > 0.04) {
          const { centerY: curCenterY, cutLineX: curCutLineX } = getBoardGeometry();
          const pose = getPlayerKnifePose(curCutLineX, curCenterY, knifeAnimProgress, ambientTime);
          const pts = sampleBladePoints(
            pose.x,
            pose.y - pose.elevation * 0.25,
            pose.angle,
            pose.scale,
            -44,
            10,
            6
          );
          knifeTrails.push({
            swingId: activeSwingId,
            tipX: pts.tipX,
            tipY: pts.tipY,
            heelX: pts.heelX,
            heelY: pts.heelY,
            color: feverActive ? '#FF006E' : activeSwingColorOverride ?? knife.slashColor,
            edgeColor: knife.edgeColor,
            isBoosted: feverActive || activeSwingBoosted,
            life: 0.14,
            maxLife: 0.14,
          });
          if (knifeTrails.length > 26) knifeTrails.shift();
        }

        if (!isTitle && save.upgrades.sousChefLevel > 0 && sousKnifeAnim > 0.05) {
          const { boardY: curBoardY, cutLineX: curCutLineX } = getBoardGeometry();
          const sousPose = getSousKnifePose(curCutLineX, curBoardY, sousKnifeAnim, ambientTime);
          const pts = sampleBladePoints(
            sousPose.x,
            sousPose.y - sousPose.elevation * 0.25,
            sousPose.angle,
            sousPose.scale,
            -26,
            6,
            4
          );
          sousTrails.push({
            swingId: activeSousSwingId,
            tipX: pts.tipX,
            tipY: pts.tipY,
            heelX: pts.heelX,
            heelY: pts.heelY,
            color: knife.slashColor,
            edgeColor: knife.edgeColor,
            isBoosted: feverActive,
            life: 0.12,
            maxLife: 0.12,
          });
          if (sousTrails.length > 18) sousTrails.shift();
        }

        for (let i = knifeTrails.length - 1; i >= 0; i--) {
          knifeTrails[i].life -= dt;
          if (knifeTrails[i].life <= 0) knifeTrails.splice(i, 1);
        }
        for (let i = sousTrails.length - 1; i >= 0; i--) {
          sousTrails[i].life -= dt;
          if (sousTrails[i].life <= 0) sousTrails.splice(i, 1);
        }

        knifeAnimProgress = Math.max(0, knifeAnimProgress - dt * 8.5);
        sousKnifeAnim = Math.max(0, sousKnifeAnim - dt * 7);
        bowlFillAnim = Math.max(0, bowlFillAnim - dt * 6);
        bowlSwapAnim = Math.max(0, bowlSwapAnim - dt * 4.2);
        shakeIntensity = Math.max(0, shakeIntensity - dt * 28);

        // Periodic Ambient Environment Effects: Cooking Steam & Gentle Kitchen Breeze
        const { boardY: curBoardY, boardH: curBoardH } = getBoardGeometry();
        const potX = 82;
        const potY = Math.min(height - 72, curBoardY + curBoardH + 50);
        const hasPotSpace = potY > curBoardY + curBoardH + 22 && potY + 34 < height;

        steamTimer -= dt;
        if (steamTimer <= 0) {
          steamTimer = feverActive ? 0.28 : 0.55 + Math.random() * 0.45;
          // Emit warm steam from simmering pot (or upper-left sauce bowls if viewport is short)
          const emitX = hasPotSpace ? potX + (Math.random() - 0.5) * 24 : 84 + Math.random() * 72;
          const emitY = hasPotSpace ? potY + (Math.random() - 0.5) * 18 : Math.max(96, curBoardY - 64);
          if (steamPuffs.length < 36) {
            steamPuffs.push({
              x: emitX,
              y: emitY,
              vx: 14 + Math.random() * 18 + (activeBreezeTime > 0 ? 38 : 0),
              vy: -24 - Math.random() * 16,
              size: 8 + Math.floor(Math.random() * 6),
              life: 1.6 + Math.random() * 0.7,
              maxLife: 2.3,
              wobblePhase: Math.random() * Math.PI * 2,
            });
          }
          // Subtle sizzle steam from hot meat items on the board
          for (const it of items) {
            if (it.def.category === 'daging' && Math.random() < 0.45 && steamPuffs.length < 36) {
              steamPuffs.push({
                x: it.x + (Math.random() - 0.5) * 18,
                y: it.y + (Math.random() - 0.5) * 14,
                vx: 10 + (activeBreezeTime > 0 ? 36 : 0),
                vy: -20 - Math.random() * 12,
                size: 6 + Math.floor(Math.random() * 4),
                life: 1.1 + Math.random() * 0.4,
                maxLife: 1.5,
                wobblePhase: Math.random() * Math.PI * 2,
              });
            }
          }
        }

        for (let i = steamPuffs.length - 1; i >= 0; i--) {
          const st = steamPuffs[i];
          st.wobblePhase += dt * 3.5;
          st.x += (st.vx + Math.sin(st.wobblePhase) * 10 + (activeBreezeTime > 0 ? 28 : 0)) * dt;
          st.y += st.vy * dt;
          st.size += dt * 4.5;
          st.life -= dt;
          if (st.life <= 0) steamPuffs.splice(i, 1);
        }

        // Periodic gentle breeze carrying dried leaves across the cutting board
        breezeTimer -= dt;
        if (breezeTimer <= 0) {
          breezeTimer = 4.2 + Math.random() * 3.6;
          activeBreezeTime = 2.6;

          const curZone = getKitchenZoneById(save.activeZoneId);
          const leafPalettes = curZone.theme.leafPalettes;

          const leafCount = 3 + Math.floor(Math.random() * 3);
          for (let i = 0; i < leafCount; i++) {
            if (ambientLeaves.length >= 16) ambientLeaves.shift();
            const pal = leafPalettes[Math.floor(Math.random() * leafPalettes.length)];
            const fromTop = Math.random() < 0.45;
            const startX = fromTop ? width * (0.35 + Math.random() * 0.65) : width + 24 + i * 38;
            const startY = fromTop ? -18 - i * 24 : height * (0.15 + Math.random() * 0.65);
            ambientLeaves.push({
              x: startX,
              y: startY,
              vx: -(95 + Math.random() * 65),
              vy: 28 + Math.random() * 36,
              rot: Math.random() * Math.PI * 2,
              vRot: (Math.random() - 0.5) * 3.8,
              flutterPhase: Math.random() * Math.PI * 2,
              color: pal.leaf,
              stemColor: pal.stem,
              scale: 0.9 + Math.random() * 0.35,
              life: 8,
              maxLife: 8,
            });
          }

          const streakCount = 3 + Math.floor(Math.random() * 2);
          for (let i = 0; i < streakCount; i++) {
            if (windStreaks.length >= 12) windStreaks.shift();
            windStreaks.push({
              x: width + 40 + i * 70,
              y: height * (0.15 + Math.random() * 0.7),
              vx: -(240 + Math.random() * 110),
              vy: 42 + Math.random() * 26,
              length: 42 + Math.floor(Math.random() * 36),
              life: 3.5,
              maxLife: 3.5,
            });
          }
        }

        if (activeBreezeTime > 0) {
          activeBreezeTime = Math.max(0, activeBreezeTime - dt);
        }

        for (let i = ambientLeaves.length - 1; i >= 0; i--) {
          const lf = ambientLeaves[i];
          lf.flutterPhase += dt * 4.2;
          lf.x += (lf.vx + Math.sin(lf.flutterPhase) * 18) * dt;
          lf.y += (lf.vy + Math.cos(lf.flutterPhase * 1.3) * 14) * dt;
          lf.rot += lf.vRot * dt;
          lf.life -= dt;
          if (lf.life <= 0 || lf.x < -50 || lf.y > height + 50) {
            ambientLeaves.splice(i, 1);
          }
        }

        for (let i = windStreaks.length - 1; i >= 0; i--) {
          const ws = windStreaks[i];
          ws.x += ws.vx * dt;
          ws.y += ws.vy * dt;
          ws.life -= dt;
          if (ws.life <= 0 || ws.x + ws.length < -30) {
            windStreaks.splice(i, 1);
          }
        }

        // Throttled HUD update (~12Hz)
        hudSyncTimer += dt;
        if (!isTitle && hudSyncTimer >= 0.08) {
          hudSyncTimer = 0;
          const sweetHalf = getSweetSpotHalfWidth(save.upgrades, knife, save.playerLevel, boardDef);
          const cutPower = getCutPower(save.upgrades, knife, save.prestigeStars);
          const estAuto = getAutoChopRate(save.upgrades, feverActive);
          onHudUpdateRef.current({
            coins: save.coins,
            totalScore: save.totalScore,
            playerLevel: save.playerLevel,
            levelXp: save.levelXp,
            levelXpMax: getXpForNextLevel(save.playerLevel),
            difficultyMult: getLevelDifficultyMultiplier(save.playerLevel),
            perfectSlices: save.perfectSlices,
            activeZoneId: save.activeZoneId,
            unlockedZonesCount: save.unlockedZones.length,
            nextUnlockIngredient: getNextUnlockForLevel(save.playerLevel),
            combo,
            comboMultiplier: getComboMultiplier(combo, save.upgrades),
            bestCombo: save.bestCombo,
            feverProgress,
            feverActive,
            feverTimeLeft,
            lastJudgment,
            activeOrder: activeOrder ? { ...activeOrder } : null,
            ordersCompleted,
            dpsEstimate: cutPower * estAuto,
            cutPower,
            autoRate: estAuto,
            sweetSpotWidth: sweetHalf * 2,
            prestigeReady: save.totalScore >= PRESTIGE_SCORE_THRESHOLD,
            prestigeRewardStars: Math.max(1, Math.floor(save.totalScore / PRESTIGE_SCORE_THRESHOLD)),
          });
        }

        persistTimer += dt;
        if (!isTitle && persistTimer >= 3) {
          persistTimer = 0;
          onPersistRef.current();
        }
      }

      // ================= RENDERING =================
      ctx.save();
      if (shakeIntensity > 0.2) {
        const sx = (Math.random() - 0.5) * shakeIntensity * 2;
        const sy = (Math.random() - 0.5) * shakeIntensity * 2;
        ctx.translate(Math.round(sx), Math.round(sy));
      }

      const save = saveRef.current;
      const knife = getKnifeById(save.equippedKnifeId);
      const boardDef = getCuttingBoardById(save.equippedBoardId);
      const bowlDef = getBowlById(save.equippedBowlId);
      const zone = getKitchenZoneById(save.activeZoneId);
      const zTheme = zone.theme;
      const { centerY, boardX, boardY, boardW, boardH, cutLineX, bowlX, bowlY } = getBoardGeometry();

      // 1. Top-Down Kitchen Countertop Tiles (Zone-Themed 90° Bird's-Eye View)
      const tileSize = 56;
      for (let ty = 0; ty < height; ty += tileSize) {
        for (let tx = 0; tx < width; tx += tileSize) {
          const even = (Math.floor(tx / tileSize) + Math.floor(ty / tileSize)) % 2 === 0;
          ctx.fillStyle = feverActive
            ? even ? zTheme.feverTileA : zTheme.feverTileB
            : even ? zTheme.tileA : zTheme.tileB;
          ctx.fillRect(tx, ty, tileSize, tileSize);
          // Crisp grout edge
          ctx.fillStyle = feverActive ? zTheme.feverGrout : zTheme.grout;
          ctx.fillRect(tx, ty + tileSize - 2, tileSize, 2);
          ctx.fillRect(tx + tileSize - 2, ty, 2, tileSize);
        }
      }

      drawZoneTileAccents(ctx, zone.id, width, height, tileSize, ambientTime, feverActive);

      const potX = 82;
      const potY = Math.min(height - 72, boardY + boardH + 50);
      const hasLowerDeckSpace = potY > boardY + boardH + 22 && potY + 34 < height;
      drawZoneDecorations({
        ctx,
        zone,
        width,
        height,
        boardX,
        boardY,
        boardW,
        boardH,
        potX,
        potY,
        hasLowerDeckSpace,
        ambientTime,
        feverActive,
      });

      // 2. Top-Down Conveyor Belt Track running across centerY
      const beltH = 88;
      const beltY = centerY - beltH / 2;
      ctx.fillStyle = '#3B2314';
      ctx.fillRect(0, beltY - 5, width, beltH + 10);
      ctx.fillStyle = zTheme.beltColor;
      ctx.fillRect(0, beltY, width, beltH);
      // Subtle center belt shadow band for depth
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      ctx.fillRect(0, beltY + 12, width, beltH - 24);
      // Conveyor metal side rails with specular strip & rivets
      ctx.fillStyle = zTheme.railColor;
      ctx.fillRect(0, beltY, width, 7);
      ctx.fillRect(0, beltY + beltH - 7, width, 7);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(0, beltY + 1, width, 2);
      ctx.fillRect(0, beltY + beltH - 6, width, 2);
      ctx.fillStyle = '#3B2314';
      for (let rx = 18; rx < width; rx += 48) {
        ctx.fillRect(rx, beltY + 2, 3, 3);
        ctx.fillRect(rx, beltY + beltH - 5, 3, 3);
      }
      // Moving vertical tread slats & subtle directional flow chevrons viewed from above
      for (let cx = -conveyorOffset; cx < width + 32; cx += 32) {
        const sx = Math.round(cx);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.fillRect(sx, beltY + 9, 6, beltH - 18);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.fillRect(sx + 12, centerY - 6, 3, 4);
        ctx.fillRect(sx + 9, centerY - 2, 3, 4);
        ctx.fillRect(sx + 12, centerY + 2, 3, 4);
      }

      // 3. Top-Down Equipped Cutting Board (Centerpiece!)
      // Top-down drop shadow onto counter & conveyor
      ctx.fillStyle = 'rgba(59, 35, 20, 0.3)';
      ctx.fillRect(boardX + 8, boardY + 10, boardW, boardH);
      // Board handle tab on right edge
      ctx.fillStyle = '#3B2314';
      ctx.fillRect(boardX + boardW, centerY - 24, 24, 48);
      ctx.fillStyle = boardDef.handleColor;
      ctx.fillRect(boardX + boardW, centerY - 20, 20, 40);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(boardX + boardW, centerY - 20, 18, 3);
      ctx.fillStyle = '#3B2314';
      ctx.fillRect(boardX + boardW + 6, centerY - 8, 8, 16);
      // Main Board outline
      ctx.fillStyle = '#3B2314';
      ctx.fillRect(boardX - 4, boardY - 4, boardW + 8, boardH + 8);
      // Board top surface with butcher-block plank bands
      ctx.fillStyle = boardDef.woodColor;
      ctx.fillRect(boardX, boardY, boardW, boardH);

      if (boardDef.style === 'bamboo') {
        // Vertical bamboo strip slats & natural node rings
        for (let bx = boardX + 32; bx < boardX + boardW - 12; bx += 42) {
          ctx.fillStyle = boardDef.grainColor;
          ctx.fillRect(bx, boardY, 3, boardH);
          ctx.fillStyle = boardDef.pegColor;
          ctx.fillRect(bx - 1, boardY + ((bx * 7) % Math.max(40, boardH - 36)) + 18, 5, 3);
        }
      } else if (boardDef.style === 'woven') {
        // Traditional checkerboard rattan weave bands around inner border
        for (let wy = boardY + 18; wy < boardY + boardH - 22; wy += 18) {
          for (let wx = boardX + 20; wx < boardX + boardW - 24; wx += 22) {
            const alt = ((wx + wy) >> 4) % 2 === 0;
            ctx.fillStyle = alt ? 'rgba(140, 90, 43, 0.22)' : 'rgba(255, 248, 225, 0.14)';
            ctx.fillRect(wx, wy, 14, 10);
          }
        }
      } else if (boardDef.style === 'carbon_tech') {
        // Sleek carbon-fiber micro-weave squares
        for (let cy = boardY + 12; cy < boardY + boardH - 14; cy += 12) {
          for (let cx = boardX + 12; cx < boardX + boardW - 14; cx += 12) {
            if (((cx + cy) / 12) % 2 === 0) {
              ctx.fillStyle = boardDef.grainColor;
              ctx.fillRect(cx, cy, 8, 8);
            }
          }
        }
      } else if (boardDef.style === 'cyber_grid' || boardDef.style === 'quantum_holo') {
        // Crisp futuristic tech grid lines
        ctx.fillStyle =
          boardDef.style === 'quantum_holo'
            ? 'rgba(168, 85, 247, 0.22)'
            : 'rgba(34, 211, 238, 0.16)';
        for (let gx = boardX + 28; gx < boardX + boardW - 18; gx += 32) {
          ctx.fillRect(gx, boardY + 10, 2, boardH - 20);
        }
        for (let gy = boardY + 24; gy < boardY + boardH - 18; gy += 28) {
          ctx.fillRect(boardX + 10, gy, boardW - 20, 2);
        }
      } else {
        const plankH = Math.floor(boardH / 4);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(boardX, boardY, boardW, plankH);
        ctx.fillRect(boardX, boardY + plankH * 2, boardW, plankH);
        ctx.fillStyle = 'rgba(59, 35, 20, 0.06)';
        ctx.fillRect(boardX, boardY + plankH, boardW, 2);
        ctx.fillRect(boardX, boardY + plankH * 2, boardW, 2);
        ctx.fillRect(boardX, boardY + plankH * 3, boardW, 2);
      }

      // Crisp inner top highlight & bottom bevel
      ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
      ctx.fillRect(boardX, boardY, boardW, 3);
      ctx.fillRect(boardX, boardY, 3, boardH);
      ctx.fillStyle = 'rgba(59, 35, 20, 0.16)';
      ctx.fillRect(boardX, boardY + boardH - 3, boardW, 3);

      // Perimeter carved juice groove / neon energy rail
      ctx.strokeStyle = boardDef.grooveColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(boardX + 10, boardY + 10, boardW - 20, boardH - 20);

      // Style-specific decorative inlays
      if (boardDef.style === 'basalt') {
        // Rough-hewn volcanic stone speckles & chisel marks
        ctx.fillStyle = boardDef.grainColor;
        for (let sx = 0; sx < 10; sx++) {
          const px = boardX + 28 + ((sx * 47) % Math.max(80, boardW - 64));
          const py = boardY + 22 + ((sx * 31) % Math.max(40, boardH - 48));
          ctx.fillRect(px, py, 8, 5);
          ctx.fillStyle = '#9CA3AF';
          ctx.fillRect(px + 2, py + 1, 3, 2);
          ctx.fillStyle = boardDef.grainColor;
        }
      } else if (boardDef.style === 'marble') {
        ctx.fillStyle = boardDef.grainColor;
        ctx.fillRect(boardX + 34, boardY + 32, 46, 3);
        ctx.fillRect(boardX + 74, boardY + 35, 32, 3);
        ctx.fillRect(boardX + boardW - 140, boardY + boardH - 44, 52, 3);
        ctx.fillRect(boardX + boardW - 102, boardY + boardH - 41, 36, 3);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(boardX + 18, boardY + 18, 28, 3);
      } else if (boardDef.style === 'sakura') {
        const drawInlayPetal = (px: number, py: number) => {
          ctx.fillStyle = '#F472B6';
          ctx.fillRect(px - 4, py - 4, 8, 8);
          ctx.fillStyle = '#FFF1F2';
          ctx.fillRect(px - 1, py - 1, 2, 2);
        };
        drawInlayPetal(boardX + 26, boardY + 26);
        drawInlayPetal(boardX + boardW - 26, boardY + 26);
        drawInlayPetal(boardX + 26, boardY + boardH - 26);
        drawInlayPetal(boardX + boardW - 26, boardY + boardH - 26);
      } else if (boardDef.style === 'carved_teak') {
        // Traditional Indonesian golden kawung / batik medallion corner inlays
        const drawKawung = (kx: number, ky: number) => {
          ctx.fillStyle = '#F59E0B';
          ctx.fillRect(kx - 7, ky - 2, 14, 4);
          ctx.fillRect(kx - 2, ky - 7, 4, 14);
          ctx.fillStyle = '#FEF08A';
          ctx.fillRect(kx - 2, ky - 2, 4, 4);
        };
        drawKawung(boardX + 28, boardY + 28);
        drawKawung(boardX + boardW - 28, boardY + 28);
        drawKawung(boardX + 28, boardY + boardH - 28);
        drawKawung(boardX + boardW - 28, boardY + boardH - 28);
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.strokeRect(boardX + 17, boardY + 17, boardW - 34, boardH - 34);
      } else if (boardDef.style === 'obsidian') {
        const emberGlow = Math.sin(ambientTime * 5) > 0 ? '#F97316' : '#FB7185';
        ctx.fillStyle = emberGlow;
        ctx.fillRect(boardX + 36, boardY + 30, 34, 3);
        ctx.fillRect(boardX + 66, boardY + 33, 18, 3);
        ctx.fillRect(boardX + boardW - 110, boardY + boardH - 36, 42, 3);
        ctx.fillRect(boardX + boardW - 76, boardY + boardH - 33, 18, 3);
        ctx.fillStyle = '#FACC15';
        ctx.fillRect(boardX + 68, boardY + 33, 4, 3);
        ctx.fillRect(boardX + boardW - 76, boardY + boardH - 33, 4, 3);
      } else if (boardDef.style === 'royal_gold') {
        ctx.strokeStyle = '#FEF08A';
        ctx.lineWidth = 2;
        ctx.strokeRect(boardX + 17, boardY + 17, boardW - 34, boardH - 34);
        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(boardX + 24, boardY + 24, 6, 6);
        ctx.fillRect(boardX + boardW - 30, boardY + 24, 6, 6);
        ctx.fillRect(boardX + 24, boardY + boardH - 30, 6, 6);
        ctx.fillRect(boardX + boardW - 30, boardY + boardH - 30, 6, 6);
      } else if (boardDef.style === 'carbon_tech') {
        // Crisp cyan LED edge bars + precision scale ticks
        const pulse = Math.sin(ambientTime * 4) > 0 ? '#38BDF8' : '#7DD3FC';
        ctx.fillStyle = pulse;
        ctx.fillRect(boardX + 24, boardY + 10, 48, 3);
        ctx.fillRect(boardX + boardW - 72, boardY + boardH - 13, 48, 3);
        ctx.fillStyle = '#94A3B8';
        for (let tx = boardX + 40; tx < boardX + boardW - 40; tx += 36) {
          ctx.fillRect(tx, boardY + boardH - 22, 2, 6);
        }
      } else if (boardDef.style === 'cyber_grid') {
        // Neon cyber nodes & animated laser scan pulse
        const neonPink = Math.sin(ambientTime * 6) > 0 ? '#EC4899' : '#F472B6';
        ctx.fillStyle = neonPink;
        ctx.fillRect(boardX + 20, boardY + 20, 10, 4);
        ctx.fillRect(boardX + 20, boardY + 20, 4, 10);
        ctx.fillRect(boardX + boardW - 30, boardY + 20, 10, 4);
        ctx.fillRect(boardX + boardW - 24, boardY + 20, 4, 10);
        ctx.fillRect(boardX + 20, boardY + boardH - 24, 10, 4);
        ctx.fillRect(boardX + 20, boardY + boardH - 30, 4, 10);
        ctx.fillRect(boardX + boardW - 30, boardY + boardH - 24, 10, 4);
        ctx.fillRect(boardX + boardW - 24, boardY + boardH - 30, 4, 10);
        const scanX = boardX + 24 + Math.round(((ambientTime * 90) % Math.max(60, boardW - 52)));
        ctx.fillStyle = 'rgba(34, 211, 238, 0.32)';
        ctx.fillRect(scanX, boardY + 14, 4, boardH - 28);
      } else if (boardDef.style === 'quantum_holo') {
        // Holographic dual-ring energy barrier & floating plasma pulse
        const holoPulse = Math.sin(ambientTime * 7) > 0 ? '#4ADE80' : '#38BDF8';
        ctx.strokeStyle = holoPulse;
        ctx.lineWidth = 2;
        ctx.strokeRect(boardX + 18, boardY + 18, boardW - 36, boardH - 36);
        const waveY = boardY + 24 + Math.round(((ambientTime * 64) % Math.max(40, boardH - 52)));
        ctx.fillStyle = 'rgba(74, 222, 128, 0.28)';
        ctx.fillRect(boardX + 20, waveY, boardW - 40, 3);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(boardX + 22, boardY + 22, 6, 6);
        ctx.fillRect(boardX + boardW - 28, boardY + 22, 6, 6);
        ctx.fillRect(boardX + 22, boardY + boardH - 28, 6, 6);
        ctx.fillRect(boardX + boardW - 28, boardY + boardH - 28, 6, 6);
      } else if (boardDef.style === 'oak') {
        ctx.fillStyle = boardDef.grainColor;
        ctx.fillRect(boardX + 26, boardY + 26, 110, 4);
        ctx.fillRect(boardX + boardW - 150, boardY + 34, 96, 4);
        ctx.fillRect(boardX + 48, boardY + boardH - 34, 130, 4);
        ctx.fillRect(boardX + boardW - 180, boardY + boardH - 28, 90, 4);
      }

      // Corner pegs / gems
      ctx.fillStyle = boardDef.pegColor;
      ctx.fillRect(boardX + 4, boardY + 4, 5, 5);
      ctx.fillRect(boardX + boardW - 9, boardY + 4, 5, 5);
      ctx.fillRect(boardX + 4, boardY + boardH - 9, 5, 5);
      ctx.fillRect(boardX + boardW - 9, boardY + boardH - 9, 5, 5);

      // Subtle chef knife score marks near cutting rail
      ctx.fillStyle =
        boardDef.style === 'obsidian' ? 'rgba(255, 255, 255, 0.14)' : 'rgba(59, 35, 20, 0.14)';
      ctx.fillRect(cutLineX - 8, centerY - 46, 2, 18);
      ctx.fillRect(cutLineX + 5, centerY + 28, 2, 20);
      ctx.fillRect(cutLineX - 4, centerY + 12, 2, 14);

      // 4. Precision Sweet-Spot & Gold Core Guide on Cutting Board
      const sweetHalf = getSweetSpotHalfWidth(save.upgrades, knife, save.playerLevel, boardDef);
      const goldHalf = sweetHalf * 0.38;
      const itemInSweetSpot =
        !isTitle &&
        items.some((it) => !it.def.isHazard && Math.abs(it.x - cutLineX) <= sweetHalf);
      const itemInGoldCore =
        !isTitle &&
        items.some((it) => !it.def.isHazard && Math.abs(it.x - cutLineX) <= goldHalf);

      // Green Precision Zone
      ctx.fillStyle = itemInSweetSpot ? 'rgba(34, 197, 94, 0.38)' : 'rgba(34, 197, 94, 0.24)';
      ctx.fillRect(cutLineX - sweetHalf, boardY + 12, sweetHalf * 2, boardH - 24);
      ctx.fillStyle = '#16A34A';
      ctx.fillRect(cutLineX - sweetHalf, boardY + 12, 3, boardH - 24);
      ctx.fillRect(cutLineX + sweetHalf - 3, boardY + 12, 3, boardH - 24);

      // Gold Perfect Core
      ctx.fillStyle = feverActive
        ? 'rgba(255, 0, 110, 0.32)'
        : itemInGoldCore
          ? 'rgba(250, 204, 21, 0.62)'
          : 'rgba(250, 204, 21, 0.4)';
      ctx.fillRect(cutLineX - goldHalf, boardY + 12, goldHalf * 2, boardH - 24);

      // Crisp Center Cut Line (segmented highlight rail)
      ctx.fillStyle = itemInGoldCore ? '#FEF08A' : '#FFFDF5';
      ctx.fillRect(cutLineX - 2, boardY + 8, 4, boardH - 16);
      // Top & Bottom pointer arrows on board (light up when ingredient aligns!)
      ctx.fillStyle = '#3B2314';
      ctx.fillRect(cutLineX - 10, boardY - 13, 20, 11);
      ctx.fillRect(cutLineX - 10, boardY + boardH + 2, 20, 11);
      ctx.fillStyle = itemInGoldCore ? '#22C55E' : itemInSweetSpot ? '#FEF08A' : '#FACC15';
      ctx.fillRect(cutLineX - 7, boardY - 11, 14, 7);
      ctx.fillRect(cutLineX - 7, boardY + boardH + 4, 14, 7);

      // 4b. Pixel Juice Splats & Crumbs on the Cutting Board
      for (const sp of boardSplats) {
        ctx.save();
        ctx.globalAlpha = Math.min(0.84, (sp.life / sp.maxLife) * 1.1);
        ctx.fillStyle = sp.color;
        ctx.fillRect(sp.x, sp.y, sp.w, sp.h);
        ctx.restore();
      }

      // 5. Top-Down Equipped Serving Bowls (Spare Stack + Departing Full + Active Empty/Filling)
      const drawServingBowl = (
        bx: number,
        by: number,
        scale: number,
        shape: BowlShape,
        rimColor: string,
        innerColor: string,
        depthColor: string,
        accentColor: string,
        bits: { dx: number; dy: number; color: string }[],
        alpha = 1
      ) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(Math.round(bx), Math.round(by));
        ctx.scale(scale, scale);

        if (shape === 'square_bamboo') {
          ctx.fillStyle = 'rgba(59, 35, 20, 0.25)';
          ctx.fillRect(-34, -32, 74, 74);
          ctx.fillStyle = '#3B2314';
          ctx.fillRect(-36, -36, 72, 72);
          ctx.fillStyle = rimColor;
          ctx.fillRect(-32, -32, 64, 64);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.fillRect(-32, -32, 64, 3);
          ctx.fillStyle = innerColor;
          ctx.fillRect(-26, -26, 52, 52);
          ctx.fillStyle = depthColor;
          ctx.fillRect(-26, -26, 52, 8);
          // Bamboo green woven corner ties
          ctx.fillStyle = accentColor;
          ctx.fillRect(-32, -32, 8, 8);
          ctx.fillRect(24, -32, 8, 8);
          ctx.fillRect(-32, 24, 8, 8);
          ctx.fillRect(24, 24, 8, 8);
        } else if (shape === 'crystal' || shape === 'jade') {
          ctx.fillStyle = 'rgba(59, 35, 20, 0.25)';
          ctx.fillRect(-34, -32, 74, 74);
          // Faceted octagonal outline
          ctx.fillStyle = '#3B2314';
          ctx.fillRect(-24, -38, 48, 76);
          ctx.fillRect(-38, -24, 76, 48);
          ctx.fillRect(-32, -32, 64, 64);
          ctx.fillStyle = rimColor;
          ctx.fillRect(-22, -34, 44, 68);
          ctx.fillRect(-34, -22, 68, 44);
          ctx.fillRect(-29, -29, 58, 58);
          ctx.fillStyle = accentColor;
          ctx.fillRect(-24, -32, 16, 3);
          ctx.fillRect(-32, -24, 3, 14);
          ctx.fillStyle = innerColor;
          ctx.fillRect(-23, -23, 46, 46);
          ctx.fillStyle = depthColor;
          ctx.fillRect(-21, -23, 42, 8);
        } else {
          // Royal chalice ear handles
          if (shape === 'royal_chalice') {
            ctx.fillStyle = '#3B2314';
            ctx.fillRect(-46, -12, 12, 24);
            ctx.fillRect(34, -12, 12, 24);
            ctx.fillStyle = rimColor;
            ctx.fillRect(-43, -9, 9, 18);
            ctx.fillRect(34, -9, 9, 18);
          }

          ctx.fillStyle = 'rgba(59, 35, 20, 0.25)';
          ctx.fillRect(-36, -34, 78, 76);
          // Stepped pixel circle outer dark rim
          ctx.fillStyle = '#3B2314';
          ctx.fillRect(-38, -28, 76, 56);
          ctx.fillRect(-28, -38, 56, 76);
          // Colored rim
          ctx.fillStyle = rimColor;
          ctx.fillRect(-34, -24, 68, 48);
          ctx.fillRect(-24, -34, 48, 68);
          // Specular shine
          ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
          ctx.fillRect(-22, -32, 24, 3);
          ctx.fillRect(-32, -22, 3, 18);
          // Inner basin
          ctx.fillStyle = innerColor;
          ctx.fillRect(-28, -20, 56, 40);
          ctx.fillRect(-20, -28, 40, 56);
          // Subtle inner depth crescent
          ctx.fillStyle = depthColor;
          ctx.fillRect(-22, -22, 44, 8);

          if (shape === 'lacquer') {
            ctx.fillStyle = accentColor;
            ctx.fillRect(-20, -28, 40, 3);
            ctx.fillRect(-20, 25, 40, 3);
          } else if (shape === 'royal_chalice') {
            ctx.fillStyle = accentColor;
            ctx.fillRect(-3, -34, 6, 6);
            ctx.fillRect(-3, 28, 6, 6);
          }
        }

        // Accumulated pixel sliced bits inside the bowl
        for (const bit of bits) {
          ctx.fillStyle = '#3B2314';
          ctx.fillRect(Math.round(bit.dx - 4), Math.round(bit.dy - 4), 8, 8);
          ctx.fillStyle = bit.color;
          ctx.fillRect(Math.round(bit.dx - 3), Math.round(bit.dy - 3), 6, 6);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fillRect(Math.round(bit.dx - 2), Math.round(bit.dy - 2), 2, 2);
        }
        ctx.restore();
      };

      // Reserve empty bowl neatly stacked nearby on the counter
      const spareX = Math.max(38, bowlX - 10);
      const spareY = Math.max(94, bowlY - 68);
      if (bowlY - spareY >= 46) {
        const nextRim = bowlDef.rotatingRim
          ? BOWL_RIM_COLORS[(activeBowlColorIdx + 1) % BOWL_RIM_COLORS.length]
          : bowlDef.outerColor;
        drawServingBowl(
          spareX,
          spareY,
          0.68,
          bowlDef.shape,
          nextRim,
          bowlDef.innerColor,
          bowlDef.depthColor,
          bowlDef.accentColor,
          [],
          0.92
        );
      }

      // Active bowl (slides in smoothly from spare bowl position on swap)
      const swapT = bowlSwapAnim;
      const activeDrawX = bowlX + (spareX - bowlX) * swapT;
      const activeDrawY = bowlY + (spareY - bowlY) * swapT;
      const activeScale = (1 + bowlFillAnim * 0.12) * (1 - swapT * 0.24);
      const activeRim = bowlDef.rotatingRim
        ? BOWL_RIM_COLORS[activeBowlColorIdx % BOWL_RIM_COLORS.length]
        : bowlDef.outerColor;
      drawServingBowl(
        activeDrawX,
        activeDrawY,
        activeScale,
        bowlDef.shape,
        activeRim,
        bowlDef.innerColor,
        bowlDef.depthColor,
        bowlDef.accentColor,
        bowlBits,
        1
      );

      // Compact capacity badge with fill progress bar below active bowl
      if (!isTitle) {
        const badgeY = Math.round(bowlY + 42);
        const fillPct = Math.min(1, bowlBits.length / bowlDef.capacity);
        ctx.fillStyle = '#3B2314';
        ctx.fillRect(Math.round(bowlX - 24), badgeY, 48, 17);
        ctx.fillStyle = '#FFFBF2';
        ctx.fillRect(Math.round(bowlX - 22), badgeY + 2, 44, 13);
        ctx.fillStyle = bowlBits.length >= bowlDef.capacity - 3 ? '#F59E0B' : '#38BDF8';
        ctx.fillRect(Math.round(bowlX - 22), badgeY + 12, Math.round(44 * fillPct), 3);
        ctx.fillStyle = bowlBits.length >= bowlDef.capacity - 3 ? '#B45309' : '#3B2314';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${bowlBits.length}/${bowlDef.capacity}`, Math.round(bowlX), badgeY + 10);
      }

      // Departing full bowls gliding away cleanly
      for (const db of departingBowls) {
        const alpha = Math.max(0, db.life / db.maxLife);
        drawServingBowl(
          db.x,
          db.y,
          0.92,
          db.shape,
          db.rimColor,
          db.innerColor,
          db.depthColor,
          db.accentColor,
          db.bits,
          alpha
        );
      }

      // 6. Active Ingredients (Top-Down View with Soft Ground Shadow)
      for (const it of items) {
        const sprite = getIngredientSprite(it.def.id);
        const bobX = Math.sin(it.bobPhase) * 1.5;
        const largeIds = new Set([
          'semangka',
          'iga',
          'steak',
          'labu',
          'durian',
          'nanas',
          'kubis',
          'kepiting',
          'tuna',
        ]);
        const drawSize = largeIds.has(it.def.id) ? 66 : 58;

        ctx.save();
        ctx.translate(Math.round(it.x + bobX), Math.round(it.y));
        ctx.scale(it.scaleX, it.scaleY);

        // Top-down soft offset shadow beneath ingredient
        ctx.fillStyle = 'rgba(59, 35, 20, 0.24)';
        ctx.fillRect(-drawSize * 0.36 + 5, -drawSize * 0.32 + 6, drawSize * 0.72, drawSize * 0.72);

        // Golden Chili glow
        if (it.def.isGoldenChili) {
          ctx.fillStyle = 'rgba(255, 214, 10, 0.45)';
          ctx.fillRect(-drawSize * 0.55, -drawSize * 0.55, drawSize * 1.1, drawSize * 1.1);
        }

        // Hazard warning telegraph
        if (it.def.isHazard) {
          const pulse = Math.sin(ambientTime * 16) > 0;
          ctx.fillStyle = pulse ? '#EF4444' : '#F97316';
          ctx.fillRect(-14, -drawSize * 0.72, 28, 20);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 14px Silkscreen, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('!', 0, -drawSize * 0.72 + 15);
        }

        // Draw crisp pixel sprite
        if (it.flashTimer > 0) {
          ctx.filter = 'brightness(2.2) contrast(1.1)';
        }
        ctx.drawImage(sprite, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
        ctx.filter = 'none';

        // Crisp segmented HP bar under multi-slice items (not on title demo)
        if (!isTitle && !it.def.isHazard && it.hp < it.maxHp) {
          const barW = 46;
          const pct = Math.max(0, it.hp / it.maxHp);
          ctx.fillStyle = '#3B2314';
          ctx.fillRect(-barW / 2 - 2, drawSize * 0.48, barW + 4, 10);
          ctx.fillStyle = '#4B3621';
          ctx.fillRect(-barW / 2, drawSize * 0.48 + 2, barW, 6);
          ctx.fillStyle = '#22C55E';
          ctx.fillRect(-barW / 2, drawSize * 0.48 + 2, Math.round(barW * pct), 6);
        }

        ctx.restore();
      }

      // 7. Flying Cross-Section Slices (Top-Down with Z-Height Shadow & Scale)
      for (const s of slices) {
        const zScale = 1 + Math.max(0, s.z) * 0.004;
        // Shadow on board/counter
        ctx.fillStyle = 'rgba(59, 35, 20, 0.22)';
        ctx.fillRect(Math.round(s.x - 8), Math.round(s.y - 6), 16, 12);

        ctx.save();
        ctx.translate(Math.round(s.x), Math.round(s.y - s.z * 0.35));
        ctx.scale(zScale, zScale);
        ctx.rotate(s.rot);
        ctx.drawImage(s.sprite, -s.size / 2, -s.size / 2, s.size, s.size);
        ctx.restore();
      }

      // 8. Slash Trails & Expanding Pixel Impact Rings
      for (const sl of slashes) {
        const alpha = sl.life / sl.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = sl.color;
        const h = sl.isPerfect ? 148 : 112;
        ctx.fillRect(Math.round(sl.x - 4), Math.round(sl.y - h * 0.5), 8, h);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(Math.round(sl.x - 1), Math.round(sl.y - h * 0.42), 2, h * 0.84);
        ctx.restore();
      }

      for (const ir of impactRings) {
        const alpha = Math.max(0, ir.life / ir.maxLife);
        const half = Math.round(ir.size / 2);
        ctx.save();
        ctx.globalAlpha = alpha * 0.85;
        ctx.strokeStyle = ir.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(Math.round(ir.x - half), Math.round(ir.y - half), ir.size, ir.size);
        ctx.restore();
      }

      // 8b. Fluid Motion-Tracked Knife Slice Trails (subtle swept arc behind active blades)
      const renderMotionTrail = (nodes: KnifeTrailNode[], baseOpacity: number, edgeWidth: number) => {
        if (nodes.length < 2) return;
        for (let i = 1; i < nodes.length; i++) {
          const prev = nodes[i - 1];
          const curr = nodes[i];
          if (prev.swingId !== curr.swingId) continue;

          const ageRatio = Math.max(0, Math.min(prev.life, curr.life) / curr.maxLife);
          const ribbonAlpha = (curr.isBoosted ? baseOpacity * 1.35 : baseOpacity) * ageRatio;

          // Subtle tapered ribbon connecting blade tip & heel
          ctx.save();
          ctx.globalAlpha = ribbonAlpha;
          ctx.fillStyle = curr.color;
          ctx.beginPath();
          ctx.moveTo(prev.tipX, prev.tipY);
          ctx.lineTo(curr.tipX, curr.tipY);
          ctx.lineTo(curr.heelX, curr.heelY);
          ctx.lineTo(prev.heelX, prev.heelY);
          ctx.closePath();
          ctx.fill();

          // Crisp thin tip streak for fluid motion readability
          ctx.globalAlpha = Math.min(0.65, ribbonAlpha * 2.1);
          ctx.strokeStyle = curr.edgeColor;
          ctx.lineWidth = edgeWidth * (0.4 + 0.6 * ageRatio);
          ctx.lineCap = 'square';
          ctx.beginPath();
          ctx.moveTo(prev.tipX, prev.tipY);
          ctx.lineTo(curr.tipX, curr.tipY);
          ctx.stroke();

          // Subtle pixel-art micro glint near the fastest tip segments
          if (i === nodes.length - 1 && ageRatio > 0.55) {
            ctx.globalAlpha = ageRatio * 0.55;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(Math.round(curr.tipX - 1), Math.round(curr.tipY - 1), 3, 3);
          }
          ctx.restore();
        }
      };

      renderMotionTrail(knifeTrails, 0.24, 2.5);
      renderMotionTrail(sousTrails, 0.16, 1.8);

      // 9. Top-Down Player Knife Sprite (Poised below Cut Line, Sweeping Across on Chop)
      const knifeSprite = getKnifeSprite(knife);
      const {
        chopPress,
        elevation: knifeElevation,
        scale: knifeScale,
        x: knifeX,
        y: knifeY,
        angle: knifeAngle,
      } = getPlayerKnifePose(cutLineX, centerY, knifeAnimProgress, ambientTime);

      // Dynamic knife shadow on the cutting board
      ctx.save();
      ctx.translate(knifeX + 4 + knifeElevation * 0.5, knifeY + 6 + knifeElevation * 0.5);
      ctx.rotate(knifeAngle);
      ctx.globalAlpha = 0.22;
      ctx.filter = 'brightness(0)';
      ctx.drawImage(knifeSprite, -48, -18, 96, 48);
      ctx.restore();

      // Main Knife Body
      ctx.save();
      ctx.translate(knifeX, knifeY - knifeElevation * 0.25);
      ctx.rotate(knifeAngle);
      ctx.scale(knifeScale, knifeScale);
      ctx.drawImage(knifeSprite, -48, -18, 96, 48);
      ctx.restore();

      // 10. Top-Down Sous-Chef Mini Cleaver (when unlocked)
      if (!isTitle && save.upgrades.sousChefLevel > 0) {
        const sousPose = getSousKnifePose(cutLineX, boardY, sousKnifeAnim, ambientTime);
        const sousChop = sousPose.chopPress;
        const sousElev = sousPose.elevation;
        const sousX = sousPose.x;
        const sousY = sousPose.y;
        ctx.save();
        ctx.translate(sousX + 4, sousY + 6);
        ctx.rotate(sousPose.angle);
        ctx.globalAlpha = 0.2;
        ctx.filter = 'brightness(0)';
        ctx.drawImage(knifeSprite, -28, -12, 56, 28);
        ctx.restore();

        ctx.save();
        ctx.translate(sousX, sousY - sousElev * 0.25);
        ctx.rotate(sousPose.angle);
        ctx.scale(1.04 - sousChop * 0.12, 1.04 - sousChop * 0.12);
        ctx.drawImage(knifeSprite, -28, -12, 56, 28);
        ctx.restore();
      }

      // 11. Top-Down Pixel Particles (Chunks, Juicy Droplets & Sparks with Z-Elevation)
      for (const p of particles) {
        const lifeRatio = Math.max(0.15, p.life / p.maxLife);
        const px = Math.round(p.x);
        const py = Math.round(p.y - p.z * 0.35);

        if (p.z > 2 && p.kind !== 'spark') {
          ctx.fillStyle = 'rgba(59, 35, 20, 0.18)';
          ctx.fillRect(px - 2, Math.round(p.y) - 1, 4, 3);
        }

        if (p.kind === 'spark') {
          const arm = Math.max(2, Math.round(p.size * lifeRatio));
          ctx.fillStyle = p.color;
          ctx.fillRect(px - arm, py - 1, arm * 2, 2);
          ctx.fillRect(px - 1, py - arm, 2, arm * 2);
        } else if (p.kind === 'droplet') {
          const sz = Math.max(3, Math.round(p.size * (0.6 + lifeRatio * 0.4)));
          ctx.fillStyle = p.color;
          ctx.fillRect(px - Math.floor(sz / 2), py - Math.floor(sz / 2), sz, sz);
        } else {
          const sz = Math.max(4, Math.round(p.size * (0.65 + lifeRatio * 0.35)));
          const half = Math.floor(sz / 2);
          if (p.outlined) {
            ctx.fillStyle = '#3B2314';
            ctx.fillRect(px - half - 1, py - half - 1, sz + 2, sz + 2);
          }
          ctx.fillStyle = p.color;
          ctx.fillRect(px - half, py - half, sz, sz);
        }
      }

      // 11b. Ambient Pixel Cooking Steam Puffs
      for (const st of steamPuffs) {
        const alpha = Math.min(0.42, (st.life / st.maxLife) * 0.65);
        const sz = Math.round(st.size);
        const half = Math.floor(sz / 2);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FFFFFF';
        // Stepped pixel puff shape
        ctx.fillRect(Math.round(st.x - half), Math.round(st.y - half + 2), sz, sz - 4);
        ctx.fillRect(Math.round(st.x - half + 2), Math.round(st.y - half), sz - 4, sz);
        ctx.restore();
      }

      // 11c. Gentle Breeze Wind Streaks & Drifting Dried Pixel Leaves Passing Over the Board
      for (const ws of windStreaks) {
        const alpha = Math.min(0.45, (ws.life / ws.maxLife) * 0.7);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(Math.round(ws.x), Math.round(ws.y), ws.length, 2);
        ctx.fillRect(Math.round(ws.x + 10), Math.round(ws.y + 4), Math.round(ws.length * 0.55), 2);
        ctx.restore();
      }

      for (const lf of ambientLeaves) {
        if (zone.id === 'dapur_api') {
          // Glowing rising volcanic ember & ash speck
          ctx.save();
          ctx.globalAlpha = 0.85;
          ctx.fillStyle = lf.color;
          ctx.fillRect(Math.round(lf.x - 3), Math.round(lf.y - 3), 6, 6);
          ctx.fillStyle = '#FEF08A';
          ctx.fillRect(Math.round(lf.x - 1), Math.round(lf.y - 1), 2, 2);
          ctx.restore();
          continue;
        }

        // Soft ground shadow beneath drifting leaf/petal for top-down elevation
        ctx.fillStyle = 'rgba(59, 35, 20, 0.14)';
        ctx.fillRect(Math.round(lf.x + 8), Math.round(lf.y + 12), 8, 6);

        ctx.save();
        ctx.translate(Math.round(lf.x), Math.round(lf.y));
        ctx.rotate(lf.rot);
        ctx.scale(lf.scale, lf.scale);
        if (zone.id === 'bistro_sakura') {
          // Delicate notched sakura blossom petal
          ctx.fillStyle = lf.stemColor;
          ctx.fillRect(-4, -3, 8, 6);
          ctx.fillStyle = lf.color;
          ctx.fillRect(-3, -2, 6, 4);
          ctx.fillStyle = '#FFF5FA';
          ctx.fillRect(-1, -1, 2, 2);
        } else if (zone.id === 'istana_emas') {
          // Royal shimmering gold leaf diamond
          ctx.fillStyle = '#3B2314';
          ctx.fillRect(-4, -4, 8, 8);
          ctx.fillStyle = lf.color;
          ctx.fillRect(-3, -3, 6, 6);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(-1, -1, 2, 2);
        } else {
          // Crisp 2px-pixel stepped dried leaf sprite
          ctx.fillStyle = '#3B2314';
          ctx.fillRect(-5, -3, 10, 6);
          ctx.fillStyle = lf.color;
          ctx.fillRect(-4, -2, 8, 4);
          ctx.fillRect(-2, -4, 4, 8);
          ctx.fillStyle = lf.stemColor;
          ctx.fillRect(-6, -1, 4, 2);
        }
        ctx.restore();
      }

      // 12. Floating Pixel Damage & Combo Labels with Crisp 4-Way Outline
      for (const l of labels) {
        const alpha = Math.min(1, (l.life / l.maxLife) * 1.5);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.textAlign = 'center';
        const fontSize = Math.round(16 * l.scale);
        ctx.font = `700 ${fontSize}px Silkscreen, monospace`;
        const lx = Math.round(l.x);
        const ly = Math.round(l.y);
        // Crisp 4-way dark pixel outline for high readability against any tile theme
        ctx.fillStyle = '#3B2314';
        ctx.fillText(l.text, lx - 2, ly);
        ctx.fillText(l.text, lx + 2, ly);
        ctx.fillText(l.text, lx, ly - 2);
        ctx.fillText(l.text, lx, ly + 2);
        ctx.fillStyle = l.color;
        ctx.fillText(l.text, lx, ly);
        if (l.subText) {
          ctx.font = '700 11px Silkscreen, monospace';
          ctx.fillStyle = '#3B2314';
          ctx.fillText(l.subText, lx - 1, ly + 16);
          ctx.fillText(l.subText, lx + 1, ly + 16);
          ctx.fillText(l.subText, lx, ly + 17);
          ctx.fillStyle = '#FACC15';
          ctx.fillText(l.subText, lx, ly + 16);
        }
        ctx.restore();
      }

      // Fever mode vibrant pixel border flash + corner accents
      if (feverActive) {
        const pulseStep = Math.floor(ambientTime * 10) % 2 === 0;
        const borderPulse = pulseStep ? '#FF006E' : '#FACC15';
        ctx.strokeStyle = borderPulse;
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, width - 8, height - 8);
        ctx.fillStyle = pulseStep ? '#FACC15' : '#FF006E';
        ctx.fillRect(8, 8, 12, 12);
        ctx.fillRect(width - 20, 8, 12, 12);
        ctx.fillRect(8, height - 20, 12, 12);
        ctx.fillRect(width - 20, height - 20, 12, 12);
      }

      ctx.restore();
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onWindowBlur);
    };
  }, [saveRef, triggerExternalActionRef]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-crosshair pixelated touch-manipulation"
        aria-label="Arena Talenan Raja Talenan"
      />
    </div>
  );
};
