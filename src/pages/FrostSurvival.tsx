import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  Flame,
  Home,
  Shield,
  TrendingUp,
  Zap,
  Sparkles,
  Map,
  LayoutGrid,
  Building2,
  Swords,
  Users,
  ArrowUp,
  Plus
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { useAtlantisSystem } from '@/hooks/useAtlantisSystem';

// ================= الإعدادات =================
const BUILDING_CONFIGS = {
  castle: { icon: '🏰', nameAr: 'القلعة', maxLevel: 30, baseCost: { wood: 0, coins: 0 } },
  barracks: { icon: '⚔️', nameAr: 'الثكنة', maxLevel: 25, baseCost: { wood: 200, coins: 500 } },
  farm: { icon: '🌾', nameAr: 'المزرعة', maxLevel: 25, baseCost: { wood: 150, coins: 100 } },
  lumbermill: { icon: '🪓', nameAr: 'المنشرة', maxLevel: 25, baseCost: { wood: 0, coins: 150 } },
  goldmine: { icon: '💰', nameAr: 'منجم الذهب', maxLevel: 25, baseCost: { wood: 200, coins: 0 } },
  wall: { icon: '🧱', nameAr: 'السور', maxLevel: 30, baseCost: { wood: 100, coins: 400 } },
};

const TROOP_CONFIGS = {
  warrior: { icon: '⚔️', nameAr: 'محارب', attack: 10, defense: 8, cost: { food: 10, coins: 50 } },
  archer: { icon: '🏹', nameAr: 'رامي', attack: 12, defense: 4, cost: { food: 10, coins: 60 } },
  cavalry: { icon: '🐴', nameAr: 'فارس', attack: 15, defense: 10, cost: { food: 20, coins: 100 } },
};

// ================= المكونات =================

// مكون الثلج المتساقط
const Snowfall = () => {
  const snowflakes = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
    size: 4 + Math.random() * 8,
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute text-white/60"
          style={{ left: `${flake.left}%`, fontSize: flake.size }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: '100vh', opacity: [0, 1, 1, 0], x: [0, 10, -10, 0] }}
          transition={{ duration: flake.duration, delay: flake.delay, repeat: Infinity, ease: 'linear' }}
        >
          ❄
        </motion.div>
      ))}
    </div>
  );
};

// شريط الموارد
const ResourcesBar = ({ resources }: { resources: any }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 gap-1">💰 {resources.coins}</Badge>
    <Badge variant="outline" className="bg-amber-600/20 text-amber-300 gap-1">🪵 {resources.wood}</Badge>
    <Badge variant="outline" className="bg-green-500/20 text-green-300 gap-1">🍖 {resources.food}</Badge>
    <Badge variant="outline" className="bg-purple-500/20 text-purple-300 gap-1">💎 {resources.gems}</Badge>
  </div>
);

// شريط الحرارة
const TemperatureBar = ({ value, onDanger }: { value: number; onDanger?: () => void }) => {
  useEffect(() => {
    if (value < 20 && onDanger) onDanger();
  }, [value, onDanger]);

  const getColor = () => value < 30 ? 'bg-blue-500' : value < 60 ? 'bg-yellow-500' : 'bg-orange-500';
  const status = value < 30 ? { text: 'خطر! 🥶', color: 'text-blue-300' } : 
                 value < 60 ? { text: 'حذر ⚠️', color: 'text-yellow-300' } : 
                 { text: 'دافئ 🔥', color: 'text-orange-300' };

  return (
    <Card className="bg-gradient-to-r from-amber-900/70 to-orange-900/50 backdrop-blur-sm border-orange-600/40 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <span className="text-white font-bold">الحرارة</span>
        </div>
        <span className={`font-bold ${status.color}`}>{status.text}</span>
      </div>
      <div className="relative h-4 bg-slate-700/80 rounded-full overflow-hidden border border-slate-500/30">
        <motion.div className={`h-full ${getColor()} rounded-full`} animate={{ width: `${value}%` }} />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">{value}%</span>
      </div>
    </Card>
  );
};

