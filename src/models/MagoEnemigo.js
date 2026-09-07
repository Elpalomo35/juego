// ============================================================
// MODELO: MagoEnemigo.js
// ------------------------------------------------------------
// HERENCIA EN CADENA:  MagoEnemigo -> Enemigo -> Personaje
// POLIMORFISMO: atacar() lanza un hechizo que IGNORA parte
//   de la defensa del objetivo (danio directo parcial).
// ============================================================

import { Enemigo } from './Enemigo.js';
import { aleatorio } from './Personaje.js';

export class MagoEnemigo extends Enemigo {
  constructor(nombre = 'Mago Oscuro') {
    super({
      nombre,
      especie: 'Mago Oscuro',
      vida: 48, ataque: 18, defensa: 4, energia: 60,
      expRecompensa: 34, oroRecompensa: 26,
      textura: 'mago'
    });
    this.hechizos = ['Bola de Sombra', 'Rayo Helado', 'Llama Negra'];
  }

  // POLIMORFISMO: el hechizo hace la mitad de su danio como
  // danio directo (ignora defensa) y la otra mitad normal.
  atacar(objetivo) {
    const total = this._ataque + aleatorio(0, 8);
    const hechizo = this.hechizos[aleatorio(0, this.hechizos.length - 1)];
    if (objetivo) {
      const directo = objetivo.recibirDanioDirecto(Math.round(total / 2));
      const normal  = objetivo.recibirDanio(Math.round(total / 2));
      return {
        danio: directo + normal,
        yaAplicado: true,   // el combate no debe aplicarlo otra vez
        tipo: 'magico',
        texto: `${this.nombre} lanza ${hechizo}: ${directo + normal} de danio (ignora parte de tu defensa).`
      };
    }
    return { danio: total, tipo: 'magico', texto: `${this.nombre} lanza ${hechizo} por ${total}.` };
  }

  _ataqueEspecial(objetivo) {
    const danio = this._ataque + 10;
    const robo = Math.round(danio * 0.4);
    this.curarse(robo);
    return { danio, tipo: 'drenaje', texto: `${this.nombre} drena vida: ${danio} de danio y se cura ${robo}.` };
  }
}
