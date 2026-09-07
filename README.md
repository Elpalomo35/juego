# CodeQuest RPG — La Academia de Héroes

RPG 2D **jugable en el navegador**, hecho con **Phaser 3 + Vite + JavaScript**.
Proyecto académico: demuestra en la práctica **POO** (clases, herencia,
polimorfismo, encapsulamiento, abstracción), **lógica de negocio** y
**arquitectura MVC** adaptada a videojuegos.

No es un cuestionario: controlas un héroe con el teclado, exploras un mapa,
abres cofres, hablas con NPC, chocas con enemigos y entras en combates por
turnos, ganas experiencia, subes de nivel y desbloqueas zonas nuevas.

---

## ETAPA 1 — Qué se conservó del proyecto anterior

El proyecto anterior (`../CodeQuest`) era un juego educativo de **preguntas por
niveles** en HTML/CSS/JS con MVC. Tenía **muy buenos modelos de POO** pero
**no era un videojuego**: no había mapa, ni movimiento, ni sprites.

| Se conservó (idea / diseño) | Se rehízo |
|---|---|
| La jerarquía de clases `Personaje → Enemigo → Goblin/Esqueleto/...` | Todo el código se pasó a **módulos ES** (`import/export`) para Vite |
| Las clases `Habilidad`, `Objeto`, `Inventario`, `Combate` | El combate ahora es **visual y por turnos** dentro de una escena de Phaser |
| La idea de "zonas que enseñan un concepto" | Las zonas ahora son **mapas reales recorribles**, no una lista de botones |
| La separación Modelo / Vista / Controlador | Las Vistas ahora son **escenas de Phaser** + clases `*View` |
| El sistema de experiencia y subida de nivel | Se encapsuló mejor: la vida es un campo **privado `#vida`** |

La carpeta vieja se deja intacta como referencia. El proyecto nuevo vive en
`codequest-rpg/` y es autónomo.

---

## ETAPA 2 — Qué instalar (paso a paso, sin dar nada por sabido)

### 1. Node.js (incluye `npm`)

Node.js es el motor que permite ejecutar herramientas de JavaScript fuera del
navegador. `npm` es su gestor de paquetes (descarga librerías como Phaser).

1. Entra en **https://nodejs.org**
2. Descarga la versión **LTS** para Windows (el botón grande de la izquierda,
   por ejemplo "20.x.x LTS").
3. Ejecuta el instalador `.msi` y pulsa *Next* en todo (deja las opciones por
   defecto; la casilla "Add to PATH" ya viene marcada).
4. **Cierra y vuelve a abrir** cualquier terminal / PowerShell que tuvieras
   abierto (para que reconozca el nuevo PATH).

### 2. Comprobar que funciona

Abre **PowerShell** y escribe:

```bash
node -v
```

Debe responder algo como `v20.11.1`. Ahora:

```bash
npm -v
```

Debe responder algo como `10.2.4`. Si ambos responden un número, ya está.

> No necesitas instalar Vite ni Phaser a mano: `npm` los instala solo con el
> siguiente paso, porque están apuntados en `package.json`.

### 3. Instalar las dependencias del proyecto

En PowerShell, sitúate en esta carpeta y ejecuta:

```bash
cd "C:\Users\Joel\Desktop\trabajo final\codequest-rpg"
```

```bash
npm install
```

Esto crea la carpeta `node_modules/` (unos 30–60 MB) con Phaser y Vite.
Solo hay que hacerlo **una vez** (o cuando cambie `package.json`).

### 4. Jugar en local

```bash
npm run dev
```

Vite levanta un servidor y abre el navegador en `http://localhost:5173`.
Deja esa terminal abierta mientras juegas. Para parar: `Ctrl + C`.

Cada vez que guardes un archivo, la página se recarga sola (*hot reload*).

---

## Controles

| Acción | Teclas |
|---|---|
| Mover al héroe | `W A S D` o flechas |
| Interactuar (cofre / NPC / avanzar diálogo) | `E` (o `ESPACIO` en diálogos) |
| Combate: Atacar / Defender / Habilidad / Objeto / Huir | `1` `2` `3` `4` `5` (o el ratón) |
| Cerrar submenú de combate | `ESC` |

Flujo del juego:

