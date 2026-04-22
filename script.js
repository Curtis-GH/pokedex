

const BASE_URL = 'https://pokeapi.co/api/v2/pokemon';
const BATCH_SIZE = 20;
let offset = 0;
let allPokemon = [];
let cache = {};
let currentOverlayIndex = null;



const TYPE_COLORS = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0',
    electric: '#F7D02C', grass: '#7AC74C', ice: '#96D9D6',
    fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65',
    flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC',
    dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD'
};

const TYPE_GRADIENTS = {
    normal: 'linear-gradient(135deg, #A8A77A, #C6C6A7)',
    fire: 'linear-gradient(135deg, #EE8130, #F08030)',
    water: 'linear-gradient(135deg, #6390F0, #4F8EE6)',
    electric: 'linear-gradient(135deg, #F7D02C, #FFE066)',
    grass: 'linear-gradient(135deg, #7AC74C, #5DBE3B)',
    ice: 'linear-gradient(135deg, #96D9D6, #73CEC9)',
    fighting: 'linear-gradient(135deg, #C22E28, #D04544)',
    poison: 'linear-gradient(135deg, #A33EA1, #B55DB3)',
    ground: 'linear-gradient(135deg, #E2BF65, #D4A645)',
    flying: 'linear-gradient(135deg, #A98FF3, #C4B5F7)',
    psychic: 'linear-gradient(135deg, #F95587, #FB79A0)',
    bug: 'linear-gradient(135deg, #A6B91A, #BCCF2A)',
    rock: 'linear-gradient(135deg, #B6A136, #C9B64E)',
    ghost: 'linear-gradient(135deg, #735797, #8B6FAF)',
    dragon: 'linear-gradient(135deg, #6F35FC, #8B5CF6)',
    dark: 'linear-gradient(135deg, #705746, #8A6E5E)',
    steel: 'linear-gradient(135deg, #B7B7CE, #CDCDE0)',
    fairy: 'linear-gradient(135deg, #D685AD, #E8A5C5)'
};

const STAT_NAMES = {
    'hp': 'HP', 'attack': 'ATK', 'defense': 'DEF',
    'special-attack': 'SP.ATK', 'special-defense': 'SP.DEF', 'speed': 'SPD'
};




let pokemonContainer = document.getElementById('pokemonContainer');
let loadMoreBtn = document.getElementById('loadMoreBtn');
let loadingSpinner = document.getElementById('loadingSpinner');
let searchInput = document.getElementById('searchInput');
let searchBtn = document.getElementById('searchBtn');
let clearBtn = document.getElementById('clearBtn');
let searchError = document.getElementById('searchError');
let searchErrorText = document.getElementById('searchErrorText');
let overlay = document.getElementById('overlay');
let prevBtn = document.getElementById('prevBtn');
let nextBtn = document.getElementById('nextBtn');
let closeBtn = document.getElementById('closeBtn');



async function fetchPokemonList() {
    let url = BASE_URL + '?limit=' + BATCH_SIZE + '&offset=' + offset;
    let response = await fetch(url);
    let data = await response.json();
    return data.results;
}


async function fetchPokemonDetails(url) {
    if (cache[url]) {
        return cache[url];
    }
    let response = await fetch(url);
    let data = await response.json();
    cache[url] = data;
    return data;
}


// w3schools.com/js/js_promise.asp (Promise.all)
async function loadPokemonBatch() {
    try {
        let list = await fetchPokemonList();
        let detailPromises = list.map(function(pokemon) {
            return fetchPokemonDetails(pokemon.url);
        });
        let details = await Promise.all(detailPromises);
        allPokemon = allPokemon.concat(details);
        offset = offset + BATCH_SIZE;
        return details;
    } catch (error) {
        console.log('Error loading Pokemon:', error);
        return [];
    }
}




function getTypeBadgesHtml(types) {
    let html = '';
    for (let i = 0; i < types.length; i++) {
        html += `<span class="type-badge">${types[i].type.name}</span>`;
    }
    return html;
}


function getPokemonImage(pokemon) {
    return pokemon.sprites.other['official-artwork'].front_default
        || pokemon.sprites.front_default;
}


