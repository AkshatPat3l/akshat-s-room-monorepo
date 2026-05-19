'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';

// Coordinate types
type Coord = { x: number; z: number };

interface ThreeCanvasProps {
  onFurnitureSelect: (nodeId: string) => void;
  activeNodeId: string | null;
}

// 8x8 Grid bounds: -4 to 3 (actual grid coordinates range from -3 to 4)
const GRID_SIZE = 8;
const halfGrid = GRID_SIZE / 2;

// Map logical coordinates 0..7 to 3D space centered around 0
const gridToWorld = (gridX: number, gridZ: number) => ({
  x: gridX - halfGrid + 0.5,
  z: gridZ - halfGrid + 0.5,
});

const worldToGrid = (worldX: number, worldZ: number) => ({
  x: Math.min(GRID_SIZE - 1, Math.max(0, Math.floor(worldX + halfGrid))),
  z: Math.min(GRID_SIZE - 1, Math.max(0, Math.floor(worldZ + halfGrid))),
});

// Furniture positions (Logical Grid coordinates 0..7)
const FURNITURE_NODES = [
  { id: 'infobus', gridX: 6, gridZ: 6, color: '#2563eb', label: 'Infobus' },
  { id: 'security', gridX: 1, gridZ: 6, color: '#dc2626', label: 'Security' },
  { id: 'marketplace', gridX: 4, gridZ: 1, color: '#eab308', label: 'Marketplace' },
];

// Helper check if a cell has furniture (blocked for walking)
const isCellBlocked = (gx: number, gz: number) => {
  return FURNITURE_NODES.some((f) => f.gridX === gx && f.gridZ === gz);
};

// --- A* PATHFINDING ALGORITHM ---
interface PathNode {
  x: number;
  z: number;
  g: number;
  h: number;
  f: number;
  parent?: PathNode;
}

function findPath(start: Coord, end: Coord): Coord[] {
  const openSet: PathNode[] = [];
  const closedSet = new Set<string>();

  const startNode: PathNode = {
    x: start.x,
    z: start.z,
    g: 0,
    h: Math.abs(start.x - end.x) + Math.abs(start.z - end.z),
    f: 0,
  };
  startNode.f = startNode.h;
  openSet.push(startNode);

  while (openSet.length > 0) {
    // Get node with lowest f score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;

    if (current.x === end.x && current.z === end.z) {
      // Reconstruct path
      const path: Coord[] = [];
      let temp: PathNode | undefined = current;
      while (temp) {
        path.push({ x: temp.x, z: temp.z });
        temp = temp.parent;
      }
      return path.reverse();
    }

    const key = `${current.x},${current.z}`;
    closedSet.add(key);

    // Neighbors (orthogonal directions)
    const neighbors = [
      { x: current.x + 1, z: current.z },
      { x: current.x - 1, z: current.z },
      { x: current.x, z: current.z + 1 },
      { x: current.x, z: current.z - 1 },
    ];

    for (const neighbor of neighbors) {
      if (
        neighbor.x < 0 ||
        neighbor.x >= GRID_SIZE ||
        neighbor.z < 0 ||
        neighbor.z >= GRID_SIZE
      ) {
        continue;
      }

      // Check if blocked, except if neighbor is the target end cell
      if (isCellBlocked(neighbor.x, neighbor.z) && !(neighbor.x === end.x && neighbor.z === end.z)) {
        continue;
      }

      const neighborKey = `${neighbor.x},${neighbor.z}`;
      if (closedSet.has(neighborKey)) {
        continue;
      }

      const gScore = current.g + 1;
      let existingNode = openSet.find((n) => n.x === neighbor.x && n.z === neighbor.z);

      if (!existingNode) {
        const hScore = Math.abs(neighbor.x - end.x) + Math.abs(neighbor.z - end.z);
        const newNode: PathNode = {
          x: neighbor.x,
          z: neighbor.z,
          g: gScore,
          h: hScore,
          f: gScore + hScore,
          parent: current,
        };
        openSet.push(newNode);
      } else if (gScore < existingNode.g) {
        existingNode.g = gScore;
        existingNode.f = gScore + existingNode.h;
        existingNode.parent = current;
      }
    }
  }

  return [start]; // Fallback to start if no path exists
}

