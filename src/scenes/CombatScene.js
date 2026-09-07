// ============================================================
// ESCENA: CombatScene  (VISTA del combate por turnos)
// ------------------------------------------------------------
// Se lanza ENCIMA de GameScene (que queda en pausa).
//
// FLUJO MVC:
//   CombateView (boton)  ->  CombatScene._accion()
//     ->  CombateController.accion(tipo)
//         ->  Combate (MODELO) calcula turno jugador + turno enemigo
//     <-  estado nuevo
//   CombatScene  ->  CombateView.actualizar(estado)
//
// Al terminar, pide al JuegoController que resuelva las
// consecuencias y vuelve a GameScene con una "orden".
// ============================================================

import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { CombateController } from '../controllers/CombateController.js';
import { CombateView } from '../views/CombateView.js';

export default class CombatScene extends Phaser.Scene {
  constructor() { super('CombatScene'); }

  init(data) {
    this.enemigoData = data.enemigoData;
    this.zona = data.zona;
  }

  create() {
    const juego = this.registry.get('juego');
    this.juego = juego;

    // CONTROLADOR del combate (crea el MODELO Combate por dentro)
    this.ctrl = new CombateController(juego.jugador, this.enemigoData, this.zona);

    this.vista = new CombateView(this, (tipo, dato) => this._accion(tipo, dato));
    this.vista.crear(this.ctrl.estado(), this.ctrl.esJefe);

    this.finalizado = false;
    this._volviendo = false;
  }

  _accion(tipo, dato) {
    if (this.finalizado || this.vista.bloqueado) return;

    // Estado ANTES de la accion (para saber cuanto dano hizo cada uno).
    const antes = this.ctrl.estado();

    // El MODELO calcula el turno del jugador + el del enemigo de golpe.
    const estado = this.ctrl.accion(tipo, dato);

    const info = {
      tipo,
      dmgEnemigo:  Math.max(0, antes.enemigo.vida - estado.enemigo.vida),
      dmgJugador:  Math.max(0, antes.jugador.vida - estado.jugador.vida),
      curaJugador: Math.max(0, estado.jugador.vida - antes.jugador.vida),
      rondaPaso:   estado.ronda > antes.ronda,   // hubo turno del enemigo
      estado
    };

    // La VISTA reproduce la secuencia animada (ataque + contraataque).
    this.vista.reproducirSecuencia(info, (estFinal) => {
      if (estFinal.terminado) this.time.delayedCall(600, () => this._terminar(estFinal));
      else if (!this.finalizado) this.time.delayedCall(200, () => this.vista.setBloqueado(false));
    });
  }

  _terminar(estado) {
    if (this.finalizado) return;
    this.finalizado = true;

    // Cartel de resultado
    const res = estado.resultado;
    let titulo = 'HAS ESCAPADO';
    let color = '#c9b8ff';
    if (res === 'victoria') { titulo = 'VICTORIA'; color = '#4caf50'; }
    if (res === 'derrota')  { titulo = 'DERROTA'; color = '#ff5252'; }

    const cont = this.add.container(0, 0).setDepth(3000);
    cont.add(this.add.rectangle(CONFIG.ANCHO / 2, CONFIG.ALTO / 2, 520, 220, 0x0b0d17, 0.96).setStrokeStyle(3, 0x6c63ff));
    cont.add(this.add.text(CONFIG.ANCHO / 2, CONFIG.ALTO / 2 - 60, titulo, { fontFamily: 'Trebuchet MS', fontSize: '40px', color, fontStyle: 'bold' }).setOrigin(0.5));
    if (res === 'victoria') {
      cont.add(this.add.text(CONFIG.ANCHO / 2, CONFIG.ALTO / 2 + 4, this.ctrl.resumenRecompensa, {
        fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#ffd166', align: 'center', wordWrap: { width: 470 }
      }).setOrigin(0.5));
    }
    cont.add(this.add.text(CONFIG.ANCHO / 2, CONFIG.ALTO / 2 + 78, 'click para continuar', {
      fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#7a86b8'
    }).setOrigin(0.5));

    this.input.once('pointerdown', () => this._volver());
    this.time.delayedCall(2600, () => this._volver());
  }

  _volver() {
    if (this._volviendo) return;
    this._volviendo = true;

    // El CONTROLADOR PRINCIPAL decide a donde ir.
    const orden = this.juego.resolverCombate(this.ctrl);

    // Devuelve el control a GameScene pasandole la orden.
    this.scene.resume('GameScene', orden);
  }
}
