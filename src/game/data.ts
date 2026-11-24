import {
  BowlDef,
  CuttingBoardDef,
  IngredientDef,
  KitchenZoneDef,
  KnifeDef,
  OfflineEarningsSummary,
  SaveData,
  UpgradeState,
} from './types';

export const INGREDIENTS: IngredientDef[] = [
  // LEVEL 1-5: SAYUR & BUAH AWAL
  {
    id: 'wortel',
    name: 'Wortel Segar',
    category: 'sayur',
    tierRequired: 1,
    baseHp: 3,
    baseValue: 6,
    pixelColor: '#FF7A1A',
    juiceColor: '#FF9E44',
    particleColors: ['#FF7A1A', '#FFB347', '#D95300', '#2ECC40'],
  },
  {
    id: 'timun',
    name: 'Timun Hijau',
    category: 'sayur',
    tierRequired: 1,
    baseHp: 3,
    baseValue: 7,
    pixelColor: '#3DBE4E',
    juiceColor: '#A7F3A0',
    particleColors: ['#3DBE4E', '#7EE882', '#C5F7B8', '#1D7A2C'],
  },
  {
    id: 'kentang',
    name: 'Kentang Cokelat',
    category: 'sayur',
    tierRequired: 1,
    baseHp: 3,
    baseValue: 8,
    pixelColor: '#D4A359',
    juiceColor: '#F3D299',
    particleColors: ['#D4A359', '#F3D299', '#9E7030', '#FFF8E7'],
  },
  {
    id: 'tomat',
    name: 'Tomat Merah',
    category: 'sayur',
    tierRequired: 2,
    baseHp: 3,
    baseValue: 11,
    pixelColor: '#EF3E36',
    juiceColor: '#FF6F61',
    particleColors: ['#EF3E36', '#FF6F61', '#FFE066', '#2ECC40'],
    seedColor: '#FFE066',
  },
  {
    id: 'apel',
    name: 'Apel Fuji',
    category: 'buah',
    tierRequired: 3,
    baseHp: 4,
    baseValue: 15,
    pixelColor: '#E62E2D',
    juiceColor: '#FFF0C2',
    particleColors: ['#E62E2D', '#FF9E9E', '#FFF0C2', '#3DBE4E'],
  },
  {
    id: 'jagung',
    name: 'Jagung Manis',
    category: 'sayur',
    tierRequired: 4,
    baseHp: 4,
    baseValue: 20,
    pixelColor: '#FFD60A',
    juiceColor: '#FFF59D',
    particleColors: ['#FFD60A', '#FFF59D', '#D99B00', '#2ECC40'],
    seedColor: '#FFF59D',
  },
  {
    id: 'pisang',
    name: 'Pisang Mas',
    category: 'buah',
    tierRequired: 5,
    baseHp: 4,
    baseValue: 26,
    pixelColor: '#FFD60A',
    juiceColor: '#FFF7BA',
    particleColors: ['#FFD60A', '#FFF59D', '#FFF7BA', '#D9A400'],
  },
  {
    id: 'paprika',
    name: 'Paprika Kuning',
    category: 'sayur',
    tierRequired: 6,
    baseHp: 4,
    baseValue: 33,
    pixelColor: '#FFC914',
    juiceColor: '#FFE66D',
    particleColors: ['#FFC914', '#FFF07C', '#D99B00', '#2ECC40'],
  },
  {
    id: 'pir',
    name: 'Buah Pir Hijau',
    category: 'buah',
    tierRequired: 7,
    baseHp: 5,
    baseValue: 42,
    pixelColor: '#A3E635',
    juiceColor: '#ECFCCB',
    particleColors: ['#A3E635', '#ECFCCB', '#4D7C0F', '#7A4924'],
  },
  {
    id: 'bawang',
    name: 'Bawang Merah',
    category: 'sayur',
    tierRequired: 8,
    baseHp: 5,
    baseValue: 52,
    pixelColor: '#C026D3',
    juiceColor: '#F5D0FE',
    particleColors: ['#C026D3', '#F5D0FE', '#701A75', '#22C55E'],
  },
  {
    id: 'jeruk',
    name: 'Jeruk Sunkist',
    category: 'buah',
    tierRequired: 9,
    baseHp: 5,
    baseValue: 64,
    pixelColor: '#FF8C00',
    juiceColor: '#FFD166',
    particleColors: ['#FF8C00', '#FFD166', '#CC6200', '#FFE8A3'],
  },
  {
    id: 'jamur',
    name: 'Jamur Kancing',
    category: 'sayur',
    tierRequired: 10,
    baseHp: 5,
    baseValue: 78,
    pixelColor: '#F8F5EE',
    juiceColor: '#FFFFFF',
    particleColors: ['#F8F5EE', '#D6CBB8', '#A8967A', '#FFFFFF'],
  },
  {
    id: 'stroberi',
    name: 'Stroberi Manis',
    category: 'buah',
    tierRequired: 11,
    baseHp: 5,
    baseValue: 96,
    pixelColor: '#FF2A55',
    juiceColor: '#FF758F',
    particleColors: ['#FF2A55', '#FF8FA3', '#FFE066', '#2ECC40'],
    seedColor: '#FFE066',
  },
  {
    id: 'sosis',
    name: 'Sosis Panggang',
    category: 'daging',
    tierRequired: 12,
    baseHp: 6,
    baseValue: 118,
    pixelColor: '#D9483B',
    juiceColor: '#FF8A7A',
    particleColors: ['#D9483B', '#FF8A7A', '#8C2318', '#4A1812'],
  },
  {
    id: 'terong',
    name: 'Terong Ungu',
    category: 'sayur',
    tierRequired: 13,
    baseHp: 6,
    baseValue: 145,
    pixelColor: '#8B3DFF',
    juiceColor: '#E9D5FF',
    particleColors: ['#8B3DFF', '#C49BFF', '#E9D5FF', '#2ECC40'],
  },
  {
    id: 'anggur',
    name: 'Anggur Ungu',
    category: 'buah',
    tierRequired: 14,
    baseHp: 6,
    baseValue: 175,
    pixelColor: '#7E22CE',
    juiceColor: '#D8B4FE',
    particleColors: ['#7E22CE', '#D8B4FE', '#4C1D95', '#2ECC40'],
  },
  {
    id: 'bakso',
    name: 'Bakso Sapi Jumbo',
    category: 'daging',
    tierRequired: 15,
    baseHp: 7,
    baseValue: 210,
    pixelColor: '#9C5A3C',
    juiceColor: '#D49A79',
    particleColors: ['#9C5A3C', '#D49A79', '#5E2E1A', '#F59E0B'],
  },
  {
    id: 'brokoli',
    name: 'Brokoli Krispi',
    category: 'sayur',
    tierRequired: 16,
    baseHp: 7,
    baseValue: 255,
    pixelColor: '#1E9E49',
    juiceColor: '#6EE793',
    particleColors: ['#1E9E49', '#5CE682', '#11632D', '#88D47C'],
  },
  {
    id: 'kiwi',
    name: 'Kiwi Segar',
    category: 'buah',
    tierRequired: 17,
    baseHp: 7,
    baseValue: 305,
    pixelColor: '#84CC16',
    juiceColor: '#D9F99D',
    particleColors: ['#84CC16', '#D9F99D', '#855836', '#1E1B18'],
    seedColor: '#1E1B18',
  },
  {
    id: 'ayam',
    name: 'Paha Ayam Panggang',
    category: 'daging',
    tierRequired: 18,
    baseHp: 8,
    baseValue: 370,
    pixelColor: '#D97B38',
    juiceColor: '#F6BD60',
    particleColors: ['#D97B38', '#F6BD60', '#9E4715', '#FFF8EB'],
  },
  {
    id: 'kubis',
    name: 'Kubis Ungu',
    category: 'sayur',
    tierRequired: 19,
    baseHp: 8,
    baseValue: 440,
    pixelColor: '#9333EA',
    juiceColor: '#E9D5FF',
    particleColors: ['#9333EA', '#E9D5FF', '#581C87', '#C084FC'],
  },
  {
    id: 'mangga',
    name: 'Mangga Harum Manis',
    category: 'buah',
    tierRequired: 20,
    baseHp: 8,
    baseValue: 530,
    pixelColor: '#FFB703',
    juiceColor: '#FFF07C',
    particleColors: ['#FFB703', '#FFF07C', '#FB7185', '#2ECC40'],
  },
  {
    id: 'salmon',
    name: 'Fillet Salmon',
    category: 'daging',
    tierRequired: 21,
    baseHp: 9,
    baseValue: 640,
    pixelColor: '#FF6B4A',
    juiceColor: '#FFB5A7',
    particleColors: ['#FF6B4A', '#FFA69E', '#FFF3E6', '#D63E22'],
  },
  {
    id: 'labu',
    name: 'Labu Kuning',
    category: 'sayur',
    tierRequired: 22,
    baseHp: 10,
    baseValue: 770,
    pixelColor: '#FF7A1A',
    juiceColor: '#FFB347',
    particleColors: ['#FF7A1A', '#FFB347', '#C2410C', '#15803D'],
  },
  {
    id: 'semangka',
    name: 'Semangka Jumbo',
    category: 'buah',
    tierRequired: 23,
    baseHp: 10,
    baseValue: 920,
    pixelColor: '#FF3B5C',
    juiceColor: '#FF708D',
    particleColors: ['#FF3B5C', '#FF708D', '#2D9E3F', '#E9F5DB', '#2B1D14'],
    seedColor: '#2B1D14',
  },
  {
    id: 'udang',
    name: 'Udang Jumbo',
    category: 'daging',
    tierRequired: 24,
    baseHp: 10,
    baseValue: 1100,
    pixelColor: '#FF5C35',
    juiceColor: '#FFD6BA',
    particleColors: ['#FF5C35', '#FFAD99', '#FFF0E5', '#C83214'],
  },
  {
    id: 'alpukat',
    name: 'Alpukat Mentega',
    category: 'buah',
    tierRequired: 25,
    baseHp: 11,
    baseValue: 1320,
    pixelColor: '#A3E635',
    juiceColor: '#ECFCCB',
    particleColors: ['#15803D', '#A3E635', '#ECFCCB', '#78350F'],
    seedColor: '#78350F',
  },
  {
    id: 'cumi',
    name: 'Cumi Bakar',
    category: 'daging',
    tierRequired: 26,
    baseHp: 11,
    baseValue: 1580,
    pixelColor: '#FB7185',
    juiceColor: '#FECDD3',
    particleColors: ['#FB7185', '#FECDD3', '#FFF1F2', '#BE123C'],
  },
  {
    id: 'nanas',
    name: 'Nanas Tropis',
    category: 'buah',
    tierRequired: 27,
    baseHp: 12,
    baseValue: 1880,
    pixelColor: '#FFB703',
    juiceColor: '#FFE169',
    particleColors: ['#FFB703', '#FFE169', '#D97706', '#2ECC40'],
  },
  {
    id: 'bebek',
    name: 'Dada Bebek Asap',
    category: 'daging',
    tierRequired: 28,
    baseHp: 12,
    baseValue: 2250,
    pixelColor: '#B45309',
    juiceColor: '#DC2626',
    particleColors: ['#B45309', '#F59E0B', '#DC2626', '#78350F'],
  },
  {
    id: 'durian',
    name: 'Durian Monthong',
    category: 'buah',
    tierRequired: 29,
    baseHp: 13,
    baseValue: 2700,
    pixelColor: '#FDE047',
    juiceColor: '#FEF9C3',
    particleColors: ['#65A30D', '#FDE047', '#FEF9C3', '#3F6212'],
  },
  {
    id: 'tuna',
    name: 'Steak Tuna Segar',
    category: 'daging',
    tierRequired: 30,
    baseHp: 13,
    baseValue: 3250,
    pixelColor: '#E11D48',
    juiceColor: '#FDA4AF',
    particleColors: ['#E11D48', '#FDA4AF', '#FFE4E6', '#9F1239'],
  },
  {
    id: 'buahnaga',
    name: 'Buah Naga',
    category: 'buah',
    tierRequired: 31,
    baseHp: 14,
    baseValue: 3900,
    pixelColor: '#E01E7A',
    juiceColor: '#FF85B3',
    particleColors: ['#E01E7A', '#F8F9FA', '#1E1B18', '#70E000'],
    seedColor: '#1E1B18',
  },
  {
    id: 'kepiting',
    name: 'Capit Kepiting Raja',
    category: 'daging',
    tierRequired: 32,
    baseHp: 15,
    baseValue: 4700,
    pixelColor: '#EA580C',
    juiceColor: '#FFF7ED',
    particleColors: ['#EA580C', '#FDBA74', '#FFF7ED', '#9A3412'],
  },
  {
    id: 'steak',
    name: 'Steak Wagyu',
    category: 'daging',
    tierRequired: 33,
    baseHp: 16,
    baseValue: 5800,
    pixelColor: '#B8292F',
    juiceColor: '#E85D5D',
    particleColors: ['#B8292F', '#E85D5D', '#FFE8D6', '#7A161A'],
  },
  {
    id: 'iga',
    name: 'Iga Sapi Bakar',
    category: 'daging',
    tierRequired: 34,
    baseHp: 18,
    baseValue: 7400,
    pixelColor: '#8F2D22',
    juiceColor: '#D9534F',
    particleColors: ['#8F2D22', '#C94C3C', '#FFF5E1', '#59160F'],
  },

  // SPESIAL
  {
    id: 'cabai_emas',
    name: 'Cabai Demam Emas',
    category: 'spesial',
    tierRequired: 1,
    baseHp: 2,
    baseValue: 40,
    pixelColor: '#FFD60A',
    juiceColor: '#FF9E00',
    particleColors: ['#FFD60A', '#FFFDE7', '#FF9E00', '#2ECC40'],
    isGoldenChili: true,
  },
  {
    id: 'bom_gosong',
    name: 'Panci Bom Lada',
    category: 'spesial',
    tierRequired: 2,
    baseHp: 1,
    baseValue: 0,
    pixelColor: '#3B3B48',
    juiceColor: '#FF4500',
    particleColors: ['#FF4500', '#FFD60A', '#3E4152', '#71768F'],
    isHazard: true,
  },
];

