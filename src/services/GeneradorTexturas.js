// ============================================================
// SERVICIO: GeneradorTexturas.js
// ------------------------------------------------------------
// Dibuja POR CODIGO todos los personajes del juego como
// figuras con volumen (cabeza, torso con sombreado, brazos,
// piernas, arma y sombra en el suelo) y genera VARIOS
// FOTOGRAMAS por personaje para poder animarlos:
//
//   idle0/idle1      -> respiracion
//   walk0..walk3     -> ciclo de caminar
//   attack0..attack2 -> anticipacion / golpe / recuperacion
//   hurt             -> recibir dano
//
// Animaciones.js convierte esos fotogramas en animaciones de
// Phaser. GameScene y CombateView solo las reproducen.
// ============================================================

import { CONFIG, PALETA } from '../config.js';

const T = CONFIG.TILE;

// Ancho / alto del lienzo de cada fotograma de personaje.
const W = 76, H = 68;
const CX = 34;        // centro horizontal
const SUELO = 58;     // linea del suelo (pies)

// Oscurece un color hex para el sombreado.
function shade(c, f = 0.62) {
  const r = Math.round(((c >> 16) & 255) * f);
  const g = Math.round(((c >> 8) & 255) * f);
  const b = Math.round((c & 255) * f);
  return (r << 16) | (g << 8) | b;
}

// ------------------------------------------------------------
// DIBUJO DE UN PERSONAJE EN UNA POSE CONCRETA
// ------------------------------------------------------------
function brazo(g, cfg, sx, sy, ang, largo = 12) {
  const ex = sx + Math.cos(ang) * largo;
  const ey = sy + Math.sin(ang) * largo;
  g.lineStyle(5, cfg.manga || cfg.cuerpo, 1);
  g.lineBetween(sx, sy, ex, ey);
  g.fillStyle(cfg.piel, 1);
  g.fillCircle(ex, ey, 3);
  return { x: ex, y: ey };
}

function arma(g, cfg, x, y, ang) {
  const a = cfg.arma;
  if (!a || a === 'ninguna') return;
  const dx = Math.cos(ang), dy = Math.sin(ang);
  if (a === 'espada') {
    g.lineStyle(3.5, 0xdfe4f5, 1);
    g.lineBetween(x, y, x + dx * 18, y + dy * 18);
    g.lineStyle(2, 0x9aa2bf, 1);
    g.lineBetween(x, y, x + dx * 17, y + dy * 17);
    g.lineStyle(3, cfg.armaColor || 0xf2b23a, 1);
    g.lineBetween(x - dy * 4, y + dx * 4, x + dy * 4, y - dx * 4);
  } else if (a === 'baston') {
    g.lineStyle(3, 0x6b4a2a, 1);
    g.lineBetween(x - dx * 5, y - dy * 5, x + dx * 15, y + dy * 15);
    g.fillStyle(cfg.armaColor || 0xffd34d, 1);
    g.fillCircle(x + dx * 16, y + dy * 16, 4);
    g.fillStyle(0xffffff, 0.55);
    g.fillCircle(x + dx * 16 - 1, y + dy * 16 - 1, 1.6);
  } else if (a === 'arco') {
    g.lineStyle(3, cfg.armaColor || 0x8a5a2a, 1);
    g.beginPath(); g.arc(x, y, 13, ang - 1.15, ang + 1.15); g.strokePath();
    g.lineStyle(1, 0xdddddd, 1);
    g.lineBetween(x + Math.cos(ang - 1.15) * 13, y + Math.sin(ang - 1.15) * 13,
                  x + Math.cos(ang + 1.15) * 13, y + Math.sin(ang + 1.15) * 13);
  } else if (a === 'daga') {
    g.fillStyle(0xcfd6e6, 1);
    g.fillTriangle(x - dy * 2, y + dx * 2, x + dy * 2, y - dx * 2, x + dx * 11, y + dy * 11);
  } else if (a === 'hueso') {
    g.lineStyle(4, 0xe8e6da, 1);
    g.lineBetween(x, y, x + dx * 13, y + dy * 13);
    g.fillStyle(0xe8e6da, 1);
    g.fillCircle(x, y, 3); g.fillCircle(x + dx * 13, y + dy * 13, 3);
  }
}

