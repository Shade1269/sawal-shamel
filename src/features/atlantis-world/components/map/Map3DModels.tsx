import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Badge } from '@/components/ui/badge';

// ============== أنواع البيانات ==============
export interface MapLocation {
  id: string;
  name: string;
  type: 'castle' | 'village' | 'forest' | 'mine' | 'enemy' | 'port' | 'ruins' | 'tower';
  position: [number, number, number];
  scale?: number;
  color?: string;
  level?: number;
  isPlayer?: boolean;
  resources?: number;
  discovered?: boolean;
}

interface LocationProps {
  location: MapLocation;
  onClick?: () => void;
  isSelected?: boolean;
  isDiscovered?: boolean;
}

// ============== قلعة اللاعب المحسنة ==============
export const PlayerCastle = ({ location, onClick, isSelected }: LocationProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { position, name } = location;
  
  // تأثير النبض للقلعة
  useFrame((state) => {
    if (groupRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.015;
      groupRef.current.scale.setScalar(pulse);
      
      // دوران بطيء للعلم
      const flag = groupRef.current.children.find(c => c.name === 'flag');
      if (flag) {
        flag.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.1;
      }
    }
  });
  
  const wallColor = '#B8860B';
  const roofColor = '#8B0000';
  const goldAccent = '#FFD700';
  
  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* القاعدة الحجرية */}
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[4, 4.5, 0.6, 32]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
      </mesh>
      
      {/* الجدار الخارجي */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[6, 2.4, 6]} />
        <meshStandardMaterial color={wallColor} roughness={0.7} metalness={0.1} />
      </mesh>
      
      {/* الجدار الداخلي */}
      <mesh castShadow position={[0, 2.6, 0]}>
        <boxGeometry args={[4.5, 1.5, 4.5]} />
        <meshStandardMaterial color={wallColor} roughness={0.7} metalness={0.1} />
      </mesh>
      
      {/* الأبراج الأربعة */}
      {[[-2.5, -2.5], [2.5, -2.5], [-2.5, 2.5], [2.5, 2.5]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* جسم البرج */}
          <mesh castShadow position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.7, 0.8, 5, 12]} />
            <meshStandardMaterial color={wallColor} roughness={0.7} />
          </mesh>
          
          {/* السقف المخروطي */}
          <mesh position={[0, 5.3, 0]}>
            <coneGeometry args={[1, 1.5, 12]} />
            <meshStandardMaterial color={roofColor} roughness={0.5} />
          </mesh>
          
          {/* الشرفات */}
          {[...Array(8)].map((_, j) => {
            const angle = (j / 8) * Math.PI * 2;
            return (
              <mesh key={j} position={[Math.cos(angle) * 0.6, 4.5, Math.sin(angle) * 0.6]}>
                <boxGeometry args={[0.2, 0.4, 0.2]} />
                <meshStandardMaterial color={wallColor} />
              </mesh>
            );
          })}
        </group>
      ))}
      
      {/* البرج الرئيسي */}
      <group position={[0, 0, 0]}>
        <mesh castShadow position={[0, 4.5, 0]}>
          <boxGeometry args={[2.5, 4, 2.5]} />
          <meshStandardMaterial color={wallColor} roughness={0.6} />
        </mesh>
        
        {/* السقف الرئيسي */}
        <mesh position={[0, 7, 0]}>
          <coneGeometry args={[2, 2.5, 4]} />
          <meshStandardMaterial color={roofColor} roughness={0.4} />
        </mesh>
        
        {/* قمة الذهب */}
        <mesh position={[0, 8.5, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color={goldAccent} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      
      {/* العلم */}
      <group name="flag" position={[0, 8.8, 0]}>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
        <mesh position={[0.4, 0.6, 0]}>
          <boxGeometry args={[0.8, 0.5, 0.03]} />
          <meshStandardMaterial color={goldAccent} side={THREE.DoubleSide} />
        </mesh>
      </group>
      
      {/* البوابة */}
      <mesh position={[0, 0.8, 3.01]}>
        <boxGeometry args={[1.2, 1.6, 0.1]} />
        <meshStandardMaterial color="#3a2a1a" />
      </mesh>
      
      {/* إضاءة القلعة */}
      <pointLight position={[0, 3, 0]} color="#ffcc77" intensity={0.5} distance={10} />
      
      {/* حلقة التحديد */}
      {(isSelected || hovered) && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
            <ringGeometry args={[4.5, 5, 64]} />
            <meshBasicMaterial color={goldAccent} transparent opacity={0.6} />
          </mesh>
          
          {/* جسيمات السحر */}
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            return (
              <mesh 
                key={i} 
                position={[Math.cos(angle) * 4.7, 0.5 + Math.sin(Date.now() * 0.002 + i) * 0.3, Math.sin(angle) * 4.7]}
              >
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial color={goldAccent} transparent opacity={0.8} />
              </mesh>
            );
          })}
        </>
      )}
      
      {/* التسمية */}
      <Html position={[0, 10, 0]} center distanceFactor={18}>
        <div className="bg-gradient-to-r from-accent to-accent/70 px-4 py-2 rounded-lg text-white font-bold whitespace-nowrap shadow-xl border-2 border-accent/30">
          👑 {name}
        </div>
      </Html>
    </group>
  );
};

