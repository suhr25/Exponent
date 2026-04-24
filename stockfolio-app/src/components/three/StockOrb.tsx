'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface StockOrbProps {
  position: [number, number, number];
  color: string;
  size?: number;
  speed?: number;
  distort?: number;
}

export default function StockOrb({
  position,
  color,
  size = 0.5,
  speed = 1,
  distort = 0.3,
}: StockOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed;
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.15;
    meshRef.current.rotation.x = t * 0.2;
    meshRef.current.rotation.z = t * 0.1;
  });

  return (
    <Sphere ref={meshRef} args={[size, 64, 64]} position={position}>
      <MeshDistortMaterial
        color={color}
        speed={2}
        distort={distort}
        roughness={0.2}
        metalness={0.8}
        transparent
        opacity={0.85}
      />
    </Sphere>
  );
}
