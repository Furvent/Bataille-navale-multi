"use strict";

(function () {
    let socket = io();
    let title = document.getElementById('title');
    let container = document.getElementById('container');

    let buttonYes = null;
    let buttonNo = null;

    //init();
    initDebug();

    //#region ButtonEvent
    function enterLobby() {
        socket.emit('wantJoinLobby');
    }
    //#endregion
    // #region Lobby
    socket.on("enterLobby", function(pseudos) {
        // Put player in lobby room
        console.log("I'm in enterLobby socket.on");
        showLobby(container, title, pseudos);
    });

    socket.on("updateLobby", function(pseudos) {
        showLobby(container, title, pseudos);
    });

    socket.on("launchGame", function() {
        showCanvasRoom(container, title);
    });
    //#endregion

    function init() {
        let pseudo = askPseudo(); // Get pseudo
        socket.emit('getPseudo', pseudo); // Send it to server
        showRestRoom(container, title); // Put player in restRoom where he will choose to join lobby
        buttonYes = document.getElementById('buttonYes'); // Now we can ref the button
        buttonYes.addEventListener('click', enterLobby);
    }

    function initDebug() {
        socket.emit('debugEnterCanvas');
    }

    function askPseudo() {
        let i = 0;
        let pseudo = "";
        while (!pseudo) {
            switch (i) {
                case 0:
                    pseudo = prompt("Choisis un pseudo");
                    break;
                case 1:
                    pseudo = prompt("Faut vraiment que tu choisisses un pseudo");
                    break;
                case 2:
                    pseudo = prompt("Tu fais exprès ? Je te demande juste un pseudo, fais un effort quoi...");
                    break;
                case 3:
                    pseudo = prompt("...");
                    break;

                default:
                    pseudo = prompt("Grâce à ton IP, je viens de commander plein de pizzas qui vont arriver à ton domicile");
                    break;
            }
            i++;
        }
        // traiter la sécurité du pseudo : TODO
        
        return pseudo;
    }
})();