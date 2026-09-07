// ============================================================
// MODELO: Enemigo.js
// ------------------------------------------------------------
// CONCEPTO POO: HERENCIA    -> extends Personaje
// CONCEPTO POO: ABSTRACCION -> el combate solo llama
//   enemigo.elegirAccion(); no sabe (ni le importa) si por
//   dentro el enemigo decide atacar, defenderse o usar algo.
//
// Anade lo propio de un enemigo:
//   * expRecompensa / oroRecompensa (lo que suelta al morir)
//   * textura (nombre del sprite generado en BootScene)
//   * IA basica en elegirAccion()
// ============================================================

import { Personaje, aleatorio } from './Personaje.js';

export class Enemigo extends Personaje {
  constructor(config) {
    super(config);
    this.especie        = config.especie || 'Enemigo';
    this.expRecompensa  = config.expRecompensa ?? 15;
    this.oroRecompensa  = config.oroRecompensa ?? 10;
    this.textura        = config.textura || 'enemigo';
    this.turnos         = 0;
  }

  // POLIMORFISMO: version base. Goblin, Esqueleto, etc. la reescriben.
  atacar(objetivo) {
    const danio = this._ataque + aleatorio(0, 3);
    return { danio, tipo: 'normal', texto: `${this.nombre} ataca por ${danio}.` };
  }

  // Ataque especial generico (cada especie puede sobreescribirlo).
  _ataqueEspecial(objetivo) {
    const danio = Math.round(this._ataque * 1.5) + aleatorio(0, 5);
    return { danio, tipo: 'especial', texto: `${this.nombre} usa un ataque especial por ${danio}!` };
  }

  // --- IA: ABSTRACCION ------------------------------------
  // El CombatScene solo llama a esto. La decision vive aqui.
  elegirAccion(objetivo) {
    this.turnos++;
    const vidaPct = this.vida / this.vidaMaxima;

    // Con poca vida, a veces se defiende y se cura un poco.
    if (vidaPct < 0.28 && Math.random() < 0.4) {
      this.defender();
      const cura = this.curarse(Math.round(this.vidaMaxima * 0.08));
      return { danio: 0, tipo: 'defensa', texto: `${this.nombre} se cubre y recupera ${cura} de vida.` };
    }

    // Cada 3 turnos intenta el ataque especial.
    if (this.turnos % 3 === 0) {
      return this._ataqueEspecial(objetivo);
    }

    return this.atacar(objetivo);
  }

  estado() {
    return {
      ...super.estado(),
      especie: this.especie,
      textura: this.textura,
      expRecompensa: this.expRecompensa,
      oroRecompensa: this.oroRecompensa
    };
  }
}
