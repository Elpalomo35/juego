// ============================================================
// MODELO: Combate.js
// ------------------------------------------------------------
// CONCEPTO MVC: MODELO. Contiene TODA la logica del combate
//   por turnos. No sabe nada de Phaser ni de pantallas.
//
// CONCEPTO POO: ABSTRACCION
//   El CombateController solo llama:
//       combate.accionJugador('atacar')
//   y recibe el nuevo estado. No calcula danios ni turnos.
//
// CONCEPTO POO: POLIMORFISMO en accion
//   this.jugador.atacar()  y  this.enemigo.atacar()  son el
//   MISMO metodo con nombre identico, pero cada objeto
//   (Guerrero, Goblin, Jefe...) responde a su manera.
//
// LOGICA DE NEGOCIO implementada aqui:
//   * Un personaje derrotado no puede actuar.
//   * De un Jefe no se puede huir.
//   * El escudo absorbe danio antes que la vida.
//   * El Esqueleto puede resucitar una vez.
//   * Al ganar se calculan las recompensas (exp y oro).
// ============================================================

export class Combate {
  constructor(jugador, enemigo) {
    this.jugador  = jugador;   // instancia de Guerrero / Mago / Arquero
    this.enemigo  = enemigo;   // instancia de Goblin / Esqueleto / Jefe...
    this.turno    = 'jugador'; // 'jugador' | 'enemigo' | 'fin'
    this.ronda    = 1;
    this.registro = [];        // historial de texto para la Vista
    this.terminado = false;
    this.resultado = null;     // 'victoria' | 'derrota' | 'huida'
    this.recompensa = null;

    // escudo temporal del jugador (de habilidades / defender)
    this.escudo = 0;
    this.escudoTurnos = 0;

    this._log(`Combate contra ${enemigo.nombre}!`);
  }

  _log(texto) {
    this.registro.push(texto);
    if (this.registro.length > 30) this.registro.shift();
  }

  // ==========================================================
  // ENTRADA UNICA DESDE EL CONTROLADOR  (ABSTRACCION)
  //   tipo: 'atacar' | 'defender' | 'habilidad' | 'objeto' | 'huir'
  //   dato: indice de habilidad u objeto cuando aplica
  // ==========================================================
  accionJugador(tipo, dato = null) {
    if (this.terminado || this.turno !== 'jugador') return this.estado();
    if (!this.jugador.estaVivo) return this.estado();

    switch (tipo) {
      case 'atacar':    this._jugadorAtaca();        break;
      case 'defender':  this._jugadorDefiende();     break;
      case 'habilidad': this._jugadorUsaHabilidad(dato); break;
      case 'objeto':    this._jugadorUsaObjeto(dato);    break;
      case 'huir':      this._jugadorHuye();         break;
      default: return this.estado();
    }

    if (this.terminado) return this.estado();

    // Si la accion no consumio el turno (habilidad sin energia), no pasa turno.
    if (this._turnoConsumido) {
      this._turnoEnemigo();
    }
    return this.estado();
  }

  // --- Acciones del jugador --------------------------------
  _jugadorAtaca() {
    this._turnoConsumido = true;
    const ataque = this.jugador.atacar(this.enemigo);       // POLIMORFISMO
    const real = this.enemigo.recibirDanio(ataque.danio);
    this._log(`${ataque.texto} (-${real})`);
    this._comprobarEnemigo();
  }

  _jugadorDefiende() {
    this._turnoConsumido = true;
    this.jugador.defender();
    this.escudo += Math.round(this.jugador.defensa * 0.8) + 4;
    this.escudoTurnos = 1;
    this._log(`${this.jugador.nombre} se pone en guardia (+${this.escudo} escudo).`);
  }

  _jugadorUsaHabilidad(indice) {
    const hab = this.jugador.habilidades[indice];
    if (!hab) { this._turnoConsumido = false; return; }
    const r = hab.ejecutar(this.jugador, this.enemigo);
    if (!r.ok) { this._turnoConsumido = false; this._log(r.texto); return; }

    this._turnoConsumido = true;
    if (r.tipo === 'dano') {
      const real = this.enemigo.recibirDanio(r.danio);
      this._log(`${r.texto} (-${real})`);
      this._comprobarEnemigo();
    } else if (r.tipo === 'escudo') {
      this.escudo += r.escudo;
      this.escudoTurnos = r.turnos;
      this._log(r.texto);
    } else {
      this._log(r.texto);
    }
  }