// --- AVATAR COMPONENT ---
interface AvatarProps {
  currentPath: Coord[];
  onArrival: (destination: Coord) => void;
}

const Avatar: React.FC<AvatarProps> = ({ currentPath, onArrival }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [targetWorld, setTargetWorld] = useState<THREE.Vector3 | null>(null);
  const [pathIndex, setPathIndex] = useState(0);
  const currentPosRef = useRef<Coord>({ x: 3, z: 3 }); // Initial grid position

  useEffect(() => {
    if (currentPath.length > 0) {
      setPathIndex(0);
      const firstNode = currentPath[0];
      const world = gridToWorld(firstNode.x, firstNode.z);
      setTargetWorld(new THREE.Vector3(world.x, 0.4, world.z));
    }
  }, [currentPath]);

  useFrame((state, delta) => {
    if (!meshRef.current || !targetWorld) return;

    const mesh = meshRef.current;
    const speed = 4.5 * delta; // Constant movement speed

    const currentPos = mesh.position;
    const distance = currentPos.distanceTo(targetWorld);

    if (distance > speed) {
      // Rotate to face the target position smoothly
      const angle = Math.atan2(targetWorld.x - currentPos.x, targetWorld.z - currentPos.z);
      
      // Interpolate rotation
      const currentRotation = mesh.rotation.y;
      const diff = angle - currentRotation;
      // Handle wrapping
      const wrappedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
      mesh.rotation.y += wrappedDiff * 0.15;

      // Move towards target
      const dir = new THREE.Vector3().subVectors(targetWorld, currentPos).normalize();
      mesh.position.addScaledVector(dir, speed);

      // Cute jumping walking animation
      const walkCycle = state.clock.getElapsedTime() * 12;
      mesh.position.y = 0.4 + Math.sin(walkCycle) * 0.08;
    } else {
      // Arrived at current path node
      mesh.position.copy(targetWorld);
      mesh.position.y = 0.4;
      
      const nextIndex = pathIndex + 1;
      if (nextIndex < currentPath.length) {
        setPathIndex(nextIndex);
        const nextNode = currentPath[nextIndex];
        currentPosRef.current = nextNode;
        const world = gridToWorld(nextNode.x, nextNode.z);
        setTargetWorld(new THREE.Vector3(world.x, 0.4, world.z));
      } else {
        // Arrived at the final destination
        setTargetWorld(null);
        onArrival(currentPath[currentPath.length - 1]);
      }
    }
  });

  return (
    <group ref={meshRef} position={[0, 0.4, 0]}>
      {/* Dynamic Avatar styling: Low-poly body */}
      {/* Glowing visor/head */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color="#818cf8" roughness={0.1} emissive="#4f46e5" emissiveIntensity={0.6} />
      </mesh>
      {/* Visor */}
      <mesh position={[0, 0.68, 0.18]}>
        <boxGeometry args={[0.25, 0.08, 0.05]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.5, 0.6, 0.4]} />
        <meshStandardMaterial color="#312e81" roughness={0.4} />
      </mesh>
      {/* Feet */}
      <mesh position={[-0.15, -0.25, 0]}>
        <boxGeometry args={[0.15, 0.2, 0.2]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0.15, -0.25, 0]}>
        <boxGeometry args={[0.15, 0.2, 0.2]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
    </group>
  );
};

// --- FURNITURE NODES COMPONENTS ---

