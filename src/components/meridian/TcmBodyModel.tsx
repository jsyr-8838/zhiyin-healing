'use client';

// TcmBodyModel.tsx — R3F 3D人体穴位交互组件
// 加载TCM human.obj模型 + 571穴3D坐标 + 14经经络线
// 替换原有BodyParts3D多OBJ方案

import React, { useRef, useState, useCallback, useMemo, useEffect, memo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import {
  getTcmAcupoints,
  getTcmMeridians,
  getMeridianPath,
  type TcmAcupoint,
  type TcmMeridian,
} from '@/lib/tcm-acupoint-data';
import { WUXING_COLORS_DISPLAY } from '@/components/meridian/constants';

// ============================================================
// Props
// ============================================================

export interface TcmBodyModelProps {
  selectedMeridians: Set<string>;
  selectedPoint: TcmAcupoint | null;
  wuxingFilter: Set<string>;
  autoRotate: boolean;
  focusCode: string | null;
  videoPlayingPoint: string | null;  // 正在播放视频的穴位code，用于3D脉动高亮
  focusTrigger?: number;  // 递增时强制重新聚焦相机
  onPointClick: (point: TcmAcupoint, meridian: TcmMeridian) => void;
}

// ============================================================
// 常量
// ============================================================

// TCM模型坐标缩放因子（原始坐标范围 ~0~1.714，放大到合理3D尺寸）
const SCALE = 100;
const MODEL_PATH = '/models/tcm-3d/human.obj';

// ============================================================
// OBJ模型加载器组件
// ============================================================

function HumanModel() {
  const obj = useLoader(OBJLoader, MODEL_PATH);
  const meshRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!obj) return;
    // 应用材质
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: 0xd4c5a9,
          roughness: 0.65,
          metalness: 0.05,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
        });
        mesh.castShadow = false;
        mesh.receiveShadow = true;
      }
    });
    // 缩放模型到合理尺寸（TCM坐标放大SCALE倍）
    obj.scale.set(SCALE, SCALE, SCALE);
  }, [obj]);

  return <primitive ref={meshRef} object={obj} />;
}

// ============================================================
// 穴位球体
// ============================================================

interface AcupointSphereProps {
  point: TcmAcupoint;
  meridianColor: string;
  isActive: boolean;
  isSelected: boolean;
  isHovered: boolean;
  isVideoPlaying: boolean;  // 视频播放中，产生呼吸脉动
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}

const AcupointSphere = memo(function AcupointSphere({
  point, meridianColor, isActive, isSelected, isHovered, isVideoPlaying, onClick, onHover,
}: AcupointSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [x, y, z] = point.position3d;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    // 视频播放时呼吸脉动效果
    let targetScale: number;
    if (isVideoPlaying) {
      const breathe = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5; // 0~1 脉动
      targetScale = 1.8 + breathe * 1.2; // 1.8~3.0 脉动范围
    } else {
      targetScale = isSelected ? 2.0 : isHovered ? 1.6 : isActive ? 1.0 : 0.5;
    }
    const current = meshRef.current.scale.x;
    const next = current + (targetScale - current) * Math.min(1, delta * 8);
    meshRef.current.scale.setScalar(next);

    // 透明度和发光
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (mat) {
      if (isVideoPlaying) {
        const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7; // 0.4~1.0
        mat.emissiveIntensity = pulse;
        mat.opacity = 1.0;
      } else {
        mat.emissiveIntensity = isSelected ? 0.8 : isHovered ? 0.6 : isActive ? 0.3 : 0.15;
        mat.opacity = isActive ? 1.0 : 0.6;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[x * SCALE, y * SCALE, z * SCALE]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); onHover(true); }}
      onPointerOut={() => onHover(false)}
    >
      <sphereGeometry args={[0.4, 12, 12]} />
      <meshStandardMaterial
        color={meridianColor}
        emissive={meridianColor}
        emissiveIntensity={0.3}
        transparent
        opacity={0.9}
        depthWrite={false}
      />
      {(isHovered || isSelected) && (
        <Html
          position={[0, 1.5, 0]}
          center
          style={{
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div className="px-2 py-1 bg-black/90 border border-white/20 rounded text-[10px] text-white shadow-lg">
            <span className="font-bold">{point.name}</span>
            <span className="ml-1 text-white/60">{point.code}</span>
          </div>
        </Html>
      )}
    </mesh>
  );
});

// ============================================================
// 经络管线
// ============================================================

interface MeridianTubeProps {
  meridian: TcmMeridian;
  isActive: boolean;
  visible: boolean;
}

