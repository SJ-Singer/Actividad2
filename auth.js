// =================================================================
// PROGRAMACIÓN ORIENTADA A LA WEB - UCAB (Semestre 2-2025)
// SISTEMA DE INTERFACES Y AUTENTICACIÓN LOCAL (auth.js)[cite: 2]
// =================================================================

document.addEventListener("DOMContentLoaded", () => {
    setupAuthListeners();
});

function setupAuthListeners() {
    // 1. Manejo del Formulario de Inicio de Sesión[cite: 2, 3]
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('login-username').value.trim();
            const passwordInput = document.getElementById('login-password').value;

            // Obtener base de datos local
            const users = JSON.parse(localStorage.getItem('rm-users')) || {};

            // Validar credenciales[cite: 2]
            if (users[usernameInput] && users[usernameInput] === passwordInput) {
                // Guardar sesión activa
                sessionStorage.setItem('rm-logged-user', usernameInput);
                
                // Inicializar Dashboard
                loginSuccess(usernameInput);
            } else {
                alert('Portal denegado. Usuario o contraseña incorrectos.');
            }
        });
    }

    // 2. Manejo del Formulario de Registro[cite: 2, 3]
    const formRegister = document.getElementById('form-register');
    if (formRegister) {
        formRegister.addEventListener('submit', (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('reg-username').value.trim();
            const passwordInput = document.getElementById('reg-password').value;

            const users = JSON.parse(localStorage.getItem('rm-users')) || {};

            if (users[usernameInput]) {
                alert('Este usuario ya existe en esta dimensión.');
                return;
            }

            // Registrar y guardar en localStorage
            users[usernameInput] = passwordInput;
            localStorage.setItem('rm-users', JSON.stringify(users));

            alert('¡Cuenta creada con éxito! Ya puedes iniciar sesión.');
            formRegister.reset();
            navigateTo('view-login'); // Redirigir al login
        });
    }

    // 3. Manejo del Formulario de Recuperación de Contraseña[cite: 2, 3]
    const formRecovery = document.getElementById('form-recovery');
    if (formRecovery) {
        formRecovery.addEventListener('submit', (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('rec-username').value.trim();
            const newPasswordInput = document.getElementById('rec-new-password').value;

            const users = JSON.parse(localStorage.getItem('rm-users')) || {};

            // Verificar si el usuario existe para cambiar la contraseña[cite: 2, 3]
            if (!users[usernameInput]) {
                alert('El usuario ingresado no existe.');
                return;
            }

            // Actualizar contraseña[cite: 3]
            users[usernameInput] = newPasswordInput;
            localStorage.setItem('rm-users', JSON.stringify(users));

            alert('Contraseña actualizada correctamente.');
            formRecovery.reset();
            navigateTo('view-login'); // Redirigir al login[cite: 3]
        });
    }
}

// --- ACCIONES POST-AUTENTICACIÓN ---

function loginSuccess(username) {
    // Inyectar el nombre del usuario en el navbar[cite: 3]
    const userLabel = document.getElementById('logged-user-name');
    if (userLabel) userLabel.textContent = username;

    // Limpiar campos del formulario
    document.getElementById('form-login').reset();

    // Redirigir a la pantalla principal[cite: 3]
    navigateTo('view-dashboard');

    // Cargar datos iniciales de la API si la función existe en api.js
    if (typeof initAPIData === 'function') {
        initAPIData();
    }
}

function logout() {
    // Destruir sesión temporal
    sessionStorage.removeItem('rm-logged-user');
    
    // De vuelta al login[cite: 2, 3]
    navigateTo('view-login');
}

// Hacer globales las funciones necesarias para los botones de salida
window.logout = logout;