function cabello(g, cfg, x, y) {
  if (cfg.orejas) {
    g.fillStyle(cfg.piel, 1);
    g.fillTriangle(x - 7, y - 3, x - 17, y - 7, x - 6, y + 4);
    g.fillTriangle(x + 7, y - 3, x + 17, y - 7, x + 6, y + 4);
    g.fillStyle(cfg.pielS, 1);
    g.fillTriangle(x - 8, y - 1, x - 14, y - 5, x - 7, y + 2);
  }
  if (cfg.gorro === 'punta') {
    g.fillStyle(cfg.gorroS || shade(cfg.gorroColor), 1);
    g.fillEllipse(x, y - 5, 24, 7);
    g.fillStyle(cfg.gorroColor, 1);
    g.beginPath(); g.moveTo(x - 10, y - 5); g.lineTo(x + 10, y - 5); g.lineTo(x + 3, y - 24); g.closePath(); g.fillPath();
    g.fillStyle(shade(cfg.gorroColor, 0.8), 1);
    g.beginPath(); g.moveTo(x + 2, y - 5); g.lineTo(x + 10, y - 5); g.lineTo(x + 3, y - 24); g.closePath(); g.fillPath();
  } else if (cfg.gorro === 'capucha') {
    g.fillStyle(cfg.gorroColor, 1);
    g.beginPath();
    g.arc(x, y - 1, 12, Math.PI * 1.02, Math.PI * 1.98);
    g.lineTo(x + 8, y + 7); g.lineTo(x - 8, y + 7); g.closePath(); g.fillPath();
    g.fillStyle(shade(cfg.gorroColor), 1);
    g.fillTriangle(x + 1, y - 16, x - 4, y - 8, x + 5, y - 7);
  } else if (cfg.gorro === 'casco') {
    g.fillStyle(cfg.gorroColor, 1);
    g.beginPath(); g.arc(x, y, 9.5, Math.PI, 0); g.closePath(); g.fillPath();
    g.fillRect(x - 9.5, y - 1, 19, 3.5);
    g.fillStyle(shade(cfg.gorroColor), 1);
    g.fillRect(x + 2, y - 8, 8, 8);
    if (cfg.cuernos) {
      g.fillStyle(cfg.cuernos, 1);
      g.fillTriangle(x - 7, y - 6, x - 13, y - 18, x - 3, y - 8);
      g.fillTriangle(x + 7, y - 6, x + 13, y - 18, x + 3, y - 8);
    }
  } else if (cfg.pelo) {
    g.fillStyle(cfg.pelo, 1);
    g.beginPath(); g.arc(x, y - 1, 9, Math.PI * 0.92, Math.PI * 2.08); g.closePath(); g.fillPath();
    g.fillRect(x - 9, y - 4, 3.5, 7);
    g.fillRect(x + 5.5, y - 4, 3.5, 7);
    g.fillStyle(shade(cfg.pelo, 0.8), 1);
    g.fillRect(x + 2, y - 8, 6, 4);
  }
  if (cfg.barba) {
    g.fillStyle(cfg.barba, 1);
    g.fillRoundedRect(x - 5, y + 3, 10, 8, 3);
  }
}

