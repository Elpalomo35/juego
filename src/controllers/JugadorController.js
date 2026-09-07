// ============================================================
// CONTROLADOR: JugadorController.js
// ------------------------------------------------------------
// CONCEPTO MVC: CONTROLADOR.
//   Traduce la eleccion de la Vista ("quiero un Mago llamado X")
//   en la creacion del MODELO correcto.
//
// CONCEPTO POO: POLIMORFISMO / FABRICA
//   Segun la clase elegida instancia Guerrero, Mago o Arquero.
//   Todas son Jugador, asi que el resto del juego las trata
//   igual (variable de tipo Jugador, comportamiento propio).
// ============================================================

import { Guerrero } from '../models/Guerrero.js';
import { Mago } from '../models/Mago.js';
import { Arquero } from '../models/Arquero.js';
import { Inventario } from '../models/Inventario.js';
import { crearObjeto } from '../models/Objeto.js';

const CLASES = {
  Guerrero: { crear: (n) => new Guerrero(n), emoji: 'ESPADA',
    resumen: 'Mucha vida y defensa. Golpe fisico fuerte con criticos.' },
  Mago:     { crear: (n) => new Mago(n), emoji: 'BASTON',
    resumen: 'Poca vida, ataque magico devastador y mucha energia.' },
  Arquero:  { crear: (n) => new Arquero(n), emoji: 'ARCO',
    resumen: 'Equilibrado. Disparos a distancia con alta probabilidad de critico.' }
};

export class JugadorController {

  static clasesDisponibles() {
    return Object.entries(CLASES).map(([clave, v]) => ({
      clase: clave, resumen: v.resumen
    }));
  }

  // Crea el heroe y le da inventario inicial.
  static crearJugador(clase, nombre) {
    const def = CLASES[clase];
    if (!def) throw new Error(`Clase desconocida: ${clase}`);
    const jugador = def.crear(nombre && nombre.trim() ? nombre.trim() : clase);
    jugador.inventario = Inventario.inicial();
    return jugador;
  }

  // Aplica una recompensa de cofre que no sea de combate.
  static aplicarRecompensaCofre(jugador, recompensa) {
    if (!recompensa) return '';
    if (recompensa.tipo === 'exp') {
      const subidas = jugador.ganarExperiencia(recompensa.valor);
      let txt = `+${recompensa.valor} EXP`;
      if (subidas.length) txt += '  ' + subidas.map(s => s.texto).join(' ');
      return txt;
    }
    if (recompensa.tipo === 'oro') {
      jugador.ganarOro(recompensa.valor);
      return `+${recompensa.valor} oro`;
    }
    if (recompensa.tipo === 'objeto') {
      const obj = crearObjeto(recompensa.valor, 1);
      const r = jugador.inventario.agregar(obj);
      return r.texto;
    }
    return '';
  }
}
