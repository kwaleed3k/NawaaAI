"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, Torus, Box, Icosahedron } from "@react-three/drei";
import * as THREE from "three";

/* ─── Scroll tracker hook ─── */
function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return progress;
}

/* ─── Mouse position hook ─── */
function useMousePosition() {
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return mouse;
}

/* ─── Floating Particles ─── */
function Particles({ count = 120, scrollProgress }: { count?: number; scrollProgress: number }) {
  const mesh = useRef<THREE.Points>(null);
  const mouse = useMousePosition();

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      sz[i] = Math.random() * 3 + 1;
    }
    return [pos, sz];
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.y = t * 0.02 + scrollProgress * Math.PI * 0.5;
    mesh.current.rotation.x = Math.sin(t * 0.01) * 0.1 + mouse.current.y * 0.05;
    mesh.current.position.z = -scrollProgress * 8;

    // Pulse opacity based on scroll
    const mat = mesh.current.material as THREE.PointsMaterial;
    mat.opacity = 0.4 + Math.sin(scrollProgress * Math.PI * 2) * 0.2;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#23ab7e"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Purple Particles ─── */
function PurpleParticles({ count = 80, scrollProgress }: { count?: number; scrollProgress: number }) {
  const mesh = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.y = -t * 0.015 + scrollProgress * Math.PI * 0.3;
    mesh.current.rotation.z = t * 0.01;
    mesh.current.position.y = Math.sin(scrollProgress * Math.PI) * 2;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#8054b8"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Main Green Sphere — morphs with scroll ─── */
function HeroSphere({ scrollProgress }: { scrollProgress: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const mouse = useMousePosition();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;

    // Position: starts center-right, moves based on scroll
    const targetX = 3.5 - scrollProgress * 12;
    const targetY = 0.5 + Math.sin(scrollProgress * Math.PI * 2) * 2;
    const targetZ = -1 - scrollProgress * 5;

    ref.current.position.x += (targetX - ref.current.position.x) * 0.02;
    ref.current.position.y += (targetY - ref.current.position.y) * 0.02;
    ref.current.position.z += (targetZ - ref.current.position.z) * 0.02;

    // Rotation
    ref.current.rotation.x = t * 0.15 + mouse.current.y * 0.3;
    ref.current.rotation.y = t * 0.2 + mouse.current.x * 0.3;

    // Scale pulsing
    const scale = 1.2 + Math.sin(t * 0.5) * 0.1 - scrollProgress * 0.3;
    ref.current.scale.setScalar(Math.max(0.3, scale));
  });

  return (
    <Sphere ref={ref} args={[1.5, 64, 64]} position={[3.5, 0.5, -1]}>
      <MeshDistortMaterial
        color="#23ab7e"
        roughness={0.2}
        metalness={0.8}
        distort={0.4 + scrollProgress * 0.3}
        speed={2}
        transparent
        opacity={0.7}
      />
    </Sphere>
  );
}

/* ─── Purple Torus — orbits through sections ─── */
function OrbitingTorus({ scrollProgress }: { scrollProgress: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const mouse = useMousePosition();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;

    // Orbit path
    const angle = t * 0.3 + scrollProgress * Math.PI * 4;
    const radius = 4 + Math.sin(scrollProgress * Math.PI * 2) * 2;
    ref.current.position.x = Math.cos(angle) * radius + mouse.current.x * 0.5;
    ref.current.position.y = Math.sin(angle) * 1.5 + Math.sin(t * 0.4) * 0.5;
    ref.current.position.z = Math.sin(angle) * radius * 0.3 - 2;

    ref.current.rotation.x = t * 0.4;
    ref.current.rotation.y = t * 0.6 + scrollProgress * Math.PI;

    const s = 0.8 + Math.sin(scrollProgress * Math.PI) * 0.3;
    ref.current.scale.setScalar(s);
  });

  return (
    <Torus ref={ref} args={[1, 0.35, 32, 64]} position={[-3, 1, -2]}>
      <MeshDistortMaterial
        color="#8054b8"
        roughness={0.15}
        metalness={0.9}
        distort={0.25}
        speed={3}
        transparent
        opacity={0.65}
      />
    </Torus>
  );
}

/* ─── Pink Icosahedron — geometric accent ─── */
function FloatingGem({ scrollProgress }: { scrollProgress: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;

    const phase = scrollProgress * Math.PI * 3;
    ref.current.position.x = -4 + Math.sin(phase) * 3;
    ref.current.position.y = -1 + Math.cos(phase + t * 0.2) * 2;
    ref.current.position.z = -3 + Math.sin(t * 0.15) * 1;

    ref.current.rotation.x = t * 0.5;
    ref.current.rotation.z = t * 0.3 + scrollProgress * 2;

    const s = 0.6 + Math.sin(scrollProgress * Math.PI * 2 + 1) * 0.2;
    ref.current.scale.setScalar(s);
  });

  return (
    <Icosahedron ref={ref} args={[1, 1]} position={[-4, -1, -3]}>
      <MeshDistortMaterial
        color="#e67af3"
        roughness={0.1}
        metalness={0.95}
        distort={0.3}
        speed={2.5}
        transparent
        opacity={0.55}
      />
    </Icosahedron>
  );
}

