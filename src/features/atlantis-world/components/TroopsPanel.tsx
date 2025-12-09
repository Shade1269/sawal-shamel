import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Shield, Zap, Users, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Troop, TroopType, PlayerResources } from '../types/game';
import { TROOP_CONFIGS } from '../config/gameConfig';

interface TroopsPanelProps {
  troops: Troop[];
  resources: PlayerResources;
  onTrain: (type: TroopType, count: number) => { success: boolean; message: string };
}

export const TroopsPanel: React.FC<TroopsPanelProps> = ({
  troops,
  resources,
  onTrain
}) => {
  const [showTrainDialog, setShowTrainDialog] = useState(false);
  const [selectedTroop, setSelectedTroop] = useState<TroopType | null>(null);
  const [trainCount, setTrainCount] = useState(10);

  const totalTroops = troops.reduce((sum, t) => sum + t.count, 0);
  const totalAttack = troops.reduce((sum, t) => {
    const config = TROOP_CONFIGS[t.type];
    return sum + (config ? config.attack * t.count : 0);
  }, 0);
  const totalDefense = troops.reduce((sum, t) => {
    const config = TROOP_CONFIGS[t.type];
    return sum + (config ? config.defense * t.count : 0);
  }, 0);

  const handleTrain = () => {
    if (!selectedTroop) return;
    
    const result = onTrain(selectedTroop, trainCount);
    if (result.success) {
      toast.success(result.message);
      setShowTrainDialog(false);
      setSelectedTroop(null);
      setTrainCount(10);
    } else {
      toast.error(result.message);
    }
  };

  const getMaxTrainable = (type: TroopType) => {
    const config = TROOP_CONFIGS[type];
    if (!config) return 0;
    
    const maxByGold = Math.floor(resources.gold / config.cost.gold);
    const maxByFood = config.cost.food > 0 ? Math.floor(resources.food / config.cost.food) : Infinity;
    const maxByWood = config.cost.wood > 0 ? Math.floor(resources.wood / config.cost.wood) : Infinity;
    
    return Math.min(maxByGold, maxByFood, maxByWood, 100);
  };

  const selectedConfig = selectedTroop ? TROOP_CONFIGS[selectedTroop] : null;
  const maxTrainable = selectedTroop ? getMaxTrainable(selectedTroop) : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Swords className="w-5 h-5 text-destructive" />
            الجيش
          </CardTitle>
          <Dialog open={showTrainDialog} onOpenChange={(open) => {
            setShowTrainDialog(open);
            if (!open) {
              setSelectedTroop(null);
              setTrainCount(10);
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="destructive" className="gap-1">
                <Plus className="w-4 h-4" />
                تدريب
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>تدريب الجنود</DialogTitle>
              </DialogHeader>

              {!selectedTroop ? (
                <ScrollArea className="max-h-[350px] pr-4">
                  <div className="grid gap-3">
                    {Object.values(TROOP_CONFIGS).map((config) => {
                      const max = getMaxTrainable(config.type);
                      const canTrain = max > 0;

                      return (
                        <motion.div
                          key={config.type}
                          whileHover={{ scale: canTrain ? 1.02 : 1 }}
                          className={`p-4 rounded-xl border transition-colors ${
                            canTrain 
                              ? 'bg-card hover:bg-muted/50 cursor-pointer border-border' 
                              : 'bg-muted/30 opacity-60 border-border/50'
                          }`}
                          onClick={() => canTrain && setSelectedTroop(config.type)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                                <Swords className="w-6 h-6 text-destructive" />
                              </div>
                              <div>
                                <h4 className="font-bold">{config.nameAr}</h4>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1">
                                    <Swords className="w-3 h-3 text-red-400" />
                                    {config.attack}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Shield className="w-3 h-3 text-blue-400" />
                                    {config.defense}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-yellow-400" />
                                    {config.speed}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-left">
                              <Badge variant="outline" className="text-xs">
                                💰 {config.cost.gold}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                متاح: {max}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                    <div className="w-16 h-16 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <Swords className="w-8 h-8 text-destructive" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{selectedConfig?.nameAr}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>⚔️ {selectedConfig?.attack}</span>
                        <span>🛡️ {selectedConfig?.defense}</span>
                        <span>⚡ {selectedConfig?.speed}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">العدد</span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => setTrainCount(c => Math.max(1, c - 10))}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-xl font-bold min-w-[4rem] text-center">
                          {trainCount}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => setTrainCount(c => Math.min(maxTrainable, c + 10))}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Slider
                      value={[trainCount]}
                      onValueChange={([v]) => setTrainCount(v)}
                      min={1}
                      max={maxTrainable}
                      step={1}
                      className="mb-4"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50">
                    <h5 className="font-medium mb-2">التكلفة الإجمالية</h5>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="gap-1">
                        💰 {(selectedConfig?.cost.gold || 0) * trainCount}
                      </Badge>
                      {(selectedConfig?.cost.wood || 0) > 0 && (
                        <Badge variant="outline" className="gap-1">
                          🪵 {selectedConfig!.cost.wood * trainCount}
                        </Badge>
                      )}
                      <Badge variant="outline" className="gap-1">
                        🍖 {(selectedConfig?.cost.food || 0) * trainCount}
                      </Badge>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedTroop(null)}>
                      رجوع
                    </Button>
                    <Button onClick={handleTrain} className="gap-2">
                      <Swords className="w-4 h-4" />
                      تدريب {trainCount} جندي
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* ملخص الجيش */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{totalTroops}</p>
            <p className="text-xs text-muted-foreground">إجمالي</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-500/10">
            <Swords className="w-4 h-4 mx-auto mb-1 text-red-400" />
            <p className="text-lg font-bold">{totalAttack}</p>
            <p className="text-xs text-muted-foreground">هجوم</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-500/10">
            <Shield className="w-4 h-4 mx-auto mb-1 text-blue-400" />
            <p className="text-lg font-bold">{totalDefense}</p>
            <p className="text-xs text-muted-foreground">دفاع</p>
          </div>
        </div>

        {/* قائمة الجنود */}
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {troops.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Swords className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا يوجد جنود بعد</p>
                <p className="text-sm">قم بتدريب جنودك الأوائل!</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {troops.map((troop) => {
                  const config = TROOP_CONFIGS[troop.type];
                  if (!config) return null;

                  return (
                    <motion.div
                      key={troop.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 rounded-xl border border-border bg-card flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                          <Swords className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                          <h5 className="font-medium">{config.nameAr}</h5>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>⚔️ {config.attack * troop.count}</span>
                            <span>🛡️ {config.defense * troop.count}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-lg px-3">
                        ×{troop.count}
                      </Badge>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