const MeridianTube = memo(function MeridianTube({ meridian, isActive, visible }: MeridianTubeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const path = useMemo(() => getMeridianPath(meridian.code), [meridian.code]);

  if (!visible || path.length < 2) return null;

  const points = path.map(([x, y, z]) => new THREE.Vector3(x * SCALE, y * SCALE, z * SCALE));

  return (
    <group ref={groupRef}>
      <Line
        points={points}
        color={meridian.color}
        lineWidth={isActive ? 3 : 1.5}
        opacity={isActive ? 0.9 : 0.4}
        transparent
      />
    </group>
  );
});

// ============================================================
// 气流粒子（经络动画）
// ============================================================

interface QiFlowProps {
  meridian: TcmMeridian;
  isActive: boolean;
}

function QiFlow({ meridian, isActive }: QiFlowProps) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const path = useMemo(() => getMeridianPath(meridian.code), [meridian.code]);
  const count = 4;
  const progressRef = useRef(Float32Array.from({ length: count }, (_, i) => i / count));

  useFrame((_, delta) => {
    if (!ref.current || !isActive || path.length < 2) return;

    const curve = new THREE.CatmullRomCurve3(
      path.map(([x, y, z]) => new THREE.Vector3(x * SCALE, y * SCALE, z * SCALE))
    );
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      progressRef.current[i] = (progressRef.current[i] + delta * 0.15) % 1;
      const pos = curve.getPoint(progressRef.current[i]);
      dummy.position.copy(pos);
      const pulse = 0.7 + 0.3 * Math.sin(performance.now() * 0.005 + i * 2);
      dummy.scale.setScalar(pulse);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  if (!isActive || path.length < 2) return null;

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.6, 8, 8]} />
      <meshBasicMaterial color={meridian.color} transparent opacity={0.9} depthWrite={false} />
    </instancedMesh>
  );
}

// ============================================================
// 相机控制（动画聚焦）
// ============================================================

interface CameraControllerProps {
  targetPoint: TcmAcupoint | null;
  autoRotate: boolean;
  focusTrigger?: number;
}

function CameraController({ targetPoint, autoRotate, focusTrigger }: CameraControllerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const animRef = useRef({
    active: false,
    from: new THREE.Vector3(),
    to: new THREE.Vector3(),
    targetFrom: new THREE.Vector3(),
    targetTo: new THREE.Vector3(),
    progress: 0,
  });

  useEffect(() => {
    if (!targetPoint) return;
    const [x, y, z] = targetPoint.position3d;
    const tx = x * SCALE;
    const ty = y * SCALE;
    const tz = z * SCALE;

    // 相机目标位置：离穴位更近（15单位），从斜上方看
    const offset = new THREE.Vector3(8, 10, 15);
    const dest = new THREE.Vector3(tx + offset.x, ty + offset.y, tz + offset.z);

    animRef.current = {
      active: true,
      from: camera.position.clone(),
      to: dest,
      targetFrom: (controlsRef.current as any)?.target?.clone() || new THREE.Vector3(0, 85, 0),
      targetTo: new THREE.Vector3(tx, ty, tz),
      progress: 0,
    };
  }, [targetPoint, camera, focusTrigger]);

  useFrame((_, delta) => {
    const anim = animRef.current;
    if (anim.active && anim.progress < 1) {
      anim.progress = Math.min(1, anim.progress + delta * 1.5);
      const t = 1 - Math.pow(1 - anim.progress, 3); // ease out cubic

      camera.position.lerpVectors(anim.from, anim.to, t);
      if (controlsRef.current) {
        const target = new THREE.Vector3().lerpVectors(anim.targetFrom, anim.targetTo, t);
        (controlsRef.current as any).target.copy(target);
      }
      if (anim.progress >= 1) anim.active = false;
    }
  });

  return (
      <OrbitControls
        ref={controlsRef}
        autoRotate={autoRotate}
        autoRotateSpeed={1.0}
        enableDamping
        dampingFactor={0.05}
        target={[0, 85, 0]}
        minDistance={10}
        maxDistance={500}
      />
  );
}

// ============================================================
// 场景内容（Canvas内部）
// ============================================================

interface SceneContentProps extends TcmBodyModelProps {
  onHoveredPointChange: (point: TcmAcupoint | null) => void;
}

