// MeridianCanvas — Three.js component disabled.
// Replaced by TcmBodyModel (2D SVG version) in TcmBodyModel.tsx
// This file kept for type compatibility only.

export interface MeridianCanvasHandle {
  focusCamera: (point: { code: string; name: string }, meridianCode: string) => void;
}

export interface MeridianCanvasProps {
  selectedMeridians: Set<string>;
  selectedPoint: { code: string; name: string } | null;
  viewMode: string;
  wuxingFilter: Set<string>;
  currentShiChen: number;
  autoRotate: boolean;
  focusCode: string | null;
  onPointClick: (point: { code: string; name: string }, meridian: { code: string; name: string }) => void;
  onFocusAcupoint: (point: { code: string; name: string }, meridian: { code: string; name: string }) => void;
}

export const MeridianCanvas = null;
