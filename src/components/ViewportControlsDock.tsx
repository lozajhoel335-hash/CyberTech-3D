import {
  ChevronDown,
  ChevronUp,
  Layers,
  List,
  RotateCcw,
  RotateCw,
  Tag,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useState } from 'react';
import type { CameraPresetId, DeviceModelType } from '../types/hardware';

interface ViewportControlsDockProps {
  modelType: DeviceModelType;
  explodeAmount: number;
  onChangeExplode: (value: number) => void;
  laptopLidOpen?: boolean;
  onToggleLaptopLid?: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  activePreset: CameraPresetId;
  onSelectCameraPreset: (preset: CameraPresetId) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onToggleComponentList: () => void;
  componentListOpen: boolean;
  componentCount: number;
}

const cameraPresets: { id: CameraPresetId; label: string }[] = [
  { id: 'front', label: 'Vista frontal' },
  { id: 'back', label: 'Vista posterior' },
  { id: 'left', label: 'Lateral izq.' },
  { id: 'right', label: 'Lateral der.' },
  { id: 'top', label: 'Superior' },
  { id: 'bottom', label: 'Inferior' },
];

export default function ViewportControlsDock({
  modelType,
  explodeAmount,
  onChangeExplode,
  laptopLidOpen = true,
  onToggleLaptopLid,
  showLabels,
  onToggleLabels,
  autoRotate,
  onToggleAutoRotate,
  activePreset,
  onSelectCameraPreset,
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleComponentList,
  componentListOpen,
  componentCount,
}: ViewportControlsDockProps) {
  const [collapsed, setCollapsed] = useState(false);
  const isExploded = explodeAmount > 0.5;

  const getPrimaryActionLabel = () => {
    if (modelType === 'desktop') {
      return isExploded ? 'Volver a montar' : 'Abrir computadora';
    }
    if (modelType === 'motherboard') {
      return isExploded ? 'Montar placa' : 'Separar componentes';
    }
    if (modelType === 'laptop') {
      return isExploded ? 'Volver a montar' : 'Desmontar laptop';
    }
    return isExploded ? 'Volver a montar' : 'Desmontar celular';
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-30 flex flex-col items-center px-3">
      {/* Collapse / Expand Handle */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Mostrar controles 3D' : 'Ocultar controles 3D'}
        className="pointer-events-auto mb-1.5 flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-[#0B1222]/95 border border-slate-700/90 text-xs font-medium text-slate-200 hover:text-white hover:border-blue-500 transition-colors cursor-pointer"
      >
        {collapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
            <span>Mostrar controles</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
            <span>Ocultar controles</span>
          </>
        )}
      </button>

      {/* Main Dock Panel (solid rgba, zero backdrop-blur over WebGL) */}
      {!collapsed && (
        <div className="pointer-events-auto w-full max-w-4xl rounded-2xl bg-[#0B1222]/95 border border-slate-700/85 px-3.5 py-3 shadow-2xl space-y-2.5">
          {/* Row 1: Primary Disassembly Action, Slider & Tools */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onChangeExplode(isExploded ? 0 : 1)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isExploded
                    ? 'bg-slate-800 text-sky-300 border border-sky-500/60 hover:bg-slate-700'
                    : 'bg-blue-600 text-white border border-blue-500 hover:bg-blue-500'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{getPrimaryActionLabel()}</span>
              </button>

              {modelType === 'laptop' && onToggleLaptopLid && (
                <button
                  type="button"
                  onClick={onToggleLaptopLid}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-900 text-slate-200 border border-slate-700 hover:border-blue-500 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {laptopLidOpen ? 'Cerrar tapa' : 'Abrir tapa'}
                </button>
              )}

              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5">
                <label
                  htmlFor="explode-slider"
                  className="text-[11px] font-medium text-slate-300 whitespace-nowrap"
                >
                  Desmontaje
                </label>
                <input
                  id="explode-slider"
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(explodeAmount * 100)}
                  onChange={(e) => onChangeExplode(Number(e.target.value) / 100)}
                  className="w-24 sm:w-28 accent-blue-500 cursor-pointer"
                />
                <span className="text-[11px] font-mono-tech text-sky-400 w-9 text-right tabular-nums">
                  {Math.round(explodeAmount * 100)}%
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleLabels}
                aria-pressed={showLabels}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  showLabels
                    ? 'bg-blue-600/20 text-sky-300 border-blue-500/60'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Etiquetas</span>
              </button>

              <button
                type="button"
                onClick={onToggleAutoRotate}
                aria-pressed={autoRotate}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  autoRotate
                    ? 'bg-blue-600/20 text-sky-300 border-blue-500/60'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotación 360°</span>
              </button>

              <button
                type="button"
                onClick={onToggleComponentList}
                aria-expanded={componentListOpen}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  componentListOpen
                    ? 'bg-blue-600/20 text-sky-300 border-blue-500/60'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Piezas ({componentCount})</span>
              </button>
            </div>
          </div>

          {/* Row 2: Camera Presets + Zoom + Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center gap-1.5">
              {cameraPresets.map((preset) => {
                const isAct = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectCameraPreset(preset.id)}
                    className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                      isAct
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onZoomIn}
                aria-label="Acercar modelo 3D"
                className="px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-slate-900 text-slate-200 border border-slate-700 hover:border-blue-500 hover:text-white flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Acercar</span>
              </button>
              <button
                type="button"
                onClick={onZoomOut}
                aria-label="Alejar modelo 3D"
                className="px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-slate-900 text-slate-200 border border-slate-700 hover:border-blue-500 hover:text-white flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
                <span>Alejar</span>
              </button>
              <button
                type="button"
                onClick={onResetView}
                className="px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-slate-900 text-slate-200 border border-slate-700 hover:border-blue-500 hover:text-white flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer vista</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