export const KNIVES: KnifeDef[] = [
  {
    id: 'pisau_dapur',
    name: 'Pisau Dapur Klasik',
    description: 'Pisau baja ringan yang seimbang untuk pemula.',
    shape: 'chef',
    cost: 0,
    powerMultiplier: 1,
    perfectBonus: 0,
    critChance: 0.05,
    bladeColor: '#DCE4EC',
    edgeColor: '#FFFFFF',
    handleColor: '#8B4E24',
    accentColor: '#94A3B8',
    slashColor: '#FFFFFF',
  },
  {
    id: 'pisau_buah',
    name: 'Pisau Kupas Buah',
    description: 'Ramping dan gesit! +15% kecepatan ayun & 12% Kritis.',
    shape: 'dagger',
    cost: 95,
    powerMultiplier: 1.35,
    perfectBonus: 8,
    critChance: 0.12,
    speedBonus: 0.15,
    bladeColor: '#E2E8F0',
    edgeColor: '#FFFFFF',
    handleColor: '#16A34A',
    accentColor: '#4ADE80',
    slashColor: '#86EFAC',
  },
  {
    id: 'pisau_santoku',
    name: 'Santoku Tajam',
    description: 'Bilah cekung Jepang anti lengket. Zona presisi +12px.',
    shape: 'santoku',
    cost: 280,
    powerMultiplier: 1.8,
    perfectBonus: 12,
    critChance: 0.1,
    bladeColor: '#B8D4E8',
    edgeColor: '#F0F9FF',
    handleColor: '#2B2D42',
    accentColor: '#64748B',
    slashColor: '#7DD3FC',
  },
  {
    id: 'pisau_roti',
    name: 'Pisau Gerigi Baja',
    description: 'Mata gergaji tajam yang menyobek kulit keras & nanas.',
    shape: 'serrated',
    cost: 750,
    powerMultiplier: 2.4,
    perfectBonus: 8,
    critChance: 0.15,
    bladeColor: '#CBD5E1',
    edgeColor: '#FEF3C7',
    handleColor: '#D97706',
    accentColor: '#F59E0B',
    slashColor: '#FDE68A',
  },
  {
    id: 'pisau_nakiri',
    name: 'Nakiri Sayur Bambu',
    description: 'Bilah kotak khas Jepang untuk irisan sayur ekstra lebar.',
    shape: 'nakiri',
    cost: 1650,
    powerMultiplier: 3.0,
    perfectBonus: 20,
    critChance: 0.11,
    bladeColor: '#D1FAE5',
    edgeColor: '#FFFFFF',
    handleColor: '#65A30D',
    accentColor: '#10B981',
    slashColor: '#6EE7B7',
  },
  {
    id: 'golok_baja',
    name: 'Golok Daging Berat',
    description: 'Mengiris daging & tulang tebal dengan mudah. 4.0x daya!',
    shape: 'cleaver',
    cost: 3600,
    powerMultiplier: 4.0,
    perfectBonus: 12,
    critChance: 0.16,
    bladeColor: '#94A3B8',
    edgeColor: '#F8FAFC',
    handleColor: '#B45309',
    accentColor: '#475569',
    slashColor: '#FBBF24',
  },
  {
    id: 'pisau_fillet',
    name: 'Pisau Fillet Lengkung',
    description: 'Bilah fleksibel pemotong salmon & udang. +20% kecepatan!',
    shape: 'dagger',
    cost: 7800,
    powerMultiplier: 5.2,
    perfectBonus: 18,
    critChance: 0.24,
    speedBonus: 0.2,
    bladeColor: '#BAE6FD',
    edgeColor: '#FFFFFF',
    handleColor: '#0284C7',
    accentColor: '#38BDF8',
    slashColor: '#38BDF8',
  },
  {
    id: 'kapak_dapur',
    name: 'Kapak Daging Tanduk',
    description: 'Kapak besi tempa raksasa penghancur iga & steak keras.',
    shape: 'cleaver',
    cost: 16500,
    powerMultiplier: 7.2,
    perfectBonus: 14,
    critChance: 0.22,
    bladeColor: '#78716C',
    edgeColor: '#E7E5E4',
    handleColor: '#7C2D12',
    accentColor: '#EA580C',
    slashColor: '#FB923C',
  },
  {
    id: 'katana_sakura',
    name: 'Katana Koki Sakura',
    description: 'Sabetan secepat kilat. 30% Kritis, +15% cepat & 9.5x daya!',
    shape: 'katana',
    cost: 34000,
    powerMultiplier: 9.5,
    perfectBonus: 22,
    critChance: 0.3,
    speedBonus: 0.15,
    bladeColor: '#FBCFE8',
    edgeColor: '#FFF1F2',
    handleColor: '#9D174D',
    accentColor: '#F472B6',
    slashColor: '#F472B6',
  },
  {
    id: 'pisau_bulan',
    name: 'Bilah Bulan Sabit',
    description: 'Bentuk sabit kembar dengan zona presisi luas +30px.',
    shape: 'mezzaluna',
    cost: 68000,
    powerMultiplier: 13.0,
    perfectBonus: 30,
    critChance: 0.28,
    bladeColor: '#E9D5FF',
    edgeColor: '#FAF5FF',
    handleColor: '#581C87',
    accentColor: '#A855F7',
    slashColor: '#C084FC',
  },
  {
    id: 'pisau_obsidian',
    name: 'Bilah Obsidian Lava',
    description: 'Kaca vulkanik menyala! 38% peluang Kritis mematikan.',
    shape: 'obsidian',
    cost: 140000,
    powerMultiplier: 18.0,
    perfectBonus: 24,
    critChance: 0.38,
    bladeColor: '#312E81',
    edgeColor: '#FF6B35',
    handleColor: '#1E1B4B',
    accentColor: '#F97316',
    slashColor: '#FB7185',
  },
  {
    id: 'bilah_berlian',
    name: 'Bilah Berlian Kristal',
    description: 'Ketajaman mutlak! 25x daya potong & zona sempurna +34px.',
    shape: 'crystal',
    cost: 290000,
    powerMultiplier: 25.0,
    perfectBonus: 34,
    critChance: 0.36,
    speedBonus: 0.15,
    bladeColor: '#67E8F9',
    edgeColor: '#ECFEFF',
    handleColor: '#0E7490',
    accentColor: '#A5F3FC',
    slashColor: '#22D3EE',
  },
  {
    id: 'pisau_plasma',
    name: 'Pisau Plasma Siber',
    description: 'Bilah energi termal berkecepatan tinggi (+25% cepat)!',
    shape: 'plasma',
    cost: 620000,
    powerMultiplier: 36.0,
    perfectBonus: 38,
    critChance: 0.42,
    speedBonus: 0.25,
    bladeColor: '#0F172A',
    edgeColor: '#4ADE80',
    handleColor: '#334155',
    accentColor: '#22C55E',
    slashColor: '#4ADE80',
  },
  {
    id: 'pedang_emas',
    name: 'Golok Naga Emas',
    description: 'Senjata legendaris Raja Talenan. 55x daya & 50% Kritis!',
    shape: 'dragon',
    cost: 1450000,
    powerMultiplier: 55.0,
    perfectBonus: 44,
    critChance: 0.5,
    speedBonus: 0.25,
    bladeColor: '#FDE047',
    edgeColor: '#FEF9C3',
    handleColor: '#991B1B',
    accentColor: '#F59E0B',
    slashColor: '#FACC15',
  },
];

