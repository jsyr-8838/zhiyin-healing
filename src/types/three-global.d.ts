/**
 * Three.js 全局类型声明
 *
 * MeridianCanvas 和 SpineViewer3D 通过 <script> 标签加载 Three.js，
 * THREE 对象挂载在 window 上。此文件为运行时注入的 Three.js 提供 TS 类型。
 */
declare global {
  interface Window {
    THREE: typeof import('three') & {
      OrbitControls: new (camera: import('three').Camera, domElement: HTMLElement) => import('three/examples/jsm/controls/OrbitControls').OrbitControlsImpl;
      OBJLoader: new () => import('three/examples/jsm/loaders/OBJLoader').OBJLoader;
    };
    webkitAudioContext: typeof AudioContext;
  }
}

// Three.js ref 专用类型（替代 useRef<any>）
import type {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Clock,
  Group,
  Mesh,
  Object3D,
  Raycaster,
  Vector2,
  CatmullRomCurve3,
} from 'three';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ThreeOrbitControls extends import('three/examples/jsm/controls/OrbitControls').OrbitControlsImpl {
  target: import('three').Vector3;
  autoRotate: boolean;
  autoRotateSpeed: number;
  enableDamping: boolean;
  update(): void;
  dispose(): void;
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ThreeOBJLoader extends import('three/examples/jsm/loaders/OBJLoader').OBJLoader {}

export type ThreeScene = Scene;
export type ThreeCamera = PerspectiveCamera;
export type ThreeRenderer = WebGLRenderer;
export type ThreeClock = Clock;
export type ThreeGroup = Group;
export type ThreeMesh = Mesh;
export type ThreeObject3D = Object3D;
export type ThreeRaycaster = Raycaster;
export type ThreeVector2 = Vector2;
export type ThreeCurve = CatmullRomCurve3;

/** Qi 粒子类型 */
export interface QiParticle {
  mesh: Mesh;
  curve: CatmullRomCurve3;
  speed: number;
  progress: number;
  meridianCode: string;
}

export {};
