// ============================================================
// ESCENA: MenuScene  (VISTA: pantalla de inicio)
// ------------------------------------------------------------
// Muestra el titulo y el boton JUGAR. Si hay una partida
// guardada en localStorage, ofrece "Continuar".
// ============================================================

import Phaser from 'phaser';
import { CONFIG } from '../config.js';

export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const { ANCHO, ALTO } = CONFIG;
    this.add.rectangle(0, 0, ANCHO, ALTO, 0x0b0d17).setOrigin(0);
    this.add.rectangle(0, 0, ANCHO, ALTO, 0x3a1a5a, 0.25).setOrigin(0);

    // decoracion: sprites flotando
    ['goblin', 'esqueleto', 'mago', 'jefe'].forEach((tex, i) => {
      const spr = this.add.image(140 + i * 220, ALTO - 90, tex).setScale(2).setAlpha(0.5);
      this.tweens.add({ targets: spr, y: spr.y - 12, yoyo: true, repeat: -1, duration: 1200 + i * 200 });
    });

    this.add.text(ANCHO / 2, 130, 'CODEQUEST', {
      fontFamily: 'Trebuchet MS', fontSize: '64px', color: '#8b5cf6', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(ANCHO / 2, 185, 'La Academia de Heroes  -  RPG 2D', {
      fontFamily: 'Trebuchet MS', fontSize: '20px', color: '#c9b8ff'
    }).setOrigin(0.5);
    this.add.text(ANCHO / 2, 225, 'POO  -  Herencia  -  Polimorfismo  -  Encapsulamiento  -  Abstraccion  -  MVC', {
      fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#6a74a8'
    }).setOrigin(0.5);

    this._boton(ANCHO / 2, 320, 'NUEVA PARTIDA', () => this.scene.start('SeleccionPersonajeScene'));

    const juego = this.registry.get('juego');
    const guardado = juego.progreso.cargar();
    if (guardado && guardado.jugador) {
      this._boton(ANCHO / 2, 388, `Continuar  (${guardado.jugador.nombre} Nv.${guardado.jugador.nivel})`, () => {
        this.scene.start('SeleccionPersonajeScene', {
          precargar: guardado.jugador,
          zonas: guardado.zonasDesbloqueadas || [1]
        });
      });
      this._boton(ANCHO / 2, 456, 'Borrar partida guardada', () => { juego.progreso.borrar(); this.scene.restart(); }, true);
    }

    this.add.text(ANCHO / 2, ALTO - 24, 'Moverse: WASD o flechas   -   Interactuar: E   -   Combate: teclas 1-5', {
      fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#7a86b8'
    }).setOrigin(0.5);
  }

  _boton(x, y, etiqueta, fn, pequeno = false) {
    const w = pequeno ? 260 : 320;
    const g = this.add.rectangle(x, y, w, pequeno ? 36 : 52, 0x1b2140).setStrokeStyle(2, 0x6c63ff);
    const t = this.add.text(x, y, etiqueta, { fontFamily: 'Trebuchet MS', fontSize: pequeno ? '14px' : '18px', color: '#e8ecff' }).setOrigin(0.5);
    g.setInteractive({ useHandCursor: true });
    g.on('pointerover', () => g.setFillStyle(0x2b3468));
    g.on('pointerout', () => g.setFillStyle(0x1b2140));
    g.on('pointerdown', fn);
    return { g, t };
  }
}
