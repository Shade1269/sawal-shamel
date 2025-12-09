import { useRef, useState, useMemo, Suspense, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Sky, 
  Cloud,
  Html,
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, X, Maximize2, Minimize2, 
  Compass, Target
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
}

interface World3DMapProps {
  playerCastlePosition?: [number, number, number];
  onLocationSelect?: (location: MapLocation) => void;
}

// ================= المواقع =================
const LOCATIONS: MapLocation[] = [
  // قلعة اللاعب (المركز)
  { id: 'player', name: 'قلعتك', type: 'castle', position: [0, 0, 0], isPlayer: true, color: '#C89B3C' },
  
  // القرى
  { id: 'village1', name: 'قرية النخيل', type: 'village', position: [15, 0, -10], resources: 500 },
  { id: 'village2', name: 'قرية الوادي', type: 'village', position: [-18, 0, 5], resources: 350 },
  { id: 'village3', name: 'قرية الساحل', type: 'village', position: [8, 0, 20], resources: 420 },
  { id: 'village4', name: 'قرية الجبل', type: 'village', position: [-12, 0, -18], resources: 380 },
  
  // المناجم
  { id: 'mine1', name: 'منجم الذهب الكبير', type: 'mine', position: [25, 0, 0], color: '#FFD700', resources: 1200 },
  { id: 'mine2', name: 'منجم الفضة', type: 'mine', position: [-25, 0, -12], color: '#C0C0C0', resources: 900 },
  { id: 'mine3', name: 'منجم الحديد', type: 'mine', position: [5, 0, -25], color: '#8B4513', resources: 700 },
  
  // معسكرات الأعداء
  { id: 'enemy1', name: 'قلعة الظلام', type: 'enemy', position: [20, 0, 15], level: 8 },
  { id: 'enemy2', name: 'معسكر اللصوص', type: 'enemy', position: [-15, 0, 18], level: 4 },
  { id: 'enemy3', name: 'وكر التنين', type: 'enemy', position: [-8, 0, -28], level: 10 },
  { id: 'enemy4', name: 'خيمة البرابرة', type: 'enemy', position: [28, 0, -15], level: 6 },
  
  // الموانئ
  { id: 'port1', name: 'ميناء التجار', type: 'port', position: [-30, 0, 0], resources: 600 },
  { id: 'port2', name: 'مرسى الصيادين', type: 'port', position: [12, 0, 28], resources: 400 },
  
  // الأطلال
  { id: 'ruins1', name: 'أطلال المعبد القديم', type: 'ruins', position: [0, 0, -20], resources: 2000 },
  { id: 'ruins2', name: 'قصر مهجور', type: 'ruins', position: [-22, 0, -25], resources: 1500 },
  
  // الأبراج
  { id: 'tower1', name: 'برج المراقبة الشمالي', type: 'tower', position: [10, 0, -15] },
  { id: 'tower2', name: 'برج الحراسة الغربي', type: 'tower', position: [-10, 0, 10] },
];

