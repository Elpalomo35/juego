// ============================================================
// CONTROLADOR: CombateController.js
// ------------------------------------------------------------
// CONCEPTO MVC: CONTROLADOR del combate.
//   FLUJO:
//     1. CombatScene (Vista) llama  ctrl.accion('atacar')
//     2. El controlador delega en el MODELO Combate
//     3. El modelo calcula todo y devuelve su estado
//     4. El controlador lo pasa a la Vista para redibujar
//     5. Al terminar, aplica recompensas (SistemaExperiencia)
//        y marca al enemigo como derrotado en la Zona (Modelo).
//
// El controlador NO calcula danio: eso es del Modelo (ABSTRACCION).
// ============================================================

import { Combate } from '../models/Combate.js';
import { SistemaExperiencia } from '../services/SistemaExperiencia.js';

export class CombateController {
  constructor(jugador, enemigoData, zona) {
    this.jugador     = jugador;
    this.enemigoData = enemigoData;              // {id,x,y,fabricar}
    this.zona        = zona;
    this.enemigo     = enemigoData.fabricar();   // instancia fresca del Modelo
    this.combate     = new Combate(jugador, this.enemigo);
    this.resumenRecompensa = '';
  }

  estado() {
    return this.combate.estado();
  }

  // Unica via de entrada desde la Vista.
  //   tipo: 'atacar' | 'defender' | 'habilidad' | 'objeto' | 'huir'
  accion(tipo, dato = null) {
    const est = this.combate.accionJugador(tipo, dato);
    if (est.terminado) this._resolverFin(est);
    return est;
  }

  _resolverFin(est) {
    if (est.resultado === 'victoria') {
      // LOGICA DE NEGOCIO: aplicar recompensas al Jugador.
      const r = SistemaExperiencia.aplicarRecompensa(this.jugador, est.recompensa);
      this.resumenRecompensa = r.texto;
      this.subidasNivel = r.subidas;
      // LOGICA DE NEGOCIO: el enemigo no reaparece.
      this.zona.marcarEnemigoDerrotado(this.enemigoData.id);
    }
  }

  // Para que la Vista sepa como cerrar la escena.
  get resultado() { return this.combate.resultado; }
  get esJefe()    { return this.enemigo.especie === 'Jefe'; }
}
