import {
  BookOpen,
  Cpu,
  Home,
  Laptop,
  Menu,
  Monitor,
  Smartphone,
  Wrench,
  X,
} from 'lucide-react';
import type { AppSection } from '../types/hardware';

interface SidebarNavProps {
  activeSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  mobileOpen: boolean;
  onSetMobileOpen: (open: boolean) => void;
}

interface NavItem {
  id: AppSection;
  label: string;
  subtitle: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Inicio',
    subtitle: 'Selección de dispositivos',
    icon: Home,
  },
  {
    id: 'desktop',
    label: 'Computadora 3D',
    subtitle: 'Gabinete y 18 piezas',
    icon: Monitor,
  },
  {
    id: 'motherboard',
    label: 'Placa Madre 3D',
    subtitle: 'Exploración de 18 zonas',
    icon: Cpu,
  },
  {
    id: 'laptop',
    label: 'Laptop 3D',
    subtitle: 'Portátil y 15 piezas',
    icon: Laptop,
  },
  {
    id: 'phone',
    label: 'Teléfono Celular',
    subtitle: 'Desmontaje y 14 piezas',
    icon: Smartphone,
  },
  {
    id: 'workshop',
    label: 'Taller de Mantenimiento',
    subtitle: 'Herramientas 3D y guías',
    icon: Wrench,
  },
  {
    id: 'education',
    label: 'Modo Educativo',
    subtitle: 'Teoría, fallas y examen',
    icon: BookOpen,
  },
];

export default function SidebarNav({
  activeSection,
  onSelectSection,
  mobileOpen,
  onSetMobileOpen,
}: SidebarNavProps) {
  const handleSelect = (id: AppSection) => {
    onSelectSection(id);
    onSetMobileOpen(false);
  };

  return (
    <>
      {/* Mobile compact top bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0A101E] border-b border-slate-800/90 shrink-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            PC
          </div>
          <span className="font-display font-bold text-base tracking-tight text-white whitespace-nowrap">
            PC MASTER 3D
          </span>
        </div>
        <button
          type="button"
          onClick={() => onSetMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Cerrar menú lateral' : 'Abrir menú lateral'}
          aria-expanded={mobileOpen}
          className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-blue-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/65 z-40"
          onClick={() => onSetMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar drawer (desktop fixed column, mobile slide-in) */}
      <aside
        aria-label="Navegación principal"
        className={`fixed lg:static inset-y-0 left-0 z-50 w-68 bg-[#0A101E] border-r border-slate-800/90 flex flex-col transition-transform duration-200 ease-out shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-5 py-5 border-b border-slate-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleSelect('home')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-display font-bold text-sm shrink-0">
              3D
            </div>
            <div>
              <span className="block font-display font-bold text-lg tracking-tight text-white leading-tight whitespace-nowrap">
                PC MASTER 3D
              </span>
              <span className="block text-xs text-slate-400 whitespace-nowrap">
                Laboratorio de Hardware
              </span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onSetMobileOpen(false)}
            aria-label="Cerrar menú"
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all duration-150 border cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/20 text-white border-blue-500/60 shadow-sm'
                    : 'bg-transparent text-slate-300 border-transparent hover:bg-slate-900/90 hover:text-white hover:border-slate-800'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight truncate">
                    {item.label}
                  </span>
                  <span className="block text-xs text-slate-400 mt-0.5 truncate">
                    {item.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
          <p className="font-medium text-slate-300">Controles de escena 3D</p>
          <p>Arrastra para girar · Rueda para zoom · Clic en pieza para estudiar</p>
        </div>
      </aside>
    </>
  );
}