function dibujarPersonaje(g, cfg, pose) {
  const bob = pose.bob || 0;
  const ox = pose.ox || 0;
  const lean = pose.lean || 0;
  const paso = pose.paso || 0;

  const torsoX = CX + ox;
  const torsoY = 34 + bob;

  // sombra en el suelo
  g.fillStyle(0x000000, 0.22);
  g.fillEllipse(CX, SUELO + 1, 30, 8);

  // capa (detras del cuerpo)
  if (cfg.capa) {
    g.fillStyle(shade(cfg.capa, 0.8), 1);
    g.beginPath();
    g.moveTo(torsoX - 9, torsoY - 12);
    g.lineTo(torsoX + 9, torsoY - 12);
    g.lineTo(torsoX + 13 + lean * 0.4, SUELO - 3);
    g.lineTo(torsoX - 11 + lean * 0.4, SUELO - 3);
    g.closePath(); g.fillPath();
  }

  // piernas o tunica
  if (cfg.tunica) {
    g.fillStyle(cfg.piernas, 1);
    g.beginPath();
    g.moveTo(torsoX - 10, torsoY + 2);
    g.lineTo(torsoX + 10, torsoY + 2);
    g.lineTo(torsoX + 14 + lean * 0.3, SUELO);
    g.lineTo(torsoX - 14 + lean * 0.3, SUELO);
    g.closePath(); g.fillPath();
    g.fillStyle(shade(cfg.piernas), 1);
    g.fillTriangle(torsoX + 2, torsoY + 2, torsoX + 10, torsoY + 2, torsoX + 14 + lean * 0.3, SUELO);
    g.fillStyle(shade(cfg.piernas, 0.85), 1);
    g.fillRect(torsoX - 1, torsoY + 4, 2, SUELO - torsoY - 4);
  } else {
    const izqX = torsoX - 5 - paso * 4;
    const derX = torsoX + 5 + paso * 4;
    const corte = Math.abs(paso) * 3;
    g.fillStyle(cfg.piernas, 1);
    g.fillRoundedRect(izqX - 3.5, torsoY + 2, 7, 17 - corte, 3);
    g.fillRoundedRect(derX - 3.5, torsoY + 2, 7, 17 - corte, 3);
    g.fillStyle(shade(cfg.piernas), 1);
    g.fillRoundedRect(derX - 1, torsoY + 2, 4, 17 - corte, 2);
    g.fillStyle(cfg.botas, 1);
    g.fillRoundedRect(izqX - 4.5, SUELO - 6, 10, 6, 2);
    g.fillRoundedRect(derX - 4.5, SUELO - 6, 10, 6, 2);
  }

  // brazo trasero
  brazo(g, cfg, torsoX - 8, torsoY - 9, pose.brazoTras ?? 2.3);

  // torso con sombreado
  g.lineStyle(2, cfg.linea || 0x141420, 1);
  g.fillStyle(cfg.cuerpo, 1);
  g.fillRoundedRect(torsoX - 10, torsoY - 15, 20, 21, 5);
  g.strokeRoundedRect(torsoX - 10, torsoY - 15, 20, 21, 5);
  g.fillStyle(cfg.cuerpoS, 0.9);
  g.fillRoundedRect(torsoX + 1, torsoY - 13, 8, 17, 4);
  g.fillStyle(0xffffff, 0.13);
  g.fillRoundedRect(torsoX - 8, torsoY - 13, 7, 6, 3);
  if (cfg.costillas) {
    g.lineStyle(1.5, shade(cfg.cuerpo, 0.5), 1);
    for (let i = 0; i < 3; i++) g.lineBetween(torsoX - 7, torsoY - 9 + i * 5, torsoX + 7, torsoY - 9 + i * 5);
  }
  if (cfg.cinturon) { g.fillStyle(cfg.cinturon, 1); g.fillRect(torsoX - 10, torsoY + 2, 20, 4); }

  // cabeza
  const cabX = torsoX + lean * 0.5;
  const cabY = torsoY - 23;
  g.lineStyle(2, cfg.linea || 0x141420, 1);
  g.fillStyle(cfg.piel, 1);
  g.fillCircle(cabX, cabY, 8);
  g.strokeCircle(cabX, cabY, 8);
  g.fillStyle(cfg.pielS, 0.75);
  g.beginPath(); g.arc(cabX, cabY, 8, -0.25, 2.3); g.lineTo(cabX, cabY); g.closePath(); g.fillPath();

  cabello(g, cfg, cabX, cabY);

  // ojos
  const oy = cabY + 1;
  const ex = 3;
  if (cfg.ojosBrillo) {
    g.fillStyle(0x000000, 1);
    g.fillCircle(cabX - ex, oy, 3); g.fillCircle(cabX + ex, oy, 3);
    g.fillStyle(cfg.ojos || 0xff4d4d, 1);
    g.fillCircle(cabX - ex, oy, 2); g.fillCircle(cabX + ex, oy, 2);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(cabX - ex - 0.5, oy - 0.5, 0.7); g.fillCircle(cabX + ex - 0.5, oy - 0.5, 0.7);
  } else {
    g.fillStyle(cfg.ojos || 0x20232f, 1);
    g.fillEllipse(cabX - ex, oy, 2.6, 3.4);
    g.fillEllipse(cabX + ex, oy, 2.6, 3.4);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(cabX - ex - 0.6, oy - 0.8, 0.7);
  }

  // brazo delantero + arma
  const hx = torsoX + 9, hy = torsoY - 9;
  const ang = pose.brazoDel ?? 1.0;
  const mano = brazo(g, cfg, hx, hy, ang);
  arma(g, cfg, mano.x, mano.y, pose.armaAng ?? ang);
}

