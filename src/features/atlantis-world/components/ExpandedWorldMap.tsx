import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ZoomIn, ZoomOut, Compass, Target, 
  Swords, Coins, Users, Eye, Move, X
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// أنواع البلاطات
type TileType = 'empty' | 'forest' | 'mountain' | 'goldmine' | 'farm' | 'castle' | 'village' | 'lake' | 'ruins' | 'enemy';

interface MapTile {
  id: string;
  x: number;
  y: number;
  type: TileType;
  owner?: string;
  resources?: number;
  name?: string;
  level?: number;
}

interface PlayerPosition {
  x: number;
  y: number;
}

interface ExpandedWorldMapProps {
  player: {
    name: string;
    position: PlayerPosition;
    power: number;
  };
  onTileClick?: (tile: MapTile) => void;
  onMove?: (newPosition: PlayerPosition) => void;
  onAttack?: (tile: MapTile) => void;
  onGather?: (tile: MapTile) => void;
}

// إعدادات البلاطات
const TILE_CONFIG: Record<TileType, { 
  icon: string; 
  label: string; 
  color: string; 
  canGather: boolean;
  resources?: string;
}> = {
  empty: { icon: '', label: 'أرض فارغة', color: 'bg-muted/30', canGather: false },
  forest: { icon: '🌲', label: 'غابة', color: 'bg-green-500/30', canGather: true, resources: 'حطب' },
  mountain: { icon: '⛰️', label: 'جبل', color: 'bg-stone-500/30', canGather: true, resources: 'حجر' },
  goldmine: { icon: '💰', label: 'منجم ذهب', color: 'bg-accent/30', canGather: true, resources: 'ذهب' },
  farm: { icon: '🌾', label: 'مزرعة', color: 'bg-amber-500/30', canGather: true, resources: 'طعام' },
  castle: { icon: '🏰', label: 'قلعة', color: 'bg-primary/30', canGather: false },
  village: { icon: '🏘️', label: 'قرية', color: 'bg-orange-500/30', canGather: false },
  lake: { icon: '🌊', label: 'بحيرة', color: 'bg-blue-500/30', canGather: false },
  ruins: { icon: '🏛️', label: 'أطلال', color: 'bg-purple-500/30', canGather: true, resources: 'كنوز' },
  enemy: { icon: '⚔️', label: 'معسكر عدو', color: 'bg-red-500/30', canGather: false },
};

// توليد الخريطة
const generateMap = (width: number, height: number): MapTile[] => {
  const tiles: MapTile[] = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const r = Math.random();
      let type: TileType = 'empty';
      
      // توزيع أنواع البلاطات
      if (r < 0.12) type = 'forest';
      else if (r < 0.18) type = 'mountain';
      else if (r < 0.22) type = 'goldmine';
      else if (r < 0.28) type = 'farm';
      else if (r < 0.30) type = 'lake';
      else if (r < 0.33) type = 'village';
      else if (r < 0.35) type = 'ruins';
      else if (r < 0.38) type = 'enemy';
      
      tiles.push({
        id: `${x}_${y}`,
        x,
        y,
        type,
        resources: type !== 'empty' ? Math.floor(Math.random() * 100) + 50 : undefined,
        level: type === 'enemy' ? Math.floor(Math.random() * 5) + 1 : undefined,
      });
    }
  }
  
  return tiles;
};

// مكون البلاطة
const MapTileComponent = ({ 
  tile, 
  isPlayerHere, 
  isSelected,
  isAdjacent,
  onClick,
  zoom
}: { 
  tile: MapTile; 
  isPlayerHere: boolean; 
  isSelected: boolean;
  isAdjacent: boolean;
  onClick: () => void;
  zoom: number;
}) => {
  const config = TILE_CONFIG[tile.type];
  const size = zoom === 1 ? 'w-8 h-8' : zoom === 2 ? 'w-12 h-12' : 'w-16 h-16';
  const iconSize = zoom === 1 ? 'text-xs' : zoom === 2 ? 'text-base' : 'text-xl';
  
  return (
    <motion.div
      className={`
        ${size} rounded border transition-all cursor-pointer relative
        ${config.color}
        ${isSelected ? 'ring-2 ring-primary border-primary' : 'border-border/50'}
        ${isAdjacent ? 'ring-1 ring-accent/50' : ''}
        ${isPlayerHere ? 'ring-2 ring-accent border-accent' : ''}
        hover:scale-110 hover:z-10
      `}
      onClick={onClick}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: (tile.x + tile.y) * 0.01 }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {isPlayerHere ? (
          <motion.span 
            className={iconSize}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🏰
          </motion.span>
        ) : config.icon ? (
          <span className={`${iconSize} opacity-80`}>{config.icon}</span>
        ) : null}
      </div>
      
      {/* مؤشر المستوى للأعداء */}
      {tile.type === 'enemy' && tile.level && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
          {tile.level}
        </div>
      )}
      
      {/* مؤشر الموارد */}
      {tile.resources && tile.type !== 'empty' && tile.type !== 'enemy' && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-accent rounded-full" />
      )}
    </motion.div>
  );
};

