// --- Variables y elementos DOM ---
const pantallaBienvenida = document.getElementById('pantalla-bienvenida');
const pantallaClase = document.getElementById('pantalla-clase');
const pantallaJuego = document.getElementById('pantalla-juego');
const pantallaMuerte = document.getElementById('pantalla-muerte');
const pantallaCombate = document.getElementById('pantalla-combate');

const comenzarBtn = document.getElementById('comenzar-btn');
const claseBtns = document.querySelectorAll('.clase-btn');
const reiniciarBtn = document.getElementById('reiniciar-btn');
const reiniciarBtnMuerte = document.getElementById('reiniciar-btn-muerte');

const claseActual = document.getElementById('clase-actual');
const inventarioDOM = document.getElementById('inventario');
const textoEscena = document.getElementById('texto-escena');
const botonesDecision = document.getElementById('botones-decision');

const vidaActual = document.getElementById('vida-actual');
const manaActual = document.getElementById('mana-actual');
const barraVida = document.getElementById('barra-vida');
const barraMana = document.getElementById('barra-mana');
const textoBarraVida = document.getElementById('texto-barra-vida');
const textoBarraMana = document.getElementById('texto-barra-mana');

const nivelActual = document.getElementById('nivel-actual');
const experienciaActual = document.getElementById('experiencia-actual');

const vidaJugador = document.getElementById('vida-jugador');
const manaJugador = document.getElementById('mana-jugador');
const vidaEnemigoSpan = document.getElementById('vida-enemigo');
const textoCombate = document.getElementById('texto-combate');

const btnAtacar = document.getElementById('btn-atacar');
const btnMagia = document.getElementById('btn-magia');
const btnUsarItem = document.getElementById('btn-usar-item');

const hechizoInfo = document.getElementById('hechizo-info');

// --- Estado del jugador ---
let clase = '';
let vida = 100;
let mana = 100;
let inventario = [];
let nivel = 1;
let experiencia = 0;
let maxVida = 100;
let maxMana = 100;

let escenaActual = 0;

// --- Estado de combate ---
let enCombate = false;
let enemigoActual = null;

// --- Hechizos ---
const hechizosDisponibles = [
  { nombre: "Bola de Fuego", tipo: "daño", daño: 30, costo: 25 },
  { nombre: "Rayo Helado", tipo: "daño", daño: 20, costo: 15 },
  { nombre: "Sanación", tipo: "cura", cura: 25, costo: 20 },
  { nombre: "Viento Arcano", tipo: "daño", daño: 15, costo: 10 },
  { nombre: "Luz Sagrada", tipo: "cura", cura: 35, costo: 30 }
];

// --- Enemigos ---
const enemigos = [
  { nombre: "Lobo", vida: 40, dañoMin: 5, dañoMax: 12 },
  { nombre: "Esqueleto", vida: 50, dañoMin: 8, dañoMax: 15 },
  { nombre: "Jefe Sombra", vida: 80, dañoMin: 10, dañoMax: 20 }
];

// --- Escenas ---
const escenas = [
  {
    texto: (clase) => `Como ${clase}, despiertas en un bosque oscuro. Una poción brilla cerca.`,
    opciones: [
      {
        texto: "Tomar poción",
        accion: async () => {
          agregarItem({ nombre: "Poción de curación", tipo: "cura", efecto: 20, usos: 1 });
          cambiarVida(20);
          await esperar(1200);
          avanzarEscena();
        }
      },
      {
        texto: "Ignorar y seguir",
        accion: async () => {
          cambiarVida(-30);
          await esperar(1200);
          avanzarEscena();
        }
      }
    ]
  },
  {
    texto: () => "Te adentras en el bosque. Un cruce aparece frente a ti.",
    opciones: [
      {
        texto: "Ir a la derecha",
        accion: async () => {
          mostrarTexto("Un lobo salvaje te embosca...");
          await esperar(1500);
          iniciarCombate(enemigos[0]);
        }
      },
      {
        texto: "Ir a la izquierda",
        accion: async () => {
          mostrarTexto("Encuentras un viejo campamento y descansas.");
          cambiarVida(maxVida);
          await esperar(1500);
          avanzarEscena();
        }
      }
    ]
  },
  {
    texto: () => "Un puente roto bloquea el camino.",
    opciones: [
      {
        texto: "Intentar cruzar",
        accion: async () => {
          const exito = Math.random() > 0.5;
          mostrarTexto(exito ? "¡Logras cruzar con éxito!" : "Caes y te golpeas gravemente.");
          if (!exito) cambiarVida(-50);
          await esperar(1500);
          avanzarEscena();
        }
      },
      {
        texto: "Buscar otro camino",
        accion: async () => {
          mostrarTexto("Encuentras un pasadizo secreto.");
          agregarItem({ nombre: "Llave antigua", tipo: "clave" });
          await esperar(1500);
          avanzarEscena();
        }
      }
    ]
  },
  {
    texto: () => "Has llegado al claro del bosque. Un enemigo poderoso te espera.",
    opciones: [
      {
        texto: "Prepararte para luchar",
        accion: async () => {
          iniciarCombate(enemigos[2]);
        }
      }
    ]
  },
  {
    texto: () => "¡Felicidades! Has completado la aventura.",
    opciones: [
      {
        texto: "Reiniciar juego",
        accion: () => reiniciarJuego()
      }
    ]
  }
];

