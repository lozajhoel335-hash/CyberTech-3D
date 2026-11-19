import { Search, X } from 'lucide-react';
import { useState } from 'react';
import type { ComponentInfo } from '../types/hardware';
import { filterComponents } from '../utils/labLogic';

interface ComponentListDrawerProps {
  title: string;
  components: ComponentInfo[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function ComponentListDrawer({
  title,
  components,
  selectedId,
  onSelect,
  onClose,
}: ComponentListDrawerProps) {
  const [query, setQuery] = useState('');
  const filtered = filterComponents(components, query);

  return (
    <div
      role="dialog"
      aria-label={`Lista de componentes de ${title}`}
      className="absolute top-14 left-3 z-30 w-80 max-w-[calc(100vw-24px)] max-h-[calc(100%-170px)] rounded-2xl bg-[#0B1222]/95 border border-slate-700/90 shadow-2xl flex flex-col overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-display font-semibold text-sm text-white">
            Componentes ({components.length})
          </h3>
          <p className="text-xs text-slate-400">{title}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar lista de componentes"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 border-b border-slate-800/80">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar componente..."
            aria-label="Buscar componente"
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No se encontraron piezas con "{query}".
          </p>
        ) : (
          filtered.map((item) => {
            const isSel = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`w-full px-3 py-2 rounded-lg text-left transition-colors flex items-center justify-between gap-2 border cursor-pointer ${
                  isSel
                    ? 'bg-blue-600/20 border-blue-500/60 text-white'
                    : 'bg-transparent border-transparent text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span className="text-xs font-medium truncate">{item.name}</span>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {item.category}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
