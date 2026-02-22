import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sky, Environment, Text3D, Center } from "@react-three/drei";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gamepad2, Star, Book, ShoppingCart, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import * as THREE from "three";

// Componente de avatar 3D simplificado
function Avatar({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Corpo */}
      <mesh ref={meshRef} castShadow>
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
      {/* Cabeça */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
    </group>
  );
}

// Plataforma do mundo
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.5, 0]}>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#10b981" />
    </mesh>
  );
}

// Portal de missão
function MissionPortal({ position, missionNumber, onClick }: { 
  position: [number, number, number]; 
  missionNumber: number;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef}>
        <torusGeometry args={[1, 0.3, 16, 32]} />
        <meshStandardMaterial 
          color="#8b5cf6" 
          emissive="#8b5cf6" 
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      <Center position={[0, 0, 0]}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.5}
          height={0.1}
        >
          {`M${missionNumber}`}
          <meshStandardMaterial color="#ffffff" />
        </Text3D>
      </Center>
    </group>
  );
}

// Cena 3D principal
function Scene({ onMissionClick }: { onMissionClick: (missionId: number) => void }) {
  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#8b5cf6" />
      
      <Ground />
      <Avatar position={[0, 0, 0]} />
      
      {/* Portais de missões em círculo */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <MissionPortal
            key={i}
            position={[x, 2, z]}
            missionNumber={i + 1}
            onClick={() => onMissionClick(i + 1)}
          />
        );
      })}
      
      <OrbitControls 
        enablePan={false}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
      />
      <Environment preset="sunset" />
    </>
  );
}

export default function GameHub() {
  const [, setLocation] = useLocation();
  const [classId] = useState(1); // TODO: Get from context
  
  const { data: progress, isLoading } = trpc.game.getProgress.useQuery({ classId });

  const handleMissionClick = (missionId: number) => {
    setLocation(`/game/mission/${missionId}`);
  };

  const handleHintsShop = () => {
    setLocation("/game/hints-shop");
  };

  const handleExit = () => {
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-white text-lg">Carregando mundo...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Canvas 3D */}
      <Canvas
        shadows
        camera={{ position: [0, 8, 12], fov: 50 }}
        className="absolute inset-0"
      >
        <Suspense fallback={null}>
          <Scene onMissionClick={handleMissionClick} />
        </Suspense>
      </Canvas>

      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-start justify-between pointer-events-auto">
          {/* Player Info */}
          <Card className="bg-black/60 backdrop-blur-sm border-purple-500/50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Gamepad2 size={24} className="text-yellow-400" />
              <div>
                <p className="text-white font-bold">Nível {progress?.level || 1}</p>
                <p className="text-purple-200 text-sm">
                  {progress?.questsCompleted || 0} / {progress?.questsTotal || 16} Missões
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star size={20} className="text-yellow-400" />
              <span className="text-white font-bold text-lg">
                {progress?.farmacologiaPoints || 0} PF
              </span>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleHintsShop}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <ShoppingCart size={18} className="mr-2" />
              Loja de Dicas
            </Button>
            <Button
              onClick={handleExit}
              variant="outline"
              className="bg-black/60 backdrop-blur-sm border-white/20 text-white hover:bg-black/80"
            >
              <LogOut size={18} className="mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <Card className="bg-black/60 backdrop-blur-sm border-purple-500/50 p-4">
          <div className="flex items-center gap-4 text-white text-sm">
            <div className="flex items-center gap-2">
              <Book size={16} className="text-purple-400" />
              <span>Clique nos portais para iniciar missões</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <span>Arraste para rotacionar • Scroll para zoom</span>
          </div>
        </Card>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-96 pointer-events-none">
        <Card className="bg-black/60 backdrop-blur-sm border-purple-500/50 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm font-semibold">Progresso do Curso</span>
            <span className="text-purple-200 text-sm">
              {Math.round(((progress?.questsCompleted || 0) / (progress?.questsTotal || 16)) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{
                width: `${((progress?.questsCompleted || 0) / (progress?.questsTotal || 16)) * 100}%`,
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
