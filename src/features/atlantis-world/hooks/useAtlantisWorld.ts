import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAtlantisSystem } from '@/hooks/useAtlantisSystem';
import { 
  PlayerProfile, 
  PlayerResources, 
  Building, 
  Troop, 
  Quest, 
  GameEvent,
  BuildingType,
  TroopType
} from '../types/game';
import { 
  BUILDING_CONFIGS, 
  TROOP_CONFIGS, 
  GAME_FORMULAS, 
  LEVEL_POWER_BONUSES 
} from '../config/gameConfig';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'atlantis_world_player';

export const useAtlantisWorld = () => {
  const atlantisSystem = useAtlantisSystem();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [quests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // تحميل بيانات اللاعب
  useEffect(() => {
    loadPlayerData();
  }, [atlantisSystem.userLevel]);

  const loadPlayerData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      // محاولة تحميل من localStorage أولاً
      const savedData = localStorage.getItem(STORAGE_KEY);
      
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.userId === user.id) {
          setPlayer(parsed);
          setIsLoading(false);
          return;
        }
      }

      // إنشاء لاعب جديد
      const newPlayer = createNewPlayer(user.id, atlantisSystem.userLevel);
      setPlayer(newPlayer);
      savePlayerData(newPlayer);
      
    } catch (error) {
      console.error('Error loading player data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [atlantisSystem.userLevel]);

  const createNewPlayer = (userId: string, userLevel: any): PlayerProfile => {
    const level = userLevel?.current_level || 'bronze';
    const points = userLevel?.total_points || 0;
    const powerBonus = LEVEL_POWER_BONUSES[level] || 1;

    return {
      id: `player_${userId}`,
      userId,
      name: 'مملكة جديدة',
      avatar: '👑',
      level: 1,
      experience: 0,
      power: Math.floor(100 * powerBonus),
      kingdom: 'أتلانتس',
      position: { x: Math.floor(Math.random() * 100), y: Math.floor(Math.random() * 100) },
      resources: {
        gold: 1000 + GAME_FORMULAS.pointsToGold(points),
        wood: 500 + GAME_FORMULAS.pointsToResources(points),
        stone: 300 + GAME_FORMULAS.pointsToResources(points),
        food: 800 + GAME_FORMULAS.pointsToResources(points),
        gems: 10,
        atlantisPoints: points
      },
      stats: {
        totalBattles: 0,
        wins: 0,
        losses: 0,
        kills: 0,
        resourcesGathered: 0,
        buildingsBuilt: 1,
        troopsTrained: 0
      },
      buildings: [
        {
          id: 'castle_1',
          type: 'castle',
          level: 1,
          position: { x: 50, y: 50 },
          isUpgrading: false,
          productionRate: 0
        }
      ],
      troops: [],
      createdAt: new Date(),
      lastOnline: new Date()
    };
  };

  const savePlayerData = useCallback((data: PlayerProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  // تحديث الموارد بناءً على نقاط أتلانتس
  useEffect(() => {
    if (player && atlantisSystem.userLevel) {
      const points = atlantisSystem.userLevel.total_points || 0;
      if (points !== player.resources.atlantisPoints) {
        const diff = points - player.resources.atlantisPoints;
        if (diff > 0) {
          const newResources = {
            ...player.resources,
            gold: player.resources.gold + GAME_FORMULAS.pointsToGold(diff),
            atlantisPoints: points
          };
          updatePlayer({ resources: newResources });
          addEvent('resource', `حصلت على ${GAME_FORMULAS.pointsToGold(diff)} ذهب من نقاط أتلانتس!`);
        }
      }
    }
  }, [atlantisSystem.userLevel?.total_points]);

  // تحديث إنتاج الموارد كل دقيقة
  useEffect(() => {
    const interval = setInterval(() => {
      if (player) {
        updateResourceProduction();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [player]);

  const updateResourceProduction = useCallback(() => {
    if (!player) return;

    let goldProduction = 0;
    let woodProduction = 0;
    let stoneProduction = 0;
    let foodProduction = 0;

    player.buildings.forEach(building => {
      if (building.isUpgrading) return;
      
      const config = BUILDING_CONFIGS[building.type];
      if (!config) return;

      const rate = GAME_FORMULAS.productionRate(
        config.baseProductionRate,
        building.level,
        config.upgradeMultiplier
      );

      switch (building.type) {
        case 'goldmine':
          goldProduction += rate;
          break;
        case 'lumbermill':
          woodProduction += rate;
          break;
        case 'quarry':
          stoneProduction += rate;
          break;
        case 'farm':
          foodProduction += rate;
          break;
      }
    });

    const newResources = {
      ...player.resources,
      gold: player.resources.gold + goldProduction,
      wood: player.resources.wood + woodProduction,
      stone: player.resources.stone + stoneProduction,
      food: player.resources.food + foodProduction
    };

    updatePlayer({ resources: newResources });
    setLastUpdate(Date.now());
  }, [player]);

  const updatePlayer = useCallback((updates: Partial<PlayerProfile>) => {
    setPlayer(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      savePlayerData(updated);
      return updated;
    });
  }, [savePlayerData]);

  const addEvent = useCallback((type: GameEvent['type'], message: string, data?: any) => {
    const event: GameEvent = {
      id: `event_${Date.now()}`,
      type,
      message,
      timestamp: new Date(),
      data
    };
    setEvents(prev => [event, ...prev].slice(0, 50));
  }, []);

  // بناء مبنى جديد
  const buildBuilding = useCallback((type: BuildingType) => {
    if (!player) return { success: false, message: 'اللاعب غير موجود' };

    const config = BUILDING_CONFIGS[type];
    if (!config) return { success: false, message: 'نوع المبنى غير صالح' };

    // التحقق من الموارد
    if (player.resources.gold < config.baseCost.gold ||
        player.resources.wood < config.baseCost.wood ||
        player.resources.stone < config.baseCost.stone) {
      return { success: false, message: 'موارد غير كافية' };
    }

    // خصم الموارد
    const newResources = {
      ...player.resources,
      gold: player.resources.gold - config.baseCost.gold,
      wood: player.resources.wood - config.baseCost.wood,
      stone: player.resources.stone - config.baseCost.stone
    };

    // إضافة المبنى
    const newBuilding: Building = {
      id: `${type}_${Date.now()}`,
      type,
      level: 1,
      position: { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 },
      isUpgrading: false,
      productionRate: config.baseProductionRate
    };

    const newBuildings = [...player.buildings, newBuilding];
    const newPower = GAME_FORMULAS.calculatePower(
      player.level,
      newBuildings.length,
      player.troops.reduce((sum, t) => sum + t.count, 0)
    );

    updatePlayer({
      resources: newResources,
      buildings: newBuildings,
      power: newPower,
      stats: {
        ...player.stats,
        buildingsBuilt: player.stats.buildingsBuilt + 1
      }
    });

    addEvent('upgrade', `تم بناء ${config.nameAr} بنجاح!`);
    return { success: true, message: `تم بناء ${config.nameAr}` };
  }, [player, updatePlayer, addEvent]);

  // ترقية مبنى
  const upgradeBuilding = useCallback((buildingId: string) => {
    if (!player) return { success: false, message: 'اللاعب غير موجود' };

    const building = player.buildings.find(b => b.id === buildingId);
    if (!building) return { success: false, message: 'المبنى غير موجود' };

    const config = BUILDING_CONFIGS[building.type];
    if (!config) return { success: false, message: 'خطأ في إعدادات المبنى' };

    if (building.level >= config.maxLevel) {
      return { success: false, message: 'المبنى في أعلى مستوى' };
    }

    const cost = GAME_FORMULAS.upgradeCost(config.baseCost, building.level + 1, config.upgradeMultiplier);

    if (player.resources.gold < cost.gold ||
        player.resources.wood < cost.wood ||
        player.resources.stone < cost.stone) {
      return { success: false, message: 'موارد غير كافية للترقية' };
    }

    const newResources = {
      ...player.resources,
      gold: player.resources.gold - cost.gold,
      wood: player.resources.wood - cost.wood,
      stone: player.resources.stone - cost.stone
    };

    const newBuildings = player.buildings.map(b => {
      if (b.id === buildingId) {
        return {
          ...b,
          level: b.level + 1,
          productionRate: GAME_FORMULAS.productionRate(
            config.baseProductionRate,
            b.level + 1,
            config.upgradeMultiplier
          )
        };
      }
      return b;
    });

    updatePlayer({ resources: newResources, buildings: newBuildings });
    addEvent('upgrade', `تمت ترقية ${config.nameAr} إلى المستوى ${building.level + 1}!`);
    return { success: true, message: `تمت ترقية ${config.nameAr}` };
  }, [player, updatePlayer, addEvent]);

  // تدريب جنود
  const trainTroops = useCallback((type: TroopType, count: number) => {
    if (!player) return { success: false, message: 'اللاعب غير موجود' };

    const config = TROOP_CONFIGS[type];
    if (!config) return { success: false, message: 'نوع الجندي غير صالح' };

    const totalCost = {
      gold: config.cost.gold * count,
      wood: config.cost.wood * count,
      food: config.cost.food * count
    };

    if (player.resources.gold < totalCost.gold ||
        player.resources.wood < totalCost.wood ||
        player.resources.food < totalCost.food) {
      return { success: false, message: 'موارد غير كافية' };
    }

    const newResources = {
      ...player.resources,
      gold: player.resources.gold - totalCost.gold,
      wood: player.resources.wood - totalCost.wood,
      food: player.resources.food - totalCost.food
    };

    const existingTroop = player.troops.find(t => t.type === type);
    let newTroops: Troop[];

    if (existingTroop) {
      newTroops = player.troops.map(t => {
        if (t.type === type) {
          return { ...t, count: t.count + count };
        }
        return t;
      });
    } else {
      newTroops = [...player.troops, {
        id: `troop_${type}_${Date.now()}`,
        type,
        count,
        level: 1,
        isTraining: false
      }];
    }

    const newPower = GAME_FORMULAS.calculatePower(
      player.level,
      player.buildings.length,
      newTroops.reduce((sum, t) => sum + t.count, 0)
    );

    updatePlayer({
      resources: newResources,
      troops: newTroops,
      power: newPower,
      stats: {
        ...player.stats,
        troopsTrained: player.stats.troopsTrained + count
      }
    });

    addEvent('training', `تم تدريب ${count} ${config.nameAr}!`);
    return { success: true, message: `تم تدريب ${count} ${config.nameAr}` };
  }, [player, updatePlayer, addEvent]);

  // جمع الموارد يدوياً
  const collectResources = useCallback((resourceType: keyof PlayerResources, amount: number) => {
    if (!player) return;

    const newResources = {
      ...player.resources,
      [resourceType]: player.resources[resourceType] + amount
    };

    updatePlayer({
      resources: newResources,
      stats: {
        ...player.stats,
        resourcesGathered: player.stats.resourcesGathered + amount
      }
    });

    addEvent('resource', `تم جمع ${amount} ${resourceType}!`);
  }, [player, updatePlayer, addEvent]);

  // حساب القوة الإجمالية
  const totalPower = useMemo(() => {
    if (!player) return 0;
    
    const levelBonus = LEVEL_POWER_BONUSES[atlantisSystem.userLevel?.current_level || 'bronze'] || 1;
    return Math.floor(player.power * levelBonus);
  }, [player, atlantisSystem.userLevel]);

  return {
    player,
    events,
    quests,
    isLoading,
    lastUpdate,
    totalPower,
    atlantisSystem,
    buildBuilding,
    upgradeBuilding,
    trainTroops,
    collectResources,
    updatePlayer,
    addEvent
  };
};
