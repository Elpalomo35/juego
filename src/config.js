// ============================================================
// CONFIGURACION GLOBAL DEL JUEGO
// ------------------------------------------------------------
// Constantes usadas por varias partes del proyecto.
// Tenerlas en un solo sitio hace facil ajustar el balance
// del juego sin tocar la logica.
// ============================================================

export const CONFIG = {
  ANCHO: 960,
  ALTO: 640,
  TILE: 40,               // tamano de cada casilla del mapa en pixeles
  VELOCIDAD_JUGADOR: 190, // pixeles por segundo
  COLOR_FONDO: '#0b0d17'
};

// Colores de entidades (hex numerico que entiende Phaser)
export const PALETA = {
  suelo:     0x2b3450,
  sueloAlt:  0x343f61,
  muro:      0x5a4a7a,
  muroBorde: 0x8a7ab5,
  jugador:   0x6c63ff,
  goblin:    0x4caf50,
  esqueleto: 0xd8d8d8,
  mago:      0x9c27b0,
  jefe:      0xff5252,
  cofre:     0xf5a623,
  puerta:    0x8d6e63,
  npc:       0x29b6f6,
  texto:     '#e8ecff'
};
