// ============================================================
// MODELO: Goblin.js
// ------------------------------------------------------------
// HERENCIA EN CADENA:  Goblin -> Enemigo -> Personaje
// POLIMORFISMO: atacar() da DOS golpes rapidos y debiles.
// ============================================================

import { Enemigo } from './Enemigo.js';
import { aleatorio } from './Personaje.js';

export class Goblin extends Enemigo {
  constructor(nombre = 'Goblin') {
    super({
      nombre,
      especie: 'Goblin',
      vida: 42, ataque: 9, defensa: 2, energia: 0,
      expRecompensa: 18, oroRecompensa: 12,
      textura: 'goblin'
    });
  }

  // POLIMORFISMO: dos ataques en el mismo turno.
  atacar(objetivo) {
    const g1 = Math.round(this._ataque * 0.6) + aleatorio(0, 3);
    const g2 = Math.round(this._ataque * 0.6) + aleatorio(0, 3);
    return {
      danio: g1 + g2,
      tipo: 'doble',
      texto: `${this.nombre} ataca dos veces (${g1} + ${g2} = ${g1 + g2}).`
    };
  }

  _ataqueEspecial(objetivo) {
    const danio = this._ataque + 5;
    return { danio, tipo: 'veneno', texto: `${this.nombre} muerde con veneno por ${danio}!` };
  }
}
