// ============================================================
// MODELO: Jefe.js
// ------------------------------------------------------------
// HERENCIA EN CADENA:  Jefe -> Enemigo -> Personaje
// POLIMORFISMO: atacar() con probabilidad de critico alta.
// LOGICA DE NEGOCIO:
//   * FASES: al bajar del 50% de vida entra en Fase 2 y su
//     ataque aumenta un 40%.
//   * De un Jefe NO se puede huir (lo controla el modelo Combate).
// ============================================================

import { Enemigo } from './Enemigo.js';
import { aleatorio } from './Personaje.js';

export class Jefe extends Enemigo {
  constructor(nombre = 'Senor de las Sombras', config = {}) {
    super({
      nombre,
      especie: 'Jefe',
      vida: config.vida ?? 210,
      ataque: config.ataque ?? 24,
      defensa: config.defensa ?? 14,
      energia: 100,
      expRecompensa: config.expRecompensa ?? 120,
      oroRecompensa: config.oroRecompensa ?? 90,
      textura: 'jefe'
    });
    this.fase = 1;
    this.ataquesEspeciales = ['Tormenta de Sombras', 'Golpe Devastador', 'Rugido de Terror'];
  }

  // LOGICA DE NEGOCIO: el combate llama esto cada turno del jefe.
  verificarFase() {
    if (this.fase === 1 && this.vida <= this.vidaMaxima * 0.5) {
      this.fase = 2;
      this._ataque = Math.round(this._ataque * 1.4);
      return { texto: `${this.nombre} entra en FASE 2! Su ataque aumenta.` };
    }
    return null;
  }

  // POLIMORFISMO
  atacar(objetivo) {
    const probCrit = this.fase === 2 ? 0.35 : 0.2;
    const critico = Math.random() < probCrit;
    const base = this._ataque + aleatorio(0, 10);
    const danio = critico ? Math.round(base * 1.8) : base;
    return {
      danio,
      tipo: critico ? 'critico' : 'fisico',
      texto: critico
        ? `${this.nombre} [Fase ${this.fase}] descarga un GOLPE BRUTAL por ${danio}!`
        : `${this.nombre} [Fase ${this.fase}] ataca por ${danio}.`
    };
  }

  _ataqueEspecial(objetivo) {
    const nombre = this.ataquesEspeciales[aleatorio(0, this.ataquesEspeciales.length - 1)];
    const danio = Math.round(this._ataque * (this.fase === 2 ? 2 : 1.6)) + aleatorio(0, 12);
    return { danio, tipo: 'especial_jefe', texto: `${this.nombre} usa "${nombre}" por ${danio} de danio devastador!` };
  }
}
