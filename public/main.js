"use strict";

(function () {
    let socket = io();
    let title = document.getElementById('title');
    let container = document.getElementById('container');

    // Buttons use to enter lobby or leave application
    let buttonYes = null;
    let buttonNo = null;

    /**
     * Canvas where the game take place
     */
    let canvas = null;

    /**
     * Canvas context use to render everything
     */
    let canvasContext = null;

    /**
     * Use to determinate rendering refresh
     */
    const FRAMES_PER_SECOND = 10;

    /**
     * Use to ref the text at the bottom of the canvas
     */
    let para = null;

    /**
     * 
     */
    let playerGrid = null;
    let otherPlayersGrid = [];

    //init();
    initDebug();

    //#region ButtonEvent
    function enterLobby() {
        socket.emit('wantJoinLobby');
    }
    //#endregion
    // #region Lobby
    socket.on("enterLobby", function (pseudos) {
        // Put player in lobby room
        console.log("I'm in enterLobby socket.on");
        showLobby(container, title, pseudos);
    });

    socket.on("updateLobby", function (pseudos) {
        showLobby(container, title, pseudos);
    });

    socket.on("initGame", function () {
        showCanvasRoom(container, title);
        canvas = document.getElementById('game-canvas');
        para = document.getElementById('output-text');
        init
        socket.emit('askGrid');
    });

    socket.on('sendGrid', function (data) {
        // Must render is own grid, and wait to render other grid.
        // STOPED HERE
        //initRendering();
    })
    //#endregion

    function init() {
        let pseudo = askPseudo(); // Get pseudo
        socket.emit('getPseudo', pseudo); // Send it to server
        showRestRoom(container, title); // Put player in restRoom where he will choose to join lobby
        buttonYes = document.getElementById('buttonYes'); // Now we can ref the button
        buttonYes.addEventListener('click', enterLobby);
    }

    function initDebug() { // See server side
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

    function initRendering() {
        windows.onload = function () {
            canvasContext = canvas.getContext('2d');

            // TODO: ADD EVENT LISTENER ONCLICK ON CANVAS
            canvas.addEventListener('mousedown', function (evt) {
                let mousePos = getCursorPosition(evt); // See solo project to copy
            });

            renderLoop = setInterval(function () {
                drawEverything(canvasContext,playerGrid, otherPlayersGrid);
            })
        }
    }
})();