// ================= الأرضية المحسنة =================
const EnhancedTerrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const size = 80;
    const segments = 150;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    const positions = geo.attributes.position;
    const colorArray = new Float32Array(positions.count * 3);
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // تضاريس معقدة
      let height = 0;
      
      // تلال كبيرة
      height += Math.sin(x * 0.08) * Math.cos(y * 0.08) * 2;
      height += Math.sin(x * 0.15 + 2) * Math.cos(y * 0.12) * 1;
      
      // تفاصيل صغيرة
      height += Math.sin(x * 0.4) * Math.cos(y * 0.4) * 0.3;
      
      // جبال في الأطراف
      const distFromCenter = Math.sqrt(x * x + y * y);
      if (distFromCenter > 25) {
        height += (distFromCenter - 25) * 0.15;
        height += Math.sin(distFromCenter * 0.3) * 1.5;
      }
      
      // تسطيح المنطقة المركزية للقلعة
      if (distFromCenter < 8) {
        height *= distFromCenter / 8;
      }
      
      // منخفضات للبحيرات
      const lake1Dist = Math.sqrt((x - 20) ** 2 + (y + 5) ** 2);
      const lake2Dist = Math.sqrt((x + 28) ** 2 + (y - 8) ** 2);
      if (lake1Dist < 8) height = Math.min(height, -0.5);
      if (lake2Dist < 6) height = Math.min(height, -0.5);
      
      positions.setZ(i, height);
      
      // الألوان حسب الارتفاع
      let r, g, b;
      if (height < -0.3) {
        // ماء
        r = 0.1; g = 0.4; b = 0.7;
      } else if (height < 0.5) {
        // عشب أخضر
        r = 0.2 + Math.random() * 0.1;
        g = 0.5 + Math.random() * 0.15;
        b = 0.15;
      } else if (height < 2) {
        // عشب فاتح
        r = 0.35;
        g = 0.55;
        b = 0.2;
      } else if (height < 4) {
        // صخور
        r = 0.45;
        g = 0.4;
        b = 0.35;
      } else {
        // ثلج
        r = 0.9;
        g = 0.92;
        b = 0.95;
      }
      
      colorArray[i * 3] = r;
      colorArray[i * 3 + 1] = g;
      colorArray[i * 3 + 2] = b;
    }
    
    geo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    geo.computeVertexNormals();
    
    return { geometry: geo, colors: colorArray };
  }, []);
  
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <primitive object={geometry} />
      <meshStandardMaterial 
        vertexColors
        roughness={0.85}
        metalness={0.05}
      />
    </mesh>
  );
};

// ================= البحيرة =================
const Lake = ({ position, size = 8 }: { position: [number, number, number]; size?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = -0.2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[size, 48]} />
      <meshStandardMaterial 
        color="#1a6eb5"
        transparent
        opacity={0.85}
        roughness={0.1}
        metalness={0.4}
      />
    </mesh>
  );
};

// ================= الشجرة =================
const Tree = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => {
  const treeType = useMemo(() => Math.random() > 0.5 ? 'pine' : 'oak', []);
  
  if (treeType === 'pine') {
    return (
      <group position={position}>
        <mesh castShadow position={[0, scale * 0.4, 0]}>
          <cylinderGeometry args={[scale * 0.08, scale * 0.12, scale * 0.8, 6]} />
          <meshStandardMaterial color="#4a3728" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[0, scale * 1, 0]}>
          <coneGeometry args={[scale * 0.5, scale * 1.2, 8]} />
          <meshStandardMaterial color="#1a472a" roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, scale * 1.6, 0]}>
          <coneGeometry args={[scale * 0.35, scale * 0.9, 8]} />
          <meshStandardMaterial color="#22543d" roughness={0.8} />
        </mesh>
      </group>
    );
  }
  
  return (
    <group position={position}>
      <mesh castShadow position={[0, scale * 0.5, 0]}>
        <cylinderGeometry args={[scale * 0.1, scale * 0.15, scale, 6]} />
        <meshStandardMaterial color="#5d4037" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, scale * 1.3, 0]}>
        <sphereGeometry args={[scale * 0.7, 8, 8]} />
        <meshStandardMaterial color="#2d5016" roughness={0.8} />
      </mesh>
    </group>
  );
};

// ================= الغابة =================
const Forest = ({ position, count = 20, spread = 5 }: { 
  position: [number, number, number]; 
  count?: number;
  spread?: number;
}) => {
  const trees = useMemo(() => {
    const result = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * spread;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale = 0.4 + Math.random() * 0.6;
      result.push({ x, z, scale, key: i });
    }
    return result;
  }, [count, spread]);
  
  return (
    <group position={position}>
      {trees.map((tree) => (
        <Tree key={tree.key} position={[tree.x, 0, tree.z]} scale={tree.scale} />
      ))}
    </group>
  );
};

