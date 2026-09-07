// ============================================================
// ESCENA: BootScene
// ------------------------------------------------------------
// Primera escena que se ejecuta.
//   1. Genera todas las texturas por codigo (GeneradorTexturas).
//   2. Crea el JuegoController (estado global) y lo guarda en
//      el "registry" de Phaser para que todas las escenas lo compartan.
//   3. Pasa al menu principal.
// ============================================================

import Phaser from 'phaser';
import { generarTexturas } from '../services/GeneradorTexturas.js';
import { registrarAnimaciones } from '../services/Animaciones.js';
import { JuegoController } from '../controllers/JuegoController.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    generarTexturas(this);
    registrarAnimaciones(this);

    // CONTROLADOR PRINCIPAL: uno solo para toda la partida.
    const juego = new JuegoController();
    this.registry.set('juego', juego);

    this.scene.start('MenuScene');
  }
}
