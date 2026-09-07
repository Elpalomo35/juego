// ============================================================
// ESCENA: VictoryScene
// ------------------------------------------------------------
// Se muestra al completar la ultima zona (derrotar al Jefe
// Final y cruzar su puerta).
// ============================================================

import Phaser from 'phaser';
import { CONFIG } from '../config.js';

export default class VictoryScene extends Phaser.Scene {
  constructor() { super('VictoryScene'); }

  create() {
    const juego = this.registry.get('juego');
    this.add.rectangle(0, 0, CONFIG.ANCHO, CONFIG.ALTO, 0x081406).setOrigin(0);
    this.add.rectangle(0, 0, CONFIG.ANCHO, CONFIG.ALTO, 0x1a5a2a, 0.25).setOrigin(0);

    this.add.text(CONFIG.ANCHO / 2, 150, 'HAS SALVADO LA ACADEMIA', {
      fontFamily: 'Trebuchet MS', fontSize: '44px', color: '#7CFC98', fontStyle: 'bold'
    }).setOrigin(0.5);

    const j = juego.jugador;
    this.add.text(CONFIG.ANCHO / 2, 240,
      `${j.nombre} el ${j.clase}\nNivel final: ${j.nivel}\nOro reunido: ${j.oro}`, {
      fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#e8ecff', align: 'center'
    }).setOrigin(0.5);

    this.add.text(CONFIG.ANCHO / 2, 360,
      'Conceptos demostrados: Clases y Objetos, Encapsulamiento (#vida),\n' +
      'Herencia (Personaje -> Jugador/Enemigo -> subclases), Polimorfismo (atacar()),\n' +
      'Abstraccion (accionJugador / elegirAccion) y arquitectura MVC.', {
      fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#a8b0d8', align: 'center'
    }).setOrigin(0.5);

    const g = this.add.rectangle(CONFIG.ANCHO / 2, 470, 320, 50, 0x16321c).setStrokeStyle(2, 0x7CFC98).setInteractive({ useHandCursor: true });
    this.add.text(CONFIG.ANCHO / 2, 470, 'VOLVER AL MENU', { fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#dfffe6' }).setOrigin(0.5);
    g.on('pointerdown', () => { juego.progreso.borrar(); this.scene.start('MenuScene'); });
  }
}