// 1. Blue console block representing Infobus
const InfobusModel: React.FC = () => {
  return (
    <group position={[0, 0.4, 0]}>
      {/* Base platform */}
      <mesh>
        <boxGeometry args={[0.9, 0.1, 0.9]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.2} />
      </mesh>
      {/* Console core */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.7, 0.5, 0.7]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.1} emissive="#1d4ed8" emissiveIntensity={0.3} />
      </mesh>
      {/* Neon glowing interface screen */}
      <mesh position={[0, 0.56, 0.1]}>
        <boxGeometry args={[0.5, 0.15, 0.4]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={1.2} />
      </mesh>
      {/* Hanging server wires (extra details) */}
      <mesh position={[0, 0.2, -0.36]}>
        <boxGeometry args={[0.2, 0.3, 0.05]} />
        <meshStandardMaterial color="#1d4ed8" />
      </mesh>
    </group>
  );
};

// 2. Red security terminal column
const SecurityModel: React.FC = () => {
  return (
    <group position={[0, 0.4, 0]}>
      {/* Circular base */}
      <mesh>
        <cylinderGeometry args={[0.45, 0.45, 0.1, 8]} />
        <meshStandardMaterial color="#450a0a" roughness={0.2} />
      </mesh>
      {/* Server Column */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.4, 0.8, 0.4]} />
        <meshStandardMaterial color="#ef4444" roughness={0.1} />
      </mesh>
      {/* Scanner laser lens */}
      <mesh position={[0, 0.7, 0.21]}>
        <boxGeometry args={[0.25, 0.1, 0.05]} />
        <meshStandardMaterial color="#f87171" emissive="#dc2626" emissiveIntensity={1.8} />
      </mesh>
      {/* Floating security orb (rotating effect) */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#b91c1c" emissive="#ef4444" emissiveIntensity={1.0} />
      </mesh>
    </group>
  );
};

// 3. Gold Marketplace Service Counter
const MarketplaceModel: React.FC = () => {
  return (
    <group position={[0, 0.3, 0]}>
      {/* Wide desk top */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.95, 0.15, 0.8]} />
        <meshStandardMaterial color="#d97706" roughness={0.05} metalness={0.9} />
      </mesh>
      {/* Supporting legs */}
      <mesh position={[-0.35, -0.15, 0]}>
        <boxGeometry args={[0.1, 0.6, 0.6]} />
        <meshStandardMaterial color="#78350f" metalness={0.5} />
      </mesh>
      <mesh position={[0.35, -0.15, 0]}>
        <boxGeometry args={[0.1, 0.6, 0.6]} />
        <meshStandardMaterial color="#78350f" metalness={0.5} />
      </mesh>
      {/* Glowing terminal widget on counter */}
      <mesh position={[0, 0.38, -0.1]}>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
};