// ============== معسكر العدو المحسن ==============
export const EnemyCamp = ({ location, onClick, isSelected, isDiscovered }: LocationProps) => {
  const [hovered, setHovered] = useState(false);
  const fireRef = useRef<THREE.PointLight>(null);
  const flagRef = useRef<THREE.Mesh>(null);
  const { position, name, level = 1 } = location;
  
  useFrame((state) => {
    // تأثير اللهب
    if (fireRef.current) {
      fireRef.current.intensity = 0.8 + Math.sin(state.clock.elapsedTime * 10) * 0.3;
    }
    // تحريك العلم
    if (flagRef.current) {
      flagRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
  });
  
  if (!isDiscovered) {
    return (
      <group position={position}>
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.8, 8, 8]} />
          <meshBasicMaterial color="#222" transparent opacity={0.6} />
        </mesh>
        <Html position={[0, 2.5, 0]} center distanceFactor={20}>
          <div className="bg-gray-800/90 px-2 py-1 rounded text-xs text-gray-400 font-medium">
            ❓ منطقة مجهولة
          </div>
        </Html>
      </group>
    );
  }
  
  const tentColor = hovered ? '#cc4444' : '#8B0000';
  
  return (
    <group 
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* الأرض */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[4, 32]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
      </mesh>
      
      {/* الخيام */}
      {[
        { pos: [0, 0, 0], scale: 1.2 },
        { pos: [2, 0, 1.5], scale: 0.8 },
        { pos: [-1.8, 0, 1.2], scale: 0.9 },
        { pos: [1.2, 0, -1.5], scale: 0.85 },
        { pos: [-1.5, 0, -1], scale: 0.75 },
      ].map((tent, i) => (
        <group key={i} position={tent.pos as [number, number, number]}>
          <mesh castShadow position={[0, tent.scale * 0.8, 0]}>
            <coneGeometry args={[tent.scale * 0.9, tent.scale * 1.6, 6]} />
            <meshStandardMaterial color={tentColor} roughness={0.8} />
          </mesh>
          {/* قمة الخيمة */}
          <mesh position={[0, tent.scale * 1.7, 0]}>
            <sphereGeometry args={[tent.scale * 0.1, 8, 8]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        </group>
      ))}
      
      {/* السياج الخشبي */}
      {[...Array(16)].map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const r = 3.5;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, 0.6, Math.sin(angle) * r]} castShadow>
            <boxGeometry args={[0.15, 1.2, 0.15]} />
            <meshStandardMaterial color="#4a3728" roughness={0.9} />
          </mesh>
        );
      })}
      
      {/* النار المركزية */}
      <group position={[0, 0, 0]}>
        {/* الحجارة */}
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.5, 0.15, Math.sin(angle) * 0.5]}>
              <sphereGeometry args={[0.15, 6, 6]} />
              <meshStandardMaterial color="#555" roughness={0.9} />
            </mesh>
          );
        })}
        
        {/* اللهب */}
        <mesh position={[0, 0.5, 0]}>
          <coneGeometry args={[0.3, 0.8, 8]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.9} />
        </mesh>
        <mesh position={[0.1, 0.4, 0.1]}>
          <coneGeometry args={[0.2, 0.5, 8]} />
          <meshBasicMaterial color="#ffaa00" transparent opacity={0.8} />
        </mesh>
        
        <pointLight ref={fireRef} position={[0, 0.5, 0]} color="#ff6600" intensity={1} distance={8} />
      </group>
      
      {/* العلم */}
      <group position={[0, 0, -2.5]}>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh ref={flagRef} position={[0.4, 2.5, 0]}>
          <boxGeometry args={[0.8, 0.5, 0.02]} />
          <meshStandardMaterial color="#DC143C" side={THREE.DoubleSide} />
        </mesh>
      </group>
      
      {/* حلقة التحديد */}
      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
          <ringGeometry args={[4, 4.4, 32]} />
          <meshBasicMaterial color="#DC143C" transparent opacity={0.6} />
        </mesh>
      )}
      
      {/* التسمية */}
      <Html position={[0, 3.5, 0]} center distanceFactor={18}>
        <div className="bg-gradient-to-r from-red-600 to-red-500 px-3 py-1.5 rounded-lg text-white font-bold whitespace-nowrap shadow-xl flex items-center gap-2">
          <span>⚔️ {name}</span>
          <Badge variant="secondary" className="bg-white/20 text-white text-[10px] px-1.5">
            Lv.{level}
          </Badge>
        </div>
      </Html>
    </group>
  );
};

