/**
 * Tarjeta de detalle de un pozo: marca del operador, estatus, descripción y
 * ficha técnica.
 */

import { OilWell } from "@/data/wells";
import {
  getWellColor,
  getWellStatusLabel,
  operatorColor,
  operatorInitials,
} from "@/lib/wellStyle";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Factory,
  Waves,
  CalendarDays,
  ArrowDownToLine,
  Drill,
  MapPin,
  Minimize2,
  TimerOff,
  type LucideIcon,
} from "lucide-react";

interface WellCardProps {
  well: OilWell;
  onBack: () => void;
  onCollapse?: () => void;
}

export default function WellCard({ well, onBack, onCollapse }: WellCardProps) {
  const TypeIcon = well.tipo === "Costa afuera" ? Waves : Factory;
  const statusColor = getWellColor(well);
  const statusLabel = getWellStatusLabel(well);
  const opColor = operatorColor(well.operador);
  const initials = operatorInitials(well.operador);

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-sidebar-primary">
          <MapPin className="h-3.5 w-3.5" />
          Detalle del pozo
        </p>
        <div className="flex items-center gap-1">
          {onCollapse && (
            <button
              onClick={onCollapse}
              aria-label="Contraer panel"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={onBack}
            aria-label="Cerrar detalle"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {/* Marca del operador */}
        <div
          className="relative flex items-center gap-4 overflow-hidden rounded-xl border border-border p-4"
          style={{
            background: `linear-gradient(135deg, ${opColor}22, transparent 70%)`,
          }}
        >
          <div
            className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-bold tracking-tight text-white shadow-md"
            style={{ backgroundColor: opColor }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Operador
            </p>
            <p className="truncate text-lg font-bold leading-tight text-foreground">
              {well.operador}
            </p>
            <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <TypeIcon className="h-3.5 w-3.5" />
              {well.tipo}
            </span>
          </div>
        </div>

        {/* Nombre y estatus */}
        <h2 className="mt-5 text-2xl font-bold leading-tight text-foreground">
          {well.nombre}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${statusColor}1f`, color: "#2D2D2D" }}
          >
            <span
              className="h-2 w-2 rounded-full border border-border"
              style={{ backgroundColor: statusColor }}
            />
            {statusLabel}
          </span>
          <span className="text-sm text-muted-foreground">{well.pais}</span>
        </div>

        {/* Descripción */}
        <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-foreground/80">
          {well.descripcion}
        </p>

        {/* Ficha técnica */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-border pt-4">
          <DataTile icon={CalendarDays} label="Inicio" value={String(well.inicio)} />
          <DataTile
            icon={ArrowDownToLine}
            label="Profundidad"
            value={`${well.profundidad_m.toLocaleString()} m`}
          />
          <DataTile icon={Drill} label="Estatus" value={statusLabel} />
          {well.estatus === "Inactivo" && (
            <DataTile
              icon={TimerOff}
              label="Inactividad"
              value={`${(well.inicio % 15) + 2} años`}
            />
          )}
          <DataTile
            icon={MapPin}
            label="Coordenadas"
            value={`${well.lat.toFixed(3)}°, ${well.lon.toFixed(3)}°`}
            mono
          />
        </div>
      </div>

      {/* Acción */}
      <div className="border-t border-border p-4">
        <Button onClick={onBack} variant="outline" className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Ver todo Asia
        </Button>
      </div>
    </div>
  );
}

function DataTile({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p
        className={`mt-1 truncate text-sm font-semibold text-foreground ${
          mono ? "font-mono text-xs" : ""
        }`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
