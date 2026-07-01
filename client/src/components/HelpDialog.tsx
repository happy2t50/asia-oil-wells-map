/**
 * Panel de ayuda: explica la simbología y la navegación del mapa.
 *
 * Modal flotante propio (position fixed, z-index alto) en lugar del Dialog de
 * shadcn, porque las capas de Leaflet usan z-index elevados y tapaban el
 * diálogo. Así queda siempre por encima del mapa.
 */

import { useEffect, useState } from "react";
import { HelpCircle, X, Factory, Waves } from "lucide-react";
import { STATUS_ORDER, STATUS_STYLE } from "@/lib/wellStyle";

export default function HelpDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Cómo leer el mapa"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/90 text-muted-foreground shadow-md backdrop-blur-sm transition-colors hover:text-foreground"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[3000] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Cómo leer el mapa"
        >
          {/* Fondo */}
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
          />

          {/* Contenido */}
          <div className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-foreground">
              ¿Cómo leer el mapa?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Guía rápida de la simbología y la navegación.
            </p>

            <div className="mt-5 space-y-5 text-sm text-foreground/90">
              {/* Estatus */}
              <section>
                <h4 className="mb-2 font-semibold text-foreground">
                  Color del pozo — estatus
                </h4>
                <ul className="space-y-1.5">
                  {STATUS_ORDER.map((key) => (
                    <li key={key} className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 flex-shrink-0 rounded-full border border-border"
                        style={{ backgroundColor: STATUS_STYLE[key].color }}
                      />
                      {STATUS_STYLE[key].label}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Tipo */}
              <section>
                <h4 className="mb-2 font-semibold text-foreground">
                  Icono — tipo de instalación
                </h4>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2.5">
                    <Factory className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span>
                      <strong className="font-medium">Terrestre</strong> — pozo
                      en tierra firme
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Waves className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span>
                      <strong className="font-medium">Costa afuera</strong> —
                      plataforma marina
                    </span>
                  </li>
                </ul>
              </section>

              {/* Agrupación */}
              <section>
                <h4 className="mb-2 font-semibold text-foreground">
                  Círculos con número — agrupación
                </h4>
                <p className="leading-relaxed text-muted-foreground">
                  Los pozos cercanos se agrupan en un círculo para no saturar el
                  mapa; el número indica cuántos hay. Haz zoom o clic sobre el
                  círculo para separarlos.
                </p>
              </section>

              {/* Filtros */}
              <section>
                <h4 className="mb-2 font-semibold text-foreground">
                  Filtros y búsqueda
                </h4>
                <p className="leading-relaxed text-muted-foreground">
                  Los botones de <strong className="font-medium">Tipo</strong> y{" "}
                  <strong className="font-medium">Estatus</strong> dejan en el
                  mapa solo los pozos de esa categoría. La búsqueda filtra la
                  lista por nombre o país. Al seleccionar un pozo, el mapa se
                  centra y hace zoom en su ubicación.
                </p>
              </section>

              {/* Nota de datos */}
              <section className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Proyecto con fines educativos. Algunos datos (producción,
                  profundidad) son aproximados o de referencia, ya que la
                  información detallada de pozos no suele ser de acceso público.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
