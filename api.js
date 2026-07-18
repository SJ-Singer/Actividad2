// =================================================================
// PROGRAMACIÓN ORIENTADA A LA WEB - UCAB (Semestre 2-2025)
// CONSUMO DE API, TABLAS, ORDENAMIENTO Y EDICIÓN (api.js)
// =================================================================

// --- ESTADO INTERNO DE LOS DATOS ---
const APIState = {
    characters: { list: [], page: 1, totalPages: 1, sortField: null, sortAsc: true },
    episodes: { list: [], page: 1, totalPages: 1, sortField: null, sortAsc: true },
    currentTab: 'characters',
    searchQuery: '',
    // Almacenamiento local para modificaciones temporales (Edición sin servidor)
    localEdits: { characters: {}, episodes: {} }
};

// URL Base de la API Oficial de Rick and Morty[cite: 2]
const API_BASE_URL = 'https://rickandmortyapi.com/api';

// --- INICIALIZACIÓN DE DATOS ---
function initAPIData() {
    APIState.searchQuery = '';
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    fetchCharacters();
    fetchEpisodes();
}

// --- CONSUMO DE LA API: PERSONAJES ---
async function fetchCharacters() {
    try {
        const tableBody = document.getElementById('table-body');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Buscando en la galaxia...</td></tr>';

        // Construir URL con filtros de paginación y búsqueda
        let url = `${API_BASE_URL}/character?page=${APIState.characters.page}`;
        if (APIState.searchQuery) {
            url += `&name=${encodeURIComponent(APIState.searchQuery)}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('No se encontraron personajes');
        
        const data = await response.json();
        
        // Mapear los datos de la API e inyectar modificaciones locales si existen
        APIState.characters.list = data.results.map(char => {
            const localCopy = APIState.localEdits.characters[char.id];
            return localCopy ? { ...char, ...localCopy } : char;
        });
        
        APIState.characters.totalPages = data.info.pages;
        updatePaginationUI('characters');
        renderCharactersTable();
    } catch (error) {
        console.error(error);
        const tableBody = document.getElementById('table-body');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--rm-danger);">Dimensión vacía o error de red.</td></tr>';
    }
}

// --- CONSUMO DE LA API: EPISODIOS ---
async function fetchEpisodes() {
    try {
        const tableBody = document.getElementById('episodes-table-body');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Abriendo portal de transmisiones...</td></tr>';

        let url = `${API_BASE_URL}/episode?page=${APIState.episodes.page}`;
        if (APIState.searchQuery) {
            url += `&name=${encodeURIComponent(APIState.searchQuery)}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('No se encontraron episodios');

        const data = await response.json();

        // Mapear inyectando modificaciones locales si existen
        APIState.episodes.list = data.results.map(ep => {
            const localCopy = APIState.localEdits.episodes[ep.id];
            return localCopy ? { ...ep, ...localCopy } : ep;
        });

        APIState.episodes.totalPages = data.info.pages;
        updatePaginationUI('episodes');
        renderEpisodesTable();
    } catch (error) {
        console.error(error);
        const tableBody = document.getElementById('episodes-table-body');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--rm-danger);">No hay registros de transmisiones para esta búsqueda.</td></tr>';
    }
}

// --- RENDERIZADO DE TABLAS ---
function renderCharactersTable() {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    APIState.characters.list.forEach(char => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${char.id}</td>
            <td><img src="${char.image || 'https://via.placeholder.com/150'}" class="table-avatar" alt="${char.name}"></td>
            <td><strong>${char.name}</strong></td>
            <td>${char.species}</td>
            <td>${char.gender}</td>
            <td>${char.type || 'N/A'}</td>
            <td><button class="btn-secondary" onclick="viewDetails(${char.id}, 'char')">Ficha</button></td>
        `;
        tableBody.appendChild(tr);
    });
}

function renderEpisodesTable() {
    const tableBody = document.getElementById('episodes-table-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    APIState.episodes.list.forEach(ep => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${ep.id}</td>
            <td><span style="color:var(--rm-green-portal); font-weight:bold;">${ep.episode}</span></td>
            <td><strong>${ep.name}</strong></td>
            <td>${ep.air_date}</td>
            <td><button class="btn-secondary" onclick="viewDetails(${ep.id}, 'ep')">Ficha</button></td>
        `;
        tableBody.appendChild(tr);
    });
}

