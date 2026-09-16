// ============================================================
// MODELO: Zona.js
// ------------------------------------------------------------
// CONCEPTO MVC: MODELO. Describe cada area del mundo:
//   tamano del mapa, muros, enemigos, cofres, NPC y la puerta
//   de salida hacia la siguiente zona.
//
// CONCEPTO POO: la clase Zona guarda ESTADO de juego
//   (enemigos derrotados, cofres abiertos) y expone metodos
//   que aplican las REGLAS DE NEGOCIO:
//     * puertaAbierta(): solo si se derrotaron todos los enemigos.
//     * abrirCofre(id): un cofre solo se abre una vez.
//
// Las coordenadas de entidades estan en CASILLAS (no pixeles).
// GameScene las multiplica por CONFIG.TILE para dibujarlas.
// ============================================================

import { Goblin } from './Goblin.js';
import { Esqueleto } from './Esqueleto.js';
import { MagoEnemigo } from './MagoEnemigo.js';
import { Jefe } from './Jefe.js';

export class Zona {
  constructor(datos) {
    this.id          = datos.id;
    this.nombre      = datos.nombre;
    this.concepto    = datos.concepto;     // resumen corto (1 linea)
    this.briefing    = datos.briefing;     // { historia, concepto, ejemplo, objetivo }
    this.anchoTiles  = datos.anchoTiles;
    this.altoTiles   = datos.altoTiles;
    this.obstaculos  = datos.obstaculos;   // [{x,y,w,h}] en casillas
    this.entrada     = datos.entrada;      // {x,y} donde aparece el jugador
    this.puerta      = datos.puerta;       // {x,y,destino}  destino=null => jefe final ya
    this.npcs        = datos.npcs || [];
    this._enemigos   = datos.enemigos;     // [{id,x,y,fabricar}]
    this._cofres     = datos.cofres;       // [{id,x,y,recompensa}]

    // ESTADO mutable de la partida
    this.enemigosDerrotados = new Set();
    this.cofresAbiertos     = new Set();
  }

  // Enemigos que siguen vivos en el mapa.
  enemigosActivos() {
    return this._enemigos.filter(e => !this.enemigosDerrotados.has(e.id));
  }

  cofresDisponibles() {
    return this._cofres.filter(c => !this.cofresAbiertos.has(c.id));
  }

  // REGLA DE NEGOCIO: enemigo derrotado no reaparece.
  marcarEnemigoDerrotado(id) {
    this.enemigosDerrotados.add(id);
  }

  // REGLA DE NEGOCIO: un cofre solo se abre una vez.
  abrirCofre(id) {
    if (this.cofresAbiertos.has(id)) return null;
    const cofre = this._cofres.find(c => c.id === id);
    if (!cofre) return null;
    this.cofresAbiertos.add(id);
    return cofre.recompensa;
  }

  // REGLA DE NEGOCIO: la puerta solo se abre al limpiar la zona.
  puertaAbierta() {
    return this.enemigosDerrotados.size >= this._enemigos.length;
  }

  totalEnemigos() { return this._enemigos.length; }
}

