// ============================================================
// SERVICIO: SistemaProgreso.js
// ------------------------------------------------------------
// CONCEPTO MVC: SERVICIO. Controla que zonas estan
//   desbloqueadas y guarda / carga la partida en localStorage.
//
// LOGICA DE NEGOCIO:
//   * La zona 1 siempre esta desbloqueada.
//   * Una zona nueva se desbloquea al completar la anterior.
//   * No se puede "saltar" a una zona bloqueada.
// ============================================================

const CLAVE = 'codequest_rpg_progreso';

export class SistemaProgreso {
  constructor() {
    this.zonasDesbloqueadas = new Set([1]);
    this.zonaActual = 1;
  }

  estaDesbloqueada(idZona) {
    return this.zonasDesbloqueadas.has(idZona);
  }

  // REGLA: completar una zona desbloquea la siguiente.
  completarZona(idZona) {
    this.zonasDesbloqueadas.add(idZona + 1);
  }

  irAZona(idZona) {
    if (!this.estaDesbloqueada(idZona)) return false;
    this.zonaActual = idZona;
    return true;
  }

  guardar(jugador) {
    try {
      const datos = {
        zonasDesbloqueadas: [...this.zonasDesbloqueadas],
        zonaActual: this.zonaActual,
        jugador: jugador ? {
          nombre: jugador.nombre, clase: jugador.clase, nivel: jugador.nivel,
          oro: jugador.oro, experiencia: jugador.experiencia
        } : null
      };
      localStorage.setItem(CLAVE, JSON.stringify(datos));
      return true;
    } catch (e) {
      return false;   // modo incognito o almacenamiento bloqueado
    }
  }

  cargar() {
    try {
      const bruto = localStorage.getItem(CLAVE);
      if (!bruto) return null;
      const datos = JSON.parse(bruto);
      this.zonasDesbloqueadas = new Set(datos.zonasDesbloqueadas || [1]);
      this.zonaActual = datos.zonaActual || 1;
      return datos;
    } catch (e) {
      return null;
    }
  }

  borrar() {
    try { localStorage.removeItem(CLAVE); } catch (e) { /* ignorar */ }
  }
}
