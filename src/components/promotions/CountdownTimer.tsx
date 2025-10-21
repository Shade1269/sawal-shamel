import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endDate: string;
  onExpire?: () => void;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endDate,
  onExpire,
  className = "",
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(endDate) - +new Date();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (!isExpired) {
          setIsExpired(true);
          onExpire?.();
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate, isExpired, onExpire]);

  if (isExpired) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <Clock className="h-4 w-4" />
        <span>انتهى العرض</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="h-4 w-4 text-destructive" />
      <div className="flex items-center gap-1 font-mono text-sm">
        {timeLeft.days > 0 && (
          <>
            <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-bold">
              {timeLeft.days.toString().padStart(2, '0')}
            </span>
            <span className="text-muted-foreground">:</span>
          </>
        )}
        <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-bold">
          {timeLeft.hours.toString().padStart(2, '0')}
        </span>
        <span className="text-muted-foreground">:</span>
        <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-bold">
          {timeLeft.minutes.toString().padStart(2, '0')}
        </span>
        <span className="text-muted-foreground">:</span>
        <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-bold">
          {timeLeft.seconds.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};