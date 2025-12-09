// عالم أتلانتس - أنواع البيانات الأساسية

export interface PlayerProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  level: number;
  experience: number;
  power: number;
  kingdom: string;
  position: { x: number; y: number };
  resources: PlayerResources;
  stats: PlayerStats;
  buildings: Building[];
  troops: Troop[];
  allianceId?: string;
  createdAt: Date;
  lastOnline: Date;
}

export interface PlayerResources {
  gold: number;
  wood: number;
  stone: number;
  food: number;
  gems: number;
  atlantisPoints: number;
}

export interface PlayerStats {
  totalBattles: number;
  wins: number;
  losses: number;
  kills: number;
  resourcesGathered: number;
  buildingsBuilt: number;
  troopsTrained: number;
}

export interface Building {
  id: string;
  type: BuildingType;
  level: number;
  position: { x: number; y: number };
  isUpgrading: boolean;
  upgradeEndTime?: Date;
  productionRate: number;
}

export type BuildingType = 
  | 'castle' 
  | 'barracks' 
  | 'farm' 
  | 'lumbermill' 
  | 'quarry' 
  | 'goldmine' 
  | 'warehouse' 
  | 'wall' 
  | 'watchtower'
  | 'market'
  | 'academy';

export interface BuildingConfig {
  type: BuildingType;
  nameAr: string;
  nameEn: string;
  description: string;
  icon: string;
  maxLevel: number;
  baseCost: ResourceCost;
  baseProductionRate: number;
  upgradeMultiplier: number;
}

export interface ResourceCost {
  gold: number;
  wood: number;
  stone: number;
  food: number;
  time: number; // بالثواني
}

export interface Troop {
  id: string;
  type: TroopType;
  count: number;
  level: number;
  isTraining: boolean;
  trainingEndTime?: Date;
}

export type TroopType = 
  | 'warrior' 
  | 'archer' 
  | 'cavalry' 
  | 'siege' 
  | 'mage'
  | 'guardian';

export interface TroopConfig {
  type: TroopType;
  nameAr: string;
  nameEn: string;
  attack: number;
  defense: number;
  speed: number;
  capacity: number;
  cost: ResourceCost;
}

export interface MapTile {
  id: string;
  x: number;
  y: number;
  type: TileType;
  ownerId?: string;
  resourceAmount?: number;
  buildingId?: string;
}

export type TileType = 
  | 'empty' 
  | 'forest' 
  | 'mountain' 
  | 'lake' 
  | 'castle' 
  | 'village' 
  | 'ruins'
  | 'goldmine'
  | 'farm';

export interface Battle {
  id: string;
  attackerId: string;
  defenderId: string;
  attackerTroops: Troop[];
  defenderTroops: Troop[];
  result: 'attacker_win' | 'defender_win' | 'draw';
  loot: Partial<PlayerResources>;
  casualties: {
    attacker: number;
    defender: number;
  };
  timestamp: Date;
}

export interface Alliance {
  id: string;
  name: string;
  tag: string;
  description: string;
  leaderId: string;
  members: AllianceMember[];
  totalPower: number;
  territory: MapTile[];
  logo: string;
  level: number;
}

export interface AllianceMember {
  playerId: string;
  role: 'leader' | 'officer' | 'member';
  contribution: number;
  joinedAt: Date;
}

export interface Quest {
  id: string;
  type: 'daily' | 'weekly' | 'main' | 'alliance';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  progress: number;
  target: number;
  reward: Partial<PlayerResources>;
  isCompleted: boolean;
  expiresAt?: Date;
}

export interface GameEvent {
  id: string;
  type: 'battle' | 'upgrade' | 'training' | 'resource' | 'alliance' | 'quest';
  message: string;
  timestamp: Date;
  data?: any;
}
