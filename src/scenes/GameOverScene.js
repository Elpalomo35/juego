// ============================================================
// ESCENA: GameOverScene
// ------------------------------------------------------------
// Se muestra cuando el heroe es derrotado en combate.
// Ofrece reintentar (revive con vida completa en la entrada
// de la zona actual) o volver al menu.
// ============================================================

import Phaser from 'phaser';
import { CONFIG } from '../config.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  create() {
    const juego = this.registry.get('juego');
    this.add.rectangle(0, 0, CONFIG.ANCHO, CONFIG.ALTO, 0x140505).setOrigin(0);

    this.add.text(CONFIG.ANCHO / 2, 180, 'HAS CAIDO', {
      fontFamily: 'Trebuchet MS', fontSize: '56px', color: '#ff5252', fontStyle: 'bold'
    }).setOrigin(0.5);

    const j = juego.jugador;
    this.add.text(CONFIG.ANCHO / 2, 250,
      `${j.nombre} el ${j.clase}  -  Nivel ${j.nivel}  -  ${j.oro} oro`, {
      fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#e8ecff'
    }).setOrigin(0.5);

    this._boton(CONFIG.ANCHO / 2, 340, 'REINTENTAR (revives con vida completa)', () => {
      juego.jugador.restaurarTodo();
      juego.ultimaPos = null;
      this.scene.start('GameScene', { zonaId: juego.zonaActualId });
    });

    this._boton(CONFIG.ANCHO / 2, 410, 'Volver al menu principal', () => this.scene.start('MenuScene'));
  }

  _boton(x, y, etiqueta, fn) {
    const g = this.add.rectangle(x, y, 460, 50, 0x2a1414).setStrokeStyle(2, 0xff5252).setInteractive({ useHandCursor: true });
    this.add.text(x, y, etiqueta, { fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#ffdede' }).setOrigin(0.5);
    g.on('pointerover', () => g.setFillStyle(0x3a1c1c));
    g.on('pointerout', () => g.setFillStyle(0x2a1414));
    g.on('pointerdown', fn);
  }
}