// ------------------------------------------------------------
// POSES (angulos en radianes; bob/ox/lean en px)
// ------------------------------------------------------------
export const POSES = {
  idle0:   { bob: 0.0, brazoTras: 2.35, brazoDel: 1.05, armaAng: 1.25, paso: 0.0, lean: 0 },
  idle1:   { bob: -1.3, brazoTras: 2.45, brazoDel: 0.98, armaAng: 1.18, paso: 0.0, lean: 0 },
  walk0:   { bob: -1.0, brazoTras: 1.9, brazoDel: 1.55, armaAng: 1.4, paso: 0.95, lean: 2 },
  walk1:   { bob: 0.8, brazoTras: 2.35, brazoDel: 1.05, armaAng: 1.2, paso: 0.0, lean: 0 },
  walk2:   { bob: -1.0, brazoTras: 2.8, brazoDel: 0.55, armaAng: 0.95, paso: -0.95, lean: 2 },
  walk3:   { bob: 0.8, brazoTras: 2.35, brazoDel: 1.05, armaAng: 1.2, paso: 0.0, lean: 0 },
  attack0: { bob: -1.0, brazoTras: 2.7, brazoDel: -1.5, armaAng: -1.9, paso: -0.35, lean: -6, ox: -4 },
  attack1: { bob: 1.5, brazoTras: 1.5, brazoDel: 0.35, armaAng: 0.55, paso: 0.7, lean: 9, ox: 7 },
  attack2: { bob: 0.3, brazoTras: 2.1, brazoDel: 0.9, armaAng: 1.1, paso: 0.15, lean: 3, ox: 2 },
  hurt:    { bob: 0.0, brazoTras: 3.1, brazoDel: 2.5, armaAng: 2.1, paso: -0.25, lean: -13, ox: -5 }
};

