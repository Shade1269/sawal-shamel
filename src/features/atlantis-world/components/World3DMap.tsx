import { useRef, useState, useMemo, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Sky, 
  Cloud,
  Html,
  Line,
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, X, Maximize2, Minimize2, 
  Compass, Target, Swords, Shield,
  Users, Timer, Zap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

// ================= أنواع البيانات =================
interface MapLocation {
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

interface TroopMovement {
  id: string;
  from: [number, number, number];
  to: [number, number, number];
  targetId: string;
  troopCount: number;
  progress: number; // 0-1
  type: 'attack' | 'gather' | 'scout';
  startTime: number;
  duration: number; // بالثواني
}

interface BattleResult {
  id: string;
  locationName: string;
  won: boolean;
  troopsLost: number;
  troopsSurvived: number;
  loot: { gold: number; resources: number };
  timestamp: number;
}

interface World3DMapProps {
  playerCastlePosition?: [number, number, number];
  playerPower?: number;
  onLocationSelect?: (location: MapLocation) => void;
  onBattleResult?: (result: BattleResult) => void;
}

// ================= المواقع =================
const createLocations = (): MapLocation[] => [
  // قلعة اللاعب
  { id: 'player', name: 'قلعتك', type: 'castle', position: [0, 0, 0], isPlayer: true, discovered: true },
  
  // المناطق المكتشفة (قريبة)
  { id: 'village1', name: 'قرية النخيل', type: 'village', position: [12, 0, -8], resources: 500, discovered: true },
  { id: 'forest1', name: 'غابة الصنوبر', type: 'forest', position: [-10, 0, 6], resources: 300, discovered: true },
  { id: 'mine1', name: 'منجم الذهب', type: 'mine', position: [8, 0, 10], resources: 800, discovered: true },
  { id: 'tower1', name: 'برج المراقبة', type: 'tower', position: [-6, 0, -10], discovered: true },
  { id: 'enemy1', name: 'معسكر اللصوص', type: 'enemy', position: [15, 0, 5], level: 3, discovered: true },
  
  // المناطق غير المكتشفة (بعيدة) - ضباب الحرب
  { id: 'village2', name: 'قرية الوادي', type: 'village', position: [-22, 0, 15], resources: 600, discovered: false },
  { id: 'village3', name: 'قرية الساحل', type: 'village', position: [25, 0, -15], resources: 450, discovered: false },
  { id: 'mine2', name: 'منجم الفضة', type: 'mine', position: [-28, 0, -8], resources: 1000, discovered: false },
  { id: 'mine3', name: 'منجم الحديد', type: 'mine', position: [5, 0, -28], resources: 700, discovered: false },
  { id: 'enemy2', name: 'قلعة الظلام', type: 'enemy', position: [28, 0, 20], level: 7, discovered: false },
  { id: 'enemy3', name: 'وكر التنين', type: 'enemy', position: [-15, 0, -25], level: 10, discovered: false },
  { id: 'enemy4', name: 'خيمة البرابرة', type: 'enemy', position: [30, 0, -25], level: 5, discovered: false },
  { id: 'ruins1', name: 'أطلال المعبد', type: 'ruins', position: [-8, 0, 28], resources: 2000, discovered: false },
  { id: 'ruins2', name: 'قصر مهجور', type: 'ruins', position: [20, 0, 28], resources: 1500, discovered: false },
  { id: 'port1', name: 'ميناء التجار', type: 'port', position: [-32, 0, 0], resources: 400, discovered: false },
  { id: 'tower2', name: 'برج الحراسة', type: 'tower', position: [0, 0, -32], discovered: false },
];

// ================= التضاريس المحسنة =================
const EnhancedTerrain = ({ fogRadius }: { fogRadius: number }) => {
  const geometry = useMemo(() => {
    const size = 100;
    const segments = 200;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    const positions = geo.attributes.position;
    const colorArray = new Float32Array(positions.count * 3);
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const distFromCenter = Math.sqrt(x * x + y * y);
      
      // تضاريس
      let height = 0;
      height += Math.sin(x * 0.06) * Math.cos(y * 0.06) * 2.5;
      height += Math.sin(x * 0.12 + 1) * Math.cos(y * 0.1) * 1.2;
      height += Math.sin(x * 0.25) * Math.cos(y * 0.25) * 0.4;
      
      // جبال في الأطراف
      if (distFromCenter > 30) {
        height += (distFromCenter - 30) * 0.12;
        height += Math.sin(distFromCenter * 0.2) * 2;
      }
      
      // تسطيح المركز
      if (distFromCenter < 10) {
        height *= distFromCenter / 10;
      }
      
      // بحيرات
      const lake1 = Math.sqrt((x - 18) ** 2 + (y + 5) ** 2);
      const lake2 = Math.sqrt((x + 25) ** 2 + (y - 12) ** 2);
      const lake3 = Math.sqrt((x - 5) ** 2 + (y - 22) ** 2);
      if (lake1 < 7) height = Math.min(height, -0.8);
      if (lake2 < 5) height = Math.min(height, -0.8);
      if (lake3 < 6) height = Math.min(height, -0.8);
      
      positions.setZ(i, height);
      
      // ألوان مع ضباب الحرب
      let r, g, b;
      const fogFactor = distFromCenter > fogRadius ? 0.3 : 1;
      
      if (height < -0.5) {
        r = 0.1 * fogFactor; g = 0.35 * fogFactor; b = 0.65 * fogFactor;
      } else if (height < 0.8) {
        r = (0.22 + Math.random() * 0.08) * fogFactor;
        g = (0.48 + Math.random() * 0.12) * fogFactor;
        b = 0.18 * fogFactor;
      } else if (height < 2.5) {
        r = 0.38 * fogFactor; g = 0.52 * fogFactor; b = 0.22 * fogFactor;
      } else if (height < 5) {
        r = 0.5 * fogFactor; g = 0.45 * fogFactor; b = 0.38 * fogFactor;
      } else {
        r = 0.92 * fogFactor; g = 0.94 * fogFactor; b = 0.96 * fogFactor;
      }
      
      colorArray[i * 3] = r;
      colorArray[i * 3 + 1] = g;
      colorArray[i * 3 + 2] = b;
    }
    
    geo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    geo.computeVertexNormals();
    return geo;
  }, [fogRadius]);
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <primitive object={geometry} />
      <meshStandardMaterial vertexColors roughness={0.85} metalness={0.05} />
    </mesh>
  );
};

