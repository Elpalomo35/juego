// ============================================================
// VISTA: HUDView.js
// ------------------------------------------------------------
// CONCEPTO MVC: VISTA del mapa de exploracion.
//   Dibuja las barras de vida / energia / experiencia,
//   el oro, el nombre de la zona y el contador de enemigos.
//   Se limita a REPRESENTAR el estado que recibe.
// ============================================================

import { CONFIG } from '../config.js';

function barra(scene, x, y, w, h, color) {
  const fondo = scene.add.rectangle(x, y, w, h, 0x000000, 0.5).setOrigin(0).setScrollFactor(0).setStrokeStyle(1, 0xffffff, 0.2);
  // El relleno se escala con scaleX (0..1) desde el borde izquierdo (origin 0).
  const relleno = scene.add.rectangle(x + 1, y + 1, w - 2, h - 2, color).setOrigin(0).setScrollFactor(0);
  return { fondo, relleno };
}

export class HUDView {
  constructor(scene) {
    this.scene = scene;
  }

  crear() {
    const s = this.scene;
    const panel = s.add.rectangle(0, 0, CONFIG.ANCHO, 54, 0x0b0d17, 0.85).setOrigin(0).setScrollFactor(0).setDepth(900);
    panel.setStrokeStyle(1, 0x6c63ff, 0.4);

    this.nombre = s.add.text(12, 6, '', { fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#e8ecff', fontStyle: 'bold' }).setScrollFactor(0).setDepth(901);
    this.vidaBar    = barra(s, 12, 26, 160, 12, 0xff5252);
    this.energiaBar = barra(s, 12, 40, 160, 10, 0x29b6f6);
    this.vidaTxt    = s.add.text(178, 24, '', { fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#e8ecff' }).setScrollFactor(0).setDepth(901);
    this.energiaTxt = s.add.text(178, 39, '', { fontFamily: 'Trebuchet MS', fontSize: '11px', color: '#9fd8f6' }).setScrollFactor(0).setDepth(901);

    this.expBar = barra(s, 320, 30, 180, 10, 0x8b5cf6);
    this.expTxt = s.add.text(320, 14, '', { fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#c9b8ff' }).setScrollFactor(0).setDepth(901);

    this.zonaTxt = s.add.text(CONFIG.ANCHO - 12, 8, '', { fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#ffd166' }).setOrigin(1, 0).setScrollFactor(0).setDepth(901);
    this.enemigosTxt = s.add.text(CONFIG.ANCHO - 12, 28, '', { fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#e8ecff' }).setOrigin(1, 0).setScrollFactor(0).setDepth(901);

    this.aviso = s.add.text(CONFIG.ANCHO / 2, 66, '', { fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#ffd166', backgroundColor: '#0b0d17' })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(901).setPadding(6, 3, 6, 3);
    this.aviso.setAlpha(0);
  }

  actualizar(estadoJugador, zona) {
    const j = estadoJugador;
    this.nombre.setText(`${j.nombre}  (${j.clase})  Nv.${j.nivel}   ${j.oro} oro`);
    this._setBarra(this.vidaBar, j.vida / j.vidaMaxima);
    this._setBarra(this.energiaBar, j.energia / j.energiaMaxima);
    this.vidaTxt.setText(`Vida ${j.vida}/${j.vidaMaxima}`);
    this.energiaTxt.setText(`Energia ${j.energia}/${j.energiaMaxima}`);
    this._setBarra(this.expBar, j.experiencia / j.expSiguiente);
    this.expTxt.setText(`EXP ${j.experiencia}/${j.expSiguiente}`);

    const vivos = zona.enemigosActivos().length;
    this.zonaTxt.setText(`Zona ${zona.id}: ${zona.nombre}`);
    this.enemigosTxt.setText(vivos === 0 ? 'Zona despejada! Busca la puerta' : `Enemigos: ${vivos}/${zona.totalEnemigos()}`);
  }

  mensaje(texto) {
    this.aviso.setText(texto).setAlpha(1);
    this.scene.tweens.add({ targets: this.aviso, alpha: 0, delay: 1600, duration: 600 });
  }

  _setBarra(b, pct) {
    b.relleno.scaleX = Math.max(0, Math.min(1, pct || 0));
  }
}
