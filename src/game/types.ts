export type GameScreen = 'TITLE_MENU' | 'PLAYING' | 'PAUSED';

export type IngredientCategory = 'sayur' | 'buah' | 'daging' | 'spesial';

export interface IngredientDef {
  id: string;
  name: string;
  category: IngredientCategory;
  tierRequired: number; // Unlocked at menu level >= tierRequired
  baseHp: number;
  baseValue: number;
  pixelColor: string;
  juiceColor: string;
  particleColors: string[];
  seedColor?: string;
  isGoldenChili?: boolean;
  isHazard?: boolean;
}

export type KnifeShape =
  | 'chef'
  | 'dagger'
  | 'santoku'
  | 'serrated'
  | 'nakiri'
  | 'cleaver'
  | 'katana'
  | 'mezzaluna'
  | 'obsidian'
  | 'crystal'
  | 'plasma'
  | 'dragon';

export interface KnifeDef {
  id: string;
  name: string;
  description: string;
  shape: KnifeShape;
  cost: number;
  powerMultiplier: number;
  perfectBonus: number; // Extra sweet-spot width px
  critChance: number; // 0..1
  speedBonus?: number; // Extra chop & swing speed ratio (e.g. 0.15 = +15%)
  bladeColor: string;
  edgeColor: string;
  handleColor: string;
  accentColor: string;
  slashColor: string;
}

export interface OrderQuest {
  id: string;
  ingredientId: string;
  ingredientName: string;
  targetSlices: number;
  currentSlices: number;
  rewardCoins: number;
}

export interface KitchenZoneTheme {
  tileA: string;
  tileB: string;
  grout: string;
  feverTileA: string;
  feverTileB: string;
  feverGrout: string;
  boardWood: string;
  boardGroove: string;
  boardGrain: string;
  boardHandle: string;
  beltColor: string;
  railColor: string;
  clothColor: string;
  potBroth: string;
  potBubble: string;
  leafPalettes: { leaf: string; stem: string }[];
}

export interface KitchenZoneDef {
  id: string;
  name: string;
  subtitle: string;
  reqLevel: number;
  reqScore: number;
  reqPerfectSlices: number;
  unlockCost: number;
  hardnessMultiplier: number;
  coinMultiplier: number;
  xpMultiplier: number;
  theme: KitchenZoneTheme;
}

export type CuttingBoardStyle =
  | 'oak'
  | 'woven'
  | 'bamboo'
  | 'basalt'
  | 'marble'
  | 'sakura'
  | 'carved_teak'
  | 'obsidian'
  | 'royal_gold'
  | 'carbon_tech'
  | 'cyber_grid'
  | 'quantum_holo';

export interface CuttingBoardDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  style: CuttingBoardStyle;
  woodColor: string;
  grooveColor: string;
  grainColor: string;
  handleColor: string;
  pegColor: string;
  coinMultiplier: number;
  xpMultiplier: number;
  perfectBonus: number;
}

export type BowlShape =
  | 'round'
  | 'square_bamboo'
  | 'lacquer'
  | 'jade'
  | 'crystal'
  | 'royal_chalice';

export interface BowlDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  shape: BowlShape;
  outerColor: string;
  innerColor: string;
  depthColor: string;
  accentColor: string;
  rotatingRim?: boolean;
  capacity: number;
  fullBonusRatio: number;
}

export interface UpgradeState {
  sharpnessLevel: number; // Increases base cut damage & slice value
  speedLevel: number; // Increases auto-chop speed & manual swing recovery
  precisionLevel: number; // Widens sweet spot & boosts combo multiplier
  menuLevel: number; // Unlocks higher-tier veggies, fruits, meats
  sousChefLevel: number; // Adds passive auto-chops per second
}

export interface OfflineEarningsSummary {
  elapsedSeconds: number;
  earnedCoins: number;
  earnedScore: number;
  estimatedSlices: number;
}

export interface SaveData {
  coins: number;
  totalScore: number;
  playerLevel: number;
  levelXp: number;
  lifetimeSlices: number;
  perfectSlices: number;
  bestCombo: number;
  prestigeStars: number;
  activeZoneId: string;
  unlockedZones: string[];
  equippedKnifeId: string;
  unlockedKnives: string[];
  equippedBoardId: string;
  unlockedBoards: string[];
  equippedBowlId: string;
  unlockedBowls: string[];
  upgrades: UpgradeState;
  slicedByIngredient: Record<string, number>;
  muted: boolean;
  lastSavedAt?: number;
}

export interface HudSnapshot {
  coins: number;
  totalScore: number;
  playerLevel: number;
  levelXp: number;
  levelXpMax: number;
  difficultyMult: number;
  perfectSlices: number;
  activeZoneId: string;
  unlockedZonesCount: number;
  nextUnlockIngredient: { id: string; name: string; level: number } | null;
  combo: number;
  comboMultiplier: number;
  bestCombo: number;
  feverProgress: number; // 0..100
  feverActive: boolean;
  feverTimeLeft: number; // seconds
  lastJudgment: {
    text: string;
    tier: 'perfect' | 'good' | 'normal' | 'crit' | 'hazard' | 'fever';
    id: number;
  } | null;
  activeOrder: OrderQuest | null;
  ordersCompleted: number;
  dpsEstimate: number;
  cutPower: number;
  autoRate: number;
  sweetSpotWidth: number;
  prestigeReady: boolean;
  prestigeRewardStars: number;
}