// ================= القلعة =================
const Castle3D = ({ 
  location,
  onClick,
  isSelected
}: { 
  location: MapLocation;
  onClick?: () => void;
  isSelected?: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { isPlayer, position, name, color = '#808080' } = location;
  
  useFrame((state) => {
    if (groupRef.current) {
      if (isPlayer) {
        // تأثير التوهج للقلعة الخاصة
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
        groupRef.current.scale.setScalar(scale);
      }
      if (isSelected || hovered) {
        groupRef.current.rotation.y += 0.005;
      }
    }
  });
  
  const wallColor = isPlayer ? '#C89B3C' : hovered ? '#aaa' : '#666';
  const roofColor = isPlayer ? '#8B0000' : color;
  
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
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      
      {/* الجدران العليا */}
      <mesh castShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[2.5, 0.6, 2.5]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      
      {/* الأبراج الأربعة */}
      {[[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.4, 0.5, 3, 8]} />
            <meshStandardMaterial color={wallColor} roughness={0.7} />
          </mesh>
          <mesh position={[0, 3.2, 0]}>
            <coneGeometry args={[0.55, 0.8, 8]} />
            <meshStandardMaterial color={roofColor} roughness={0.5} />
          </mesh>
          {/* شرفات */}
          {[0, 90, 180, 270].map((angle, j) => (
            <mesh key={j} position={[
              Math.cos(angle * Math.PI / 180) * 0.45,
              2.9,
              Math.sin(angle * Math.PI / 180) * 0.45
            ]}>
              <boxGeometry args={[0.15, 0.3, 0.15]} />
              <meshStandardMaterial color={wallColor} />
            </mesh>
          ))}
        </group>
      ))}
      
      {/* البرج الرئيسي */}
      <mesh castShadow position={[0, 2.5, 0]}>
        <boxGeometry args={[1.2, 2.5, 1.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.7} />
      </mesh>
      <mesh position={[0, 4, 0]}>
        <coneGeometry args={[0.85, 1.2, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.5} />
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
      <Html position={[0, 5.5, 0]} center distanceFactor={20}>
        <div className={`px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap border shadow-lg ${
          isPlayer ? 'bg-accent text-accent-foreground border-accent' : 'bg-card/95 text-foreground border-border'
        }`}>
          {isPlayer && '👑 '}{name}
        </div>
      </Html>
    </group>
  );
};

// ================= القرية =================
const Village3D = ({ location, onClick, isSelected }: { 
  location: MapLocation;
  onClick?: () => void;
  isSelected?: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const { position, name } = location;
  
  return (
    <group 
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* البيوت */}
      {[[0, 0], [1.5, 0.8], [-1.2, 0.5], [0.5, -1.2], [-0.8, -0.8]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow position={[0, 0.35, 0]}>
            <boxGeometry args={[0.7, 0.7, 0.7]} />
            <meshStandardMaterial color={hovered ? '#fff' : '#D2B48C'} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <coneGeometry args={[0.55, 0.5, 4]} />
            <meshStandardMaterial color="#8B4513" roughness={0.7} />
          </mesh>
        </group>
      ))}
      
      {/* البئر */}
      <mesh position={[0.8, 0.2, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.4, 12]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
      
      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[2, 2.3, 32]} />
          <meshBasicMaterial color="#8B7355" transparent opacity={0.5} />
        </mesh>
      )}
      
      <Html position={[0, 2.5, 0]} center distanceFactor={20}>
        <div className="bg-card/95 px-2 py-1 rounded text-xs font-bold whitespace-nowrap border border-border text-foreground shadow-lg">
          🏘️ {name}
        </div>
      </Html>
    </group>
  );
};

// ================= المنجم =================
const Mine3D = ({ location, onClick, isSelected }: { 
  location: MapLocation;
  onClick?: () => void;
  isSelected?: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const { position, name, color = '#FFD700' } = location;
  
  return (
    <group 
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* مدخل المنجم */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 1, 1.5]} />
        <meshStandardMaterial color={hovered ? '#888' : '#4a4a4a'} roughness={0.9} />
      </mesh>
      
      {/* الفتحة */}
      <mesh position={[0, 0.5, 0.76]}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* عربة المنجم */}
      <group position={[-1.2, 0.3, 0.5]}>
        <mesh>
          <boxGeometry args={[0.6, 0.4, 0.5]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
        {/* العجلات */}
        <mesh position={[-0.25, -0.15, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.05, 12]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0.25, -0.15, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.05, 12]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>
      
      {/* أكوام المعادن */}
      <mesh position={[1.2, 0.3, 0]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      
      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[2, 2.3, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      )}
      
      <Html position={[0, 2, 0]} center distanceFactor={20}>
        <div className="bg-card/95 px-2 py-1 rounded text-xs font-bold whitespace-nowrap border border-border text-foreground shadow-lg">
          ⛏️ {name}
        </div>
      </Html>
    </group>
  );
};

