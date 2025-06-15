const pantallaBienvenida = document.getElementById('pantalla-bienvenida');
const pantallaClase = document.getElementById('pantalla-clase');
const pantallaJuego = document.getElementById('pantalla-juego');
const pantallaMuerte = document.getElementById('pantalla-muerte');
const pantallaCombate = document.getElementById('pantalla-combate');

const comenzarBtn = document.getElementById('comenzar-btn');
const claseBtns = document.querySelectorAll('.clase-btn');
const reiniciarBtn = document.getElementById('reiniciar-btn');

const claseActual = document.getElementById('clase-actual');
const vidaActual = document.getElementById('vida-actual');
const inventarioDOM = document.getElementById('inventario');
const textoEscena = document.getElementById('texto-escena');
const botonesDecision = document.getElementById('botones-decision');

const vidaJugador = document.getElementById('vida-jugador');
const manaJugador = document.getElementById('mana-jugador');
const vidaEnemigoSpan = document.getElementById('vida-enemigo');
const textoCombate = document.getElementById('texto-combate');

let vida = 100;
let mana = 100;
let clase = "";
let inventario = [];
let escenaActual = 0;
let vidaEnemigo = 50;

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

comenzarBtn.addEventListener('click', () => {
  pantallaBienvenida.classList.add('oculto');
  pantallaClase.classList.remove('oculto');
});

claseBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    clase = btn.dataset.clase;
    pantallaClase.classList.add('oculto');
    pantallaJuego.classList.remove('oculto');
    claseActual.textContent = clase;
    iniciarHistoria();
  });
});

reiniciarBtn.addEventListener('click', () => {
  reiniciarJuego();
});

function iniciarHistoria() {
  escenaActual = 0;
  vida = 100;
  mana = 100;
  inventario = [];
  actualizarHUD();
  mostrarEscena();
}

function mostrarEscena() {
  botonesDecision.innerHTML = '';
  switch (escenaActual) {
    case 0:
      textoEscena.textContent = `Como ${clase}, despiertas en un bosque oscuro. Una poción brilla cerca.`;
      crearBoton("Tomar poción", async () => {
        agregarItem("Poción de curación");
        cambiarVida(20);
        escenaActual++;
        await esperar(1000);
        mostrarEscena();
      });
      crearBoton("Ignorar y seguir", async () => {
        cambiarVida(-30);
        escenaActual++;
        await esperar(1000);
        mostrarEscena();
      });
      break;

    case 1:
      textoEscena.textContent = "Te adentras en el bosque. Un cruce aparece frente a ti.";
      crearBoton("Ir a la derecha", async () => {
        textoEscena.textContent = "Un lobo salvaje te embosca...";
        await esperar(1500);
        cambiarVida(-100);
        if (vida > 0) {
          escenaActual++;
          mostrarEscena();
        }
      });
      crearBoton("Ir a la izquierda", async () => {
        textoEscena.textContent = "Encuentras un viejo campamento y descansas.";
        cambiarVida(100);
        escenaActual++;
        await esperar(2000);
        mostrarEscena();
      });
      break;

    case 2:
      textoEscena.textContent = "Un puente roto bloquea el camino.";
      crearBoton("Intentar cruzar", async () => {
        const exito = Math.random() > 0.5;
        if (exito) {
          textoEscena.textContent = "¡Logras cruzar con éxito!";
        } else {
          textoEscena.textContent = "Caes y te golpeas gravemente.";
          cambiarVida(-50);
        }
        escenaActual++;
        await esperar(2000);
        mostrarEscena();
      });
      crearBoton("Buscar otro camino", async () => {
        textoEscena.textContent = "Encuentras un pasadizo secreto.";
        agregarItem("Llave antigua");
        escenaActual++;
        await esperar(2000);
        mostrarEscena();
      });
      break;

    case 3:
      textoEscena.textContent = "Un enemigo bloquea el camino. ¡Prepárate para pelear!";
      crearBoton("Entrar en combate", () => {
        iniciarCombate();
      });
      break;

    case 4:
      textoEscena.textContent = "Después del combate, encuentras una puerta cerrada.";
      if (inventario.includes("Llave antigua")) {
        crearBoton("Usar llave", async () => {
          textoEscena.textContent = "La puerta se abre. ¡Has escapado!";
          escenaActual++;
          await esperar(2000);
          mostrarEscena();
        });
      } else {
        crearBoton("Forzar la puerta", async () => {
          textoEscena.textContent = "Te haces daño forzando la puerta.";
          cambiarVida(-20);
          escenaActual++;
          await esperar(2000);
          mostrarEscena();
        });
      }
      break;

    case 5:
      textoEscena.textContent = "Has llegado a la salida. Una sombra se alza detrás tuyo.";
      crearBoton("Enfrentar a la sombra", () => {
        iniciarCombateFinal();
      });
      crearBoton("Huir rápidamente", async () => {
        textoEscena.textContent = "Corres hacia la luz... ¡has sobrevivido!";
        await esperar(3000);
        mostrarPantallaMuerte("final-bueno");
      });
      break;

    default:
      textoEscena.textContent = "Fin del juego.";
      break;
  }
}

