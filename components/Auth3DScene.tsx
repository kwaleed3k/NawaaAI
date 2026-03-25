"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere, Torus, Icosahedron, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ─── Mouse tracker ─── */
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
function Particles({ count = 60 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);
  const mouse = useMousePosition();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.y = t * 0.03 + mouse.current.x * 0.1;
    mesh.current.rotation.x = Math.sin(t * 0.02) * 0.15 + mouse.current.y * 0.05;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.07} color="#a6ffea" transparent opacity={0.7} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

function PurpleParticles({ count = 40 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.y = -t * 0.02;
    mesh.current.rotation.z = t * 0.015;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#d4a6ff" transparent opacity={0.65} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* ─── Main green morphing sphere ─── */
function MainSphere() {
  const ref = useRef<THREE.Mesh>(null);
  const mouse = useMousePosition();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x = t * 0.12 + mouse.current.y * 0.3;
    ref.current.rotation.y = t * 0.18 + mouse.current.x * 0.3;
    ref.current.position.y = Math.sin(t * 0.4) * 0.3;
    ref.current.position.x = -1.5 + mouse.current.x * 0.4;
  });

  return (
    <Sphere ref={ref} args={[1.4, 64, 64]} position={[-1.5, 0.5, -1]}>
      <MeshDistortMaterial color="#5aedc0" emissive="#23ab7e" emissiveIntensity={0.3} roughness={0.2} metalness={0.6} distort={0.35} speed={2} transparent opacity={0.8} />
    </Sphere>
  );
}

/* ─── Purple Torus ─── */
function FloatingTorus() {
  const ref = useRef<THREE.Mesh>(null);
  const mouse = useMousePosition();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x = t * 0.3;
    ref.current.rotation.y = t * 0.5;
    ref.current.position.x = 2 + Math.sin(t * 0.3) * 0.5 + mouse.current.x * 0.3;
    ref.current.position.y = -0.5 + Math.cos(t * 0.4) * 0.4;
  });

  return (
    <Torus ref={ref} args={[0.8, 0.28, 32, 64]} position={[2, -0.5, -1.5]}>
      <MeshDistortMaterial color="#c9a0f0" emissive="#8054b8" emissiveIntensity={0.3} roughness={0.2} metalness={0.6} distort={0.2} speed={3} transparent opacity={0.75} />
    </Torus>
  );
}

/* ─── Pink Gem ─── */
function FloatingGem() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x = t * 0.4;
    ref.current.rotation.z = t * 0.25;
    ref.current.position.y = 2 + Math.sin(t * 0.5) * 0.4;
    ref.current.position.x = 0.5 + Math.cos(t * 0.3) * 0.3;
  });

  return (
    <Icosahedron ref={ref} args={[0.5, 1]} position={[0.5, 2, -2]}>
      <MeshDistortMaterial color="#f5b8fa" emissive="#e67af3" emissiveIntensity={0.35} roughness={0.2} metalness={0.5} distort={0.25} speed={2.5} transparent opacity={0.75} />
    </Icosahedron>
  );
}

/* ─── Small orbiting electrons ─── */
function Electrons() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.15;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.2;
  });

  const electrons = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      angle: (i / 5) * Math.PI * 2,
      radius: 3.5 + (i % 2) * 1,
      yOff: (Math.random() - 0.5) * 3,
      color: i % 3 === 0 ? "#a6ffea" : i % 3 === 1 ? "#d4a6ff" : "#f5c6fa",
      size: 0.1 + Math.random() * 0.1,
    })), []);

  return (
    <group ref={group}>
      {electrons.map((e, i) => (
        <ElectronDot key={i} {...e} index={i} />
      ))}
    </group>
  );
}

function ElectronDot({ angle, radius, yOff, color, size, index }: { angle: number; radius: number; yOff: number; color: string; size: number; index: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const a = angle + t * (0.15 + index * 0.04);
    ref.current.position.x = Math.cos(a) * radius;
    ref.current.position.y = yOff + Math.sin(t * 0.4 + index) * 0.3;
    ref.current.position.z = Math.sin(a) * radius * 0.4 - 2;
  });

  return (
    <Sphere ref={ref} args={[size, 12, 12]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.7} />
    </Sphere>
  );
}

/* ─── Wireframe ring ─── */
function WireframeRing() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x = t * 0.1;
    ref.current.rotation.y = t * 0.15;
    ref.current.position.y = Math.sin(t * 0.25) * 0.5;
  });

  return (
    <Torus ref={ref} args={[2.5, 0.03, 16, 80]} position={[0, 0, -3]}>
      <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.35} />
    </Torus>
  );
}

/* ─── Scene ─── */
function Scene() {
  const { camera } = useThree();
  const mouse = useMousePosition();

  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.3 - camera.position.x) * 0.015;
    camera.position.y += (mouse.current.y * 0.2 - camera.position.y) * 0.015;
    camera.lookAt(0, 0, -1.5);
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 4, 4]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-4, 2, 2]} intensity={1.2} color="#a6ffea" distance={15} />
      <pointLight position={[4, -1, 2]} intensity={1.0} color="#d4a6ff" distance={12} />
      <pointLight position={[0, 4, -1]} intensity={0.8} color="#f5c6fa" distance={10} />

      <Particles />
      <PurpleParticles />
      <MainSphere />
      <FloatingTorus />
      <FloatingGem />
      <Electrons />
      <WireframeRing />
    </>
  );
}

/* ─── Export ─── */
export default function Auth3DScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
