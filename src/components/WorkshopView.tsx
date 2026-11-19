import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  RotateCw,
  ShieldAlert,
  Wrench,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useState } from 'react';
import { maintenanceTutorials, workshopTools } from '../data/workshopData';
import HardwareStage from '../three/HardwareStage';
import { toggleChecklistStep } from '../utils/labLogic';

type TutorialFilter = 'all' | 'PC de Escritorio' | 'Teléfono Celular';

export default function WorkshopView() {
  const [selectedToolId, setSelectedToolId] = useState(workshopTools[0].id);
  const [toolAutoRotate, setToolAutoRotate] = useState(false);
  const [toolZoom, setToolZoom] = useState({ delta: 1, seq: 0 });

  const [deviceFilter, setDeviceFilter] = useState<TutorialFilter>('all');
  const [selectedTutorialId, setSelectedTutorialId] = useState(
    maintenanceTutorials[0].id,
  );
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const selectedTool =
    workshopTools.find((t) => t.id === selectedToolId) ?? workshopTools[0];

  const filteredTutorials =
    deviceFilter === 'all'
      ? maintenanceTutorials
      : maintenanceTutorials.filter((t) => t.device === deviceFilter);

  const selectedTutorial =
    filteredTutorials.find((t) => t.id === selectedTutorialId) ??
    filteredTutorials[0] ??
    maintenanceTutorials[0];

  const doneInTutorial = selectedTutorial.steps.filter(
    (_, idx) => completedSteps[`${selectedTutorial.id}_${idx}`],
  ).length;

  return (
    <div className="flex-1 overflow-y-auto bg-[#070B14] px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Mandatory Global Safety Banner */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-sky-400">
                Práctica guiada y herramientas 3D
              </p>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mt-0.5">
                Taller de Mantenimiento
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              {workshopTools.length} herramientas 3D · {maintenanceTutorials.length} tutoriales paso a paso
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="text-xs sm:text-sm text-amber-100 space-y-0.5">
              <p className="font-semibold text-amber-300">
                Reglas de seguridad obligatorias antes de intervenir cualquier equipo
              </p>
              <p>
                Desconecta siempre el equipo de la red eléctrica (y la batería interna en laptops o celulares), descarga tu electricidad estática con pulsera ESD, nunca abras la fuente de alimentación ATX (conserva voltajes letales) y jamás perfores, dobles ni calientes excesivamente baterías de litio.
              </p>
            </div>
          </div>
        </header>

        {/* Section 1: 3D Tools Showcase */}
        <section className="rounded-2xl bg-[#0B1222] border border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Wrench className="w-5 h-5 text-sky-400" />
              <h2 className="font-display font-semibold text-lg text-white">
                Herramientas de mantenimiento en 3D
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setToolAutoRotate((r) => !r)}
                aria-pressed={toolAutoRotate}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  toolAutoRotate
                    ? 'bg-blue-600/20 text-sky-300 border-blue-500/60'
                    : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-blue-500'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Girar 360°</span>
              </button>
              <button
                type="button"
                onClick={() => setToolZoom((z) => ({ delta: 0.82, seq: z.seq + 1 }))}
                aria-label="Acercar herramienta 3D"
                className="p-1.5 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 hover:border-blue-500 cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setToolZoom((z) => ({ delta: 1.22, seq: z.seq + 1 }))}
                aria-label="Alejar herramienta 3D"
                className="p-1.5 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 hover:border-blue-500 cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Tool selector list */}
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
              {workshopTools.map((tool) => {
                const isSel = tool.id === selectedTool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setSelectedToolId(tool.id)}
                    className={`px-3.5 py-2.5 rounded-xl text-left border transition-colors cursor-pointer ${
                      isSel
                        ? 'bg-blue-600/20 border-blue-500/60 text-white'
                        : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className="block text-sm font-semibold">{tool.name}</span>
                    <span className="block text-xs text-slate-400 mt-0.5">
                      {tool.category}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 3D Tool Canvas + Details */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="h-[320px] sm:h-[360px] relative">
                <HardwareStage
                  modelType="tool"
                  toolId={selectedTool.id}
                  selectedId={null}
                  autoRotate={toolAutoRotate}
                  zoomTrigger={toolZoom}
                  testId="workshop-tool-stage"
                />
              </div>
              <div className="p-5 border-t border-slate-800 bg-[#09101E] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-lg text-white">
                    {selectedTool.name}
                  </h3>
                  <span className="text-xs font-medium text-sky-400">
                    {selectedTool.category}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {selectedTool.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80 text-xs leading-relaxed">
                  <div>
                    <p className="font-semibold text-sky-400 mb-1">Uso recomendado</p>
                    <p className="text-slate-300">{selectedTool.usage}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-300 mb-1">Precaución</p>
                    <p className="text-amber-100/90">{selectedTool.precaution}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Step-by-step Maintenance Tutorials */}
        <section className="rounded-2xl bg-[#0B1222] border border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-semibold text-lg text-white">
                Tutoriales paso a paso de mantenimiento
              </h2>
              <p className="text-xs text-slate-400">
                Marca cada paso completado mientras practicas el procedimiento
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
              {(
                [
                  { id: 'all', label: 'Todos (17)' },
                  { id: 'PC de Escritorio', label: 'PC de Escritorio (11)' },
                  { id: 'Teléfono Celular', label: 'Celulares (6)' },
                ] as { id: TutorialFilter; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setDeviceFilter(tab.id);
                    const nextList =
                      tab.id === 'all'
                        ? maintenanceTutorials
                        : maintenanceTutorials.filter((t) => t.device === tab.id);
                    if (nextList.length > 0 && !nextList.some((t) => t.id === selectedTutorialId)) {
                      setSelectedTutorialId(nextList[0].id);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    deviceFilter === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Tutorial Selector List */}
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 p-3 max-h-[540px] overflow-y-auto space-y-1.5">
              {filteredTutorials.map((tut) => {
                const isSel = tut.id === selectedTutorial.id;
                return (
                  <button
                    key={tut.id}
                    type="button"
                    onClick={() => setSelectedTutorialId(tut.id)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left border transition-colors cursor-pointer ${
                      isSel
                        ? 'bg-blue-600/20 border-blue-500/60 text-white'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className="block text-sm font-semibold">{tut.title}</span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span>{tut.device}</span>
                      <span aria-hidden="true">·</span>
                      <span>{tut.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <span>{tut.duration}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Tutorial Guide */}
            <div className="lg:col-span-8 p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
                    <span>{selectedTutorial.device}</span>
                    <span aria-hidden="true">·</span>
                    <span>Nivel {selectedTutorial.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedTutorial.duration}</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-white mt-1">
                    {selectedTutorial.title}
                  </h3>
                </div>
                <div className="text-xs font-mono-tech text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg tabular-nums">
                  {doneInTutorial} / {selectedTutorial.steps.length} pasos completados
                </div>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed">
                {selectedTutorial.summary}
              </p>

              {/* Tools required */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-slate-300">
                  Herramientas necesarias
                </h4>
                <p className="text-xs text-slate-300">
                  {selectedTutorial.tools.join(' · ')}
                </p>
              </div>

              {/* Safety Warnings */}
              <div className="p-3.5 rounded-xl bg-amber-950/35 border border-amber-500/40 space-y-1.5">
                <h4 className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Advertencias de seguridad del procedimiento</span>
                </h4>
                <ul className="space-y-1 text-xs text-amber-100/90">
                  {selectedTutorial.safetyWarnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>

              {/* Interactive Checklist Steps */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-sky-400">
                  Pasos del procedimiento
                </h4>
                <div className="space-y-2">
                  {selectedTutorial.steps.map((step, idx) => {
                    const key = `${selectedTutorial.id}_${idx}`;
                    const checked = Boolean(completedSteps[key]);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setCompletedSteps((prev) => toggleChecklistStep(prev, key))
                        }
                        aria-pressed={checked}
                        className={`w-full text-left p-3.5 rounded-xl border transition-colors flex items-start gap-3 cursor-pointer ${
                          checked
                            ? 'bg-blue-600/15 border-blue-500/60'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {checked ? (
                            <CheckCircle2 className="w-5 h-5 text-sky-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <span className="block text-sm font-semibold text-white">
                            {idx + 1}. {step.title}
                          </span>
                          <span className="block text-xs text-slate-300 mt-1 leading-relaxed">
                            {step.detail}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