// ================= معسكر العدو =================
const EnemyCamp3D = ({ location, onClick, isSelected }: { 
  location: MapLocation;
  onClick?: () => void;
  isSelected?: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const flagRef = useRef<THREE.Mesh>(null);
  const { position, name, level = 1 } = location;
  
  useFrame((state) => {
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });
  
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
      
      {/* سياج خشبي */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 3;
        const z = Math.sin(angle) * 3;
        return (
          <mesh key={i} position={[x, 0.5, z]}>
            <boxGeometry args={[0.1, 1, 0.1]} />
            <meshStandardMaterial color="#4a3728" />
          </mesh>
        );
      })}
      
      {/* العلم الأحمر */}
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
      
      {/* نار المعسكر */}
      <pointLight position={[0, 0.5, 0]} color="#ff6600" intensity={0.5} distance={5} />
      
      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[3.5, 3.8, 32]} />
          <meshBasicMaterial color="#DC143C" transparent opacity={0.5} />
        </mesh>
      )}
      
      <Html position={[0, 3, 0]} center distanceFactor={20}>
        <div className="bg-red-600 px-2 py-1 rounded text-xs font-bold whitespace-nowrap text-white shadow-lg">
          ⚔️ {name} (Lv.{level})
        </div>
      </Html>
    </group>
  );
};

// ================= الميناء =================
const Port3D = ({ location, onClick, isSelected }: { 
  location: MapLocation;
  onClick?: () => void;
  isSelected?: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const boatRef = useRef<THREE.Group>(null);
  const { position, name } = location;
  
  useFrame((state) => {
    if (boatRef.current) {
      boatRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      boatRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });
  
  return (
    <group 
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* الرصيف */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[4, 0.3, 2]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      
      {/* المخزن */}
      <mesh castShadow position={[0, 0.7, -0.5]}>
        <boxGeometry args={[2, 1, 1]} />
        <meshStandardMaterial color={hovered ? '#ddd' : '#A0522D'} />
      </mesh>
      <mesh position={[0, 1.4, -0.5]}>
        <boxGeometry args={[2.2, 0.4, 1.2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* القارب */}
      <group ref={boatRef} position={[0, 0, 2]}>
        <mesh>
          <boxGeometry args={[1.5, 0.4, 0.8]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
          <meshStandardMaterial color="#4a3728" />
        </mesh>
        <mesh position={[0.3, 0.6, 0]}>
          <planeGeometry args={[0.6, 0.8]} />
          <meshStandardMaterial color="#f5f5dc" side={THREE.DoubleSide} />
        </mesh>
      </group>
      
      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[3, 3.3, 32]} />
          <meshBasicMaterial color="#4169E1" transparent opacity={0.5} />
        </mesh>
      )}
      
      <Html position={[0, 2.5, 0]} center distanceFactor={20}>
        <div className="bg-card/95 px-2 py-1 rounded text-xs font-bold whitespace-nowrap border border-border text-foreground shadow-lg">
          ⚓ {name}
        </div>
      </Html>
    </group>
  );
};

// ================= الأطلال =================
const Ruins3D = ({ location, onClick, isSelected }: { 
  location: MapLocation;
  onClick?: () => void;
  isSelected?: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const { position, name } = location;
  
  return (
    <group 
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* الأعمدة المكسورة */}
      {[[0, 0], [2, 0], [-2, 0], [0, 2], [0, -2]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.5 + Math.random() * 0.5, z]}>
          <cylinderGeometry args={[0.3, 0.35, 1 + Math.random(), 8]} />
          <meshStandardMaterial color={hovered ? '#ccc' : '#9e9e9e'} roughness={0.9} />
        </mesh>
      ))}
      
      {/* القاعدة */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[5, 0.2, 5]} />
        <meshStandardMaterial color="#757575" />
      </mesh>
      
      {/* الحجارة المتناثرة */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 4,
          0.15,
          (Math.random() - 0.5) * 4
        ]}>
          <boxGeometry args={[0.3 + Math.random() * 0.3, 0.2, 0.3 + Math.random() * 0.3]} />
          <meshStandardMaterial color="#888" />
        </mesh>
      ))}
      
      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[3, 3.3, 32]} />
          <meshBasicMaterial color="#9370DB" transparent opacity={0.5} />
        </mesh>
      )}
      
      <Html position={[0, 2.5, 0]} center distanceFactor={20}>
        <div className="bg-purple-600/90 px-2 py-1 rounded text-xs font-bold whitespace-nowrap text-white shadow-lg">
          🏛️ {name}
        </div>
      </Html>
    </group>
  );
};