/* ─── Mint Wireframe Box — tech feel ─── */
function WireframeBox({ scrollProgress }: { scrollProgress: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;

    ref.current.position.x = 5 - scrollProgress * 10;
    ref.current.position.y = -2 + Math.sin(t * 0.3 + scrollProgress * 4) * 1.5;
    ref.current.position.z = -4;

    ref.current.rotation.x = t * 0.2 + scrollProgress * 3;
    ref.current.rotation.y = t * 0.3;
    ref.current.rotation.z = t * 0.1;
  });

  return (
    <Box ref={ref} args={[1.5, 1.5, 1.5]} position={[5, -2, -4]}>
      <meshBasicMaterial color="#a6ffea" wireframe transparent opacity={0.3} />
    </Box>
  );
}

/* ─── Small orbiting spheres — like electrons ─── */
function ElectronSpheres({ scrollProgress }: { scrollProgress: number }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = t * 0.1 + scrollProgress * Math.PI * 2;
    group.current.rotation.x = Math.sin(t * 0.05) * 0.3;
  });

  const electrons = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 5 + (i % 3) * 1.5;
      const yOff = (Math.random() - 0.5) * 4;
      const color = i % 3 === 0 ? "#23ab7e" : i % 3 === 1 ? "#8054b8" : "#e67af3";
      return { angle, radius, yOff, color, size: 0.15 + Math.random() * 0.2 };
    });
  }, []);

  return (
    <group ref={group}>
      {electrons.map((e, i) => (
        <ElectronBall key={i} {...e} index={i} scrollProgress={scrollProgress} />
      ))}
    </group>
  );
}

function ElectronBall({
  angle,
  radius,
  yOff,
  color,
  size,
  index,
  scrollProgress,
}: {
  angle: number;
  radius: number;
  yOff: number;
  color: string;
  size: number;
  index: number;
  scrollProgress: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const a = angle + t * (0.2 + index * 0.05) + scrollProgress * Math.PI;
    ref.current.position.x = Math.cos(a) * radius;
    ref.current.position.y = yOff + Math.sin(t * 0.5 + index) * 0.5;
    ref.current.position.z = Math.sin(a) * radius * 0.5 - 3;
  });

  return (
    <Sphere ref={ref} args={[size, 16, 16]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.7} />
    </Sphere>
  );
}

/* ─── Connecting Lines — flow between shapes ─── */
function FlowLines({ scrollProgress }: { scrollProgress: number }) {
  const ref = useRef<THREE.Group>(null);

  const lineObj = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 100; i++) {
      const t = i / 100;
      points.push(
        new THREE.Vector3(
          Math.sin(t * Math.PI * 4) * 6,
          (t - 0.5) * 15,
          Math.cos(t * Math.PI * 4) * 3 - 3
        )
      );
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: "#23ab7e", transparent: true, opacity: 0.15 });
    return new THREE.Line(geometry, material);
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.05 + scrollProgress * 0.5;
    ref.current.position.y = -scrollProgress * 5;
  });

  return (
    <group ref={ref}>
      <primitive object={lineObj} />
    </group>
  );
}

/* ─── Gradient Background Plane ─── */
function GradientBg({ scrollProgress }: { scrollProgress: number }) {
  const ref = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uColor1: { value: new THREE.Color("#23ab7e") },
    uColor2: { value: new THREE.Color("#8054b8") },
    uColor3: { value: new THREE.Color("#e67af3") },
  }), []);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uScroll.value = scrollProgress;
  });

  return (
    <mesh ref={ref} position={[0, 0, -12]}>
      <planeGeometry args={[50, 50]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform float uScroll;
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform vec3 uColor3;
          varying vec2 vUv;
          void main() {
            float t = uScroll;
            vec3 col1 = mix(uColor1, uColor2, sin(vUv.x * 3.14 + uTime * 0.2) * 0.5 + 0.5);
            vec3 col2 = mix(uColor2, uColor3, sin(vUv.y * 3.14 + uTime * 0.15 + t * 3.0) * 0.5 + 0.5);
            vec3 finalColor = mix(col1, col2, vUv.y + sin(uTime * 0.1) * 0.1);
            float alpha = 0.06 + sin(t * 3.14) * 0.03;
            gl_FragColor = vec4(finalColor, alpha);
          }
        `}
      />
    </mesh>
  );
}

/* ─── Scene Orchestrator ─── */
function Scene({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();
  const mouse = useMousePosition();

  useFrame(() => {
    // Subtle camera movement based on mouse
    camera.position.x += (mouse.current.x * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (mouse.current.y * 0.3 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, -3);
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-5, 3, 2]} intensity={1} color="#23ab7e" distance={15} />
      <pointLight position={[5, -2, 3]} intensity={0.8} color="#8054b8" distance={12} />
      <pointLight position={[0, 5, -2]} intensity={0.5} color="#e67af3" distance={10} />

      {/* Background */}
      <GradientBg scrollProgress={scrollProgress} />

      {/* Particles */}
      <Particles scrollProgress={scrollProgress} />
      <PurpleParticles scrollProgress={scrollProgress} />

      {/* Main shapes */}
      <HeroSphere scrollProgress={scrollProgress} />
      <OrbitingTorus scrollProgress={scrollProgress} />
      <FloatingGem scrollProgress={scrollProgress} />
      <WireframeBox scrollProgress={scrollProgress} />

      {/* Electrons */}
      <ElectronSpheres scrollProgress={scrollProgress} />

      {/* Flow lines */}
      <FlowLines scrollProgress={scrollProgress} />
    </>
  );
}

/* ─── Main Export ─── */
export default function Landing3DScene() {
  const scrollProgress = useScrollProgress();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Skip 3D on mobile for performance
  if (!mounted || isMobile) return null;

  return (
    <div className="fixed inset-0 -z-5 pointer-events-none" style={{ zIndex: -1 }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Scene scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
