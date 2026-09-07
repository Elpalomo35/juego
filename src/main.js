// ============================================================
// PUNTO DE ENTRADA - main.js
// ------------------------------------------------------------
// Aqui se crea la instancia de Phaser y se registran TODAS
// las escenas del juego. Es lo unico que se ejecuta al abrir
// la pagina.
//
// CONCEPTO MVC:
//   - Las ESCENAS de Phaser hacen de Vista + Controlador de
//     presentacion (dibujan y capturan input).
//   - Los MODELOS (carpeta models/) guardan los datos y reglas.
//   - Los CONTROLADORES (carpeta controllers/) coordinan
//     modelos y escenas.
//   - Los SERVICIOS (carpeta services/) contienen reglas de
//     negocio puras y reutilizables.
// ============================================================

import Phaser from 'phaser';
import { CONFIG } from './config.js';

import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import SeleccionPersonajeScene from './scenes/SeleccionPersonajeScene.js';
import GameScene from './scenes/GameScene.js';
import CombatScene from './scenes/CombatScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import VictoryScene from './scenes/VictoryScene.js';

// Oculta el texto "CARGANDO" del index.html en cuanto arranca Phaser
document.getElementById('cargando')?.classList.add('oculto');

const config = {
  type: Phaser.AUTO,               // WebGL si el navegador lo soporta, si no Canvas
  parent: 'game',
  width: CONFIG.ANCHO,
  height: CONFIG.ALTO,
  backgroundColor: CONFIG.COLOR_FONDO,
  pixelArt: false,       // sprites dibujados con formas: mejor con suavizado
  roundPixels: true,
  antialias: true,
  scale: {
    mode: Phaser.Scale.FIT,        // escala el lienzo manteniendo proporcion
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',            // motor de fisica simple: colisiones AABB
    arcade: { debug: false }
  },
  // El ORDEN importa: BootScene se ejecuta primero.
  scene: [
    BootScene,
    MenuScene,
    SeleccionPersonajeScene,
    GameScene,
    CombatScene,
    GameOverScene,
    VictoryScene
  ]
};

// Se crea el juego. A partir de aqui Phaser controla el bucle.
const juego = new Phaser.Game(config);

// Se expone en consola para poder inspeccionar durante la exposicion:
//   window.juego.scene.keys.GameScene
window.juego = juego;
