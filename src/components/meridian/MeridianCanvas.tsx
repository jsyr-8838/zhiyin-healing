import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle, memo } from 'react';
import {
  TWELVE_MERIDIANS,
  cunTo3D,
  getAcupoint3D,
  getMeridianByCode,
  getPointByCode,
  isArmPoint,
  type WuxingElement,
  type Acupoint,
  type Meridian,
} from '@/lib/meridian-data';
import { SHI_CHEN_MAP } from '@/lib/tcm-calendar';
import { ViewMode, BONE_MODELS, WUXING_COLORS_DISPLAY, type BoneModel } from './constants';
import type {
  ThreeScene,
  ThreeCamera,
  ThreeRenderer,
  ThreeClock,
  ThreeGroup,
  ThreeRaycaster,
  ThreeVector2,
  ThreeOrbitControls,
  QiParticle,
} from '@/types/three-global';
import type { Mesh, Object3D } from 'three';

export interface MeridianCanvasHandle {
  focusCamera: (point: Acupoint, meridianCode: string) => void;
}

export interface MeridianCanvasProps {
  selectedMeridians: Set<string>;
  selectedPoint: Acupoint | null;
  viewMode: ViewMode;
  wuxingFilter: Set<WuxingElement>;
  currentShiChen: number;
  autoRotate: boolean;
  focusCode: string | null;
  onPointClick: (point: Acupoint, meridian: Meridian) => void;
  onFocusAcupoint: (point: Acupoint, meridian: Meridian) => void;
}

interface CameraAnimState {
  from: { x: number; y: number; z: number };
  to: { x: number; y: number; z: number };
  targetFrom: { x: number; y: number; z: number };
  targetTo: { x: number; y: number; z: number };
  progress: number;
  active: boolean;
}

const HIGH_CONTRAST_COLORS: Record<string, string> = {
  '金': '#FFD700', '水': '#00BFFF', '木': '#00FF7F',
  '火': '#FF4500', '土': '#FF8C00',
};

