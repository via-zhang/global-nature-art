import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Relative base so the build also works from a subpath (e.g. GitHub Pages).
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    // MapLibre is ~1 MB on its own; keep it in a separate, long-cached chunk.
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        manualChunks: (id) => (id.includes('node_modules/maplibre-gl') ? 'maplibre' : undefined),
      },
    },
  },
})