  _jugadorUsaObjeto(indice) {
    if (!this.jugador.inventario) { this._turnoConsumido = false; return; }
    const r = this.jugador.inventario.usar(indice, this.jugador, this.enemigo);
    if (!r.ok) { this._turnoConsumido = false; this._log(r.texto); return; }
    this._turnoConsumido = true;
    this._log(r.texto);
    if (r.tipo === 'bomba') this._comprobarEnemigo();
  }

  _jugadorHuye() {
    // LOGICA DE NEGOCIO: no se puede huir de un Jefe.
    if (this.enemigo.especie === 'Jefe') {
      this._turnoConsumido = true;
      this._log('No puedes huir de un Jefe!');
      return;
    }
    if (Math.random() < 0.55) {
      this._turnoConsumido = false;
      this.terminado = true;
      this.turno = 'fin';
      this.resultado = 'huida';
      this._log(`${this.jugador.nombre} escapa del combate.`);
    } else {
      this._turnoConsumido = true;
      this._log('El intento de huida falla!');
    }
  }

  // --- Turno del enemigo (IA) ------------------------------
  _turnoEnemigo() {
    this.turno = 'enemigo';

    if (!this.enemigo.estaVivo) { this._finVictoria(); return; }

    // El Jefe comprueba cambio de fase.
    if (typeof this.enemigo.verificarFase === 'function') {
      const cambio = this.enemigo.verificarFase();
      if (cambio) this._log(cambio.texto);
    }

    const accion = this.enemigo.elegirAccion(this.jugador);   // ABSTRACCION + POLIMORFISMO

    if (accion.danio > 0 && !accion.yaAplicado) {
      let danio = accion.danio;
      // El escudo absorbe primero.
      if (this.escudo > 0) {
        const absorbido = Math.min(this.escudo, danio);
        this.escudo -= absorbido;
        danio -= absorbido;
      }
      const real = this.jugador.recibirDanio(danio);
      this._log(`${accion.texto} (-${real})`);
    } else {
      this._log(accion.texto);
    }

    // Fin de ronda: se limpian estados temporales.
    this.jugador.terminarTurno();
    this.enemigo.terminarTurno();
    if (this.escudoTurnos > 0) {
      this.escudoTurnos--;
      if (this.escudoTurnos === 0) this.escudo = 0;
    }

    if (!this.jugador.estaVivo) { this._finDerrota(); return; }

    this.ronda++;
    this.turno = 'jugador';
  }

  // --- Comprobaciones de fin ------------------------------
  _comprobarEnemigo() {
    if (this.enemigo.estaVivo) return;

    // LOGICA DE NEGOCIO: el Esqueleto resucita una vez.
    if (typeof this.enemigo.intentarResucitar === 'function') {
      const res = this.enemigo.intentarResucitar();
      if (res) { this._log(res.texto); return; }
    }
    this._finVictoria();
  }

  _finVictoria() {
    this.terminado = true;
    this.turno = 'fin';
    this.resultado = 'victoria';
    this.recompensa = {
      exp: this.enemigo.expRecompensa,
      oro: this.enemigo.oroRecompensa
    };
    this._log(`${this.enemigo.nombre} derrotado! +${this.recompensa.exp} EXP, +${this.recompensa.oro} oro.`);
  }

  _finDerrota() {
    this.terminado = true;
    this.turno = 'fin';
    this.resultado = 'derrota';
    this._log(`${this.jugador.nombre} ha caido...`);
  }

  // --- Estado para la Vista (nunca lee campos privados) ----
  estado() {
    return {
      ronda: this.ronda,
      turno: this.turno,
      terminado: this.terminado,
      resultado: this.resultado,
      recompensa: this.recompensa,
      escudo: this.escudo,
      registro: [...this.registro],
      jugador: this.jugador.estado(),
      enemigo: this.enemigo.estado(),
      inventario: this.jugador.inventario ? this.jugador.inventario.lista() : []
    };
  }
}
