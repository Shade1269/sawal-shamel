import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Building2, 
  Swords, 
  Crown,
  ArrowLeft,
  Map,
  LayoutGrid
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { WorldMap } from '@/features/atlantis-world/components/WorldMap';
import { PlayerProfileCard } from '@/features/atlantis-world/components/PlayerProfileCard';
import { BuildingsPanel } from '@/features/atlantis-world/components/BuildingsPanel';
import { TroopsPanel } from '@/features/atlantis-world/components/TroopsPanel';
import { EventsLog } from '@/features/atlantis-world/components/EventsLog';
import { ResourcesBar } from '@/features/atlantis-world/components/ResourcesBar';
import { useAtlantisWorld } from '@/features/atlantis-world/hooks/useAtlantisWorld';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

const AtlantisWorld = () => {
  const {
    player,
    events,
    isLoading,
    totalPower,
    atlantisSystem,
    buildBuilding,
    upgradeBuilding,
    trainTroops
  } = useAtlantisWorld();

  const [activeView, setActiveView] = useState<'map' | 'kingdom'>('kingdom');

  if (isLoading) {
    return (
      <UnifiedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent"
          />
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background">
        {/* الهيدر */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/atlantis">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">عالم أتلانتس</h1>
                    <p className="text-xs text-muted-foreground">ابنِ مملكتك وحارب من أجل المجد</p>
                  </div>
                </div>
              </div>

              {/* شريط الموارد */}
              {player && (
                <ResourcesBar resources={player.resources} />
              )}
            </div>
          </div>
        </header>

        {/* المحتوى الرئيسي */}
        <main className="container mx-auto px-4 py-6">
          {/* أزرار التبديل */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Button
              variant={activeView === 'kingdom' ? 'default' : 'outline'}
              onClick={() => setActiveView('kingdom')}
              className="gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              مملكتي
            </Button>
            <Button
              variant={activeView === 'map' ? 'default' : 'outline'}
              onClick={() => setActiveView('map')}
              className="gap-2"
            >
              <Map className="w-4 h-4" />
              خريطة العالم
            </Button>
          </div>

          {activeView === 'map' ? (
            /* عرض الخريطة */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-[600px] rounded-2xl overflow-hidden border border-border"
            >
              <WorldMap player={player} />
            </motion.div>
          ) : (
            /* عرض المملكة */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* العمود الأيسر - البروفايل والأحداث */}
              <div className="lg:col-span-4 space-y-6">
                <PlayerProfileCard 
                  player={player} 
                  atlantisLevel={atlantisSystem.userLevel?.current_level} 
                />
                <EventsLog events={events} />
              </div>

              {/* العمود الأوسط والأيمن - المباني والجنود */}
              <div className="lg:col-span-8">
                <Tabs defaultValue="buildings" className="w-full">
                  <TabsList className="w-full mb-4 grid grid-cols-2">
                    <TabsTrigger value="buildings" className="gap-2">
                      <Building2 className="w-4 h-4" />
                      المباني
                    </TabsTrigger>
                    <TabsTrigger value="troops" className="gap-2">
                      <Swords className="w-4 h-4" />
                      الجيش
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="buildings">
                    {player && (
                      <BuildingsPanel
                        buildings={player.buildings}
                        resources={player.resources}
                        onBuild={buildBuilding}
                        onUpgrade={upgradeBuilding}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="troops">
                    {player && (
                      <TroopsPanel
                        troops={player.troops}
                        resources={player.resources}
                        onTrain={trainTroops}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          )}
        </main>

        {/* شريط سفلي للإحصائيات */}
        <footer className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur border-t border-border py-3 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span>القوة الإجمالية: <strong>{totalPower.toLocaleString()}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>المباني: <strong>{player?.buildings.length || 0}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-destructive" />
                  <span>الجنود: <strong>{player?.troops.reduce((s, t) => s + t.count, 0) || 0}</strong></span>
                </div>
              </div>
              
              <Badge 
                variant="outline" 
                className="bg-accent/20 text-accent border-accent/40"
              >
                مرتبط بنظام نقاط أتلانتس
              </Badge>
            </div>
          </div>
        </footer>
      </div>
    </UnifiedLayout>
  );
};

export default AtlantisWorld;
