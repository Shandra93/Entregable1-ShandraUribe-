// Elementos
const pantallaBienvenida = document.getElementById('pantalla-bienvenida');
const pantallaClase = document.getElementById('pantalla-clase');
const pantallaJuego = document.getElementById('pantalla-juego');
const pantallaMuerte = document.getElementById('pantalla-muerte');

const comenzarBtn = document.getElementById('comenzar-btn');
const claseBtns = document.querySelectorAll('.clase-btn');

const claseActual = document.getElementById('clase-actual');
const vidaActual = document.getElementById('vida-actual');
const inventarioDOM = document.getElementById('inventario');
const textoEscena = document.getElementById('texto-escena');
const botonesDecision = document.getElementById('botones-decision');

// Variables del juego
let vida = 100;
let clase = "";
let inventario = [];

// Eventos
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

// Funciones
function iniciarHistoria() {
  textoEscena.textContent = `Como ${clase}, despiertas en un bosque oscuro. Una poción brilla cerca.`;
  botonesDecision.innerHTML = '';

  crearBoton("Tomar poción", () => {
    cambiarVida(20);
    agregarItem("Poción de curación");
    textoEscena.textContent = "Recibes: Pocion";
    botonesDecision.innerHTML = '';
    crearBoton("Avanzar", () => {
      avanzarEscena();
    });
  });

  crearBoton("Ignorar y seguir", () => {
    cambiarVida(-30);
    textoEscena.textContent = "Un monstruo te ataca por sorpresa. Estás herido.";
    botonesDecision.innerHTML = '';
    crearBoton("Escapar", () => {
      avanzarEscena();
    });
  });
}

function avanzarEscena() {
  textoEscena.textContent = "Te adentras en el bosque. Un cruce aparece frente a ti.";
  botonesDecision.innerHTML = '';
  crearBoton("Ir a la derecha", () => {
    textoEscena.textContent = "Un lobo salvaje te embosca... ¡muere!";
    cambiarVida(-100);
    
  botonesDecision.innerHTML = ''; 

  setTimeout(() => {
    mostrarPantallaMuerte();
  }, 2000); 
});
  crearBoton("Ir a la izquierda", () => {
    textoEscena.textContent = "Encuentras un viejo campamento y descansas.";
    cambiarVida(10);
  });
}

function cambiarVida(cantidad, mostrarMuerteInmediatamente = true) {
  vida += cantidad;
  if (vida > 100) vida = 100;

  if (vida <= 0) {
    vida = 0;
    actualizarHUD();

    if (mostrarMuerteInmediatamente) {
      mostrarPantallaMuerte();
    }
    return;
  }

  actualizarHUD();
}

function agregarItem(item) {
  inventario.push(item);
  actualizarHUD();
}

function actualizarHUD() {
  vidaActual.textContent = vida;
  inventarioDOM.textContent = inventario.length > 0 ? inventario.join(', ') : 'Vacío';
}

function crearBoton(texto, accion) {
  const btn = document.createElement('button');
  btn.textContent = texto;
  btn.addEventListener('click', accion);
  botonesDecision.appendChild(btn);
}

function mostrarPantallaMuerte() {
  pantallaJuego.classList.add('oculto');
  pantallaMuerte.classList.remove('oculto');
}

function reiniciarJuego() {
  vida = 100;
  inventario = [];
  clase = "";
  pantallaMuerte.classList.add('oculto');
  pantallaBienvenida.classList.remove('oculto');
}
