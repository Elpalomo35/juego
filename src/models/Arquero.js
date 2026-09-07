// ============================================================
// MODELO: Arquero.js
// ------------------------------------------------------------
// CONCEPTO POO: HERENCIA + POLIMORFISMO
//   atacar() dispara una flecha A DISTANCIA con alta
//   probabilidad de critico. Personaje equilibrado.
// ============================================================

import { Jugador } from './Jugador.js';
import { aleatorio } from './Personaje.js';
import { crearHabilidades } from './Habilidad.js';

export class Arquero extends Jugador {
  constructor(nombre) {
    super({
      nombre,
      clase: 'Arquero',
      vida: 105,     // vida media
      ataque: 19,    // ataque medio-alto
      defensa: 8,    // defensa media
      energia: 65    // energia media
    });
    this.textura = 'pj_arquero';
    this.habilidades = crearHabilidades('Arquero');
  }

  // POLIMORFISMO: disparo a distancia, 30% de critico x2.
  atacar(objetivo) {
    const critico = Math.random() < 0.30;
    const base = this._ataque + aleatorio(0, 6);
    const danio = critico ? base * 2 : base;
    return {
      danio,
      tipo: critico ? 'critico' : 'distancia',
      texto: critico
        ? `${this.nombre} clava una FLECHA CERTERA por ${danio}!`
        : `${this.nombre} dispara una flecha por ${danio}.`
    };
  }

  _mejorasPorNivel() {
    return { vida: 12, energia: 8, ataque: 3, defensa: 1 };
  }
}