```
MENU  →  CREAR HÉROE  →  ZONA 1 (explorar)  →  chocar enemigo  →  COMBATE
      →  recompensa + subir nivel  →  limpiar zona  →  PUERTA se abre
      →  ZONA 2  →  ...  →  ZONA 3 (JEFE FINAL)  →  VICTORIA
```

---

## ETAPA 3–16 — Estructura del proyecto (MVC para videojuego)

```
codequest-rpg/
├─ index.html                 (Vista raíz: contiene el lienzo del juego)
├─ package.json / vite.config.js
├─ src/
│  ├─ main.js                 Punto de entrada: crea Phaser y registra escenas
│  ├─ config.js               Constantes globales (tamaños, colores)
│  │
│  ├─ models/                 ← MODELO (datos + reglas, sin Phaser)
│  │  ├─ Personaje.js         Clase BASE. #vida privada. atacar/recibirDanio/curarse
│  │  ├─ Jugador.js           extends Personaje. Experiencia, oro, subir de nivel
│  │  ├─ Guerrero.js Mago.js Arquero.js   extends Jugador (polimorfismo en atacar)
│  │  ├─ Enemigo.js           extends Personaje. IA: elegirAccion()
│  │  ├─ Goblin.js Esqueleto.js MagoEnemigo.js Jefe.js   extends Enemigo
│  │  ├─ Habilidad.js         Coste de energía, enfriamiento, efecto
│  │  ├─ Objeto.js / Inventario.js   Ítems (inventario con lista privada)
│  │  ├─ Combate.js           Máquina de turnos. TODA la lógica del combate
│  │  └─ Zona.js              Mapa: muros, enemigos, cofres, puerta + sus reglas
│  │
│  ├─ services/               ← SERVICIOS (reglas de negocio reutilizables)
│  │  ├─ ReglasCombate.js     Fórmulas puras (daño, huir, recompensa)
│  │  ├─ SistemaExperiencia.js  Aplica recompensas y detecta subidas de nivel
│  │  ├─ SistemaProgreso.js   Zonas desbloqueadas + guardar/cargar (localStorage)
│  │  └─ GeneradorTexturas.js Dibuja todos los sprites por código (sin descargas)
│  │
│  ├─ controllers/            ← CONTROLADOR (coordina Modelo ↔ Vista)
│  │  ├─ JuegoController.js    Estado global de la partida y transiciones
│  │  ├─ JugadorController.js  Fábrica del héroe según la clase elegida
│  │  └─ CombateController.js  Traduce botones → Combate → recompensas
│  │
│  ├─ views/                  ← VISTA (solo dibuja; nunca calcula)
│  │  ├─ HUDView.js           Barras de vida/energía/exp en exploración
│  │  ├─ CombateView.js       Barras, menú de acciones y registro del combate
│  │  └─ DialogoView.js       Cuadro de diálogo de los NPC
│  │
│  └─ scenes/                 ← VISTA + captura de input (escenas de Phaser)
│     ├─ BootScene.js         Genera texturas, crea el JuegoController
│     ├─ MenuScene.js         Pantalla de inicio
│     ├─ SeleccionPersonajeScene.js   Nombre + clase
│     ├─ GameScene.js         Exploración: mapa, movimiento, colisiones
│     ├─ CombatScene.js       Combate por turnos
│     ├─ GameOverScene.js     Derrota
│     └─ VictoryScene.js      Victoria final
└─ .github/workflows/deploy.yml   Publicación automática en GitHub Pages
```

### Cómo se ve el flujo MVC en un ataque

```
Jugador pulsa "1" (Atacar)
  → CombateView llama onAccion('atacar')                 [VISTA]
  → CombatScene._accion('atacar')                        [VISTA/control input]
  → CombateController.accion('atacar')                   [CONTROLADOR]
  → Combate.accionJugador('atacar')                      [MODELO]
        jugador.atacar(enemigo)        ← POLIMORFISMO (Guerrero/Mago/Arquero)
        enemigo.recibirDanio(daño)     ← ENCAPSULAMIENTO (baja la #vida validando)
        enemigo.elegirAccion(jugador)  ← ABSTRACCIÓN (la IA decide por dentro)
  → devuelve el nuevo estado
  → CombateView.actualizar(estado)                       [VISTA] redibuja barras
```

---

## Dónde está cada concepto de POO (para la exposición)

