/**
 * Mapa interactivo de pozos de perforación en Asia.
 *
 * Un único mapa Leaflet persistente muestra los pozos agrupados en clústeres.
 * Los filtros de tipo/estatus se aplican a la lista y al mapa. La barra lateral
 * es fija en escritorio y un panel deslizante (drawer) en móvil. Al seleccionar
 * un pozo aparece un panel de detalle que puede contraerse y reabrirse.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "@/styles/map.css";
import { OilWell, loadWells, typeIconSvg } from "@/data/wells";
import {
  getWellColor,
  isLightColor,
  STATUS_ORDER,
  STATUS_STYLE,
} from "@/lib/wellStyle";
import WellCard from "./WellCard";
import WellsList, { type TypeFilter, type StatusFilter } from "./WellsList";
import BrandHeader from "./BrandHeader";
import HelpDialog from "./HelpDialog";
import { Loader2, Factory, Waves, List, X, ChevronUp } from "lucide-react";

const ASIA_CENTER: L.LatLngTuple = [30, 80];
const ASIA_ZOOM = 3;
const WELL_ZOOM = 11;
const FLY_OPTIONS: L.ZoomPanOptions = { duration: 1.4, easeLinearity: 0.22 };
const ASIA_GEOJSON_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

const slugify = (name: string) => name.replace(/\s+/g, "-");

function makeMarkerIcon(well: OilWell): L.DivIcon {
  const bg = getWellColor(well);
  const light = isLightColor(bg);
  const stroke = light ? "#2D2D2D" : "#FFFFFF";
  const border = light ? "#C9C4BC" : "#FFFFFF";
  return L.divIcon({
    className: "oil-well-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    html: `<div class="oil-well-marker-icon" style="background-color:${bg};border-color:${border}">${typeIconSvg(well.tipo, stroke)}</div>`,
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

/** Aplica el resaltado (pulso) al marcador seleccionado. */
function highlightMarkers(
  markers: Map<string, L.Marker>,
  selectedId: string | null
) {
  markers.forEach((marker, id) => {
    const selected = selectedId === id;
    marker.setZIndexOffset(selected ? 1000 : 0);
    const el = marker
      .getElement()
      ?.querySelector<HTMLElement>(".oil-well-marker-icon");
    el?.classList.toggle("marker-selected", selected);
  });
}