// ============================================================
// FABRICA: crearZonas()
// Devuelve las zonas del juego ya construidas.
// (Empieza con 3 zonas completas y jugables; anadir mas es
//  solo agregar otro objeto a este array.)
// ============================================================
export function crearZonas() {
  return [
    new Zona({
      id: 1,
      nombre: 'Bosque de los Duendes',
      concepto: 'Clases y Objetos: cada duende es un OBJETO de la clase Goblin.',
      briefing: {
        historia: 'Los duendes han infestado el bosque de entrada a la Academia. Son debiles pero atacan en grupo. Limpialos para abrir el paso al este.',
        concepto: 'CLASES Y OBJETOS. La CLASE Goblin define, UNA sola vez, los atributos (vida, ataque...) y metodos (atacar, recibirDanio...) que tendra cualquier duende. Cada "new Goblin(...)" crea una INSTANCIA: un objeto real en memoria, con esa misma plantilla pero con su propio estado. Por eso los 3 duendes se comportan igual pero cada uno tiene su vida y su nombre por separado.',
        ejemplo: 'const gruk = new Goblin("Gruk");   // instancia 1\nconst nok  = new Goblin("Nok");    // instancia 2 (misma clase)',
        objetivo: 'Derrota a los 3 duendes. Abre los 2 cofres (tecla E). Habla con el Anciano (tecla E).'
      },
      anchoTiles: 24, altoTiles: 16,
      entrada: { x: 2, y: 2 },
      obstaculos: [
        { x: 6, y: 2, w: 1, h: 6 },
        { x: 10, y: 9, w: 6, h: 1 },
        { x: 16, y: 3, w: 1, h: 5 },
        { x: 3, y: 11, w: 5, h: 1 },
        { x: 19, y: 10, w: 1, h: 4 }
      ],
      npcs: [
        { x: 3, y: 4, nombre: 'Anciano del Bosque',
          dialogo: ['Bienvenido, heroe.', 'Derrota a los 3 duendes para abrir la puerta del este.', 'Usa WASD o las flechas para moverte. Pulsa E junto a un cofre.'] }
      ],
      enemigos: [
        { id: 'z1e1', x: 11, y: 3, fabricar: () => new Goblin('Gruk') },
        { id: 'z1e2', x: 8,  y: 12, fabricar: () => new Goblin('Skrix') },
        { id: 'z1e3', x: 20, y: 6, fabricar: () => new Goblin('Nok') }
      ],
      cofres: [
        { id: 'z1c1', x: 22, y: 2, recompensa: { tipo: 'objeto', valor: 'pocion_media' } },
        { id: 'z1c2', x: 4,  y: 13, recompensa: { tipo: 'exp', valor: 40 } }
      ],
      puerta: { x: 22, y: 8, destino: 2 }
    }),

    new Zona({
      id: 2,
      nombre: 'Criptas del Encapsulamiento',
      concepto: 'Encapsulamiento: la vida es privada (#) y solo cambia con metodos.',
      briefing: {
        historia: 'Bajo la Academia se extienden criptas llenas de esqueletos y un nigromante. Los esqueletos vuelven a levantarse una vez: no bajes la guardia.',
        concepto: 'ENCAPSULAMIENTO. #vida y #energia son CAMPOS PRIVADOS de la clase Personaje: el simbolo # los hace invisibles e inaccesibles fuera de ella, ni siquiera Jugador o Enemigo (sus propias subclases) pueden leerlos directo. La unica forma de cambiarlos es a traves de metodos publicos (recibirDanio, curarse) que validan una regla fija: la vida nunca es negativa ni supera el maximo.',
        ejemplo: 'goblin.#vida = -50;          // ERROR: campo privado, no compila\ngoblin.recibirDanio(50);     // OK: el metodo valida y limita',
        objetivo: 'Derrota a los 4 enemigos para abrir la puerta al norte. Guarda pociones para el jefe.'
      },
      anchoTiles: 24, altoTiles: 16,
      entrada: { x: 2, y: 8 },
      obstaculos: [
        { x: 5, y: 1, w: 1, h: 9 },
        { x: 9, y: 6, w: 8, h: 1 },
        { x: 13, y: 7, w: 1, h: 7 },
        { x: 17, y: 2, w: 1, h: 6 },
        { x: 6, y: 12, w: 6, h: 1 }
      ],
      npcs: [
        { x: 3, y: 10, nombre: 'Guardiana Osea',
          dialogo: ['Estas criptas guardan secretos.', 'Los esqueletos resucitan una vez... prepara tus habilidades.', 'Limpia la zona para pasar al norte.'] }
      ],
      enemigos: [
        { id: 'z2e1', x: 8,  y: 3, fabricar: () => new Esqueleto('Hueso Roto') },
        { id: 'z2e2', x: 15, y: 4, fabricar: () => new Esqueleto('Calavera') },
        { id: 'z2e3', x: 10, y: 10, fabricar: () => new MagoEnemigo('Nigromante') },
        { id: 'z2e4', x: 20, y: 11, fabricar: () => new Esqueleto('Centinela') }
      ],
      cofres: [
        { id: 'z2c1', x: 22, y: 2, recompensa: { tipo: 'objeto', valor: 'pocion_grande' } },
        { id: 'z2c2', x: 2,  y: 14, recompensa: { tipo: 'objeto', valor: 'bomba' } },
        { id: 'z2c3', x: 18, y: 14, recompensa: { tipo: 'exp', valor: 80 } }
      ],
      puerta: { x: 12, y: 1, destino: 3 }
    }),

    new Zona({
      id: 3,
      nombre: 'Fortaleza del Jefe Final',
      concepto: 'Polimorfismo + Abstraccion: mismo atacar(), el Jefe responde a su manera.',
      briefing: {
        historia: 'La fortaleza del Senor de las Sombras. Sus guardias y el propio jefe usan el mismo metodo atacar() que un simple duende... pero el resultado no se parece en nada.',
        concepto: 'POLIMORFISMO y ABSTRACCION. Todas las subclases SOBRESCRIBEN (override) el metodo atacar() heredado de Personaje: el Guerrero da un golpe fisico, el Mago lanza un hechizo, el Goblin pega dos veces, el Jefe cambia de fase al 50% de vida. Combate.js llama siempre a personaje.atacar() sin preguntar de que clase es cada uno: JavaScript decide en tiempo de ejecucion cual version ejecutar (enlace dinamico). Esa es la ABSTRACCION: el codigo que llama no conoce los detalles internos, solo el contrato comun (atacar, elegirAccion).',
        ejemplo: 'for (const p of personajes) p.atacar(objetivo);\n// mismo codigo -> cada objeto responde segun SU clase',
        objetivo: 'Derrota a los 2 guardianes y al Jefe Final. No se puede huir del Jefe. Al 50% de vida entra en Fase 2.'
      },
      anchoTiles: 24, altoTiles: 16,
      entrada: { x: 12, y: 14 },
      obstaculos: [
        { x: 4, y: 4, w: 4, h: 1 },
        { x: 16, y: 4, w: 4, h: 1 },
        { x: 4, y: 10, w: 4, h: 1 },
        { x: 16, y: 10, w: 4, h: 1 }
      ],
      npcs: [
        { x: 12, y: 12, nombre: 'Espiritu Guia',
          dialogo: ['Aqui espera el Senor de las Sombras.', 'Al bajar del 50% de vida cambiara de fase.', 'No podras huir. Buena suerte.'] }
      ],
      enemigos: [
        { id: 'z3e1', x: 6,  y: 3, fabricar: () => new MagoEnemigo('Guardian Arcano') },
        { id: 'z3e2', x: 18, y: 3, fabricar: () => new Esqueleto('Campeon Caido') },
        { id: 'z3boss', x: 12, y: 4, fabricar: () => new Jefe('Senor de las Sombras', { vida: 185, ataque: 19, defensa: 11, expRecompensa: 160, oroRecompensa: 120 }) }
      ],
      cofres: [
        { id: 'z3c1', x: 2,  y: 2, recompensa: { tipo: 'objeto', valor: 'pocion_grande' } },
        { id: 'z3c2', x: 22, y: 2, recompensa: { tipo: 'objeto', valor: 'eter' } }
      ],
      puerta: { x: 12, y: 1, destino: null }   // destino null => al limpiar la zona = VICTORIA
    })
  ];
}
