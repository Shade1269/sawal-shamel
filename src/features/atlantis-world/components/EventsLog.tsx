import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Swords, 
  ArrowUp, 
  Users, 
  Coins, 
  Trophy,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GameEvent } from '../types/game';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface EventsLogProps {
  events: GameEvent[];
}

const EVENT_ICONS: Record<GameEvent['type'], React.ReactNode> = {
  battle: <Swords className="w-4 h-4 text-red-400" />,
  upgrade: <ArrowUp className="w-4 h-4 text-blue-400" />,
  training: <Users className="w-4 h-4 text-green-400" />,
  resource: <Coins className="w-4 h-4 text-yellow-400" />,
  alliance: <Trophy className="w-4 h-4 text-purple-400" />,
  quest: <Trophy className="w-4 h-4 text-orange-400" />
};

const EVENT_COLORS: Record<GameEvent['type'], string> = {
  battle: 'bg-red-500/10 border-red-500/30',
  upgrade: 'bg-blue-500/10 border-blue-500/30',
  training: 'bg-green-500/10 border-green-500/30',
  resource: 'bg-yellow-500/10 border-yellow-500/30',
  alliance: 'bg-purple-500/10 border-purple-500/30',
  quest: 'bg-orange-500/10 border-orange-500/30'
};

export const EventsLog: React.FC<EventsLogProps> = ({ events }) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="w-5 h-5 text-accent" />
          سجل الأحداث
          {events.length > 0 && (
            <Badge variant="secondary" className="mr-auto">
              {events.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد أحداث بعد</p>
              <p className="text-sm">ابدأ اللعب لتظهر الأحداث هنا</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border ${EVENT_COLORS[event.type]} transition-colors hover:opacity-80`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {EVENT_ICONS[event.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">
                          {event.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(event.timestamp), { 
                            addSuffix: true, 
                            locale: ar 
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