// ================= ضباب الحرب =================
const FogOfWar = ({ radius }: { radius: number }) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
      <ringGeometry args={[radius, 60, 64]} />
      <meshBasicMaterial 
        color="#1a1a2e" 
        transparent 
        opacity={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// ================= حركة الجنود =================
const TroopMarch = ({ movement, onComplete }: { 
  movement: TroopMovement; 
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
      groupRef.current.position.set(x, 0.5, z);
      
      // توجيه الجنود
      const angle = Math.atan2(movement.to[2] - movement.from[2], movement.to[0] - movement.from[0]);
      groupRef.current.rotation.y = -angle + Math.PI / 2;
    }
    
    if (newProgress >= 1) {
      onComplete();
    }
  });
  
  const color = movement.type === 'attack' ? '#DC143C' : 
                movement.type === 'scout' ? '#4169E1' : '#228B22';
  
  return (
    <group ref={groupRef}>
      {/* أيقونة الجنود */}
      {[...Array(Math.min(5, Math.ceil(movement.troopCount / 20)))].map((_, i) => (
        <mesh key={i} position={[(i - 2) * 0.3, 0.3, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.3, 4, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      
      {/* العلم */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
      <mesh position={[0.2, 0.8, 0]}>
        <boxGeometry args={[0.4, 0.25, 0.02]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* خط المسار */}
      <Line
        points={[
          new THREE.Vector3(...movement.from),
          new THREE.Vector3(...movement.to)
        ]}
        color={color}
        lineWidth={2}
        dashed
        dashScale={2}
        dashSize={0.5}
        gapSize={0.3}
      />
      
      {/* التسمية */}
      <Html position={[0, 1.5, 0]} center distanceFactor={15}>
        <div className="bg-card/90 backdrop-blur px-2 py-1 rounded text-xs font-bold whitespace-nowrap border border-border">
          <span>{movement.type === 'attack' ? '⚔️' : movement.type === 'scout' ? '👁️' : '📦'}</span>
          <span className="mx-1">{movement.troopCount}</span>
          <span className="text-muted-foreground">{Math.round(currentProgress * 100)}%</span>
        </div>
      </Html>
    </group>
  );
};

// ================= تأثير المعركة =================
const BattleEffect = ({ position, isVictory }: { 
  position: [number, number, number]; 
  isVictory: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [opacity, setOpacity] = useState(1);
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 2;
      groupRef.current.position.y += delta * 0.5;
    }
    setOpacity(prev => Math.max(0, prev - delta * 0.3));
  });
  
  if (opacity <= 0) return null;
  
  return (
    <group ref={groupRef} position={position}>
      {/* انفجار */}
      <mesh>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial 
          color={isVictory ? '#FFD700' : '#DC143C'} 
          transparent 
          opacity={opacity * 0.5}
        />
      </mesh>
      
      {/* شرارات */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[
            Math.cos(angle) * 1.5,
            0,
            Math.sin(angle) * 1.5
          ]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshBasicMaterial 
              color={isVictory ? '#FFA500' : '#FF4500'} 
              transparent 
              opacity={opacity}
            />
          </mesh>
        );
      })}
      
      <Html position={[0, 2, 0]} center>
        <div className={`text-2xl font-bold ${isVictory ? 'text-yellow-400' : 'text-red-500'}`}>
          {isVictory ? '🏆 انتصار!' : '💀 هزيمة!'}
        </div>
      </Html>
    </group>
  );
};