// ------------------------------------------------------------
// CONFIGURACION VISUAL DE CADA PERSONAJE
// ------------------------------------------------------------
export const PERSONAJES = {
  pj_guerrero: { piel: 0xf0c79a, pielS: 0xcf9d72, pelo: 0x6b3f16, cuerpo: 0xc6ccdc, cuerpoS: 0x878fab, manga: 0xaeb5cb, cinturon: 0x5a3a10, piernas: 0x33507a, botas: 0x241a12, capa: 0x9c2b2b, arma: 'espada', armaColor: 0xf2b23a, linea: 0x14141f },
  pj_mago: { piel: 0xf0c79a, pielS: 0xcf9d72, gorro: 'punta', gorroColor: 0x2e4a9e, gorroS: 0x1c2f6b, cuerpo: 0x35589c, cuerpoS: 0x243d78, manga: 0x35589c, cinturon: 0xd8a13a, tunica: true, piernas: 0x2f4d92, botas: 0x1a1a1a, arma: 'baston', armaColor: 0xffd34d, linea: 0x121226 },
  pj_arquero: { piel: 0xf0c79a, pielS: 0xcf9d72, gorro: 'capucha', gorroColor: 0x2e6b3a, cuerpo: 0x3f8a4c, cuerpoS: 0x2c6537, manga: 0x357a43, cinturon: 0x5a4632, piernas: 0x5a4632, botas: 0x2a1e12, arma: 'arco', armaColor: 0x8a5a2a, linea: 0x142015 },
  goblin: { piel: 0x64a832, pielS: 0x3f7220, orejas: true, cuerpo: 0x7a4a2a, cuerpoS: 0x5a3319, manga: 0x64a832, cinturon: 0x3a2a18, piernas: 0x64a832, botas: 0x3f7220, arma: 'daga', linea: 0x14210a, ojos: 0xffe14d, ojosBrillo: true },
  esqueleto: { piel: 0xe8e6da, pielS: 0xb4b1a2, cuerpo: 0xcdcabb, cuerpoS: 0x9a9788, manga: 0xd8d6c8, cinturon: 0x8a8578, piernas: 0xd8d6c8, botas: 0x8a8578, arma: 'hueso', linea: 0x2a2a2a, ojos: 0x101018, costillas: true },
  mago: { piel: 0xb9a0c8, pielS: 0x8b7a9e, gorro: 'punta', gorroColor: 0x1a1030, gorroS: 0x0e0820, cuerpo: 0x2a1440, cuerpoS: 0x180a2a, manga: 0x2a1440, cinturon: 0x6a2fa0, tunica: true, piernas: 0x24123a, botas: 0x120a1e, arma: 'baston', armaColor: 0xb64dff, linea: 0x0a0512, ojos: 0xff4d4d, ojosBrillo: true },
  jefe: { piel: 0x7a3232, pielS: 0x521f1f, gorro: 'casco', gorroColor: 0x3a3550, cuernos: 0xd9d9e0, cuerpo: 0x4a4560, cuerpoS: 0x2c2942, manga: 0x3a3550, cinturon: 0x6a1220, piernas: 0x2f2b45, botas: 0x141018, capa: 0x7a1220, arma: 'espada', armaColor: 0xb0b6c8, linea: 0x08060e, ojos: 0xff3030, ojosBrillo: true },
  npc: { piel: 0xf0c79a, pielS: 0xcf9d72, pelo: 0x9a9a9a, barba: 0xe8e8e8, cuerpo: 0x2f8fd0, cuerpoS: 0x1c6ea8, manga: 0x2f8fd0, cinturon: 0x6b4a2a, tunica: true, piernas: 0x2c7fb8, botas: 0x3a2a1a, arma: 'ninguna', linea: 0x14202a }
};

function generarFrames(scene, key, cfg) {
  Object.entries(POSES).forEach(([nombre, pose]) => {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    dibujarPersonaje(g, cfg, pose);
    g.generateTexture(`${key}_${nombre}`, W, H);
    g.destroy();
  });
  // textura base (para add.sprite antes de reproducir animacion)
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  dibujarPersonaje(g, cfg, POSES.idle0);
  g.generateTexture(key, W, H);
  g.destroy();
}

// ============================================================
// TILES Y OBJETOS DEL MAPA
// ============================================================
function tileSuelo(scene, key, base, punto) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(base, 1); g.fillRect(0, 0, T, T);
  g.fillStyle(punto, 0.6);
  const pts = [[7, 9], [24, 6], [12, 27], [30, 20], [5, 33]];
  pts.forEach(([x, y]) => g.fillRect(x, y, 3, 3));
  g.lineStyle(1, 0x000000, 0.16); g.strokeRect(0, 0, T, T);
  g.generateTexture(key, T, T); g.destroy();
}

