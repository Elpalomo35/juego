// ============================================================
// MODELO: Guerrero.js
// ------------------------------------------------------------
// CONCEPTO POO: HERENCIA    -> extends Jugador
// CONCEPTO POO: POLIMORFISMO -> reescribe atacar() (ataque
//               fisico fuerte) y _mejorasPorNivel() (crece
//               sobre todo en vida y defensa).
// ============================================================

import { Jugador } from './Jugador.js';
import { aleatorio } from './Personaje.js';
import { crearHabilidades } from './Habilidad.js';

export class Guerrero extends Jugador {
  constructor(nombre) {
    super({
      nombre,
      clase: 'Guerrero',
      vida: 130,     // mucha vida
      ataque: 17,    // ataque alto
      defensa: 11,   // defensa alta
      energia: 45    // poca energia
    });
    this.textura = 'pj_guerrero';
    this.habilidades = crearHabilidades('Guerrero');
  }

  // POLIMORFISMO: golpe fisico con la espada. A veces critico.
  atacar(objetivo) {
    const critico = Math.random() < 0.18;
    const base = this._ataque + aleatorio(2, 8);
    const danio = critico ? Math.round(base * 1.8) : base;
    return {
      danio,
      tipo: critico ? 'critico' : 'fisico',
      texto: critico
        ? `${this.nombre} asesta un GOLPE CRITICO con su espada por ${danio}!`
        : `${this.nombre} corta con su espada por ${danio}.`
    };
  }

  _mejorasPorNivel() {
    return { vida: 20, energia: 3, ataque: 2, defensa: 3 };
  }
}