export const KITCHEN_ZONES: KitchenZoneDef[] = [
  {
    id: 'dapur_rumah',
    name: 'Dapur Rumah Hangat',
    subtitle: 'Talenan kayu ek klasik dengan suasana dapur rumahan yang cerah.',
    reqLevel: 1,
    reqScore: 0,
    reqPerfectSlices: 0,
    unlockCost: 0,
    hardnessMultiplier: 1.0,
    coinMultiplier: 1.0,
    xpMultiplier: 1.0,
    theme: {
      tileA: '#F5E8D0',
      tileB: '#FFF8EC',
      grout: '#E7D4B5',
      feverTileA: '#FFE8C2',
      feverTileB: '#FFF4DE',
      feverGrout: '#F5D099',
      boardWood: '#E6B17A',
      boardGroove: '#C88A4B',
      boardGrain: '#D99E64',
      boardHandle: '#D49A60',
      beltColor: '#4B5563',
      railColor: '#9CA3AF',
      clothColor: '#EF4444',
      potBroth: '#F59E0B',
      potBubble: '#FDE68A',
      leafPalettes: [
        { leaf: '#D97706', stem: '#78350F' },
        { leaf: '#E09F3E', stem: '#92400E' },
        { leaf: '#C86D3B', stem: '#7C2D12' },
        { leaf: '#65A30D', stem: '#3F6212' },
      ],
    },
  },
  {
    id: 'kedai_pasar',
    name: 'Kedai Pasar Segar',
    subtitle: 'Meja bambu segar dengan bahan padat khas pasar pagi.',
    reqLevel: 6,
    reqScore: 6000,
    reqPerfectSlices: 25,
    unlockCost: 1200,
    hardnessMultiplier: 1.45,
    coinMultiplier: 1.5,
    xpMultiplier: 1.2,
    theme: {
      tileA: '#DDF2E4',
      tileB: '#F2FCF5',
      grout: '#B8DEC6',
      feverTileA: '#CCF7DC',
      feverTileB: '#ECFFF2',
      feverGrout: '#86EFAC',
      boardWood: '#D8CF7A',
      boardGroove: '#A69D42',
      boardGrain: '#C4BA62',
      boardHandle: '#C4BA62',
      beltColor: '#3F5246',
      railColor: '#86A392',
      clothColor: '#16A34A',
      potBroth: '#EA580C',
      potBubble: '#FDBA74',
      leafPalettes: [
        { leaf: '#22C55E', stem: '#14532D' },
        { leaf: '#84CC16', stem: '#3F6212' },
        { leaf: '#EAB308', stem: '#854D0E' },
      ],
    },
  },
  {
    id: 'bistro_sakura',
    name: 'Bistro Sushi Sakura',
    subtitle: 'Talenan hinoki presisi tinggi dengan kelopak bunga sakura.',
    reqLevel: 12,
    reqScore: 65000,
    reqPerfectSlices: 80,
    unlockCost: 12000,
    hardnessMultiplier: 2.2,
    coinMultiplier: 2.2,
    xpMultiplier: 1.4,
    theme: {
      tileA: '#ECE5F0',
      tileB: '#FAF7FC',
      grout: '#D4C5DF',
      feverTileA: '#FCE7F3',
      feverTileB: '#FFF5FA',
      feverGrout: '#F9A8D4',
      boardWood: '#F2DCBA',
      boardGroove: '#CFA976',
      boardGrain: '#E5C99E',
      boardHandle: '#E2C393',
      beltColor: '#3D354B',
      railColor: '#A78BFA',
      clothColor: '#EC4899',
      potBroth: '#F43F5E',
      potBubble: '#FDA4AF',
      leafPalettes: [
        { leaf: '#F9A8D4', stem: '#DB2777' },
        { leaf: '#FBCFE8', stem: '#BE185D' },
        { leaf: '#F472B6', stem: '#9D174D' },
      ],
    },
  },
  {
    id: 'dapur_api',
    name: 'Dapur Wajan Berapi',
    subtitle: 'Meja batu vulkanik tangguh untuk daging tebal & panggangan.',
    reqLevel: 20,
    reqScore: 650000,
    reqPerfectSlices: 200,
    unlockCost: 95000,
    hardnessMultiplier: 3.4,
    coinMultiplier: 3.5,
    xpMultiplier: 1.7,
    theme: {
      tileA: '#3A2C2A',
      tileB: '#4A3936',
      grout: '#241917',
      feverTileA: '#5C261D',
      feverTileB: '#733124',
      feverGrout: '#F97316',
      boardWood: '#A8663B',
      boardGroove: '#6E3C1B',
      boardGrain: '#8C4E27',
      boardHandle: '#91522B',
      beltColor: '#27272A',
      railColor: '#F97316',
      clothColor: '#EA580C',
      potBroth: '#EF4444',
      potBubble: '#FACC15',
      leafPalettes: [
        { leaf: '#FF6B35', stem: '#9A3412' },
        { leaf: '#FACC15', stem: '#B45309' },
        { leaf: '#FB7185', stem: '#9F1239' },
      ],
    },
  },
  {
    id: 'istana_emas',
    name: 'Istana Koki Kerajaan',
    subtitle: 'Dapur marmer emas tersulit khusus sang Legenda Raja Talenan!',
    reqLevel: 28,
    reqScore: 6000000,
    reqPerfectSlices: 450,
    unlockCost: 750000,
    hardnessMultiplier: 5.2,
    coinMultiplier: 5.5,
    xpMultiplier: 2.2,
    theme: {
      tileA: '#F5E7B8',
      tileB: '#FFF9E6',
      grout: '#D4AF37',
      feverTileA: '#FDE68A',
      feverTileB: '#FEF9C3',
      feverGrout: '#F59E0B',
      boardWood: '#B55B38',
      boardGroove: '#FACC15',
      boardGrain: '#964425',
      boardHandle: '#EAB308',
      beltColor: '#312E81',
      railColor: '#FACC15',
      clothColor: '#7C3AED',
      potBroth: '#F59E0B',
      potBubble: '#FEF08A',
      leafPalettes: [
        { leaf: '#FACC15', stem: '#B45309' },
        { leaf: '#FDE047', stem: '#CA8A04' },
        { leaf: '#C084FC', stem: '#6B21A8' },
      ],
    },
  },
];

