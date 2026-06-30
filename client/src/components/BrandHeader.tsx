/**
 * Componente de encabezado con marca
 * Logo + título del producto
 */

interface BrandHeaderProps {
  /** Versión reducida para overlays flotantes (móvil). */
  compact?: boolean;
}

export default function BrandHeader({ compact = false }: BrandHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Logo: Brújula + Gota de petróleo */}
      <div
        className={`relative flex-shrink-0 ${compact ? "h-8 w-8" : "h-10 w-10"}`}
      >
        <svg
          viewBox="0 0 40 40"
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Círculo exterior - brújula */}
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="#B85ED6"
            strokeWidth="1.5"
          />

          {/* Puntos cardinales */}
          <line x1="20" y1="4" x2="20" y2="8" stroke="#B85ED6" strokeWidth="1.5" />
          <line x1="20" y1="32" x2="20" y2="36" stroke="#B85ED6" strokeWidth="1.5" />
          <line x1="4" y1="20" x2="8" y2="20" stroke="#B85ED6" strokeWidth="1.5" />
          <line x1="32" y1="20" x2="36" y2="20" stroke="#B85ED6" strokeWidth="1.5" />

          {/* Gota de petróleo en el centro */}
          <path
            d="M 20 10 C 18 12 16 15 16 18 C 16 22 17.8 25 20 25 C 22.2 25 24 22 24 18 C 24 15 22 12 20 10 Z"
            fill="#B85ED6"
          />

          {/* Brillo en la gota */}
          <circle cx="19" cy="16" r="1.5" fill="white" opacity="0.6" />
        </svg>
      </div>

      {/* Texto */}
      <div className="flex flex-col">
        <h1
          className={`font-bold leading-tight text-foreground ${
            compact ? "text-base" : "text-lg"
          }`}
        >
          Pozos de Asia
        </h1>
        {!compact && (
          <p className="text-xs text-muted-foreground">Exploración Petrolera</p>
        )}
      </div>
    </div>
  );
}
