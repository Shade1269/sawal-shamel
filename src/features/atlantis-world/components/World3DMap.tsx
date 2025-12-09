import { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Sky, 
  Cloud,
  Html,
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ================= أنواع البيانات =================
interface MapLocation {
  id: string;
  name: string;
  type: 'castle' | 'village' | 'forest' | 'mine' | 'enemy' | 'mountain' | 'water';
  position: [number, number, number];
  scale?: number;
  color?: string;
  level?: number;
  isPlayer?: boolean;
}

interface World3DMapProps {
  playerCastlePosition?: [number, number, number];
  onLocationSelect?: (location: MapLocation) => void;
}

// ================= المواقع الافتراضية =================
const LOCATIONS: MapLocation[] = [
  { id: 'player', name: 'قلعتي', type: 'castle', position: [0, 0, 0], isPlayer: true, color: '#C89B3C' },
  { id: 'enemy1', name: 'قلعة الظلام', type: 'enemy', position: [8, 0, 5], level: 5, color: '#DC143C' },
  { id: 'enemy2', name: 'معسكر اللصوص', type: 'enemy', position: [-6, 0, 8], level: 3, color: '#DC143C' },
  { id: 'village1', name: 'قرية الشرق', type: 'village', position: [5, 0, -4], color: '#8B7355' },
  { id: 'village2', name: 'قرية الغرب', type: 'village', position: [-7, 0, -3], color: '#8B7355' },
  { id: 'mine1', name: 'منجم الذهب', type: 'mine', position: [10, 0, -8], color: '#FFD700' },
  { id: 'mine2', name: 'منجم الفضة', type: 'mine', position: [-10, 0, 6], color: '#C0C0C0' },
];

// ================= مكونات التضاريس =================

// الأرضية / التضاريس
const Terrain = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(50, 50, 100, 100);
    const positions = geo.attributes.position;
    
    // إنشاء تضاريس عشوائية
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      // تلال ناعمة
      let height = Math.sin(x * 0.3) * Math.cos(y * 0.3) * 0.5;
      height += Math.sin(x * 0.1 + 1) * Math.cos(y * 0.1) * 1;
      
      // تسطيح المنطقة المركزية للقلعة
      const distFromCenter = Math.sqrt(x * x + y * y);
      if (distFromCenter < 5) {
        height *= distFromCenter / 5;
      }
      
      positions.setZ(i, height);
    }
    
    geo.computeVertexNormals();
    return geo;
  }, []);
  
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <primitive object={geometry} />
      <meshStandardMaterial 
        color="#4a7c4e"
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
};

// البحيرة / الماء
const Water = ({ position, size = 8 }: { position: [number, number, number]; size?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = -0.3 + Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[size, 32]} />
      <meshStandardMaterial 
        color="#1e90ff"
        transparent
        opacity={0.7}
        roughness={0.2}
        metalness={0.3}
      />
    </mesh>
  );
};