export const CUTTING_BOARDS: CuttingBoardDef[] = [
  // ERA TRADISIONAL
  {
    id: 'talenan_ek',
    name: 'Talenan Ek Klasik',
    description: 'Tradisional: Kayu ek hangat yang kokoh untuk latihan harian.',
    cost: 0,
    style: 'oak',
    woodColor: '#E6B17A',
    grooveColor: '#C88A4B',
    grainColor: '#D99E64',
    handleColor: '#D49A60',
    pegColor: '#9E622B',
    coinMultiplier: 1.0,
    xpMultiplier: 1.0,
    perfectBonus: 0,
  },
  {
    id: 'talenan_anyaman',
    name: 'Talenan Anyaman Rotan',
    description: 'Tradisional: Pinggiran anyaman rotan desa. +8% Koin & +6% XP.',
    cost: 180,
    style: 'woven',
    woodColor: '#DDB878',
    grooveColor: '#8C5A2B',
    grainColor: '#BA8B4E',
    handleColor: '#A6723B',
    pegColor: '#6E421B',
    coinMultiplier: 1.08,
    xpMultiplier: 1.06,
    perfectBonus: 2,
  },
  {
    id: 'talenan_bambu',
    name: 'Talenan Bambu Hijau',
    description: 'Tradisional: Bilah bambu berlapis ringan. +18% Koin & +12% XP.',
    cost: 520,
    style: 'bamboo',
    woodColor: '#E4DA7E',
    grooveColor: '#8B9A3A',
    grainColor: '#C9BF60',
    handleColor: '#A3B847',
    pegColor: '#4D7C0F',
    coinMultiplier: 1.18,
    xpMultiplier: 1.12,
    perfectBonus: 5,
  },
  {
    id: 'talenan_batu_cobek',
    name: 'Talenan Batu Andesit',
    description: 'Tradisional: Batu gunung pahat ala cobek berat. +28% Koin.',
    cost: 1400,
    style: 'basalt',
    woodColor: '#7A7E85',
    grooveColor: '#4B4F57',
    grainColor: '#63676E',
    handleColor: '#585C63',
    pegColor: '#373A40',
    coinMultiplier: 1.28,
    xpMultiplier: 1.18,
    perfectBonus: 7,
  },

  // ERA KLASIK & BANGSAWAN
  {
    id: 'talenan_marmer',
    name: 'Talenan Marmer Sejuk',
    description: 'Klasik: Batu marmer halus berurat! +42% Koin & presisi +10px.',
    cost: 3600,
    style: 'marble',
    woodColor: '#F1F5F9',
    grooveColor: '#94A3B8',
    grainColor: '#CBD5E1',
    handleColor: '#E2E8F0',
    pegColor: '#475569',
    coinMultiplier: 1.42,
    xpMultiplier: 1.25,
    perfectBonus: 10,
  },
  {
    id: 'talenan_sakura',
    name: 'Talenan Hinoki Sakura',
    description: 'Klasik: Kayu hinoki wangi dengan ukiran sakura. +65% Koin!',
    cost: 12000,
    style: 'sakura',
    woodColor: '#F9DEC9',
    grooveColor: '#DB2777',
    grainColor: '#EBC2A4',
    handleColor: '#F472B6',
    pegColor: '#BE185D',
    coinMultiplier: 1.65,
    xpMultiplier: 1.35,
    perfectBonus: 14,
  },
  {
    id: 'talenan_batik_ukir',
    name: 'Talenan Jati Ukir Batik',
    description: 'Keraton: Kayu jati gelap berukir motif emas. +90% Koin!',
    cost: 36000,
    style: 'carved_teak',
    woodColor: '#6B3E26',
    grooveColor: '#D97706',
    grainColor: '#522D1A',
    handleColor: '#92400E',
    pegColor: '#FACC15',
    coinMultiplier: 1.9,
    xpMultiplier: 1.48,
    perfectBonus: 17,
  },
  {
    id: 'talenan_obsidian',
    name: 'Talenan Batu Magma',
    description: 'Vulkanik: Obsidian retak berpendar lava. 2.2x Koin & +20px.',
    cost: 88000,
    style: 'obsidian',
    woodColor: '#312E42',
    grooveColor: '#F97316',
    grainColor: '#1E1B29',
    handleColor: '#4B4563',
    pegColor: '#FB7185',
    coinMultiplier: 2.2,
    xpMultiplier: 1.6,
    perfectBonus: 20,
  },
  {
    id: 'talenan_emas',
    name: 'Talenan Emas Maharaja',
    description: 'Kerajaan: Bertahta emas & rubi! 2.65x Koin, +80% XP & +24px.',
    cost: 220000,
    style: 'royal_gold',
    woodColor: '#D97706',
    grooveColor: '#FEF08A',
    grainColor: '#B45309',
    handleColor: '#FACC15',
    pegColor: '#E11D48',
    coinMultiplier: 2.65,
    xpMultiplier: 1.8,
    perfectBonus: 24,
  },

  // ERA MODERN & FUTURISTIK
  {
    id: 'talenan_karbon',
    name: 'Talenan Karbon Titanium',
    description: 'Modern: Serat karbon anti-gores & sensor LED biru. 3.2x Koin!',
    cost: 520000,
    style: 'carbon_tech',
    woodColor: '#27272A',
    grooveColor: '#38BDF8',
    grainColor: '#3F3F46',
    handleColor: '#94A3B8',
    pegColor: '#38BDF8',
    coinMultiplier: 3.2,
    xpMultiplier: 2.0,
    perfectBonus: 28,
  },
  {
    id: 'talenan_laser',
    name: 'Meja Potong Grid Siber',
    description: 'Futuristik: Panel sirkuit neon dengan panduan laser presisi! 4.0x Koin.',
    cost: 1200000,
    style: 'cyber_grid',
    woodColor: '#0F172A',
    grooveColor: '#22D3EE',
    grainColor: '#1E293B',
    handleColor: '#0E7490',
    pegColor: '#EC4899',
    coinMultiplier: 4.0,
    xpMultiplier: 2.25,
    perfectBonus: 33,
  },
  {
    id: 'talenan_kuantum',
    name: 'Talenan Holo-Kuantum',
    description: 'Sci-Fi: Medan energi cahaya keras anti-gravitasi! 5.2x Koin & +40px.',
    cost: 2800000,
    style: 'quantum_holo',
    woodColor: '#1E1B4B',
    grooveColor: '#A855F7',
    grainColor: '#312E81',
    handleColor: '#4F46E5',
    pegColor: '#4ADE80',
    coinMultiplier: 5.2,
    xpMultiplier: 2.6,
    perfectBonus: 40,
  },
];

