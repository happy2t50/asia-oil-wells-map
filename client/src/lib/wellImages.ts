/**
 * Selección de imágenes coherentes por tipo de pozo.
 *
 * Los datos originales (`wells.ts`) apuntan todos a una misma imagen de
 * almacenamiento que no existe en este entorno, por lo que la asociación se
 * resuelve aquí en tiempo de render a partir del tipo de pozo. Así un pozo
 * "Costa afuera" siempre muestra una plataforma marina y uno "Terrestre" una
 * instalación en tierra — nunca una imagen de la categoría equivocada.
 *
 * Todas las URLs fueron verificadas (Wikimedia Commons / Unsplash).
 */

import type { OilWell } from "@/data/wells";

/** Plataformas / instalaciones marinas (Costa afuera). */
const OFFSHORE_IMAGES = [
  "https://commons.wikimedia.org/wiki/Special:FilePath/Oil_platform_P-51_(Brazil).jpg?width=900",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Troll_A_Platform.jpg?width=900",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Oil_platform_in_the_North_SeaPros.jpg?width=900",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Gullfaks_A.jpg?width=900",
];

/** Torres / bombas en tierra (Terrestre). */
const ONSHORE_IMAGES = [
  "https://commons.wikimedia.org/wiki/Special:FilePath/Oil_well.jpg?width=900",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Oil_drilling_rig.jpg?width=900",
  "https://commons.wikimedia.org/wiki/Special:FilePath/Nodding_donkey.jpg?width=900",
  "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=900&h=600&fit=crop",
];

/** Hash determinista para repartir las imágenes de forma estable por pozo. */
function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const isOffshore = (well: OilWell) => well.tipo === "Costa afuera";

/** Imagen real coherente con el tipo de pozo (estable entre renders). */
export function getWellImage(well: OilWell): string {
  const pool = isOffshore(well) ? OFFSHORE_IMAGES : ONSHORE_IMAGES;
  return pool[hashId(well.id) % pool.length];
}

/**
 * Placeholder SVG embebido, coherente con el tipo, usado si la imagen remota
 * falla. Nunca cae en una foto de la categoría incorrecta.
 */
export function getWellPlaceholder(well: OilWell): string {
  const offshore = isOffshore(well);
  const sky = offshore ? "#B8D6CF" : "#EBE3CA";
  const ground = offshore ? "#71847F" : "#B85ED6";
  const scene = offshore
    ? `<path d="M0 150 Q100 140 200 150 T400 150 V200 H0 Z" fill="#71847F" opacity="0.45"/>
       <rect x="170" y="70" width="60" height="80" fill="#2D2D2D" opacity="0.85"/>
       <path d="M180 70 L200 30 L220 70 Z" fill="#2D2D2D" opacity="0.85"/>
       <line x1="200" y1="30" x2="200" y2="150" stroke="#2D2D2D" stroke-width="3"/>`
    : `<rect x="0" y="150" width="400" height="50" fill="#713A84" opacity="0.35"/>
       <path d="M175 150 L200 40 L225 150 Z" fill="none" stroke="#2D2D2D" stroke-width="4"/>
       <line x1="188" y1="95" x2="212" y2="95" stroke="#2D2D2D" stroke-width="3"/>
       <line x1="183" y1="120" x2="217" y2="120" stroke="#2D2D2D" stroke-width="3"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${sky}"/><stop offset="1" stop-color="${ground}" stop-opacity="0.25"/>
    </linearGradient></defs>
    <rect width="400" height="200" fill="url(#g)"/>${scene}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