export const MeridianCanvas = memo(forwardRef<MeridianCanvasHandle, MeridianCanvasProps>(
  function MeridianCanvas(props, ref) {
    const {
      selectedMeridians,
      selectedPoint,
      viewMode,
      wuxingFilter,
      currentShiChen,
      autoRotate,
      focusCode,
      onPointClick,
      onFocusAcupoint,
    } = props;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<ThreeScene | null>(null);
    const cameraRef = useRef<ThreeCamera | null>(null);
    const rendererRef = useRef<ThreeRenderer | null>(null);
    const controlsRef = useRef<ThreeOrbitControls | null>(null);
    const raycasterRef = useRef<ThreeRaycaster | null>(null);
    const mouseRef = useRef<ThreeVector2 | null>(null);
    const loadedModelsRef = useRef<Map<number, Object3D>>(new Map());
    const meridianMeshesRef = useRef<Map<string, Mesh>>(new Map());
    const acupointMeshesRef = useRef<Map<string, Object3D>>(new Map());
    const bonesGroupRef = useRef<ThreeGroup | null>(null);
    const meridiansGroupRef = useRef<ThreeGroup | null>(null);
    const pointsGroupRef = useRef<ThreeGroup | null>(null);
    const animFrameRef = useRef<number>(0);
    const clockRef = useRef<ThreeClock | null>(null);
    const qiParticlesRef = useRef<QiParticle[]>([]);
    const cameraAnimRef = useRef<CameraAnimState>({
      from: { x: 0, y: 0, z: 0 }, to: { x: 0, y: 0, z: 0 },
      targetFrom: { x: 0, y: 0, z: 0 }, targetTo: { x: 0, y: 0, z: 0 },
      progress: 1, active: false,
    });

    const [loading, setLoading] = useState(true);
    const [loadProgress, setLoadProgress] = useState(0);
    const [loadingStatus, setLoadingStatus] = useState('加载3D引擎...');
    const [threeReady, setThreeReady] = useState(false);
    const [hoveredPoint, setHoveredPoint] = useState<Acupoint | null>(null);
    const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

    const selectedMeridiansRef = useRef(selectedMeridians);
    selectedMeridiansRef.current = selectedMeridians;
    const selectedPointRef = useRef(selectedPoint);
    selectedPointRef.current = selectedPoint;
    const viewModeRef = useRef(viewMode);
    viewModeRef.current = viewMode;
    const wuxingFilterRef = useRef(wuxingFilter);
    wuxingFilterRef.current = wuxingFilter;
    const currentShiChenRef = useRef(currentShiChen);
    currentShiChenRef.current = currentShiChen;
    const hoveredPointRef = useRef(hoveredPoint);
    hoveredPointRef.current = hoveredPoint;
    const autoRotateRef = useRef(autoRotate);
    autoRotateRef.current = autoRotate;

    const doCameraAnim = useCallback((point: Acupoint, meridianCode: string) => {
      if (!cameraRef.current || !controlsRef.current) return;
      const arm = isArmPoint(meridianCode, point.cunY);
      const pos = cunTo3D(point.cunX, point.cunY, point.side, point.cunZ, arm, meridianCode);
      if (isFinite(pos.x) && isFinite(pos.y) && isFinite(pos.z)) {
        cameraAnimRef.current = {
          from: { x: cameraRef.current.position.x, y: cameraRef.current.position.y, z: cameraRef.current.position.z },
          to: { x: pos.x, y: pos.y + 5, z: pos.z + 45 },
          targetFrom: { x: controlsRef.current.target.x, y: controlsRef.current.target.y, z: controlsRef.current.target.z },
          targetTo: { x: pos.x, y: pos.y, z: pos.z },
          progress: 0,
          active: true,
        };
      }
    }, []);

    useImperativeHandle(ref, () => ({
      focusCamera(point: Acupoint, meridianCode: string) {
        doCameraAnim(point, meridianCode);
      },
    }), [doCameraAnim]);

    useEffect(() => {
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.autoRotateSpeed = 1.0;
      }
    }, [autoRotate]);

    useEffect(() => {
      const loadScripts = async () => {
        const w = window as Window & { THREE?: typeof window.THREE };
        if (w.THREE?.OBJLoader && w.THREE?.OrbitControls) {
          setThreeReady(true);
          setLoadingStatus('初始化场景...');
          return;
        }

        const loadScript = (src: string): Promise<void> =>
          new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
            if (existing) {
              const check = () => {
                const ww = window as Window & { THREE?: typeof window.THREE };
                if (src.includes('three.min') && ww.THREE) { resolve(); return; }
                if (src.includes('OrbitControls') && ww.THREE?.OrbitControls) { resolve(); return; }
                if (src.includes('OBJLoader') && ww.THREE?.OBJLoader) { resolve(); return; }
                setTimeout(check, 50);
              };
              check();
              return;
            }
            const s = document.createElement('script');
            s.src = src;
            s.async = false;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(s);
          });

        try {
          await loadScript('/js/three.min.js');
          setLoadingStatus('加载 OrbitControls...');
          await loadScript('/js/OrbitControls.js');
          setLoadingStatus('加载 OBJLoader...');
          await loadScript('/js/OBJLoader.js');
          setLoadingStatus('初始化场景...');
          setThreeReady(true);
        } catch (err) {
          console.error('Failed to load 3D scripts:', err);
          setLoadingStatus('3D引擎加载失败，请刷新页面');
        }
      };
      loadScripts();
    }, []);

    useEffect(() => {
      if (!threeReady || !containerRef.current) return;

      const THREE = window.THREE;
      if (!THREE) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0f);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
      camera.position.set(0, 80, 200);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current!, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      rendererRef.current = renderer;

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
      mainLight.position.set(100, 200, 100);
      mainLight.castShadow = true;
      scene.add(mainLight);
      const fillLight = new THREE.DirectionalLight(0x8b9dc3, 0.3);
      fillLight.position.set(-50, 0, -50);
      scene.add(fillLight);
      const rimLight = new THREE.DirectionalLight(0xffffff, 0.25);
      rimLight.position.set(0, -50, -100);
      scene.add(rimLight);

      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.target.set(0, 70, 0);
      controlsRef.current = controls;

      const raycaster = new THREE.Raycaster();
      raycasterRef.current = raycaster;
      const mouse = new THREE.Vector2();
      mouseRef.current = mouse;

      const bonesGroup = new THREE.Group();
      bonesGroup.name = 'bones';
      scene.add(bonesGroup);
      bonesGroupRef.current = bonesGroup;

      const meridiansGroup = new THREE.Group();
      meridiansGroup.name = 'meridians';
      scene.add(meridiansGroup);
      meridiansGroupRef.current = meridiansGroup;

      const pointsGroup = new THREE.Group();
      pointsGroup.name = 'points';
      scene.add(pointsGroup);
      pointsGroupRef.current = pointsGroup;

      const clock = new THREE.Clock();
      clockRef.current = clock;

      function createMeridianTube(meridian: Meridian): Mesh | null {
        const pathPoints = meridian.pathCun.map(p => {
          const arm = isArmPoint(meridian.code, p.cunY);
          const pos = cunTo3D(p.cunX, p.cunY, p.side, p.cunZ, arm, meridian.code);
          return new THREE.Vector3(pos.x, pos.y, pos.z);
        });
        const validPoints = pathPoints.filter((p, i) => {
          if (!isFinite(p.x) || !isFinite(p.y) || !isFinite(p.z)) return false;
          if (i === 0) return true;
          const prev = pathPoints[i - 1];
          const dist = p.distanceTo(prev);
          return dist > 0.5;
        });
        if (validPoints.length < 2) return null;

        const curve = new THREE.CatmullRomCurve3(validPoints);
        const tubeRadius = 0.5;
        const tubeGeo = new THREE.TubeGeometry(curve, 64, tubeRadius, 8, false);

        const posAttr = tubeGeo.getAttribute('position');
        if (posAttr) {
          const arr = posAttr.array;
          for (let i = 0; i < arr.length; i++) {
            if (!isFinite(arr[i])) { tubeGeo.dispose(); return null; }
          }
        }

        const tubeColor = new THREE.Color(HIGH_CONTRAST_COLORS[meridian.wuxing] || meridian.color);
        const tubeMat = new THREE.MeshStandardMaterial({
          color: tubeColor,
          emissive: tubeColor,
          emissiveIntensity: 0.4,
          transparent: true,
          opacity: 0.9,
          roughness: 0.3,
          metalness: 0.3,
          depthWrite: false,
        });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        tube.renderOrder = 1;
        tube.userData.meridianCode = meridian.code;
        tube.userData.type = 'meridian';

        const numParticles = 4;
        for (let i = 0; i < numParticles; i++) {
          const pGeo = new THREE.SphereGeometry(0.7, 8, 8);
          const pMat = new THREE.MeshBasicMaterial({
            color: tubeColor,
            transparent: true,
            opacity: 0.95,
            depthWrite: false,
          });
          const pMesh = new THREE.Mesh(pGeo, pMat);
          pMesh.renderOrder = 3;
          pMesh.position.copy(curve.getPoint(i / numParticles));
          meridiansGroup.add(pMesh);
          qiParticlesRef.current.push({
            mesh: pMesh,
            curve,
            speed: 0.12 + Math.random() * 0.08,
            progress: i / numParticles,
            meridianCode: meridian.code,
          });
        }

        return tube;
      }

      function createAcupointMesh(point: Acupoint, meridian: Meridian): ThreeGroup {
        const pos = getAcupoint3D(point);
        const sphereGeo = new THREE.SphereGeometry(0.5, 16, 16);
        const baseColor = WUXING_COLORS_DISPLAY[meridian.wuxing] || meridian.color;
        const sphereMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(baseColor),
          emissive: new THREE.Color(baseColor),
          emissiveIntensity: 0.3,
          roughness: 0.3,
          metalness: 0.4,
          depthWrite: false,
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.renderOrder = 2;
        sphere.position.set(pos.x, pos.y, pos.z);
        sphere.userData.pointCode = point.code;
        sphere.userData.pointName = point.name;
        sphere.userData.meridianCode = meridian.code;
        sphere.userData.type = 'acupoint';

        const group = new THREE.Group();
        group.add(sphere);

        if (point.isJingWell) {
          const coneGeo = new THREE.ConeGeometry(0.3, 0.8, 8);
          const coneMat = new THREE.MeshStandardMaterial({
            color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.4, transparent: true, opacity: 0.8,
          });
          const cone = new THREE.Mesh(coneGeo, coneMat);
          cone.position.set(0, -0.9, 0);
          cone.rotation.x = Math.PI;
          group.add(cone);
        }

        if (point.isYuan) {
          const ringGeo = new THREE.TorusGeometry(0.8, 0.1, 8, 32);
          const ringMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.5, transparent: true, opacity: 0.7,
          });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.position.set(0, 0, 0);
          ring.rotation.x = Math.PI / 2;
          group.add(ring);
        }

        if (point.isMu) {
          const diaGeo = new THREE.OctahedronGeometry(0.4, 0);
          const diaMat = new THREE.MeshStandardMaterial({
            color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.5, transparent: true, opacity: 0.8,
          });
          const dia = new THREE.Mesh(diaGeo, diaMat);
          dia.position.set(0, 1.0, 0);
          group.add(dia);
        }

        if (point.isLuo) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0.8, 0),
          ]);
          const lineMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 2 });
          const line = new THREE.Line(lineGeo, lineMat);
          group.add(line);
        }

        group.position.set(pos.x, pos.y, pos.z);
        sphere.position.set(0, 0, 0);
        return group;
      }

      function rebuildMeridiansAndPoints() {
        if (!meridiansGroupRef.current || !pointsGroupRef.current) return;
        while (meridiansGroupRef.current.children.length > 0) {
          meridiansGroupRef.current.remove(meridiansGroupRef.current.children[0]);
        }
        while (pointsGroupRef.current.children.length > 0) {
          pointsGroupRef.current.remove(pointsGroupRef.current.children[0]);
        }
        meridianMeshesRef.current.clear();
        acupointMeshesRef.current.clear();

        for (const m of TWELVE_MERIDIANS) {
          const tube = createMeridianTube(m);
          if (tube) {
            meridiansGroupRef.current.add(tube);
            meridianMeshesRef.current.set(m.code, tube);
          }
          for (const pt of m.points) {
            const mesh = createAcupointMesh(pt, m);
            if (mesh) {
              pointsGroupRef.current.add(mesh);
              acupointMeshesRef.current.set(pt.code, mesh);
            }
          }
        }
      }

      rebuildMeridiansAndPoints();

      async function loadBoneModels() {
        const THREE = window.THREE;
        const loader = new THREE.OBJLoader();
        const total = BONE_MODELS.length;
        let loaded = 0;
        const batchSize = 5;

        for (let i = 0; i < total; i++) {
          (BONE_MODELS[i] as BoneModel).index = i;
        }

        for (let i = 0; i < total; i += batchSize) {
          const batch = BONE_MODELS.slice(i, i + batchSize);
          const promises = batch.map((bone: BoneModel) => {
            return new Promise<void>((resolve) => {
              loader.load(
                `/models/bones/${bone.file}`,
                (object: Object3D) => {
                  object.traverse((child: any) => {
                    if (child.isMesh) {
                      child.material = new THREE.MeshStandardMaterial({
                        color: 0xe8dcc8, roughness: 0.6, metalness: 0.1,
                        transparent: true,
                        opacity: 0.7,
                        depthWrite: false,
                      });
                      child.renderOrder = 0;
                      child.castShadow = false;
                      child.receiveShadow = true;
                      child.userData.boneIndex = bone.index;
                      child.userData.boneName = bone.name;
                    }
                  });
                  object.scale.set(0.1, 0.1, 0.1);
                  object.rotation.x = -Math.PI / 2;
                  object.userData.boneIndex = bone.index;
                  object.userData.boneName = bone.name;
                  bonesGroup.add(object);
                  loadedModelsRef.current.set(bone.index!, object);
                  loaded++;
                  setLoadProgress(Math.round((loaded / total) * 100));
                  setLoadingStatus(`加载中... ${loaded}/${total} - ${bone.name}`);
                  resolve();
                },
                undefined,
                () => {
                  loaded++;
                  setLoadProgress(Math.round((loaded / total) * 100));
                  resolve();
                }
              );
            });
          });
          await Promise.all(promises);
          await new Promise(r => setTimeout(r, 5));
        }
        setLoading(false);
      }

      loadBoneModels();

      if (focusCode) {
        const focusDelay = setTimeout(() => {
          const point = getPointByCode(focusCode);
          if (point) {
            const meridian = TWELVE_MERIDIANS.find((m: Meridian) =>
              m.points.some((p: Acupoint) => p.code === focusCode)
            );
            if (meridian) {
              onFocusAcupoint(point, meridian);
              doCameraAnim(point, meridian.code);
            }
          }
        }, 1500);
        return () => clearTimeout(focusDelay);
      }

      function animate() {
        animFrameRef.current = requestAnimationFrame(animate);
        if (controlsRef.current) controlsRef.current.update();

        const isAutoRotate = autoRotateRef.current;
        if (isAutoRotate && controlsRef.current) {
          controlsRef.current.autoRotate = true;
          controlsRef.current.autoRotateSpeed = 1.0;
        } else if (controlsRef.current) {
          controlsRef.current.autoRotate = false;
        }

        const time = clockRef.current ? clockRef.current.getElapsedTime() : 0;

        const curShiChen = currentShiChenRef.current;
        const curSelectedMeridians = selectedMeridiansRef.current;
        const curViewMode = viewModeRef.current;
        const curWuxingFilter = wuxingFilterRef.current;
        const curHoveredPoint = hoveredPointRef.current;
        const curSelectedPoint = selectedPointRef.current;

        for (const p of qiParticlesRef.current) {
          const sc = SHI_CHEN_MAP[curShiChen];
          const isActive = sc.meridianCode === p.meridianCode || curSelectedMeridians.has(p.meridianCode);
          if (!isActive) { p.mesh.visible = false; continue; }
          p.mesh.visible = curViewMode === 'meridians' || curViewMode === 'all';
          if (curWuxingFilter.size > 0) {
            const m = getMeridianByCode(p.meridianCode);
            if (m && !curWuxingFilter.has(m.wuxing)) p.mesh.visible = false;
          }
          p.progress += p.speed * 0.016;
          if (p.progress > 1) p.progress -= 1;
          try {
            const pos = p.curve.getPoint(p.progress);
            p.mesh.position.copy(pos);
            const pulse = 0.7 + 0.3 * Math.sin(time * 5 + p.progress * 10);
            p.mesh.scale.setScalar(pulse);
          } catch (_) { /* curve error */ }
        }

        const camAnim = cameraAnimRef.current;
        if (camAnim.active && camAnim.progress < 1 && cameraRef.current && controlsRef.current) {
          camAnim.progress = Math.min(1, camAnim.progress + 0.025);
          const t = 1 - Math.pow(1 - camAnim.progress, 3);
          cameraRef.current.position.set(
            camAnim.from.x + (camAnim.to.x - camAnim.from.x) * t,
            camAnim.from.y + (camAnim.to.y - camAnim.from.y) * t,
            camAnim.from.z + (camAnim.to.z - camAnim.from.z) * t,
          );
          controlsRef.current.target.set(
            camAnim.targetFrom.x + (camAnim.targetTo.x - camAnim.targetFrom.x) * t,
            camAnim.targetFrom.y + (camAnim.targetTo.y - camAnim.targetFrom.y) * t,
            camAnim.targetFrom.z + (camAnim.targetTo.z - camAnim.targetFrom.z) * t,
          );
          if (camAnim.progress >= 1) camAnim.active = false;
        }

        meridianMeshesRef.current.forEach((mesh: Mesh, code: string) => {
          const sc = SHI_CHEN_MAP[curShiChen];
          const isActive = sc.meridianCode === code || curSelectedMeridians.has(code);
          const mat = mesh.material as any;
          if (mat) {
            mat.emissiveIntensity = isActive ? 0.3 + Math.sin(time * 3) * 0.15 : 0.15;
            mat.opacity = isActive ? 0.9 : 0.55;
          }
          mesh.visible = curViewMode === 'meridians' || curViewMode === 'all';
          if (curWuxingFilter.size > 0) {
            const m = getMeridianByCode(code);
            if (m && !curWuxingFilter.has(m.wuxing)) mesh.visible = false;
          }
        });

        pointsGroupRef.current?.children.forEach((group: Object3D) => {
          const mainSphere = group.children[0];
          if (!mainSphere) return;
          const code = mainSphere.userData.pointCode;
          const mCode = mainSphere.userData.meridianCode;
          const sc = SHI_CHEN_MAP[curShiChen];
          const isActiveMeridian = sc.meridianCode === mCode || curSelectedMeridians.has(mCode);
          const isHovered = curHoveredPoint?.code === code;
          const isSelected = curSelectedPoint?.code === code;

          group.visible = curViewMode === 'points' || curViewMode === 'all';
          if (curWuxingFilter.size > 0) {
            const m = getMeridianByCode(mCode);
            if (m && !curWuxingFilter.has(m.wuxing)) group.visible = false;
          }

          const scale = isHovered || isSelected ? 1.6 : isActiveMeridian ? 1.0 : 0.6;
          group.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.15);

          const mainMat = (mainSphere as any).material;
          if (mainMat) {
            mainMat.emissiveIntensity = isSelected ? 0.8 : isHovered ? 0.6 : isActiveMeridian ? 0.3 : 0.2;
            mainMat.opacity = isActiveMeridian ? 1.0 : 0.65;
          }
        });

        if (bonesGroupRef.current) bonesGroupRef.current.visible = curViewMode === 'bones' || curViewMode === 'all';

        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      }
      animate();

      function onMouseMove(event: MouseEvent) {
        if (!rendererRef.current || !mouseRef.current || !raycasterRef.current || !cameraRef.current || !pointsGroupRef.current) return;
        const rect = rendererRef.current.domElement.getBoundingClientRect();
        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const allPointMeshes: Mesh[] = [];
        pointsGroupRef.current.traverse((child: any) => {
          if (child.isMesh && child.userData.pointName) allPointMeshes.push(child);
        });
        const intersects = raycasterRef.current.intersectObjects(allPointMeshes, false);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const p = getPointByCode(hit.userData.pointCode);
          if (p) {
            setHoveredPoint(p);
            setTooltip({ text: `${p.name} (${p.code})`, x: event.clientX, y: event.clientY });
            rendererRef.current.domElement.style.cursor = 'pointer';
            return;
          }
        }
        setHoveredPoint(null);
        setTooltip(null);
        rendererRef.current.domElement.style.cursor = 'default';
      }

      function onCanvasClick(event: MouseEvent) {
        if (!rendererRef.current || !mouseRef.current || !raycasterRef.current || !cameraRef.current || !pointsGroupRef.current) return;
        const rect = rendererRef.current.domElement.getBoundingClientRect();
        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

        const allPointMeshes2: Mesh[] = [];
        pointsGroupRef.current.traverse((child: any) => {
          if (child.isMesh && child.userData.pointName) allPointMeshes2.push(child as Mesh);
        });
        const intersects = raycasterRef.current.intersectObjects(allPointMeshes2, false);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const p = getPointByCode(hit.userData.pointCode);
          if (p) {
            const m = TWELVE_MERIDIANS.find(m => m.points.some(pt => pt.code === p.code));
            onPointClick(p, m!);
            doCameraAnim(p, m?.code || '');
            return;
          }
        }

        const allBoneMeshes: Mesh[] = [];
        loadedModelsRef.current.forEach((obj: Object3D) => {
          obj.traverse((child: any) => {
            if (child.isMesh) allBoneMeshes.push(child as Mesh);
          });
        });
        const boneIntersects = raycasterRef.current.intersectObjects(allBoneMeshes, false);
        if (boneIntersects.length > 0) {
          let target: Object3D = boneIntersects[0].object;
          while (target.parent && target.parent.type !== 'Scene' && target.userData.boneIndex === undefined) {
            target = target.parent;
          }
          const boneIdx = target.userData?.boneIndex;
          if (boneIdx !== undefined) {
            loadedModelsRef.current.forEach((obj: Object3D) => {
              obj.traverse((child: any) => {
                if (child.isMesh && child.material) {
                  child.material.emissive = new THREE.Color(0x000000);
                  child.material.emissiveIntensity = 0;
                }
              });
            });
            target.traverse((child: any) => {
              if (child.isMesh && (child as any).material) {
                (child as any).material.emissive = new THREE.Color(0x3b82f6);
                (child as any).material.emissiveIntensity = 0.3;
              }
            });
          }
        }
      }

      function onResize() {
        if (!cameraRef.current || !rendererRef.current) return;
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }

      const canvas = renderer.domElement;
      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('click', onCanvasClick);
      window.addEventListener('resize', onResize);

      return () => {
        cancelAnimationFrame(animFrameRef.current);
        canvas.removeEventListener('mousemove', onMouseMove);
        canvas.removeEventListener('click', onCanvasClick);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [threeReady]);

    return (
      <>
        <div ref={containerRef} className="fixed inset-0 z-0 bg-[#0a0a0f]">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {tooltip && (
          <div
            className="fixed z-[300] px-3 py-1.5 bg-black/90 border border-white/20 rounded-md text-xs text-white pointer-events-none"
            style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}
          >
            {tooltip.text}
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 z-[1000] bg-[#0a0a0f] flex flex-col items-center justify-center transition-opacity duration-500">
            <div className="w-16 h-16 border-3 border-blue-400/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="mt-5 text-zinc-400 text-sm">正在加载 3D 人体经络模型...</p>
            <p className="mt-2 text-zinc-500 text-xs">{loadingStatus}</p>
            <div className="w-[300px] h-1 bg-white/10 rounded mt-5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>
        )}
      </>
    );
  }
));