// بطاقة البروفايل
const PlayerProfileCard = ({ player, atlantisLevel }: { player: any; atlantisLevel: string }) => {
  const levelStyles: any = {
    bronze: { bg: 'bg-orange-500/30', text: 'text-orange-300', icon: '🥉' },
    silver: { bg: 'bg-gray-400/30', text: 'text-gray-200', icon: '🥈' },
    gold: { bg: 'bg-yellow-500/30', text: 'text-yellow-300', icon: '🥇' },
    legendary: { bg: 'bg-purple-500/30', text: 'text-purple-300', icon: '👑' }
  };
  const style = levelStyles[atlantisLevel] || levelStyles.bronze;

  return (
    <Card className="bg-amber-900/60 backdrop-blur-sm border-amber-600/40 p-4">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-16 h-16 rounded-xl ${style.bg} flex items-center justify-center text-3xl border border-white/20`}>
          {player.avatar}
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">{player.name}</h3>
          <Badge className={`${style.bg} ${style.text} border border-white/20`}>{style.icon} {atlantisLevel}</Badge>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-800/70 rounded-lg p-2 border border-slate-600/50">
          <Shield className="w-4 h-4 mx-auto text-red-400 mb-1" />
          <p className="text-white font-bold">{player.power}</p>
          <p className="text-xs text-slate-300">قوة</p>
        </div>
        <div className="bg-slate-800/70 rounded-lg p-2 border border-slate-600/50">
          <Building2 className="w-4 h-4 mx-auto text-yellow-400 mb-1" />
          <p className="text-white font-bold">{player.buildings}</p>
          <p className="text-xs text-slate-300">مباني</p>
        </div>
        <div className="bg-slate-800/70 rounded-lg p-2 border border-slate-600/50">
          <Swords className="w-4 h-4 mx-auto text-red-400 mb-1" />
          <p className="text-white font-bold">{player.troops}</p>
          <p className="text-xs text-slate-300">جنود</p>
        </div>
      </div>
    </Card>
  );
};

// لوحة المباني
const BuildingsPanel = ({ buildings, onBuild, onUpgrade }: any) => (
  <ScrollArea className="h-[350px]">
    <div className="space-y-3 pr-2">
      {buildings.map((building: any) => {
        const config = BUILDING_CONFIGS[building.type as keyof typeof BUILDING_CONFIGS];
        return (
          <motion.div
            key={building.id}
            className="p-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-2xl">
                {config?.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-bold">{config?.nameAr}</h4>
                  <Badge variant="secondary">مستوى {building.level}</Badge>
                </div>
                <Progress value={(building.level / 25) * 100} className="h-1.5 mt-2" />
              </div>
              <Button size="sm" onClick={() => onUpgrade(building.id)} className="gap-1">
                <ArrowUp className="w-3 h-3" /> ترقية
              </Button>
            </div>
          </motion.div>
        );
      })}
      
      <Button 
        variant="outline" 
        className="w-full border-dashed border-white/30 text-white hover:bg-white/10"
        onClick={() => onBuild('farm')}
      >
        <Plus className="w-4 h-4 ml-2" /> بناء مبنى جديد
      </Button>
    </div>
  </ScrollArea>
);

// لوحة الجيش
const TroopsPanel = ({ troops, onTrain }: any) => {
  const totalTroops = troops.reduce((s: number, t: any) => s + t.count, 0);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white/10 rounded-lg p-3">
          <Users className="w-5 h-5 mx-auto text-white mb-1" />
          <p className="text-white font-bold">{totalTroops}</p>
          <p className="text-xs text-gray-400">إجمالي</p>
        </div>
        <div className="bg-red-500/20 rounded-lg p-3">
          <Swords className="w-5 h-5 mx-auto text-red-400 mb-1" />
          <p className="text-white font-bold">{troops.reduce((s: number, t: any) => s + (TROOP_CONFIGS[t.type as keyof typeof TROOP_CONFIGS]?.attack || 0) * t.count, 0)}</p>
          <p className="text-xs text-gray-400">هجوم</p>
        </div>
        <div className="bg-blue-500/20 rounded-lg p-3">
          <Shield className="w-5 h-5 mx-auto text-blue-400 mb-1" />
          <p className="text-white font-bold">{troops.reduce((s: number, t: any) => s + (TROOP_CONFIGS[t.type as keyof typeof TROOP_CONFIGS]?.defense || 0) * t.count, 0)}</p>
          <p className="text-xs text-gray-400">دفاع</p>
        </div>
      </div>
      
      <ScrollArea className="h-[250px]">
        <div className="space-y-2">
          {troops.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Swords className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا يوجد جنود</p>
            </div>
          ) : troops.map((troop: any) => {
            const config = TROOP_CONFIGS[troop.type as keyof typeof TROOP_CONFIGS];
            return (
              <div key={troop.id} className="p-3 rounded-lg bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{config?.icon}</span>
                  <div>
                    <p className="text-white font-medium">{config?.nameAr}</p>
                    <p className="text-xs text-gray-400">⚔️{config?.attack} 🛡️{config?.defense}</p>
                  </div>
                </div>
                <Badge variant="secondary">×{troop.count}</Badge>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(TROOP_CONFIGS).map(([type, config]) => (
          <Button 
            key={type}
            size="sm" 
            variant="outline"
            className="text-white border-white/30"
            onClick={() => onTrain(type, 5)}
          >
            {config.icon} +5
          </Button>
        ))}
      </div>
    </div>
  );
};

// خريطة العالم
const WorldMap = ({ player, onTileClick }: any) => {
  const tiles = useMemo(() => {
    const t = [];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 10; x++) {
        const r = Math.random();
        t.push({
          id: `${x}_${y}`, x, y,
          type: r < 0.15 ? 'forest' : r < 0.25 ? 'mountain' : r < 0.30 ? 'goldmine' : 'empty'
        });
      }
    }
    return t;
  }, []);

  const icons: any = { forest: '🌲', mountain: '⛰️', goldmine: '💰', empty: null };
  const colors: any = { forest: 'bg-green-500/30', mountain: 'bg-stone-500/30', goldmine: 'bg-yellow-500/30', empty: 'bg-white/5' };

  return (
    <div className="grid grid-cols-10 gap-1">
      {tiles.map((tile) => (
        <motion.div
          key={tile.id}
          className={`aspect-square rounded ${colors[tile.type]} flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
          onClick={() => onTileClick?.(tile)}
          whileHover={{ scale: 1.1 }}
        >
          {tile.x === player.position.x && tile.y === player.position.y ? (
            <span className="text-lg">🏰</span>
          ) : icons[tile.type] ? (
            <span className="text-sm opacity-70">{icons[tile.type]}</span>
          ) : null}
        </motion.div>
      ))}
    </div>
  );
};

