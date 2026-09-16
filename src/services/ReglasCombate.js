// ============================================================
// SERVICIO: ReglasCombate.js
// ------------------------------------------------------------
// CONCEPTO MVC: SERVICIO. Funciones PURAS (sin estado propio,
//   sin Phaser) que expresan reglas del negocio del combate.
//   Se pueden probar de forma aislada y reutilizar.
//
// Quien las USA de verdad:
//   * Personaje.recibirDanio()  -> calcularDanio()
//   * Combate._jugadorHuye()    -> puedeHuir()
//   * Combate._finVictoria()    -> calcularRecompensa()
// Asi la FORMULA vive en un solo sitio en vez de repetirse
// dentro de cada modelo.
// ============================================================

export const ReglasCombate = {

  // REGLA: el danio real = danio bruto - defensa, minimo 1
  // (un ataque siempre hace algo, por mucha defensa que haya).
  calcularDanio(danioBruto, defensa) {
    return Math.max(1, Math.round(danioBruto - defensa));
  },

  // REGLA: no se puede huir de un Jefe.
  puedeHuir(enemigo) {
    return enemigo.especie !== 'Jefe';
  },

  // REGLA: recompensa final segun la ronda (combates largos
  // dan un pequeno extra).
  calcularRecompensa(enemigo, ronda) {
    const bonus = Math.min(0.5, (ronda - 1) * 0.05);
    return {
      exp: Math.round(enemigo.expRecompensa * (1 + bonus)),
      oro: Math.round(enemigo.oroRecompensa * (1 + bonus))
    };
  }
};
