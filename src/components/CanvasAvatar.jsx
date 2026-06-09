import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function NoktaAvatar() {
  const group    = useRef();
  const eyeL     = useRef();
  const eyeR     = useRef();
  const antenna  = useRef();

  useFrame(({ clock, mouse, viewport }) => {
    const t = clock.getElapsedTime();

    // Sadece basit bir süzülme (floating) efekti
    if (group.current) {
      const floatY = Math.sin(t * 1.8) * 0.06;
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, floatY, 0.1);

      // Sadece mouse'u takip etme
      const tx = (mouse.x * viewport.width)  / 12;
      const ty = (mouse.y * viewport.height) / 12;
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, tx,  0.04);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -ty, 0.04);
    }

    // Anten sabit yanar
    if (antenna.current) {
      antenna.current.material.emissiveIntensity = 1.2;
    }

    // Basit göz kırpma (Blinking)
    if (eyeL.current && eyeR.current) {
      const blink = Math.abs(Math.sin(t * 0.5)) < 0.04 ? 0.1 : 1;
      eyeL.current.scale.y = THREE.MathUtils.lerp(eyeL.current.scale.y, blink, 0.3);
      eyeR.current.scale.y = THREE.MathUtils.lerp(eyeR.current.scale.y, blink, 0.3);
    }
  });

  const white = new THREE.MeshPhysicalMaterial({
    color: '#ffffff', roughness: 0.08, metalness: 0.05,
    clearcoat: 1, clearcoatRoughness: 0.08,
  });
  const blue = new THREE.MeshStandardMaterial({
    color: '#1a6bff', roughness: 0.4, metalness: 0.2,
  });
  const glow = new THREE.MeshStandardMaterial({
    color: '#1a6bff', emissive: '#1a6bff', emissiveIntensity: 1, roughness: 0.1,
  });

  return (
    <group ref={group} scale={0.75}>
      {/* ── Head (speech-bubble shape: sphere + cone tail) ── */}
      <mesh scale={[1, 0.88, 0.92]} material={white}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
      {/* Speech bubble tail */}
      <mesh position={[0.52, -0.72, 0]} rotation={[0, 0, Math.PI / 3.8]} material={white}>
        <coneGeometry args={[0.28, 0.58, 32]} />
      </mesh>

      {/* ── Antenna ── */}
      <mesh position={[-0.08, 0.92, 0]} rotation={[0, 0, Math.PI / 9]} material={white}>
        <cylinderGeometry args={[0.038, 0.048, 0.48, 16]} />
      </mesh>
      <mesh ref={antenna} position={[-0.28, 1.13, 0]} material={glow}>
        <sphereGeometry args={[0.14, 32, 32]} />
      </mesh>

      {/* ── Eyes ── */}
      <mesh ref={eyeL} position={[-0.34, 0.12, 0.87]} material={blue}>
        <capsuleGeometry args={[0.09, 0.14, 16, 16]} />
      </mesh>
      <mesh ref={eyeR} position={[0.34, 0.12, 0.87]} material={blue}>
        <capsuleGeometry args={[0.09, 0.14, 16, 16]} />
      </mesh>

      {/* ── Mouth (Fixed small smile) ── */}
      <mesh position={[0, -0.17, 0.91]} rotation={[-Math.PI / 12, 0, Math.PI]} material={blue}>
        <torusGeometry args={[0.16, 0.04, 16, 32, Math.PI]} />
      </mesh>

      {/* ── WiFi Signal Bars (right side) ── */}
      <group position={[0.68, 0.48, 0.62]} rotation={[0, 0, -Math.PI / 6]}>
        {[
          { pos: [-0.14, -0.14, 0], h: 0.07 },
          { pos: [0,      0,      0], h: 0.13 },
          { pos: [0.14,   0.14,  0], h: 0.19 },
        ].map(({ pos, h }, i) => (
          <mesh key={i} position={pos} material={blue}>
            <capsuleGeometry args={[0.022, h, 8, 8]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
