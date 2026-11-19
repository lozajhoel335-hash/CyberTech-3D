import {
  ArrowRight,
  BookOpen,
  Cpu,
  Laptop,
  Layers,
  Monitor,
  RotateCw,
  Smartphone,
  Wrench,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useState } from 'react';
import HardwareStage from '../three/HardwareStage';
import type { AppSection, DeviceModelType } from '../types/hardware';

interface HomeHubProps {
  onSelectSection: (section: AppSection) => void;
}

interface DeviceCardOption {
  id: 'desktop' | 'laptop' | 'phone';
  title: string;
  subtitle: string;
  partsCount: string;
  highlights: string;
  icon: typeof Monitor;
}

const deviceOptions: DeviceCardOption[] = [
  {
    id: 'desktop',
    title: 'Computadora de escritorio',
    subtitle: 'Torre ATX completa con vista explosionada',
    partsCount: '18 componentes interactivos',
    highlights: 'Gabinete, placa madre, CPU, RAM, GPU, fuente, SSD/HDD y refrigeración.',
    icon: Monitor,
  },
  {
    id: 'laptop',
    title: 'Laptop o computadora portátil',
    subtitle: 'Chasis articulado con tapa y sistema térmico',
    partsCount: '15 componentes interactivos',
    highlights: 'Pantalla LCD/LED, bisagras, teclado, batería Li-Po, turbina y heatpipes.',
    icon: Laptop,
  },
  {
    id: 'phone',
    title: 'Teléfono celular',
    subtitle: 'Smartphone desmontable por capas internas',
    partsCount: '14 componentes interactivos',
    highlights: 'Pantalla OLED, vidrio protector, táctil, batería de litio, flex y cámaras.',
    icon: Smartphone,
  },
];

export default function HomeHub({ onSelectSection }: HomeHubProps) {
  const [previewDevice, setPreviewDevice] = useState<DeviceModelType>('desktop');
  const [previewExplode, setPreviewExplode] = useState(0);
  const [previewAutoRotate, setPreviewAutoRotate] = useState(false);
  const [zoomTrigger, setZoomTrigger] = useState({ delta: 1, seq: 0 });

  const activeDeviceInfo =
    deviceOptions.find((d) => d.id === previewDevice) ?? deviceOptions[0];

  return (
    <div className="flex-1 overflow-y-auto bg-[#070B14] px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Hero Title + Interactive 3D Stage + 3 Main Device Choices */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Left column: Intro + 3 Main Device Cards */}
        <div className="xl:col-span-5 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-medium text-sky-400">
              Laboratorio virtual interactivo en 3D
            </p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight leading-tight text-balance">
              Aprende mantenimiento de hardware desmontando equipos reales en 3D
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Selecciona uno de los tres dispositivos principales para girarlo, acercarlo y explorar su anatomía, limpieza, instalación y seguridad eléctrica.
            </p>
          </div>

          <div className="space-y-3" role="radiogroup" aria-label="Dispositivos principales">
            {deviceOptions.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = previewDevice === item.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 transition-colors ${
                    isSelected
                      ? 'bg-[#0E182D] border-blue-500/80'
                      : 'bg-[#0B1222] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewDevice(item.id);
                        setPreviewExplode(0);
                      }}
                      className="flex items-start gap-3 text-left flex-1 cursor-pointer"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-900 text-sky-400 border border-slate-800'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>0{idx + 1}.</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.partsCount}</span>
                        </div>
                        <h2 className="font-display font-semibold text-base text-white">
                          {item.title}
                        </h2>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {item.highlights}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectSection(item.id)}
                      aria-label={`Abrir laboratorio 3D de ${item.title}`}
                      className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                    >
                      <span>Explorar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Interactive 3D Device Preview Stage */}
        <div className="xl:col-span-7 flex flex-col rounded-2xl bg-[#0B1222] border border-slate-800 overflow-hidden min-h-[430px] lg:min-h-[540px]">
          <div className="px-4 py-3 border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-sky-400 font-medium">
                Vista previa interactiva 3D
              </p>
              <h2 className="font-display font-semibold text-base text-white">
                {activeDeviceInfo.title}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPreviewExplode((v) => (v > 0.5 ? 0 : 1))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  previewExplode > 0.5
                    ? 'bg-blue-600/20 text-sky-300 border-blue-500/60'
                    : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-blue-500'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{previewExplode > 0.5 ? 'Armar' : 'Desmontar'}</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewAutoRotate((r) => !r)}
                aria-pressed={previewAutoRotate}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  previewAutoRotate
                    ? 'bg-blue-600/20 text-sky-300 border-blue-500/60'
                    : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-blue-500'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Girar 360°</span>
              </button>
              <button
                type="button"
                onClick={() => setZoomTrigger((z) => ({ delta: 0.82, seq: z.seq + 1 }))}
                aria-label="Acercar vista previa 3D"
                className="p-1.5 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 hover:border-blue-500 cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomTrigger((z) => ({ delta: 1.22, seq: z.seq + 1 }))}
                aria-label="Alejar vista previa 3D"
                className="p-1.5 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 hover:border-blue-500 cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 min-h-[340px]">
            <HardwareStage
              modelType={previewDevice}
              selectedId={null}
              explodeAmount={previewExplode}
              laptopLidOpen={true}
              autoRotate={previewAutoRotate}
              zoomTrigger={zoomTrigger}
              testId="home-preview-stage"
            />
          </div>

          <div className="px-4 py-3 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-3 bg-[#09101E]">
            <p className="text-xs text-slate-400">
              Arrastra con el mouse o dedo para rotar desde cualquier ángulo y haz zoom con la rueda.
            </p>
            <button
              type="button"
              onClick={() => onSelectSection(previewDevice)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>Abrir laboratorio completo de {activeDeviceInfo.title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Secondary Modules Strip */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onSelectSection('motherboard')}
          className="text-left p-5 rounded-2xl bg-[#0B1222] border border-slate-800 hover:border-blue-500/70 transition-colors group cursor-pointer space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 text-sky-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
          </div>
          <h3 className="font-display font-semibold text-base text-white">
            Placa Madre en 3D — Exploración Detallada
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Separa los 18 componentes críticos: socket CPU, pasta térmica, ranuras DIMM, VRM, BIOS, M.2 y conectores ATX.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelectSection('workshop')}
          className="text-left p-5 rounded-2xl bg-[#0B1222] border border-slate-800 hover:border-blue-500/70 transition-colors group cursor-pointer space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 text-sky-400 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
          </div>
          <h3 className="font-display font-semibold text-base text-white">
            Taller de Mantenimiento
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Inspecciona 8 herramientas en 3D y sigue 17 tutoriales guiados con advertencias de seguridad eléctrica y litio.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelectSection('education')}
          className="text-left p-5 rounded-2xl bg-[#0B1222] border border-slate-800 hover:border-blue-500/70 transition-colors group cursor-pointer space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 text-sky-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
          </div>
          <h3 className="font-display font-semibold text-base text-white">
            Modo Educativo y Evaluaciones
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Lecciones de mantenimiento preventivo/correctivo, simulador de diagnóstico de fallas y cuestionario evaluado.
          </p>
        </button>
      </section>
    </div>
  );
}
