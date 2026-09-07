// ============================================================
// MODELO: Inventario.js
// ------------------------------------------------------------
// CONCEPTO POO: ENCAPSULAMIENTO
//   La lista interna #objetos es PRIVADA. Desde fuera solo se
//   puede anadir con agregar(), usar con usar() y consultar
//   con lista(). Nadie puede corromper el array directamente.
//
// LOGICA DE NEGOCIO:
//   * Capacidad maxima de tipos distintos.
//   * Objetos iguales se APILAN.
//   * Al llegar a 0 unidades, el objeto desaparece.
// ============================================================

import { crearObjeto } from './Objeto.js';

export class Inventario {
  #objetos;
  #capacidad;

  constructor(capacidad = 12) {
    this.#objetos   = [];
    this.#capacidad = capacidad;
  }

  get tamano() { return this.#objetos.length; }

  agregar(objeto) {
    if (!objeto) return { ok: false, texto: 'Objeto invalido.' };
    const existente = this.#objetos.find(o => o.id === objeto.id);
    if (existente) {
      existente.cantidad += objeto.cantidad;
      return { ok: true, texto: `${objeto.nombre} x${objeto.cantidad} (tienes ${existente.cantidad}).` };
    }
    if (this.#objetos.length >= this.#capacidad) return { ok: false, texto: 'Inventario lleno.' };
    this.#objetos.push(objeto);
    return { ok: true, texto: `Obtienes ${objeto.nombre}.` };
  }

  usar(indice, lanzador, objetivo) {
    const obj = this.#objetos[indice];
    if (!obj) return { ok: false, texto: 'Ese objeto no existe.' };
    const resultado = obj.usar(lanzador, objetivo);
    // LOGICA DE NEGOCIO: limpiar los agotados.
    this.#objetos = this.#objetos.filter(o => o.cantidad > 0);
    return resultado;
  }

  // Devuelve una COPIA de solo lectura (no expone el array real).
  lista() {
    return this.#objetos.map((o, i) => ({ indice: i, ...o.info() }));
  }

  static inicial() {
    const inv = new Inventario();
    inv.agregar(crearObjeto('pocion_pequena', 3));
    inv.agregar(crearObjeto('eter', 1));
    return inv;
  }
}