// لوحة معلومات البلاطة
const TileInfoPanel = ({ 
  tile, 
  onClose, 
  onMove, 
  onAttack, 
  onGather,
  canMove,
  playerPower
}: { 
  tile: MapTile | null; 
  onClose: () => void;
  onMove: () => void;
  onAttack: () => void;
  onGather: () => void;
  canMove: boolean;
  playerPower: number;
}) => {
  if (!tile) return null;
  
  const config = TILE_CONFIG[tile.type];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 left-4 right-4 z-20"
    >
      <Card className="bg-card/95 backdrop-blur border-border p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center text-2xl border border-border`}>
              {config.icon || '🗺️'}
            </div>
            <div>
              <h4 className="text-foreground font-bold">{config.label}</h4>
              <p className="text-muted-foreground text-sm">
                الموقع: ({tile.x}, {tile.y})
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* معلومات إضافية */}
        <div className="flex flex-wrap gap-2 mb-3">
          {tile.resources && (
            <Badge variant="secondary" className="gap-1">
              <Coins className="w-3 h-3" />
              {tile.resources} {config.resources}
            </Badge>
          )}
          {tile.level && (
            <Badge variant="destructive" className="gap-1">
              <Swords className="w-3 h-3" />
              مستوى {tile.level}
            </Badge>
          )}
          {tile.owner && (
            <Badge variant="outline" className="gap-1">
              <Users className="w-3 h-3" />
              {tile.owner}
            </Badge>
          )}
        </div>
        
        {/* الإجراءات */}
        <div className="flex gap-2">
          {canMove && tile.type !== 'lake' && tile.type !== 'mountain' && (
            <Button size="sm" variant="outline" onClick={onMove} className="flex-1 gap-1">
              <Move className="w-4 h-4" />
              انتقال
            </Button>
          )}
          {tile.type === 'enemy' && (
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={onAttack} 
              className="flex-1 gap-1"
              disabled={tile.level ? tile.level * 300 > playerPower : false}
            >
              <Swords className="w-4 h-4" />
              هجوم
            </Button>
          )}
          {config.canGather && tile.resources && tile.resources > 0 && (
            <Button size="sm" onClick={onGather} className="flex-1 gap-1">
              <Target className="w-4 h-4" />
              جمع
            </Button>
          )}
          {tile.type === 'village' && (
            <Button size="sm" variant="secondary" className="flex-1 gap-1">
              <Users className="w-4 h-4" />
              تجارة
            </Button>
          )}
          {tile.type === 'ruins' && (
            <Button size="sm" variant="secondary" className="flex-1 gap-1">
              <Eye className="w-4 h-4" />
              استكشاف
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

// المكون الرئيسي
export const ExpandedWorldMap = ({ 
  player, 
  onTileClick, 
  onMove,
  onAttack,
  onGather
}: ExpandedWorldMapProps) => {
  const [zoom, setZoom] = useState(2); // 1 = صغير, 2 = متوسط, 3 = كبير
  const [selectedTile, setSelectedTile] = useState<MapTile | null>(null);
  const [mapSize] = useState({ width: 15, height: 12 });
  
  // توليد الخريطة
  const tiles = useMemo(() => generateMap(mapSize.width, mapSize.height), [mapSize]);
  
  // التحقق من البلاطات المجاورة
  const isAdjacent = useCallback((tile: MapTile) => {
    const dx = Math.abs(tile.x - player.position.x);
    const dy = Math.abs(tile.y - player.position.y);
    return (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);
  }, [player.position]);
  
  // معالجة النقر على البلاطة
  const handleTileClick = (tile: MapTile) => {
    setSelectedTile(tile);
    onTileClick?.(tile);
  };
  
  // معالجة الانتقال
  const handleMove = () => {
    if (selectedTile && isAdjacent(selectedTile)) {
      onMove?.({ x: selectedTile.x, y: selectedTile.y });
      toast.success(`انتقلت إلى (${selectedTile.x}, ${selectedTile.y})`);
      setSelectedTile(null);
    }
  };
  
  // معالجة الهجوم
  const handleAttack = () => {
    if (selectedTile && selectedTile.type === 'enemy') {
      onAttack?.(selectedTile);
      toast.success('بدأت الهجوم! ⚔️');
    }
  };
  
  // معالجة الجمع
  const handleGather = () => {
    if (selectedTile) {
      onGather?.(selectedTile);
      toast.success(`جمعت ${selectedTile.resources} من ${TILE_CONFIG[selectedTile.type].resources}!`);
    }
  };

  // إحصائيات الخريطة
  const mapStats = useMemo(() => {
    const stats = { forests: 0, mountains: 0, goldmines: 0, enemies: 0, villages: 0 };
    tiles.forEach(tile => {
      if (tile.type === 'forest') stats.forests++;
      else if (tile.type === 'mountain') stats.mountains++;
      else if (tile.type === 'goldmine') stats.goldmines++;
      else if (tile.type === 'enemy') stats.enemies++;
      else if (tile.type === 'village') stats.villages++;
    });
    return stats;
  }, [tiles]);

  return (
    <div className="relative">
      {/* شريط الأدوات */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setZoom(z => Math.max(1, z - 1))}
            disabled={zoom === 1}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setZoom(z => Math.min(3, z + 1))}
            disabled={zoom === 3}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Badge variant="secondary" className="gap-1">
            <Compass className="w-3 h-3" />
            {player.position.x}, {player.position.y}
          </Badge>
        </div>
        
        {/* إحصائيات سريعة */}
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="gap-1">🌲 {mapStats.forests}</Badge>
          <Badge variant="outline" className="gap-1">💰 {mapStats.goldmines}</Badge>
          <Badge variant="outline" className="gap-1">⚔️ {mapStats.enemies}</Badge>
          <Badge variant="outline" className="gap-1">🏘️ {mapStats.villages}</Badge>
        </div>
      </div>
      
      {/* الخريطة */}
      <Card className="bg-card border-border p-3 relative overflow-hidden">
        <ScrollArea className="h-[400px]">
          <div 
            className="grid gap-1 p-2"
            style={{ 
              gridTemplateColumns: `repeat(${mapSize.width}, minmax(0, 1fr))`,
            }}
          >
            {tiles.map((tile) => (
              <MapTileComponent
                key={tile.id}
                tile={tile}
                isPlayerHere={tile.x === player.position.x && tile.y === player.position.y}
                isSelected={selectedTile?.id === tile.id}
                isAdjacent={isAdjacent(tile)}
                onClick={() => handleTileClick(tile)}
                zoom={zoom}
              />
            ))}
          </div>
        </ScrollArea>
        
        {/* دليل الخريطة */}
        <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur rounded-lg p-2 border border-border">
          <div className="grid grid-cols-5 gap-1 text-xs">
            <div className="flex items-center gap-1"><span>🌲</span><span className="text-muted-foreground hidden sm:inline">غابة</span></div>
            <div className="flex items-center gap-1"><span>⛰️</span><span className="text-muted-foreground hidden sm:inline">جبل</span></div>
            <div className="flex items-center gap-1"><span>💰</span><span className="text-muted-foreground hidden sm:inline">ذهب</span></div>
            <div className="flex items-center gap-1"><span>⚔️</span><span className="text-muted-foreground hidden sm:inline">عدو</span></div>
            <div className="flex items-center gap-1"><span>🏰</span><span className="text-muted-foreground hidden sm:inline">أنت</span></div>
          </div>
        </div>
        
        {/* لوحة معلومات البلاطة */}
        <AnimatePresence>
          {selectedTile && (
            <TileInfoPanel
              tile={selectedTile}
              onClose={() => setSelectedTile(null)}
              onMove={handleMove}
              onAttack={handleAttack}
              onGather={handleGather}
              canMove={isAdjacent(selectedTile)}
              playerPower={player.power}
            />
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default ExpandedWorldMap;
