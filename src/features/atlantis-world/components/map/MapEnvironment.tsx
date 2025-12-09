import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============== التضاريس المحسنة ==============
export const EnhancedTerrain = ({ fogRadius }: { fogRadius: number }) => {
  const geometry = useMemo(() => {
    const size = 120;
    const segments = 256;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    const positions = geo.attributes.position;
    const colorArray = new Float32Array(positions.count * 3);
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const distFromCenter = Math.sqrt(x * x + y * y);
      
      // تضاريس متعددة الطبقات
      let height = 0;
      
      // التلال الكبيرة
      height += Math.sin(x * 0.05) * Math.cos(y * 0.05) * 3;
      height += Math.sin(x * 0.08 + 1.5) * Math.cos(y * 0.07) * 2;
      
      // التفاصيل الصغيرة
      height += Math.sin(x * 0.2) * Math.cos(y * 0.2) * 0.5;
      height += Math.sin(x * 0.35 + 0.5) * Math.cos(y * 0.35 + 0.5) * 0.25;
      
      // الجبال في الأطراف
      if (distFromCenter > 35) {
        const mountainFactor = (distFromCenter - 35) / 20;
        height += mountainFactor * mountainFactor * 8;
        height += Math.sin(distFromCenter * 0.15) * 3 * mountainFactor;
      }
      
      // تسطيح المركز للقلعة
      if (distFromCenter < 8) {
        height *= distFromCenter / 8;
      }
      
      // البحيرات
      const lakes = [
        { x: 20, y: -8, r: 8 },
        { x: -28, y: 15, r: 6 },
        { x: 8, y: 25, r: 7 },
        { x: -15, y: -20, r: 5 },
      ];
      
      for (const lake of lakes) {
        const dist = Math.sqrt((x - lake.x) ** 2 + (y - lake.y) ** 2);
        if (dist < lake.r) {
          height = Math.min(height, -1.5);
        }
      }
      
      // الأنهار
      const riverPath = Math.sin(x * 0.1) * 8;
      if (Math.abs(y - riverPath) < 2 && distFromCenter > 15 && distFromCenter < 40) {
        height = Math.min(height, -0.8);
      }
      
      positions.setZ(i, height);
      
      // ======== الألوان مع ضباب الحرب ========
      let r, g, b;
      const fogFactor = distFromCenter > fogRadius ? 0.25 : 1;
      
      // ماء
      if (height < -0.5) {
        const depth = Math.abs(height);
        r = (0.1 - depth * 0.02) * fogFactor;
        g = (0.4 - depth * 0.05) * fogFactor;
        b = (0.7 - depth * 0.1) * fogFactor;
      }
      // رمل / شاطئ
      else if (height < 0.3) {
        r = 0.76 * fogFactor;
        g = 0.7 * fogFactor;
        b = 0.5 * fogFactor;
      }
      // عشب
      else if (height < 2) {
        const variation = Math.random() * 0.1;
        r = (0.2 + variation * 0.5) * fogFactor;
        g = (0.5 + variation) * fogFactor;
        b = 0.15 * fogFactor;
      }
      // تلال
      else if (height < 5) {
        r = 0.35 * fogFactor;
        g = 0.5 * fogFactor;
        b = 0.2 * fogFactor;
      }
      // صخور
      else if (height < 10) {
        r = 0.45 * fogFactor;
        g = 0.42 * fogFactor;
        b = 0.38 * fogFactor;
      }
      // ثلج
      else {
        r = 0.95 * fogFactor;
        g = 0.97 * fogFactor;
        b = 0.98 * fogFactor;
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
      <meshStandardMaterial 
        vertexColors 
        roughness={0.85} 
        metalness={0.02}
        flatShading={false}
      />
    </mesh>
  );
};

// ============== ضباب الحرب ==============
export const FogOfWar = ({ radius }: { radius: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // تأثير التموج
      meshRef.current.material.opacity = 0.65 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });
  
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
      <ringGeometry args={[radius, 70, 128]} />
      <meshBasicMaterial 
        color="#0a0a15" 
        transparent 
        opacity={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// ============== المياه المتحركة ==============
export const AnimatedWater = ({ position, size = 8 }: { 
  position: [number, number, number]; 
  size?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = -0.4 + Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[size, 64]} />
      <meshStandardMaterial 
        ref={materialRef}
        color="#1a6eb5" 
        transparent 
        opacity={0.85} 
        roughness={0.1} 
        metalness={0.5}
      />
    </mesh>
  );
};

// ============== الشجرة المحسنة ==============
export const Tree = ({ position, scale = 1, variant = 0 }: { 
  position: [number, number, number]; 
  scale?: number;
  variant?: number;
}) => {
  const treeColors = ['#1a472a', '#2d5a3c', '#1f4a2f', '#264d32'];
  const trunkColors = ['#4a3728', '#5a4030', '#3d2e20'];
  
  const leafColor = treeColors[variant % treeColors.length];
  const trunkColor = trunkColors[variant % trunkColors.length];
  
  return (
    <group position={position}>
      {/* الجذع */}
      <mesh castShadow position={[0, scale * 0.5, 0]}>
        <cylinderGeometry args={[scale * 0.1, scale * 0.15, scale * 1, 8]} />
        <meshStandardMaterial color={trunkColor} roughness={0.9} />
      </mesh>
      
      {/* الأوراق - طبقات متعددة */}
      <mesh castShadow position={[0, scale * 1.2, 0]}>
        <coneGeometry args={[scale * 0.6, scale * 1, 8]} />
        <meshStandardMaterial color={leafColor} roughness={0.8} />
      </mesh>
      
      <mesh castShadow position={[0, scale * 1.7, 0]}>
        <coneGeometry args={[scale * 0.45, scale * 0.8, 8]} />
        <meshStandardMaterial color={leafColor} roughness={0.8} />
      </mesh>
      
      <mesh castShadow position={[0, scale * 2.1, 0]}>
        <coneGeometry args={[scale * 0.3, scale * 0.6, 8]} />
        <meshStandardMaterial color={leafColor} roughness={0.8} />
      </mesh>
    </group>
  );
};

// ============== الغابة ==============
export const Forest = ({ 
  position, 
  count = 20, 
  spread = 5,
  discovered = true 
}: { 
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
        scale: 0.5 + Math.random() * 0.6,
        variant: Math.floor(Math.random() * 4),
        key: i 
      });
    }
    return result;
  }, [count, spread]);
  
  const opacity = discovered ? 1 : 0.4;
  
  return (
    <group position={position}>
      {trees.map((tree) => (
        <Tree 
          key={tree.key} 
          position={[tree.x, 0, tree.z]} 
          scale={tree.scale * (discovered ? 1 : 0.7)} 
          variant={tree.variant}
        />
      ))}
    </group>
  );
};

// ============== الصخور ==============
export const Rocks = ({ position, count = 5, spread = 3 }: { 
  position: [number, number, number]; 
  count?: number;
  spread?: number;
}) => {
  const rocks = useMemo(() => {
    const result = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * spread;
      result.push({ 
        x: Math.cos(angle) * radius, 
        z: Math.sin(angle) * radius, 
        scale: 0.2 + Math.random() * 0.4,
        rotY: Math.random() * Math.PI * 2,
        key: i 
      });
    }
    return result;
  }, [count, spread]);
  
  return (
    <group position={position}>
      {rocks.map((rock) => (
        <mesh 
          key={rock.key} 
          position={[rock.x, rock.scale * 0.3, rock.z]}
          rotation={[0, rock.rotY, 0]}
          castShadow
        >
          <dodecahedronGeometry args={[rock.scale]} />
          <meshStandardMaterial color="#666" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
};

// ============== جسيمات الجو ==============
export const AtmosphereParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 30 + 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    
    return positions;
  }, []);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        color="#ffffff" 
        size={0.15} 
        transparent 
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};
