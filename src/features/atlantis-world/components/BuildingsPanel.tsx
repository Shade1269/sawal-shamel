import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowUp, Clock, Hammer, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Building, BuildingType, PlayerResources } from '../types/game';
import { BUILDING_CONFIGS, GAME_FORMULAS } from '../config/gameConfig';

interface BuildingsPanelProps {
  buildings: Building[];
  resources: PlayerResources;
  onBuild: (type: BuildingType) => { success: boolean; message: string };
  onUpgrade: (buildingId: string) => { success: boolean; message: string };
}

export const BuildingsPanel: React.FC<BuildingsPanelProps> = ({
  buildings,
  resources,
  onBuild,
  onUpgrade
}) => {
  const [showBuildDialog, setShowBuildDialog] = useState(false);

  const handleBuild = (type: BuildingType) => {
    const result = onBuild(type);
    if (result.success) {
      toast.success(result.message);
      setShowBuildDialog(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleUpgrade = (buildingId: string) => {
    const result = onUpgrade(buildingId);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const canAfford = (cost: { gold: number; wood: number; stone: number }) => {
    return resources.gold >= cost.gold && 
           resources.wood >= cost.wood && 
           resources.stone >= cost.stone;
  };

  const availableBuildings = Object.values(BUILDING_CONFIGS).filter(config => {
    // القلعة لا يمكن بناؤها مرة أخرى
    if (config.type === 'castle') return false;
    return true;
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Hammer className="w-5 h-5 text-primary" />
            المباني ({buildings.length})
          </CardTitle>
          <Dialog open={showBuildDialog} onOpenChange={setShowBuildDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="w-4 h-4" />
                بناء
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>بناء مبنى جديد</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[400px] pr-4">
                <div className="grid gap-3">
                  {availableBuildings.map((config) => {
                    const affordable = canAfford(config.baseCost);
                    return (
                      <motion.div
                        key={config.type}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-xl border transition-colors ${
                          affordable 
                            ? 'bg-card hover:bg-muted/50 cursor-pointer border-border' 
                            : 'bg-muted/30 opacity-60 border-border/50'
                        }`}
                        onClick={() => affordable && handleBuild(config.type)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                            {config.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold">{config.nameAr}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{config.description}</p>
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant="outline" className="gap-1">
                                💰 {config.baseCost.gold}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                🪵 {config.baseCost.wood}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                🪨 {config.baseCost.stone}
                              </Badge>
                              <Badge variant="secondary" className="gap-1">
                                <Clock className="w-3 h-3" />
                                {Math.floor(config.baseCost.time / 60)}د
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-2">
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {buildings.map((building) => {
                const config = BUILDING_CONFIGS[building.type];
                if (!config) return null;

                const upgradeCost = GAME_FORMULAS.upgradeCost(
                  config.baseCost,
                  building.level + 1,
                  config.upgradeMultiplier
                );
                const canUpgrade = building.level < config.maxLevel && canAfford(upgradeCost);
                const progressToMax = (building.level / config.maxLevel) * 100;

                return (
                  <motion.div
                    key={building.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
                          {config.icon}
                        </div>
                        <Badge 
                          className="absolute -bottom-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {building.level}
                        </Badge>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-sm">{config.nameAr}</h4>
                          {building.level >= config.maxLevel && (
                            <Badge variant="secondary" className="text-xs gap-1 bg-accent/20 text-accent">
                              <CheckCircle className="w-3 h-3" />
                              أقصى مستوى
                            </Badge>
                          )}
                        </div>
                        
                        <Progress value={progressToMax} className="h-1.5 mb-2" />
                        
                        {building.productionRate > 0 && (
                          <p className="text-xs text-muted-foreground mb-2">
                            الإنتاج: +{GAME_FORMULAS.productionRate(config.baseProductionRate, building.level, config.upgradeMultiplier)}/دقيقة
                          </p>
                        )}

                        {building.level < config.maxLevel && (
                          <Button
                            size="sm"
                            variant={canUpgrade ? "default" : "outline"}
                            disabled={!canUpgrade}
                            onClick={() => handleUpgrade(building.id)}
                            className="w-full gap-2"
                          >
                            <ArrowUp className="w-3 h-3" />
                            ترقية ({upgradeCost.gold} 💰)
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
