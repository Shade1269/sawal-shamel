import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlayerResources } from '../types/game';

interface ResourcesBarProps {
  resources: PlayerResources;
  compact?: boolean;
}

const RESOURCE_CONFIG = [
  { key: 'gold', icon: '💰', label: 'ذهب', color: 'text-yellow-400 bg-yellow-500/20' },
  { key: 'wood', icon: '🪵', label: 'خشب', color: 'text-amber-600 bg-amber-600/20' },
  { key: 'stone', icon: '🪨', label: 'حجر', color: 'text-stone-400 bg-stone-500/20' },
  { key: 'food', icon: '🍖', label: 'طعام', color: 'text-green-400 bg-green-500/20' },
  { key: 'gems', icon: '💎', label: 'جواهر', color: 'text-purple-400 bg-purple-500/20' },
];

export const ResourcesBar: React.FC<ResourcesBarProps> = ({ resources, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {RESOURCE_CONFIG.slice(0, 4).map((config) => (
          <Badge 
            key={config.key}
            variant="outline" 
            className={`${config.color} gap-1 text-xs`}
          >
            <span>{config.icon}</span>
            {resources[config.key as keyof PlayerResources].toLocaleString()}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-muted/50 via-background to-muted/50 border border-border/50">
        {RESOURCE_CONFIG.map((config, index) => {
          const value = resources[config.key as keyof PlayerResources];
          
          return (
            <React.Fragment key={config.key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.color} cursor-default`}
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="text-lg">{config.icon}</span>
                    <span className="font-bold tabular-nums">
                      {value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString()}
                    </span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{config.label}: {value.toLocaleString()}</p>
                </TooltipContent>
              </Tooltip>
              
              {index < RESOURCE_CONFIG.length - 1 && (
                <div className="h-6 w-px bg-border/50" />
              )}
            </React.Fragment>
          );
        })}
        
        {/* نقاط أتلانتس */}
        <div className="h-6 w-px bg-border/50" />
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div 
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/20 text-primary cursor-default"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-bold">{resources.atlantisPoints.toLocaleString()}</span>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>نقاط أتلانتس المرتبطة بالمنصة</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
