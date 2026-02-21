import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
// @ts-ignore
import * as THREE from "three";

/**
 * Personagem do aluno - Avatar 3D simples
 */
function PlayerCharacter({ position = [0, 1, 0] }: { position?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      // Leve rotação para dar vida ao personagem
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Cabeça */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>

      {/* Corpo */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.8, 0.3]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>

      {/* Braços */}
      <mesh position={[-0.3, 0.2, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      <mesh position={[0.3, 0.2, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>

      {/* Pernas */}
      <mesh position={[-0.15, -0.5, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.15, -0.5, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

/**
 * Parede do calabouço
 */
function DungeonWall({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
    </mesh>
  );
}

/**
 * Piso do calabouço com textura
 */
function DungeonFloor() {
  return (
    <mesh position={[0, -1, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
    </mesh>
  );
}

/**
 * Tocha de fogo (luz)
 */
function Torch({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Haste da tocha */}
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Chama (esfera com luz) */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#ff6b35" />
      </mesh>

      {/* Luz da chama */}
      <pointLight position={[0, 0.7, 0]} intensity={1.5} color="#ff6b35" distance={10} />
    </group>
  );
}

/**
 * Cena 3D do calabouço
 */
function DungeonScene() {
  const { camera } = useThree() as any;

  useEffect(() => {
    // Posicionar câmera em terceira pessoa
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 1, 0);
  }, [camera]);

  return (
    <>
      {/* Iluminação */}
      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Ambiente */}
      <Environment preset="night" />

      {/* Piso */}
      <DungeonFloor />

      {/* Paredes do calabouço */}
      {/* Parede frontal */}
      <DungeonWall position={[0, 2, -10]} size={[20, 4, 0.5]} />

      {/* Parede traseira */}
      <DungeonWall position={[0, 2, 10]} size={[20, 4, 0.5]} />

      {/* Parede esquerda */}
      <DungeonWall position={[-10, 2, 0]} size={[0.5, 4, 20]} />

      {/* Parede direita */}
      <DungeonWall position={[10, 2, 0]} size={[0.5, 4, 20]} />

      {/* Teto */}
      <mesh position={[0, 4, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Tochas para iluminação atmosférica */}
      <Torch position={[-8, 2, -8]} />
      <Torch position={[8, 2, -8]} />
      <Torch position={[-8, 2, 8]} />
      <Torch position={[8, 2, 8]} />

      {/* Personagem do aluno */}
      <PlayerCharacter position={[0, 0, 0]} />

      {/* Controles de câmera em terceira pessoa */}
      <OrbitControls
        target={[0, 1, 0]}
        minDistance={3}
        maxDistance={10}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
      />
    </>
  );
}

/**
 * Componente GameScene - Cena 3D do jogo
 */
export function GameScene() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas
        shadows
        camera={{ position: [0, 2, 5], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
      >
        <DungeonScene />
      </Canvas>
    </div>
  );
}
