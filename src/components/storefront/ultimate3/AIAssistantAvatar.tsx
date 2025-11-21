import { useState, useEffect, useRef } from 'react';
import { useGamingSettings } from '@/contexts/GamingSettingsContext';
import { MessageCircle, X, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import '@/styles/ultimate-effects-3.css';

interface Message {
  id: number;
  text: string;
  type: 'ai' | 'user';
  timestamp: Date;
}

type Expression = 'happy' | 'neutral' | 'thinking' | 'excited' | 'waving';

/**
 * AI Assistant Avatar
 * مساعد AI يطفو على الشاشة ويساعد العملاء
 */
export const AIAssistantAvatar = () => {
  const { settings } = useGamingSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [expression, setExpression] = useState<Expression>('neutral');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // AI Suggestions based on browsing
  const suggestions = [
    "مرحبًا! كيف يمكنني مساعدتك اليوم؟ 👋",
    "هل تبحث عن منتج معين؟ يمكنني مساعدتك في إيجاده!",
    "لدينا عروض رائعة اليوم! تحقق من المنتجات المميزة 🌟",
    "هل لديك أسئلة عن التوصيل أو الضمان؟",
    "يمكنني مساعدتك في مقارنة المنتجات المختلفة!",
  ];

  // Welcome message
  useEffect(() => {
    if (!settings.isGamingMode) return;

    const timer = setTimeout(() => {
      setExpression('waving');
      speak(suggestions[0]);
      setTimeout(() => setExpression('happy'), 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [settings]);

  // Text-to-Speech
  const speak = (text: string) => {
    if (!soundEnabled || !settings.enableSoundEffects) return;

    setIsSpeaking(true);
    setExpression('excited');

    // Add message to chat
    const newMessage: Message = {
      id: Date.now(),
      text,
      type: 'ai',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);

    // Use Web Speech API if available
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      utterance.onend = () => {
        setIsSpeaking(false);
        setExpression('happy');
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setIsSpeaking(false);
        setExpression('happy');
      }, 2000);
    }
  };

  // Random helpful messages
  useEffect(() => {
    if (!settings.isGamingMode || !isOpen) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        speak(randomSuggestion);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [settings, isOpen]);

  // Dragging functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!settings.isGamingMode) return null;

  // Avatar expressions as emoji
  const getAvatarEmoji = () => {
    switch (expression) {
      case 'happy': return '😊';
      case 'thinking': return '🤔';
      case 'excited': return '🤩';
      case 'waving': return '👋';
      default: return '😐';
    }
  };

  return (
    <>
      {/* Floating Avatar Button */}
      <div
        className="fixed z-[9999] cursor-move"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transition: isDragging ? 'none' : 'all 0.3s ease',
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          className={`
            relative w-20 h-20 rounded-full
            bg-gradient-to-br from-purple-500 to-pink-500
            border-4 border-white/30
            shadow-2xl
            hover:scale-110 transition-transform
            ${isSpeaking ? 'animate-pulse' : ''}
          `}
          style={{
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(236, 72, 153, 0.3)',
          }}
        >
          {/* Holographic Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-75" />

          {/* Avatar Face */}
          <div
            className="absolute inset-0 flex items-center justify-center text-4xl cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            {getAvatarEmoji()}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSoundEnabled(!soundEnabled);
            }}
            className="absolute -top-2 -right-2 bg-white/90 rounded-full p-1 shadow-lg hover:bg-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
          </button>

          {/* Status Indicator */}
          {isSpeaking && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed z-[9998] bg-black/90 backdrop-blur-xl rounded-2xl border-2 border-purple-500/50 shadow-2xl overflow-hidden"
          style={{
            left: `${position.x + 100}px`,
            top: `${position.y}px`,
            width: '350px',
            maxHeight: '500px',
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                {getAvatarEmoji()}
              </div>
              <div>
                <h3 className="font-bold text-white">مساعد AI</h3>
                <p className="text-xs text-white/80">أنا هنا لمساعدتك!</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="p-4 h-[350px] overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-10">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>ابدأ المحادثة!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'ai' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`
                      max-w-[80%] p-3 rounded-2xl
                      ${msg.type === 'ai'
                        ? 'bg-purple-600/30 text-white border border-purple-500/50'
                        : 'bg-pink-600/30 text-white border border-pink-500/50'
                      }
                    `}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {msg.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-purple-500/30 space-y-2">
            <p className="text-xs text-gray-400 mb-2">اختصارات سريعة:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: '🔍', text: 'ابحث عن منتج', action: () => speak('ما المنتج الذي تبحث عنه؟') },
                { icon: '💰', text: 'العروض', action: () => speak('لدينا عروض رائعة! تحقق من قسم العروض الخاصة') },
                { icon: '📦', text: 'التوصيل', action: () => speak('التوصيل مجاني للطلبات فوق 200 ريال!') },
                { icon: '❓', text: 'مساعدة', action: () => speak('كيف يمكنني مساعدتك؟') },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setExpression('thinking');
                    setTimeout(() => action.action(), 500);
                  }}
                  className="flex items-center gap-2 p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg transition-colors text-sm text-white"
                >
                  <span>{action.icon}</span>
                  <span>{action.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