function tileMuro(scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(PALETA.muro, 1); g.fillRect(0, 0, T, T);
  g.fillStyle(shade(PALETA.muro, 0.75), 1);
  g.fillRect(0, T / 2 - 1, T, 2);
  g.fillRect(T / 2 - 1, 0, 2, T / 2);
  g.fillRect(T / 4 - 1, T / 2, 2, T / 2);
  g.fillRect((3 * T) / 4 - 1, T / 2, 2, T / 2);
  g.fillStyle(PALETA.muroBorde, 0.9); g.fillRect(0, 0, T, 3);
  g.lineStyle(2, 0x000000, 0.22); g.strokeRect(1, 1, T - 2, T - 2);
  g.generateTexture('muro', T, T); g.destroy();
}

function cofreCerrado(scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const s = 34;
  g.fillStyle(0x000000, 0.2); g.fillEllipse(s / 2, s - 3, 26, 6);
  g.fillStyle(0x8a5a1e, 1); g.fillRoundedRect(3, 12, s - 6, 18, 3);
  g.fillStyle(0xc98a34, 1); g.fillRoundedRect(3, 6, s - 6, 10, 4);
  g.fillStyle(0x5a3a10, 1); g.fillRect(3, 14, s - 6, 3);
  g.fillRect(s / 2 - 2, 4, 4, 26);
  g.fillStyle(0xffe9a8, 1); g.fillCircle(s / 2, 18, 2.5);
  g.lineStyle(1.5, 0x000000, 0.3); g.strokeRoundedRect(3, 6, s - 6, 24, 3);
  g.generateTexture('cofre', s, s); g.destroy();
}

function cofreAbierto(scene) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const s = 34;
  g.fillStyle(0x000000, 0.2); g.fillEllipse(s / 2, s - 3, 26, 6);
  g.fillStyle(0x8a5a1e, 1); g.fillRoundedRect(3, 14, s - 6, 16, 3);
  g.fillStyle(0x5a3a10, 1); g.fillRoundedRect(3, 2, s - 6, 10, 3);
  g.fillStyle(0xffe9a8, 0.9); g.fillEllipse(s / 2, 16, 16, 6);
  g.lineStyle(1.5, 0x000000, 0.3); g.strokeRoundedRect(3, 14, s - 6, 16, 3);
  g.generateTexture('cofre_abierto', s, s); g.destroy();
}

function puertas(scene) {
  let g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0x6b4a3a, 1); g.fillRect(0, 0, T, T);
  g.fillStyle(0x4a2f26, 1); g.fillRect(3, 2, T - 6, T - 4);
  g.fillStyle(0x35201a, 1);
  g.fillRect(T / 2 - 2, 6, 4, T - 12);
  g.fillRect(8, T / 2 - 2, T - 16, 4);
  g.fillStyle(0x2a1712, 1); g.fillCircle(T - 10, T / 2, 2);
  g.lineStyle(3, 0xd9534f, 1); g.strokeCircle(T / 2, T / 2 - 1, 6);
  g.fillStyle(0xd9534f, 1); g.fillRoundedRect(T / 2 - 5, T / 2 - 1, 10, 9, 2);
  g.generateTexture('puerta', T, T); g.destroy();

  g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0x6b4a3a, 1); g.fillRect(0, 0, T, T);
  g.fillStyle(0x0b0d17, 1); g.fillRect(6, 3, T - 12, T - 4);
  g.fillStyle(0x5aa469, 1);
  g.fillRect(2, 0, 4, T); g.fillRect(T - 6, 0, 4, T); g.fillRect(0, 0, T, 4);
  g.fillStyle(0x7bd492, 0.4); g.fillRect(6, 3, 4, T - 4);
  g.generateTexture('puerta_abierta', T, T); g.destroy();
}

// ============================================================
export function generarTexturas(scene) {
  Object.entries(PERSONAJES).forEach(([key, cfg]) => generarFrames(scene, key, cfg));

  tileSuelo(scene, 'suelo', PALETA.suelo, PALETA.sueloAlt);
  tileSuelo(scene, 'sueloAlt', PALETA.sueloAlt, PALETA.suelo);
  tileMuro(scene);
  cofreCerrado(scene);
  cofreAbierto(scene);
  puertas(scene);

  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xffffff, 1); g.fillCircle(4, 4, 4);
  g.generateTexture('chispa', 8, 8); g.destroy();
}