// ============== المنجم المحسن ==============
export const Mine3D = ({ location, onClick, isSelected, isDiscovered }: LocationProps) => {
  const [hovered, setHovered] = useState(false);
  const wheelRef = useRef<THREE.Mesh>(null);
  const { position, name, resources = 0 } = location;
  
  useFrame(() => {
    if (wheelRef.current) {
      wheelRef.current.rotation.z -= 0.02;
    }
  });
  
  if (!isDiscovered) {
    return (
      <group position={position}>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshBasicMaterial color="#333" transparent opacity={0.5} />
        </mesh>
      </group>
    );
  }
  
  return (
    <group 
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* فتحة المنجم */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <circleGeometry args={[2, 32]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>
      
      {/* الإطار الخشبي */}
      <mesh position={[-0.8, 0.8, 0]} castShadow>
        <boxGeometry args={[0.2, 1.6, 0.2]} />
        <meshStandardMaterial color="#5a3d2b" roughness={0.8} />
      </mesh>
      <mesh position={[0.8, 0.8, 0]} castShadow>
        <boxGeometry args={[0.2, 1.6, 0.2]} />
        <meshStandardMaterial color="#5a3d2b" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[1.8, 0.2, 0.2]} />
        <meshStandardMaterial color="#5a3d2b" roughness={0.8} />
      </mesh>
      
      {/* العجلة */}
      <mesh ref={wheelRef} position={[0, 2.2, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.5, 0.08, 8, 24]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* صخور الذهب */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const r = 1.2 + Math.random() * 0.5;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, 0.2, Math.sin(angle) * r]}>
            <dodecahedronGeometry args={[0.2 + Math.random() * 0.15]} />
            <meshStandardMaterial color={hovered ? '#FFD700' : '#B8860B'} metalness={0.7} roughness={0.3} />
          </mesh>
        );
      })}
      
      {/* حلقة التحديد */}
      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
          <ringGeometry args={[2.2, 2.5, 32]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.6} />
        </mesh>
      )}
      
      {/* التسمية */}
      <Html position={[0, 3, 0]} center distanceFactor={18}>
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 px-3 py-1.5 rounded-lg text-white font-bold whitespace-nowrap shadow-xl">
          ⛏️ {name}
          {resources > 0 && (
            <span className="text-xs ml-2 opacity-80">{resources}</span>
          )}
        </div>
      </Html>
    </group>
  );
};

// ============== القرية المحسنة ==============
export const Village3D = ({ location, onClick, isSelected, isDiscovered }: LocationProps) => {
  const [hovered, setHovered] = useState(false);
  const { position, name } = location;
  
  if (!isDiscovered) {
    return (
      <group position={position}>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshBasicMaterial color="#333" transparent opacity={0.5} />
        </mesh>
      </group>
    );
  }
  
  const roofColor = '#8B4513';
  const wallColor = hovered ? '#E8D4B0' : '#D2B48C';
  
  return (
    <group 
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* المنازل */}
      {[
        { pos: [0, 0, 0], size: 1.2 },
        { pos: [2, 0, 0.5], size: 0.9 },
        { pos: [-1.5, 0, 1], size: 0.8 },
        { pos: [0.8, 0, -1.5], size: 0.85 },
        { pos: [-1.2, 0, -0.8], size: 0.7 },
      ].map((house, i) => (
        <group key={i} position={house.pos as [number, number, number]}>
          {/* الجدران */}
          <mesh castShadow position={[0, house.size * 0.4, 0]}>
            <boxGeometry args={[house.size, house.size * 0.8, house.size]} />
            <meshStandardMaterial color={wallColor} roughness={0.8} />
          </mesh>
          {/* السقف */}
          <mesh position={[0, house.size * 0.9, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[house.size * 0.8, house.size * 0.5, 4]} />
            <meshStandardMaterial color={roofColor} roughness={0.7} />
          </mesh>
        </group>
      ))}
      
      {/* البئر */}
      <group position={[1.5, 0, -0.5]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
          <meshStandardMaterial color="#777" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.3, 16]} />
          <meshStandardMaterial color="#1a6eb5" roughness={0.2} />
        </mesh>
      </group>
      
      {/* حلقة التحديد */}
      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
          <ringGeometry args={[2.8, 3.1, 32]} />
          <meshBasicMaterial color="#D2B48C" transparent opacity={0.6} />
        </mesh>
      )}
      
      {/* التسمية */}
      <Html position={[0, 2.5, 0]} center distanceFactor={18}>
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-3 py-1.5 rounded-lg text-white font-bold whitespace-nowrap shadow-xl">
          🏘️ {name}
        </div>
      </Html>
    </group>
  );
};

// ============== تصدير المكونات ==============
export { type LocationProps };