function SceneContent({
  selectedMeridians,
  selectedPoint,
  wuxingFilter,
  autoRotate,
  focusCode,
  videoPlayingPoint,
  focusTrigger,
  onPointClick,
  onHoveredPointChange,
}: SceneContentProps) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [modelError, setModelError] = useState(false);

  const acupoints = useMemo(() => getTcmAcupoints(), []);
  const meridians = useMemo(() => getTcmMeridians(), []);

  const focusTarget = useMemo(() => {
    if (!focusCode) return null;
    return acupoints.find(p => p.code === focusCode) || null;
  }, [focusCode, acupoints]);

  const handlePointClick = useCallback((point: TcmAcupoint) => {
    const m = meridians.find(m => m.code === point.meridian);
    if (m) onPointClick(point, m);
  }, [meridians, onPointClick]);

  const handleHover = useCallback((code: string | null) => {
    setHoveredCode(code);
    if (code) {
      const p = acupoints.find(p => p.code === code);
      onHoveredPointChange(p || null);
    } else {
      onHoveredPointChange(null);
    }
  }, [acupoints, onHoveredPointChange]);

  // 按经脉分组渲染穴位
  const meridianAcupoints = useMemo(() => {
    const map = new Map<string, TcmAcupoint[]>();
    for (const p of acupoints) {
      if (!map.has(p.meridian)) map.set(p.meridian, []);
      map.get(p.meridian)!.push(p);
    }
    return map;
  }, [acupoints]);

  return (
    <>
      {/* 灯光 */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[100, 200, 100]} intensity={0.8} />
      <directionalLight position={[-50, 0, -50]} intensity={0.3} color={0x8b9dc3} />
      <directionalLight position={[0, -50, -100]} intensity={0.25} />

      {/* 人体模型 */}
      {!modelError && (
        <React.Suspense fallback={null}>
          <HumanModel />
        </React.Suspense>
      )}

      {/* 经络管线 + 气流粒子 */}
      {meridians.map(m => {
        const isActive = selectedMeridians.has(m.code);
        const visibleByFilter = wuxingFilter.size === 0 || wuxingFilter.has(m.wuxing);
        return (
          <React.Fragment key={m.code}>
            <MeridianTube meridian={m} isActive={isActive} visible={visibleByFilter} />
            <QiFlow meridian={m} isActive={isActive && visibleByFilter} />
          </React.Fragment>
        );
      })}

      {/* 穴位球体 */}
      {Array.from(meridianAcupoints.entries()).map(([mCode, points]) => {
        const m = meridians.find(m => m.code === mCode);
        if (!m) return null;
        const isActiveMeridian = selectedMeridians.has(mCode);
        const visibleByFilter = wuxingFilter.size === 0 || wuxingFilter.has(m.wuxing);
        if (!visibleByFilter) return null;

        return points.map(p => (
          <AcupointSphere
            key={p.code}
            point={p}
            meridianColor={m.color}
            isActive={isActiveMeridian}
            isSelected={selectedPoint?.code === p.code}
            isHovered={hoveredCode === p.code}
            isVideoPlaying={videoPlayingPoint === p.code}
            onClick={() => handlePointClick(p)}
            onHover={(h) => handleHover(h ? p.code : null)}
          />
        ));
      })}

      {/* 相机控制 */}
      <CameraController targetPoint={focusTarget || selectedPoint} autoRotate={autoRotate} focusTrigger={focusTrigger} />
    </>
  );
}

// ============================================================
// 导出主组件
// ============================================================

export const TcmBodyModel = memo(function TcmBodyModel(props: TcmBodyModelProps) {
  const [hoveredPoint, setHoveredPoint] = useState<TcmAcupoint | null>(null);

  return (
    <div className="fixed inset-0 z-0 bg-[#0a0a0f]">
      <Canvas
        camera={{ position: [0, 85, 200], fov: 45, near: 0.1, far: 2000 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x0a0a0f);
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        <React.Suspense fallback={<LoadingFallback />}>
          <SceneContent {...props} onHoveredPointChange={setHoveredPoint} />
        </React.Suspense>
      </Canvas>

      {/* Tooltip */}
      {hoveredPoint && (
        <div className="fixed z-[300] px-3 py-1.5 bg-black/90 border border-white/20 rounded-md text-xs text-white pointer-events-none"
          style={{ left: 0, top: 0 }}>
          {hoveredPoint.name} ({hoveredPoint.code})
        </div>
      )}
    </div>
  );
});

// ============================================================
// 加载中提示
// ============================================================

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-3 border-blue-400/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="mt-3 text-zinc-400 text-xs">加载3D人体模型...</p>
      </div>
    </Html>
  );
}

export default TcmBodyModel;
