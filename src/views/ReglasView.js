// ============================================================
// VISTA: ReglasView.js
// ------------------------------------------------------------
// CONCEPTO MVC: VISTA. Esta clase NO inventa ninguna regla
// nueva: solo hace VISIBLES, en una sola pantalla y en lenguaje
// sencillo, las reglas de negocio que ya estan implementadas
// en los Modelos (Combate.js, Zona.js, Jefe.js, Habilidad.js,
// Esqueleto.js, Inventario.js...). Se abre y se cierra con la
// tecla H desde GameScene.
// ============================================================

import { CONFIG } from '../config.js';

// Cada regla: el texto sencillo + donde vive en el codigo (para
// poder abrir el archivo y mostrarlo durante la exposicion).
const REGLAS = [
  ['La vida nunca baja de 0 ni supera el maximo.', 'Personaje.recibirDanio()'],
  ['Una habilidad necesita energia; luego queda en enfriamiento.', 'Habilidad.sePuedeUsar()'],
  ['De un Jefe no se puede huir.', 'ReglasCombate.puedeHuir()'],
  ['Un esqueleto derrotado resucita UNA vez, con 40% de vida.', 'Esqueleto.intentarResucitar()'],
  ['Al bajar del 50% de vida, un Jefe cambia de fase.', 'Jefe.verificarFase()'],
  ['Un cofre solo se abre una vez.', 'Zona.abrirCofre()'],
  ['Un enemigo derrotado no vuelve a aparecer.', 'Zona.marcarEnemigoDerrotado()'],
  ['La puerta se abre solo si derrotas a TODOS los enemigos.', 'Zona.puertaAbierta()'],
  ['Completar una zona desbloquea la siguiente.', 'SistemaProgreso.completarZona()'],
  ['Un combate largo da algo mas de experiencia y oro.', 'ReglasCombate.calcularRecompensa()']
];

export class ReglasView {
  constructor(scene) {
    this.scene = scene;
    this.abierto = false;
    this.grupo = [];
  }

  // El alto se MIDE a partir del texto real (no un numero fijo), y
  // la "fuente" de cada regla va DEBAJO del texto (no al lado) para
  // que nunca se solape aunque el texto ocupe dos lineas.
  abrir() {
    if (this.abierto) return;
    this.abierto = true;
    const s = this.scene;
    const cx = CONFIG.ANCHO / 2;
    const W = 620;
    const add = o => { this.grupo.push(o.setScrollFactor(0).setDepth(2100)); return o; };

    let y = 24;
    add(s.add.text(cx, y, 'REGLAS DEL JUEGO', {
      fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#ffd166', fontStyle: 'bold' }).setOrigin(0.5));
    y += 26;
    add(s.add.text(cx, y, '(logica de negocio: cada una vive en el Modelo indicado)', {
      fontFamily: 'Trebuchet MS', fontSize: '11px', color: '#7a86b8' }).setOrigin(0.5));
    y += 26;

    REGLAS.forEach(([texto, fuente]) => {
      add(s.add.text(cx - W / 2 + 26, y, '•', { fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#ffd166' }));
      const t = add(s.add.text(cx - W / 2 + 44, y, texto, {
        fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#e8ecff', wordWrap: { width: W - 70 } }));
      y += t.height + 2;
      add(s.add.text(cx - W / 2 + 44, y, fuente, {
        fontFamily: 'Consolas, monospace', fontSize: '10px', color: '#7a86b8' }));
      y += 24;
    });

    const cerrar = add(s.add.text(cx, y + 4, '[ H / ESC / clic para cerrar ]', {
      fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#7a86b8' }).setOrigin(0.5));
    const H = y + 4 + cerrar.height + 20;

    const fondo = s.add.rectangle(cx, H / 2, W, H, 0x0b0d17, 0.97)
      .setStrokeStyle(3, 0xffd166).setScrollFactor(0).setDepth(2099);
    this.grupo.push(fondo);

    // Centra el bloque completo (ya medido) en el canvas.
    const offsetY = (CONFIG.ALTO - H) / 2;
    this.grupo.forEach(o => { o.y += offsetY; });
  }

  cerrar() {
    if (!this.abierto) return;
    this.abierto = false;
    this.grupo.forEach(o => o.destroy());
    this.grupo = [];
  }

  toggle() {
    this.abierto ? this.cerrar() : this.abrir();
  }
}
