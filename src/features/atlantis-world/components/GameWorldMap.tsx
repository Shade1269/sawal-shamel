import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ZoomIn, ZoomOut, Compass, Target, Home,
  Users, X, Navigation, Locate
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// أنواع المواقع على الخريطة
interface MapLocation {
  id: string;
  name: string;
  type: 'castle' | 'village' | 'forest' | 'mine' | 'enemy' | 'ruins' | 'port' | 'tower';
  x: number; // نسبة مئوية 0-100
  y: number; // نسبة مئوية 0-100
  level?: number;
  owner?: string;
  resources?: number;
  isPlayer?: boolean;
}

interface GameWorldMapProps {
  playerPosition: { x: number; y: number };
  playerName: string;
  playerPower: number;
  onLocationClick?: (location: MapLocation) => void;
  onMove?: (x: number, y: number) => void;
}

// المواقع الافتراضية على الخريطة
const DEFAULT_LOCATIONS: MapLocation[] = [
  { id: 'player_castle', name: 'قلعتي', type: 'castle', x: 50, y: 50, isPlayer: true },
  { id: 'village_1', name: 'قرية الشرق', type: 'village', x: 75, y: 40, resources: 500 },
  { id: 'village_2', name: 'قرية الغرب', type: 'village', x: 25, y: 55, resources: 350 },
  { id: 'village_3', name: 'قرية الجنوب', type: 'village', x: 45, y: 80, resources: 420 },
  { id: 'forest_1', name: 'غابة الصنوبر', type: 'forest', x: 30, y: 25, resources: 800 },
  { id: 'forest_2', name: 'غابة البلوط', type: 'forest', x: 70, y: 70, resources: 650 },
  { id: 'mine_1', name: 'منجم الذهب', type: 'mine', x: 85, y: 20, resources: 1200 },
  { id: 'mine_2', name: 'منجم الفضة', type: 'mine', x: 15, y: 75, resources: 900 },
  { id: 'enemy_1', name: 'معسكر اللصوص', type: 'enemy', x: 60, y: 25, level: 3 },
  { id: 'enemy_2', name: 'قلعة الظلام', type: 'enemy', x: 20, y: 35, level: 5 },
  { id: 'enemy_3', name: 'وكر التنين', type: 'enemy', x: 80, y: 85, level: 8 },
  { id: 'ruins_1', name: 'أطلال القدماء', type: 'ruins', x: 40, y: 15, resources: 2000 },
  { id: 'ruins_2', name: 'معبد مهجور', type: 'ruins', x: 90, y: 55, resources: 1500 },
  { id: 'port_1', name: 'ميناء التجار', type: 'port', x: 10, y: 50, resources: 600 },
  { id: 'tower_1', name: 'برج المراقبة', type: 'tower', x: 55, y: 35 },
  { id: 'tower_2', name: 'برج الحراسة', type: 'tower', x: 35, y: 65 },
];

// أيقونات المواقع
const LOCATION_ICONS: Record<string, { icon: string; color: string; size: number }> = {
  castle: { icon: '🏰', color: '#C89B3C', size: 40 },
  village: { icon: '🏘️', color: '#8B7355', size: 30 },
  forest: { icon: '🌲', color: '#228B22', size: 28 },
  mine: { icon: '⛏️', color: '#FFD700', size: 28 },
  enemy: { icon: '⚔️', color: '#DC143C', size: 32 },
  ruins: { icon: '🏛️', color: '#9370DB', size: 30 },
  port: { icon: '⚓', color: '#4169E1', size: 28 },
  tower: { icon: '🗼', color: '#708090', size: 26 },
};

