import { BuildingConfig, TroopConfig, ResourceCost } from '../types/game';

// إعدادات المباني
export const BUILDING_CONFIGS: Record<string, BuildingConfig> = {
  castle: {
    type: 'castle',
    nameAr: 'القلعة',
    nameEn: 'Castle',
    description: 'المبنى الرئيسي - يحدد مستوى مملكتك',
    icon: '🏰',
    maxLevel: 30,
    baseCost: { gold: 0, wood: 0, stone: 0, food: 0, time: 0 },
    baseProductionRate: 0,
    upgradeMultiplier: 1.5
  },
  barracks: {
    type: 'barracks',
    nameAr: 'الثكنة',
    nameEn: 'Barracks',
    description: 'تدريب الجنود والمحاربين',
    icon: '⚔️',
    maxLevel: 25,
    baseCost: { gold: 500, wood: 200, stone: 100, food: 0, time: 300 },
    baseProductionRate: 1,
    upgradeMultiplier: 1.4
  },
  farm: {
    type: 'farm',
    nameAr: 'المزرعة',
    nameEn: 'Farm',
    description: 'إنتاج الطعام للجيش',
    icon: '🌾',
    maxLevel: 25,
    baseCost: { gold: 100, wood: 150, stone: 0, food: 0, time: 120 },
    baseProductionRate: 50,
    upgradeMultiplier: 1.3
  },
  lumbermill: {
    type: 'lumbermill',
    nameAr: 'المنشرة',
    nameEn: 'Lumber Mill',
    description: 'إنتاج الخشب للبناء',
    icon: '🪓',
    maxLevel: 25,
    baseCost: { gold: 150, wood: 0, stone: 100, food: 0, time: 120 },
    baseProductionRate: 40,
    upgradeMultiplier: 1.3
  },
  quarry: {
    type: 'quarry',
    nameAr: 'المحجر',
    nameEn: 'Quarry',
    description: 'استخراج الحجر للبناء',
    icon: '⛏️',
    maxLevel: 25,
    baseCost: { gold: 200, wood: 100, stone: 0, food: 0, time: 150 },
    baseProductionRate: 30,
    upgradeMultiplier: 1.3
  },
  goldmine: {
    type: 'goldmine',
    nameAr: 'منجم الذهب',
    nameEn: 'Gold Mine',
    description: 'استخراج الذهب',
    icon: '💰',
    maxLevel: 25,
    baseCost: { gold: 0, wood: 200, stone: 200, food: 0, time: 180 },
    baseProductionRate: 20,
    upgradeMultiplier: 1.35
  },
  warehouse: {
    type: 'warehouse',
    nameAr: 'المستودع',
    nameEn: 'Warehouse',
    description: 'تخزين الموارد وحمايتها',
    icon: '🏪',
    maxLevel: 25,
    baseCost: { gold: 300, wood: 250, stone: 150, food: 0, time: 200 },
    baseProductionRate: 0,
    upgradeMultiplier: 1.4
  },
  wall: {
    type: 'wall',
    nameAr: 'السور',
    nameEn: 'Wall',
    description: 'حماية المملكة من الهجمات',
    icon: '🧱',
    maxLevel: 30,
    baseCost: { gold: 400, wood: 100, stone: 300, food: 0, time: 250 },
    baseProductionRate: 0,
    upgradeMultiplier: 1.5
  },
  watchtower: {
    type: 'watchtower',
    nameAr: 'برج المراقبة',
    nameEn: 'Watchtower',
    description: 'كشف الأعداء والتجسس',
    icon: '🗼',
    maxLevel: 20,
    baseCost: { gold: 350, wood: 200, stone: 200, food: 0, time: 200 },
    baseProductionRate: 0,
    upgradeMultiplier: 1.4
  },
  market: {
    type: 'market',
    nameAr: 'السوق',
    nameEn: 'Market',
    description: 'تبادل الموارد مع اللاعبين',
    icon: '🏛️',
    maxLevel: 20,
    baseCost: { gold: 500, wood: 300, stone: 200, food: 0, time: 300 },
    baseProductionRate: 0,
    upgradeMultiplier: 1.4
  },
  academy: {
    type: 'academy',
    nameAr: 'الأكاديمية',
    nameEn: 'Academy',
    description: 'البحث والتطوير',
    icon: '📚',
    maxLevel: 25,
    baseCost: { gold: 600, wood: 400, stone: 300, food: 0, time: 400 },
    baseProductionRate: 0,
    upgradeMultiplier: 1.5
  }
};

