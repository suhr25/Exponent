'use client';

import { useRef, useMemo, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 1200;

export default function ParticleField() {
  const meshRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handlePointerMove);
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, []);

  const { positions, colors, velocities } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      positions[i3] = (Math.random() - 0.5) * viewport.width * 4;
      positions[i3 + 1] = (Math.random() - 0.5) * viewport.height * 4;
      positions[i3 + 2] = (Math.random() - 0.5) * 20 - 5;

      // Refined color palette — more muted, premium feel
      const type = Math.random();
      if (type > 0.5) {
        // Cyan / teal — cool tones
        colors[i3] = 0.08 + Math.random() * 0.1;
        colors[i3 + 1] = 0.55 + Math.random() * 0.3;
        colors[i3 + 2] = 0.6 + Math.random() * 0.35;
      } else if (type > 0.2) {
        // Emerald — gains
        colors[i3] = 0.1 + Math.random() * 0.12;
        colors[i3 + 1] = 0.65 + Math.random() * 0.3;
        colors[i3 + 2] = 0.35 + Math.random() * 0.3;
      } else {
        // Soft violet — accent
        colors[i3] = 0.45 + Math.random() * 0.2;
        colors[i3 + 1] = 0.3 + Math.random() * 0.18;
        colors[i3 + 2] = 0.65 + Math.random() * 0.3;
      }

      // Organic velocities — slow upward drift for "market going up" feel
      velocities[i3] = (Math.random() - 0.5) * 0.008;
      velocities[i3 + 1] = 0.002 + Math.random() * 0.012;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.003;
    }

    return { positions, colors, velocities };
  }, [viewport.width, viewport.height]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;

    const time = state.clock.elapsedTime;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      posArr[i3] += velocities[i3] * delta * 50;
      posArr[i3 + 1] += velocities[i3 + 1] * delta * 50;
      posArr[i3 + 2] += velocities[i3 + 2] * delta * 50;

      // Organic wave
      posArr[i3] += Math.sin(time * 0.2 + i * 0.01) * 0.002;
      posArr[i3 + 1] += Math.cos(time * 0.15 + i * 0.012) * 0.0015;

      // Mouse attraction (subtle, not repulsion)
      const dx = posArr[i3] - mx * viewport.width * 0.5;
      const dy = posArr[i3 + 1] - my * viewport.height * 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 4) {
        const force = (4 - dist) * 0.005;
        posArr[i3] += (dx / dist) * force;
        posArr[i3 + 1] += (dy / dist) * force;
      }

      // Wrap
      const bx = viewport.width * 1.5;
      const by = viewport.height * 1.5;
      if (posArr[i3] > bx) posArr[i3] = -bx;
      if (posArr[i3] < -bx) posArr[i3] = bx;
      if (posArr[i3 + 1] > by) posArr[i3 + 1] = -by;
      if (posArr[i3 + 1] < -by) posArr[i3 + 1] = by;
    }

    posAttr.needsUpdate = true;
    meshRef.current.rotation.z = Math.sin(time * 0.03) * 0.015;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.2}
        vertexColors
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