| Concepto | Archivo(s) | Cómo se demuestra |
|---|---|---|
| **Clases y objetos** | `models/*` | `new Goblin('Gruk')` crea un objeto; cada enemigo del mapa es una instancia |
| **Herencia** | `Personaje → Jugador → Guerrero` y `Personaje → Enemigo → Jefe` | Cadenas de 3 niveles con `extends` y `super()` |
| **Polimorfismo** | `atacar()` en `Guerrero`, `Mago`, `Arquero`, `Goblin`, `Esqueleto`, `MagoEnemigo`, `Jefe` | Mismo método, comportamiento distinto: físico / mágico / doble golpe / maldición / fases |
| **Encapsulamiento** | `Personaje` (`#vida`, `#energia`), `Jugador` (`#experiencia`, `#oro`), `Inventario` (`#objetos`) | Campos privados; solo cambian por métodos que validan (`recibirDanio`, `curarse`, `ganarExperiencia`) |
| **Abstracción** | `Combate.accionJugador()`, `Enemigo.elegirAccion()`, `Habilidad.ejecutar()` | Quien llama solo dice "atacar"/"usar habilidad"; el cálculo está oculto |

## Dónde está la lógica de negocio

- `Personaje.recibirDanio`: el daño mínimo es 1; la vida nunca baja de 0.
- `Personaje.curarse`: la vida nunca supera la máxima.
- `Habilidad.sePuedeUsar`: no hay habilidad sin energía o en enfriamiento.
- `Combate._jugadorHuye`: **no se puede huir de un Jefe**.
- `Combate._comprobarEnemigo`: el **Esqueleto resucita una vez**.
- `Jefe.verificarFase`: al 50% de vida entra en **Fase 2**.
- `Zona.puertaAbierta`: la puerta solo se abre si **todos los enemigos** cayeron.
- `Zona.abrirCofre`: un cofre **solo se abre una vez**.
- `Zona.marcarEnemigoDerrotado`: un enemigo derrotado **no reaparece**.
- `SistemaProgreso.completarZona`: completar una zona **desbloquea la siguiente**.

---

## ETAPA 16 — Publicar gratis en Internet (GitHub Pages)

Se eligió **GitHub Pages** porque el juego es 100% estático (HTML/JS) y el
despliegue queda **automático** con el archivo `.github/workflows/deploy.yml`
ya incluido.

### Una sola vez

1. Crea una cuenta en **https://github.com** (si no la tienes).
2. Instala **Git**: https://git-scm.com/download/win (Next a todo).
3. Crea un repositorio nuevo vacío en GitHub, por ejemplo `codequest-rpg`
   (sin README, sin .gitignore).
4. En PowerShell, dentro de `codequest-rpg/`:

```bash
git init
```
```bash
git add .
```
```bash
git commit -m "CodeQuest RPG - version jugable"
```
```bash
git branch -M main
```
```bash
git remote add origin https://github.com/TU_USUARIO/codequest-rpg.git
```
```bash
git push -u origin main
```

5. En GitHub: **Settings → Pages → Build and deployment → Source: "GitHub Actions"**.

### Cada vez que quieras publicar cambios

```bash
git add .
```
```bash
git commit -m "describe el cambio"
```
```bash
git push
```

En 1–2 minutos (pestaña **Actions** del repo) el juego queda publicado en:

```
https://TU_USUARIO.github.io/codequest-rpg/
```

Ese es el enlace que compartes en la exposición. Cualquiera lo abre, espera a
que cargue, pulsa **NUEVA PARTIDA** y juega. No hay que instalar nada.

### Probar la versión de producción en local (opcional)

```bash
npm run build
```
```bash
npm run preview
```

Abre el `http://localhost:4173` que indique: es exactamente lo que verá el
público.

---

## Cómo seguir ampliando (etapas siguientes)

- **Más zonas / enemigos:** añade otro objeto al array de `crearZonas()` en
  `models/Zona.js`. Los modelos de enemigo ya existen.
- **Nuevas habilidades:** añádelas en `crearHabilidades()` de `models/Habilidad.js`.
- **Sprites reales:** sustituye `GeneradorTexturas.js` por `this.load.image(...)`
  en `BootScene`; **no hay que tocar la lógica**.
- **Mapas con Tiled:** carga un `.json` de Tiled en `GameScene._dibujarMapa()`.