// --- Funciones principales ---

// Utilidad para esperar
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mostrar texto en la escena
function mostrarTexto(texto) {
  textoEscena.textContent = texto;
}

// Cambiar pantalla activa
function mostrarPantalla(pantalla) {
  [pantallaBienvenida, pantallaClase, pantallaJuego, pantallaCombate, pantallaMuerte].forEach(p => {
    p.classList.remove('activa');
    p.classList.add('oculto');
  });
  pantalla.classList.add('activa');
  pantalla.classList.remove('oculto');
}

// Avanzar escena
function avanzarEscena() {
  escenaActual++;
  if (escenaActual >= escenas.length) {
    escenaActual = escenas.length - 1;
  }
  mostrarEscena();
}

// Mostrar escena actual
function mostrarEscena() {
  const escena = escenas[escenaActual];
  mostrarPantalla(pantallaJuego);
  claseActual.textContent = clase;
  inventarioDOM.textContent = inventario.length > 0 ? inventario.map(i => i.nombre).join(', ') : "Vacío";
  mostrarTexto(typeof escena.texto === "function" ? escena.texto(clase) : escena.texto);

  botonesDecision.innerHTML = '';
  escena.opciones.forEach(opcion => {
    const btn = document.createElement('button');
    btn.textContent = opcion.texto;
    btn.classList.add('btn-principal');
    btn.addEventListener('click', async () => {
      btn.disabled = true; // Evita doble click
      await opcion.accion();
    });
    botonesDecision.appendChild(btn);
  });
  actualizarHUD();
}

// Cambiar vida jugador
function cambiarVida(cantidad) {
  vida += cantidad;
  if (vida > maxVida) vida = maxVida;
  if (vida <= 0) {
    vida = 0;
    perderJuego();
  }
  actualizarHUD();
}

// Cambiar mana jugador
function cambiarMana(cantidad) {
  mana += cantidad;
  if (mana > maxMana) mana = maxMana;
  if (mana < 0) mana = 0;
  actualizarHUD();
}

// Agregar item al inventario
function agregarItem(item) {
  inventario.push(item);
  inventarioDOM.textContent = inventario.map(i => i.nombre).join(', ');
}

// Actualizar HUD y barras con texto y colores
function actualizarHUD() {
  vidaActual.textContent = vida;
  manaActual.textContent = mana;

  // Barras con porcentaje y texto dentro
  const porcentajeVida = (vida / maxVida) * 100;
  barraVida.style.width = porcentajeVida + '%';
  textoBarraVida.textContent = `${Math.round(porcentajeVida)}%`;

  const porcentajeMana = (mana / maxMana) * 100;
  barraMana.style.width = porcentajeMana + '%';
  textoBarraMana.textContent = `${Math.round(porcentajeMana)}%`;

  nivelActual.textContent = nivel;
  experienciaActual.textContent = experiencia;

  // Actualizar inventario en pantalla de juego
  inventarioDOM.textContent = inventario.length > 0 ? inventario.map(i => i.nombre).join(', ') : "Vacío";
}

// Calcular daño aleatorio
function dañoAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Función para iniciar combate
function iniciarCombate(enemigo) {
  enCombate = true;
  enemigoActual = { ...enemigo }; // Clonar enemigo para modificar vida sin afectar original
  mostrarPantalla(pantallaCombate);
  actualizarCombateHUD();
  textoCombate.textContent = `¡Un ${enemigoActual.nombre} salvaje aparece!`;
  habilitarBotonesCombate(true);
  hechizoInfo.textContent = '';
}

// Actualizar HUD combate
function actualizarCombateHUD() {
  vidaJugador.textContent = vida;
  manaJugador.textContent = mana;
  vidaEnemigoSpan.textContent = enemigoActual.vida;
}

// Habilitar o deshabilitar botones de combate
function habilitarBotonesCombate(habilitar) {
  btnAtacar.disabled = !habilitar;
  btnMagia.disabled = !habilitar || mana <= 0;
  btnUsarItem.disabled = !habilitar || !inventario.some(i => i.tipo === "cura" && i.usos > 0);
}

// Turno del jugador: ataque físico
function turnoAtacar() {
  if (!enCombate) return;
  const daño = dañoAleatorio(10, 18);
  enemigoActual.vida -= daño;
  textoCombate.textContent = `¡Atacas al ${enemigoActual.nombre} y causas ${daño} de daño!`;
  if (enemigoActual.vida <= 0) {
    enemigoActual.vida = 0;
    ganarCombate();
  } else {
    actualizarCombateHUD();
    setTimeout(turnoEnemigo, 1500);
  }
}

