import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setWorkerUrl } from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import 'maplibre-gl/dist/maplibre-gl.css'
import './index.css'
import App from './App.jsx'

// MapLibre finds its worker relative to its own file at runtime, which Vite
// can't follow, so the worker is missing from the build. Point it at the copy
// Vite emits. (Raster tiles work without it; GeoJSON lines don't.)
setWorkerUrl(maplibreWorkerUrl)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