// ================= مكونات المواقع =================
const Castle3D = ({ location, onClick, isSelected, isDiscovered }: { 
  location: MapLocation;
  onClick?: () => void;
  isSelected?: boolean;
  isDiscovered?: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { isPlayer, position, name } = location;
  
  useFrame((state) => {
    if (groupRef.current && isPlayer) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      groupRef.current.scale.setScalar(scale);
    }
  });
  
  if (!isDiscovered && !isPlayer) return null;
  
  const opacity = isDiscovered ? 1 : 0.4;
  const wallColor = isPlayer ? '#C89B3C' : hovered ? '#aaa' : '#666';
  const roofColor = isPlayer ? '#8B0000' : '#555';
  
  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* القاعدة */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[3, 1.2, 3]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} transparent opacity={opacity} />
      </mesh>
      
      {/* الجدران العليا */}
      <mesh castShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[2.5, 0.6, 2.5]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} transparent opacity={opacity} />
      </mesh>
      
      {/* الأبراج */}
      {[[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.4, 0.5, 3, 8]} />
            <meshStandardMaterial color={wallColor} roughness={0.7} transparent opacity={opacity} />
          </mesh>
          <mesh position={[0, 3.2, 0]}>
            <coneGeometry args={[0.55, 0.8, 8]} />
            <meshStandardMaterial color={roofColor} roughness={0.5} transparent opacity={opacity} />
          </mesh>
        </group>
      ))}
      
      {/* البرج الرئيسي */}
      <mesh castShadow position={[0, 2.5, 0]}>
        <boxGeometry args={[1.2, 2.5, 1.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.7} transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 4, 0]}>
        <coneGeometry args={[0.85, 1.2, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.5} transparent opacity={opacity} />
      </mesh>
      
      {/* العلم */}
      {isPlayer && (
        <group position={[0, 4.8, 0]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
            <meshStandardMaterial color="#4a3728" />
          </mesh>
          <mesh position={[0.25, 0.3, 0]}>
            <boxGeometry args={[0.5, 0.35, 0.02]} />
            <meshStandardMaterial color="#C89B3C" />
          </mesh>
        </group>
      )}
      
      {/* حلقة التحديد */}
      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
          <ringGeometry args={[2.5, 2.8, 32]} />
          <meshBasicMaterial color={isPlayer ? '#C89B3C' : '#ffffff'} transparent opacity={0.5} />
        </mesh>
      )}
      
      {/* التسمية */}
      {isDiscovered && (
        <Html position={[0, 5.5, 0]} center distanceFactor={20}>
          <div className={`px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap border shadow-lg ${
            isPlayer ? 'bg-accent text-accent-foreground border-accent' : 'bg-card/95 text-foreground border-border'
          }`}>
            {isPlayer && '👑 '}{name}
          </div>
        </Html>
      )}
    </group>
  );
};