export const BOWLS: BowlDef[] = [
  {
    id: 'mangkuk_keramik',
    name: 'Mangkuk Keramik Ceria',
    description: 'Mangkuk keramik bulat warna-warni standar dapur.',
    cost: 0,
    shape: 'round',
    outerColor: '#38BDF8',
    innerColor: '#FFFFFF',
    depthColor: '#E2E8F0',
    accentColor: '#FFFFFF',
    rotatingRim: true,
    capacity: 16,
    fullBonusRatio: 0.35,
  },
  {
    id: 'mangkuk_bambu',
    name: 'Kotak Bento Bambu',
    description: 'Wadah anyaman bambu muat 18 iris · Bonus penuh +50%!',
    cost: 380,
    shape: 'square_bamboo',
    outerColor: '#D97706',
    innerColor: '#FEF3C7',
    depthColor: '#FDE68A',
    accentColor: '#65A30D',
    capacity: 18,
    fullBonusRatio: 0.5,
  },
  {
    id: 'mangkuk_laker',
    name: 'Mangkuk Laker Hitam',
    description: 'Mangkuk pernis merah-emas muat 20 iris · Bonus +70%!',
    cost: 2200,
    shape: 'lacquer',
    outerColor: '#1F2937',
    innerColor: '#B91C1C',
    depthColor: '#7F1D1D',
    accentColor: '#F59E0B',
    capacity: 20,
    fullBonusRatio: 0.7,
  },
  {
    id: 'mangkuk_giok',
    name: 'Mangkuk Giok Zamrud',
    description: 'Ukiran batu giok segi delapan · 22 iris & bonus +95%!',
    cost: 14000,
    shape: 'jade',
    outerColor: '#10B981',
    innerColor: '#ECFDF5',
    depthColor: '#A7F3D0',
    accentColor: '#047857',
    capacity: 22,
    fullBonusRatio: 0.95,
  },
  {
    id: 'mangkuk_kristal',
    name: 'Mangkuk Kristal Es',
    description: 'Wadah berlian berkilau · 24 iris & bonus penuh +125%!',
    cost: 72000,
    shape: 'crystal',
    outerColor: '#0284C7',
    innerColor: '#ECFEFF',
    depthColor: '#BAE6FD',
    accentColor: '#FFFFFF',
    capacity: 24,
    fullBonusRatio: 1.25,
  },
  {
    id: 'mangkuk_emas',
    name: 'Cawan Emas Kerajaan',
    description: 'Cawan berkuping emas & rubi · 26 iris & bonus +165%!',
    cost: 360000,
    shape: 'royal_chalice',
    outerColor: '#FACC15',
    innerColor: '#FFFBEB',
    depthColor: '#FDE68A',
    accentColor: '#E11D48',
    capacity: 26,
    fullBonusRatio: 1.65,
  },
];

