"use strict";

// Reset the html element
// function resetHtmlElemts(list) {
//     list.forEach(elem => {
//         elem.innerHtml = "ERROR: EMPTY HTML.";
//     });
// }

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