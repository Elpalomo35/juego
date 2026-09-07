// ============================================================
// SERVICIO: ReglasCombate.js
// ------------------------------------------------------------
// CONCEPTO MVC: SERVICIO. Funciones PURAS (sin estado, sin
//   Phaser) que expresan reglas del negocio del combate.
//   Se pueden probar de forma aislada y reutilizar.
//
// Nota: el modelo Combate ya aplica el flujo de turnos; este
// servicio documenta y centraliza las FORMULAS para que la
// regla viva en un solo sitio.
// ============================================================

export const ReglasCombate = {

  // REGLA: el danio real = danio bruto - defensa, minimo 1.
  calcularDanio(danioBruto, defensa) {
    return Math.max(1, Math.round(danioBruto - defensa));
  },

  // REGLA: un personaje esta derrotado cuando su vida llega a 0.
  estaDerrotado(personaje) {
    return personaje.vida <= 0;
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
