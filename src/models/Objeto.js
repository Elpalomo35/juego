// ============================================================
// MODELO: Objeto.js
// ------------------------------------------------------------
// CONCEPTO POO: CLASE con metodo usar() (ABSTRACCION).
// LOGICA DE NEGOCIO: no se puede usar si la cantidad es 0.
// ============================================================

export class Objeto {
  constructor({ id, nombre, descripcion, tipo, valor, cantidad = 1 }) {
    this.id          = id;
    this.nombre      = nombre;
    this.descripcion = descripcion;
    this.tipo        = tipo;      // 'vida' | 'energia' | 'bomba'
    this.valor       = valor;
    this.cantidad    = cantidad;
  }

  usar(lanzador, objetivo) {
    if (this.cantidad <= 0) return { ok: false, texto: `No te quedan ${this.nombre}.` };
    this.cantidad--;

    if (this.tipo === 'vida') {
      const c = lanzador.curarse(this.valor);
      return { ok: true, tipo: 'vida', texto: `${this.nombre}: +${c} de vida. (x${this.cantidad})` };
    }
    if (this.tipo === 'energia') {
      lanzador.recuperarEnergia(this.valor);
      return { ok: true, tipo: 'energia', texto: `${this.nombre}: +${this.valor} de energia. (x${this.cantidad})` };
    }
    if (this.tipo === 'bomba') {
      const d = objetivo ? objetivo.recibirDanioDirecto(this.valor) : this.valor;
      return { ok: true, tipo: 'bomba', danio: d, texto: `${this.nombre} explota por ${d} (ignora defensa). (x${this.cantidad})` };
    }
    return { ok: false, texto: 'Objeto desconocido.' };
  }

  info() {
    return { id: this.id, nombre: this.nombre, descripcion: this.descripcion, tipo: this.tipo, cantidad: this.cantidad };
  }
}

// Catalogo de objetos del juego.
const CATALOGO = {
  pocion_pequena: { id: 'pocion_pequena', nombre: 'Pocion Pequena', descripcion: 'Cura 30 de vida.', tipo: 'vida', valor: 30 },
  pocion_media:   { id: 'pocion_media',   nombre: 'Pocion Media',   descripcion: 'Cura 60 de vida.', tipo: 'vida', valor: 60 },
  pocion_grande:  { id: 'pocion_grande',  nombre: 'Pocion Grande',  descripcion: 'Cura 110 de vida.', tipo: 'vida', valor: 110 },
  eter:           { id: 'eter',           nombre: 'Eter',           descripcion: 'Recupera 45 de energia.', tipo: 'energia', valor: 45 },
  bomba:          { id: 'bomba',          nombre: 'Bomba de Fuego', descripcion: '35 de danio directo al enemigo.', tipo: 'bomba', valor: 35 }
};

export function crearObjeto(id, cantidad = 1) {
  const base = CATALOGO[id];
  if (!base) return null;
  return new Objeto({ ...base, cantidad });
}