export const DEFAULT_UPGRADES: UpgradeState = {
  sharpnessLevel: 1,
  speedLevel: 1,
  precisionLevel: 1,
  menuLevel: 1,
  sousChefLevel: 0,
};

export const DEFAULT_SAVE: SaveData = {
  coins: 0,
  totalScore: 0,
  playerLevel: 1,
  levelXp: 0,
  lifetimeSlices: 0,
  perfectSlices: 0,
  bestCombo: 0,
  prestigeStars: 0,
  activeZoneId: 'dapur_rumah',
  unlockedZones: ['dapur_rumah'],
  equippedKnifeId: 'pisau_dapur',
  unlockedKnives: ['pisau_dapur'],
  equippedBoardId: 'talenan_ek',
  unlockedBoards: ['talenan_ek'],
  equippedBowlId: 'mangkuk_keramik',
  unlockedBowls: ['mangkuk_keramik'],
  upgrades: { ...DEFAULT_UPGRADES },
  slicedByIngredient: {},
  muted: false,
  lastSavedAt: Date.now(),
};

export const PRESTIGE_SCORE_THRESHOLD = 250000;

export function getUpgradeCost(
  type: keyof UpgradeState,
  level: number
): number {
  switch (type) {
    case 'sharpnessLevel':
      return Math.floor(35 * Math.pow(1.48, level - 1));
    case 'speedLevel':
      return Math.floor(50 * Math.pow(1.54, level - 1));
    case 'precisionLevel':
      return Math.floor(65 * Math.pow(1.58, level - 1));
    case 'menuLevel':
      return Math.floor(90 * Math.pow(1.64, level - 1));
    case 'sousChefLevel':
      return Math.floor(240 * Math.pow(1.75, level));
  }
}

