import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, TreePine, Mountain, Wheat, Gem, 
  Users, Shield, Swords, Timer,
  ChevronUp, ChevronDown, Volume2, VolumeX,
  Settings, Map, Trophy, MessageSquare
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// ============== أنواع البيانات ==============
interface ResourcesData {
  gold: number;
  wood: number;
  stone: number;
  food: number;
  gems: number;
}

interface GameNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  icon?: string;
  timestamp: number;
}

interface ActiveMission {
  id: string;
  type: 'attack' | 'gather' | 'scout';
  targetName: string;
  progress: number;
  troopCount: number;
  timeRemaining: number;
}

// ============== شريط الموارد ==============
export const ResourceBar = ({ resources, className = '' }: { 
  resources: ResourcesData; 
  className?: string;
}) => {
  const resourceItems = [
    { key: 'gold', label: 'ذهب', icon: Coins, value: resources.gold, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { key: 'wood', label: 'خشب', icon: TreePine, value: resources.wood, color: 'text-green-500', bg: 'bg-green-500/10' },
    { key: 'stone', label: 'حجر', icon: Mountain, value: resources.stone, color: 'text-gray-400', bg: 'bg-gray-400/10' },
    { key: 'food', label: 'طعام', icon: Wheat, value: resources.food, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { key: 'gems', label: 'جواهر', icon: Gem, value: resources.gems, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`flex items-center gap-1 ${className}`}
    >
      {resourceItems.map(item => (
        <div 
          key={item.key}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${item.bg} backdrop-blur-sm border border-white/10`}
        >
          <item.icon className={`w-4 h-4 ${item.color}`} />
          <span className="font-bold text-sm text-foreground">
            {item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}K` : item.value}
          </span>
        </div>
      ))}
    </motion.div>
  );
};

// ============== شريط الجيش ==============
export const ArmyBar = ({ 
  totalTroops, 
  availableTroops, 
  power,
  className = '' 
}: { 
  totalTroops: number;
  availableTroops: number;
  power: number;
  className?: string;
}) => {
  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className={`flex items-center gap-3 ${className}`}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 backdrop-blur-sm border border-blue-500/20">
        <Users className="w-4 h-4 text-blue-400" />
        <span className="font-bold text-sm text-foreground">
          {availableTroops}/{totalTroops}
        </span>
      </div>
      
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 backdrop-blur-sm border border-red-500/20">
        <Swords className="w-4 h-4 text-red-400" />
        <span className="font-bold text-sm text-foreground">{power}</span>
      </div>
      
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 backdrop-blur-sm border border-green-500/20">
        <Shield className="w-4 h-4 text-green-400" />
        <span className="font-bold text-sm text-foreground">{Math.floor(power * 0.8)}</span>
      </div>
    </motion.div>
  );
};

