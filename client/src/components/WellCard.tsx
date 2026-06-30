/**
 * Tarjeta de detalle de un pozo: imagen, estatus, descripción y ficha técnica.
 */

import { useMemo } from "react";
import { OilWell, statusColors } from "@/data/wells";
import { getWellImage, getWellPlaceholder } from "@/lib/wellImages";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Factory,
  Waves,
  Building2,
  CalendarDays,
  ArrowDownToLine,
  Gauge,
  MapPin,
  type LucideIcon,
} from "lucide-react";

interface WellCardProps {
  well: OilWell;
  onBack: () => void;
}

export default function WellCard({ well, onBack }: WellCardProps) {
  const imageSrc = useMemo(() => getWellImage(well), [well]);
  const TypeIcon = well.tipo === "Costa afuera" ? Waves : Factory;
  const statusColor = statusColors[well.estatus];

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-sidebar-primary">
          <MapPin className="h-3.5 w-3.5" />
          Detalle del pozo
        </p>
        <button
          onClick={onBack}
          aria-label="Cerrar detalle"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Contenido */}
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {/* Imagen */}
        <div className="relative mb-5 overflow-hidden rounded-xl bg-muted shadow-md">
          <img
            src={imageSrc}
            alt={`Instalación ${well.tipo.toLowerCase()} — ${well.nombre}`}
            loading="lazy"
            className="h-56 w-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              const img = e.currentTarget;
              img.onerror = null;
              img.src = getWellPlaceholder(well);
            }}
          />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm">
            <TypeIcon className="h-3.5 w-3.5" />
            {well.tipo}
          </span>
        </div>

        {/* Nombre y estatus */}
        <h2 className="text-2xl font-bold leading-tight text-foreground">
          {well.nombre}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${statusColor}1a`, color: statusColor }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: statusColor }}
            />
            {well.estatus}
          </span>
          <span className="text-sm text-muted-foreground">{well.pais}</span>
        </div>

        {/* Descripción */}
        <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-foreground/80">
          {well.descripcion}
        </p>

        {/* Ficha técnica */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-border pt-4">
          <DataTile icon={TypeIcon} label="Tipo" value={well.tipo} />
          <DataTile icon={Building2} label="Operador" value={well.operador} />
          <DataTile icon={CalendarDays} label="Inicio" value={String(well.inicio)} />
          <DataTile
            icon={ArrowDownToLine}
            label="Profundidad"
            value={`${well.profundidad_m.toLocaleString()} m`}
          />
          {well.produccion_bpd != null && (
            <DataTile
              icon={Gauge}
              label="Producción"
              value={`${(well.produccion_bpd / 1_000_000).toFixed(1)}M bpd`}
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