export function getXpForNextLevel(level: number): number {
  return Math.round(65 * Math.pow(1.24, level - 1));
}

export function getLevelDifficultyMultiplier(level: number): number {
  return 1 + (level - 1) * 0.35 + Math.pow(Math.max(0, level - 5), 1.4) * 0.14;
}

export function getKnifeById(id: string): KnifeDef {
  return KNIVES.find((k) => k.id === id) ?? KNIVES[0];
}

export function getCuttingBoardById(id: string): CuttingBoardDef {
  return CUTTING_BOARDS.find((b) => b.id === id) ?? CUTTING_BOARDS[0];
}

export function getBowlById(id: string): BowlDef {
  return BOWLS.find((b) => b.id === id) ?? BOWLS[0];
}

export function getKitchenZoneById(id: string): KitchenZoneDef {
  return KITCHEN_ZONES.find((z) => z.id === id) ?? KITCHEN_ZONES[0];
}

export function isZoneRequirementMet(zone: KitchenZoneDef, save: SaveData): boolean {
  return (
    save.playerLevel >= zone.reqLevel &&
    save.totalScore >= zone.reqScore &&
    save.perfectSlices >= zone.reqPerfectSlices
  );
}

export function isZoneReadyToOpen(zone: KitchenZoneDef, save: SaveData): boolean {
  return !save.unlockedZones.includes(zone.id) && isZoneRequirementMet(zone, save);
}

export function checkAndUnlockZones(save: SaveData): KitchenZoneDef[] {
  const newlyUnlocked: KitchenZoneDef[] = [];
  for (const zone of KITCHEN_ZONES) {
    if (
      !save.unlockedZones.includes(zone.id) &&
      zone.unlockCost === 0 &&
      isZoneRequirementMet(zone, save)
    ) {
      save.unlockedZones.push(zone.id);
      newlyUnlocked.push(zone);
    }
  }
  return newlyUnlocked;
}

