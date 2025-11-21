import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

export const GamingParticles = () => {
  const particles: Particle[] = [];
  const colors = [
    '#00f0ff', // neon blue
    '#ff006e', // neon pink
    '#a855f7', // neon purple
    '#39ff14', // neon green
    '#ff9500', // neon orange
  ];

  // Generate 20 particles
  for (let i = 0; i < 20; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    });
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
          }}
          initial={{
            y: '100vh',
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: '-10vh',
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0],
            x: [0, Math.random() * 100 - 50],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

export const GamingGridBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Animated Grid */}
      <motion.div
        className="gaming-grid-bg absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Radial Gradients */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(0, 240, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255, 0, 110, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 40% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)
            `,
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  );
};

export const GamingScanLines = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 240, 255, 0.03) 2px, rgba(0, 240, 255, 0.03) 4px)',
        }}
        animate={{
          y: [0, 4, 0],
        }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

// Floating Icons Effect
interface FloatingIcon {
  id: number;
  icon: string;
  x: number;
  duration: number;
  delay: number;
}

export const GamingFloatingIcons = () => {
  const icons = ['🎮', '⚡', '💎', '🔥', '⭐', '💫', '🎯', '🏆'];
  const floatingIcons: FloatingIcon[] = [];

  for (let i = 0; i < 8; i++) {
    floatingIcons.push({
      id: i,
      icon: icons[i],
      x: Math.random() * 90 + 5,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 5,
    });
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {floatingIcons.map((item) => (
        <motion.div
          key={item.id}
          className="absolute text-4xl"
          style={{
            left: `${item.x}%`,
          }}
          initial={{
            y: '100vh',
            opacity: 0,
            rotate: 0,
          }}
          animate={{
            y: '-10vh',
            opacity: [0, 0.3, 0.3, 0],
            rotate: 360,
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {item.icon}
        </motion.div>
      ))}
    </div>
  );
};
