const BASE_URL = 'https://pokeapi.co/api/v2/pokemon';
const BATCH_SIZE = 20;
let offset = 0;
let allPokemon = [];
let displayedPokemon = [];
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
let pokemonDialog = document.getElementById('pokemonDialog');
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


async function loadPokemonBatch() {
    try {
        let list = await fetchPokemonList();
        let detailPromises = list.map(function (pokemon) {
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


function getPokemonImage(pokemon) {
    return pokemon.sprites.other['official-artwork'].front_default
        || pokemon.sprites.front_default;
}


function getIdText(id) {
    return '#' + String(id).padStart(3, '0');
}


function buildTypeBadges(types) {
    let html = '';
    for (let i = 0; i < types.length; i++) {
        html += getTypeBadgeHtml(types[i].type.name);
    }
    return html;
}


function buildCardHtml(pokemon, index) {
    let mainType = pokemon.types[0].type.name;
    let idText = getIdText(pokemon.id);
    let image = getPokemonImage(pokemon);
    let typeBadges = buildTypeBadges(pokemon.types);
    return getPokemonCardHtml(pokemon, index, mainType, idText, image, typeBadges);
}


function renderPokemonCards(pokemonList, append) {
    let html = '';
    for (let i = 0; i < pokemonList.length; i++) {
        let index = findIndexById(pokemonList[i].id);
        html += buildCardHtml(pokemonList[i], index);
    }
    if (append) {
        pokemonContainer.innerHTML += html;
    } else {
        pokemonContainer.innerHTML = html;
    }
}


function renderAllCards() {
    displayedPokemon = allPokemon;
    renderPokemonCards(allPokemon, false);
}


function openOverlay(index) {
    currentOverlayIndex = findDisplayedIndex(index);
    updateOverlayContent();
    pokemonDialog.showModal();
    updateNavArrows();
}


function findDisplayedIndex(globalIndex) {
    let pokemon = allPokemon[globalIndex];
    for (let i = 0; i < displayedPokemon.length; i++) {
        if (displayedPokemon[i].id === pokemon.id) {
            return i;
        }
    }
    return 0;
}


function closeOverlay() {
    pokemonDialog.close();
    currentOverlayIndex = null;
}


function updateOverlayContent() {
    let pokemon = displayedPokemon[currentOverlayIndex];
    let mainType = pokemon.types[0].type.name;
    updateOverlayHeader(pokemon, mainType);
    renderOverlayTypes(pokemon.types);
    renderOverlayMetrics(pokemon);
    renderOverlayStats(pokemon.stats);
}


function updateOverlayHeader(pokemon, mainType) {
    let image = getPokemonImage(pokemon);
    document.getElementById('overlayHeader').style.background = TYPE_GRADIENTS[mainType];
    document.getElementById('overlayIdBg').textContent = getIdText(pokemon.id);
    document.getElementById('overlayImage').src = image;
    document.getElementById('overlayImage').alt = pokemon.name;
    document.getElementById('overlayName').textContent = pokemon.name.toUpperCase();
}


function renderOverlayTypes(types) {
    let html = '';
    for (let i = 0; i < types.length; i++) {
        let color = TYPE_COLORS[types[i].type.name];
        html += getOverlayTypeBadgeHtml(types[i].type.name, color);
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
        let statName = stats[i].stat.name;
        let value = stats[i].base_stat;
        let label = STAT_NAMES[statName] || statName.toUpperCase();
        let percent = Math.round((value / 255) * 100);
        let hue = Math.round((value / 255) * 120);
        html += getStatBarHtml(label, value, percent, hue);
    }
    document.getElementById('statsContainer').innerHTML = html;
}


function updateNavArrows() {
    prevBtn.style.display = (currentOverlayIndex <= 0) ? 'none' : 'flex';
    nextBtn.style.display = (currentOverlayIndex >= displayedPokemon.length - 1) ? 'none' : 'flex';
}


function navigateOverlay(direction) {
    let newIndex = currentOverlayIndex + direction;
    if (newIndex >= 0 && newIndex < displayedPokemon.length) {
        currentOverlayIndex = newIndex;
        updateOverlayContent();
        updateNavArrows();
    }
}


function toggleLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('d-none');
        loadMoreBtn.disabled = true;
    } else {
        loadingSpinner.classList.add('d-none');
        loadMoreBtn.disabled = false;
    }
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
    toggleLoading(true);
    let results = findAllInCache(term);
    if (results.length > 0) {
        showSearchResults(results);
        toggleLoading(false);
        return;
    }
    await searchFromApi(term);
    toggleLoading(false);
}


function findAllInCache(term) {
    let results = [];
    for (let i = 0; i < allPokemon.length; i++) {
        if (allPokemon[i].name.includes(term)) {
            results.push(allPokemon[i]);
        }
    }
    return results;
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
        showSearchResults([data]);
    } catch (error) {
        showSearchError(term);
    }
}


function showSearchResults(pokemonList) {
    displayedPokemon = pokemonList;
    addMissingToAll(pokemonList);
    renderPokemonCards(pokemonList, false);
    loadMoreBtn.style.display = 'none';
    clearBtn.classList.remove('d-none');
}


function addMissingToAll(pokemonList) {
    for (let i = 0; i < pokemonList.length; i++) {
        if (findIndexById(pokemonList[i].id) < 0) {
            allPokemon.push(pokemonList[i]);
        }
    }
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


function initEventListeners() {
    loadMoreBtn.addEventListener('click', handleLoadMore);
    searchInput.addEventListener('input', validateSearchInput);
    searchInput.addEventListener('keydown', handleSearchKeydown);
    searchBtn.addEventListener('click', searchPokemon);
    clearBtn.addEventListener('click', clearSearch);
    pokemonDialog.addEventListener('click', handleDialogClick);
    closeBtn.addEventListener('click', closeOverlay);
    prevBtn.addEventListener('click', handlePrevClick);
    nextBtn.addEventListener('click', handleNextClick);
}


async function handleLoadMore() {
    toggleLoading(true);
    let newPokemon = await loadPokemonBatch();
    displayedPokemon = allPokemon;
    renderPokemonCards(newPokemon, true);
    toggleLoading(false);
}


function handleSearchKeydown(event) {
    if (event.key === 'Enter' && searchInput.value.trim().length >= 3) {
        searchPokemon();
    }
}


function handleDialogClick(event) {
    if (event.target === pokemonDialog) {
        closeOverlay();
    }
}


function handlePrevClick() {
    navigateOverlay(-1);
}


function handleNextClick() {
    navigateOverlay(1);
}


async function init() {
    initEventListeners();
    toggleLoading(true);
    let firstBatch = await loadPokemonBatch();
    displayedPokemon = allPokemon;
    renderPokemonCards(firstBatch, false);
    toggleLoading(false);
}