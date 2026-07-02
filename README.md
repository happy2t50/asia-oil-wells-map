# Pozos de Asia — Mapa Interactivo de Perforación Petrolera

Aplicación web que visualiza **887 pozos de perforación** en Asia sobre un mapa
interactivo (Leaflet + OpenStreetMap). Permite buscar, filtrar por tipo y
estatus, agrupar pozos cercanos en clústeres y ver la ficha técnica de cada
pozo.

🌐 **Demo en vivo:** https://happy2t50.github.io/asia-oil-wells-map/

---

## ✨ Características

- **Mapa Leaflet** con agrupación de marcadores (clustering) para buen
  rendimiento con cientos de pozos.
- **Filtros que afectan al mapa y a la lista:** tipo (Terrestre / Costa afuera)
  y estatus (En perforación / Activo / Inactivo).
- **Colores por estatus:** 🟠 En perforación · 🟡 Activo · ⚪ Inactivo.
- **Ficha de detalle** con marca del operador, datos técnicos y panel
  **retráctil**.
- **Responsivo:** barra lateral fija en escritorio; en móvil, lista y filtros
  en un panel deslizante (drawer).
- **Panel de ayuda** que explica la simbología.
- **Datos servidos aparte** (`wells.json`) y cargados de forma diferida.

---

## 🧰 Requisitos previos

| Herramienta       | Versión recomendada                     | Notas                                     |
| ----------------- | ---------------------------------------- | ----------------------------------------- |
| **Node.js** | **20 LTS** o superior (mínimo 18) | Vite 7 requiere Node ≥ 18.               |
| **npm**     | 9 o superior (viene con Node)            | Gestor de paquetes usado por el proyecto. |
| **Git**     | cualquiera reciente                      | Para clonar y desplegar.                  |

Verifica tus versiones:

```bash
node -v
npm -v
```

---

## 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/happy2t50/asia-oil-wells-map.git
cd asia-oil-wells-map

# 2. Instalar dependencias
npm install --legacy-peer-deps
```

> ⚠️ **Importante:** usa siempre `--legacy-peer-deps`.
> Una dependencia de desarrollo (`@builder.io/vite-plugin-jsx-loc`) declara un
> *peer* de Vite 4/5, pero el proyecto usa Vite 7. El flag evita que `npm`
> bloquee la instalación por ese conflicto (no afecta al funcionamiento).

---

## 💻 Ejecutar en desarrollo

```bash
npm run dev
```

- Abre **http://localhost:3000**
- Recarga en caliente (HMR) activada.
- El mapa carga los datos desde `client/public/data/wells.json`.

---

## 🏗️ Compilar (build de producción)

```bash
npm run build
```

Esto genera el sitio estático en **`dist/public/`** (y además empaqueta el
servidor Express opcional en `dist/`, que no se usa para el despliegue estático).

Si solo quieres el frontend:

```bash
npx vite build
```

### Ruta base (`VITE_BASE`)

Por defecto el sitio se sirve desde la raíz (`/`). Para **GitHub Pages de
proyecto** (que sirve bajo `/<repo>/`) hay que indicar la base:

```bash
# Ejemplo para GitHub Pages
VITE_BASE=/asia-oil-wells-map/ npx vite build
```

En Windows PowerShell:

```powershell
$env:VITE_BASE = "/asia-oil-wells-map/"; npx vite build
```

> En **Vercel/Netlify** o dominio propio no necesitas `VITE_BASE` (queda en `/`).

---

## 👀 Previsualizar el build

```bash
npm run preview
```

Sirve localmente el contenido ya compilado de `dist/public/`.

---

## ✅ Verificación de tipos

```bash
npm run check      # tsc --noEmit (sin errores = OK)
```

---

## 📁 Estructura del proyecto

```
asia-oil-wells-map/
├─ client/
│  ├─ index.html                 # HTML raíz
│  ├─ public/
│  │  └─ data/wells.json         # 887 pozos (datos, carga diferida)
│  └─ src/
│     ├─ App.tsx                 # Rutas (wouter) + base de router
│     ├─ main.tsx                # Punto de entrada React
│     ├─ index.css               # Tema y tokens de color (Tailwind v4)
│     ├─ components/
│     │  ├─ OilWellsMapSplit.tsx # Componente principal (mapa + layout)
│     │  ├─ WellsList.tsx        # Lista lateral con búsqueda y filtros
│     │  ├─ WellCard.tsx         # Ficha de detalle del pozo
│     │  ├─ HelpDialog.tsx       # Panel de ayuda / simbología
│     │  ├─ BrandHeader.tsx      # Logo y título
│     │  └─ ui/                  # Componentes shadcn/ui
│     ├─ data/wells.ts           # Tipos + cargador loadWells()
│     ├─ lib/wellStyle.ts        # Colores por estatus + avatar de operador
│     └─ styles/map.css          # Estilos de Leaflet, clústeres y marcadores
├─ .github/workflows/deploy.yml  # CI: build + deploy a GitHub Pages
├─ vite.config.ts                # Config de Vite (base, alias, plugins)
├─ vercel.json                   # Config alternativa para Vercel
└─ package.json
```

---

## 🗂️ Sobre los datos

- Los **887 pozos** están en `client/public/data/wells.json` y se cargan de
  forma diferida (no van en el bundle de JS).
- Cada pozo tiene: nombre, país, coordenadas, estatus, operador, tipo,
  profundidad, año de inicio y descripción.
- El campo **`tipo`** (Terrestre / Costa afuera) fue **verificado contra la
  geografía real** (costas de Natural Earth) para que coincida con la ubicación:
  los terrestres caen en tierra y los de costa afuera en el agua.
- Algunos datos son **aproximados o de referencia** (proyecto educativo): la
  información detallada de pozos no suele ser de acceso público.

---

## 🎨 Tecnologías

- **React 19** + **TypeScript** + **Vite 7**
- **Tailwind CSS v4** + **shadcn/ui** (Radix)
- **Leaflet** + **leaflet.markercluster** (mapa y clústeres)
- **wouter** (enrutado ligero)
- **lucide-react** (iconografía)

---

## ☁️ Despliegue

### GitHub Pages (configurado)

El repositorio incluye un workflow (`.github/workflows/deploy.yml`) que, en cada
push a `main`:

1. Instala dependencias (`npm install --legacy-peer-deps`).
2. Define `VITE_BASE=/<repo>/` automáticamente.
3. Compila (`vite build`) y publica `dist/public` en GitHub Pages.

> La primera vez hay que activar Pages en **Settings → Pages → Build and
> deployment → Source: GitHub Actions**.

### Vercel / Netlify (alternativa)

El archivo `vercel.json` ya define el build (`vite build`), el directorio de
salida (`dist/public`) y el *rewrite* para SPA. Basta con importar el repo; no
requiere `VITE_BASE`.

---

## 📄 Licencia

MIT