export function getCutPower(upgrades: UpgradeState, knife: KnifeDef, prestigeStars: number): number {
  const base = 1 + (upgrades.sharpnessLevel - 1) * 0.55;
  const prestigeMult = 1 + prestigeStars * 0.25;
  return base * knife.powerMultiplier * prestigeMult;
}

export function getAutoChopRate(upgrades: UpgradeState, feverActive: boolean): number {
  // Chops per second from Sous-Chef
  const sousBase = upgrades.sousChefLevel > 0 ? 0.55 + (upgrades.sousChefLevel - 1) * 0.45 : 0;
  const speedBonus = 1 + (upgrades.speedLevel - 1) * 0.16;
  const rate = sousBase * speedBonus;
  return feverActive ? rate * 1.9 : rate;
}

export function getHoldChopRate(upgrades: UpgradeState, feverActive: boolean, knife?: KnifeDef): number {
  const base = (2.1 + (upgrades.speedLevel - 1) * 0.45) * (1 + (knife?.speedBonus ?? 0));
  return feverActive ? base * 1.7 : base;
}

export function getManualCooldown(upgrades: UpgradeState, knife?: KnifeDef): number {
  // Seconds between manual swings
  const raw = Math.max(0.065, 0.18 - (upgrades.speedLevel - 1) * 0.011);
  return Math.max(0.05, raw / (1 + (knife?.speedBonus ?? 0)));
}

export function getSweetSpotHalfWidth(
  upgrades: UpgradeState,
  knife: KnifeDef,
  playerLevel = 1,
  board?: CuttingBoardDef
): number {
  // Tighter window as level grows; requires Fokus Presisi & skilled timing
  const levelTighten = Math.min(10, (playerLevel - 1) * 0.65);
  return Math.max(
    11,
    Math.min(
      62,
      20 -
        levelTighten +
        (upgrades.precisionLevel - 1) * 2.5 +
        knife.perfectBonus * 0.3 +
        (board?.perfectBonus ?? 0) * 0.45
    )
  );
}

export function getMaxComboCap(upgrades: UpgradeState): number {
  return 10 + (upgrades.precisionLevel - 1) * 3;
}

export function getComboMultiplier(combo: number, upgrades: UpgradeState): number {
  const perStep = 0.15 + (upgrades.precisionLevel - 1) * 0.04;
  return 1 + Math.min(combo, getMaxComboCap(upgrades)) * perStep;
}

export function getUnlockedIngredients(playerLevel: number): IngredientDef[] {
  return INGREDIENTS.filter((ing) => !ing.isGoldenChili && !ing.isHazard && ing.tierRequired <= playerLevel);
}

export function getNextUnlockForLevel(
  playerLevel: number
): { id: string; name: string; level: number } | null {
  const next = INGREDIENTS.find(
    (ing) => !ing.isGoldenChili && !ing.isHazard && ing.tierRequired > playerLevel
  );
  if (!next) return null;
  return { id: next.id, name: next.name, level: next.tierRequired };
}

export function formatNumberID(num: number): string {
  const n = Math.floor(num);
  if (n < 1000) return n.toString();
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace('.', ',')}K`;
  if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(2).replace('.', ',')}M`;
  return `${(n / 1_000_000_000).toFixed(2).replace('.', ',')}B`;
}

export const OFFLINE_MAX_SECONDS = 8 * 60 * 60; // 8 hours cap

export function calculateOfflineEarnings(
  save: SaveData,
  nowMs: number = Date.now()
): OfflineEarningsSummary | null {
  if (!save.lastSavedAt || save.upgrades.sousChefLevel <= 0) return null;

  const rawElapsedSec = Math.floor((nowMs - save.lastSavedAt) / 1000);
  if (rawElapsedSec < 60) return null; // Require at least 1 minute away

  const elapsedSeconds = Math.min(OFFLINE_MAX_SECONDS, rawElapsedSec);
  const autoRate = getAutoChopRate(save.upgrades, false);
  if (autoRate <= 0) return null;

  const knife = getKnifeById(save.equippedKnifeId);
  const board = getCuttingBoardById(save.equippedBoardId);
  const zone = getKitchenZoneById(save.activeZoneId);
  const cutPower = getCutPower(save.upgrades, knife, save.prestigeStars);
  const diffMult = getLevelDifficultyMultiplier(save.playerLevel);

  const unlocked = getUnlockedIngredients(save.playerLevel);
  const pool = unlocked.length > 0 ? unlocked : [INGREDIENTS[0]];
  const avgHp =
    (pool.reduce((sum, ing) => sum + ing.baseHp, 0) / pool.length) *
    diffMult *
    zone.hardnessMultiplier;
  const avgVal = pool.reduce((sum, ing) => sum + ing.baseValue, 0) / pool.length;

  const sharpnessBonus = 1 + (save.upgrades.sharpnessLevel - 1) * 0.14;
  const prestigeMult = 1 + save.prestigeStars * 0.25;
  const chopsPerItem = Math.max(1, avgHp / Math.max(0.5, cutPower));
  const itemsPerSec = autoRate / chopsPerItem;

  // Offline Sous-Chef works steadily at 45% idle efficiency
  const estimatedSlices = Math.max(1, Math.floor(itemsPerSec * elapsedSeconds * 0.45));
  const coinPerItem =
    avgVal *
    sharpnessBonus *
    prestigeMult *
    zone.coinMultiplier *
    board.coinMultiplier;

  const earnedCoins = Math.max(5, Math.floor(estimatedSlices * coinPerItem));
  const earnedScore = Math.max(5, Math.floor(earnedCoins * 1.1));

  return {
    elapsedSeconds,
    earnedCoins,
    earnedScore,
    estimatedSlices,
  };
}

