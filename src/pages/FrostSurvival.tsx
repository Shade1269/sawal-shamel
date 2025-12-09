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

// شريط الموارد
const ResourcesBar = ({ resources }: { resources: any }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30 gap-1">💰 {resources.coins}</Badge>
    <Badge variant="outline" className="bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1">🪵 {resources.wood}</Badge>
    <Badge variant="outline" className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 gap-1">🍖 {resources.food}</Badge>
    <Badge variant="outline" className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30 gap-1">💎 {resources.gems}</Badge>
  </div>
);

// شريط الطاقة
const TemperatureBar = ({ value, onDanger }: { value: number; onDanger?: () => void }) => {
  useEffect(() => {
    if (value < 20 && onDanger) onDanger();
  }, [value, onDanger]);

  const getColor = () => value < 30 ? 'bg-red-500' : value < 60 ? 'bg-accent' : 'bg-green-500';
  const status = value < 30 ? { text: 'منخفض! ⚠️', color: 'text-red-500' } : 
                 value < 60 ? { text: 'متوسط 💪', color: 'text-accent' } : 
                 { text: 'ممتاز 🔥', color: 'text-green-500' };

  return (
    <Card className="bg-card border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <span className="text-foreground font-bold">الطاقة</span>
        </div>
        <span className={`font-bold ${status.color}`}>{status.text}</span>
      </div>
      <div className="relative h-4 bg-muted rounded-full overflow-hidden border border-border">
        <motion.div className={`h-full ${getColor()} rounded-full`} animate={{ width: `${value}%` }} />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">{value}%</span>
      </div>
    </Card>
  );
};