// --- MÓDULO: BUSCADOR EN TIEMPO REAL ---
let searchDebounceTimeout;
function filterDataAPI() {
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(() => {
        const query = document.getElementById('search-input').value.trim();
        APIState.searchQuery = query;
        
        // Reiniciar paginación al realizar búsquedas nuevas
        APIState.characters.page = 1;
        APIState.episodes.page = 1;

        if (APIState.currentTab === 'characters') fetchCharacters();
        else fetchEpisodes();
    }, 300); // 300ms de retraso para no saturar la red con cada tecla
}

// --- MÓDULO: ORDENAMIENTO DE COLUMNAS[cite: 2] ---
function sortData(field, type) {
    const state = APIState[type];
    if (state.sortField === field) {
        state.sortAsc = !state.sortAsc; // Alterna la dirección
    } else {
        state.sortField = field;
        state.sortAsc = true;
    }

    state.list.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];

        // Convertir ID a número si es necesario
        if (field === 'id') {
            return state.sortAsc ? valA - valB : valB - valA;
        }

        if (field === 'air_date') {
        let dateA = Date.parse(valA) || 0;
        let dateB = Date.parse(valB) || 0;
        return state.sortAsc ? dateA - dateB : dateB - dateA;
        }

        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();

        if (valA < valB) return state.sortAsc ? -1 : 1;
        if (valA > valB) return state.sortAsc ? 1 : -1;
        return 0;
    });

    if (type === 'characters') renderCharactersTable();
    else renderEpisodesTable();
}

// --- MÓDULO: PAGINACIÓN ---
function changePage(type, direction) {
    const state = APIState[type];
    const newPage = state.page + direction;

    if (newPage >= 1 && newPage <= state.totalPages) {
        state.page = newPage;
        if (type === 'characters') fetchCharacters();
        else fetchEpisodes();
    }
}

function updatePaginationUI(type) {
    if (type === 'characters') {
        document.getElementById('page-info-char').textContent = `Página ${APIState.characters.page} de ${APIState.characters.totalPages}`;
    } else {
        document.getElementById('page-info-ep').textContent = `Página ${APIState.episodes.page} de ${APIState.episodes.totalPages}`;
    }
}

// --- NAVEGACIÓN INTERNA: PESTAÑAS ---
function switchTab(tabName) {
    APIState.currentTab = tabName;
    
    const btnChar = document.getElementById('tab-characters');
    const btnEp = document.getElementById('tab-episodes');
    const secChar = document.getElementById('section-characters');
    const secEp = document.getElementById('section-episodes');

    if (tabName === 'characters') {
        btnChar.className = 'btn-primary';
        btnEp.className = 'btn-secondary';
        secChar.classList.remove('hidden');
        secEp.classList.add('hidden');
    } else {
        btnChar.className = 'btn-secondary';
        btnEp.className = 'btn-primary';
        secChar.classList.add('hidden');
        secEp.classList.remove('hidden');
    }
}

