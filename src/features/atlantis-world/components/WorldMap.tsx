import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Castle, Trees, Mountain, Droplets, Swords, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlayerProfile, MapTile, TileType } from '../types/game';

interface WorldMapProps {
  player: PlayerProfile | null;
  onTileClick?: (tile: MapTile) => void;
}

// توليد خريطة عشوائية
const generateMapTiles = (): MapTile[] => {
  const tiles: MapTile[] = [];
  const mapSize = 12;

  for (let y = 0; y < mapSize; y++) {
    for (let x = 0; x < mapSize; x++) {
      const random = Math.random();
      let type: TileType = 'empty';

      if (random < 0.15) type = 'forest';
      else if (random < 0.25) type = 'mountain';
      else if (random < 0.30) type = 'lake';
      else if (random < 0.35) type = 'goldmine';
      else if (random < 0.40) type = 'farm';
      else if (random < 0.45) type = 'ruins';
      else if (random < 0.50) type = 'village';

      tiles.push({
        id: `tile_${x}_${y}`,
        x,
        y,
        type,
        resourceAmount: type !== 'empty' ? Math.floor(Math.random() * 500) + 100 : 0
      });
    }
  }

  return tiles;
};

const TILE_ICONS: Record<TileType, React.ReactNode> = {
  empty: null,
  forest: <Trees className="w-4 h-4 text-green-500" />,
  mountain: <Mountain className="w-4 h-4 text-stone-500" />,
  lake: <Droplets className="w-4 h-4 text-blue-500" />,
  castle: <Castle className="w-4 h-4 text-amber-500" />,
  village: <Users className="w-4 h-4 text-orange-500" />,
  ruins: <Sparkles className="w-4 h-4 text-purple-500" />,
  goldmine: <span className="text-sm">💰</span>,
  farm: <span className="text-sm">🌾</span>
};

const TILE_NAMES: Record<TileType, string> = {
  empty: 'أرض فارغة',
  forest: 'غابة',
  mountain: 'جبل',
  lake: 'بحيرة',
  castle: 'قلعة',
  village: 'قرية',
  ruins: 'آثار قديمة',
  goldmine: 'منجم ذهب',
  farm: 'مزرعة'
};

const TILE_COLORS: Record<TileType, string> = {
  empty: 'bg-muted/30',
  forest: 'bg-green-500/20 border-green-500/40',
  mountain: 'bg-stone-500/20 border-stone-500/40',
  lake: 'bg-blue-500/20 border-blue-500/40',
  castle: 'bg-amber-500/20 border-amber-500/40',
  village: 'bg-orange-500/20 border-orange-500/40',
  ruins: 'bg-purple-500/20 border-purple-500/40',
  goldmine: 'bg-yellow-500/20 border-yellow-500/40',
  farm: 'bg-lime-500/20 border-lime-500/40'
};

export const WorldMap: React.FC<WorldMapProps> = ({ player, onTileClick }) => {
  const [selectedTile, setSelectedTile] = useState<MapTile | null>(null);
  const [mapZoom, setMapZoom] = useState(1);
  
  const tiles = useMemo(() => generateMapTiles(), []);

  const handleTileClick = (tile: MapTile) => {
    setSelectedTile(tile);
    onTileClick?.(tile);
  };

  const playerPosition = player?.position || { x: 6, y: 6 };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background via-muted/20 to-background rounded-2xl overflow-hidden border border-border/50">
      {/* شريط أدوات الخريطة */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            <MapPin className="w-3 h-3 ml-1" />
            عالم أتلانتس
          </Badge>
          <Badge variant="outline" className="bg-background/80">
            الإحداثيات: {playerPosition.x}, {playerPosition.y}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMapZoom(z => Math.max(0.5, z - 0.25))}
            className="h-8 w-8 p-0"
          >
            -
          </Button>
          <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
            {Math.round(mapZoom * 100)}%
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMapZoom(z => Math.min(2, z + 0.25))}
            className="h-8 w-8 p-0"
          >
            +
          </Button>
        </div>
      </div>

      {/* الخريطة */}
      <div 
        className="absolute inset-0 pt-16 pb-4 px-4 overflow-auto"
        style={{ transform: `scale(${mapZoom})`, transformOrigin: 'center center' }}
      >
        <TooltipProvider>
          <div className="grid grid-cols-12 gap-1 min-w-max mx-auto">
            {tiles.map((tile) => {
              const isPlayerPosition = tile.x === playerPosition.x && tile.y === playerPosition.y;
              
              return (
                <Tooltip key={tile.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (tile.x + tile.y) * 0.01 }}
                      onClick={() => handleTileClick(tile)}
                      className={`
                        relative w-10 h-10 rounded-lg border cursor-pointer
                        transition-all duration-200 flex items-center justify-center
                        ${TILE_COLORS[tile.type]}
                        ${selectedTile?.id === tile.id ? 'ring-2 ring-primary scale-110 z-10' : ''}
                        ${isPlayerPosition ? 'ring-2 ring-accent animate-pulse' : ''}
                        hover:scale-105 hover:z-10
                      `}
                    >
                      {isPlayerPosition ? (
                        <motion.div
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <Castle className="w-5 h-5 text-accent" />
                        </motion.div>
                      ) : (
                        TILE_ICONS[tile.type]
                      )}
                      
                      {tile.ownerId && !isPlayerPosition && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full" />
                      )}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-right">
                    <div className="space-y-1">
                      <p className="font-bold">{TILE_NAMES[tile.type]}</p>
                      <p className="text-xs text-muted-foreground">
                        الإحداثيات: ({tile.x}, {tile.y})
                      </p>
                      {tile.resourceAmount && tile.resourceAmount > 0 && (
                        <p className="text-xs text-accent">
                          الموارد: {tile.resourceAmount}
                        </p>
                      )}
                      {isPlayerPosition && (
                        <Badge variant="secondary" className="text-xs">
                          موقعك
                        </Badge>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>

      {/* معلومات الخانة المحددة */}
      <AnimatePresence>
        {selectedTile && selectedTile.x !== playerPosition.x && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur border border-border rounded-xl p-4 z-20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg ${TILE_COLORS[selectedTile.type]} flex items-center justify-center`}>
                  {TILE_ICONS[selectedTile.type] || <MapPin className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold">{TILE_NAMES[selectedTile.type]}</h4>
                  <p className="text-sm text-muted-foreground">
                    ({selectedTile.x}, {selectedTile.y})
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {selectedTile.type !== 'empty' && selectedTile.type !== 'lake' && (
                  <>
                    <Button size="sm" variant="outline">
                      <Swords className="w-4 h-4 ml-1" />
                      هجوم
                    </Button>
                    <Button size="sm" variant="default">
                      استكشاف
                    </Button>
                  </>
                )}
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setSelectedTile(null)}
                >
                  إغلاق
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* وسيلة إيضاح */}
      <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur rounded-lg p-2 border border-border/50 z-10">
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(TILE_NAMES).slice(1, 6).map(([type, name]) => (
            <div key={type} className="flex items-center gap-1">
              {TILE_ICONS[type as TileType]}
              <span className="text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
