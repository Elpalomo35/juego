// ============================================================
// MODELO: Mago.js
// ------------------------------------------------------------
// CONCEPTO POO: HERENCIA + POLIMORFISMO
//   atacar() lanza un ataque MAGICO: mas potencia pero
//   consume energia. Si se queda sin energia, golpea flojo
//   con el baston. Crece sobre todo en ataque y energia.
// ============================================================

import { Jugador } from './Jugador.js';
import { aleatorio } from './Personaje.js';
import { crearHabilidades } from './Habilidad.js';

export class Mago extends Jugador {
  constructor(nombre) {
    super({
      nombre,
      clase: 'Mago',
      vida: 85,      // poca vida
      ataque: 23,    // ataque muy alto
      defensa: 5,    // defensa muy baja
      energia: 110   // mucha energia
    });
    this.textura = 'pj_mago';
    this.habilidades = crearHabilidades('Mago');
  }

  // POLIMORFISMO: ataque magico (cuesta 8 de energia).
  atacar(objetivo) {
    if (!this.gastarEnergia(8)) {
      const danio = 4 + aleatorio(0, 3);
      return { danio, tipo: 'fisico', texto: `${this.nombre} sin energia golpea con el baston por ${danio}.` };
    }
    const danio = this._ataque + aleatorio(0, 10);
    return { danio, tipo: 'magico', texto: `${this.nombre} lanza un rayo arcano por ${danio} de danio magico.` };
  }

  _mejorasPorNivel() {
    return { vida: 8, energia: 14, ataque: 4, defensa: 1 };
  }
}