// --- DETALLE Y EDICIÓN DE ELEMENTOS ---
function viewDetails(id, mode) {
    if (mode === 'char') {
        const char = APIState.characters.list.find(c => c.id === id);
        if (!char) return;

        document.getElementById('profile-img').src = char.image || '';
        document.getElementById('profile-name').textContent = char.name;
        document.getElementById('profile-species').textContent = char.species;
        document.getElementById('profile-gender').textContent = char.gender;
        document.getElementById('profile-type').textContent = char.type || 'None';
        document.getElementById('profile-status').textContent = char.status || 'unknown';

        // Cargar lista simplificada de apariciones (primeros 5 enlaces)
        const epList = document.getElementById('profile-episodes');
        epList.innerHTML = '';
        const limit = Math.min(char.episode.length, 5);
        for (let i = 0; i < limit; i++) {
            const li = document.createElement('li');
            li.textContent = `Episodio ID: ${char.episode[i].split('/').pop()}`;
            epList.appendChild(li);
        }

        // Cargar el formulario oculto de edición[cite: 3]
        document.getElementById('edit-id').value = char.id;
        document.getElementById('edit-name').value = char.name;
        document.getElementById('edit-species').value = char.species;
        document.getElementById('edit-gender').value = char.gender;
        document.getElementById('edit-type').value = char.type || '';

        toggleEditMode(false, 'char');
        navigateTo('view-profile');
    } else {
        const ep = APIState.episodes.list.find(e => e.id === id);
        if (!ep) return;

        document.getElementById('ep-profile-name').textContent = ep.name;
        document.getElementById('ep-profile-code').textContent = ep.episode;
        document.getElementById('ep-profile-airdate').textContent = ep.air_date;

        // Cargar lista simplificada de personajes destacados (primeros 5)
        const charList = document.getElementById('ep-profile-characters');
        charList.innerHTML = '';
        const limit = Math.min(ep.characters.length, 5);
        for (let i = 0; i < limit; i++) {
            const li = document.createElement('li');
            li.textContent = `Sujeto ID: ${ep.characters[i].split('/').pop()}`;
            charList.appendChild(li);
        }

        // Cargar formulario oculto de episodios[cite: 3]
        document.getElementById('ep-edit-id').value = ep.id;
        document.getElementById('ep-edit-name').value = ep.name;
        document.getElementById('ep-edit-code').value = ep.episode;
        document.getElementById('ep-edit-airdate').value = ep.air_date;

        toggleEditMode(false, 'ep');
        navigateTo('view-episode-profile');
    }
}

function toggleEditMode(isEditing, type) {
    const prefix = type === 'char' ? 'profile-' : 'ep-profile-';
    const viewDiv = document.getElementById(`${prefix}view-mode`);
    const editForm = document.getElementById(`${prefix}edit-mode`);

    if (isEditing) {
        viewDiv.classList.add('hidden');
        editForm.classList.remove('hidden');
    } else {
        viewDiv.classList.remove('hidden');
        editForm.classList.add('hidden');
    }
}

// Escuchadores de eventos para guardar los cambios[cite: 3]
document.addEventListener("DOMContentLoaded", () => {
    const formChar = document.getElementById('profile-edit-mode');
    if (formChar) {
        formChar.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = parseInt(document.getElementById('edit-id').value);
            
            APIState.localEdits.characters[id] = {
                name: document.getElementById('edit-name').value,
                species: document.getElementById('edit-species').value,
                gender: document.getElementById('edit-gender').value,
                type: document.getElementById('edit-type').value
            };

            alert('Datos del personaje modificados localmente.');
            fetchCharacters(); // Recargar datos inyectando los cambios
            navigateTo('view-dashboard');
        });
    }

    const formEp = document.getElementById('ep-profile-edit-mode');
    if (formEp) {
        formEp.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = parseInt(document.getElementById('ep-edit-id').value);

            APIState.localEdits.episodes[id] = {
                name: document.getElementById('ep-edit-name').value,
                episode: document.getElementById('ep-edit-code').value,
                air_date: document.getElementById('ep-edit-airdate').value
            };

            alert('Datos del episodio modificados localmente.');
            fetchEpisodes(); // Recargar datos inyectando los cambios
            navigateTo('view-dashboard');
        });
    }
});

// Hacer funciones accesibles desde el HTML
window.initAPIData = initAPIData;
window.switchTab = switchTab;
window.filterDataAPI = filterDataAPI;
window.sortData = sortData;
window.changePage = changePage;
window.viewDetails = viewDetails;
window.toggleEditMode = toggleEditMode;