// Registrar el Service Worker
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
            console.log("Datos recibidos:", data);
            displayRoutine(data);
        })
        .catch(function(error) {
            console.error("Error en loadRoutine:", error);
            alert('Error: ' + error.message);
        });
}

// Función para mostrar las rutinas en el HTML
function displayRoutine(data) {
    var routineContainer = document.getElementById('routine-content');
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
                return response.json(); // Convertir la respuesta en JSON
            } else {
                throw new Error('Error al cargar los ejercicios');
            }
        })
        .then(function(data) {
            var ejerciciosContainer = document.getElementById("ejerciciosContainer");
            ejerciciosContainer.classList.remove("hidden");

            var listaEjercicios = document.getElementById("listaEjercicios");
            listaEjercicios.innerHTML = "";

            // Aquí se crea la lista de ejercicios y se agrega al DOM
            data.forEach(function(exercicio) {
                var listItem = document.createElement("li");
                var anchor = document.createElement("a");
                anchor.href = "#";
                anchor.textContent = ejercicio.name;
                anchor.addEventListener("click", function() {
                    abrirModal(exercicio.video);
                });
                listItem.appendChild(anchor);
                listaEjercicios.appendChild(listItem);
            });
        })
        .catch(function(error) {
            console.error('Error al cargar los ejercicios:', error);
        });
    });
}

// Función para abrir el modal con el video
function abrirModal(videoUrl) {
    var gifModal = document.getElementById("gifModal");
    var gifEjercicio = document.getElementById("gifEjercicio");

    gifEjercicio.src = videoUrl;  // Establecer la URL del video en el iframe
    gifModal.classList.remove("hidden");  // Mostrar el modal
}

// Función para cerrar el modal
function cerrarModal() {
    var gifModal = document.getElementById("gifModal");
    var gifEjercicio = document.getElementById("gifEjercicio");

    gifEjercicio.src = "";  // Limpiar el src del iframe
    gifModal.classList.add("hidden");  // Ocultar el modal
}