// ============== قائمة المهمات النشطة ==============
export const ActiveMissions = ({ 
  missions, 
  expanded,
  onToggle,
  className = '' 
}: { 
  missions: ActiveMission[];
  expanded: boolean;
  onToggle: () => void;
  className?: string;
}) => {
  if (missions.length === 0) return null;

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`${className}`}
    >
      <Card className="bg-card/95 backdrop-blur border-border shadow-xl overflow-hidden">
        {/* رأس القائمة */}
        <button 
          onClick={onToggle}
          className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-primary animate-pulse" />
            <span className="font-bold text-sm">مهمات نشطة</span>
            <Badge variant="secondary" className="text-xs">{missions.length}</Badge>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {/* قائمة المهمات */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-2 space-y-2 border-t border-border">
                {missions.map(mission => (
                  <MissionCard key={mission.id} mission={mission} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

const MissionCard = ({ mission }: { mission: ActiveMission }) => {
  const typeConfig = {
    attack: { icon: '⚔️', color: 'text-red-400', bg: 'bg-red-500/10' },
    gather: { icon: '📦', color: 'text-green-400', bg: 'bg-green-500/10' },
    scout: { icon: '👁️', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  };
  
  const config = typeConfig[mission.type];
  
  return (
    <div className={`p-2 rounded-lg ${config.bg} border border-white/5`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <span className="text-xs font-medium">{mission.targetName}</span>
        </div>
        <span className={`text-xs font-bold ${config.color}`}>
          {mission.troopCount} جندي
        </span>
      </div>
      <Progress value={mission.progress} className="h-1.5" />
      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
        <span>{Math.round(mission.progress)}%</span>
        <span>{Math.ceil(mission.timeRemaining)}ث</span>
      </div>
    </div>
  );
};

// ============== الإشعارات ==============
export const GameNotifications = ({ 
  notifications, 
  onDismiss,
  className = '' 
}: { 
  notifications: GameNotification[];
  onDismiss: (id: string) => void;
  className?: string;
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <AnimatePresence mode="popLayout">
        {notifications.slice(0, 5).map(notification => (
          <motion.div
            key={notification.id}
            initial={{ x: 100, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 100, opacity: 0, scale: 0.8 }}
            layout
          >
            <NotificationCard notification={notification} onDismiss={() => onDismiss(notification.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const NotificationCard = ({ notification, onDismiss }: { 
  notification: GameNotification; 
  onDismiss: () => void;
}) => {
  const typeConfig = {
    success: { bg: 'bg-green-500/90', border: 'border-green-400' },
    warning: { bg: 'bg-yellow-500/90', border: 'border-yellow-400' },
    error: { bg: 'bg-red-500/90', border: 'border-red-400' },
    info: { bg: 'bg-blue-500/90', border: 'border-blue-400' },
  };
  
  const config = typeConfig[notification.type];
  
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);
  
  return (
    <div 
      className={`${config.bg} ${config.border} border rounded-lg p-3 text-white shadow-xl cursor-pointer backdrop-blur-sm`}
      onClick={onDismiss}
    >
      <div className="flex items-start gap-2">
        {notification.icon && <span className="text-xl">{notification.icon}</span>}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm">{notification.title}</h4>
          <p className="text-xs text-white/80 truncate">{notification.message}</p>
        </div>
      </div>
    </div>
  );
};

// ============== شريط الأدوات السفلي ==============
export const BottomToolbar = ({ 
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenMap,
  onOpenChat,
  onOpenLeaderboard,
  className = '' 
}: { 
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenMap: () => void;
  onOpenChat: () => void;
  onOpenLeaderboard: () => void;
  className?: string;
}) => {
  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      <ToolbarButton icon={soundEnabled ? Volume2 : VolumeX} label="صوت" onClick={onToggleSound} active={soundEnabled} />
      <ToolbarButton icon={Map} label="خريطة" onClick={onOpenMap} />
      <ToolbarButton icon={MessageSquare} label="دردشة" onClick={onOpenChat} />
      <ToolbarButton icon={Trophy} label="ترتيب" onClick={onOpenLeaderboard} />
      <ToolbarButton icon={Settings} label="إعدادات" onClick={onOpenSettings} />
    </motion.div>
  );
};

const ToolbarButton = ({ 
  icon: Icon, 
  label, 
  onClick, 
  active = false 
}: { 
  icon: any; 
  label: string; 
  onClick: () => void;
  active?: boolean;
}) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onClick}
    className={`flex-col h-auto py-2 px-3 gap-0.5 ${
      active ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-[10px]">{label}</span>
  </Button>
);

// ============== مؤشر التحميل ==============
export const LoadingOverlay = ({ progress }: { progress: number }) => {
  return (
    <motion.div 
      className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 mb-6"
      >
        <Map className="w-full h-full text-primary" />
      </motion.div>
      
      <h2 className="text-xl font-bold mb-2">جارِ تحميل عالم أتلانتس...</h2>
      <p className="text-muted-foreground mb-4">استعد للمغامرة!</p>
      
      <div className="w-64">
        <Progress value={progress} className="h-2" />
        <p className="text-center text-sm text-muted-foreground mt-2">{progress}%</p>
      </div>
    </motion.div>
  );
};