function crearBoton(texto, accion) {
  const btn = document.createElement('button');
  btn.textContent = texto;
  btn.addEventListener('click', () => {
    botonesDecision.innerHTML = ''; 
    accion(); 
  });
  botonesDecision.appendChild(btn);
}

function cambiarVida(cantidad) {
  vida += cantidad;
  if (vida > 100) vida = 100;
  if (vida <= 0) {
    vida = 0;
    actualizarHUD();
    setTimeout(() => mostrarPantallaMuerte("muerte"), 1000);
    return;
  }
  actualizarHUD();
}

function cambiarMana(cantidad) {
  mana += cantidad;
  if (mana > 100) mana = 100;
  if (mana < 0) mana = 0;
  actualizarHUD();
}

function agregarItem(item) {
  inventario.push(item);
  actualizarHUD();
}

function actualizarHUD() {
  vidaActual.textContent = vida;
  inventarioDOM.textContent = inventario.length > 0 ? inventario.join(', ') : 'Vacío';
  manaJugador.textContent = mana;
}

function mostrarPantallaMuerte(tipo = "muerte") {
  pantallaJuego.classList.add('oculto');
  pantallaCombate.classList.add('oculto');
  pantallaMuerte.classList.remove('oculto');

  const mensaje = document.getElementById("mensaje-muerte");
  if (tipo === "final-bueno") {
    mensaje.textContent = "¡Has logrado escapar con vida!";
  } else {
    mensaje.textContent = "Has muerto. Tu aventura termina aquí.";
  }
}

function reiniciarJuego() {
  vida = 100;
  mana = 100;
  clase = "";
  inventario = [];
  escenaActual = 0;
  pantallaMuerte.classList.add('oculto');
  pantallaBienvenida.classList.remove('oculto');
}

async function turnoJugador(tipo) {
  if (tipo === "atacar") {
    const daño = Math.floor(Math.random() * 15) + 5;
    vidaEnemigo -= daño;
    textoCombate.textContent = `Atacaste e hiciste ${daño} de daño.`;
  } else if (tipo === "magia" && mana >= 20) {
    const daño = Math.floor(Math.random() * 25) + 10;
    vidaEnemigo -= daño;
    cambiarMana(-20);
    textoCombate.textContent = `Usaste magia e hiciste ${daño} de daño.`;
  } else {
    textoCombate.textContent = "No tienes suficiente maná.";
    return;
  }

  actualizarHUDCombate();

  if (vidaEnemigo <= 0) {
    textoCombate.textContent = "¡Has vencido al enemigo!";
    await esperar(1500);
    pantallaCombate.classList.add('oculto');
    pantallaJuego.classList.remove('oculto');
    escenaActual++;
    mostrarEscena();
  } else {
    await esperar(1000);
    turnoEnemigo();
  }
}

function turnoEnemigo() {
  const daño = Math.floor(Math.random() * 12) + 5;
  textoCombate.textContent = `El enemigo te golpea con ${daño} de daño.`;
  cambiarVida(-daño);
  actualizarHUDCombate();
}

function actualizarHUDCombate() {
  vidaJugador.textContent = vida;
  manaJugador.textContent = mana;
  vidaEnemigoSpan.textContent = vidaEnemigo;
}

function iniciarCombate() {
  pantallaJuego.classList.add('oculto');
  pantallaCombate.classList.remove('oculto');
  vidaEnemigo = 50;
  actualizarHUDCombate();
  textoCombate.textContent = "¡Un enemigo aparece!";
}

function iniciarCombateFinal() {
  pantallaJuego.classList.add('oculto');
  pantallaCombate.classList.remove('oculto');
  vidaEnemigo = 80;
  actualizarHUDCombate();
  textoCombate.textContent = "¡El enemigo final aparece!";
}

// Acciones del jugador
document.getElementById('btn-atacar').addEventListener('click', () => turnoJugador("atacar"));
document.getElementById('btn-magia').addEventListener('click', () => turnoJugador("magia"));
document.getElementById('btn-usar-item').addEventListener('click', () => {
  if (inventario.includes("Poción de curación")) {
    cambiarVida(20);
    inventario.splice(inventario.indexOf("Poción de curación"), 1);
    textoCombate.textContent = "Usaste una poción. Recuperaste 20 de vida.";
    actualizarHUD();
    setTimeout(turnoEnemigo, 1000);
  } else {
    textoCombate.textContent = "No tienes pociones.";
  }
});
