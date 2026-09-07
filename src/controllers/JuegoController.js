// ============================================================
// CONTROLADOR: JuegoController.js
// ------------------------------------------------------------
// CONCEPTO MVC: CONTROLADOR PRINCIPAL ("director de orquesta").
//   Es el UNICO sitio donde vive el estado global de la partida:
//     * el jugador (Modelo)
//     * las zonas (Modelos)
//     * el progreso / desbloqueos (Servicio)
//
//   Las escenas de Phaser (Vistas) NO se guardan datos entre
//   ellas: se los piden a este controlador, que se guarda en
//   el "registry" de Phaser (almacen compartido entre escenas).
//
// LOGICA DE NEGOCIO coordinada aqui:
//   * No se entra a una zona bloqueada.
//   * Completar una zona (todos los enemigos) desbloquea la siguiente.
//   * Perder un combate = Game Over.
//   * Limpiar la ultima zona = Victoria final.
// ============================================================

import { crearZonas } from '../models/Zona.js';
import { SistemaProgreso } from '../services/SistemaProgreso.js';
import { JugadorController } from './JugadorController.js';

export class JuegoController {
  constructor() {
    this.jugador  = null;
    this.zonas    = crearZonas();
    this.progreso = new SistemaProgreso();
    this.zonaActualId = 1;
  }

  // --- Inicio de partida --------------------------------
  nuevaPartida(clase, nombre) {
    this.jugador = JugadorController.crearJugador(clase, nombre);
    this.zonas = crearZonas();                 // zonas frescas
    this.progreso = new SistemaProgreso();
    this.zonaActualId = 1;
    this.progreso.guardar(this.jugador);
    return this.jugador;
  }

  // --- Consultas de zona -------------------------------
  zonaActual() {
    return this.zonas.find(z => z.id === this.zonaActualId);
  }

  puedeEntrar(idZona) {
    return this.progreso.estaDesbloqueada(idZona) && this.zonas.some(z => z.id === idZona);
  }

  // REGLA: cambiar de zona solo si esta desbloqueada.
  cambiarZona(idZona) {
    if (!this.puedeEntrar(idZona)) return false;
    this.zonaActualId = idZona;
    this.jugador.zonaActual = idZona;
    this.progreso.irAZona(idZona);
    this.progreso.guardar(this.jugador);
    return true;
  }

  // --- Cofres -----------------------------------------
  abrirCofre(idCofre) {
    const zona = this.zonaActual();
    const recompensa = zona.abrirCofre(idCofre);
    if (!recompensa) return null;
    const texto = JugadorController.aplicarRecompensaCofre(this.jugador, recompensa);
    this.progreso.guardar(this.jugador);
    return texto;
  }

  // --- Fin de combate (lo llama CombatScene) -----------
  // Devuelve una "orden" para la Vista: a que escena ir.
  resolverCombate(controladorCombate) {
    const res = controladorCombate.resultado;

    if (res === 'derrota') {
      return { ir: 'GameOverScene' };
    }

    if (res === 'huida') {
      return { ir: 'GameScene' };
    }

    // Victoria: comprobar si se completo la zona.
    const zona = this.zonaActual();
    this.progreso.guardar(this.jugador);

    if (zona.puertaAbierta()) {
      this.progreso.completarZona(zona.id);
      this.progreso.guardar(this.jugador);

      if (zona.puerta.destino === null) {
        // Era la ultima zona -> VICTORIA FINAL
        return { ir: 'VictoryScene' };
      }
      return { ir: 'GameScene', zonaLimpiada: true };
    }

    return { ir: 'GameScene' };
  }

  // --- Al cruzar una puerta abierta --------------------
  cruzarPuerta() {
    const zona = this.zonaActual();
    if (!zona.puertaAbierta()) return { ok: false, motivo: 'Derrota a todos los enemigos primero.' };
    if (zona.puerta.destino === null) return { ok: true, victoria: true };

    this.progreso.completarZona(zona.id);
    this.cambiarZona(zona.puerta.destino);
    return { ok: true, victoria: false, nuevaZona: zona.puerta.destino };
  }
}