export default function OilWellsMapSplit() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const cluster = useRef<L.MarkerClusterGroup | null>(null);
  const asiaLayer = useRef<L.GeoJSON | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const urlSyncRef = useRef(false);

  const [wells, setWells] = useState<OilWell[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWell, setSelectedWell] = useState<OilWell | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const [filterType, setFilterType] = useState<TypeFilter>("Todos");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("Todos");
  const [location, setLocation] = useLocation();

  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedWell?.id ?? null;

  const mapWells = useMemo(
    () =>
      wells.filter(
        (w) =>
          (filterType === "Todos" || w.tipo === filterType) &&
          (filterStatus === "Todos" || w.estatus === filterStatus)
      ),
    [wells, filterType, filterStatus]
  );

  const stats = useMemo(
    () => ({
      total: wells.length,
      activos: wells.filter((w) => w.estatus === "Activo").length,
      perforacion: wells.filter((w) => w.estatus === "En perforación").length,
    }),
    [wells]
  );

  const selectWell = (well: OilWell) => {
    urlSyncRef.current = true;
    setSelectedWell(well);
    setCollapsed(false);
    setMobileListOpen(false);
    setLocation(`/?well=${slugify(well.nombre)}`);
  };

  const backToAsia = () => {
    urlSyncRef.current = true;
    setSelectedWell(null);
    setCollapsed(false);
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
    });
    map.current = instance;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(instance);

    let cancelled = false;
    fetch(ASIA_GEOJSON_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `No se pudo cargar la capa de Asia (HTTP ${response.status})`
          );
        }
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;

        asiaLayer.current?.remove();
        asiaLayer.current = L.geoJSON(data, {
          filter: (feature) => feature?.properties?.CONTINENT === "Asia",
          interactive: false,
          style: {
            color: "#7C5A22",
            weight: 1.5,
            opacity: 0.8,
            fillColor: "#A8792D",
            fillOpacity: 0.18,
            lineJoin: "round",
          },
        }).addTo(instance);
      })
      .catch((err) => {
        console.error("Error cargando la capa de Asia:", err);
      });

    return () => {
      cancelled = true;
      asiaLayer.current?.remove();
      asiaLayer.current = null;
      instance.remove();
      map.current = null;
      cluster.current = null;
      markersRef.current.clear();
    };
  }, []);

  // 2. (Re)construir los marcadores agrupados según los pozos filtrados.
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;

    const group = L.markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,
      maxClusterRadius: 60,
      iconCreateFunction: makeClusterIcon,
    });

    markersRef.current.clear();
    mapWells.forEach((well) => {
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
    highlightMarkers(markersRef.current, selectedIdRef.current);

    return () => {
      instance.removeLayer(group);
      cluster.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapWells]);

  // 3. Mover la cámara y resaltar el marcador al cambiar la selección.
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;

    const selectedId = selectedWell?.id ?? null;
    instance.closePopup();
    highlightMarkers(markersRef.current, selectedId);
    instance.once("moveend", () =>
      highlightMarkers(markersRef.current, selectedId)
    );

    if (selectedWell) {
      instance.flyTo([selectedWell.lat, selectedWell.lon], WELL_ZOOM, FLY_OPTIONS);
    } else {
      instance.flyTo(ASIA_CENTER, ASIA_ZOOM, FLY_OPTIONS);
    }
  }, [selectedWell]);

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
      setCollapsed(false);
    } else if (!wellName && selectedWell) {
      setSelectedWell(null);
    }
  }, [location, selectedWell, wells]);

  // Contenido de la barra lateral (compartido entre escritorio y móvil).
  const sidebar = (
    <>
      <header className="border-b border-border px-6 py-5">
        <BrandHeader />
        <dl className="mt-4 grid grid-cols-3 gap-2">
          <Stat value={stats.total} label="Pozos" />
          <Stat value={stats.perforacion} label="Perforando" accent="#F97316" />
          <Stat value={stats.activos} label="Activos" accent="#FACC15" />
        </dl>
      </header>
      {loading ? (
        <ListLoader />
      ) : (
        <WellsList
          wells={wells}
          onSelectWell={selectWell}
          selectedId={selectedWell?.id ?? null}
          filterType={filterType}
          filterStatus={filterStatus}
          onFilterTypeChange={setFilterType}
          onFilterStatusChange={setFilterStatus}
        />
      )}
    </>
  );

  const showTopControls = !selectedWell || collapsed;

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background">
      {/* Barra lateral fija (escritorio) */}
      <aside className="hidden w-80 flex-col border-r border-border bg-sidebar shadow-sm md:flex">
        {sidebar}
      </aside>

      {/* Columna del mapa */}
      <div className="relative flex-1">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Marca flotante (móvil) */}
        <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-xl border border-border/70 bg-card/90 px-3 py-2 shadow-md backdrop-blur-sm md:hidden">
          <BrandHeader compact />
        </div>

        {/* Controles superiores (ayuda + lista en móvil) */}
        {showTopControls && (
          <div className="absolute right-3 top-3 z-[600] flex items-center gap-2">
            <HelpDialog />
            <button
              type="button"
              onClick={() => setMobileListOpen(true)}
              aria-label="Ver lista y filtros"
              className="flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card/90 px-3 text-sm font-medium text-foreground shadow-md backdrop-blur-sm md:hidden"
            >
              <List className="h-4 w-4" />
              Lista
            </button>
          </div>
        )}

        {/* Leyenda / simbología (escritorio) */}
        {!loading && (
          <div className="absolute bottom-6 left-3 z-[500] hidden w-52 rounded-xl border border-border bg-card/90 p-3 text-xs shadow-md backdrop-blur-sm md:block">
            <p className="mb-1.5 font-semibold text-foreground">Estatus</p>
            <ul className="space-y-1">
              {STATUS_ORDER.map((key) => (
                <li
                  key={key}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full border border-border"
                    style={{ backgroundColor: STATUS_STYLE[key].color }}
                  />
                  {STATUS_STYLE[key].label}
                </li>
              ))}
            </ul>

            <p className="mb-1.5 mt-3 font-semibold text-foreground">Tipo</p>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Factory className="h-3.5 w-3.5 flex-shrink-0" />
                Terrestre
              </li>
              <li className="flex items-center gap-2">
                <Waves className="h-3.5 w-3.5 flex-shrink-0" />
                Costa afuera
              </li>
            </ul>

            <p className="mt-3 border-t border-border pt-2 text-[11px] leading-snug text-muted-foreground">
              Los círculos con número agrupan pozos cercanos; acércate para
              separarlos.
            </p>
          </div>
        )}

        {/* Contador de pozos visibles cuando hay filtro activo */}
        {!loading && (filterType !== "Todos" || filterStatus !== "Todos") && (
          <div className="pointer-events-none absolute bottom-6 left-1/2 z-[500] -translate-x-1/2 rounded-full border border-border bg-card/90 px-4 py-1.5 text-xs font-semibold text-foreground shadow-md backdrop-blur-sm">
            {mapWells.length} pozos en el mapa
          </div>
        )}

        {/* Botón para reabrir el detalle contraído */}
        {selectedWell && collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="absolute bottom-6 left-1/2 z-[900] flex max-w-[80%] -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-xl transition-transform hover:scale-[1.02] md:left-auto md:right-6 md:translate-x-0"
          >
            <ChevronUp className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{selectedWell.nombre}</span>
          </button>
        )}

        {/* Panel de detalle */}
        {selectedWell && !collapsed && (
          <div
            key={selectedWell.id}
            className="absolute inset-x-0 bottom-0 top-auto z-[1000] h-[80%] animate-in fade-in slide-in-from-bottom-4 rounded-t-2xl border-t border-border bg-card shadow-2xl duration-300 ease-out md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-[420px] md:max-w-[85%] md:rounded-none md:border-l md:border-t-0 md:slide-in-from-right-6 md:slide-in-from-bottom-0"
          >
            <WellCard
              well={selectedWell}
              onBack={backToAsia}
              onCollapse={() => setCollapsed(true)}
            />
          </div>
        )}
      </div>

      {/* Drawer de lista/filtros (móvil) */}
      {mobileListOpen && (
        <div className="fixed inset-0 z-[1500] md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileListOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-80 max-w-[86%] flex-col bg-sidebar shadow-2xl animate-in slide-in-from-left duration-300">
            <button
              type="button"
              onClick={() => setMobileListOpen(false)}
              aria-label="Cerrar lista"
              className="absolute right-3 top-4 z-10 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
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
            className="inline-block h-2 w-2 rounded-full border border-border"
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
