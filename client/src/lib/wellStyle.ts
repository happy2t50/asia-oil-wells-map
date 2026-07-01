/**
 * Estilo visual derivado de los datos del pozo: color por estatus/producción,
 * etiqueta legible y avatar de marca del operador.
 */

import type { OilWell } from "@/data/wells";

export type WellCategory = "produciendo" | "activo" | "perforando" | "inactivo";

/** Colores y etiquetas por categoría de estatus. */
export const STATUS_STYLE: Record<
  WellCategory,
  { color: string; label: string }
> = {
  produciendo: { color: "#EF4444", label: "Activo y produciendo" }, // rojo
  activo: { color: "#FACC15", label: "Activo" }, // amarillo
  perforando: { color: "#F97316", label: "En perforación" }, // naranja
  inactivo: { color: "#FFFFFF", label: "Inactivo" }, // blanco
};

/** Orden para leyendas/listas. */
export const STATUS_ORDER: WellCategory[] = [
  "produciendo",
  "activo",
  "perforando",
  "inactivo",
];

/** Categoría efectiva: "Activo" se divide en produciendo/activo según producción. */
export function getWellCategory(well: OilWell): WellCategory {
  if (well.estatus === "Inactivo") return "inactivo";
  if (well.estatus === "En perforación") return "perforando";
  return well.produccion_bpd && well.produccion_bpd > 0
    ? "produciendo"
    : "activo";
}

export const getWellColor = (well: OilWell): string =>
  STATUS_STYLE[getWellCategory(well)].color;

export const getWellStatusLabel = (well: OilWell): string =>
  STATUS_STYLE[getWellCategory(well)].label;

/** ¿El color es claro? (para decidir icono/borde oscuro sobre él). */
export function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}

// ---- Avatar de marca del operador ----

// Paleta sobria y fría para los avatares de operador (sin morado).
const AVATAR_COLORS = [
  "#334155", "#0D9488", "#2563EB", "#0EA5E9", "#0F766E", "#16A34A",
  "#CA8A04", "#DC2626", "#EA580C", "#475569", "#0891B2", "#4338CA",
];

const STOP_WORDS = new Set([
  "oil", "gas", "company", "state", "national", "petroleum", "corporation",
  "ministry", "of", "and", "the", "energy", "exploration", "production",
  "enterprise",
]);

/** Iniciales representativas del operador (acrónimos se conservan). */
export function operatorInitials(operator: string): string {
  const all = operator.split(/\s+/).filter(Boolean);
  const significant = all.filter((w) => !STOP_WORDS.has(w.toLowerCase()));
  const words = significant.length ? significant : all;

  if (words.length === 1) {
    const w = words[0];
    if (/^[A-Z0-9]{2,6}$/.test(w)) return w; // BP, ONGC, PTTEP…
    return w.slice(0, 2).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Color estable del avatar del operador. */
export function operatorColor(operator: string): string {
  let hash = 0;
  for (let i = 0; i < operator.length; i++) {
    hash = (hash * 31 + operator.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
