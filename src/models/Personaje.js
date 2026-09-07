// ============================================================
// MODELO: Personaje.js
// ------------------------------------------------------------
// CONCEPTO POO:
//   * CLASE  -> el molde para crear personajes.
//   * OBJETO -> cada heroe o enemigo creado con "new".
//   * ABSTRACCION -> quien usa la clase llama atacar() o
//     recibirDanio() sin saber como se calculan por dentro.
//   * ENCAPSULAMIENTO -> la vida y la energia son PRIVADAS (#)
//     y solo cambian a traves de metodos que validan las reglas.
//
// Es la CLASE BASE de TODO el juego:
//        Personaje
//        /       \
//     Jugador    Enemigo
//     /  |  \     /  |  \
// Guerrero Mago  Goblin Esqueleto ...
// ============================================================

// Utilidad: entero aleatorio entre min y max (ambos incluidos)
export function aleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class Personaje {

  // --- ATRIBUTOS PRIVADOS (ENCAPSULAMIENTO) ------------------
  // El "#" hace que solo se puedan tocar DENTRO de esta clase.
  // Desde fuera, personaje.#vida da error de sintaxis.
  #vida;
  #vidaMaxima;
  #energia;
  #energiaMaxima;

  constructor({ nombre, vida, ataque, defensa, energia }) {
    this.nombre = nombre;

    // Atributos "protegidos" por convencion (_): las subclases
    // los ajustan, pero el resto del codigo no deberia tocarlos.
    this._ataque  = ataque;
    this._defensa = defensa;

    this.#vidaMaxima    = vida;
    this.#vida          = vida;
    this.#energiaMaxima = energia;
    this.#energia       = energia;

    this.nivel       = 1;
    this.defendiendo = false;   // se activa 1 turno al usar defender()
  }

  // --- GETTERS: leer datos privados de forma controlada ------
  get vida()          { return this.#vida; }
  get vidaMaxima()    { return this.#vidaMaxima; }
  get energia()       { return this.#energia; }
  get energiaMaxima() { return this.#energiaMaxima; }
  get estaVivo()      { return this.#vida > 0; }

  // La defensa efectiva sube si el personaje esta defendiendo.
  get ataque()  { return this._ataque; }
  get defensa() { return this.defendiendo ? Math.round(this._defensa * 1.8) : this._defensa; }

  // ==========================================================
  // METODOS DE COMBATE
  // ==========================================================

  // POLIMORFISMO: cada subclase REESCRIBE atacar() con su
  // propio estilo (fisico, magico, a distancia, doble golpe...).
  // Esta es la version generica.
  atacar(objetivo) {
    const danio = this._ataque + aleatorio(0, 4);
    return { danio, tipo: 'normal', texto: `${this.nombre} ataca y golpea por ${danio}.` };
  }

  // ENCAPSULAMIENTO + LOGICA DE NEGOCIO:
  // Unica forma valida de bajar la vida.
  // Reglas aplicadas aqui:
  //   * la defensa reduce el danio,
  //   * el danio minimo siempre es 1,
  //   * la vida nunca baja de 0.
  recibirDanio(cantidadBruta) {
    const danio = Math.max(1, Math.round(cantidadBruta - this.defensa));
    this.#vida = Math.max(0, this.#vida - danio);
    return danio;   // devuelve el danio REAL aplicado (para la Vista)
  }

  // Danio que ignora la defensa (bombas, hechizos penetrantes).
  recibirDanioDirecto(cantidad) {
    const danio = Math.max(0, Math.round(cantidad));
    this.#vida = Math.max(0, this.#vida - danio);
    return danio;
  }

  // LOGICA DE NEGOCIO: la vida nunca supera la vida maxima.
  curarse(cantidad) {
    const antes = this.#vida;
    this.#vida = Math.min(this.#vidaMaxima, this.#vida + Math.round(cantidad));
    return this.#vida - antes;   // cuanto se curo realmente
  }

  defender() {
    this.defendiendo = true;
  }

  // LOGICA DE NEGOCIO: una habilidad no se puede usar sin
  // energia suficiente. Devuelve true si se pudo pagar.
  gastarEnergia(coste) {
    if (this.#energia < coste) return false;
    this.#energia -= coste;
    return true;
  }

  recuperarEnergia(cantidad) {
    this.#energia = Math.min(this.#energiaMaxima, this.#energia + cantidad);
  }

  // Se llama al final del turno de este personaje.
  terminarTurno() {
    this.defendiendo = false;
    this.recuperarEnergia(4);
    if (this.habilidades) this.habilidades.forEach(h => h.reducirEnfriamiento());
  }

  // Usado al subir de nivel (Jugador) para restaurar por completo.
  restaurarTodo() {
    this.#vida    = this.#vidaMaxima;
    this.#energia = this.#energiaMaxima;
  }

  // Permite que subirNivel() (en Jugador) aumente los maximos
  // sin exponer los campos privados al resto del codigo.
  _subirMaximos({ vida = 0, energia = 0, ataque = 0, defensa = 0 }) {
    this.#vidaMaxima    += vida;
    this.#energiaMaxima += energia;
    this._ataque        += ataque;
    this._defensa       += defensa;
    this.restaurarTodo();
  }

  // "Foto" del estado para que las Vistas dibujen barras, etc.
  // La Vista NUNCA lee los campos privados: usa este resumen.
  estado() {
    return {
      nombre: this.nombre,
      vida: this.#vida, vidaMaxima: this.#vidaMaxima,
      energia: this.#energia, energiaMaxima: this.#energiaMaxima,
      ataque: this.ataque, defensa: this.defensa,
      nivel: this.nivel, vivo: this.estaVivo,
      defendiendo: this.defendiendo
    };
  }
}
