// ============================================================
// SERVICIO: Animaciones.js
// ------------------------------------------------------------
// Convierte los fotogramas generados en GeneradorTexturas.js
// en ANIMACIONES de Phaser (idle, walk, attack, hurt) para
// cada personaje. Se registran una sola vez, en BootScene.
//
// GameScene y CombateView solo hacen sprite.play('goblin_walk').
// ============================================================

const PERSONAJES = [
  'pj_guerrero', 'pj_mago', 'pj_arquero',
  'goblin', 'esqueleto', 'mago', 'jefe', 'npc'
];

export function registrarAnimaciones(scene) {
  PERSONAJES.forEach(k => {
    if (scene.anims.exists(`${k}_idle`)) return;

    scene.anims.create({
      key: `${k}_idle`,
      frames: [{ key: `${k}_idle0` }, { key: `${k}_idle1` }],
      frameRate: 2, repeat: -1
    });
    scene.anims.create({
      key: `${k}_walk`,
      frames: [0, 1, 2, 3].map(i => ({ key: `${k}_walk${i}` })),
      frameRate: 9, repeat: -1
    });
    scene.anims.create({
      key: `${k}_attack`,
      frames: [
        { key: `${k}_attack0`, duration: 130 },
        { key: `${k}_attack1`, duration: 90 },
        { key: `${k}_attack2`, duration: 140 }
      ],
      repeat: 0
    });
    scene.anims.create({
      key: `${k}_hurt`,
      frames: [{ key: `${k}_hurt` }],
      frameRate: 1, repeat: 0
    });
  });
}