function getPokemonCardHtml(pokemon, index) {
    let mainType = pokemon.types[0].type.name;
    let idText = '#' + String(pokemon.id).padStart(3, '0');
    let image = getPokemonImage(pokemon);
    return `
        <div class="pokemon-card" 
             style="background: ${TYPE_GRADIENTS[mainType]}; 
                    box-shadow: 0 4px 15px ${TYPE_COLORS[mainType]}44"
             onclick="openOverlay(${index})">
            <div class="pokemon-card-inner">
                <span class="pokemon-card-id">${idText}</span>
                <img class="pokemon-card-img" src="${image}" alt="${pokemon.name}" loading="lazy">
                <h3 class="pokemon-card-name">${pokemon.name.toUpperCase()}</h3>
                <div class="pokemon-card-types">${getTypeBadgesHtml(pokemon.types)}</div>
            </div>
            <div class="pokemon-card-circle"></div>
        </div>`;
}



function renderPokemonCards(pokemonList, append) {
    let html = '';
    let startIndex = allPokemon.length - pokemonList.length;
    for (let i = 0; i < pokemonList.length; i++) {
        html += getPokemonCardHtml(pokemonList[i], startIndex + i);
    }
    if (append) {
        pokemonContainer.innerHTML += html;
    } else {
        pokemonContainer.innerHTML = html;
    }
}


function renderAllCards() {
    let html = '';
    for (let i = 0; i < allPokemon.length; i++) {
        html += getPokemonCardHtml(allPokemon[i], i);
    }
    pokemonContainer.innerHTML = html;
}



function getStatBarHtml(statName, value) {
    let label = STAT_NAMES[statName] || statName.toUpperCase();
    let percent = Math.round((value / 255) * 100);
    let hue = Math.round((value / 255) * 120);
    return `
        <div class="stat-row">
            <span class="stat-label">${label}</span>
            <span class="stat-value">${value}</span>
            <div class="stat-bar-bg">
                <div class="stat-bar-fill" 
                     style="width: ${percent}%; background: hsl(${hue}, 70%, 55%)">
                </div>
            </div>
        </div>`;
}


function openOverlay(index) {
    currentOverlayIndex = index;
    updateOverlayContent();
    overlay.classList.remove('d-none');
    document.body.style.overflow = 'hidden';
    updateNavArrows();
}


function closeOverlay() {
    overlay.classList.add('d-none');
    document.body.style.overflow = '';
    currentOverlayIndex = null;
}


function updateOverlayContent() {
    let pokemon = allPokemon[currentOverlayIndex];
    let mainType = pokemon.types[0].type.name;
    updateOverlayHeader(pokemon, mainType);
    renderOverlayTypes(pokemon.types);
    renderOverlayMetrics(pokemon);
    renderOverlayStats(pokemon.stats);
}


function updateOverlayHeader(pokemon, mainType) {
    let idText = '#' + String(pokemon.id).padStart(3, '0');
    let image = getPokemonImage(pokemon);
    document.getElementById('overlayHeader').style.background = TYPE_GRADIENTS[mainType];
    document.getElementById('overlayIdBg').textContent = idText;
    document.getElementById('overlayImage').src = image;
    document.getElementById('overlayImage').alt = pokemon.name;
    document.getElementById('overlayName').textContent = pokemon.name.toUpperCase();
}


function renderOverlayTypes(types) {
    let html = '';
    for (let i = 0; i < types.length; i++) {
        let color = TYPE_COLORS[types[i].type.name];
        html += `<span class="overlay-type-badge" style="background: ${color}">
                    ${types[i].type.name}
                 </span>`;
    }
    document.getElementById('overlayTypes').innerHTML = html;
}


function renderOverlayMetrics(pokemon) {
    let height = (pokemon.height / 10).toFixed(1) + 'm';
    let weight = (pokemon.weight / 10).toFixed(1) + 'kg';
    let baseXp = pokemon.base_experience || '—';
    document.getElementById('overlayHeight').textContent = height;
    document.getElementById('overlayWeight').textContent = weight;
    document.getElementById('overlayBaseXp').textContent = baseXp;
}


function renderOverlayStats(stats) {
    let html = '';
    for (let i = 0; i < stats.length; i++) {
        html += getStatBarHtml(stats[i].stat.name, stats[i].base_stat);
    }
    document.getElementById('statsContainer').innerHTML = html;
}


