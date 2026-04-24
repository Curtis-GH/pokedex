function getPokemonCardHtml(pokemon, index, mainType, idText, image, typeBadges) {
    return `
        <div class="pokemon-card"
             style="background: ${TYPE_GRADIENTS[mainType]};
                    box-shadow: 0 4px 15px ${TYPE_COLORS[mainType]}44"
             onclick="openOverlay(${index})">
            <div class="pokemon-card-inner">
                <span class="pokemon-card-id">${idText}</span>
                <img class="pokemon-card-img" src="${image}" alt="${pokemon.name}" loading="lazy">
                <h3 class="pokemon-card-name">${pokemon.name.toUpperCase()}</h3>
                <div class="pokemon-card-types">${typeBadges}</div>
            </div>
            <div class="pokemon-card-circle"></div>
        </div>`;
}


function getTypeBadgeHtml(typeName) {
    return `<span class="type-badge">${typeName}</span>`;
}


function getStatBarHtml(label, value, percent, hue) {
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


function getOverlayTypeBadgeHtml(typeName, color) {
    return `<span class="overlay-type-badge" style="background: ${color}">
                ${typeName}
            </span>`;
}