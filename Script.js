// Este codigo funciona para saber si el usuario es mayor o menor de edad, y una vez que pidio la informacion, lo agrega para un plan de ahorro.

alert("Bienvenido a la calculadora de ahorro.");

let Nombre = prompt("¿Cuál es tu nombre?");
console.log("Hola, " + Nombre);
alert("Hola, " + Nombre);

let Edad = parseInt(prompt("¿Cuál es tu edad?")); 
console.log("Tu edad es: " + Edad);

let tasaInteresAnual; 

if (Edad >= 18 && Edad < 30) {
    alert("Eres mayor de edad y tienes menos de 30 años.");
    console.log("Eres mayor de edad y tienes menos de 30 años.");
    tasaInteresAnual = 0.1; 
} else if (Edad >= 30) {
    alert("Eres mayor de edad y tienes 30 años o más.");
    console.log("Eres mayor de edad.");
    tasaInteresAnual = 0.05; 
} else {
    alert("Eres menor de edad.");
    console.log("Eres menor de edad, y no puedes abrir una cuenta de ahorro.");
    alert("Lo siento, no puedes abrir una cuenta de ahorro.");
    throw new Error("No puedes abrir una cuenta de ahorro.");
}

function obtenerDatosUsuario() {
    let montoInicial = parseFloat(prompt("Ingresa el monto inicial que deseas ahorrar:"));
    let años = parseInt(prompt("Ingresa el número de años que deseas ahorrar:"));

    if (isNaN(montoInicial) || isNaN(años) || montoInicial <= 0 || años <= 0) {
        alert("Por favor, ingresa valores válidos.");
        return null;
    }

    return { montoInicial, años };
}

function calcularAhorro(montoInicial, años) {
    let montoTotal = montoInicial * Math.pow(1 + tasaInteresAnual, años);
    return montoTotal.toFixed(2); 
}

function mostrarResultado(montoTotal) {
    alert("El monto total después del período será: $" + montoTotal);
}

const datos = obtenerDatosUsuario();
if (datos) {
    const { montoInicial, años } = datos;
    const montoTotal = calcularAhorro(montoInicial, años);
    mostrarResultado(montoTotal);
}