// --- SCENE & CANVAS ---
export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ onFurnitureSelect, activeNodeId }) => {
  const [hoveredTile, setHoveredTile] = useState<Coord | null>(null);
  const [avatarPath, setAvatarPath] = useState<Coord[]>([]);
  const [avatarGridPos, setAvatarGridPos] = useState<Coord>({ x: 3, z: 3 }); // Initial grid position
  const [pendingSelection, setPendingSelection] = useState<string | null>(null);

  // Trigger avatar movement when a cell is clicked
  const handleTileClick = (gx: number, gz: number, clickedFurnitureId?: string) => {
    // If furniture is clicked, find nearest accessible cell adjacent to it
    let targetX = gx;
    let targetZ = gz;
    
    if (clickedFurnitureId) {
      setPendingSelection(clickedFurnitureId);
      
      // Look for neighboring spaces to stand next to the furniture
      const neighbors = [
        { x: gx + 1, z: gz },
        { x: gx - 1, z: gz },
        { x: gx, z: gz + 1 },
        { x: gx, z: gz - 1 },
      ];
      
      const accessibleNeighbors = neighbors.filter(
        (n) => n.x >= 0 && n.x < GRID_SIZE && n.z >= 0 && n.z < GRID_SIZE && !isCellBlocked(n.x, n.z)
      );

      if (accessibleNeighbors.length > 0) {
        // Sort by closest to avatar
        accessibleNeighbors.sort(
          (a, b) =>
            Math.abs(a.x - avatarGridPos.x) +
            Math.abs(a.z - avatarGridPos.z) -
            (Math.abs(b.x - avatarGridPos.x) + Math.abs(b.z - avatarGridPos.z))
        );
        targetX = accessibleNeighbors[0].x;
        targetZ = accessibleNeighbors[0].z;
      }
    } else {
      setPendingSelection(null);
    }

    const path = findPath(avatarGridPos, { x: targetX, z: targetZ });
    if (path.length > 0) {
      setAvatarPath(path);
    }
  };

  const handleAvatarArrival = (finalGridPos: Coord) => {
    setAvatarGridPos(finalGridPos);
    setAvatarPath([]);
    
    if (pendingSelection) {
      onFurnitureSelect(pendingSelection);
      setPendingSelection(null);
    }
  };

  return (
    <div className="w-full h-full relative cursor-pointer">
      <Canvas shadows>
        {/* locked 45-degree isometric orthographic camera */}
        <OrthographicCamera
          makeDefault
          position={[14, 14, 14]}
          zoom={38}
          near={0.1}
          far={100}
        />

        {/* Ambient lighting with soft glow */}
        <ambientLight intensity={0.4} />
        
        {/* Core directional light representing sunlight */}
        <directionalLight
          position={[10, 15, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        
        {/* Point neon lights for reflecting on gold/glass surfaces */}
        <pointLight position={[3, 2, 3]} intensity={0.6} color="#818cf8" />
        <pointLight position={[-3, 2, -3]} intensity={0.4} color="#f87171" />

        {/* 8x8 Floor Grid */}
        <group>
          {Array.from({ length: GRID_SIZE }).map((_, gx) =>
            Array.from({ length: GRID_SIZE }).map((__, gz) => {
              const world = gridToWorld(gx, gz);
              const isHovered = hoveredTile?.x === gx && hoveredTile?.z === gz;
              const isFurniture = isCellBlocked(gx, gz);
              
              // Identify which furniture belongs here, if any
              const furnitureNode = FURNITURE_NODES.find((f) => f.gridX === gx && f.gridZ === gz);
              
              // Grid Tile styling: alternating colors for a checkerboard matrix
              const isEven = (gx + gz) % 2 === 0;
              let defaultColor = isEven ? '#111827' : '#1f2937';
              if (isFurniture) {
                defaultColor = '#030712'; // darker background for base under models
              }

              return (
                <group key={`${gx}-${gz}`}>
                  {/* The Floor Tile Plane */}
                  <mesh
                    position={[world.x, 0.01, world.z]}
                    onPointerOver={(e) => {
                      e.stopPropagation();
                      if (!isFurniture) {
                        setHoveredTile({ x: gx, z: gz });
                      }
                    }}
                    onPointerOut={() => setHoveredTile(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (furnitureNode) {
                        handleTileClick(gx, gz, furnitureNode.id);
                      } else {
                        handleTileClick(gx, gz);
                      }
                    }}
                  >
                    <boxGeometry args={[0.92, 0.04, 0.92]} />
                    <meshStandardMaterial
                      color={isHovered ? '#6366f1' : defaultColor}
                      roughness={0.5}
                      metalness={0.1}
                      emissive={isHovered ? '#4f46e5' : '#000000'}
                      emissiveIntensity={isHovered ? 0.8 : 0}
                    />
                  </mesh>

                  {/* Render furniture model if it belongs to this cell */}
                  {furnitureNode && (
                    <group
                      position={[world.x, 0.05, world.z]}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTileClick(gx, gz, furnitureNode.id);
                      }}
                    >
                      {furnitureNode.id === 'infobus' && <InfobusModel />}
                      {furnitureNode.id === 'security' && <SecurityModel />}
                      {furnitureNode.id === 'marketplace' && <MarketplaceModel />}
                    </group>
                  )}
                </group>
              );
            })
          )}
        </group>

        {/* Pathfinding Walkable Avatar */}
        <Avatar currentPath={avatarPath} onArrival={handleAvatarArrival} />
      </Canvas>
    </div>
  );
};
export default ThreeCanvas;