// إعدادات الجنود
export const TROOP_CONFIGS: Record<string, TroopConfig> = {
  warrior: {
    type: 'warrior',
    nameAr: 'محارب',
    nameEn: 'Warrior',
    attack: 10,
    defense: 8,
    speed: 5,
    capacity: 20,
    cost: { gold: 50, wood: 20, stone: 0, food: 10, time: 30 }
  },
  archer: {
    type: 'archer',
    nameAr: 'رامي',
    nameEn: 'Archer',
    attack: 12,
    defense: 4,
    speed: 6,
    capacity: 15,
    cost: { gold: 60, wood: 30, stone: 0, food: 10, time: 35 }
  },
  cavalry: {
    type: 'cavalry',
    nameAr: 'فارس',
    nameEn: 'Cavalry',
    attack: 15,
    defense: 10,
    speed: 10,
    capacity: 30,
    cost: { gold: 100, wood: 40, stone: 0, food: 20, time: 60 }
  },
  siege: {
    type: 'siege',
    nameAr: 'آلة حصار',
    nameEn: 'Siege',
    attack: 25,
    defense: 5,
    speed: 2,
    capacity: 50,
    cost: { gold: 200, wood: 100, stone: 50, food: 30, time: 120 }
  },
  mage: {
    type: 'mage',
    nameAr: 'ساحر',
    nameEn: 'Mage',
    attack: 20,
    defense: 6,
    speed: 4,
    capacity: 10,
    cost: { gold: 150, wood: 0, stone: 50, food: 15, time: 90 }
  },
  guardian: {
    type: 'guardian',
    nameAr: 'حارس',
    nameEn: 'Guardian',
    attack: 8,
    defense: 20,
    speed: 3,
    capacity: 25,
    cost: { gold: 80, wood: 30, stone: 30, food: 15, time: 50 }
  }
};

// معادلات اللعبة
export const GAME_FORMULAS = {
  // تحويل نقاط أتلانتس إلى موارد
  pointsToGold: (points: number) => Math.floor(points * 10),
  pointsToResources: (points: number) => Math.floor(points * 5),
  
  // حساب القوة
  calculatePower: (level: number, buildings: number, troops: number) => {
    return (level * 100) + (buildings * 50) + (troops * 10);
  },
  
  // حساب المستوى من الخبرة
  experienceToLevel: (exp: number) => Math.floor(Math.sqrt(exp / 100)) + 1,
  levelToExperience: (level: number) => Math.pow(level - 1, 2) * 100,
  
  // مكافأة المبيعات
  saleToResources: (saleAmount: number) => ({
    gold: Math.floor(saleAmount * 2),
    gems: Math.floor(saleAmount / 100)
  }),
  
  // حساب تكلفة الترقية
  upgradeCost: (baseCost: ResourceCost, level: number, multiplier: number): ResourceCost => ({
    gold: Math.floor(baseCost.gold * Math.pow(multiplier, level - 1)),
    wood: Math.floor(baseCost.wood * Math.pow(multiplier, level - 1)),
    stone: Math.floor(baseCost.stone * Math.pow(multiplier, level - 1)),
    food: Math.floor(baseCost.food * Math.pow(multiplier, level - 1)),
    time: Math.floor(baseCost.time * Math.pow(1.2, level - 1))
  }),
  
  // حساب إنتاج الموارد
  productionRate: (baseRate: number, level: number, multiplier: number) => {
    return Math.floor(baseRate * Math.pow(multiplier, level - 1));
  }
};

// ربط المستويات بالقوة
export const LEVEL_POWER_BONUSES: Record<string, number> = {
  bronze: 1.0,
  silver: 1.5,
  gold: 2.0,
  legendary: 3.0
};
