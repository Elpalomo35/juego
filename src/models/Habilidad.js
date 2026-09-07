// ============================================================
// MODELO: Habilidad.js
// ------------------------------------------------------------
// CONCEPTO POO: CLASE + ABSTRACCION
//   El jugador solo elige "usar habilidad N". El metodo
//   ejecutar() se encarga de: comprobar energia, comprobar
//   enfriamiento, descontar energia, calcular el efecto.
//
// LOGICA DE NEGOCIO:
//   * No se puede usar sin energia suficiente.
//   * No se puede usar mientras esta en enfriamiento (cooldown).
//   * El efecto depende del tipo: dano / cura / escudo.
// ============================================================

import { aleatorio } from './Personaje.js';

export class Habilidad {
  constructor({ nombre, descripcion, coste, tipo, potencia, enfriamiento = 0 }) {
    this.nombre       = nombre;
    this.descripcion  = descripcion;
    this.coste        = coste;         // energia que consume
    this.tipo         = tipo;          // 'dano' | 'cura' | 'escudo'
    this.potencia     = potencia;      // multiplicador o fraccion
    this.enfriamientoMax = enfriamiento;
    this.enfriamiento    = 0;          // turnos restantes hasta poder repetirla
  }

  // LOGICA DE NEGOCIO: reglas para poder usarla.
  sePuedeUsar(lanzador) {
    if (this.enfriamiento > 0) return { ok: false, motivo: `${this.nombre} en enfriamiento (${this.enfriamiento}).` };
    if (lanzador.energia < this.coste) return { ok: false, motivo: `Sin energia para ${this.nombre} (necesitas ${this.coste}).` };
    return { ok: true };
  }

  // ABSTRACCION: un solo metodo hace todo el trabajo.
  ejecutar(lanzador, objetivo) {
    const check = this.sePuedeUsar(lanzador);
    if (!check.ok) return { ok: false, texto: check.motivo };

    lanzador.gastarEnergia(this.coste);
    this.enfriamiento = this.enfriamientoMax;

    if (this.tipo === 'dano') {
      const danio = Math.round(lanzador.ataque * this.potencia) + aleatorio(0, 6);
      return { ok: true, tipo: 'dano', danio, texto: `${this.nombre}! ${danio} de danio.` };
    }
    if (this.tipo === 'cura') {
      const curado = lanzador.curarse(Math.round(lanzador.vidaMaxima * this.potencia));
      return { ok: true, tipo: 'cura', texto: `${this.nombre}: recuperas ${curado} de vida.` };
    }
    if (this.tipo === 'escudo') {
      const escudo = Math.round(lanzador.defensa * this.potencia);
      return { ok: true, tipo: 'escudo', escudo, turnos: 2, texto: `${this.nombre}: +${escudo} de escudo (2 turnos).` };
    }
    return { ok: false, texto: 'Tipo de habilidad desconocido.' };
  }

  reducirEnfriamiento() {
    if (this.enfriamiento > 0) this.enfriamiento--;
  }

  info() {
    return {
      nombre: this.nombre, descripcion: this.descripcion,
      coste: this.coste, tipo: this.tipo,
      enfriamiento: this.enfriamiento, disponible: this.enfriamiento === 0
    };
  }
}

// ============================================================
// FABRICA: crearHabilidades(clase)
// Devuelve el set de 3 habilidades de cada clase jugable.
// ============================================================
export function crearHabilidades(clase) {
  switch (clase) {
    case 'Guerrero':
      return [
        new Habilidad({ nombre: 'Golpe Critico', descripcion: 'Dano fisico devastador.', coste: 20, tipo: 'dano', potencia: 2.2, enfriamiento: 2 }),
        new Habilidad({ nombre: 'Postura de Hierro', descripcion: 'Gran escudo 2 turnos.', coste: 15, tipo: 'escudo', potencia: 2.0, enfriamiento: 3 }),
        new Habilidad({ nombre: 'Segundo Aliento', descripcion: 'Recupera 30% de vida.', coste: 25, tipo: 'cura', potencia: 0.30, enfriamiento: 4 })
      ];
    case 'Mago':
      return [
        new Habilidad({ nombre: 'Bola de Fuego', descripcion: 'Hechizo de fuego potente.', coste: 30, tipo: 'dano', potencia: 2.6, enfriamiento: 2 }),
        new Habilidad({ nombre: 'Rayo Helado', descripcion: 'Hechizo rapido de hielo.', coste: 18, tipo: 'dano', potencia: 1.7, enfriamiento: 1 }),
        new Habilidad({ nombre: 'Cura Arcana', descripcion: 'Recupera 35% de vida.', coste: 28, tipo: 'cura', potencia: 0.35, enfriamiento: 3 })
      ];
    case 'Arquero':
      return [
        new Habilidad({ nombre: 'Lluvia de Flechas', descripcion: 'Muchas flechas a la vez.', coste: 24, tipo: 'dano', potencia: 2.1, enfriamiento: 2 }),
        new Habilidad({ nombre: 'Disparo Preciso', descripcion: 'Flecha critica segura.', coste: 16, tipo: 'dano', potencia: 2.8, enfriamiento: 3 }),
        new Habilidad({ nombre: 'Evasion', descripcion: 'Escudo agil 2 turnos.', coste: 18, tipo: 'escudo', potencia: 1.6, enfriamiento: 3 })
      ];
    default:
      return [];
  }
}
