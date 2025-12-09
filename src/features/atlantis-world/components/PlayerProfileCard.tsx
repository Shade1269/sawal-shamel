import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Shield, Swords, Trophy, TrendingUp, Building2, Gem, Coins } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { PlayerProfile } from '../types/game';
import { GAME_FORMULAS, LEVEL_POWER_BONUSES } from '../config/gameConfig';

interface PlayerProfileCardProps {
  player: PlayerProfile | null;
  atlantisLevel?: string;
  compact?: boolean;
}

const LEVEL_STYLES: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  bronze: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40', icon: '🥉' },
  silver: { bg: 'bg-gray-400/20', text: 'text-gray-300', border: 'border-gray-400/40', icon: '🥈' },
  gold: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40', icon: '🥇' },
  legendary: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/40', icon: '👑' }
};

export const PlayerProfileCard: React.FC<PlayerProfileCardProps> = ({ 
  player, 
  atlantisLevel = 'bronze',
  compact = false 
}) => {
  if (!player) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const levelStyle = LEVEL_STYLES[atlantisLevel] || LEVEL_STYLES.bronze;
  const expToNext = GAME_FORMULAS.levelToExperience(player.level + 1);
  const expProgress = (player.experience / expToNext) * 100;
  const powerBonus = LEVEL_POWER_BONUSES[atlantisLevel] || 1;
  const totalTroops = player.troops.reduce((sum, t) => sum + t.count, 0);

  if (compact) {
    return (
      <Card className={`border ${levelStyle.border} bg-gradient-to-br from-background to-muted/30`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className={`relative w-14 h-14 rounded-xl ${levelStyle.bg} flex items-center justify-center`}>
              <span className="text-2xl">{player.avatar}</span>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${levelStyle.bg} border-2 border-background flex items-center justify-center`}>
                <span className="text-xs">{player.level}</span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold truncate">{player.name}</h3>
                <Badge variant="outline" className={`${levelStyle.bg} ${levelStyle.text} text-xs`}>
                  {levelStyle.icon} {atlantisLevel}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {Math.floor(player.power * powerBonus).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Coins className="w-3 h-3 text-yellow-500" />
                  {player.resources.gold.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`overflow-hidden border ${levelStyle.border}`}>
        {/* خلفية متدرجة */}
        <div className={`h-20 ${levelStyle.bg} relative`}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
          <motion.div 
            className="absolute top-2 left-2"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <Crown className={`w-8 h-8 ${levelStyle.text}`} />
          </motion.div>
        </div>

        <CardContent className="pt-0 -mt-10 relative">
          {/* الأفاتار */}
          <div className="flex items-end gap-4 mb-4">
            <div className={`w-20 h-20 rounded-2xl ${levelStyle.bg} border-4 border-background flex items-center justify-center shadow-lg`}>
              <span className="text-4xl">{player.avatar}</span>
            </div>
            <div className="flex-1 pb-2">
              <h2 className="text-xl font-bold">{player.name}</h2>
              <p className="text-sm text-muted-foreground">{player.kingdom}</p>
            </div>
            <Badge 
              variant="outline" 
              className={`${levelStyle.bg} ${levelStyle.text} px-3 py-1`}
            >
              {levelStyle.icon} المستوى {player.level}
            </Badge>
          </div>

          {/* شريط الخبرة */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">الخبرة</span>
              <span className="font-medium">{player.experience.toLocaleString()} / {expToNext.toLocaleString()}</span>
            </div>
            <Progress value={expProgress} className="h-2" />
          </div>

          <Separator className="mb-4" />

          {/* الإحصائيات الرئيسية */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <Shield className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{Math.floor(player.power * powerBonus).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">القوة</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <Building2 className="w-5 h-5 mx-auto mb-1 text-accent" />
              <p className="text-lg font-bold">{player.buildings.length}</p>
              <p className="text-xs text-muted-foreground">المباني</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <Swords className="w-5 h-5 mx-auto mb-1 text-destructive" />
              <p className="text-lg font-bold">{totalTroops.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">الجنود</p>
            </div>
          </div>

          {/* الموارد */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">الموارد</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10">
                <span className="text-lg">💰</span>
                <div>
                  <p className="text-sm font-medium">{player.resources.gold.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">ذهب</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-600/10">
                <span className="text-lg">🪵</span>
                <div>
                  <p className="text-sm font-medium">{player.resources.wood.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">خشب</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-500/10">
                <span className="text-lg">🪨</span>
                <div>
                  <p className="text-sm font-medium">{player.resources.stone.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">حجر</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10">
                <span className="text-lg">🍖</span>
                <div>
                  <p className="text-sm font-medium">{player.resources.food.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">طعام</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/10 mt-2">
              <Gem className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm font-medium">{player.resources.gems} جواهر</p>
                <p className="text-xs text-muted-foreground">نقاط أتلانتس: {player.resources.atlantisPoints}</p>
              </div>
            </div>
          </div>

          {/* الإحصائيات القتالية */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>الانتصارات: {player.stats.wins}</span>
              </div>
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-muted-foreground" />
                <span>المعارك: {player.stats.totalBattles}</span>
              </div>
              <div className="flex items-center gap-2 text-green-500">
                <TrendingUp className="w-4 h-4" />
                <span>{player.stats.wins > 0 ? Math.round((player.stats.wins / player.stats.totalBattles) * 100) : 0}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