// ================= البرج =================
const Tower3D = ({ location, onClick, isSelected }: { 
  location: MapLocation;
  onClick?: () => void;
  isSelected?: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const { position, name } = location;
  
  return (
    <group 
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <mesh castShadow position={[0, 2, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 4, 8]} />
        <meshStandardMaterial color={hovered ? '#999' : '#696969'} />
      </mesh>
      <mesh position={[0, 4.3, 0]}>
        <coneGeometry args={[0.9, 0.8, 8]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      
      {/* النوافذ */}
      {[0, 90, 180, 270].map((angle, i) => (
        <mesh key={i} position={[
          Math.cos(angle * Math.PI / 180) * 0.61,
          2.5,
          Math.sin(angle * Math.PI / 180) * 0.61
        ]}>
          <boxGeometry args={[0.2, 0.4, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
      
      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[1.5, 1.8, 32]} />
          <meshBasicMaterial color="#708090" transparent opacity={0.5} />
        </mesh>
      )}
      
      <Html position={[0, 5.5, 0]} center distanceFactor={20}>
        <div className="bg-card/95 px-2 py-1 rounded text-xs font-bold whitespace-nowrap border border-border text-foreground shadow-lg">
          🗼 {name}
        </div>
      </Html>
    </group>
  );
};

// ================= تحكم الكاميرا =================
const CameraController = ({ targetPosition }: { targetPosition?: [number, number, number] }) => {
  useThree();
  const controlsRef = useRef<any>(null);
  
  useEffect(() => {
    if (targetPosition && controlsRef.current) {
      controlsRef.current.target.set(...targetPosition);
    }
  }, [targetPosition]);
  
  return (
    <OrbitControls 
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={8}
      maxDistance={60}
      maxPolarAngle={Math.PI / 2.1}
      minPolarAngle={Math.PI / 6}
      panSpeed={1.5}
      zoomSpeed={1.2}
      rotateSpeed={0.8}
    />
  );
};

// ================= المشهد الرئيسي =================
const Scene = ({ 
  onLocationSelect,
  selectedLocationId
}: { 
  onLocationSelect?: (location: MapLocation) => void;
  selectedLocationId?: string;
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
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <hemisphereLight intensity={0.3} color="#87ceeb" groundColor="#8B7355" />
      
      {/* السماء */}
      <Sky sunPosition={[100, 50, 100]} turbidity={0.3} rayleigh={0.5} />
      <Cloud position={[-20, 20, -20]} speed={0.1} opacity={0.4} />
      <Cloud position={[25, 18, 10]} speed={0.15} opacity={0.3} />
      <Cloud position={[0, 22, -30]} speed={0.08} opacity={0.35} />
      
      {/* التضاريس */}
      <EnhancedTerrain />
      
      {/* البحيرات */}
      <Lake position={[20, 0, -5]} size={7} />
      <Lake position={[-28, 0, 8]} size={5} />
      
      {/* الغابات */}
      <Forest position={[8, 0, 8]} count={25} spread={4} />
      <Forest position={[-15, 0, -8]} count={20} spread={3.5} />
      <Forest position={[0, 0, 15]} count={18} spread={3} />
      <Forest position={[-25, 0, 20]} count={22} spread={4} />
      <Forest position={[22, 0, -20]} count={15} spread={3} />
      <Forest position={[-5, 0, -25]} count={20} spread={3.5} />
      
      {/* المواقع */}
      {LOCATIONS.map(location => {
        const isSelected = selectedLocationId === location.id;
        const props = { location, onClick: () => onLocationSelect?.(location), isSelected };
        
        switch (location.type) {
          case 'castle':
            return <Castle3D key={location.id} {...props} />;
          case 'village':
            return <Village3D key={location.id} {...props} />;
          case 'mine':
            return <Mine3D key={location.id} {...props} />;
          case 'enemy':
            return <EnemyCamp3D key={location.id} {...props} />;
          case 'port':
            return <Port3D key={location.id} {...props} />;
          case 'ruins':
            return <Ruins3D key={location.id} {...props} />;
          case 'tower':
            return <Tower3D key={location.id} {...props} />;
          default:
            return null;
        }
      })}
      
      <CameraController />
    </>
  );
};

// ================= لوحة التفاصيل =================
const LocationDetailPanel = ({ 
  location, 
  onClose,
  onAction
}: { 
  location: MapLocation | null;
  onClose: () => void;
  onAction: (action: string) => void;
}) => {
  if (!location) return null;
  
  const getIcon = () => {
    const icons: Record<string, string> = {
      castle: '🏰', village: '🏘️', mine: '⛏️', 
      enemy: '⚔️', port: '⚓', ruins: '🏛️', tower: '🗼'
    };
    return icons[location.type] || '📍';
  };
  
  const getActions = () => {
    switch (location.type) {
      case 'castle':
        return location.isPlayer 
          ? [{ id: 'manage', label: 'إدارة القلعة', icon: '⚙️' }]
          : [{ id: 'attack', label: 'هجوم', icon: '⚔️', variant: 'destructive' }];
      case 'village':
        return [
          { id: 'trade', label: 'تجارة', icon: '💰' },
          { id: 'recruit', label: 'تجنيد جنود', icon: '👥' },
        ];
      case 'mine':
        return [
          { id: 'mine', label: 'بدء التعدين', icon: '⛏️' },
          { id: 'occupy', label: 'احتلال المنجم', icon: '🏴' },
        ];
      case 'enemy':
        return [
          { id: 'scout', label: 'استطلاع', icon: '👁️' },
          { id: 'attack', label: 'هجوم', icon: '⚔️', variant: 'destructive' },
        ];
      case 'port':
        return [
          { id: 'trade', label: 'تجارة بحرية', icon: '⛵' },
          { id: 'travel', label: 'سفر لمنطقة جديدة', icon: '🗺️' },
        ];
      case 'ruins':
        return [
          { id: 'explore', label: 'استكشاف', icon: '🔍' },
          { id: 'excavate', label: 'تنقيب', icon: '⛏️' },
        ];
      case 'tower':
        return [
          { id: 'scout', label: 'مراقبة المنطقة', icon: '👁️' },
          { id: 'occupy', label: 'السيطرة', icon: '🏴' },
        ];
      default:
        return [];
    }
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
  const bgColor = bgColors[location.type] || 'from-gray-600 to-gray-500';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className="absolute top-4 right-4 z-30 w-72"
    >
      <Card className="bg-card/98 backdrop-blur-lg border-border overflow-hidden shadow-2xl">
        <div className={`p-4 text-white bg-gradient-to-br ${bgColor}`}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute top-2 left-2 text-white/80 hover:text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-4xl drop-shadow-lg">{getIcon()}</span>
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
        
        <div className="p-4 space-y-2">
          {getActions().map((action: any) => (
            <Button 
              key={action.id}
              variant={action.variant || 'outline'}
              className="w-full gap-2 justify-start"
              onClick={() => onAction(action.id)}
            >
              <span>{action.icon}</span>
              {action.label}
            </Button>
          ))}
          
          <Button 
            variant="secondary" 
            className="w-full gap-2 justify-start mt-2"
            onClick={() => onAction('sendTroops')}
          >
            <Target className="w-4 h-4" />
            إرسال قوات
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

// ================= الخريطة المصغرة =================
const MiniMap = ({ 
  locations, 
  selectedId,
  onSelect 
}: { 
  locations: MapLocation[];
  selectedId?: string;
  onSelect: (loc: MapLocation) => void;
}) => {
  return (
    <div className="absolute bottom-4 right-4 w-48 h-48 bg-card/90 backdrop-blur rounded-lg border border-border overflow-hidden shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/50 to-green-800/50" />
      
      {/* نقاط المواقع */}
      {locations.map(loc => {
        const x = (loc.position[0] + 35) / 70 * 100;
        const y = (loc.position[2] + 35) / 70 * 100;
        
        const colors: Record<string, string> = {
          castle: loc.isPlayer ? '#C89B3C' : '#666',
          village: '#D2B48C',
          mine: '#FFD700',
          enemy: '#DC143C',
          port: '#4169E1',
          ruins: '#9370DB',
          tower: '#708090',
        };
        
        return (
          <button
            key={loc.id}
            className={`absolute w-3 h-3 rounded-full transition-transform hover:scale-150 ${
              selectedId === loc.id ? 'ring-2 ring-white scale-125' : ''
            }`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: colors[loc.type] || '#888',
              boxShadow: `0 0 4px ${colors[loc.type]}`,
            }}
            onClick={() => onSelect(loc)}
          />
        );
      })}
      
      {/* عنوان */}
      <div className="absolute top-1 left-1 text-[10px] text-muted-foreground font-medium">
        🗺️ الخريطة
      </div>
    </div>
  );
};

// ================= المكون الرئيسي =================
export const World3DMap = ({ onLocationSelect }: World3DMapProps) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const handleLocationSelect = useCallback((location: MapLocation) => {
    setSelectedLocation(location);
    onLocationSelect?.(location);
  }, [onLocationSelect]);
  
  const handleAction = useCallback((action: string) => {
    if (!selectedLocation) return;
    
    const messages: Record<string, string> = {
      attack: `بدأت الهجوم على ${selectedLocation.name}! ⚔️`,
      trade: `فتحت التجارة مع ${selectedLocation.name}! 💰`,
      recruit: 'جندت 10 مقاتلين جدد! 👥',
      mine: `بدأت التعدين في ${selectedLocation.name}! ⛏️`,
      manage: 'فتحت إدارة القلعة',
      scout: `استطلعت ${selectedLocation.name}`,
      explore: `اكتشفت كنزاً في ${selectedLocation.name}! 💎`,
      excavate: 'بدأت التنقيب عن الآثار',
      travel: 'بدأت الرحلة البحرية! ⛵',
      occupy: `سيطرت على ${selectedLocation.name}!`,
      sendTroops: `أرسلت قوات إلى ${selectedLocation.name}`,
    };
    
    toast.success(messages[action] || 'تم التنفيذ!');
    setSelectedLocation(null);
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
            <Compass className="w-3 h-3" />
            {LOCATIONS.length} موقع
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-3">
            <span>🖱️ سحب = تدوير</span>
            <span>🔍 تمرير = تكبير</span>
            <span>⌨️ Shift+سحب = تحريك</span>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
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
            <PerspectiveCamera makeDefault position={[0, 35, 45]} fov={45} />
            <Scene 
              onLocationSelect={handleLocationSelect} 
              selectedLocationId={selectedLocation?.id}
            />
          </Suspense>
        </Canvas>
        
        {/* دليل الخريطة */}
        <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur rounded-lg p-3 border border-border shadow-lg">
          <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-xs">
            <div className="flex items-center gap-1"><span>🏰</span><span className="text-muted-foreground">قلعة</span></div>
            <div className="flex items-center gap-1"><span>🏘️</span><span className="text-muted-foreground">قرية</span></div>
            <div className="flex items-center gap-1"><span>⛏️</span><span className="text-muted-foreground">منجم</span></div>
            <div className="flex items-center gap-1"><span>⚔️</span><span className="text-muted-foreground">عدو</span></div>
            <div className="flex items-center gap-1"><span>⚓</span><span className="text-muted-foreground">ميناء</span></div>
            <div className="flex items-center gap-1"><span>🏛️</span><span className="text-muted-foreground">أطلال</span></div>
            <div className="flex items-center gap-1"><span>🗼</span><span className="text-muted-foreground">برج</span></div>
            <div className="flex items-center gap-1"><span>🌲</span><span className="text-muted-foreground">غابة</span></div>
          </div>
        </div>
        
        {/* الخريطة المصغرة */}
        <MiniMap 
          locations={LOCATIONS} 
          selectedId={selectedLocation?.id}
          onSelect={handleLocationSelect}
        />
        
        {/* لوحة التفاصيل */}
        <AnimatePresence>
          {selectedLocation && (
            <LocationDetailPanel
              location={selectedLocation}
              onClose={() => setSelectedLocation(null)}
              onAction={handleAction}
            />
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default World3DMap;
