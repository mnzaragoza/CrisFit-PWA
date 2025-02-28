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
    var url = `https://script.google.com/macros/s/AKfycbywGHo05PPEGAKRZPBV18u1vLrf6tcdLtYafhvw_tSktBaHExEjHyH2kUtgjL7gdNI0RA/exec?email=${email}`;

    fetch(url)
        .then(function(response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('No se pudo validar el email');
            }
        })
        .then(function(data) {
            if (data) {
                localStorage.setItem('email', email);
                window.location.href = "dashboard.html";
            } else {
                alert('Usuario no encontrado');
            }
        })
        .catch(function(error) {
            alert('Error: ' + error.message);
        });
}

// Función para cargar las rutinas desde Google Sheets
function loadRoutine(email) {
    var url = `https://script.google.com/macros/s/AKfycbywGHo05PPEGAKRZPBV18u1vLrf6tcdLtYafhvw_tSktBaHExEjHyH2kUtgjL7gdNI0RA/exec?email=${email}`;
    
    fetch(url)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('No se pudieron cargar las rutinas');
            }
            return response.json();
        })
        .then(function(data) {
            displayRoutine(data);
        })
        .catch(function(error) {
            console.error("Error en loadRoutine:", error);
            alert('Error: ' + error.message);
        });
}

// Función para mostrar las rutinas en el HTML
function displayRoutine(data) {
    var routineContainer = document.getElementById('routine-container');
    routineContainer.innerHTML = '';

    if (!data.routine || data.routine.length === 0) {
        routineContainer.textContent = 'No hay rutinas disponibles.';
        return;
    }

    data.routine.forEach(function(exercise) {
        var exerciseElement = document.createElement('div');
        exerciseElement.classList.add('exercise-item');

        var title = document.createElement('h3');
        title.textContent = exercise.name;

        var repetitions = document.createElement('p');
        repetitions.textContent = `Repeticiones: ${exercise.repetitions}`;

        var weight = document.createElement('p');
        weight.textContent = `Peso: ${exercise.weight} kg`;

        exerciseElement.appendChild(title);
        exerciseElement.appendChild(repetitions);
        exerciseElement.appendChild(weight);

        routineContainer.appendChild(exerciseElement);
    });
}

// Manejo del login cuando el usuario envía el formulario (solo en index.html)
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', handleLogin);
}

// Manejo de la carga de rutinas en dashboard.html cuando la página se carga
if (document.getElementById('routine-container')) {
    var email = localStorage.getItem('email');
    if (email) {
        loadRoutine(email);
        document.getElementById('user-name').textContent = email;
    } else {
        window.location.href = "index.html";
    }

    // Cargar los ejercicios al hacer clic en "Como se hacen"
    document.getElementById("btnEjercicios").addEventListener("click", function() {
        const ejerciciosContainer = document.getElementById("ejerciciosContainer");
        ejerciciosContainer.innerHTML = "Cargando...";  // Mostrar mensaje mientras se cargan los datos

        var url = `https://script.google.com/macros/s/AKfycbywGHo05PPEGAKRZPBV18u1vLrf6tcdLtYafhvw_tSktBaHExEjHyH2kUtgjL7gdNI0RA/exec?email=G`;

        // Hacer una solicitud HTTP GET a la URL
        fetch(url)
        .then(function(response) {
            if (response.ok) {
                return response.json(); // Convertir la respuesta a formato JSON
            } else {
                throw new Error('Error en la respuesta del servidor'); // Si hay un error en la respuesta, lanzar una excepción
            }
        })
        .then(function(data) {
            if (data !== undefined) {
                ejerciciosContainer.innerHTML = "";  // Limpiar contenedor antes de agregar nuevos elementos

                // Iterar sobre los ejercicios y filtrar los datos que quieres mostrar
                data.routine.forEach(function(ejercicio) {
                    var item = document.createElement("li");
                    
                    // Crear un enlace (anchor) con el nombre del ejercicio
                    var gifLink = document.createElement("a");
                    gifLink.href = "#";  // Evita el comportamiento por defecto del enlace
                    gifLink.textContent = ejercicio.name;  // Mostrar solo el nombre del ejercicio

                    // Agregar el enlace al item de la lista
                    item.appendChild(gifLink);
                    ejerciciosContainer.appendChild(item);
                });

                // Mostrar el contenedor de la lista
                document.getElementById("listaEjercicios").classList.toggle("hidden");
            }
        })
        .catch(function(error) {
            console.error('Error al cargar los ejercicios:', error);
        });
    });
}