// معسكر العدو مع مؤشر المستوى
const EnemyCamp3D = ({ location, onClick, isSelected, isDiscovered }: { 
  location: MapLocation;
  onClick?: () => void;
  isSelected?: boolean;
  isDiscovered?: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const flagRef = useRef<THREE.Mesh>(null);
  const { position, name, level = 1 } = location;
  
  useFrame((state) => {
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });
  
  if (!isDiscovered) {
    // موقع مجهول
    return (
      <group position={position}>
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshBasicMaterial color="#333" transparent opacity={0.5} />
        </mesh>
        <Html position={[0, 2, 0]} center distanceFactor={20}>
          <div className="bg-gray-800/80 px-2 py-1 rounded text-xs text-gray-400">
            ❓ منطقة مجهولة
          </div>
        </Html>
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
      {/* الخيام */}
      {[[0, 0], [1.8, 0.8], [-1.5, 0.5], [0.8, -1.5]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.6, z]}>
          <coneGeometry args={[0.7 + i * 0.1, 1.2, 6]} />
          <meshStandardMaterial color={hovered ? '#ff6666' : '#8B0000'} roughness={0.8} />
        </mesh>
      ))}
      
      {/* سياج */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 3, 0.5, Math.sin(angle) * 3]}>
            <boxGeometry args={[0.1, 1, 0.1]} />
            <meshStandardMaterial color="#4a3728" />
          </mesh>
        );
      })}
      
      {/* العلم */}
      <group position={[0, 0, -2]}>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 2.4, 8]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh ref={flagRef} position={[0.35, 2, 0]}>
          <boxGeometry args={[0.7, 0.5, 0.02]} />
          <meshStandardMaterial color="#DC143C" side={THREE.DoubleSide} />
        </mesh>
      </group>
      
      {/* نار */}
      <pointLight position={[0, 0.5, 0]} color="#ff6600" intensity={0.5} distance={5} />
      
      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[3.5, 3.8, 32]} />
          <meshBasicMaterial color="#DC143C" transparent opacity={0.5} />
        </mesh>
      )}
      
      <Html position={[0, 3, 0]} center distanceFactor={20}>
        <div className="bg-red-600 px-2 py-1 rounded text-xs font-bold whitespace-nowrap text-white shadow-lg flex items-center gap-1">
          <span>⚔️ {name}</span>
          <Badge variant="secondary" className="bg-white/20 text-white text-[10px] px-1">
            Lv.{level}
          </Badge>
        </div>
      </Html>
    </group>
  );
};

// باقي المواقع (مختصرة)
const GenericLocation3D = ({ location, onClick, isSelected, isDiscovered }: { 
  location: MapLocation;
  onClick?: () => void;
  isSelected?: boolean;
  isDiscovered?: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const { position, name, type } = location;
  
  if (!isDiscovered) {
    return (
      <group position={position}>
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshBasicMaterial color="#333" transparent opacity={0.4} />
        </mesh>
      </group>
    );
  }
  
  const configs: Record<string, { color: string; icon: string; height: number }> = {
    village: { color: '#D2B48C', icon: '🏘️', height: 1 },
    forest: { color: '#228B22', icon: '🌲', height: 1.5 },
    mine: { color: '#FFD700', icon: '⛏️', height: 0.8 },
    port: { color: '#4169E1', icon: '⚓', height: 0.6 },
    ruins: { color: '#9370DB', icon: '🏛️', height: 1.2 },
    tower: { color: '#708090', icon: '🗼', height: 2 },
  };
  
  const config = configs[type] || configs.village;
  
  return (
    <group 
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <mesh castShadow position={[0, config.height / 2, 0]}>
        <boxGeometry args={[1.5, config.height, 1.5]} />
        <meshStandardMaterial color={hovered ? '#fff' : config.color} roughness={0.8} />
      </mesh>
      
      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[1.8, 2.1, 32]} />
          <meshBasicMaterial color={config.color} transparent opacity={0.5} />
        </mesh>
      )}
      
      <Html position={[0, config.height + 1, 0]} center distanceFactor={20}>
        <div className="bg-card/95 px-2 py-1 rounded text-xs font-bold whitespace-nowrap border border-border text-foreground shadow-lg">
          {config.icon} {name}
        </div>
      </Html>
    </group>
  );
};

// ================= البحيرة =================
const Lake = ({ position, size = 6 }: { position: [number, number, number]; size?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = -0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[size, 48]} />
      <meshStandardMaterial color="#1a6eb5" transparent opacity={0.85} roughness={0.1} metalness={0.4} />
    </mesh>
  );
};

// ================= الشجرة والغابة =================
const Tree = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position}>
    <mesh castShadow position={[0, scale * 0.4, 0]}>
      <cylinderGeometry args={[scale * 0.08, scale * 0.12, scale * 0.8, 6]} />
      <meshStandardMaterial color="#4a3728" roughness={0.9} />
    </mesh>
    <mesh castShadow position={[0, scale * 1, 0]}>
      <coneGeometry args={[scale * 0.5, scale * 1.2, 8]} />
      <meshStandardMaterial color="#1a472a" roughness={0.8} />
    </mesh>
  </group>
);

const Forest = ({ position, count = 15, spread = 4, discovered = true }: { 
  position: [number, number, number]; 
  count?: number;
  spread?: number;
  discovered?: boolean;
}) => {
  const trees = useMemo(() => {
    const result = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * spread;
      result.push({ 
        x: Math.cos(angle) * radius, 
        z: Math.sin(angle) * radius, 
        scale: 0.4 + Math.random() * 0.5, 
        key: i 
      });
    }
    return result;
  }, [count, spread]);
  
  return (
    <group position={position}>
      {trees.map((tree) => (
        <Tree key={tree.key} position={[tree.x, 0, tree.z]} scale={tree.scale * (discovered ? 1 : 0.6)} />
      ))}
    </group>
  );
};

