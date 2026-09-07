// ============================================================
// ESCENA: GameScene  (VISTA + control de exploracion)
// ------------------------------------------------------------
// Aqui se EXPLORA el mapa:
//   * mover al heroe con WASD / flechas (fisica arcade)
//   * chocar con muros
//   * tocar un enemigo  -> lanza CombatScene
//   * pulsar E junto a un cofre / NPC / puerta -> interactuar
//
// El MODELO de la zona (clase Zona) dice que hay y donde.
// Esta escena solo lo DIBUJA y traduce el input en llamadas
// al JuegoController.
// ============================================================

import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { HUDView } from '../views/HUDView.js';
import { DialogoView } from '../views/DialogoView.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init(data) {
    this.datosEntrada = data || {};
  }

  create() {
    this.juego = this.registry.get('juego');

    if (this.datosEntrada.zonaId && this.juego.zonaActualId !== this.datosEntrada.zonaId) {
      this.juego.cambiarZona(this.datosEntrada.zonaId);
    }
    this.zona = this.juego.zonaActual();

    // La instancia de la escena se reutiliza al reiniciar: hay que
    // descartar la referencia al grupo de la ejecucion anterior
    // (ya destruido) para no llamar .clear() sobre un grupo muerto.
    this.enemigos = null;

    this._dibujarMapa();
    this._crearJugador();
    this._crearEnemigos();
    this._crearCofres();
    this._crearNPCs();
    this._crearPuerta();

    // overlap jugador-enemigos: se registra UNA sola vez sobre el grupo.
    this.physics.add.overlap(this.jugador, this.enemigos, (j, e) => this._chocarEnemigo(e));

    this.hud = new HUDView(this);
    this.hud.crear();
    this.dialogo = new DialogoView(this);

    // --- Input --------------------------------------
    this.cursores = this.input.keyboard.createCursorKeys();
    this.teclas = this.input.keyboard.addKeys('W,A,S,D,E');
    this.input.keyboard.on('keydown-E', () => this._interactuar());
    this.input.keyboard.on('keydown-SPACE', () => { if (this.dialogo.activo) this.dialogo.avanzar(); });

    // --- Volver del combate -------------------------
    // off()+on() con la MISMA referencia para no acumular listeners
    // cuando la escena se reinicia al cambiar de zona.
    if (!this._onResume) this._onResume = (sys, orden) => this._trasCombate(orden);
    this.events.off('resume', this._onResume);
    this.events.on('resume', this._onResume);

    this.inmunidad = 0;
    this._cruzando = false;   // se reinicia en cada entrada de zona

    // Cartel de entrada a la zona
    this._cartelZona();
  }

  // ---------------------------------------------------
  _dibujarMapa() {
    const T = CONFIG.TILE;
    const { anchoTiles, altoTiles } = this.zona;

    // suelo
    for (let y = 0; y < altoTiles; y++) {
      for (let x = 0; x < anchoTiles; x++) {
        this.add.image(x * T, y * T, (x + y) % 2 ? 'suelo' : 'sueloAlt').setOrigin(0);
      }
    }

    // muros: grupo estatico con fisica
    this.muros = this.physics.add.staticGroup();
    const poner = (tx, ty) => {
      const m = this.muros.create(tx * T + T / 2, ty * T + T / 2, 'muro');
      m.refreshBody();
    };
    // borde
    for (let x = 0; x < anchoTiles; x++) { poner(x, 0); poner(x, altoTiles - 1); }
    for (let y = 0; y < altoTiles; y++) { poner(0, y); poner(anchoTiles - 1, y); }
    // obstaculos internos
    this.zona.obstaculos.forEach(o => {
      for (let dy = 0; dy < o.h; dy++)
        for (let dx = 0; dx < o.w; dx++)
          poner(o.x + dx, o.y + dy);
    });

    this.physics.world.setBounds(0, 0, anchoTiles * T, altoTiles * T);
    this.cameras.main.setBounds(0, 0, anchoTiles * T, altoTiles * T);
  }

  _tilePos(tx, ty) {
    const T = CONFIG.TILE;
    return { x: tx * T + T / 2, y: ty * T + T / 2 };
  }

  _crearJugador() {
    const pos = this.juego.ultimaPos && this.juego.ultimaPosZona === this.zona.id
      ? this.juego.ultimaPos
      : this._tilePos(this.zona.entrada.x, this.zona.entrada.y);

    this.baseJugador = this.juego.jugador.textura || 'pj_guerrero';
    this.jugador = this.physics.add.sprite(pos.x, pos.y, `${this.baseJugador}_idle0`);
    this.jugador.setScale(0.62);
    this.jugador.play(`${this.baseJugador}_idle`);
    this.jugador.setCollideWorldBounds(true);
    this.jugador.body.setSize(34, 26);
    this.jugador.body.setOffset(21, 34);
    this.physics.add.collider(this.jugador, this.muros);
    this.cameras.main.startFollow(this.jugador, true, 0.15, 0.15);
  }

  _crearEnemigos() {
    // Grupo estatico: el overlap con el jugador (dinamico) es fiable.
    if (!this.enemigos) this.enemigos = this.physics.add.staticGroup();
    else this.enemigos.clear(true, true);
    this.zona.enemigosActivos().forEach(ed => {
      const p = this._tilePos(ed.x, ed.y);
      const base = ed.fabricar().textura;
      const spr = this.enemigos.create(p.x, p.y, `${base}_idle0`);
      spr.setScale(base === 'jefe' ? 0.8 : 0.62);
      spr.setData('ed', ed);
      spr.setData('base', base);
      spr.play(`${base}_idle`);
      spr.refreshBody();
      spr.body.setSize(34, 26);
      spr.body.setOffset(21, 34);
      spr.refreshBody();
    });
  }

  _crearCofres() {
    this.cofres = this.add.group();
    this.zona.cofresDisponibles().forEach(c => {
      const p = this._tilePos(c.x, c.y);
      const spr = this.add.image(p.x, p.y, 'cofre').setData('c', c);
      this.cofres.add(spr);
    });
  }

  _crearNPCs() {
    this.npcSprites = [];
    this.zona.npcs.forEach(n => {
      const p = this._tilePos(n.x, n.y);
      const spr = this.add.sprite(p.x, p.y, 'npc_idle0').setScale(0.62).setData('n', n);
      spr.play('npc_idle');
      this.npcSprites.push(spr);
      const marca = this.add.text(p.x, p.y - 30, '!', { fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#ffd166', fontStyle: 'bold' }).setOrigin(0.5);
      this.tweens.add({ targets: marca, y: marca.y - 5, yoyo: true, repeat: -1, duration: 600 });
    });
  }

  _crearPuerta() {
    const p = this._tilePos(this.zona.puerta.x, this.zona.puerta.y);
    this.puerta = this.add.image(p.x, p.y, this.zona.puertaAbierta() ? 'puerta_abierta' : 'puerta');
  }

  // ---------------------------------------------------
  update(time) {
    if (!this.jugador) return;
    const v = CONFIG.VELOCIDAD_JUGADOR;
    const t = this.teclas;
    let vx = 0, vy = 0;

    if (this.cartelAbierto || this.dialogo.activo) { this.jugador.setVelocity(0, 0); return; }

    if (this.cursores.left.isDown || t.A.isDown) vx = -v;
    else if (this.cursores.right.isDown || t.D.isDown) vx = v;
    if (this.cursores.up.isDown || t.W.isDown) vy = -v;
    else if (this.cursores.down.isDown || t.S.isDown) vy = v;

    this.jugador.setVelocity(vx, vy);
    if (vx && vy) this.jugador.body.velocity.normalize().scale(v);

    // animacion segun se mueva o no + mirar a la direccion
    const moviendo = vx !== 0 || vy !== 0;
    const claveActual = this.jugador.anims.currentAnim && this.jugador.anims.currentAnim.key;
    if (moviendo) {
      if (vx < 0) this.jugador.setFlipX(true);
      else if (vx > 0) this.jugador.setFlipX(false);
      if (claveActual !== `${this.baseJugador}_walk`) this.jugador.play(`${this.baseJugador}_walk`);
    } else if (claveActual !== `${this.baseJugador}_idle`) {
      this.jugador.play(`${this.baseJugador}_idle`);
    }

    // los enemigos miran hacia el jugador
    this.enemigos.getChildren().forEach(e => e.setFlipX(this.jugador.x < e.x));

    // puerta abierta: cruzar por contacto
    if (this.zona.puertaAbierta() &&
        Phaser.Math.Distance.Between(this.jugador.x, this.jugador.y, this.puerta.x, this.puerta.y) < 34) {
      this._cruzarPuerta();
    }

    this.hud.actualizar(this.juego.jugador.estado(), this.zona);
  }

  // ---------------------------------------------------
  _chocarEnemigo(spr) {
    if (this.cartelAbierto) return;
    if (this.time.now < this.inmunidad) return;
    const ed = spr.getData('ed');
    if (!ed) return;

    // Guarda la posicion para volver al mismo sitio tras el combate.
    this.juego.ultimaPos = { x: this.jugador.x, y: this.jugador.y };
    this.juego.ultimaPosZona = this.zona.id;

    this.jugador.setVelocity(0, 0);
    this.scene.pause();
    this.scene.launch('CombatScene', { enemigoData: ed, zona: this.zona });
  }

  _trasCombate(orden) {
    if (!orden) return;

    if (orden.ir === 'GameOverScene') {
      this.scene.stop('CombatScene');
      this.scene.stop();
      this.scene.start('GameOverScene');
      return;
    }
    if (orden.ir === 'VictoryScene') {
      this.scene.stop('CombatScene');
      this.scene.stop();
      this.scene.start('VictoryScene');
      return;
    }

    this.scene.stop('CombatScene');
    // rehace enemigos vivos (el enemigo derrotado ya no aparece)
    this._crearEnemigos();
    if (this.zona.puertaAbierta()) this.puerta.setTexture('puerta_abierta');
    this.inmunidad = this.time.now + 900;

    if (orden.zonaLimpiada) this.hud.mensaje('Zona despejada! La puerta se ha abierto.');
    this._separarDeEnemigos();
  }

  _separarDeEnemigos() {
    // empuja al jugador 1 casilla hacia la entrada para no re-chocar
    const e = this._tilePos(this.zona.entrada.x, this.zona.entrada.y);
    const ang = Phaser.Math.Angle.Between(this.jugador.x, this.jugador.y, e.x, e.y);
    this.jugador.x += Math.cos(ang) * 20;
    this.jugador.y += Math.sin(ang) * 20;
  }

  // ---------------------------------------------------
  _interactuar() {
    if (this.cartelAbierto) return;
    if (this.dialogo.activo) { this.dialogo.avanzar(); return; }
    const cerca = (spr) => Phaser.Math.Distance.Between(this.jugador.x, this.jugador.y, spr.x, spr.y) < 56;

    // NPC
    for (const npc of this.npcSprites) {
      if (cerca(npc)) {
        const n = npc.getData('n');
        this.dialogo.mostrar(n.nombre, n.dialogo);
        return;
      }
    }
    // Cofre
    for (const cofre of this.cofres.getChildren()) {
      if (cerca(cofre)) {
        const c = cofre.getData('c');
        const texto = this.juego.abrirCofre(c.id);
        cofre.setTexture('cofre_abierto');
        cofre.setData('c', null);
        this.hud.mensaje(texto ? `Cofre: ${texto}` : 'Cofre vacio.');
        return;
      }
    }
    this.hud.mensaje('No hay nada con que interactuar aqui.');
  }

  _cruzarPuerta() {
    if (this._cruzando) return;
    this._cruzando = true;
    const r = this.juego.cruzarPuerta();
    if (r.victoria) { this.scene.start('VictoryScene'); return; }
    this.juego.ultimaPos = null;
    this.cameras.main.fadeOut(250);
    this.time.delayedCall(280, () => this.scene.restart({ zonaId: r.nuevaZona }));
  }

  // Cartel de la zona: briefing completo (historia + concepto POO +
  // ejemplo de codigo + objetivo). PERMANECE hasta que el jugador
  // lo cierra con tecla o clic. Congela el movimiento mientras.
  _cartelZona() {
    this.cameras.main.fadeIn(250);
    this.cartelAbierto = true;

    const b = this.zona.briefing || {
      historia: '', concepto: this.zona.concepto || '', ejemplo: '',
      objetivo: `Derrota a los ${this.zona.totalEnemigos()} enemigos para abrir la puerta.`
    };
    const cx = CONFIG.ANCHO / 2;
    const W = 660, H = 440;
    const x0 = cx - W / 2;
    let y = CONFIG.ALTO / 2 - H / 2;
    const grupo = [];
    const add = o => { grupo.push(o.setScrollFactor(0).setDepth(2000)); return o; };

    add(this.add.rectangle(cx, CONFIG.ALTO / 2, W, H, 0x0b0d17, 0.97).setStrokeStyle(3, 0x6c63ff));

    add(this.add.text(cx, y + 26, `ZONA ${this.zona.id}  ·  ${this.zona.nombre}`, {
      fontFamily: 'Trebuchet MS', fontSize: '22px', color: '#8b5cf6', fontStyle: 'bold' }).setOrigin(0.5));
    y += 52;

    const seccion = (etiqueta, texto, color, mono) => {
      add(this.add.text(x0 + 30, y, etiqueta, {
        fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#7a86b8', fontStyle: 'bold' }));
      y += 16;
      const t = add(this.add.text(x0 + 30, y, texto, {
        fontFamily: mono ? 'Consolas, monospace' : 'Trebuchet MS',
        fontSize: mono ? '12px' : '14px', color, wordWrap: { width: W - 60 }, lineSpacing: 3 }));
      y += t.height + 16;
    };

    seccion('HISTORIA', b.historia, '#e8ecff');
    seccion('CONCEPTO DE POO', b.concepto, '#c9b8ff');
    if (b.ejemplo) {
      add(this.add.rectangle(cx, y + 4, W - 50, 1, 0x333850).setOrigin(0.5));
      seccion('EN EL CODIGO', b.ejemplo, '#9be7a8', true);
    }
    seccion('OBJETIVO', b.objetivo, '#ffd166');

    const cerrar = add(this.add.text(cx, CONFIG.ALTO / 2 + H / 2 - 24,
      '[ Pulsa cualquier tecla o haz clic para empezar ]', {
      fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#7a86b8' }).setOrigin(0.5));
    this.tweens.add({ targets: cerrar, alpha: 0.3, yoyo: true, repeat: -1, duration: 700 });

    const cerrarCartel = () => {
      if (!this.cartelAbierto) return;
      this.cartelAbierto = false;
      grupo.forEach(o => o.destroy());
    };
    this.input.keyboard.once('keydown', cerrarCartel);
    this.input.once('pointerdown', cerrarCartel);
  }
}
