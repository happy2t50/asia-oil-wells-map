/**
 * Lista lateral de pozos con búsqueda y filtros por tipo y estatus.
 */

import { useMemo, useState } from "react";
import { OilWell } from "@/data/wells";
import { getWellColor } from "@/lib/wellStyle";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Factory, Waves, ArrowDownToLine } from "lucide-react";

export type TypeFilter = "Todos" | OilWell["tipo"];
export type StatusFilter = "Todos" | OilWell["estatus"];

interface WellsListProps {
  wells: OilWell[];
  onSelectWell: (well: OilWell) => void;
  selectedId: string | null;
  /** Filtros controlados por el padre (se aplican también al mapa). */
  filterType: TypeFilter;
  filterStatus: StatusFilter;
  onFilterTypeChange: (value: TypeFilter) => void;
  onFilterStatusChange: (value: StatusFilter) => void;
}

const TYPE_FILTERS: TypeFilter[] = ["Todos", "Terrestre", "Costa afuera"];
const STATUS_FILTERS: StatusFilter[] = [
  "Todos",
  "Activo",
  "En perforación",
  "Inactivo",
];

export default function WellsList({
  wells,
  onSelectWell,
  selectedId,
  filterType,
  filterStatus,
  onFilterTypeChange,
  onFilterStatusChange,
}: WellsListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWells = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return wells.filter((well) => {
      const matchesSearch =
        well.nombre.toLowerCase().includes(term) ||
        well.pais.toLowerCase().includes(term);
      const matchesType = filterType === "Todos" || well.tipo === filterType;
      const matchesStatus =
        filterStatus === "Todos" || well.estatus === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [wells, searchTerm, filterType, filterStatus]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Búsqueda */}
      <div className="border-b border-border px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar pozo o país…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-border bg-background/60 pl-9 transition-colors focus:bg-background"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="space-y-3 border-b border-border bg-muted/30 px-4 py-3">
        <FilterRow
          label="Tipo"
          options={TYPE_FILTERS}
          value={filterType}
          onChange={onFilterTypeChange}
        />
        <FilterRow
          label="Estatus"
          options={STATUS_FILTERS}
          value={filterStatus}
          onChange={onFilterStatusChange}
        />
      </div>

      {/* Lista */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {filteredWells.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            No se encontraron pozos con esos criterios.
          </p>
        ) : (
          <ul className="space-y-1 p-2">
            {filteredWells.map((well) => {
              const isSelected = well.id === selectedId;
              const TypeIcon = well.tipo === "Costa afuera" ? Waves : Factory;
              return (
                <li key={well.id}>
                  <button
                    onClick={() => onSelectWell(well)}
                    aria-current={isSelected}
                    className={cn(
                      "group w-full rounded-lg border px-3 py-2.5 text-left transition-all duration-150",
                      isSelected
                        ? "border-primary/40 bg-primary/10 shadow-sm"
                        : "border-transparent hover:border-border hover:bg-muted/60"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full border border-border ring-2 ring-card"
                        style={{ backgroundColor: getWellColor(well) }}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-sm font-semibold",
                            isSelected ? "text-primary" : "text-foreground"
                          )}
                        >
                          {well.nombre}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                          <TypeIcon className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {well.pais} · {well.tipo}
                          </span>
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground/80">
                          <ArrowDownToLine className="h-3 w-3" />
                          {well.profundidad_m.toLocaleString()} m
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Contador */}
      <div className="border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
        {filteredWells.length} de {wells.length} pozos
      </div>
    </div>
  );
}

function FilterRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-sidebar-primary">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              option === value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
