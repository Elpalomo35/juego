// ============================================================
// ESCENA: SeleccionPersonajeScene  (VISTA: crear personaje)
// ------------------------------------------------------------
// El jugador escribe su nombre y elige una CLASE.
// Al confirmar, pide al JuegoController que cree el MODELO
// del heroe (Guerrero / Mago / Arquero) y arranca GameScene.
//
// CONCEPTO POO: la eleccion de clase decide QUE subclase de
//   Jugador se instancia (polimorfismo desde la creacion).
// ============================================================

import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { JugadorController } from '../controllers/JugadorController.js';

export default class SeleccionPersonajeScene extends Phaser.Scene {
  constructor() { super('SeleccionPersonajeScene'); }

  init(data) {
    this.precargar = data && data.precargar ? data.precargar : null;
    this.zonasPrecarga = data && data.zonas ? data.zonas : [1];
  }

  create() {
    const { ANCHO } = CONFIG;
    this.add.rectangle(0, 0, ANCHO, CONFIG.ALTO, 0x0b0d17).setOrigin(0);

    this.add.text(ANCHO / 2, 50, 'CREA TU HEROE', {
      fontFamily: 'Trebuchet MS', fontSize: '34px', color: '#8b5cf6', fontStyle: 'bold'
    }).setOrigin(0.5);

    // --- Campo de nombre (capturado por teclado) --------
    this.nombre = this.precargar ? this.precargar.nombre : '';
    this.add.text(ANCHO / 2, 110, 'Nombre (escribe con el teclado):', {
      fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#c9b8ff'
    }).setOrigin(0.5);
    this.campo = this.add.rectangle(ANCHO / 2, 145, 320, 40, 0x1b2140).setStrokeStyle(2, 0x6c63ff);
    this.campoTxt = this.add.text(ANCHO / 2, 145, '', { fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#fff' }).setOrigin(0.5);

    this.input.keyboard.on('keydown', (ev) => {
      if (ev.key === 'Backspace') this.nombre = this.nombre.slice(0, -1);
      else if (ev.key === 'Enter') this._confirmar();
      else if (ev.key.length === 1 && this.nombre.length < 14 && /[a-zA-Z0-9 ]/.test(ev.key)) this.nombre += ev.key;
      this._pintarNombre();
    });
    this._pintarNombre();

    // --- Tarjetas de clase -----------------------------
    this.claseSel = this.precargar ? this.precargar.clase : 'Guerrero';
    this.tarjetas = {};
    const clases = JugadorController.clasesDisponibles();
    clases.forEach((c, i) => {
      const x = ANCHO / 2 + (i - 1) * 270;
      const y = 320;
      const card = this.add.rectangle(x, y, 240, 210, 0x161a2b).setStrokeStyle(3, 0x333850);
      card.setInteractive({ useHandCursor: true });
      const spr = this.add.image(x, y - 55, this._tex(c.clase)).setScale(2);
      const nom = this.add.text(x, y - 5, c.clase, { fontFamily: 'Trebuchet MS', fontSize: '20px', color: '#e8ecff', fontStyle: 'bold' }).setOrigin(0.5);
      const des = this.add.text(x, y + 55, c.resumen, {
        fontFamily: 'Trebuchet MS', fontSize: '11px', color: '#9aa4cf', wordWrap: { width: 210 }, align: 'center'
      }).setOrigin(0.5);
      card.on('pointerdown', () => { this.claseSel = c.clase; this._pintarClases(); });
      this.tarjetas[c.clase] = card;
    });
    this._pintarClases();

    // --- Boton confirmar ------------------------------
    const b = this.add.rectangle(ANCHO / 2, 500, 300, 50, 0x1b2140).setStrokeStyle(2, 0x6c63ff).setInteractive({ useHandCursor: true });
    this.add.text(ANCHO / 2, 500, 'COMENZAR AVENTURA  (Enter)', { fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#e8ecff' }).setOrigin(0.5);
    b.on('pointerover', () => b.setFillStyle(0x2b3468));
    b.on('pointerout', () => b.setFillStyle(0x1b2140));
    b.on('pointerdown', () => this._confirmar());

    this.aviso = this.add.text(ANCHO / 2, 545, '', { fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#ff8080' }).setOrigin(0.5);
  }

  _tex(clase) { return clase === 'Mago' ? 'pj_mago' : (clase === 'Arquero' ? 'pj_arquero' : 'pj_guerrero'); }

  _pintarNombre() {
    this.campoTxt.setText(this.nombre + (this.time.now % 1000 < 500 ? '|' : ''));
  }

  _pintarClases() {
    Object.entries(this.tarjetas).forEach(([clase, card]) => {
      card.setStrokeStyle(3, clase === this.claseSel ? 0x8b5cf6 : 0x333850);
      card.setFillStyle(clase === this.claseSel ? 0x22284a : 0x161a2b);
    });
  }

  update() { this._pintarNombre(); }

  _confirmar() {
    if (!this.nombre.trim()) { this.aviso.setText('Escribe un nombre para tu heroe.'); return; }

    const juego = this.registry.get('juego');
    juego.nuevaPartida(this.claseSel, this.nombre);

    // Si venia de "Continuar", recupera nivel / oro / zonas.
    if (this.precargar) {
      for (let n = 1; n < (this.precargar.nivel || 1); n++) juego.jugador.subirNivel();
      juego.jugador.ganarOro(this.precargar.oro || 0);
      this.zonasPrecarga.forEach(z => juego.progreso.zonasDesbloqueadas.add(z));
      juego.progreso.guardar(juego.jugador);
    }

    this.scene.start('GameScene', { zonaId: 1 });
  }
}
