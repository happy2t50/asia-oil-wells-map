/**
 * Panel de ayuda: explica la simbología y la navegación del mapa.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { STATUS_ORDER, STATUS_STYLE } from "@/lib/wellStyle";
import { HelpCircle, Factory, Waves } from "lucide-react";

export default function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Cómo leer el mapa"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/90 text-muted-foreground shadow-md backdrop-blur-sm transition-colors hover:text-foreground"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>¿Cómo leer el mapa?</DialogTitle>
          <DialogDescription>
            Guía rápida de la simbología y la navegación.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 text-sm text-foreground/90">
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
                  <strong className="font-medium">Terrestre</strong> — pozo en
                  tierra firme
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
              <strong className="font-medium">Estatus</strong> dejan en el mapa
              solo los pozos de esa categoría. La búsqueda filtra la lista por
              nombre o país. Al seleccionar un pozo, el mapa se centra y hace
              zoom en su ubicación.
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
      </DialogContent>
    </Dialog>
  );
}