// المتصدرين
const MiniLeaderboard = ({ currentRank }: { currentRank: number }) => {
  const leaders = [
    { rank: 1, name: 'أحمد', points: 2450, avatar: '👨‍💼' },
    { rank: 2, name: 'سارة', points: 2180, avatar: '👩‍💼' },
    { rank: 3, name: 'خالد', points: 1920, avatar: '🧔' },
    { rank: currentRank, name: 'أنت', points: 1650, avatar: '😎', isYou: true },
  ];

  return (
    <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-600/50 p-4">
      <h3 className="text-white font-bold mb-3 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-400" />
        سباق القلعة
      </h3>
      <div className="space-y-2">
        {leaders.map((leader) => (
          <motion.div
            key={leader.rank}
            className={`flex items-center gap-2 p-2 rounded-lg ${leader.isYou ? 'bg-blue-600/40 border border-blue-400/50' : 'bg-slate-700/50'}`}
            whileHover={{ x: 5 }}
          >
            <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-black ${
              leader.rank === 1 ? 'bg-yellow-400' : leader.rank === 2 ? 'bg-gray-300' : leader.rank === 3 ? 'bg-orange-400' : 'bg-blue-400'
            }`}>{leader.rank}</span>
            <span className="text-xl">{leader.avatar}</span>
            <span className={`flex-1 text-sm font-medium ${leader.isYou ? 'text-blue-200' : 'text-white'}`}>{leader.name}</span>
            <span className="text-yellow-300 font-bold text-sm">{leader.points}</span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

// التحدي الأسبوعي
const WeeklyChallenge = ({ progress, target }: { progress: number; target: number }) => (
  <Card className="bg-gradient-to-br from-purple-900/60 to-blue-900/60 backdrop-blur-sm border-purple-500/30 p-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-white font-bold flex items-center gap-2">🌨️ العاصفة الأسبوعية</h3>
      <Badge className="bg-red-500/80">نشط</Badge>
    </div>
    <div className="bg-black/30 rounded-lg p-3 mb-3">
      <p className="text-white text-sm mb-2">🎯 اجمع الموارد قبل انتهاء العاصفة</p>
      <div className="flex items-center gap-2">
        <Progress value={(progress / target) * 100} className="flex-1" />
        <span className="text-white text-sm font-bold">{progress}/{target}</span>
      </div>
    </div>
    <div className="flex gap-2">
      <Badge variant="secondary">+50 🪵</Badge>
      <Badge variant="secondary">+30 🍖</Badge>
      <Badge variant="secondary">+100 💰</Badge>
    </div>
  </Card>
);

// ================= الصفحة الرئيسية =================
export default function AtlantisWorld() {
  const { toast: toastHook } = useToast();
  const atlantisSystem = useAtlantisSystem();
  const [activeView, setActiveView] = useState<'kingdom' | 'map'>('kingdom');
  const [temperature, setTemperature] = useState(72);
  const [challengeProgress, setChallengeProgress] = useState(9);
  
  // بيانات اللاعب
  const [player, setPlayer] = useState({
    name: 'مملكتي',
    avatar: '👑',
    level: 5,
    power: 1250,
    position: { x: 5, y: 4 },
    buildings: 4,
    troops: 25,
  });
  
  const [resources, setResources] = useState({
    coins: 1500,
    wood: 800,
    food: 600,
    gems: 15,
  });
  
  const [buildings, setBuildings] = useState([
    { id: 'castle_1', type: 'castle', level: 5 },
    { id: 'farm_1', type: 'farm', level: 3 },
    { id: 'lumbermill_1', type: 'lumbermill', level: 2 },
    { id: 'barracks_1', type: 'barracks', level: 2 },
  ]);
  
  const [troops, setTroops] = useState([
    { id: 'warrior_1', type: 'warrior', count: 15 },
    { id: 'archer_1', type: 'archer', count: 10 },
  ]);

  // تأثير انخفاض الحرارة
  useEffect(() => {
    const timer = setInterval(() => setTemperature(prev => Math.max(0, prev - 1)), 8000);
    return () => clearInterval(timer);
  }, []);

  // إجراءات اللعبة
  const handleLightFire = () => {
    if (resources.wood >= 10) {
      setResources(r => ({ ...r, wood: r.wood - 10 }));
      setTemperature(t => Math.min(100, t + 25));
      toast.success('+25 حرارة! 🔥');
      setChallengeProgress(p => p + 1);
    } else {
      toast.error('تحتاج 10 حطب');
    }
  };

  const handleBuildHouse = () => {
    if (resources.wood >= 50 && resources.coins >= 100) {
      setResources(r => ({ ...r, wood: r.wood - 50, coins: r.coins - 100 }));
      setPlayer(p => ({ ...p, buildings: p.buildings + 1 }));
      toast.success('بنيت بيتاً جديداً! 🏠');
    } else {
      toast.error('موارد غير كافية');
    }
  };

  const handleGatherResources = () => {
    const wood = Math.floor(Math.random() * 20) + 10;
    const food = Math.floor(Math.random() * 10) + 5;
    setResources(r => ({ ...r, wood: r.wood + wood, food: r.food + food }));
    setTemperature(t => Math.max(0, t - 5));
    toast.success(`+${wood} حطب، +${food} طعام`);
  };

  const handleBuild = (type: string) => {
    const config = BUILDING_CONFIGS[type as keyof typeof BUILDING_CONFIGS];
    if (!config) return;
    if (resources.wood >= config.baseCost.wood && resources.coins >= config.baseCost.coins) {
      setResources(r => ({ ...r, wood: r.wood - config.baseCost.wood, coins: r.coins - config.baseCost.coins }));
      setBuildings(b => [...b, { id: `${type}_${Date.now()}`, type, level: 1 }]);
      setPlayer(p => ({ ...p, buildings: p.buildings + 1, power: p.power + 50 }));
      toast.success(`تم بناء ${config.nameAr}`);
    } else {
      toast.error('موارد غير كافية');
    }
  };

  const handleUpgrade = (id: string) => {
    if (resources.coins >= 100) {
      setResources(r => ({ ...r, coins: r.coins - 100 }));
      setBuildings(b => b.map(building => building.id === id ? { ...building, level: building.level + 1 } : building));
      setPlayer(p => ({ ...p, power: p.power + 25 }));
      toast.success('تمت الترقية!');
    } else {
      toast.error('عملات غير كافية');
    }
  };

  const handleTrain = (type: string, count: number) => {
    const config = TROOP_CONFIGS[type as keyof typeof TROOP_CONFIGS];
    if (!config) return;
    const cost = { food: config.cost.food * count, coins: config.cost.coins * count };
    if (resources.food >= cost.food && resources.coins >= cost.coins) {
      setResources(r => ({ ...r, food: r.food - cost.food, coins: r.coins - cost.coins }));
      const existing = troops.find(t => t.type === type);
      if (existing) {
        setTroops(t => t.map(troop => troop.type === type ? { ...troop, count: troop.count + count } : troop));
      } else {
        setTroops(t => [...t, { id: `${type}_${Date.now()}`, type, count }]);
      }
      setPlayer(p => ({ ...p, troops: p.troops + count, power: p.power + count * 10 }));
      toast.success(`تم تدريب ${count} ${config.nameAr}`);
    } else {
      toast.error('موارد غير كافية');
    }
  };

  const atlantisLevel = atlantisSystem.userLevel?.current_level || 'bronze';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
      <Snowfall />
      
      {/* Header */}
      <header className="relative z-20 border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackRoute="/atlantis" />
              <div className="flex items-center gap-3">
                <motion.div className="text-4xl" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                  🌍
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-white">عالم أتلانتس</h1>
                  <p className="text-blue-300 text-sm">ابنِ مملكتك وحارب من أجل المجد</p>
                </div>
              </div>
            </div>
            <ResourcesBar resources={resources} />
          </div>
        </div>
      </header>

      {/* أزرار التبديل */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-2">
          <Button 
            variant={activeView === 'kingdom' ? 'default' : 'outline'} 
            onClick={() => setActiveView('kingdom')} 
            className={`gap-2 ${activeView === 'kingdom' ? 'bg-primary text-white' : 'bg-slate-800/80 text-white border-slate-500 hover:bg-slate-700'}`}
          >
            <LayoutGrid className="w-4 h-4" /> مملكتي
          </Button>
          <Button 
            variant={activeView === 'map' ? 'default' : 'outline'} 
            onClick={() => setActiveView('map')} 
            className={`gap-2 ${activeView === 'map' ? 'bg-primary text-white' : 'bg-slate-800/80 text-white border-slate-500 hover:bg-slate-700'}`}
          >
            <Map className="w-4 h-4" /> خريطة العالم
          </Button>
        </div>
      </div>

      {/* المحتوى */}
      <main className="relative z-20 container mx-auto px-4 pb-20">
        {activeView === 'map' ? (
          <Card className="bg-black/40 backdrop-blur-sm border-white/20 p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" /> خريطة العالم
            </h3>
            <WorldMap player={player} onTileClick={(tile: any) => toast.info(`الإحداثيات: ${tile.x}, ${tile.y}`)} />
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* الشريط الجانبي */}
            <div className="space-y-4">
              <PlayerProfileCard player={player} atlantisLevel={atlantisLevel} />
              <TemperatureBar value={temperature} onDanger={() => toastHook({ title: 'تحذير! 🥶', variant: 'destructive' })} />
              <WeeklyChallenge progress={challengeProgress} target={15} />
            </div>

            {/* المحتوى الرئيسي */}
            <div className="lg:col-span-2 space-y-4">
              <Tabs defaultValue="buildings">
                <TabsList className="w-full grid grid-cols-2 bg-black/40">
                  <TabsTrigger value="buildings" className="text-white data-[state=active]:bg-primary">
                    <Building2 className="w-4 h-4 ml-2" /> المباني
                  </TabsTrigger>
                  <TabsTrigger value="troops" className="text-white data-[state=active]:bg-primary">
                    <Swords className="w-4 h-4 ml-2" /> الجيش
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="buildings">
                  <Card className="bg-black/40 backdrop-blur-sm border-white/20 p-4">
                    <BuildingsPanel buildings={buildings} resources={resources} onBuild={handleBuild} onUpgrade={handleUpgrade} />
                  </Card>
                </TabsContent>
                <TabsContent value="troops">
                  <Card className="bg-black/40 backdrop-blur-sm border-white/20 p-4">
                    <TroopsPanel troops={troops} resources={resources} onTrain={handleTrain} />
                  </Card>
                </TabsContent>
              </Tabs>

              {/* أزرار الإجراءات */}
              <div className="grid grid-cols-3 gap-3">
                <Button onClick={handleLightFire} className="bg-orange-600 hover:bg-orange-700 h-14 gap-2" disabled={resources.wood < 10}>
                  <Flame className="w-5 h-5" />
                  <div className="text-right">
                    <div>أشعل النار</div>
                    <div className="text-xs opacity-75">-10 🪵</div>
                  </div>
                </Button>
                <Button onClick={handleBuildHouse} className="bg-green-600 hover:bg-green-700 h-14 gap-2" disabled={resources.wood < 50}>
                  <Home className="w-5 h-5" />
                  <div className="text-right">
                    <div>ابنِ بيت</div>
                    <div className="text-xs opacity-75">-50🪵 -100💰</div>
                  </div>
                </Button>
                <Button onClick={handleGatherResources} className="bg-cyan-600 hover:bg-cyan-700 h-14 gap-2">
                  <Zap className="w-5 h-5" />
                  <div className="text-right">
                    <div>اجمع موارد</div>
                    <div className="text-xs opacity-75">-5 حرارة</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* لوحة المتصدرين */}
            <div className="space-y-4">
              <MiniLeaderboard currentRank={4} />
              <Card className="bg-gradient-to-br from-yellow-900/40 to-amber-900/40 border-yellow-500/30 p-4">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" /> مكافآت القلعة
                </h3>
                <div className="space-y-2 text-sm text-white">
                  <p className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" /> ثيم ملكي حصري</p>
                  <p className="flex items-center gap-2">💰 +20% عمولة إضافية</p>
                  <p className="flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-400" /> تاج بجانب اسمك</p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* شريط سفلي */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-600/50 py-3 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6 text-white">
            <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-cyan-400" /> القوة: <strong className="text-cyan-300">{player.power}</strong></span>
            <span className="flex items-center gap-1"><Building2 className="w-4 h-4 text-yellow-400" /> المباني: <strong className="text-yellow-300">{buildings.length}</strong></span>
            <span className="flex items-center gap-1"><Swords className="w-4 h-4 text-red-400" /> الجنود: <strong className="text-red-300">{troops.reduce((s, t) => s + t.count, 0)}</strong></span>
          </div>
          <Badge className="bg-amber-500/30 text-amber-200 border border-amber-400/50">مرتبط بنظام نقاط أتلانتس</Badge>
        </div>
      </footer>
    </div>
  );
}