// ================= تحكم الكاميرا =================
const CameraController = () => {
  useThree();
  
  return (
    <OrbitControls 
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={10}
      maxDistance={70}
      maxPolarAngle={Math.PI / 2.1}
      minPolarAngle={Math.PI / 6}
      panSpeed={1.5}
      zoomSpeed={1.2}
    />
  );
};

// ================= المشهد الرئيسي =================
const Scene = ({ 
  locations,
  movements,
  battles,
  fogRadius,
  selectedLocationId,
  onLocationSelect,
  onMovementComplete,
}: { 
  locations: MapLocation[];
  movements: TroopMovement[];
  battles: { position: [number, number, number]; isVictory: boolean }[];
  fogRadius: number;
  selectedLocationId?: string;
  onLocationSelect?: (location: MapLocation) => void;
  onMovementComplete: (id: string) => void;
}) => {
  return (
    <>
      {/* الإضاءة */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[30, 50, 30]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
      />
      <hemisphereLight intensity={0.3} color="#87ceeb" groundColor="#8B7355" />
      
      {/* السماء */}
      <Sky sunPosition={[100, 50, 100]} turbidity={0.3} rayleigh={0.5} />
      <Cloud position={[-20, 20, -20]} speed={0.1} opacity={0.4} />
      <Cloud position={[25, 18, 10]} speed={0.15} opacity={0.3} />
      
      {/* التضاريس */}
      <EnhancedTerrain fogRadius={fogRadius} />
      
      {/* ضباب الحرب */}
      <FogOfWar radius={fogRadius} />
      
      {/* البحيرات */}
      <Lake position={[18, 0, -5]} size={6} />
      <Lake position={[-25, 0, 12]} size={4} />
      <Lake position={[5, 0, 22]} size={5} />
      
      {/* الغابات */}
      <Forest position={[6, 0, 6]} count={20} spread={4} discovered={fogRadius > 10} />
      <Forest position={[-12, 0, -6]} count={15} spread={3} discovered={fogRadius > 15} />
      <Forest position={[0, 0, 15]} count={18} spread={3.5} discovered={fogRadius > 18} />
      <Forest position={[-20, 0, 20]} count={12} spread={3} discovered={fogRadius > 25} />
      <Forest position={[20, 0, -18]} count={14} spread={3.5} discovered={fogRadius > 25} />
      
      {/* المواقع */}
      {locations.map(location => {
        const isSelected = selectedLocationId === location.id;
        const isDiscovered = location.discovered || location.isPlayer;
        
        if (location.type === 'castle') {
          return <Castle3D key={location.id} location={location} onClick={() => onLocationSelect?.(location)} isSelected={isSelected} isDiscovered={isDiscovered} />;
        }
        if (location.type === 'enemy') {
          return <EnemyCamp3D key={location.id} location={location} onClick={() => onLocationSelect?.(location)} isSelected={isSelected} isDiscovered={isDiscovered} />;
        }
        return <GenericLocation3D key={location.id} location={location} onClick={() => onLocationSelect?.(location)} isSelected={isSelected} isDiscovered={isDiscovered} />;
      })}
      
      {/* حركة الجنود */}
      {movements.map(movement => (
        <TroopMarch 
          key={movement.id} 
          movement={movement} 
          onComplete={() => onMovementComplete(movement.id)}
        />
      ))}
      
      {/* تأثيرات المعارك */}
      {battles.map((battle, i) => (
        <BattleEffect key={i} position={battle.position} isVictory={battle.isVictory} />
      ))}
      
      <CameraController />
    </>
  );
};

// ================= لوحة إرسال الجنود =================
const SendTroopsPanel = ({ 
  location, 
  maxTroops,
  onSend,
  onClose 
}: { 
  location: MapLocation;
  maxTroops: number;
  onSend: (count: number, type: 'attack' | 'gather' | 'scout') => void;
  onClose: () => void;
}) => {
  const [troopCount, setTroopCount] = useState(Math.min(50, maxTroops));
  const [actionType, setActionType] = useState<'attack' | 'gather' | 'scout'>('attack');
  
  const isEnemy = location.type === 'enemy';
  const canGather = ['mine', 'forest', 'ruins'].includes(location.type);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 left-4 right-4 z-30"
    >
      <Card className="bg-card/98 backdrop-blur border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            إرسال قوات إلى {location.name}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* نوع المهمة */}
        <div className="flex gap-2 mb-4">
          {isEnemy && (
            <Button 
              variant={actionType === 'attack' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setActionType('attack')}
              className="flex-1 gap-1"
            >
              <Swords className="w-4 h-4" /> هجوم
            </Button>
          )}
          {canGather && (
            <Button 
              variant={actionType === 'gather' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActionType('gather')}
              className="flex-1 gap-1"
            >
              <Target className="w-4 h-4" /> جمع
            </Button>
          )}
          <Button 
            variant={actionType === 'scout' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setActionType('scout')}
            className="flex-1 gap-1"
          >
            <Eye className="w-4 h-4" /> استطلاع
          </Button>
        </div>
        
        {/* عدد الجنود */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">عدد الجنود</span>
            <span className="font-bold">{troopCount}</span>
          </div>
          <input 
            type="range" 
            min={10} 
            max={maxTroops} 
            value={troopCount}
            onChange={(e) => setTroopCount(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10</span>
            <span>المتاح: {maxTroops}</span>
          </div>
        </div>
        
        {/* الوقت المتوقع */}
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <Timer className="w-4 h-4" />
          <span>وقت الوصول: ~{Math.ceil(Math.sqrt(location.position[0]**2 + location.position[2]**2) / 5)} دقائق</span>
        </div>
        
        <Button 
          className="w-full gap-2" 
          variant={actionType === 'attack' ? 'destructive' : 'default'}
          onClick={() => onSend(troopCount, actionType)}
        >
          {actionType === 'attack' ? <Swords className="w-4 h-4" /> : 
           actionType === 'gather' ? <Target className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          إرسال {troopCount} جندي
        </Button>
      </Card>
    </motion.div>
  );
};

// ================= لوحة تفاصيل الموقع =================
const LocationPanel = ({ 
  location, 
  playerPower,
  onClose,
  onSendTroops,
  onDiscover
}: { 
  location: MapLocation;
  playerPower: number;
  onClose: () => void;
  onSendTroops: () => void;
  onDiscover: () => void;
}) => {
  const icons: Record<string, string> = {
    castle: '🏰', village: '🏘️', mine: '⛏️', 
    enemy: '⚔️', port: '⚓', ruins: '🏛️', tower: '🗼', forest: '🌲'
  };
  
  const bgColors: Record<string, string> = {
    castle: location.isPlayer ? 'from-accent to-accent/70' : 'from-gray-600 to-gray-500',
    village: 'from-amber-600 to-amber-500',
    mine: 'from-yellow-600 to-yellow-500',
    enemy: 'from-red-600 to-red-500',
    port: 'from-blue-600 to-blue-500',
    ruins: 'from-purple-600 to-purple-500',
    tower: 'from-gray-500 to-gray-400',
    forest: 'from-green-600 to-green-500',
  };
  
  const enemyPower = location.level ? location.level * 150 : 0;
  const winChance = location.type === 'enemy' 
    ? Math.min(95, Math.max(5, Math.round((playerPower / (enemyPower || 1)) * 50)))
    : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 z-30 w-72"
    >
      <Card className="bg-card/98 backdrop-blur border-border overflow-hidden shadow-xl">
        <div className={`p-4 text-white bg-gradient-to-br ${bgColors[location.type] || 'from-gray-600 to-gray-500'}`}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute top-2 left-2 text-white/80 hover:text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{icons[location.type]}</span>
            <div>
              <h3 className="font-bold text-lg">{location.name}</h3>
              <div className="flex gap-2 mt-1">
                {location.level && (
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                    مستوى {location.level}
                  </Badge>
                )}
                {location.resources && (
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                    {location.resources} موارد
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          {/* فرصة النصر للأعداء */}
          {winChance !== null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4" /> فرصة النصر
                </span>
                <span className={winChance > 60 ? 'text-green-500' : winChance > 30 ? 'text-yellow-500' : 'text-red-500'}>
                  {winChance}%
                </span>
              </div>
              <Progress value={winChance} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>قوتك: {playerPower}</span>
                <span>قوة العدو: {enemyPower}</span>
              </div>
            </div>
          )}
          
          {/* الإجراءات */}
          {!location.isPlayer && location.discovered && (
            <Button className="w-full gap-2" onClick={onSendTroops}>
              <Users className="w-4 h-4" />
              إرسال قوات
            </Button>
          )}
          
          {!location.discovered && (
            <Button className="w-full gap-2" variant="secondary" onClick={onDiscover}>
              <Eye className="w-4 h-4" />
              استكشاف المنطقة
            </Button>
          )}
          
          {location.isPlayer && (
            <Button className="w-full gap-2" variant="outline">
              <Shield className="w-4 h-4" />
              إدارة القلعة
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

// ================= الخريطة المصغرة =================
const MiniMap = ({ locations, fogRadius, selectedId, onSelect }: { 
  locations: MapLocation[];
  fogRadius: number;
  selectedId?: string;
  onSelect: (loc: MapLocation) => void;
}) => {
  return (
    <div className="absolute bottom-4 right-4 w-44 h-44 bg-card/90 backdrop-blur rounded-lg border border-border overflow-hidden shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 to-green-800/60" />
      
      {/* دائرة الرؤية */}
      <div 
        className="absolute rounded-full border-2 border-accent/50 bg-accent/10"
        style={{
          width: `${fogRadius * 2.5}%`,
          height: `${fogRadius * 2.5}%`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      
      {/* النقاط */}
      {locations.map(loc => {
        const x = (loc.position[0] + 40) / 80 * 100;
        const y = (loc.position[2] + 40) / 80 * 100;
        const isVisible = loc.discovered || loc.isPlayer;
        
        const colors: Record<string, string> = {
          castle: loc.isPlayer ? '#C89B3C' : '#666',
          village: '#D2B48C',
          mine: '#FFD700',
          enemy: '#DC143C',
          port: '#4169E1',
          ruins: '#9370DB',
          tower: '#708090',
          forest: '#228B22',
        };
        
        return (
          <button
            key={loc.id}
            className={`absolute w-2.5 h-2.5 rounded-full transition-all ${
              selectedId === loc.id ? 'ring-2 ring-white scale-150' : ''
            } ${isVisible ? '' : 'opacity-30'}`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: colors[loc.type] || '#888',
            }}
            onClick={() => onSelect(loc)}
          />
        );
      })}
      
      <div className="absolute top-1 left-1 text-[10px] text-white/70 font-medium">
        🗺️ الخريطة
      </div>
    </div>
  );
};

// ================= المكون الرئيسي =================
export const World3DMap = ({ 
  playerPower = 500,
  onLocationSelect,
  onBattleResult 
}: World3DMapProps) => {
  const [locations, setLocations] = useState<MapLocation[]>(createLocations);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [showTroopsPanel, setShowTroopsPanel] = useState(false);
  const [movements, setMovements] = useState<TroopMovement[]>([]);
  const [battles, setBattles] = useState<{ position: [number, number, number]; isVictory: boolean }[]>([]);
  const [fogRadius, setFogRadius] = useState(20);
  const [availableTroops, setAvailableTroops] = useState(200);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // معالجة اختيار موقع
  const handleLocationSelect = useCallback((location: MapLocation) => {
    setSelectedLocation(location);
    setShowTroopsPanel(false);
    onLocationSelect?.(location);
  }, [onLocationSelect]);
  
  // إرسال القوات
  const handleSendTroops = useCallback((count: number, type: 'attack' | 'gather' | 'scout') => {
    if (!selectedLocation || count > availableTroops) return;
    
    const duration = Math.sqrt(
      selectedLocation.position[0] ** 2 + 
      selectedLocation.position[2] ** 2
    ) / 3; // ثانية لكل وحدة مسافة
    
    const movement: TroopMovement = {
      id: Date.now().toString(),
      from: [0, 0, 0],
      to: selectedLocation.position,
      targetId: selectedLocation.id,
      troopCount: count,
      progress: 0,
      type,
      startTime: Date.now(),
      duration: Math.max(3, duration),
    };
    
    setMovements(prev => [...prev, movement]);
    setAvailableTroops(prev => prev - count);
    setShowTroopsPanel(false);
    setSelectedLocation(null);
    
    toast.success(`تم إرسال ${count} جندي! ⚔️`);
  }, [selectedLocation, availableTroops]);
  
  // إكمال الحركة
  const handleMovementComplete = useCallback((movementId: string) => {
    const movement = movements.find(m => m.id === movementId);
    if (!movement) return;
    
    const target = locations.find(l => l.id === movement.targetId);
    if (!target) return;
    
    setMovements(prev => prev.filter(m => m.id !== movementId));
    
    if (movement.type === 'scout') {
      // استكشاف
      setLocations(prev => prev.map(l => 
        l.id === movement.targetId ? { ...l, discovered: true } : l
      ));
      setFogRadius(prev => Math.min(40, prev + 3));
      toast.success(`تم استكشاف ${target.name}! 👁️`);
      setAvailableTroops(prev => prev + movement.troopCount);
    } else if (movement.type === 'attack' && target.type === 'enemy') {
      // معركة
      const enemyPower = (target.level || 1) * 150;
      const attackPower = movement.troopCount * 3;
      const isVictory = attackPower > enemyPower * 0.7;
      
      setBattles(prev => [...prev, { position: target.position, isVictory }]);
      setTimeout(() => setBattles(prev => prev.slice(1)), 3000);
      
      const result: BattleResult = {
        id: Date.now().toString(),
        locationName: target.name,
        won: isVictory,
        troopsLost: isVictory ? Math.floor(movement.troopCount * 0.2) : movement.troopCount,
        troopsSurvived: isVictory ? Math.floor(movement.troopCount * 0.8) : 0,
        loot: isVictory ? { gold: (target.level || 1) * 100, resources: (target.level || 1) * 50 } : { gold: 0, resources: 0 },
        timestamp: Date.now(),
      };
      
      if (isVictory) {
        toast.success(`انتصرت على ${target.name}! 🏆 +${result.loot.gold} ذهب`);
        setLocations(prev => prev.filter(l => l.id !== target.id));
        setAvailableTroops(prev => prev + result.troopsSurvived);
      } else {
        toast.error(`خسرت المعركة في ${target.name}! 💀`);
      }
      
      onBattleResult?.(result);
    } else if (movement.type === 'gather') {
      // جمع
      const gathered = Math.min(target.resources || 100, movement.troopCount * 5);
      toast.success(`جمعت ${gathered} موارد من ${target.name}! 📦`);
      setLocations(prev => prev.map(l => 
        l.id === target.id ? { ...l, resources: Math.max(0, (l.resources || 0) - gathered) } : l
      ));
      setAvailableTroops(prev => prev + movement.troopCount);
    }
  }, [movements, locations, onBattleResult]);
  
  // استكشاف منطقة
  const handleDiscover = useCallback(() => {
    if (!selectedLocation) return;
    
    setLocations(prev => prev.map(l => 
      l.id === selectedLocation.id ? { ...l, discovered: true } : l
    ));
    setFogRadius(prev => Math.min(40, prev + 2));
    setSelectedLocation(null);
    toast.success('تم اكتشاف المنطقة! 🔍');
  }, [selectedLocation]);

  return (
    <div className="relative">
      {/* شريط الأدوات */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 bg-card">
            <Eye className="w-3 h-3" />
            خريطة ثلاثية الأبعاد
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Users className="w-3 h-3" />
            {availableTroops} جندي
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Compass className="w-3 h-3" />
            رؤية: {Math.round(fogRadius * 2.5)}%
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {movements.length > 0 && (
            <Badge variant="default" className="gap-1 animate-pulse">
              <Timer className="w-3 h-3" />
              {movements.length} مهمة نشطة
            </Badge>
          )}
          <Button variant="outline" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      {/* الخريطة */}
      <Card 
        className="border-border overflow-hidden relative" 
        style={{ height: isFullscreen ? 'calc(100vh - 200px)' : 550 }}
      >
        <Canvas shadows>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 40, 50]} fov={45} />
            <Scene 
              locations={locations}
              movements={movements}
              battles={battles}
              fogRadius={fogRadius}
              selectedLocationId={selectedLocation?.id}
              onLocationSelect={handleLocationSelect}
              onMovementComplete={handleMovementComplete}
            />
          </Suspense>
        </Canvas>
        
        {/* دليل الخريطة */}
        <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur rounded-lg p-3 border border-border shadow-lg">
          <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-xs">
            <div className="flex items-center gap-1"><span>🏰</span><span className="text-muted-foreground">قلعة</span></div>
            <div className="flex items-center gap-1"><span>⚔️</span><span className="text-muted-foreground">عدو</span></div>
            <div className="flex items-center gap-1"><span>🏘️</span><span className="text-muted-foreground">قرية</span></div>
            <div className="flex items-center gap-1"><span>⛏️</span><span className="text-muted-foreground">منجم</span></div>
          </div>
        </div>
        
        {/* الخريطة المصغرة */}
        <MiniMap 
          locations={locations}
          fogRadius={fogRadius}
          selectedId={selectedLocation?.id}
          onSelect={handleLocationSelect}
        />
        
        {/* لوحات التحكم */}
        <AnimatePresence>
          {selectedLocation && !showTroopsPanel && (
            <LocationPanel
              location={selectedLocation}
              playerPower={playerPower}
              onClose={() => setSelectedLocation(null)}
              onSendTroops={() => setShowTroopsPanel(true)}
              onDiscover={handleDiscover}
            />
          )}
          
          {showTroopsPanel && selectedLocation && (
            <SendTroopsPanel
              location={selectedLocation}
              maxTroops={availableTroops}
              onSend={handleSendTroops}
              onClose={() => setShowTroopsPanel(false)}
            />
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default World3DMap;