// بطاقة البروفايل
const PlayerProfileCard = ({ player, atlantisLevel }: { player: any; atlantisLevel: string }) => {
  const levelStyles: any = {
    bronze: { bg: 'bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', icon: '🥉' },
    silver: { bg: 'bg-gray-400/20', text: 'text-gray-600 dark:text-gray-300', icon: '🥈' },
    gold: { bg: 'bg-accent/20', text: 'text-accent', icon: '🥇' },
    legendary: { bg: 'bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', icon: '👑' }
  };
  const style = levelStyles[atlantisLevel] || levelStyles.bronze;

  return (
    <Card className="bg-card border-border p-4">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-16 h-16 rounded-xl ${style.bg} flex items-center justify-center text-3xl border border-border`}>
          {player.avatar}
        </div>
        <div>
          <h3 className="text-foreground font-bold text-lg">{player.name}</h3>
          <Badge className={`${style.bg} ${style.text} border border-border`}>{style.icon} {atlantisLevel}</Badge>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-muted rounded-lg p-2 border border-border">
          <Shield className="w-4 h-4 mx-auto text-primary mb-1" />
          <p className="text-foreground font-bold">{player.power}</p>
          <p className="text-xs text-muted-foreground">قوة</p>
        </div>
        <div className="bg-muted rounded-lg p-2 border border-border">
          <Building2 className="w-4 h-4 mx-auto text-accent mb-1" />
          <p className="text-foreground font-bold">{player.buildings}</p>
          <p className="text-xs text-muted-foreground">مباني</p>
        </div>
        <div className="bg-muted rounded-lg p-2 border border-border">
          <Swords className="w-4 h-4 mx-auto text-primary mb-1" />
          <p className="text-foreground font-bold">{player.troops}</p>
          <p className="text-xs text-muted-foreground">جنود</p>
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
            className="p-3 rounded-xl border border-border bg-muted/50 hover:bg-muted"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                {config?.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-foreground font-bold">{config?.nameAr}</h4>
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
        className="w-full border-dashed"
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
        <div className="bg-muted rounded-lg p-3 border border-border">
          <Users className="w-5 h-5 mx-auto text-foreground mb-1" />
          <p className="text-foreground font-bold">{totalTroops}</p>
          <p className="text-xs text-muted-foreground">إجمالي</p>
        </div>
        <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
          <Swords className="w-5 h-5 mx-auto text-primary mb-1" />
          <p className="text-foreground font-bold">{troops.reduce((s: number, t: any) => s + (TROOP_CONFIGS[t.type as keyof typeof TROOP_CONFIGS]?.attack || 0) * t.count, 0)}</p>
          <p className="text-xs text-muted-foreground">هجوم</p>
        </div>
        <div className="bg-accent/10 rounded-lg p-3 border border-accent/20">
          <Shield className="w-5 h-5 mx-auto text-accent mb-1" />
          <p className="text-foreground font-bold">{troops.reduce((s: number, t: any) => s + (TROOP_CONFIGS[t.type as keyof typeof TROOP_CONFIGS]?.defense || 0) * t.count, 0)}</p>
          <p className="text-xs text-muted-foreground">دفاع</p>
        </div>
      </div>
      
      <ScrollArea className="h-[250px]">
        <div className="space-y-2">
          {troops.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Swords className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا يوجد جنود</p>
            </div>
          ) : troops.map((troop: any) => {
            const config = TROOP_CONFIGS[troop.type as keyof typeof TROOP_CONFIGS];
            return (
              <div key={troop.id} className="p-3 rounded-lg bg-muted/50 border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{config?.icon}</span>
                  <div>
                    <p className="text-foreground font-medium">{config?.nameAr}</p>
                    <p className="text-xs text-muted-foreground">⚔️{config?.attack} 🛡️{config?.defense}</p>
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
  const colors: any = { forest: 'bg-green-500/20', mountain: 'bg-stone-500/20', goldmine: 'bg-accent/20', empty: 'bg-muted/50' };

  return (
    <div className="grid grid-cols-10 gap-1">
      {tiles.map((tile) => (
        <motion.div
          key={tile.id}
          className={`aspect-square rounded border border-border ${colors[tile.type]} flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
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
    <Card className="bg-card border-border p-4">
      <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-500" />
        سباق القلعة
      </h3>
      <div className="space-y-2">
        {leaders.map((leader) => (
          <motion.div
            key={leader.rank}
            className={`flex items-center gap-2 p-2 rounded-lg ${leader.isYou ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50 border border-border'}`}
            whileHover={{ x: 5 }}
          >
            <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white ${
              leader.rank === 1 ? 'bg-accent' : leader.rank === 2 ? 'bg-gray-400' : leader.rank === 3 ? 'bg-orange-400' : 'bg-primary'
            }`}>{leader.rank}</span>
            <span className="text-xl">{leader.avatar}</span>
            <span className={`flex-1 text-sm font-medium ${leader.isYou ? 'text-primary' : 'text-foreground'}`}>{leader.name}</span>
            <span className="text-accent font-bold text-sm">{leader.points}</span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

// التحدي الأسبوعي
const WeeklyChallenge = ({ progress, target }: { progress: number; target: number }) => (
  <Card className="bg-primary/5 border-primary/20 p-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-foreground font-bold flex items-center gap-2">🏆 التحدي الأسبوعي</h3>
      <Badge className="bg-green-500 text-white">نشط</Badge>
    </div>
    <div className="bg-muted rounded-lg p-3 mb-3">
      <p className="text-foreground text-sm mb-2">🎯 اجمع الموارد لتحقيق الهدف</p>
      <div className="flex items-center gap-2">
        <Progress value={(progress / target) * 100} className="flex-1" />
        <span className="text-foreground text-sm font-bold">{progress}/{target}</span>
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      
      {/* Header */}
      <header className="relative z-20 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackRoute="/atlantis" />
              <div className="flex items-center gap-3">
                <motion.div className="text-4xl" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                  🌍
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">عالم أتلانتس</h1>
                  <p className="text-muted-foreground text-sm">ابنِ مملكتك وحارب من أجل المجد</p>
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
            className="gap-2"
          >
            <LayoutGrid className="w-4 h-4" /> مملكتي
          </Button>
          <Button 
            variant={activeView === 'map' ? 'default' : 'outline'} 
            onClick={() => setActiveView('map')} 
            className="gap-2"
          >
            <Map className="w-4 h-4" /> خريطة العالم
          </Button>
        </div>
      </div>

      {/* المحتوى */}
      <main className="relative z-20 container mx-auto px-4 pb-20">
        {activeView === 'map' ? (
          <Card className="bg-card border-border p-6">
            <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-accent" /> خريطة العالم
            </h3>
            <WorldMap player={player} onTileClick={(tile: any) => toast.info(`الإحداثيات: ${tile.x}, ${tile.y}`)} />
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* الشريط الجانبي */}
            <div className="space-y-4">
              <PlayerProfileCard player={player} atlantisLevel={atlantisLevel} />
              <TemperatureBar value={temperature} onDanger={() => toastHook({ title: 'تحذير!', variant: 'destructive' })} />
              <WeeklyChallenge progress={challengeProgress} target={15} />
            </div>

            {/* المحتوى الرئيسي */}
            <div className="lg:col-span-2 space-y-4">
              <Tabs defaultValue="buildings">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="buildings">
                    <Building2 className="w-4 h-4 ml-2" /> المباني
                  </TabsTrigger>
                  <TabsTrigger value="troops">
                    <Swords className="w-4 h-4 ml-2" /> الجيش
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="buildings">
                  <Card className="bg-card border-border p-4">
                    <BuildingsPanel buildings={buildings} resources={resources} onBuild={handleBuild} onUpgrade={handleUpgrade} />
                  </Card>
                </TabsContent>
                <TabsContent value="troops">
                  <Card className="bg-card border-border p-4">
                    <TroopsPanel troops={troops} resources={resources} onTrain={handleTrain} />
                  </Card>
                </TabsContent>
              </Tabs>

              {/* أزرار الإجراءات */}
              <div className="grid grid-cols-3 gap-3">
                <Button onClick={handleLightFire} className="bg-primary hover:bg-primary/90 h-14 gap-2" disabled={resources.wood < 10}>
                  <Flame className="w-5 h-5" />
                  <div className="text-right">
                    <div>زيادة الطاقة</div>
                    <div className="text-xs opacity-75">-10 🪵</div>
                  </div>
                </Button>
                <Button onClick={handleBuildHouse} variant="secondary" className="h-14 gap-2" disabled={resources.wood < 50}>
                  <Home className="w-5 h-5" />
                  <div className="text-right">
                    <div>ابنِ بيت</div>
                    <div className="text-xs opacity-75">-50🪵 -100💰</div>
                  </div>
                </Button>
                <Button onClick={handleGatherResources} variant="outline" className="h-14 gap-2">
                  <Zap className="w-5 h-5" />
                  <div className="text-right">
                    <div>اجمع موارد</div>
                    <div className="text-xs opacity-75">-5 طاقة</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* لوحة المتصدرين */}
            <div className="space-y-4">
              <MiniLeaderboard currentRank={4} />
              <Card className="bg-accent/10 border-accent/30 p-4">
                <h3 className="text-foreground font-bold mb-3 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-accent" /> مكافآت القلعة
                </h3>
                <div className="space-y-2 text-sm text-foreground">
                  <p className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> ثيم ملكي حصري</p>
                  <p className="flex items-center gap-2">💰 +20% عمولة إضافية</p>
                  <p className="flex items-center gap-2"><Crown className="w-4 h-4 text-accent" /> تاج بجانب اسمك</p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* شريط سفلي */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border py-3 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6 text-foreground">
            <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-primary" /> القوة: <strong className="text-primary">{player.power}</strong></span>
            <span className="flex items-center gap-1"><Building2 className="w-4 h-4 text-accent" /> المباني: <strong className="text-accent">{buildings.length}</strong></span>
            <span className="flex items-center gap-1"><Swords className="w-4 h-4 text-primary" /> الجنود: <strong className="text-primary">{troops.reduce((s, t) => s + t.count, 0)}</strong></span>
          </div>
          <Badge variant="secondary">مرتبط بنظام نقاط أتلانتس</Badge>
        </div>
      </footer>
    </div>
  );
}
