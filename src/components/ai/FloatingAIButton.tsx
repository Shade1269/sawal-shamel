import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles, FileText, ImageIcon, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnifiedAIAssistant } from './UnifiedAIAssistant';
import { useNavigate } from 'react-router-dom';

interface FloatingAIButtonProps {
  context?: 'marketer' | 'customer' | 'admin';
  storeInfo?: {
    store_name?: string;
    bio?: string;
  };
  products?: any[];
}

export function FloatingAIButton({ context = 'marketer', storeInfo, products }: FloatingAIButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { id: 'chat', label: 'المساعد الذكي', icon: Bot, action: () => setIsOpen(true) },
    { id: 'studio', label: 'استوديو AI', icon: Sparkles, action: () => navigate('/ai-studio') },
    { id: 'content', label: 'توليد محتوى', icon: FileText, action: () => navigate('/ai-studio?tab=content') },
    { id: 'images', label: 'توليد صور', icon: ImageIcon, action: () => navigate('/ai-studio?tab=images') },
    { id: 'analytics', label: 'تحليلات ذكية', icon: Brain, action: () => navigate('/ai-studio?tab=analytics') },
  ];

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <AnimatePresence>
          {showMenu && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-16 left-0 bg-card border rounded-xl shadow-xl p-2 min-w-[180px]"
            >
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    item.action();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMenu(!showMenu)}
          className="relative p-4 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <AnimatePresence mode="wait">
            {showMenu ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="bot"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <Bot className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
          
          {/* AI Badge */}
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
            <Sparkles className="h-3 w-3 text-yellow-400" />
          </span>
        </motion.button>
      </div>

      {/* Chat Assistant */}
      <AnimatePresence>
        {isOpen && (
          <UnifiedAIAssistant
            context={context}
            storeInfo={storeInfo}
            products={products}
            floating
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
