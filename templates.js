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


function getIdText(id) {
    return '#' + String(id).padStart(3, '0');
}


function getPokemonCardHtml(pokemon, index) {
    let mainType = pokemon.types[0].type.name;
    let image = getPokemonImage(pokemon);
    return `
        <div class="pokemon-card"
             style="background: ${TYPE_GRADIENTS[mainType]};
                    box-shadow: 0 4px 15px ${TYPE_COLORS[mainType]}44"
             onclick="openOverlay(${index})">
            <div class="pokemon-card-inner">
                <span class="pokemon-card-id">${getIdText(pokemon.id)}</span>
                <img class="pokemon-card-img" src="${image}" alt="${pokemon.name}" loading="lazy">
                <h3 class="pokemon-card-name">${pokemon.name.toUpperCase()}</h3>
                <div class="pokemon-card-types">${getTypeBadgesHtml(pokemon.types)}</div>
            </div>
            <div class="pokemon-card-circle"></div>
        </div>`;
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


function getOverlayTypeBadgeHtml(types) {
    let html = '';
    for (let i = 0; i < types.length; i++) {
        let color = TYPE_COLORS[types[i].type.name];
        html += `<span class="overlay-type-badge" style="background: ${color}">
                    ${types[i].type.name}
                 </span>`;
    }
    return html;
}