// الجبل
const MountainMesh = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => {
  return (
    <group position={position}>
      <mesh castShadow position={[0, scale * 1.5, 0]}>
        <coneGeometry args={[scale * 2, scale * 3, 6]} />
        <meshStandardMaterial color="#6b7280" roughness={0.9} />
      </mesh>
      {/* قمة ثلجية */}
      <mesh position={[0, scale * 2.5, 0]}>
        <coneGeometry args={[scale * 0.8, scale * 1, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
    </group>
  );
};

// الشجرة
const Tree = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => {
  return (
    <group position={position}>
      {/* الجذع */}
      <mesh castShadow position={[0, scale * 0.5, 0]}>
        <cylinderGeometry args={[scale * 0.15, scale * 0.2, scale, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      {/* الأوراق */}
      <mesh castShadow position={[0, scale * 1.3, 0]}>
        <coneGeometry args={[scale * 0.7, scale * 1.5, 8]} />
        <meshStandardMaterial color="#228B22" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, scale * 2, 0]}>
        <coneGeometry args={[scale * 0.5, scale * 1, 8]} />
        <meshStandardMaterial color="#2E8B57" roughness={0.8} />
      </mesh>
    </group>
  );
};

// غابة (مجموعة أشجار)
const Forest = ({ position, count = 10, spread = 4 }: { 
  position: [number, number, number]; 
  count?: number;
  spread?: number;
}) => {
  const trees = useMemo(() => {
    const result = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = Math.random() * spread;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale = 0.5 + Math.random() * 0.5;
      result.push({ x, z, scale, key: i });
    }
    return result;
  }, [count, spread]);
  
  return (
    <group position={position}>
      {trees.map((tree) => (
        <Tree 
          key={tree.key} 
          position={[tree.x, 0, tree.z]} 
          scale={tree.scale} 
        />
      ))}
    </group>
  );
};

// القلعة
const Castle = ({ 
  position, 
  isPlayer = false, 
  color = '#C89B3C',
  onClick,
  name
}: { 
  position: [number, number, number]; 
  isPlayer?: boolean;
  color?: string;
  onClick?: () => void;
  name: string;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (groupRef.current && isPlayer) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });
  
  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* القاعدة */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial color={hovered ? '#ffffff' : '#808080'} roughness={0.7} />
      </mesh>
      
      {/* الأبراج */}
      {[[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 2, 8]} />
            <meshStandardMaterial color={hovered ? '#ffffff' : '#707070'} roughness={0.7} />
          </mesh>
          <mesh position={[0, 2.7, 0]}>
            <coneGeometry args={[0.45, 0.6, 8]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
        </group>
      ))}
      
      {/* البرج الرئيسي */}
      <mesh castShadow position={[0, 2, 0]}>
        <boxGeometry args={[1, 2.5, 1]} />
        <meshStandardMaterial color={hovered ? '#ffffff' : '#909090'} roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.5, 0]}>
        <coneGeometry args={[0.7, 1, 4]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      
      {/* العلم */}
      {isPlayer && (
        <mesh position={[0, 4.2, 0]}>
          <boxGeometry args={[0.05, 0.8, 0.01]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      )}
      
      {/* التسمية */}
      <Html position={[0, 4.5, 0]} center distanceFactor={15}>
        <div className="bg-card/90 backdrop-blur px-2 py-1 rounded text-xs font-bold whitespace-nowrap border border-border text-foreground">
          {name}
        </div>
      </Html>
    </group>
  );
};

// القرية
const Village = ({ 
  position, 
  onClick,
  name
}: { 
  position: [number, number, number];
  onClick?: () => void;
  name: string;
}) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* البيوت */}
      {[[0, 0], [1, 0.5], [-0.8, 0.3], [0.3, -0.8]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow position={[0, 0.3, 0]}>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <meshStandardMaterial color={hovered ? '#ffffff' : '#D2691E'} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <coneGeometry args={[0.5, 0.4, 4]} />
            <meshStandardMaterial color="#8B0000" roughness={0.7} />
          </mesh>
        </group>
      ))}
      
      <Html position={[0, 2, 0]} center distanceFactor={15}>
        <div className="bg-card/90 backdrop-blur px-2 py-1 rounded text-xs font-bold whitespace-nowrap border border-border text-foreground">
          {name}
        </div>
      </Html>
    </group>
  );
};

