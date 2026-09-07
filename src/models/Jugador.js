// ============================================================
// MODELO: Jugador.js
// ------------------------------------------------------------
// CONCEPTO POO: HERENCIA
//   Jugador EXTIENDE Personaje  ->  "un Jugador ES UN Personaje"
//   y ademas anade lo propio del heroe controlable:
//     experiencia, oro, inventario, habilidades, zona actual.
//
// CONCEPTO POO: ENCAPSULAMIENTO
//   #experiencia, #expSiguiente y #oro son privados.
//   Solo suben mediante ganarExperiencia() y ganarOro(),
//   que aplican las reglas del negocio (no valores negativos,
//   subir de nivel automatico, etc.).
//
// A su vez, Guerrero / Mago / Arquero HEREDAN de Jugador,
// formando una cadena de 3 niveles:
//   Personaje  <-  Jugador  <-  Guerrero
// ============================================================

import { Personaje } from './Personaje.js';

export class Jugador extends Personaje {

  #experiencia;
  #expSiguiente;
  #oro;

  constructor(config) {
    // super() ejecuta el constructor de Personaje (la clase padre).
    super(config);

    this.clase        = config.clase || 'Aventurero';
    this.#experiencia  = 0;
    this.#expSiguiente  = 100;   // exp necesaria para el nivel 2
    this.#oro          = 0;

    this.habilidades  = [];      // se rellena en las subclases
    this.inventario   = null;    // se asigna al crear la partida
    this.zonaActual   = 1;
    this.textura      = 'pj_guerrero';   // la subclase lo ajusta
  }

  get experiencia()  { return this.#experiencia; }
  get expSiguiente() { return this.#expSiguiente; }
  get oro()          { return this.#oro; }

  // --- LOGICA DE NEGOCIO: recompensas -----------------------
  ganarOro(cantidad) {
    if (cantidad <= 0) return 0;
    this.#oro += Math.round(cantidad);
    return this.#oro;
  }

  // Suma experiencia y sube de nivel TANTAS veces como haga falta.
  // Devuelve un array con la info de cada nivel ganado (para la Vista).
  ganarExperiencia(cantidad) {
    if (cantidad <= 0) return [];
    this.#experiencia += Math.round(cantidad);

    const subidas = [];
    while (this.#experiencia >= this.#expSiguiente) {
      this.#experiencia -= this.#expSiguiente;
      this.#expSiguiente = Math.round(this.#expSiguiente * 1.5); // cada nivel cuesta mas
      subidas.push(this.subirNivel());
    }
    return subidas;
  }

  // POLIMORFISMO: cada subclase reescribe _mejorasPorNivel()
  // para crecer de forma distinta (el Guerrero mas vida,
  // el Mago mas ataque y energia, etc.).
  subirNivel() {
    this.nivel++;
    const mejoras = this._mejorasPorNivel();
    this._subirMaximos(mejoras);   // metodo protegido de Personaje
    return {
      nivel: this.nivel,
      mejoras,
      texto: `NIVEL ${this.nivel}! +${mejoras.vida} vida, +${mejoras.ataque} ataque, ` +
             `+${mejoras.defensa} defensa, +${mejoras.energia} energia.`
    };
  }

  // Version generica (la usan las subclases con super o la sobreescriben).
  _mejorasPorNivel() {
    return { vida: 12, energia: 6, ataque: 2, defensa: 1 };
  }

  estado() {
    return {
      ...super.estado(),           // hereda el resumen de Personaje
      clase: this.clase,
      textura: this.textura,
      experiencia: this.#experiencia,
      expSiguiente: this.#expSiguiente,
      oro: this.#oro,
      habilidades: this.habilidades.map(h => h.info()),
      zonaActual: this.zonaActual
    };
  }
}
