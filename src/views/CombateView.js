// ============================================================
// VISTA: CombateView.js
// ------------------------------------------------------------
// CONCEPTO MVC: VISTA del combate.
//   * Dibuja enemigo y jugador ANIMADOS, barras de vida/energia,
//     el menu de acciones y el registro de texto.
//   * Reproduce las animaciones de ATAQUE del jugador y de
//     CONTRAATAQUE del enemigo (avance + golpe + retroceso +
//     parpadeo rojo + numero de dano + sacudida de camara).
//   * Cuando el jugador pulsa un boton, AVISA al controlador
//     mediante this.onAccion(tipo, dato). No calcula nada.
// ============================================================

import Phaser from 'phaser';
import { CONFIG } from '../config.js';

export class CombateView {
  constructor(scene, onAccion) {
    this.scene = scene;
    this.onAccion = onAccion;
    this.bloqueado = false;
    this.submenu = null;
  }

  crear(estado, esJefe) {
    const s = this.scene;

    // --- Fondo de arena --------------------------------
    s.add.rectangle(0, 0, CONFIG.ANCHO, CONFIG.ALTO, 0x0b0d17).setOrigin(0);
    s.add.rectangle(0, 0, CONFIG.ANCHO, CONFIG.ALTO / 2, 0x241246, 0.6).setOrigin(0);
    s.add.rectangle(0, CONFIG.ALTO - 210, CONFIG.ANCHO, 210, 0x1a2036).setOrigin(0);
    s.add.rectangle(0, CONFIG.ALTO - 210, CONFIG.ANCHO, 3, 0x6c63ff, 0.5).setOrigin(0);
    for (let i = 0; i < 40; i++) {
      s.add.circle(Math.random() * CONFIG.ANCHO, Math.random() * 260, 1, 0xffffff, Math.random() * 0.5);
    }

    s.add.text(CONFIG.ANCHO / 2, 22, esJefe ? 'COMBATE CONTRA EL JEFE' : 'COMBATE', {
      fontFamily: 'Trebuchet MS', fontSize: '20px', color: esJefe ? '#ff6b6b' : '#c9b8ff', fontStyle: 'bold'
    }).setOrigin(0.5);

    // --- Enemigo (arriba a la derecha) -------------------
    const e = estado.enemigo;
    this.enemigoBase = e.textura;
    this.eneX0 = CONFIG.ANCHO - 210;
    this.eneY0 = 210;
    this.enemigoSombra = s.add.ellipse(this.eneX0, this.eneY0 + 55, 90, 20, 0x000000, 0.3);
    this.enemigoSprite = s.add.sprite(this.eneX0, this.eneY0, `${e.textura}_idle0`)
      .setScale(e.especie === 'Jefe' ? 2.9 : 2.6).setFlipX(true);
    this.enemigoSprite.play(`${e.textura}_idle`);

    this.enemigoNombre = s.add.text(CONFIG.ANCHO - 335, 66, '', { fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#fff', fontStyle: 'bold' });
    s.add.rectangle(CONFIG.ANCHO - 335, 96, 270, 18, 0x000000, 0.6).setOrigin(0).setStrokeStyle(1, 0xffffff, 0.3);
    this.enemigoVida = s.add.rectangle(CONFIG.ANCHO - 334, 97, 268, 16, 0xff5252).setOrigin(0);
    this.enemigoVidaTxt = s.add.text(CONFIG.ANCHO - 200, 105, '', { fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#fff' }).setOrigin(0.5);

    // --- Jugador (abajo a la izquierda) ------------------
    const j = estado.jugador;
    this.jugadorBase = j.textura || 'pj_guerrero';
    this.jugX0 = 170;
    this.jugY0 = CONFIG.ALTO - 250;
    this.jugadorSombra = s.add.ellipse(this.jugX0, this.jugY0 + 62, 96, 22, 0x000000, 0.3);
    this.jugadorSprite = s.add.sprite(this.jugX0, this.jugY0, `${this.jugadorBase}_idle0`).setScale(2.9);
    this.jugadorSprite.play(`${this.jugadorBase}_idle`);

    this.jugadorNombre = s.add.text(40, CONFIG.ALTO - 196, '', { fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#fff', fontStyle: 'bold' });
    s.add.rectangle(40, CONFIG.ALTO - 172, 300, 18, 0x000000, 0.6).setOrigin(0).setStrokeStyle(1, 0xffffff, 0.3);
    this.jVida = s.add.rectangle(41, CONFIG.ALTO - 171, 298, 16, 0x4caf50).setOrigin(0);
    this.jVidaTxt = s.add.text(190, CONFIG.ALTO - 163, '', { fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#fff' }).setOrigin(0.5);
    s.add.rectangle(40, CONFIG.ALTO - 149, 300, 12, 0x000000, 0.6).setOrigin(0).setStrokeStyle(1, 0xffffff, 0.3);
    this.jEn = s.add.rectangle(41, CONFIG.ALTO - 148, 298, 10, 0x29b6f6).setOrigin(0);
    this.jEnTxt = s.add.text(190, CONFIG.ALTO - 149, '', { fontFamily: 'Trebuchet MS', fontSize: '10px', color: '#dff' }).setOrigin(0.5);
    this.escudoTxt = s.add.text(40, CONFIG.ALTO - 127, '', { fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#9fd8f6' });

    // --- Registro de combate ---------------------------
    s.add.rectangle(CONFIG.ANCHO / 2, 250, 430, 130, 0x000000, 0.4).setOrigin(0.5).setStrokeStyle(1, 0x6c63ff, 0.3);
    this.logTxt = s.add.text(CONFIG.ANCHO / 2 - 200, 195, '', {
      fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#d7ddff', wordWrap: { width: 400 }, lineSpacing: 3
    });

    // --- Menu de acciones -----------------------------
    this.menuBotones = [];
    const acciones = [
      { etq: '1  Atacar', fn: () => this._accion('atacar') },
      { etq: '2  Defender', fn: () => this._accion('defender') },
      { etq: '3  Habilidad', fn: () => this._abrirSubmenu('habilidad') },
      { etq: '4  Objeto', fn: () => this._abrirSubmenu('objeto') },
      { etq: '5  Huir', fn: () => this._accion('huir') }
    ];
    acciones.forEach((a, i) => {
      const bx = 420 + (i % 3) * 175;
      const by = CONFIG.ALTO - 150 + Math.floor(i / 3) * 56;
      this.menuBotones.push(this._boton(bx, by, a.etq, a.fn));
    });

    this.pista = s.add.text(CONFIG.ANCHO / 2, CONFIG.ALTO - 22,
      'Usa el raton o las teclas 1-5', { fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#7a86b8' }).setOrigin(0.5);

    this._teclado();
    this.actualizar(estado);
  }

  _boton(x, y, etiqueta, fn) {
    const s = this.scene;
    const g = s.add.rectangle(x, y, 165, 44, 0x1b2140).setOrigin(0).setStrokeStyle(2, 0x6c63ff);
    const t = s.add.text(x + 12, y + 13, etiqueta, { fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#e8ecff' });
    g.setInteractive({ useHandCursor: true });
    g.on('pointerover', () => { if (!this.bloqueado) g.setFillStyle(0x2b3468); });
    g.on('pointerout', () => g.setFillStyle(0x1b2140));
    g.on('pointerdown', () => { if (!this.bloqueado) fn(); });
    return { g, t, fn };
  }

  _teclado() {
    const kb = this.scene.input.keyboard;
    kb.on('keydown-ONE', () => !this.bloqueado && this._accion('atacar'));
    kb.on('keydown-TWO', () => !this.bloqueado && this._accion('defender'));
    kb.on('keydown-THREE', () => !this.bloqueado && this._abrirSubmenu('habilidad'));
    kb.on('keydown-FOUR', () => !this.bloqueado && this._abrirSubmenu('objeto'));
    kb.on('keydown-FIVE', () => !this.bloqueado && this._accion('huir'));
    kb.on('keydown-ESC', () => this._cerrarSubmenu());
  }

  _accion(tipo, dato = null) {
    this._cerrarSubmenu();
    this.onAccion(tipo, dato);
  }

  // ==========================================================
  // SECUENCIA ANIMADA DE UN TURNO COMPLETO
  //   info = { tipo, dmgEnemigo, dmgJugador, curaJugador, rondaPaso, estado }
  //
  // El AVANCE DE ESTADO va por TEMPORIZADORES (fiables); los
  // tweens son solo adorno visual. Aunque un tween se atasque,
  // finish() se ejecuta igual y el combate continua.
  // ==========================================================
  reproducirSecuencia(info, onDone) {
    this.setBloqueado(true);
    const s = this.scene;
    let hecho = false;

    const finish = () => {
      if (hecho) return;
      hecho = true;
      // deja los sprites en un estado limpio pase lo que pase
      this.jugadorSprite.x = this.jugX0; this.enemigoSprite.x = this.eneX0;
      this.jugadorSprite.y = this.jugY0; this.enemigoSprite.y = this.eneY0;
      this.jugadorSprite.clearTint(); this.enemigoSprite.clearTint();
      this.jugadorSprite.play(`${this.jugadorBase}_idle`);
      this.enemigoSprite.play(`${this.enemigoBase}_idle`);
      this.actualizar(info.estado);
      this.setBloqueado(info.estado.terminado);
      onDone(info.estado);
    };

    // --- Paso 1: accion del jugador -----------------
    if (info.tipo === 'atacar' || (info.tipo === 'habilidad' && info.dmgEnemigo > 0)) {
      this._lunge(this.jugadorSprite, this.jugadorBase, this.jugX0, 1);
      s.time.delayedCall(230, () => this._impacto(this.enemigoSprite, this.enemigoBase, info.dmgEnemigo, 1));
    } else if (info.tipo === 'defender') {
      this._gesto(this.jugadorSprite, this.jugadorBase, '#9fd8f6');
      s.time.delayedCall(180, () => this._refrescarBarras());
    } else {
      this._gesto(this.jugadorSprite, this.jugadorBase, info.curaJugador > 0 ? '#7CFC98' : '#ffd166');
      if (info.curaJugador > 0) this._numeroFlotante(this.jugadorSprite.x, this.jugadorSprite.y - 55, `+${info.curaJugador}`, '#7CFC98');
      s.time.delayedCall(180, () => this._refrescarBarras());
    }

    // --- Paso 2: contraataque del enemigo -----------
    const contraataque = !info.estado.terminado && info.rondaPaso;
    if (contraataque) {
      s.time.delayedCall(560, () => {
        if (info.dmgJugador > 0) {
          this._lunge(this.enemigoSprite, this.enemigoBase, this.eneX0, -1);
          s.time.delayedCall(230, () => this._impacto(this.jugadorSprite, this.jugadorBase, info.dmgJugador, -1));
        } else {
          this._gesto(this.enemigoSprite, this.enemigoBase, '#c9b8ff');
        }
      });
      s.time.delayedCall(1180, finish);
    } else {
      s.time.delayedCall(560, finish);
    }

    // red de seguridad: pase lo que pase, se desbloquea
    s.time.delayedCall(2600, finish);
  }

  // avance -> golpe -> retroceso (solo visual)
  _lunge(spr, base, x0, dir) {
    spr.play(`${base}_attack`);
    this.scene.tweens.add({
      targets: spr, x: x0 + 50 * dir, duration: 150, ease: 'Quad.easeIn',
      yoyo: true, hold: 70,
      onComplete: () => { spr.x = x0; spr.play(`${base}_idle`); }
    });
  }

  // gesto en el sitio (defender / habilidad / objeto) - solo visual
  _gesto(spr, base, colorDestello) {
    const y0 = spr.y;
    spr.play(`${base}_attack`);
    spr.setTint(Phaser.Display.Color.HexStringToColor(colorDestello).color);
    this.scene.tweens.add({
      targets: spr, y: y0 - 14, duration: 140, yoyo: true, ease: 'Quad.easeOut',
      onComplete: () => { spr.y = y0; spr.clearTint(); spr.play(`${base}_idle`); }
    });
  }

  _impacto(victima, baseVic, dmg, dir) {
    if (dmg > 0) {
      victima.play(`${baseVic}_hurt`);
      victima.setTintFill(0xff5a5a);
      this.scene.time.delayedCall(150, () => { victima.clearTint(); victima.play(`${baseVic}_idle`); });
      const vx0 = victima.x;
      this.scene.tweens.add({ targets: victima, x: vx0 + 18 * dir, duration: 70, yoyo: true });
      this.scene.cameras.main.shake(150, 0.007);
      this._numeroFlotante(victima.x, victima.y - 55, `-${dmg}`, '#ff6b6b');

      const p = this.scene.add.particles(victima.x, victima.y - 8, 'chispa', {
        speed: { min: 90, max: 230 }, lifespan: 340, quantity: 14,
        scale: { start: 1.1, end: 0 }, tint: [0xffffff, 0xffd166, 0xff8a5a]
      });
      this.scene.time.delayedCall(360, () => p.destroy());
    }
    this._refrescarBarras();
  }

  _numeroFlotante(x, y, txt, color) {
    const t = this.scene.add.text(x, y, txt, {
      fontFamily: 'Trebuchet MS', fontSize: '28px', color, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5).setDepth(2000);
    this.scene.tweens.add({
      targets: t, y: y - 44, alpha: 0, duration: 950, ease: 'Quad.easeOut',
      onComplete: () => t.destroy()
    });
  }

  // barras en tiempo real durante la animacion (lee el estado actual del modelo)
  _refrescarBarras() {
    const est = this.scene.ctrl.estado();
    const e = est.enemigo, j = est.jugador;
    this.enemigoVida.scaleX = Math.max(0, e.vida / e.vidaMaxima);
    this.enemigoVidaTxt.setText(`${e.vida}/${e.vidaMaxima}`);
    this.jVida.scaleX = Math.max(0, j.vida / j.vidaMaxima);
    this.jVidaTxt.setText(`${j.vida}/${j.vidaMaxima}`);
    this.jEn.scaleX = Math.max(0, j.energia / j.energiaMaxima);
    this.jEnTxt.setText(`${j.energia}/${j.energiaMaxima}`);
  }

  _abrirSubmenu(tipo) {
    this._cerrarSubmenu();
    const s = this.scene;
    const estado = this.scene.ctrl.estado();
    const items = tipo === 'habilidad' ? estado.jugador.habilidades : estado.inventario;

    const cont = s.add.container(0, 0).setDepth(1200);
    cont.add(s.add.rectangle(CONFIG.ANCHO / 2, CONFIG.ALTO / 2, 460, 300, 0x0b0d17, 0.97).setStrokeStyle(3, 0x6c63ff));
    cont.add(s.add.text(CONFIG.ANCHO / 2, CONFIG.ALTO / 2 - 125, tipo === 'habilidad' ? 'HABILIDADES' : 'OBJETOS',
      { fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#c9b8ff', fontStyle: 'bold' }).setOrigin(0.5));

    if (!items || items.length === 0) {
      cont.add(s.add.text(CONFIG.ANCHO / 2, CONFIG.ALTO / 2, 'Nada disponible', { fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#aaa' }).setOrigin(0.5));
    }

    (items || []).forEach((it, i) => {
      const y = CONFIG.ALTO / 2 - 85 + i * 52;
      const disp = tipo === 'habilidad' ? it.disponible : it.cantidad > 0;
      const etq = tipo === 'habilidad'
        ? `${it.nombre}  (E:${it.coste}${it.enfriamiento ? `, espera ${it.enfriamiento}` : ''})`
        : `${it.nombre}  x${it.cantidad}`;
      const b = s.add.rectangle(CONFIG.ANCHO / 2, y, 400, 42, disp ? 0x1b2140 : 0x161822).setStrokeStyle(2, disp ? 0x6c63ff : 0x333850);
      const t = s.add.text(CONFIG.ANCHO / 2 - 185, y - 13, etq, { fontFamily: 'Trebuchet MS', fontSize: '14px', color: disp ? '#e8ecff' : '#666' });
      const d = s.add.text(CONFIG.ANCHO / 2 - 185, y + 4, it.descripcion || '', { fontFamily: 'Trebuchet MS', fontSize: '10px', color: '#8890b5' });
      cont.add([b, t, d]);
      if (disp) {
        b.setInteractive({ useHandCursor: true });
        b.on('pointerover', () => b.setFillStyle(0x2b3468));
        b.on('pointerout', () => b.setFillStyle(0x1b2140));
        b.on('pointerdown', () => this._accion(tipo, i));
      }
    });

    const cerrar = s.add.text(CONFIG.ANCHO / 2, CONFIG.ALTO / 2 + 128, 'ESC / cerrar', { fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#7a86b8' }).setOrigin(0.5);
    cerrar.setInteractive({ useHandCursor: true }).on('pointerdown', () => this._cerrarSubmenu());
    cont.add(cerrar);
    this.submenu = cont;
  }

  _cerrarSubmenu() {
    if (this.submenu) { this.submenu.destroy(); this.submenu = null; }
  }

  actualizar(estado) {
    const e = estado.enemigo, j = estado.jugador;
    this.enemigoNombre.setText(`${e.nombre}  Nv.${e.nivel}`);
    this.enemigoVida.scaleX = Math.max(0, e.vida / e.vidaMaxima);
    this.enemigoVidaTxt.setText(`${e.vida}/${e.vidaMaxima}`);
    this.enemigoSprite.setAlpha(e.vivo ? 1 : 0.3);
    this.enemigoSombra.setAlpha(e.vivo ? 0.3 : 0.1);

    this.jugadorNombre.setText(`${j.nombre}  Nv.${j.nivel}`);
    this.jVida.scaleX = Math.max(0, j.vida / j.vidaMaxima);
    this.jVidaTxt.setText(`${j.vida}/${j.vidaMaxima}`);
    this.jEn.scaleX = Math.max(0, j.energia / j.energiaMaxima);
    this.jEnTxt.setText(`${j.energia}/${j.energiaMaxima}`);
    this.escudoTxt.setText(estado.escudo > 0 ? `Escudo activo: ${estado.escudo}` : (j.defendiendo ? 'En guardia' : ''));

    this.logTxt.setText(estado.registro.slice(-5).join('\n'));
  }

  setBloqueado(v) {
    this.bloqueado = v;
    this.menuBotones.forEach(b => b.g.setAlpha(v ? 0.4 : 1));
    if (this.pista) this.pista.setText(v ? '...' : 'Usa el raton o las teclas 1-5');
  }
}
