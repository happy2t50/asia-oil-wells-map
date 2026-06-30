/**
 * Mapa interactivo de pozos de perforación en Asia.
 *
 * Un único mapa Leaflet persistente (nunca se desmonta) muestra todos los
 * pozos. Al seleccionar uno, la cámara siempre vuela hacia su ubicación con el
 * mismo nivel de zoom — sin importar cuántas veces se haya seleccionado — y un
 * panel de detalle aparece sobre el mapa. Volver a "Ver todo" reencuadra Asia.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/styles/map.css";
import { OilWell, wells, statusColors, typeIcons } from "@/data/wells";
import WellCard from "./WellCard";
import WellsList from "./WellsList";
import BrandHeader from "./BrandHeader";

const ASIA_CENTER: L.LatLngTuple = [30, 80];
const ASIA_ZOOM = 3;
const WELL_ZOOM = 11;
const FLY_OPTIONS: L.ZoomPanOptions = { duration: 1.4, easeLinearity: 0.22 };

const slugify = (name: string) => name.replace(/\s+/g, "-");

export default function OilWellsMapSplit() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const urlSyncRef = useRef(false);

  const [selectedWell, setSelectedWell] = useState<OilWell | null>(null);
  const [location, setLocation] = useLocation();

  const stats = useMemo(
    () => ({
      total: wells.length,
      activos: wells.filter((w) => w.estatus === "Activo").length,
      perforacion: wells.filter((w) => w.estatus === "En perforación").length,
    }),
    []
  );

  /** Navegar a un pozo (o a la vista general) y reflejarlo en la URL. */
  const selectWell = (well: OilWell) => {
    urlSyncRef.current = true;
    setSelectedWell(well);
    setLocation(`/?well=${slugify(well.nombre)}`);
  };

  const backToAsia = () => {
    urlSyncRef.current = true;
    setSelectedWell(null);
    setLocation("/");
  };

  // 1. Inicializar el mapa una sola vez y mantenerlo montado.
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const instance = L.map(mapContainer.current, {
      center: ASIA_CENTER,
      zoom: ASIA_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true,
      worldCopyJump: true,
    });
    map.current = instance;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(instance);

    wells.forEach((well) => {
      if (!Number.isFinite(well.lat) || !Number.isFinite(well.lon)) return;

      const icon = L.divIcon({
        className: "oil-well-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        html: `<div class="oil-well-marker-icon" style="background-color:${statusColors[well.estatus]}">${typeIcons[well.tipo]}</div>`,
      });

      const marker = L.marker([well.lat, well.lon], { icon, title: well.nombre })
        .addTo(instance)
        .bindPopup(
          `<strong>${well.nombre}</strong><br>${well.pais} · ${well.tipo}`
        )
        .on("click", () => selectWell(well));

      markersRef.current.set(well.id, marker);
    });

    return () => {
      instance.remove();
      map.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Mover la cámara y resaltar el marcador cada vez que cambia la selección.
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;

    markersRef.current.forEach((marker, id) => {
      const selected = selectedWell?.id === id;
      marker.setZIndexOffset(selected ? 1000 : 0);
      const el = marker
        .getElement()
        ?.querySelector<HTMLElement>(".oil-well-marker-icon");
      el?.classList.toggle("marker-selected", selected);
    });

    instance.closePopup();

    if (selectedWell) {
      instance.flyTo([selectedWell.lat, selectedWell.lon], WELL_ZOOM, FLY_OPTIONS);
    } else {
      instance.flyTo(ASIA_CENTER, ASIA_ZOOM, FLY_OPTIONS);
    }
  }, [selectedWell]);

  // 3. Sincronizar con la URL (botones Atrás/Adelante del navegador).
  useEffect(() => {
    if (urlSyncRef.current) {
      urlSyncRef.current = false;
      return;
    }

    const params = new URLSearchParams(location.split("?")[1] || "");
    const wellName = params.get("well")?.replace(/-/g, " ");
    const target = wellName ? wells.find((w) => w.nombre === wellName) : null;

    if (target && target.id !== selectedWell?.id) {
      setSelectedWell(target);
    } else if (!wellName && selectedWell) {
      setSelectedWell(null);
    }
  }, [location, selectedWell]);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background">
      {/* Barra lateral (desktop) */}
      <aside className="hidden w-80 flex-col border-r border-border bg-sidebar shadow-sm md:flex">
        <header className="border-b border-border px-6 py-5">
          <BrandHeader />
          <dl className="mt-4 grid grid-cols-3 gap-2">
            <Stat value={stats.total} label="Pozos" />
            <Stat value={stats.activos} label="Activos" accent="#B85ED6" />
            <Stat value={stats.perforacion} label="Perforando" accent="#F59E0B" />
          </dl>
        </header>
        <WellsList
          wells={wells}
          onSelectWell={selectWell}
          selectedId={selectedWell?.id ?? null}
        />
      </aside>

      {/* Columna del mapa */}
      <div className="relative flex-1">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Marca flotante (móvil) */}
        <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-xl border border-border/70 bg-card/90 px-4 py-2.5 shadow-md backdrop-blur-sm md:hidden">
          <BrandHeader compact />
        </div>

        {/* Panel de detalle sobre el mapa */}
        {selectedWell && (
          <div
            key={selectedWell.id}
            className="absolute inset-x-0 bottom-0 top-auto z-[1000] h-[78%] animate-in fade-in slide-in-from-bottom-4 rounded-t-2xl border-t border-border bg-card shadow-2xl duration-300 ease-out md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-[420px] md:rounded-none md:border-l md:border-t-0 md:slide-in-from-right-6 md:slide-in-from-bottom-0"
          >
            <WellCard well={selectedWell} onBack={backToAsia} />
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg bg-muted/50 px-2 py-1.5 text-center">
      <dt className="flex items-center justify-center gap-1 text-base font-bold text-foreground">
        {accent && (
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: accent }}
          />
        )}
        {value}
      </dt>
      <dd className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dd>
    </div>
  );
}
