'use client';

import React, { useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrbitControlsImpl = any;
import * as THREE from 'three';
import {
  VERTEBRA_PARAMS,
  REGION_COLORS,
  type VertebraType,
  type VertebraParam,
} from '@/lib/spine-solar-data';
import type { SpineSolarEntry } from '@/lib/spine-solar-data';
import { getEntryByVertebra } from '@/lib/spine-solar-data';

/* ===== 颜色映射 ===== */

const REGION_HEX: Record<VertebraType, string> = {
  sacrum: '#c97b63',
  lumbar: '#c9a94f',
  thoracic: '#5d8a63',
  cervical: '#5ba09a',
};

interface VertebraGeoItem {
  geo: THREE.BufferGeometry;
  position?: [number, number, number];
  rotation?: [number, number, number];
  isDisc?: boolean;
}

const SELECTED_HEX = '#d4a574';
const HOVER_HEX = '#e8d4b8';

/* ===== 单个椎体组件 ===== */

interface VertebraMeshProps {
  param: VertebraParam;
  isSelected: boolean;
  isHovered: boolean;
  isOtherSelected: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}

function VertebraMesh({
  param,
  isSelected,
  isHovered,
  isOtherSelected,
  onClick,
  onPointerOver,
  onPointerOut,
}: VertebraMeshProps) {
  const groupRef = useRef<THREE.Group>(null);

  const baseColor = REGION_HEX[param.type];
  const color = isSelected ? SELECTED_HEX : isHovered ? HOVER_HEX : baseColor;
  const opacity = 1; // 始终不透明，仅通过发光区分选中
  const emissiveIntensity = isSelected ? 0.35 : isHovered ? 0.15 : 0;

  /* 根据椎骨类型构建几何体 */
  const geometries = useMemo(() => {
    const geos: VertebraGeoItem[] = [];

    if (param.code === 'S') {
      // 骶骨：楔形
      const shape = new THREE.Shape();
      const tw = param.bodyW / 2;
      const bw = param.bodyW * 0.6 / 2;
      shape.moveTo(-bw, 0);
      shape.lineTo(bw, 0);
      shape.lineTo(tw, param.bodyH);
      shape.lineTo(-tw, param.bodyH);
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 18,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 1.5,
        bevelSegments: 3,
      });
      geo.center();
      geos.push({ geo });
    } else if (param.code === 'C1') {
      // 寰椎：环状
      const geo = new THREE.TorusGeometry(param.bodyW / 2, 4, 12, 32);
      geos.push({ geo, rotation: [Math.PI / 2, 0, 0] });
    } else if (param.code === 'C2') {
      // 枢椎：椎体+齿突+棘突
      const body = new THREE.CylinderGeometry(param.bodyW / 2, param.bodyW / 2 + 1, param.bodyH, 8);
      geos.push({ geo: body });
      const dens = new THREE.CylinderGeometry(3, 4, 14, 8);
      geos.push({ geo: dens, position: [0, (param.bodyH + 14) / 2, 0] });
      const sp = new THREE.BoxGeometry(3, 3, param.spinous);
      geos.push({ geo: sp, position: [0, 0, -param.spinous / 2 - 5] });
    } else {
      // 标准椎体
      const topW = param.bodyW / 2 - 0.5;
      const botW = param.bodyW / 2 + 0.5;
      const body = new THREE.CylinderGeometry(topW, botW, param.bodyH, 12);
      geos.push({ geo: body });

      // 椎弓根
      if (param.canalW) {
        const pedGeo = new THREE.BoxGeometry(4, 6, param.bodyW * 0.35);
        const off = param.canalW / 2 + 2;
        geos.push({ geo: pedGeo, position: [-off, 0, -2] });
        geos.push({ geo: pedGeo.clone(), position: [off, 0, -2] });
      }

      // 横突
      if (param.transverseW > 0) {
        const tpLen = param.transverseW / 2 - param.bodyW / 2;
        const tpGeo = new THREE.BoxGeometry(tpLen, 4, 4);
        geos.push({ geo: tpGeo, position: [-(param.bodyW / 2 + tpLen / 2), 0, -1] });
        geos.push({ geo: tpGeo.clone(), position: [param.bodyW / 2 + tpLen / 2, 0, -1] });
      }

      // 棘突
      if (param.spinous > 0) {
        const spW = param.type === 'lumbar' ? 5 : 3;
        const sp = new THREE.BoxGeometry(spW, 6, param.spinous);
        geos.push({ geo: sp, position: [0, 1, -param.bodyW / 2 - param.spinous / 2 + 2] });
      }

      // 椎间盘环
      const discGeo = new THREE.TorusGeometry(param.bodyW / 2 + 0.5, 1, 6, 16);
      geos.push({ geo: discGeo, position: [0, param.bodyH / 2, 0], rotation: [Math.PI / 2, 0, 0], isDisc: true });
    }

    return geos;
  }, [param]);

  return (
    <group ref={groupRef} position={[0, param.y, 0]}>
      {geometries.map((item, i) => {
        const isDisc = item.isDisc ?? false;
        return (
          <mesh
            key={i}
            position={item.position}
            rotation={item.rotation}
            castShadow
            receiveShadow
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerOver={(e) => { e.stopPropagation(); onPointerOver(); }}
            onPointerOut={onPointerOut}
          >
            <primitive object={item.geo} attach="geometry" />
            <meshPhysicalMaterial
              color={isDisc ? '#c8b89a' : color}
              roughness={isDisc ? 0.5 : 0.38}
              metalness={0.05}
              clearcoat={isDisc ? 0 : 0.35}
              clearcoatRoughness={0.2}
              transparent={opacity < 1}
              opacity={isDisc ? 0.25 : opacity}
              emissive={isDisc ? '#000000' : color}
              emissiveIntensity={isDisc ? 0 : emissiveIntensity}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ===== 相机自动聚焦 ===== */

interface CameraFocuserProps {
  targetCode: string | null;
  params: Record<string, VertebraParam>;
}

function CameraFocuser({ targetCode, params }: CameraFocuserProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const animRef = useRef<{ startPos: THREE.Vector3; endPos: THREE.Vector3; startTarget: THREE.Vector3; endTarget: THREE.Vector3; t: number } | null>(null);
  const prevCodeRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  useFrame(() => {
    if (!animRef.current || !controlsRef.current) return;
    const anim = animRef.current;
    anim.t += 1 / 60 / 0.7;
    if (anim.t > 1) anim.t = 1;
    const ease = 1 - Math.pow(1 - anim.t, 3);

    camera.position.lerpVectors(anim.startPos, anim.endPos, ease);
    controlsRef.current.target.lerpVectors(anim.startTarget, anim.endTarget, ease);
    controlsRef.current.update();

    if (anim.t >= 1) animRef.current = null;
  });

  React.useEffect(() => {
    if (!controlsRef.current) return;

    // 首次初始化：设置相机对准完整脊柱中心
    if (!initializedRef.current) {
      initializedRef.current = true;
      // 脊柱从 y=0 (sacrum) 到 y=582 (C1)，中心约 y=290
      const center = new THREE.Vector3(0, 290, 0);
      controlsRef.current.target.copy(center);
      // 设置合适的全景距离
      camera.position.set(200, 290, 600);
      controlsRef.current.update();
    }

    // targetCode变化时才做聚焦动画
    if (targetCode === prevCodeRef.current) return;
    prevCodeRef.current = targetCode;

    if (!targetCode) {
      // 取消选中 → 回到全景
      animRef.current = {
        startPos: camera.position.clone(),
        endPos: new THREE.Vector3(200, 290, 600),
        startTarget: controlsRef.current.target.clone(),
        endTarget: new THREE.Vector3(0, 290, 0),
        t: 0,
      };
      return;
    }

    const p = params[targetCode === 'sacrum' ? 'sacrum' : targetCode];
    if (!p) return;
    const target = new THREE.Vector3(0, p.y, 0);
    const dir = new THREE.Vector3().subVectors(camera.position, controlsRef.current.target).normalize();
    const endPos = target.clone().add(dir.multiplyScalar(180));

    animRef.current = {
      startPos: camera.position.clone(),
      endPos,
      startTarget: controlsRef.current.target.clone(),
      endTarget: target,
      t: 0,
    };
  }, [targetCode, camera, params]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.6}
      minDistance={50}
      maxDistance={1500}
    />
  );
}

/* ===== 场景内容 ===== */

interface SpineSceneProps {
  selectedCode: string | null;
  hoveredCode: string | null;
  autoFocus: boolean;
  onSelect: (code: string | null) => void;
  onHover: (code: string | null) => void;
}

function SpineScene({ selectedCode, hoveredCode, autoFocus, onSelect, onHover }: SpineSceneProps) {
  const entries = useMemo(() => Object.entries(VERTEBRA_PARAMS), []);

  return (
    <>
      {/* 光源：晨光疗愈4+1 */}
      <ambientLight color="#fff5e8" intensity={0.45} />
      <directionalLight color="#fff8ee" intensity={0.9} position={[100, 400, 180]} castShadow />
      <directionalLight color="#d4e0f0" intensity={0.28} position={[-120, 150, -80]} />
      <directionalLight color="#ffeedd" intensity={0.22} position={[0, 80, -180]} />
      <hemisphereLight color="#fff0d8" groundColor="#e8d4b8" intensity={0.18} />

      {/* 脊柱模型 */}
      <group>
        {entries.map(([_key, param]) => {
          const code = param.code === 'S' ? 'sacrum' : param.code;
          return (
            <VertebraMesh
              key={code}
              param={param}
              isSelected={selectedCode === code}
              isHovered={hoveredCode === code}
              isOtherSelected={!!selectedCode}
              onClick={() => onSelect(code)}
              onPointerOver={() => onHover(code)}
              onPointerOut={() => onHover(null)}
            />
          );
        })}
      </group>

      {/* 相机控制 */}
        <CameraFocuser targetCode={autoFocus ? selectedCode : null} params={VERTEBRA_PARAMS} />
    </>
  );
}

/* ===== Tooltip组件 ===== */

interface TooltipData {
  code: string;
  name: string;
  solarTerm?: string;
  x: number;
  y: number;
}

/* ===== 主组件 ===== */

export interface SpineViewer3DProps {
  /** 当前选中的节气名 */
  selectedSolarTerm?: string;
  /** 当前选中条目数据 */
  selectedEntry?: SpineSolarEntry | null;
  /** 椎骨点击回调 */
  onBoneClick?: (entry: SpineSolarEntry | null) => void;
  /** 是否自动聚焦到选中椎骨 */
  autoFocus?: boolean;
  /** 容器样式 */
  className?: string;
  style?: React.CSSProperties;
}

export default function SpineViewer3D({
  selectedSolarTerm,
  selectedEntry,
  onBoneClick,
  autoFocus = false,
  className,
  style,
}: SpineViewer3DProps) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  /* 节气→椎骨编码映射 */
  const selectedCode = useMemo((): string | null => {
    if (!selectedEntry) return null;
    if (selectedEntry.vertebraCode === 'S+C1') return 'sacrum';
    return selectedEntry.vertebraCode;
  }, [selectedEntry]);

  const handleSelect = useCallback((code: string | null) => {
    if (!code) {
      onBoneClick?.(null);
      return;
    }
    const entry = getEntryByVertebra(code);
    onBoneClick?.(entry ?? null);
  }, [onBoneClick]);

  const handleHover = useCallback((code: string | null) => {
    setHoveredCode(code);
    if (!code) {
      setTooltip(null);
      return;
    }
    const param = VERTEBRA_PARAMS[code === 'sacrum' ? 'sacrum' : code];
    if (param) {
      setTooltip({ code, name: param.name, x: 0, y: 0 });
    }
  }, []);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 400,
        background: 'rgba(250,245,238,0.6)',
        borderRadius: 12,
        overflow: 'hidden',
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [250, 300, 500], fov: 40, near: 0.1, far: 5000 }}
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <color attach="background" args={['#fff8f0']} />
        <SpineScene
          selectedCode={selectedCode}
          hoveredCode={hoveredCode}
          autoFocus={autoFocus}
          onSelect={handleSelect}
          onHover={handleHover}
        />
      </Canvas>

      {/* Tooltip overlay */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 12,
            transform: 'translateX(-50%)',
            background: 'rgba(61,43,31,0.88)',
            color: '#FFF8F0',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 12,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 20,
            backdropFilter: 'blur(4px)',
          }}
        >
          {tooltip.name}
          {selectedEntry?.solarTerm ? ` · ${selectedEntry.solarTerm}` : ''}
        </div>
      )}
    </div>
  );
}
