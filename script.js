//Registrar el Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(reg) {
        console.log('Service Worker registrado correctamente', reg);
    })
    .catch(function(err) {
        console.log('Error al registrar el Service Worker', err);
    });
}

// Función para manejar el formulario de login
function handleLogin(event) {
    event.preventDefault(); // Evita que el formulario recargue la página al enviarse

    // Obtener el email ingresado en el input del formulario
    var email = document.getElementById('email').value;

    // Validar si se ingresó un email antes de continuar
    if (email) {
        // Llamar a la función que validará el email con Google Apps Script
        validateEmail(email);
    } else {
        // Si no se ingresó un email, mostrar un mensaje de alerta
        alert('Por favor ingresa un correo electrónico');
    }
}

// Función para validar el correo electrónico con Google Apps Script
function validateEmail(email) {
    // URL del script de Google Apps Script que verifica si el email existe en la base de datos (Google Sheets)
    var url = `https://script.google.com/macros/s/AKfycbywGHo05PPEGAKRZPBV18u1vLrf6tcdLtYafhvw_tSktBaHExEjHyH2kUtgjL7gdNI0RA/exec?email=${email}`;

    // Hacer una solicitud HTTP GET a la URL
    fetch(url)
        .then(function(response) {
            // Verificar si la respuesta es correcta (código 200-299)
            if (response.ok) {
                return response.json(); // Convertir la respuesta a formato JSON
            } else {
                throw new Error('No se pudo validar el email'); // Si hay un error en la respuesta, lanzar una excepción
            }
        })
        .then(function(data) {
            console.log(data); // Imprimir en consola la respuesta del servidor (para depuración)

            if (data != undefined) { // Verifica que los datos existan
                // El usuario fue encontrado, guardar el email en localStorage
                localStorage.setItem('email', email);

                // Redirigir al usuario al dashboard
                window.location.href = "dashboard.html";
            } else {
                // Si el usuario no existe, mostrar alerta
                alert('Usuario no encontrado');
            }
        })
        .catch(function(error) {
            // Capturar errores y mostrar un mensaje al usuario
            alert('Error: ' + error.message);
        });
}

// Función para cargar las rutinas desde Google Sheets
function loadRoutine(email) {
    // URL de Google Apps Script para obtener las rutinas del usuario
    var url = `https://script.google.com/macros/s/AKfycbywGHo05PPEGAKRZPBV18u1vLrf6tcdLtYafhvw_tSktBaHExEjHyH2kUtgjL7gdNI0RA/exec?email=${email}`;
    
    fetch(url)
        .then(function(response) {
            // Si la respuesta no es exitosa, lanzar un error
            if (!response.ok) {
                throw new Error('No se pudieron cargar las rutinas');
            }
            return response.json(); // Convertir la respuesta a JSON
        })
        .then(function(data) {
            console.log("Datos recibidos:", data); // Mostrar los datos en la consola para depuración
            displayRoutine(data); // Llamar a la función para renderizar las rutinas en el HTML
        })
        .catch(function(error) {
            // Capturar y mostrar errores en la consola y en un alert
            console.error("Error en loadRoutine:", error);
            alert('Error: ' + error.message);
        });
}

// Función para mostrar las rutinas en el HTML (DOM)
function displayRoutine(data) {
    var routineContainer = document.getElementById('routine-container'); 
    routineContainer.innerHTML = ''; // Limpiar contenido previo

    if (!data.routine || data.routine.length === 0) {
        routineContainer.textContent = 'No hay rutinas disponibles.';
        return;
    }

    data.routine.forEach(function(exercise) {
        // Crear el contenedor del ejercicio
        var exerciseElement = document.createElement('div');
        exerciseElement.classList.add('exercise-item'); 

        // Crear título del ejercicio
        var title = document.createElement('h3');
        title.textContent = exercise.name;

        // Crear párrafos para repeticiones y peso
        var repetitions = document.createElement('p');
        repetitions.textContent = `Repeticiones: ${exercise.repetitions}`;

        var weight = document.createElement('p');
        weight.textContent = `Peso: ${exercise.weight} kg`;

        // Agregar elementos al contenedor
        exerciseElement.appendChild(title);
        exerciseElement.appendChild(repetitions);
        exerciseElement.appendChild(weight);

        // Agregar el ejercicio al contenedor principal
        routineContainer.appendChild(exerciseElement);
    });
}

// Evento para manejar el login cuando el usuario envía el formulario (solo en index.html)
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', handleLogin);
}

// Evento para cargar las rutinas en dashboard.html cuando la página se carga
if (document.getElementById('routine-container')) {
    // Obtener el email guardado en localStorage
    var email = localStorage.getItem('email');

    if (email) {
        loadRoutine(email); // Cargar la rutina del usuario con su email
        document.getElementById('user-name').textContent = email; // Mostrar el email del usuario en la interfaz
    } else {
        // Si no hay email guardado, redirigir a la página de inicio de sesión
        window.location.href = "index.html";
    }

    // Función para cargar los ejercicios cuando se hace clic en el botón "Como se hacen"
    document.getElementById("btnEjercicios").addEventListener("click", function() {
        const ejerciciosContainer = document.getElementById("ejerciciosContainer");
        ejerciciosContainer.innerHTML = "Cargando...";  // Mostrar mensaje mientras se cargan los datos
        fetch("https://script.google.com/macros/s/AKfycbywGHo05PPEGAKRZPBV18u1vLrf6tcdLtYafhvw_tSktBaHExEjHyH2kUtgjL7gdNI0RA/exec?tipo=ejerciciosGif")
        .then(function(response) {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return response.clone().json();  // 👈 Clonamos para evitar conflictos con otras lecturas
        })
        .then(function(data) {
            if (!Array.isArray(data)) throw new Error('La respuesta no es un array');
            console.log("Datos recibidos:", data); 
            ejerciciosContainer.innerHTML = "";

            for (var i = 0; i < data.length; i++) {
                var ejercicio = data[i];
                var item = document.createElement("li");
                item.textContent = ejercicio.nombre;

                (function(gifUrl) {
                    item.addEventListener("click", function() {
                        mostrarGif(gifUrl);
                    });
                })(ejercicio.gif);

                ejerciciosContainer.appendChild(item);
            }

            document.getElementById("listaEjercicios").classList.toggle("hidden");
        })
        .catch(function(error) {
            console.error('Error al cargar los ejercicios:', error);
        });

    });

    // Función que muestra el GIF cuando se hace clic en un ejercicio
    function mostrarGif(url) {
        document.getElementById("gifEjercicio").src = url;  // Establecer la URL del GIF
        document.getElementById("gifModal").classList.remove("hidden");  // Mostrar el modal con el GIF
    }

    // Función para cerrar el gif
    function cerrarModal() {
        document.getElementById("gifModal").classList.add("hidden");
    }
}