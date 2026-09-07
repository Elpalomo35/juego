// ============================================================
// MODELO: Esqueleto.js
// ------------------------------------------------------------
// HERENCIA EN CADENA:  Esqueleto -> Enemigo -> Personaje
// POLIMORFISMO: atacar() golpea con hueso y a veces aplica
//   una MALDICION que reduce la defensa del objetivo.
// LOGICA DE NEGOCIO: puede RESUCITAR una unica vez.
// ============================================================

import { Enemigo } from './Enemigo.js';
import { aleatorio } from './Personaje.js';

export class Esqueleto extends Enemigo {
  constructor(nombre = 'Esqueleto') {
    super({
      nombre,
      especie: 'Esqueleto',
      vida: 58, ataque: 12, defensa: 6, energia: 0,
      expRecompensa: 26, oroRecompensa: 18,
      textura: 'esqueleto'
    });
    this.yaResucito = false;
  }

  // POLIMORFISMO: golpe de hueso, 30% de maldicion.
  atacar(objetivo) {
    const danio = this._ataque + aleatorio(0, 5);
    const maldice = Math.random() < 0.3;
    if (maldice && objetivo) {
      objetivo._defensa = Math.max(0, objetivo._defensa - 2);
      return { danio, tipo: 'maldicion', texto: `${this.nombre} maldice: ${danio} de danio y -2 de defensa!` };
    }
    return { danio, tipo: 'fisico', texto: `${this.nombre} golpea con un hueso por ${danio}.` };
  }

  // LOGICA DE NEGOCIO: al morir, una sola vez, vuelve con 40% de vida.
  // Lo llama el modelo Combate cuando detecta que ha caido.
  intentarResucitar() {
    if (this.yaResucito || this.estaVivo) return null;
    this.yaResucito = true;
    this.curarse(Math.round(this.vidaMaxima * 0.4));
    return { texto: `${this.nombre} se REENSAMBLA y vuelve con ${this.vida} de vida!` };
  }
}