// المنجم
const Mine = ({ 
  position, 
  color = '#FFD700',
  onClick,
  name
}: { 
  position: [number, number, number];
  color?: string;
  onClick?: () => void;
  name: string;
}) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* مدخل المنجم */}
      <mesh castShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[1.5, 0.8, 1]} />
        <meshStandardMaterial color={hovered ? '#ffffff' : '#4a4a4a'} roughness={0.9} />
      </mesh>
      
      {/* الفتحة */}
      <mesh position={[0, 0.4, 0.51]}>
        <planeGeometry args={[0.8, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* كومة المعادن */}
      <mesh position={[1, 0.3, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
      </mesh>
      
      <Html position={[0, 1.5, 0]} center distanceFactor={15}>
        <div className="bg-card/90 backdrop-blur px-2 py-1 rounded text-xs font-bold whitespace-nowrap border border-border text-foreground">
          {name}
        </div>
      </Html>
    </group>
  );
};

// معسكر العدو
const EnemyCamp = ({ 
  position, 
  level = 1,
  onClick,
  name
}: { 
  position: [number, number, number];
  level?: number;
  onClick?: () => void;
  name: string;
}) => {
  const [hovered, setHovered] = useState(false);
  const flagRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });
  
  return (
    <group 
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* الخيام */}
      {[[0, 0], [1.2, 0.5], [-1, 0.3]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.5, z]}>
          <coneGeometry args={[0.6, 1, 6]} />
          <meshStandardMaterial color={hovered ? '#ffffff' : '#8B0000'} roughness={0.8} />
        </mesh>
      ))}
      
      {/* العلم */}
      <group position={[0, 0, -1]}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 2, 8]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
        <mesh ref={flagRef} position={[0.3, 1.7, 0]}>
          <boxGeometry args={[0.6, 0.4, 0.02]} />
          <meshStandardMaterial color="#DC143C" />
        </mesh>
      </group>
      
      <Html position={[0, 2.5, 0]} center distanceFactor={15}>
        <div className="bg-red-500/90 backdrop-blur px-2 py-1 rounded text-xs font-bold whitespace-nowrap text-white">
          {name} (Lv.{level})
        </div>
      </Html>
    </group>
  );
};

