// =================================================================
// CONTROLADOR PRINCIPAL - RICK & MORTY SYSTEM (app.js)
// Semestre 2-2025 - UCAB - EStoy escuchando salsa brutalmente mientras hago este proyecto
// =================================================================

// 1. REGISTRO DEL SERVICE WORKER (MODO OFFLINE)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Portal interdimensional (Service Worker) abierto con éxito en el alcance:', registration.scope);
            })
            .catch(error => {
                console.error('Error al estabilizar el portal (Service Worker):', error);
            });
    });
}

const CONFIG = {
    themeKey: 'rm-system-theme',
    currentTheme: localStorage.getItem('rm-system-theme') || 'dark'
};

// 2. ENRUTADOR SIMPLIFICADO ENTRE VISTAS
function navigateTo(viewId) {
    // Ocultar todos los contenedores de vistas
    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Mostrar la vista deseada
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
    }
}

// --- 3. ENRUTADOR SIMPLIFICADO ENTRE VISTAS ---
function navigateTo(viewId) {
    // Ocultar todas las secciones del sistema
    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Mostrar la pantalla objetivo
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
    }
}

  
    // --- 4. GESTIÓN INTEGRAL DE TEMATIZACIÓN DUAL (LIGHT/DARK) ---
    function initTheme() {
        // Aplicar el tema guardado en localStorage o el de por defecto (dark)
        document.documentElement.setAttribute('data-theme', CONFIG.currentTheme);
    }

    function toggleTheme() {
        // Alternar el estado
        CONFIG.currentTheme = CONFIG.currentTheme === 'dark' ? 'light' : 'dark';
        
        // Guardar la preferencia e inyectar el atributo CSS[cite: 2]
        document.documentElement.setAttribute('data-theme', CONFIG.currentTheme);
        localStorage.setItem(CONFIG.themeKey, CONFIG.currentTheme);
    }

    // --- 5. CICLO DE VIDA INICIAL ---
    document.addEventListener("DOMContentLoaded", () => {
        initTheme();
        // Por defecto iniciamos mostrando la pantalla de login al cargar
        navigateTo('view-login');
    });

    // Hacer las funciones accesibles globalmente desde los atributos 'onclick' del HTML
    window.navigateTo = navigateTo;
    window.toggleTheme = toggleTheme; // <-- AHORA ES GLOBAL Y DIRECTA
    // --- 5. CICLO DE VIDA INICIAL ---
    document.addEventListener("DOMContentLoaded", () => {
        initTheme();
        // Por defecto iniciamos mostrando la pantalla de login al cargar
        navigateTo('view-login');
    });

// Hacer las funciones de navegación globales para los atributos 'onclick' del HTML
window.navigateTo = navigateTo;