// مكون الموقع على الخريطة
const MapMarker = ({ 
  location, 
  isSelected, 
  onClick,
  scale
}: { 
  location: MapLocation; 
  isSelected: boolean;
  onClick: () => void;
  scale: number;
}) => {
  const config = LOCATION_ICONS[location.type];
  const size = config.size * scale;
  
  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ 
        left: `${location.x}%`, 
        top: `${location.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isSelected ? 20 : location.isPlayer ? 15 : 10,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.3 }}
      whileTap={{ scale: 0.9 }}
      animate={location.isPlayer ? { 
        scale: [1, 1.1, 1],
      } : {}}
      transition={location.isPlayer ? { 
        repeat: Infinity, 
        duration: 2 
      } : {}}
    >
      {/* الظل */}
      <div 
        className="absolute rounded-full bg-black/30 blur-sm"
        style={{ 
          width: size * 0.8, 
          height: size * 0.3,
          bottom: -size * 0.15,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      
      {/* الأيقونة */}
      <div 
        className={`
          relative flex items-center justify-center rounded-full
          ${isSelected ? 'ring-4 ring-accent ring-offset-2 ring-offset-background' : ''}
          ${location.isPlayer ? 'ring-2 ring-accent' : ''}
        `}
        style={{ 
          width: size, 
          height: size,
          fontSize: size * 0.6,
          background: `radial-gradient(circle at 30% 30%, ${config.color}40, ${config.color}20)`,
          boxShadow: `0 4px 12px ${config.color}40`,
        }}
      >
        <span>{config.icon}</span>
      </div>
      
      {/* اسم الموقع */}
      <div 
        className="absolute whitespace-nowrap text-center"
        style={{ 
          top: size + 4,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <span 
          className="text-xs font-bold px-2 py-0.5 rounded bg-background/80 backdrop-blur border border-border text-foreground"
          style={{ fontSize: 10 * scale }}
        >
          {location.name}
        </span>
      </div>
      
      {/* مؤشر المستوى للأعداء */}
      {location.type === 'enemy' && location.level && (
        <div 
          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full flex items-center justify-center font-bold"
          style={{ width: 18, height: 18, fontSize: 10 }}
        >
          {location.level}
        </div>
      )}
    </motion.div>
  );
};

// لوحة تفاصيل الموقع
const LocationPanel = ({ 
  location, 
  onClose, 
  onAction,
  playerPower,
  distance
}: { 
  location: MapLocation | null;
  onClose: () => void;
  onAction: (action: string) => void;
  playerPower: number;
  distance: number;
}) => {
  if (!location) return null;
  
  const config = LOCATION_ICONS[location.type];
  
  const getActions = () => {
    switch (location.type) {
      case 'village':
        return [
          { id: 'trade', label: 'تجارة', icon: '💰' },
          { id: 'recruit', label: 'تجنيد', icon: '👥' },
        ];
      case 'forest':
        return [{ id: 'gather', label: 'جمع الحطب', icon: '🪓' }];
      case 'mine':
        return [{ id: 'mine', label: 'التعدين', icon: '⛏️' }];
      case 'enemy':
        return [{ id: 'attack', label: 'هجوم', icon: '⚔️', disabled: (location.level || 1) * 400 > playerPower }];
      case 'ruins':
        return [{ id: 'explore', label: 'استكشاف', icon: '🔍' }];
      case 'port':
        return [
          { id: 'trade', label: 'تجارة بحرية', icon: '⛵' },
          { id: 'travel', label: 'سفر', icon: '🗺️' },
        ];
      case 'tower':
        return [{ id: 'scout', label: 'استطلاع', icon: '👁️' }];
      default:
        return [];
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 z-30 w-72"
    >
      <Card className="bg-card/95 backdrop-blur border-border overflow-hidden">
        {/* الهيدر */}
        <div 
          className="p-4 text-white relative"
          style={{ background: `linear-gradient(135deg, ${config.color}, ${config.color}80)` }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute top-2 left-2 text-white/80 hover:text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{config.icon}</span>
            <div>
              <h3 className="font-bold text-lg">{location.name}</h3>
              <p className="text-sm opacity-80">
                {location.type === 'enemy' ? `مستوى ${location.level}` : 
                 location.resources ? `${location.resources} موارد` : 'موقع استراتيجي'}
              </p>
            </div>
          </div>
        </div>
        
        {/* المحتوى */}
        <div className="p-4 space-y-3">
          {/* المسافة */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Navigation className="w-4 h-4" />
              المسافة
            </span>
            <Badge variant="secondary">{distance.toFixed(0)} كم</Badge>
          </div>
          
          {/* معلومات إضافية */}
          {location.owner && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="w-4 h-4" />
                المالك
              </span>
              <span className="text-foreground">{location.owner}</span>
            </div>
          )}
          
          {/* الإجراءات */}
          <div className="grid gap-2 pt-2">
            {getActions().map(action => (
              <Button 
                key={action.id}
                variant={action.id === 'attack' ? 'destructive' : 'outline'}
                className="w-full gap-2"
                onClick={() => onAction(action.id)}
                disabled={(action as any).disabled}
              >
                <span>{action.icon}</span>
                {action.label}
              </Button>
            ))}
            
            {!location.isPlayer && (
              <Button variant="secondary" className="w-full gap-2" onClick={() => onAction('move')}>
                <Target className="w-4 h-4" />
                إرسال قوات
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// المكون الرئيسي
export const GameWorldMap = ({ 
  playerPosition, 
  playerName,
  playerPower,
  onLocationClick,
  onMove
}: GameWorldMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [locations] = useState<MapLocation[]>(() => {
    const locs = [...DEFAULT_LOCATIONS];
    // تحديث موقع اللاعب
    const playerLoc = locs.find(l => l.isPlayer);
    if (playerLoc) {
      playerLoc.x = playerPosition.x;
      playerLoc.y = playerPosition.y;
      playerLoc.name = playerName || 'قلعتي';
    }
    return locs;
  });
  
  // حساب المسافة
  const calculateDistance = useCallback((loc: MapLocation) => {
    const dx = loc.x - playerPosition.x;
    const dy = loc.y - playerPosition.y;
    return Math.sqrt(dx * dx + dy * dy) * 10; // تحويل لكيلومترات وهمية
  }, [playerPosition]);
  
  // معالجة اختيار موقع
  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location);
    onLocationClick?.(location);
  };
  
  // معالجة الإجراءات
  const handleAction = (action: string) => {
    if (!selectedLocation) return;
    
    switch (action) {
      case 'gather':
        toast.success(`جمعت ${Math.floor(Math.random() * 50) + 20} حطب من ${selectedLocation.name}!`);
        break;
      case 'mine':
        toast.success(`استخرجت ${Math.floor(Math.random() * 30) + 10} ذهب!`);
        break;
      case 'trade':
        toast.success('بدأت التجارة مع القرية!');
        break;
      case 'recruit':
        toast.success('جندت 5 مقاتلين جدد!');
        break;
      case 'attack':
        if (selectedLocation.level && selectedLocation.level * 400 > playerPower) {
          toast.error('قوتك غير كافية لهذا الهجوم!');
        } else {
          toast.success('انتصرت في المعركة! 🎉');
        }
        break;
      case 'explore':
        toast.success(`اكتشفت كنزاً! +${Math.floor(Math.random() * 100) + 50} 💎`);
        break;
      case 'scout':
        toast.info('استطلعت المنطقة المحيطة');
        break;
      case 'move':
        onMove?.(selectedLocation.x, selectedLocation.y);
        toast.info(`إرسال قوات إلى ${selectedLocation.name}`);
        break;
    }
    
    setSelectedLocation(null);
  };

  return (
    <div className="relative">
      {/* أدوات التحكم */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Badge variant="secondary">{Math.round(scale * 100)}%</Badge>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setScale(s => Math.min(2, s + 0.25))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => {
              const playerLoc = locations.find(l => l.isPlayer);
              if (playerLoc) setSelectedLocation(playerLoc);
            }}
          >
            <Locate className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Compass className="w-3 h-3" />
            {locations.filter(l => l.type === 'enemy').length} أعداء
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Home className="w-3 h-3" />
            {locations.filter(l => l.type === 'village').length} قرى
          </Badge>
        </div>
      </div>
      
      {/* الخريطة */}
      <Card 
        ref={mapRef}
        className="relative overflow-hidden border-border"
        style={{ height: 500 }}
      >
        {/* خلفية الخريطة */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 30%, rgba(34, 139, 34, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 60%, rgba(139, 115, 85, 0.2) 0%, transparent 40%),
              radial-gradient(ellipse at 50% 80%, rgba(65, 105, 225, 0.2) 0%, transparent 30%),
              radial-gradient(ellipse at 80% 20%, rgba(255, 215, 0, 0.15) 0%, transparent 35%),
              linear-gradient(180deg, 
                hsl(var(--muted) / 0.3) 0%, 
                hsl(var(--background)) 50%,
                hsl(var(--muted) / 0.2) 100%
              )
            `,
          }}
        />
        
        {/* نمط الخريطة */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235A2647' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        {/* المواقع */}
        <div 
          className="absolute inset-0 transition-transform duration-300"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
        >
          {locations.map(location => (
            <MapMarker
              key={location.id}
              location={location}
              isSelected={selectedLocation?.id === location.id}
              onClick={() => handleLocationClick(location)}
              scale={scale}
            />
          ))}
          
          {/* خطوط الربط من اللاعب للموقع المحدد */}
          {selectedLocation && !selectedLocation.isPlayer && (
            <svg 
              className="absolute inset-0 pointer-events-none"
              style={{ width: '100%', height: '100%' }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <line
                x1={`${playerPosition.x}%`}
                y1={`${playerPosition.y}%`}
                x2={`${selectedLocation.x}%`}
                y2={`${selectedLocation.y}%`}
                stroke="url(#lineGradient)"
                strokeWidth="2"
                strokeDasharray="8,4"
                className="animate-pulse"
              />
            </svg>
          )}
        </div>
        
        {/* دليل الخريطة */}
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur rounded-lg p-3 border border-border">
          <div className="grid grid-cols-4 gap-3 text-xs">
            {Object.entries(LOCATION_ICONS).slice(0, 8).map(([type, config]) => (
              <div key={type} className="flex items-center gap-1">
                <span>{config.icon}</span>
                <span className="text-muted-foreground hidden sm:inline">
                  {type === 'castle' ? 'قلعة' : 
                   type === 'village' ? 'قرية' :
                   type === 'forest' ? 'غابة' :
                   type === 'mine' ? 'منجم' :
                   type === 'enemy' ? 'عدو' :
                   type === 'ruins' ? 'أطلال' :
                   type === 'port' ? 'ميناء' : 'برج'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* لوحة تفاصيل الموقع */}
        <AnimatePresence>
          {selectedLocation && (
            <LocationPanel
              location={selectedLocation}
              onClose={() => setSelectedLocation(null)}
              onAction={handleAction}
              playerPower={playerPower}
              distance={calculateDistance(selectedLocation)}
            />
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default GameWorldMap;
