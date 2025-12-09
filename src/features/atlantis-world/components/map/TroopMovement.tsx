import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';

// ============== أنواع البيانات ==============
export interface TroopMovementData {
  id: string;
  from: [number, number, number];
  to: [number, number, number];
  targetId: string;
  troopCount: number;
  progress: number;
  type: 'attack' | 'gather' | 'scout';
  startTime: number;
  duration: number;
}

export interface BattleResultData {
  id: string;
  locationName: string;
  won: boolean;
  troopsLost: number;
  troopsSurvived: number;
  loot: { gold: number; resources: number };
  timestamp: number;
}

// ============== حركة الجنود المحسنة ==============
export const TroopMarch = ({ 
  movement, 
  onComplete 
}: { 
  movement: TroopMovementData; 
  onComplete: () => void;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [currentProgress, setCurrentProgress] = useState(movement.progress);
  
  useFrame(() => {
    const elapsed = (Date.now() - movement.startTime) / 1000;
    const newProgress = Math.min(1, elapsed / movement.duration);
    setCurrentProgress(newProgress);
    
    if (groupRef.current) {
      const x = movement.from[0] + (movement.to[0] - movement.from[0]) * newProgress;
      const z = movement.from[2] + (movement.to[2] - movement.from[2]) * newProgress;
      
      // حركة تمايل أثناء المشي
      const bobbing = Math.sin(Date.now() * 0.01) * 0.1;
      groupRef.current.position.set(x, 0.5 + bobbing, z);
      
      // توجيه الجنود
      const angle = Math.atan2(movement.to[2] - movement.from[2], movement.to[0] - movement.from[0]);
      groupRef.current.rotation.y = -angle + Math.PI / 2;
    }
    
    if (newProgress >= 1) {
      onComplete();
    }
  });
  
  const typeConfig = {
    attack: { color: '#DC143C', icon: '⚔️', label: 'هجوم' },
    gather: { color: '#228B22', icon: '📦', label: 'جمع' },
    scout: { color: '#4169E1', icon: '👁️', label: 'استطلاع' },
  };
  
  const config = typeConfig[movement.type];
  const soldierCount = Math.min(7, Math.ceil(movement.troopCount / 15));
  
  return (
    <group ref={groupRef}>
      {/* الجنود في تشكيل */}
      {[...Array(soldierCount)].map((_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const xOffset = (col - 1) * 0.4;
        const zOffset = row * 0.5;
        
        return (
          <group key={i} position={[xOffset, 0, zOffset]}>
            {/* جسم الجندي */}
            <mesh castShadow position={[0, 0.4, 0]}>
              <capsuleGeometry args={[0.12, 0.25, 4, 8]} />
              <meshStandardMaterial color={config.color} />
            </mesh>
            
            {/* رأس الجندي */}
            <mesh position={[0, 0.7, 0]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#e0c8a0" />
            </mesh>
            
            {/* سلاح بسيط */}
            {movement.type === 'attack' && (
              <mesh position={[0.15, 0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.04, 0.4, 0.04]} />
                <meshStandardMaterial color="#888" metalness={0.8} />
              </mesh>
            )}
          </group>
        );
      })}
      
      {/* العلم */}
      <group position={[0, 0, -0.3]}>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.2, 6]} />
          <meshStandardMaterial color="#4a3728" />
        </mesh>
        <mesh position={[0.2, 1.2, 0]}>
          <boxGeometry args={[0.4, 0.25, 0.015]} />
          <meshStandardMaterial color={config.color} side={THREE.DoubleSide} />
        </mesh>
      </group>
      
      {/* خط المسار */}
      <Line
        points={[
          new THREE.Vector3(...movement.from),
          new THREE.Vector3(...movement.to)
        ]}
        color={config.color}
        lineWidth={2.5}
        dashed
        dashScale={3}
        dashSize={0.6}
        gapSize={0.4}
      />
      
      {/* علامة الهدف */}
      <group position={movement.to}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshBasicMaterial color={config.color} transparent opacity={0.5} />
        </mesh>
      </group>
      
      {/* التسمية */}
      <Html position={[0, 1.8, 0]} center distanceFactor={15}>
        <div className="bg-card/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border border-border shadow-xl">
          <div className="flex items-center gap-2">
            <span className="text-base">{config.icon}</span>
            <div>
              <div className="flex items-center gap-1">
                <span>{movement.troopCount}</span>
                <span className="text-muted-foreground">جندي</span>
              </div>
              <div className="w-16 h-1 bg-muted rounded-full overflow-hidden mt-0.5">
                <div 
                  className="h-full rounded-full transition-all" 
                  style={{ 
                    width: `${currentProgress * 100}%`,
                    backgroundColor: config.color 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};

// ============== تأثير المعركة المحسن ==============
export const BattleEffect = ({ 
  position, 
  isVictory,
  onComplete
}: { 
  position: [number, number, number]; 
  isVictory: boolean;
  onComplete?: () => void;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(0);
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 3;
    }
    
    // تأثير الظهور
    if (scale < 1) {
      setScale(prev => Math.min(1, prev + delta * 4));
    }
    
    // تأثير التلاشي
    if (scale >= 1) {
      setOpacity(prev => {
        const newOpacity = Math.max(0, prev - delta * 0.4);
        if (newOpacity <= 0) onComplete?.();
        return newOpacity;
      });
    }
  });
  
  if (opacity <= 0) return null;
  
  const color = isVictory ? '#FFD700' : '#DC143C';
  const secondaryColor = isVictory ? '#FFA500' : '#FF4500';
  
  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* الدائرة المركزية */}
      <mesh>
        <sphereGeometry args={[2.5, 24, 24]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={opacity * 0.4}
        />
      </mesh>
      
      {/* الموجة الخارجية */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3, 4, 32]} />
        <meshBasicMaterial 
          color={secondaryColor} 
          transparent 
          opacity={opacity * 0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* الشرارات */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const r = 2 + Math.sin(Date.now() * 0.005 + i) * 0.5;
        return (
          <mesh key={i} position={[
            Math.cos(angle) * r,
            Math.sin(Date.now() * 0.01 + i * 0.5) * 0.5,
            Math.sin(angle) * r
          ]}>
            <octahedronGeometry args={[0.2]} />
            <meshBasicMaterial 
              color={i % 2 === 0 ? color : secondaryColor} 
              transparent 
              opacity={opacity}
            />
          </mesh>
        );
      })}
      
      {/* النص */}
      <Html position={[0, 3.5, 0]} center>
        <div 
          className={`text-3xl font-black drop-shadow-lg ${isVictory ? 'text-yellow-400' : 'text-red-500'}`}
          style={{ opacity }}
        >
          {isVictory ? '🏆 انتصار!' : '💀 هزيمة!'}
        </div>
      </Html>
    </group>
  );
};
