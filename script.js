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
let hechizosDisponibles = [];

// --- Enemigos ---
let enemigos = [];

async function cargarDatos() {
  const res = await fetch('data.json');
  const data = await res.json();
  hechizosDisponibles = data.hechizos;
  enemigos = data.enemigos;
}

// --- Escenas ---
const escenas = [
  {
    texto: (clase) => `Como ${clase}, despiertas entre hojas húmedas y el eco de criaturas lejanas. Una poción burbujea junto a ti, como si te esperara.`,
    opciones: [
      {
        texto: "Tomar poción misteriosa",
        accion: async () => {
          agregarItem({ nombre: "Poción de curación", tipo: "cura", efecto: 20, usos: 1 });
          cambiarVida(20);
          mostrarTexto("Sientes una energía cálida recorriendo tu cuerpo...");
          await esperar(2000);
          avanzarEscena();
        }
      },
      {
        texto: "Ignorar y adentrarte en el bosque",
        accion: async () => {
          mostrarTexto("Un escalofrío te recorre mientras avanzas sin preparación...");
          cambiarVida(-30);
          await esperar(2000);
          avanzarEscena();
        }
      }
    ]
  },
  {
    texto: () => "Los árboles se alzan como columnas negras. Un cruce con neblina se abre frente a ti.",
    opciones: [
      {
        texto: "Tomar el camino derecho",
        accion: async () => {
          mostrarTexto("De entre los arbustos, un lobo salvaje salta sobre ti con un gruñido feroz...");
          await esperar(2000);
          iniciarCombate(enemigos[0]);
        }
      },
      {
        texto: "Girar hacia la izquierda",
        accion: async () => {
          mostrarTexto("Encuentras un campamento olvidado. Una hoguera encendida te brinda descanso.");
          cambiarVida(maxVida);
          await esperar(2000);
          avanzarEscena();
        }
      },
      {
        texto: "Explorar el claro cercano",
        accion: async () => {
          mostrarTexto("Encuentras una pequeña caja de madera oculta bajo unas hojas. Dentro hay una llave antigua.");
          agregarItem({ nombre: "Llave antigua", tipo: "clave", usos: 1 });
          await esperar(2000);
          avanzarEscena();
        }
      }
    ]
  },
  {
    texto: () => "Sigues avanzando y encuentras un arroyo. El agua es cristalina y parece segura.",
    opciones: [
      {
        texto: "Beber agua del arroyo",
        accion: async () => {
          mostrarTexto("El agua te refresca y recuperas algo de salud.");
          cambiarVida(15);
          await esperar(1500);
          avanzarEscena();
        }
      },
      {
        texto: "Ignorar el arroyo y seguir adelante",
        accion: async () => {
          mostrarTexto("Sigues tu camino, pero el cansancio comienza a notarse.");
          cambiarVida(-10);
          await esperar(1500);
          avanzarEscena();
        }
      }
    ]
  },
  {
    texto: () => "Un puente colapsado cruza un abismo oscuro. El viento sopla como si te advirtiera.",
    opciones: (inventario) => {
      const baseOpciones = [
        {
          texto: "Intentar cruzar con cuidado",
          accion: async () => {
            const exito = Math.random() > 0.5;
            mostrarTexto(exito ? "Logras pasar, aunque tus pasos crujen sobre la madera vieja..." : "La tabla cede. Caída dolorosa.");
            if (!exito) cambiarVida(-50);
            await esperar(2000);
            avanzarEscena();
          }
        },
        {
          texto: "Buscar un camino alterno",
          accion: async () => {
            mostrarTexto("Encuentras un sendero que rodea el abismo, pero te toma más tiempo y energía.");
            cambiarVida(-15);
            await esperar(2000);
            avanzarEscena();
          }
        }
      ];
      // Solo muestra la opción de la llave si la tienes
      if (inventario.find(i => i.nombre === "Llave antigua")) {
        baseOpciones.push({
          texto: "Usar llave antigua para abrir un portón oculto",
          accion: async () => {
            mostrarTexto("Usas la llave antigua y abres un portón oculto bajo el puente. Encuentras un atajo seguro y avanzas sin peligro. La llave se rompe tras usarla.");
            inventario.splice(inventario.findIndex(i => i.nombre === "Llave antigua"), 1);
            actualizarIndicadorLlave();
            await esperar(2000);
            avanzarEscena();
          }
        });
      }
      return baseOpciones;
    }
  },
  {
    texto: () => "Tras cruzar el abismo, el bosque se vuelve más denso. Escuchas ruidos extraños y ves una sombra moverse entre los árboles.",
    opciones: [
      {
        texto: "Investigar la sombra",
        accion: async () => {
          mostrarTexto("Te acercas sigilosamente y descubres a un esqueleto armado.");
          await esperar(1500);
          iniciarCombate(enemigos[1]);
        }
      },
      {
        texto: "Evitar la sombra y avanzar rápido",
        accion: async () => {
          mostrarTexto("Logras evitar el peligro, pero te pierdes y das vueltas durante horas.");
          cambiarMana(-20);
          await esperar(1500);
          avanzarEscena();
        }
      }
    ]
  },
  {
    texto: () => "Encuentras una cabaña abandonada. Dentro hay una nota y una poción.",
    opciones: [
      {
        texto: "Leer la nota",
        accion: async () => {
          mostrarTexto("La nota dice: 'Solo los valientes llegarán al final. Confía en tu instinto.'");
          await esperar(1500);
          avanzarEscena();
        }
      },
      {
        texto: "Tomar la poción",
        accion: async () => {
          agregarItem({ nombre: "Poción de curación", tipo: "cura", efecto: 30, usos: 1 });
          mostrarTexto("Guardas la poción en tu inventario.");
          await esperar(1500);
          avanzarEscena();
        }
      },
      {
        texto: "Descansar un momento",
        accion: async () => {
          mostrarTexto("Recuperas algo de maná mientras descansas.");
          cambiarMana(20);
          await esperar(1500);
          avanzarEscena();
        }
      }
    ]
  },
  {
    texto: () => "Llegas a un claro. El silencio es antinatural. De la niebla surge una figura encapuchada con ojos brillantes.",
    opciones: [
      {
        texto: "Enfrentar al enemigo",
        accion: async () => {
          iniciarCombate(enemigos[2]);
        }
      },
      {
        texto: "Intentar dialogar",
        accion: async () => {
          mostrarTexto("La figura no responde y se prepara para atacar. ¡No hay escapatoria!");
          await esperar(1500);
          iniciarCombate(enemigos[2]);
        }
      }
    ]
  },
  {
    texto: () => "🌟 ¡Has superado la prueba del bosque! La oscuridad retrocede... por ahora.",
    opciones: [
      {
        texto: "🔁 Reiniciar aventura",
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
  if (textoEscena) textoEscena.textContent = texto;
}

// Cambiar pantalla activa
function mostrarPantalla(pantalla) {
  document.querySelectorAll('.pantalla').forEach(p => {
    p.classList.remove('activa');
  });
  if (pantalla) pantalla.classList.add('activa');
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
  if (claseActual) claseActual.textContent = clase;
  if (inventarioDOM) inventarioDOM.textContent = inventario.length > 0 ? inventario.map(i => i.nombre).join(', ') : "Vacío";
  mostrarTexto(typeof escena.texto === "function" ? escena.texto(clase) : escena.texto);

  if (botonesDecision) botonesDecision.innerHTML = '';

  // Soporte para opciones dinámicas (función que recibe inventario)
  let opciones = typeof escena.opciones === "function"
    ? escena.opciones(inventario)
    : escena.opciones;

  opciones.forEach(opcion => {
    const btn = document.createElement('button');
    btn.textContent = opcion.texto;
    btn.classList.add('btn-principal');
    btn.addEventListener('click', async () => {
      btn.disabled = true; // Evita doble click
      await opcion.accion();
    });
    if (botonesDecision) botonesDecision.appendChild(btn);
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
  if (inventarioDOM) inventarioDOM.textContent = inventario.map(i => i.nombre).join(', ');
  actualizarIndicadorLlave();
}

// --- Indicador de llave ---
function actualizarIndicadorLlave() {
  const indicador = document.getElementById('indicador-llave');
  const llave = inventario.find(i => i.nombre === "Llave antigua");
  if (indicador) {
    if (llave) {
      indicador.style.display = "block";
      indicador.textContent = `🔑 Llave antigua: 1 uso`;
    } else {
      indicador.style.display = "none";
      indicador.textContent = "";
    }
  }
}

// --- Actualizar HUD y barras con texto y colores
function actualizarHUD() {
  if (vidaActual) vidaActual.textContent = vida;
  if (manaActual) manaActual.textContent = mana;
  if (!vidaActual || !manaActual) return; 

  // Barras con porcentaje y texto dentro
  const porcentajeVida = (vida / maxVida) * 100;
  if (barraVida) barraVida.style.width = porcentajeVida + '%';
  if (textoBarraVida) textoBarraVida.textContent = `${vida} / ${maxVida}`;

  const porcentajeMana = (mana / maxMana) * 100;
  if (barraMana) barraMana.style.width = porcentajeMana + '%';
  if (textoBarraMana) textoBarraMana.textContent = `${mana} / ${maxMana}`;

  if (nivelActual) nivelActual.textContent = nivel;
  if (experienciaActual) experienciaActual.textContent = experiencia;

  // Actualizar inventario en pantalla de juego
  if (inventarioDOM) inventarioDOM.textContent = inventario.length > 0 ? inventario.map(i => i.nombre).join(', ') : "Vacío";
  actualizarIndicadorLlave();
}

// Calcular daño aleatorio
function dañoAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Habilitar o deshabilitar botones de combate
function habilitarBotonesCombate(habilitar) {
  if (btnAtacar) btnAtacar.disabled = !habilitar;
  if (btnMagia) btnMagia.disabled = !habilitar || mana <= 0;
  if (btnUsarItem) btnUsarItem.disabled = !habilitar;
}

// Función para iniciar combate
function iniciarCombate(enemigo) {
  enCombate = true;
  enemigoActual = { ...enemigo }; // Clonar enemigo para modificar vida sin afectar original
  mostrarPantalla(pantallaCombate);
  actualizarCombateHUD();
  if (textoCombate) textoCombate.textContent = `¡Un ${enemigoActual.nombre} salvaje aparece!`;
  habilitarBotonesCombate(true);
  if (hechizoInfo) hechizoInfo.textContent = '';
}

// Actualizar HUD combate
function actualizarCombateHUD() {
  if (vidaJugador) vidaJugador.textContent = vida;
  if (manaJugador) manaJugador.textContent = mana;
  if (vidaEnemigoSpan && enemigoActual) vidaEnemigoSpan.textContent = enemigoActual.vida;
}

// Turno del jugador: ataque físico
function turnoAtacar() {
  if (!enCombate) return;
  const daño = dañoAleatorio(10, 18);
  enemigoActual.vida -= daño;
  if (textoCombate) textoCombate.textContent = `¡Atacas al ${enemigoActual.nombre} y causas ${daño} de daño!`;
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
  if (mana <= 0) {
    if (textoCombate) textoCombate.textContent = "¡No tienes maná!";
    habilitarBotonesCombate(true);
    return;
  }
  // Seleccionamos hechizo aleatorio que pueda usar (tiene mana suficiente)
  const hechizosPosibles = hechizosDisponibles.filter(h => h.costo <= mana);
  if (hechizosPosibles.length === 0) {
    if (textoCombate) textoCombate.textContent = "No tienes suficiente maná para usar magia.";
    habilitarBotonesCombate(true);
    return;
  }
  const hechizo = hechizosPosibles[Math.floor(Math.random() * hechizosPosibles.length)];
  if (hechizoInfo) hechizoInfo.textContent = `Usas ${hechizo.nombre}`;
  cambiarMana(-hechizo.costo);

  if (hechizo.tipo === "daño") {
    enemigoActual.vida -= hechizo.daño;
    if (textoCombate) textoCombate.textContent = `¡Lanzas ${hechizo.nombre} y causas ${hechizo.daño} de daño!`;
    if (enemigoActual.vida <= 0) {
      enemigoActual.vida = 0;
      ganarCombate();
      return;
    }
  } else if (hechizo.tipo === "cura") {
    cambiarVida(hechizo.cura);
    if (textoCombate) textoCombate.textContent = `¡Usas ${hechizo.nombre} y te curas ${hechizo.cura} puntos!`;
  }
  actualizarCombateHUD();
  setTimeout(turnoEnemigo, 1500);
}

// Turno enemigo
function turnoEnemigo() {
  if (!enCombate) return;
  const daño = dañoAleatorio(enemigoActual.dañoMin, enemigoActual.dañoMax);
  cambiarVida(-daño);
  if (textoCombate) textoCombate.textContent = `${enemigoActual.nombre} te ataca y causa ${daño} de daño!`;
  actualizarCombateHUD();
  if (vida <= 0) return; // Ya murió y perdió el juego
  habilitarBotonesCombate(true);
}

// Usar ítem (poción)
function usarItem() {
  if (!enCombate) return;
  const pocion = inventario.find(i => i.tipo === "cura" && i.usos > 0);
  if (!pocion) {
    if (textoCombate) textoCombate.textContent = "No tienes pociones para usar.";
    if (btnUsarItem) btnUsarItem.disabled = true;
    return;
  }
  cambiarVida(pocion.efecto);
  pocion.usos--;
  if (textoCombate) textoCombate.textContent = `Usas una ${pocion.nombre} y recuperas ${pocion.efecto} de vida.`;
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
  if (textoCombate) textoCombate.textContent = `¡Has derrotado al ${enemigoActual.nombre}!`;
  experiencia += 50 + enemigoActual.dañoMax; // Recompensa ejemplo
  nivelUpCheck();
  setTimeout(() => {
    mostrarPantalla(pantallaJuego);
    avanzarEscena();
    actualizarHUD(); // <-- Aquí
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
    if (textoEscena) textoEscena.textContent = `¡Subiste a nivel ${nivel}! Salud y maná aumentados.`;
  }
  actualizarHUD();
}

// Perder juego
function perderJuego() {
  enCombate = false;
  mostrarPantalla(pantallaMuerte);
  const mensajeMuerte = document.getElementById('mensaje-muerte');
  if (mensajeMuerte) mensajeMuerte.textContent = "Has muerto... ¡Intenta de nuevo!";
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
  if (hechizoInfo) hechizoInfo.textContent = '';
  mostrarPantalla(pantallaBienvenida);
  actualizarHUD();
  if (textoEscena) textoEscena.textContent = '';
  if (botonesDecision) botonesDecision.innerHTML = '';
  actualizarIndicadorLlave();
}

// --- Botón continuar ---
function mostrarBotonContinuar() {
  // Evita duplicar el botón
  if (document.getElementById('btn-continuar')) return;
  const progresoGuardado = localStorage.getItem('progresoJuego');
  if (progresoGuardado && pantallaBienvenida) {
    const btnContinuar = document.createElement('button');
    btnContinuar.textContent = "▶️ Continuar";
    btnContinuar.className = "btn-principal";
    btnContinuar.id = "btn-continuar";
    btnContinuar.addEventListener('click', () => {
      const p = JSON.parse(localStorage.getItem('progresoJuego'));
      clase = p.clase;
      vida = p.vida;
      mana = p.mana;
      inventario = p.inventario;
      nivel = p.nivel;
      experiencia = p.experiencia;
      escenaActual = p.escenaActual;
      mostrarEscena();
      actualizarIndicadorLlave();
    });
    pantallaBienvenida.appendChild(btnContinuar);
  }
}

// --- Mensajes flotantes ---
function mostrarMensaje(texto) {
  const mensaje = document.getElementById('mensaje-flotante');
  if (mensaje) {
    mensaje.textContent = texto;
    mensaje.style.display = 'block';
    setTimeout(() => mensaje.style.display = 'none', 3000);
  }
}

// --- Event listeners ---
if (comenzarBtn) {
  comenzarBtn.addEventListener('click', () => {
    mostrarPantalla(pantallaClase);
  });
}

// Unificar listeners de selección de clase
claseBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    clase = btn.getAttribute('data-clase');
    if (clase === 'Guerrero') {
      vida = 130; mana = 60;
    } else if (clase === 'Mago') {
      vida = 90; mana = 130;
    } else if (clase === 'Pícaro') {
      vida = 110; mana = 90;
    }
    maxVida = vida;
    maxMana = mana;
    if (claseActual) claseActual.textContent = clase;
    mostrarEscena();
  });
});

if (reiniciarBtn) reiniciarBtn.addEventListener('click', reiniciarJuego);
if (reiniciarBtnMuerte) reiniciarBtnMuerte.addEventListener('click', reiniciarJuego);

if (btnAtacar) {
  btnAtacar.addEventListener('click', () => {
    habilitarBotonesCombate(false);
    turnoAtacar();
  });
}

if (btnMagia) {
  btnMagia.addEventListener('click', () => {
    habilitarBotonesCombate(false);
    turnoMagia();
  });
}

if (btnUsarItem) {
  btnUsarItem.addEventListener('click', () => {
    habilitarBotonesCombate(false);
    usarItem();
  });
}

const btnGuardar = document.getElementById('btn-guardar');
if (btnGuardar) {
  btnGuardar.addEventListener('click', () => {
    const progreso = {
      clase, vida, mana, inventario, nivel, experiencia, escenaActual
    };
    localStorage.setItem('progresoJuego', JSON.stringify(progreso));
    mostrarMensaje("Progreso guardado!");
    mostrarPantalla(pantallaBienvenida);
    mostrarBotonContinuar();
  });
}

const progresoGuardado = localStorage.getItem('progresoJuego');
if (progresoGuardado) {
  const btnCargar = document.createElement('button');
  btnCargar.textContent = "📂 Cargar Progreso";
  btnCargar.className = "btn-principal";
  btnCargar.addEventListener('click', () => {
    const p = JSON.parse(localStorage.getItem('progresoJuego'));
    clase = p.clase;
    vida = p.vida;
    mana = p.mana;
    inventario = p.inventario;
    nivel = p.nivel;
    experiencia = p.experiencia;
    escenaActual = p.escenaActual;
    mostrarEscena();
  });
  if (pantallaBienvenida) pantallaBienvenida.appendChild(btnCargar);
}

// --- Inicializar HUD ---
document.addEventListener('DOMContentLoaded', async () => {
  await cargarDatos();
  actualizarHUD();
  mostrarPantalla(pantallaBienvenida);
  mostrarBotonContinuar();
  actualizarIndicadorLlave();
});