function updateNavArrows() {
    if (currentOverlayIndex <= 0) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'flex';
    }
    if (currentOverlayIndex >= allPokemon.length - 1) {
        nextBtn.style.display = 'none';
    } else {
        nextBtn.style.display = 'flex';
    }
}


function goToPrevPokemon() {
    if (currentOverlayIndex > 0) {
        currentOverlayIndex = currentOverlayIndex - 1;
        updateOverlayContent();
        updateNavArrows();
    }
}


function goToNextPokemon() {
    if (currentOverlayIndex < allPokemon.length - 1) {
        currentOverlayIndex = currentOverlayIndex + 1;
        updateOverlayContent();
        updateNavArrows();
    }
}



function showLoading() {
    loadingSpinner.classList.remove('d-none');
    loadMoreBtn.disabled = true;
}


function hideLoading() {
    loadingSpinner.classList.add('d-none');
    loadMoreBtn.disabled = false;
}




function validateSearchInput() {
    let term = searchInput.value.trim();
    if (term.length >= 3) {
        searchBtn.classList.add('active');
        searchBtn.disabled = false;
    } else {
        searchBtn.classList.remove('active');
        searchBtn.disabled = true;
    }
}


async function searchPokemon() {
    let term = searchInput.value.trim().toLowerCase();
    if (term.length < 3) return;

    hideSearchError();
    showLoading();

    let found = findInCache(term);
    if (found) {
        showSearchResult(found);
        hideLoading();
        return;
    }
    await searchFromApi(term);
    hideLoading();
}


function findInCache(term) {
    for (let i = 0; i < allPokemon.length; i++) {
        if (allPokemon[i].name.includes(term)) {
            return allPokemon[i];
        }
    }
    return null;
}


async function searchFromApi(term) {
    try {
        let response = await fetch(BASE_URL + '/' + term);
        if (!response.ok) {
            showSearchError(term);
            return;
        }
        let data = await response.json();
        cache[data.url] = data;
        showSearchResult(data);
    } catch (error) {
        showSearchError(term);
    }
}


function showSearchResult(pokemon) {
    let index = findIndexById(pokemon.id);
    if (index < 0) {
        allPokemon.push(pokemon);
        index = allPokemon.length - 1;
    }
    pokemonContainer.innerHTML = getPokemonCardHtml(pokemon, index);
    loadMoreBtn.style.display = 'none';
    clearBtn.classList.remove('d-none');
}


function findIndexById(pokemonId) {
    for (let i = 0; i < allPokemon.length; i++) {
        if (allPokemon[i].id === pokemonId) {
            return i;
        }
    }
    return -1;
}


function showSearchError(term) {
    searchErrorText.textContent = 'No Pokémon found for "' + term + '"';
    searchError.classList.remove('d-none');
}


function hideSearchError() {
    searchError.classList.add('d-none');
}


function clearSearch() {
    searchInput.value = '';
    clearBtn.classList.add('d-none');
    searchBtn.classList.remove('active');
    searchBtn.disabled = true;
    hideSearchError();
    loadMoreBtn.style.display = '';
    renderAllCards();
}




loadMoreBtn.addEventListener('click', async function() {
    showLoading();
    let newPokemon = await loadPokemonBatch();
    renderPokemonCards(newPokemon, true);
    hideLoading();
});


searchInput.addEventListener('input', validateSearchInput);


searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && searchInput.value.trim().length >= 3) {
        searchPokemon();
    }
});


searchBtn.addEventListener('click', searchPokemon);

clearBtn.addEventListener('click', clearSearch);


overlay.addEventListener('click', closeOverlay);


closeBtn.addEventListener('click', function(event) {
    event.stopPropagation();
    closeOverlay();
});


prevBtn.addEventListener('click', function(event) {
    event.stopPropagation();
    goToPrevPokemon();
});


nextBtn.addEventListener('click', function(event) {
    event.stopPropagation();
    goToNextPokemon();
});



async function init() {
    showLoading();
    let firstBatch = await loadPokemonBatch();
    renderPokemonCards(firstBatch, false);
    hideLoading();
}

init();