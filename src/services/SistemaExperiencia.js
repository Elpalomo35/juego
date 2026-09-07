// ============================================================
// SERVICIO: SistemaExperiencia.js
// ------------------------------------------------------------
// CONCEPTO MVC: SERVICIO de reglas de progresion.
//
// Aplica la recompensa de un combate al Jugador y devuelve
// un resumen legible para que la Vista muestre el cartel de
// "SUBISTE DE NIVEL".
//
// LOGICA DE NEGOCIO:
//   * La experiencia nunca es negativa.
//   * Subir de nivel restaura vida y energia al maximo.
//   * Se puede subir varios niveles de golpe con un solo combate.
// ============================================================

export const SistemaExperiencia = {

  // recompensa: { exp, oro }  ->  devuelve { subidas:[...], texto }
  aplicarRecompensa(jugador, recompensa) {
    if (!recompensa) return { subidas: [], texto: '' };

    jugador.ganarOro(recompensa.oro);
    const subidas = jugador.ganarExperiencia(recompensa.exp);  // el modelo hace el trabajo

    const partes = [`+${recompensa.exp} EXP`, `+${recompensa.oro} oro`];
    if (subidas.length > 0) {
      partes.push(subidas.map(s => s.texto).join('  '));
    }
    return { subidas, texto: partes.join('   ') };
  },

  // Barra de progreso 0..1 para la Vista.
  progresoNivel(jugador) {
    return jugador.experiencia / jugador.expSiguiente;
  }
};
