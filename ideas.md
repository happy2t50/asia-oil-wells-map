# Mapa Interactivo de Pozos de Perforación - Asia

## Concepto General
Mapa interactivo del continente asiático que visualiza pozos de perforación petrolera (terrestres y marinos) con animaciones suaves de zoom, cards informativas detalladas e imágenes reales de cada instalación.

---

## Tres Enfoques de Diseño

### Enfoque 1: "Geotecnia Industrial"
**Introducción:** Estética técnica y profesional con paleta de grises, azules industriales y acentos de naranja. Inspirado en dashboards de ingeniería y plataformas de datos petroleras.
**Probabilidad:** 0.08

### Enfoque 2: "Exploración Minimalista"
**Introducción:** Diseño limpio y moderno con mucho espacio en blanco, tipografía clara y una paleta de azules oceánicos y verdes tierra. Enfoque en la claridad de datos.
**Probabilidad:** 0.07

### Enfoque 3: "Cartografía Contemporánea"
**Introducción:** Mapa como protagonista visual con overlays elegantes, animaciones fluidas y una paleta terracota/arena que evoca la geografía asiática. Énfasis en la experiencia interactiva.
**Probabilidad:** 0.06

---

## Enfoque Seleccionado: "Cartografía Contemporánea"

### Movimiento de Diseño
Fusión de cartografía clásica con interfaz digital moderna, inspirada en aplicaciones de exploración geográfica como Google Earth y plataformas de datos geoespaciales contemporáneas.

### Principios Fundamentales
1. **El mapa es el lienzo:** El mapa interactivo ocupa el 70% del espacio, con controles y paneles que no compiten por atención.
2. **Animaciones narrativas:** Las transiciones de zoom y pan deben sentirse naturales, como si estuvieras "volando" hacia el pozo.
3. **Información progresiva:** Los detalles se revelan gradualmente: primero el marcador, luego la ubicación ampliada, finalmente la card con datos completos.
4. **Contexto geográfico:** Los colores y estilos reflejan la geografía real (océanos azules, tierra arena/marrón, cielos cálidos).

### Filosofía de Color
- **Primario:** Azul océano profundo (#1a5f7a) para agua y contraste
- **Secundario:** Terracota/Arena (#c17a4a) para tierra y acentos cálidos
- **Terciario:** Verde tierra (#4a7c59) para vegetación y equilibrio
- **Marcadores activos:** Naranja dorado (#f59e0b) para pozos activos, gris (#6b7280) para inactivos, ámbar (#fbbf24) para en perforación
- **Fondo:** Blanco/crema muy suave (#faf9f7) para no competir con el mapa
- **Texto:** Gris carbón (#1f2937) para máxima legibilidad

### Paradigma de Layout
- **Mapa central:** Leaflet o Google Maps como elemento principal
- **Sidebar izquierdo:** Lista de pozos con búsqueda/filtros (colapsable en móvil)
- **Panel derecho:** Card de información del pozo seleccionado (deslizable en móvil)
- **Encabezado minimalista:** Logo, título y controles de vista

### Elementos Distintivos
1. **Marcadores personalizados:** Iconos SVG que representan plataformas marinas vs torres terrestres
2. **Líneas de conexión:** Líneas sutiles que conectan el marcador en el mapa con la card de información
3. **Gradientes de profundidad:** Colores más oscuros para pozos más profundos (visualización de datos)

### Filosofía de Interacción
- **Clic en marcador:** Zoom suave (1.5s) + fade-in de la card
- **Clic en lista:** Mismo comportamiento que marcador
- **Hover en lista:** Resalta el marcador correspondiente en el mapa
- **Botón "Volver":** Zoom out suave a vista de Asia completa

### Animaciones
- **Zoom de cámara:** `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out) durante 1.5s
- **Fade de card:** 300ms ease-out para entrada
- **Hover en marcador:** Escala 1.2x con sombra expandida (200ms)
- **Transiciones de lista:** Highlight suave (150ms) al pasar mouse

### Sistema Tipográfico
- **Titulares:** "Playfair Display" (serif elegante) para títulos principales
- **Cuerpo:** "Inter" o "Poppins" para texto legible
- **Datos técnicos:** "Courier New" o monoespaciado para coordenadas y profundidades
- **Jerarquía:** H1 (32px bold), H2 (24px semibold), Body (16px regular), Caption (12px muted)

### Esencia de Marca
**Posicionamiento:** Plataforma de visualización interactiva de infraestructura petrolera asiática que transforma datos complejos en experiencias geográficas intuitivas.

**Personalidad:** 
- Profesional pero accesible
- Técnico pero visual
- Explorador y curioso

### Voz de Marca
**Tono:** Informativo, preciso, inspirador de exploración.

**Ejemplos de copy:**
- "Explora los mayores campos petroleros de Asia" (CTA principal)
- "Descubre la profundidad de cada pozo" (Hover en profundidad)

### Wordmark & Logo
Logo: Símbolo de brújula + gota de petróleo, círculo minimalista, colores terracota y azul.

### Color de Firma
**Terracota (#c17a4a):** Color único y reconocible que representa la tierra y la industria petrolera.

---

## Decisiones de Estilo

### Mapa
- Estilo base: OpenStreetMap o Google Maps (Light theme)
- Zoom inicial: Vista de Asia completa (zoom 3-4)
- Zoom al pozo: Zoom 12-13 para ver detalles locales

### Sidebar (Lista de Pozos)
- Ancho: 280px en desktop, colapsable en tablet/móvil
- Búsqueda/filtros: Por país, tipo (terrestre/marino), estatus
- Ordenamiento: Por nombre, país o profundidad

### Card de Información
- Ancho: 340px en desktop, full-width en móvil
- Imagen: 100% del ancho, aspect-ratio 16:9
- Información: Nombre, país, estatus, operador, tipo, profundidad, coordenadas

### Responsividad
- Desktop (1280px+): Sidebar + Mapa + Card lado a lado
- Tablet (768px-1279px): Sidebar colapsable, Mapa + Card
- Móvil (< 768px): Mapa full-width, Sidebar y Card como drawers/modales
