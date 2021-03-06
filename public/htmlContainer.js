"use strict";

// Show page where we asking player if he wants to join lobby
function showRestRoom(container, title) {
    title.innerText = "DO YOU WANT TO JOIN THE LOBBY ?"
    let template = `
    <button class="button" id="buttonYes" type="button">YES !</button>
    <button class="button" id="buttonNo" type="button">NO !</button>
    `;
    container.innerHTML = template;
}

/**
 * Show the lobby
 * @param {*HtmlElement} container - Main div
 * @param {*HtmlElement} title - Main title
 * @param {*Array} pseudos - An array of users use to display other players pseudo
 */
function showLobby(container, title, pseudos) {
    title.innerText = "WAITING PLAYERS";
    while (container.firstChild) { // We clean the main div container
        container.removeChild(container.firstChild);
    }
    for (let i = 0; i < pseudos.length; i++) {
        let p = document.createElement('p');
        p.innerText = `Player ${i + 1} : ${pseudos[i]}`;
        container.appendChild(p);
    }
}

/**
 * Show the party room.
 * Add the canvas where render the game.
 * @param {HtmlElement} container 
 * @param {HtmlElement} title 
 */
function showCanvasRoom(container, title) {
    document.body.removeChild(title);

    // Generate canvas
    let canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'game-canvas');
    canvas.setAttribute('width', '800');
    canvas.setAttribute('height', '800');
    while (container.firstChild) { // We clean the main div container
        container.removeChild(container.firstChild);
    }
    container.appendChild(canvas);

    // Generate text at the bottom of canvas
    let para = document.createElement('p');
    para.setAttribute('id', 'output-text');
    container.appendChild(para);
    giveInfoPlayers("Waiting others players to begin the party.");
}

function giveInfoPlayers(message) {
    let para = document.getElementById('output-text');
    para.innerText = message;
}