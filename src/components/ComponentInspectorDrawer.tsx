import {
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Wrench,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { AppSection, ComponentInfo } from '../types/hardware';

interface ComponentInspectorDrawerProps {
  component: ComponentInfo;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onNavigateSection: (section: AppSection) => void;
}

type InspectorTab = 'general' | 'maintenance' | 'install';

export default function ComponentInspectorDrawer({
  component,
  onClose,
  onPrev,
  onNext,
  onNavigateSection,
}: ComponentInspectorDrawerProps) {
  const [activeTab, setActiveTab] = useState<InspectorTab>('general');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <aside
      role="dialog"
      aria-label={`Información de ${component.name}`}
      className="absolute top-3 right-3 bottom-[156px] z-30 w-[390px] max-w-[calc(100vw-24px)] rounded-2xl bg-[#0B1222]/96 border border-slate-700/90 shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-800 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
            <span>{component.category}</span>
            <span aria-hidden="true">·</span>
            <span>Pieza seleccionada</span>
          </div>
          <h2 className="font-display font-bold text-lg text-white leading-snug mt-0.5">
            {component.name}
          </h2>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Componente anterior"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-blue-500 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Siguiente componente"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-blue-500 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel de componente"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-red-400 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Deep dive jump when selecting Motherboard or CPU in Desktop */}
      {component.deepDiveSection && (
        <div className="px-4 py-2.5 bg-blue-600/15 border-b border-blue-500/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-sky-200">
            <Cpu className="w-4 h-4 text-sky-400 shrink-0" />
            <span>¿Quieres ver sus 18 zonas en detalle?</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateSection(component.deepDiveSection!)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            <span>Explorar Placa Madre 3D</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Segmented Navigation Tabs */}
      <div className="px-4 pt-3 pb-2 border-b border-slate-800/80">
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'general'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Anatomía
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('maintenance')}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'maintenance'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Mantenimiento
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('install')}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'install'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Instalación
          </button>
        </div>
      </div>

      {/* Scrollable Educational Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4 text-sm leading-relaxed">
        {activeTab === 'general' && (
          <>
            <section className="space-y-1">
              <h3 className="text-xs font-semibold text-sky-400">¿Qué es?</h3>
              <p className="text-slate-200">{component.whatIs}</p>
            </section>
            <section className="space-y-1 pt-2 border-t border-slate-800/70">
              <h3 className="text-xs font-semibold text-sky-400">¿Para qué sirve?</h3>
              <p className="text-slate-200">{component.purpose}</p>
            </section>
            <section className="space-y-1 pt-2 border-t border-slate-800/70">
              <h3 className="text-xs font-semibold text-sky-400">¿Cómo funciona?</h3>
              <p className="text-slate-200">{component.howItWorks}</p>
            </section>
            <section className="space-y-1 pt-2 border-t border-slate-800/70">
              <h3 className="text-xs font-semibold text-sky-400">¿Dónde está ubicado?</h3>
              <p className="text-slate-200">{component.location}</p>
            </section>
          </>
        )}

        {activeTab === 'maintenance' && (
          <>
            <section className="space-y-1">
              <h3 className="text-xs font-semibold text-sky-400">
                ¿Cómo se realiza su limpieza?
              </h3>
              <p className="text-slate-200">{component.cleaning}</p>
            </section>
            <section className="space-y-1 pt-2 border-t border-slate-800/70">
              <h3 className="text-xs font-semibold text-sky-400">
                ¿Cómo se realiza su mantenimiento?
              </h3>
              <p className="text-slate-200">{component.maintenance}</p>
            </section>

            {component.maintenanceSteps && component.maintenanceSteps.length > 0 && (
              <section className="space-y-2 pt-2 border-t border-slate-800/70">
                <h3 className="text-xs font-semibold text-sky-400">
                  Tutorial paso a paso
                </h3>
                <ol className="space-y-2">
                  {component.maintenanceSteps.map((step, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200"
                    >
                      <span className="w-5 h-5 rounded-md bg-blue-600/25 text-sky-300 font-mono-tech font-semibold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </>
        )}

        {activeTab === 'install' && (
          <>
            <section className="space-y-1">
              <h3 className="text-xs font-semibold text-sky-400">
                ¿Cómo se instala?
              </h3>
              <p className="text-slate-200">{component.installation}</p>
            </section>
            <section className="space-y-1 pt-2 border-t border-slate-800/70">
              <h3 className="text-xs font-semibold text-sky-400">
                ¿Cómo se reemplaza?
              </h3>
              <p className="text-slate-200">{component.replacement}</p>
            </section>
          </>
        )}

        {/* Always-visible Tools & Safety Footer inside Drawer */}
        <section className="pt-3 border-t border-slate-800 space-y-2">
          <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-sky-400" />
            <span>Herramientas necesarias</span>
          </h3>
          <ul className="space-y-1 text-xs text-slate-300">
            {component.toolsRequired.map((tool, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-sky-400 font-bold" aria-hidden="true">·</span>
                <span>{tool}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="p-3 rounded-xl bg-amber-950/35 border border-amber-500/40 space-y-1.5">
          <h3 className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Precauciones de seguridad</span>
          </h3>
          <ul className="space-y-1.5 text-xs text-amber-100/90">
            {component.safetyWarnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}