// ================= المشهد الرئيسي =================
const Scene = ({ onLocationSelect }: { onLocationSelect?: (location: MapLocation) => void }) => {
  return (
    <>
      {/* الإضاءة */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* السماء */}
      <Sky sunPosition={[100, 20, 100]} />
      <Cloud position={[-10, 15, -10]} speed={0.2} opacity={0.5} />
      <Cloud position={[10, 12, 5]} speed={0.3} opacity={0.4} />
      
      {/* التضاريس */}
      <Terrain />
      
      {/* البحيرات */}
      <Water position={[12, 0, 0]} size={6} />
      <Water position={[-8, 0, -10]} size={4} />
      
      {/* الجبال */}
      <MountainMesh position={[15, 0, 15]} scale={2} />
      <MountainMesh position={[-15, 0, 12]} scale={1.5} />
      <MountainMesh position={[18, 0, -5]} scale={1.8} />
      <MountainMesh position={[-12, 0, -15]} scale={2.2} />
      
      {/* الغابات */}
      <Forest position={[6, 0, 10]} count={15} spread={3} />
      <Forest position={[-10, 0, 0]} count={12} spread={2.5} />
      <Forest position={[0, 0, -12]} count={10} spread={2} />
      <Forest position={[-5, 0, 15]} count={8} spread={2} />
      
      {/* المواقع */}
      {LOCATIONS.map(loc => {
        if (loc.type === 'castle') {
          return (
            <Castle 
              key={loc.id}
              position={loc.position}
              isPlayer={loc.isPlayer}
              color={loc.color}
              name={loc.name}
              onClick={() => onLocationSelect?.(loc)}
            />
          );
        }
        if (loc.type === 'village') {
          return (
            <Village 
              key={loc.id}
              position={loc.position}
              name={loc.name}
              onClick={() => onLocationSelect?.(loc)}
            />
          );
        }
        if (loc.type === 'mine') {
          return (
            <Mine 
              key={loc.id}
              position={loc.position}
              color={loc.color}
              name={loc.name}
              onClick={() => onLocationSelect?.(loc)}
            />
          );
        }
        if (loc.type === 'enemy') {
          return (
            <EnemyCamp 
              key={loc.id}
              position={loc.position}
              level={loc.level}
              name={loc.name}
              onClick={() => onLocationSelect?.(loc)}
            />
          );
        }
        return null;
      })}
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
    switch (location.type) {
      case 'castle': return '🏰';
      case 'village': return '🏘️';
      case 'mine': return '⛏️';
      case 'enemy': return '⚔️';
      case 'forest': return '🌲';
      default: return '📍';
    }
  };
  
  const getActions = () => {
    switch (location.type) {
      case 'castle':
        return location.isPlayer 
          ? [{ id: 'upgrade', label: 'ترقية', icon: '⬆️' }]
          : [{ id: 'attack', label: 'هجوم', icon: '⚔️' }];
      case 'village':
        return [
          { id: 'trade', label: 'تجارة', icon: '💰' },
          { id: 'recruit', label: 'تجنيد', icon: '👥' },
        ];
      case 'mine':
        return [{ id: 'mine', label: 'التعدين', icon: '⛏️' }];
      case 'enemy':
        return [{ id: 'attack', label: 'هجوم', icon: '⚔️' }];
      default:
        return [];
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 z-30 w-64"
    >
      <Card className="bg-card/95 backdrop-blur border-border overflow-hidden">
        <div 
          className="p-4 text-white"
          style={{ 
            background: location.type === 'enemy' 
              ? 'linear-gradient(135deg, #DC143C, #8B0000)'
              : 'linear-gradient(135deg, #5A2647, #3d1a30)'
          }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute top-2 left-2 text-white/80 hover:text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getIcon()}</span>
            <div>
              <h3 className="font-bold">{location.name}</h3>
              {location.level && (
                <Badge variant="secondary" className="mt-1">مستوى {location.level}</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          {getActions().map(action => (
            <Button 
              key={action.id}
              variant={action.id === 'attack' ? 'destructive' : 'outline'}
              className="w-full gap-2"
              onClick={() => onAction(action.id)}
            >
              <span>{action.icon}</span>
              {action.label}
            </Button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

// ================= المكون الرئيسي =================
export const World3DMap = ({ onLocationSelect }: World3DMapProps) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  
  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location);
    onLocationSelect?.(location);
  };
  
  const handleAction = (action: string) => {
    if (!selectedLocation) return;
    
    switch (action) {
      case 'attack':
        toast.success(`بدأت الهجوم على ${selectedLocation.name}! ⚔️`);
        break;
      case 'trade':
        toast.success('فتحت التجارة مع القرية! 💰');
        break;
      case 'recruit':
        toast.success('جندت 10 مقاتلين جدد! 👥');
        break;
      case 'mine':
        toast.success('بدأت التعدين! ⛏️');
        break;
      case 'upgrade':
        toast.success('بدأت ترقية القلعة! 🏰');
        break;
    }
    
    setSelectedLocation(null);
  };

  return (
    <div className="relative">
      {/* أدوات التحكم */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Eye className="w-3 h-3" />
            عرض ثلاثي الأبعاد
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>🖱️ اسحب للتدوير</span>
          <span>|</span>
          <span>🔍 للتكبير</span>
        </div>
      </div>
      
      {/* الخريطة */}
      <Card className="border-border overflow-hidden" style={{ height: 500 }}>
        <Canvas shadows>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 20, 25]} fov={50} />
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={10}
              maxDistance={50}
              maxPolarAngle={Math.PI / 2.2}
            />
            <Scene onLocationSelect={handleLocationSelect} />
          </Suspense>
        </Canvas>
        
        {/* دليل الخريطة */}
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur rounded-lg p-3 border border-border">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span>🏰</span>
              <span className="text-muted-foreground">قلعة</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🏘️</span>
              <span className="text-muted-foreground">قرية</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⛏️</span>
              <span className="text-muted-foreground">منجم</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⚔️</span>
              <span className="text-muted-foreground">عدو</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🌲</span>
              <span className="text-muted-foreground">غابة</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⛰️</span>
              <span className="text-muted-foreground">جبل</span>
            </div>
          </div>
        </div>
        
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
