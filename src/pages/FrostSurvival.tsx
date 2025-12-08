import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  Flame,
  Snowflake,
  Home,
  Users,
  Trophy,
  Sword,
  Shield,
  Star,
  TrendingUp
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';

// مكون الثلج المتساقط
const Snowfall = () => {
  const snowflakes = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
    size: 4 + Math.random() * 8,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute text-white/60"
          style={{ left: `${flake.left}%`, fontSize: flake.size }}
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: '100vh',
            opacity: [0, 1, 1, 0],
            x: [0, 10, -10, 0]
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          ❄
        </motion.div>
      ))}
    </div>
  );
};

// مكون القاعدة
const PlayerBase = ({
  player,
  position,
  isCurrentUser = false
}: {
  player: { name: string; level: number; avatar: string; houses: number };
  position: { x: number; y: number };
  isCurrentUser?: boolean;
}) => {
  const houses = Array.from({ length: Math.min(player.houses, 5) }, (_, i) => i);

  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
    >
      {/* النار */}
      <motion.div
        className="text-2xl mb-1"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        🔥
      </motion.div>

      {/* البيوت */}
      <div className="flex gap-1 mb-1">
        {houses.map((_, i) => (
          <motion.span
            key={i}
            className="text-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7 + i * 0.1 }}
          >
            🏠
          </motion.span>
        ))}
      </div>

      {/* الشخصية */}
      <motion.div
        className={`text-3xl ${isCurrentUser ? 'drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]' : ''}`}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {player.avatar}
      </motion.div>

      {/* الاسم */}
      <div className={`mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${
        isCurrentUser
          ? 'bg-blue-500 text-white'
          : 'bg-black/50 text-white'
      }`}>
        {player.name}
      </div>

      {/* المستوى */}
      <div className="flex items-center gap-1 mt-1">
        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        <span className="text-xs text-white font-bold">{player.level}</span>
      </div>
    </motion.div>
  );
};

// مكون القلعة
const Castle = ({ owner, alliance }: { owner: string; alliance: string }) => {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
    >
      {/* التاج */}
      <motion.div
        className="text-4xl mb-2"
        animate={{
          y: [0, -5, 0],
          rotateZ: [0, 5, -5, 0]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        👑
      </motion.div>

      {/* القلعة */}
      <motion.div
        className="text-7xl drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🏰
      </motion.div>

      {/* النيران حول القلعة */}
      <div className="flex gap-4 mt-2">
        <motion.span
          className="text-2xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          🔥
        </motion.span>
        <motion.span
          className="text-2xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
        >
          🔥
        </motion.span>
      </div>

      {/* معلومات المالك */}
      <motion.div
        className="mt-3 bg-gradient-to-r from-yellow-600 to-amber-500 px-4 py-2 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="text-white text-center">
          <div className="flex items-center justify-center gap-2 font-bold">
            <Sword className="w-4 h-4" />
            <span>{owner}</span>
          </div>
          <div className="text-xs text-yellow-100 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            {alliance}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// مكون شريط الحرارة
const TemperatureBar = ({ value }: { value: number }) => {
  const getColor = () => {
    if (value < 30) return 'bg-blue-500';
    if (value < 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getStatus = () => {
    if (value < 30) return { text: 'خطر! 🥶', color: 'text-blue-400' };
    if (value < 60) return { text: 'حذر ⚠️', color: 'text-yellow-400' };
    return { text: 'دافئ 🔥', color: 'text-orange-400' };
  };

  const status = getStatus();

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/20 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Snowflake className="w-5 h-5 text-blue-300" />
          <span className="text-white font-bold">الحرارة</span>
        </div>
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <span className={`font-bold ${status.color}`}>{status.text}</span>
        </div>
      </div>
      <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getColor()} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow">{value}%</span>
        </div>
      </div>
    </Card>
  );
};

// مكون إحصائيات اللاعب
const PlayerStats = ({ stats }: { stats: { wood: number; food: number; coins: number; rank: number } }) => {
  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/20 p-4">
      <h3 className="text-white font-bold mb-3 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-400" />
        مواردك
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
          <span className="text-2xl">🪵</span>
          <div>
            <div className="text-xs text-gray-400">حطب</div>
            <div className="text-white font-bold">{stats.wood}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
          <span className="text-2xl">🍖</span>
          <div>
            <div className="text-xs text-gray-400">طعام</div>
            <div className="text-white font-bold">{stats.food}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
          <span className="text-2xl">💰</span>
          <div>
            <div className="text-xs text-gray-400">عملات</div>
            <div className="text-white font-bold">{stats.coins}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
          <span className="text-2xl">🏆</span>
          <div>
            <div className="text-xs text-gray-400">ترتيبك</div>
            <div className="text-white font-bold">#{stats.rank}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// مكون التحدي الأسبوعي
const WeeklyChallenge = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, minutes: 22 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59 };
        }
        return prev;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-purple-900/60 to-blue-900/60 backdrop-blur-sm border-purple-500/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold flex items-center gap-2">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌨️
          </motion.span>
          العاصفة الأسبوعية
        </h3>
        <Badge className="bg-red-500/80">نشط</Badge>
      </div>

      <div className="bg-black/30 rounded-lg p-3 mb-3">
        <p className="text-white text-sm mb-2">🎯 بيع 15 منتج قبل انتهاء العاصفة</p>
        <div className="flex items-center gap-2">
          <Progress value={60} className="flex-1" />
          <span className="text-white text-sm font-bold">9/15</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-gray-300 text-xs">الوقت المتبقي:</div>
        <div className="flex gap-2 text-white font-mono">
          <span className="bg-black/40 px-2 py-1 rounded">{timeLeft.days}d</span>
          <span className="bg-black/40 px-2 py-1 rounded">{timeLeft.hours}h</span>
          <span className="bg-black/40 px-2 py-1 rounded">{timeLeft.minutes}m</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="text-xs text-gray-400 mb-1">🎁 المكافأة:</div>
        <div className="flex gap-2">
          <Badge variant="secondary">+50 🪵</Badge>
          <Badge variant="secondary">+30 🍖</Badge>
          <Badge variant="secondary">+100 💰</Badge>
        </div>
      </div>
    </Card>
  );
};

