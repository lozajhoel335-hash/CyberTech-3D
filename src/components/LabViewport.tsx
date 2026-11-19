import { useCallback, useEffect, useState } from 'react';
import { desktopComponents } from '../data/desktopComponents';
import { laptopComponents } from '../data/laptopComponents';
import { motherboardComponents } from '../data/motherboardComponents';
import { phoneComponents } from '../data/phoneComponents';
import HardwareStage from '../three/HardwareStage';
import type {
  AppSection,
  CameraPresetId,
  ComponentInfo,
  DeviceModelType,
} from '../types/hardware';
import { getNextComponentId } from '../utils/labLogic';
import ComponentInspectorDrawer from './ComponentInspectorDrawer';
import ComponentListDrawer from './ComponentListDrawer';
import ViewportControlsDock from './ViewportControlsDock';

interface LabViewportProps {
  modelType: DeviceModelType;
  onNavigateSection: (section: AppSection) => void;
}

const modelMeta: Record<
  DeviceModelType,
  { title: string; subtitle: string; components: ComponentInfo[] }
> = {
  desktop: {
    title: 'Computadora de escritorio en 3D',
    subtitle: 'Torre ATX · Haz clic en cualquier pieza o abre el gabinete',
    components: desktopComponents,
  },
  motherboard: {
    title: 'Placa madre en 3D — Exploración detallada',
    subtitle: '18 zonas críticas · Selecciona el CPU u otro conector',
    components: motherboardComponents,
  },
  laptop: {
    title: 'Laptop o computadora portátil en 3D',
    subtitle: 'Tapa articulada · Sistema térmico y componentes internos',
    components: laptopComponents,
  },
  phone: {
    title: 'Teléfono celular en 3D',
    subtitle: 'Desmontaje por capas · Pantalla, batería de litio y placa lógica',
    components: phoneComponents,
  },
};

export default function LabViewport({
  modelType,
  onNavigateSection,
}: LabViewportProps) {
  const meta = modelMeta[modelType];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [explodeAmount, setExplodeAmount] = useState(0);
  const [laptopLidOpen, setLaptopLidOpen] = useState(true);
  const [showLabels, setShowLabels] = useState(modelType === 'motherboard');
  const [autoRotate, setAutoRotate] = useState(false);
  const [componentListOpen, setComponentListOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<CameraPresetId>('default');
  const [cameraPresetTrigger, setCameraPresetTrigger] = useState<{
    id: CameraPresetId;
    seq: number;
  }>({ id: 'default', seq: 0 });
  const [zoomTrigger, setZoomTrigger] = useState({ delta: 1, seq: 0 });

  // Reset per-device view state cleanly when switching 3D devices
  useEffect(() => {
    setSelectedId(null);
    setExplodeAmount(0);
    setLaptopLidOpen(true);
    setShowLabels(modelType === 'motherboard');
    setAutoRotate(false);
    setComponentListOpen(false);
    setActivePreset('default');
    setCameraPresetTrigger((prev) => ({ id: 'default', seq: prev.seq + 1 }));
  }, [modelType]);

  const handleExplodeChange = useCallback((value: number) => {
    setExplodeAmount(value);
    if (value > 0.2) {
      setShowLabels(true);
    }
  }, []);

  const handleSelectCameraPreset = useCallback((preset: CameraPresetId) => {
    setActivePreset(preset);
    setCameraPresetTrigger((prev) => ({ id: preset, seq: prev.seq + 1 }));
  }, []);

  const handleResetView = useCallback(() => {
    setActivePreset('default');
    setAutoRotate(false);
    setCameraPresetTrigger((prev) => ({ id: 'default', seq: prev.seq + 1 }));
  }, []);

  const selectedComponent =
    meta.components.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="relative flex-1 w-full h-full overflow-hidden bg-[#070B14]">
      {/* Top-left compact title badge (zero viewport occlusion) */}
      <div className="pointer-events-none absolute top-3 left-3 z-20 max-w-[calc(100vw-24px)] sm:max-w-md rounded-xl bg-[#0B1222]/90 border border-slate-800 px-3.5 py-2.5">
        <h1 className="font-display font-bold text-sm sm:text-base text-white leading-tight">
          {meta.title}
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
          {meta.subtitle}
        </p>
      </div>

      {/* Main 3D Stage */}
      <HardwareStage
        modelType={modelType}
        components={meta.components}
        selectedId={selectedId}
        onSelectComponent={(id) => {
          setSelectedId(id);
        }}
        explodeAmount={explodeAmount}
        laptopLidOpen={laptopLidOpen}
        showLabels={showLabels}
        autoRotate={autoRotate}
        cameraPresetTrigger={cameraPresetTrigger}
        zoomTrigger={zoomTrigger}
        testId={`stage-${modelType}`}
      />

      {/* Searchable Component Index Drawer */}
      {componentListOpen && (
        <ComponentListDrawer
          title={meta.title}
          components={meta.components}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            if (explodeAmount < 0.45 && modelType !== 'motherboard') {
              setExplodeAmount(1);
              setShowLabels(true);
            }
          }}
          onClose={() => setComponentListOpen(false)}
        />
      )}

      {/* Detailed Educational Component Inspector */}
      {selectedComponent && (
        <ComponentInspectorDrawer
          component={selectedComponent}
          onClose={() => setSelectedId(null)}
          onPrev={() =>
            setSelectedId(getNextComponentId(meta.components, selectedId, -1))
          }
          onNext={() =>
            setSelectedId(getNextComponentId(meta.components, selectedId, 1))
          }
          onNavigateSection={onNavigateSection}
        />
      )}

      {/* Collapsible Bottom Control Dock */}
      <ViewportControlsDock
        modelType={modelType}
        explodeAmount={explodeAmount}
        onChangeExplode={handleExplodeChange}
        laptopLidOpen={laptopLidOpen}
        onToggleLaptopLid={() => setLaptopLidOpen((o) => !o)}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels((l) => !l)}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate((r) => !r)}
        activePreset={activePreset}
        onSelectCameraPreset={handleSelectCameraPreset}
        onZoomIn={() => setZoomTrigger((z) => ({ delta: 0.8, seq: z.seq + 1 }))}
        onZoomOut={() => setZoomTrigger((z) => ({ delta: 1.25, seq: z.seq + 1 }))}
        onResetView={handleResetView}
        onToggleComponentList={() => setComponentListOpen((o) => !o)}
        componentListOpen={componentListOpen}
        componentCount={meta.components.length}
      />
    </div>
  );
}
