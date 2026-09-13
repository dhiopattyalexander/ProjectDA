import { Suspense, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Stars } from '@react-three/drei'
import * as THREE from 'three'
import useGyroscope from '../hooks/useGyroscope'

// Rose petal
function Petal({ position, rotation, scale, speed, color }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x += speed * 0.006
    meshRef.current.rotation.z += speed * 0.004
    meshRef.current.position.y += Math.sin(state.clock.elapsedTime * speed + position[0]) * 0.002
    meshRef.current.position.x += Math.cos(state.clock.elapsedTime * speed * 0.7) * 0.001
  })
  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[0.28, 0.38, 1]} />
      <meshStandardMaterial color={color || '#C9184A'} transparent opacity={0.55}
        side={THREE.DoubleSide} roughness={0.4} metalness={0.1} />
    </mesh>
  )
}

// Glass sphere
function GlassOrb({ position, color, size }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += 0.004
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.18
  })
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshPhysicalMaterial color={color} transparent opacity={0.2}
        roughness={0} metalness={0.05} transmission={0.9} thickness={1.5} />
    </mesh>
  )
}

// Gold torus ring
function Ring({ position, color, scale = 1 }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4 + position[0]) * 0.4
    meshRef.current.rotation.z += 0.004
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6) * 0.12
  })
  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <torusGeometry args={[0.4, 0.055, 16, 50]} />
      <meshStandardMaterial color={color} roughness={0.05} metalness={0.95}
        emissive={new THREE.Color(color)} emissiveIntensity={0.25} />
    </mesh>
  )
}

// Diamond shape
function Diamond({ position }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += 0.008
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.7) * 0.1
  })
  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.2, 0]} />
      <meshPhysicalMaterial color="#FFD700" roughness={0} metalness={0.8}
        emissive="#FFD700" emissiveIntensity={0.4} transmission={0.3} />
    </mesh>
  )
}

// Firefly / sparkle point
function Firefly({ position }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    meshRef.current.position.x = position[0] + Math.sin(t * 0.8 + position[1]) * 0.4
    meshRef.current.position.y = position[1] + Math.cos(t * 0.6 + position[0]) * 0.3
    meshRef.current.position.z = position[2] + Math.sin(t * 0.5) * 0.2
    meshRef.current.material.opacity = (Math.sin(t * 2 + position[0] * 3) + 1) / 2 * 0.8
  })
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshStandardMaterial color="#FFD700" transparent opacity={0.7}
        emissive="#FFD700" emissiveIntensity={2} />
    </mesh>
  )
}

// Camera Gyro & Tilt Controller
function GyroCameraController({ tiltX, tiltY }) {
  const { camera } = useThree()

  useFrame(() => {
    // Lerp camera position based on gyroscope tilt
    const targetX = tiltX * 1.6
    const targetY = -tiltY * 1.2
    camera.position.x += (targetX - camera.position.x) * 0.06
    camera.position.y += (targetY - camera.position.y) * 0.06
    camera.lookAt(0, 0, 0)
  })

  return null
}

function Scene({ tiltX, tiltY }) {
  const petals = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    position: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 4 - 2],
    rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
    scale: [0.5 + Math.random() * 0.9, 0.5 + Math.random() * 0.9, 1],
    speed: 0.4 + Math.random() * 1.2,
    color: ['#C9184A', '#A4162A', '#E0607A', '#FADADD'][Math.floor(Math.random() * 4)],
  }))

  const fireflies = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    position: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3 - 1],
  }))

  return (
    <>
      <GyroCameraController tiltX={tiltX} tiltY={tiltY} />

      <ambientLight intensity={0.5} color="#4A0F1A" />
      <directionalLight position={[5, 10, 5]} intensity={1.4} color="#FFD700" />
      <pointLight position={[-5, -3, 2]} intensity={1} color="#C9184A" />
      <pointLight position={[3, 5, -3]} intensity={0.6} color="#FFD700" />

      <Stars radius={18} depth={10} count={500} factor={2} saturation={0.5} fade speed={0.4} />

      {petals.map((p) => (
        <Float key={p.id} speed={p.speed} rotationIntensity={0.3} floatIntensity={0.4}>
          <Petal {...p} />
        </Float>
      ))}

      {fireflies.map((f) => (
        <Firefly key={f.id} position={f.position} />
      ))}

      <GlassOrb position={[-4, 1.8, -2.5]} color="#6B0F1A" size={0.6} />
      <GlassOrb position={[4, -1.2, -3]} color="#A4162A" size={0.42} />

      <Ring position={[-3, -1.8, -2]} color="#FFD700" />
      <Ring position={[3.2, 1.5, -2.5]} color="#FFE566" />

      <Diamond position={[2, -2.5, -1.5]} />
      <Diamond position={[-3.5, 2, -2]} />

      <fog attach="fog" args={['#1A0507', 10, 22]} />
    </>
  )
}

export default function FloatingScene() {
  const { tiltX, tiltY } = useGyroscope()

  return (
    <Canvas
      camera={{ position: [0, 0, 6.5], fov: 54 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <Scene tiltX={tiltX} tiltY={tiltY} />
      </Suspense>
    </Canvas>
  )
}