// Turno del jugador: usar magia
function turnoMagia() {
  if (!enCombate) return;
  // Seleccionamos hechizo aleatorio que pueda usar (tiene mana suficiente)
  const hechizosPosibles = hechizosDisponibles.filter(h => h.costo <= mana);
  if (hechizosPosibles.length === 0) {
    textoCombate.textContent = "No tienes suficiente maná para usar magia.";
    return;
  }
  const hechizo = hechizosPosibles[Math.floor(Math.random() * hechizosPosibles.length)];
  hechizoInfo.textContent = `Usas ${hechizo.nombre}`;
  cambiarMana(-hechizo.costo);

  if (hechizo.tipo === "daño") {
    enemigoActual.vida -= hechizo.daño;
    textoCombate.textContent = `¡Lanzas ${hechizo.nombre} y causas ${hechizo.daño} de daño!`;
    if (enemigoActual.vida <= 0) {
      enemigoActual.vida = 0;
      actualizarCombateHUD();
      ganarCombate();
      return;
    }
  } else if (hechizo.tipo === "cura") {
    cambiarVida(hechizo.cura);
    textoCombate.textContent = `¡Usas ${hechizo.nombre} y te curas ${hechizo.cura} puntos!`;
  }
  actualizarCombateHUD();
  setTimeout(turnoEnemigo, 1500);
}

// Turno enemigo
function turnoEnemigo() {
  if (!enCombate) return;
  const daño = dañoAleatorio(enemigoActual.dañoMin, enemigoActual.dañoMax);
  cambiarVida(-daño);
  textoCombate.textContent = `${enemigoActual.nombre} te ataca y causa ${daño} de daño!`;
  actualizarCombateHUD();
  if (vida <= 0) return; // Ya murió y perdió el juego
  habilitarBotonesCombate(true);
}

// Usar ítem (poción)
function usarItem() {
  if (!enCombate) return;
  const pocion = inventario.find(i => i.tipo === "cura" && i.usos > 0);
  if (!pocion) {
    textoCombate.textContent = "No tienes pociones para usar.";
    btnUsarItem.disabled = true;
    return;
  }
  cambiarVida(pocion.efecto);
  pocion.usos--;
  textoCombate.textContent = `Usas una ${pocion.nombre} y recuperas ${pocion.efecto} de vida.`;
  if (pocion.usos === 0) {
    inventario = inventario.filter(i => i.usos > 0);
  }
  actualizarHUD();
  actualizarCombateHUD();
  habilitarBotonesCombate(false);
  setTimeout(turnoEnemigo, 1500);
}

// Ganar combate
function ganarCombate() {
  enCombate = false;
  textoCombate.textContent = `¡Has derrotado al ${enemigoActual.nombre}!`;
  experiencia += 50 + enemigoActual.dañoMax; // Recompensa ejemplo
  nivelUpCheck();
  setTimeout(() => {
    mostrarPantalla(pantallaJuego);
    avanzarEscena();
  }, 2000);
}

// Verificar subida de nivel
function nivelUpCheck() {
  if (experiencia >= 100) {
    experiencia -= 100;
    nivel++;
    maxVida += 20;
    maxMana += 15;
    vida = maxVida;
    mana = maxMana;
    textoEscena.textContent = `¡Subiste a nivel ${nivel}! Salud y maná aumentados.`;
  }
  actualizarHUD();
}

// Perder juego
function perderJuego() {
  enCombate = false;
  mostrarPantalla(pantallaMuerte);
  const mensajeMuerte = document.getElementById('mensaje-muerte');
  mensajeMuerte.textContent = "Has muerto... ¡Intenta de nuevo!";
}

// Reiniciar juego
function reiniciarJuego() {
  clase = '';
  vida = 100;
  mana = 100;
  maxVida = 100;
  maxMana = 100;
  inventario = [];
  nivel = 1;
  experiencia = 0;
  escenaActual = 0;
  enCombate = false;
  enemigoActual = null;
  hechizoInfo.textContent = '';
  mostrarPantalla(pantallaBienvenida);
  actualizarHUD();
  textoEscena.textContent = '';
  botonesDecision.innerHTML = '';
}

// --- Event listeners ---
comenzarBtn.addEventListener('click', () => {
  mostrarPantalla(pantallaClase);
});

claseBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    clase = btn.getAttribute('data-clase');
    claseActual.textContent = clase;
    mostrarEscena();
  });
});

reiniciarBtn.addEventListener('click', reiniciarJuego);
reiniciarBtnMuerte.addEventListener('click', reiniciarJuego);

btnAtacar.addEventListener('click', () => {
  habilitarBotonesCombate(false);
  turnoAtacar();
});

btnMagia.addEventListener('click', () => {
  habilitarBotonesCombate(false);
  turnoMagia();
});

btnUsarItem.addEventListener('click', () => {
  habilitarBotonesCombate(false);
  usarItem();
});

// --- Inicializar HUD ---
actualizarHUD();
mostrarPantalla(pantallaBienvenida);
