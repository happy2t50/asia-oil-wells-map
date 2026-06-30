/**
 * Mapa interactivo de pozos de perforación en Asia.
 *
 * Un único mapa Leaflet persistente muestra todos los pozos agrupados en
 * clústeres (leaflet.markercluster) para mantener el rendimiento con cientos de
 * marcadores. Al seleccionar un pozo, la cámara siempre vuela hacia su ubicación
 * con el mismo nivel de zoom y un panel de detalle aparece sobre el mapa.
 * Los datos se cargan de forma diferida desde un JSON estático.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "@/styles/map.css";
import { OilWell, loadWells, statusColors, typeIcons } from "@/data/wells";
import WellCard from "./WellCard";
import WellsList from "./WellsList";
import BrandHeader from "./BrandHeader";
import { Loader2 } from "lucide-react";

const ASIA_CENTER: L.LatLngTuple = [30, 80];
const ASIA_ZOOM = 3;
const WELL_ZOOM = 11;
const FLY_OPTIONS: L.ZoomPanOptions = { duration: 1.4, easeLinearity: 0.22 };

const slugify = (name: string) => name.replace(/\s+/g, "-");

function makeMarkerIcon(well: OilWell): L.DivIcon {
  return L.divIcon({
    className: "oil-well-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    html: `<div class="oil-well-marker-icon" style="background-color:${statusColors[well.estatus]}">${typeIcons[well.tipo]}</div>`,
  });
}

function makeClusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const count = cluster.getChildCount();
  const size = count < 10 ? 38 : count < 100 ? 46 : 54;
  return L.divIcon({
    className: "oil-cluster-wrapper",
    iconSize: [size, size],
    html: `<div class="oil-cluster" style="width:${size}px;height:${size}px">${count}</div>`,
  });
}

export default function OilWellsMapSplit() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const cluster = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const urlSyncRef = useRef(false);

  const [wells, setWells] = useState<OilWell[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWell, setSelectedWell] = useState<OilWell | null>(null);
  const [location, setLocation] = useLocation();

  const stats = useMemo(
    () => ({
      total: wells.length,
      activos: wells.filter((w) => w.estatus === "Activo").length,
      perforacion: wells.filter((w) => w.estatus === "En perforación").length,
    }),
    [wells]
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

  // Cargar los datos (diferido).
  useEffect(() => {
    let alive = true;
    loadWells()
      .then((data) => alive && setWells(data))
      .catch((err) => console.error("Error cargando pozos:", err))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // 1. Crear el mapa una sola vez.
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const instance = L.map(mapContainer.current, {
      center: ASIA_CENTER,
      zoom: ASIA_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true,
      worldCopyJump: true,
      preferCanvas: true,
    });
    map.current = instance;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(instance);

    return () => {
      instance.remove();
      map.current = null;
      cluster.current = null;
      markersRef.current.clear();
    };
  }, []);

  // 2. Poblar los marcadores agrupados cuando llegan los datos.
  useEffect(() => {
    const instance = map.current;
    if (!instance || wells.length === 0) return;

    const group = L.markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,
      maxClusterRadius: 60,
      iconCreateFunction: makeClusterIcon,
    });

    wells.forEach((well) => {
      if (!Number.isFinite(well.lat) || !Number.isFinite(well.lon)) return;

      const marker = L.marker([well.lat, well.lon], {
        icon: makeMarkerIcon(well),
        title: well.nombre,
      })
        .bindPopup(`<strong>${well.nombre}</strong><br>${well.pais} · ${well.tipo}`)
        .on("click", () => selectWell(well));

      markersRef.current.set(well.id, marker);
      group.addLayer(marker);
    });

    instance.addLayer(group);
    cluster.current = group;

    return () => {
      instance.removeLayer(group);
      cluster.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wells]);

  // 3. Mover la cámara y resaltar el marcador al cambiar la selección.
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;

    const applyHighlight = () => {
      markersRef.current.forEach((marker, id) => {
        const selected = selectedWell?.id === id;
        marker.setZIndexOffset(selected ? 1000 : 0);
        const el = marker
          .getElement()
          ?.querySelector<HTMLElement>(".oil-well-marker-icon");
        el?.classList.toggle("marker-selected", selected);
      });
    };

    instance.closePopup();
    applyHighlight();
    // Reaplicar tras el vuelo: el marcador puede salir de un clúster al hacer zoom.
    instance.once("moveend", applyHighlight);

    if (selectedWell) {
      instance.flyTo([selectedWell.lat, selectedWell.lon], WELL_ZOOM, FLY_OPTIONS);
    } else {
      instance.flyTo(ASIA_CENTER, ASIA_ZOOM, FLY_OPTIONS);
    }
  }, [selectedWell, wells]);

  // 4. Sincronizar con la URL (Atrás/Adelante del navegador).
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
  }, [location, selectedWell, wells]);

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
        {loading ? (
          <ListLoader />
        ) : (
          <WellsList
            wells={wells}
            onSelectWell={selectWell}
            selectedId={selectedWell?.id ?? null}
          />
        )}
      </aside>

      {/* Columna del mapa */}
      <div className="relative flex-1">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Marca flotante (móvil) */}
        <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-xl border border-border/70 bg-card/90 px-4 py-2.5 shadow-md backdrop-blur-sm md:hidden">
          <BrandHeader compact />
        </div>

        {/* Indicador de carga sobre el mapa */}
        {loading && (
          <div className="pointer-events-none absolute left-1/2 top-4 z-[500] flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-2 text-sm font-medium text-muted-foreground shadow-md backdrop-blur-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando pozos…
          </div>
        )}

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

function ListLoader() {
  return (
    <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      Cargando…
    </div>
  );
}
