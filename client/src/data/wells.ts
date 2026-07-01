/**
 * Tipos y metadatos de los pozos de perforación en Asia.
 *
 * El conjunto de datos (887 pozos) se sirve aparte como `public/data/wells.json`
 * y se carga de forma diferida con `loadWells()`, para no inflar el bundle de JS
 * ni bloquear el arranque de la app.
 */

export interface OilWell {
  id: string;
  nombre: string;
  pais: string;
  lat: number;
  lon: number;
  estatus: "Activo" | "En perforación" | "Inactivo";
  inicio: number;
  operador: string;
  tipo: "Terrestre" | "Costa afuera";
  profundidad_m: number;
  produccion_bpd?: number;
  imagen: string;
  descripcion: string;
}

// Trazados (Lucide) para los iconos de tipo de pozo.
const TYPE_ICON_PATHS: Record<OilWell["tipo"], string> = {
  // "factory" — instalación terrestre
  "Terrestre": `<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>`,
  // "waves" — instalación costa afuera
  "Costa afuera": `<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>`,
};

/**
 * SVG del icono de tipo de pozo con color de trazo configurable, para asegurar
 * contraste sobre marcadores claros (amarillo/blanco) u oscuros.
 */
export function typeIconSvg(tipo: OilWell["tipo"], stroke = "#FFFFFF"): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${TYPE_ICON_PATHS[tipo]}</svg>`;
}

let cache: OilWell[] | null = null;

/** Carga (y memoiza) el conjunto de pozos desde el JSON estático. */
export async function loadWells(): Promise<OilWell[]> {
  if (cache) return cache;
  const res = await fetch(`${import.meta.env.BASE_URL}data/wells.json`);
  if (!res.ok) {
    throw new Error(`No se pudieron cargar los pozos (HTTP ${res.status})`);
  }
  cache = (await res.json()) as OilWell[];
  return cache;
}
