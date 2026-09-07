import { defineConfig } from 'vite';

// ============================================================
// CONFIGURACION DE VITE
// ------------------------------------------------------------
// Vite es la herramienta que:
//   - levanta un servidor local mientras desarrollas (npm run dev)
//   - empaqueta el juego para publicarlo (npm run build -> carpeta dist/)
//
// base: './'  -> hace que las rutas de los archivos sean RELATIVAS.
//   Es imprescindible para que el juego funcione en GitHub Pages
//   (donde la URL es usuario.github.io/nombre-repo/ y no la raiz).
// ============================================================
export default defineConfig({
  base: './',
  server: {
    open: true,   // abre el navegador automaticamente al hacer npm run dev
    port: 5173
  },
  build: {
    outDir: 'dist',
    target: 'es2020'
  }
});
