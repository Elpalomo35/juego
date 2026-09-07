// ============================================================
// VISTA: DialogoView.js
// ------------------------------------------------------------
// CONCEPTO MVC: VISTA. Solo dibuja. No decide nada.
//   Muestra un cuadro de dialogo de NPC y avanza el texto
//   pagina a pagina cuando el jugador pulsa una tecla.
// ============================================================

import { CONFIG } from '../config.js';

export class DialogoView {
  constructor(scene) {
    this.scene = scene;
    this.contenedor = null;
    this.paginas = [];
    this.indice = 0;
    this.onCerrar = null;
    this.activo = false;
  }

  mostrar(nombre, paginas, onCerrar) {
    this.cerrar();
    this.paginas = paginas;
    this.indice = 0;
    this.onCerrar = onCerrar;
    this.activo = true;

    const s = this.scene;
    const w = CONFIG.ANCHO - 80;
    const h = 130;
    const x = 40;
    const y = CONFIG.ALTO - h - 30;

    const fondo = s.add.rectangle(x, y, w, h, 0x0b0d17, 0.94).setOrigin(0).setStrokeStyle(3, 0x6c63ff);
    const titulo = s.add.text(x + 18, y + 12, nombre, { fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#8b5cf6', fontStyle: 'bold' });
    this.texto = s.add.text(x + 18, y + 40, '', { fontFamily: 'Trebuchet MS', fontSize: '17px', color: '#e8ecff', wordWrap: { width: w - 36 } });
    this.pista = s.add.text(x + w - 18, y + h - 22, 'ESPACIO / E para continuar', { fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#7a86b8' }).setOrigin(1, 0);

    this.contenedor = s.add.container(0, 0, [fondo, titulo, this.texto, this.pista]).setDepth(1000).setScrollFactor(0);
    this._pintarPagina();
  }

  _pintarPagina() {
    this.texto.setText(this.paginas[this.indice] || '');
  }

  avanzar() {
    if (!this.activo) return;
    this.indice++;
    if (this.indice >= this.paginas.length) {
      this.cerrar();
      if (this.onCerrar) this.onCerrar();
    } else {
      this._pintarPagina();
    }
  }

  cerrar() {
    this.activo = false;
    if (this.contenedor) { this.contenedor.destroy(); this.contenedor = null; }
  }
}