// مكون المتصدرين المصغر
const MiniLeaderboard = () => {
  const leaders = [
    { rank: 1, name: 'أحمد', points: 2450, avatar: '👨‍💼' },
    { rank: 2, name: 'سارة', points: 2180, avatar: '👩‍💼' },
    { rank: 3, name: 'خالد', points: 1920, avatar: '🧔' },
    { rank: 4, name: 'أنت', points: 1650, avatar: '😎', isYou: true },
    { rank: 5, name: 'نورة', points: 1580, avatar: '👩' },
  ];

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/20 p-4">
      <h3 className="text-white font-bold mb-3 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-400" />
        سباق القلعة
      </h3>
      <div className="space-y-2">
        {leaders.map((leader) => (
          <motion.div
            key={leader.rank}
            className={`flex items-center gap-2 p-2 rounded-lg ${
              leader.isYou ? 'bg-blue-500/30 border border-blue-500/50' : 'bg-white/5'
            }`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: leader.rank * 0.1 }}
          >
            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
              leader.rank === 1 ? 'bg-yellow-500 text-black' :
              leader.rank === 2 ? 'bg-gray-400 text-black' :
              leader.rank === 3 ? 'bg-amber-700 text-white' :
              'bg-gray-700 text-white'
            }`}>
              {leader.rank}
            </span>
            <span className="text-xl">{leader.avatar}</span>
            <span className={`flex-1 text-sm ${leader.isYou ? 'text-blue-300 font-bold' : 'text-white'}`}>
              {leader.name}
            </span>
            <span className="text-yellow-400 font-bold text-sm">{leader.points}</span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

// الصفحة الرئيسية
export default function FrostSurvival() {
  const [temperature, _setTemperature] = useState(72);

  // بيانات تجريبية
  const players = [
    { name: 'أحمد', level: 12, avatar: '👨‍💼', houses: 4 },
    { name: 'سارة', level: 10, avatar: '👩‍💼', houses: 3 },
    { name: 'خالد', level: 8, avatar: '🧔', houses: 2 },
    { name: 'نورة', level: 7, avatar: '👩', houses: 2 },
  ];

  const currentPlayer = { name: 'أنت', level: 9, avatar: '😎', houses: 3 };

  const playerStats = { wood: 156, food: 89, coins: 1250, rank: 4 };

  const positions = [
    { x: 15, y: 25 },
    { x: 80, y: 20 },
    { x: 12, y: 70 },
    { x: 85, y: 75 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* خلفية الجبال الثلجية */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white/10 to-transparent" />
        <div className="absolute bottom-20 left-10 text-8xl opacity-30">🏔️</div>
        <div className="absolute bottom-16 right-20 text-7xl opacity-25">🏔️</div>
        <div className="absolute bottom-24 left-1/3 text-9xl opacity-20">🏔️</div>
      </div>

      {/* الثلج المتساقط */}
      <Snowfall />

      {/* الأشجار */}
      <div className="absolute inset-0 pointer-events-none">
        <span className="absolute text-4xl opacity-60" style={{ left: '5%', top: '40%' }}>🌲</span>
        <span className="absolute text-3xl opacity-50" style={{ left: '8%', top: '50%' }}>🌲</span>
        <span className="absolute text-4xl opacity-60" style={{ right: '6%', top: '35%' }}>🌲</span>
        <span className="absolute text-3xl opacity-50" style={{ right: '10%', top: '55%' }}>🌲</span>
        <span className="absolute text-5xl opacity-40" style={{ left: '30%', top: '75%' }}>🌲</span>
        <span className="absolute text-4xl opacity-50" style={{ right: '35%', top: '80%' }}>🌲</span>
      </div>

      {/* Header */}
      <div className="relative z-20 border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackRoute="/atlantis" />
              <div className="flex items-center gap-3">
                <motion.div
                  className="text-4xl"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  ❄️
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-white">صقيع أتلانتس</h1>
                  <p className="text-blue-300 text-sm">انجُ من البرد واحتل القلعة!</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full">
                <span className="text-2xl">{currentPlayer.avatar}</span>
                <div>
                  <div className="text-white font-bold text-sm">{currentPlayer.name}</div>
                  <div className="text-yellow-400 text-xs flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    المستوى {currentPlayer.level}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-20 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* الشريط الجانبي */}
          <div className="lg:col-span-1 space-y-4">
            <TemperatureBar value={temperature} />
            <PlayerStats stats={playerStats} />
            <WeeklyChallenge />
          </div>

          {/* خريطة اللعبة */}
          <div className="lg:col-span-2">
            <Card className="bg-black/30 backdrop-blur-sm border-white/20 p-4 h-[500px] relative overflow-hidden">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                خريطة المملكة
              </h3>

              {/* الخريطة */}
              <div className="relative h-[calc(100%-40px)] bg-gradient-to-b from-blue-900/50 to-slate-900/50 rounded-lg overflow-hidden">
                {/* القلعة المركزية */}
                <Castle owner="أحمد" alliance="تحالف النسور" />

                {/* قواعد اللاعبين */}
                {players.map((player, i) => (
                  <PlayerBase
                    key={player.name}
                    player={player}
                    position={positions[i]}
                  />
                ))}

                {/* قاعدتك */}
                <PlayerBase
                  player={currentPlayer}
                  position={{ x: 50, y: 82 }}
                  isCurrentUser
                />

                {/* الأشجار على الخريطة */}
                <span className="absolute text-2xl opacity-40" style={{ left: '25%', top: '45%' }}>🌲</span>
                <span className="absolute text-2xl opacity-40" style={{ right: '25%', top: '40%' }}>🌲</span>
              </div>
            </Card>

            {/* أزرار الإجراءات */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
                <Flame className="w-4 h-4" />
                أشعل النار
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                <Home className="w-4 h-4" />
                ابنِ بيت
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                <Users className="w-4 h-4" />
                تحالفات
              </Button>
            </div>
          </div>

          {/* لوحة المتصدرين */}
          <div className="lg:col-span-1 space-y-4">
            <MiniLeaderboard />

            {/* مكافآت القلعة */}
            <Card className="bg-gradient-to-br from-yellow-900/40 to-amber-900/40 backdrop-blur-sm border-yellow-500/30 p-4">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                مكافآت القلعة
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-white">
                  <span>🎨</span>
                  <span>ثيم ملكي حصري</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span>💰</span>
                  <span>+20% عمولة إضافية</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span>👑</span>
                  <span>تاج بجانب اسمك</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span>📍</span>
                  <span>ظهور أول في المنصة</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
