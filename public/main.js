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
     * This is an two dimension array received from server with informations to render the grid.
     * 
     * See Server code to understanding
     */
    let playerGridInfo = null;

    /**
     * Array to stock informations about THE OTHER PLAYERS grids to render those
     * 
     * Each other player info is in this format :
     * @pseudo other player pseudo
     * @anchor user's grid origin = { x: int, y: int }
     * @grid Two dimensional array with info updated by server
     */
    let otherPlayersGridInfos = [];

    /**
     * @type string
     */
    let pseudo = "";

    /**
     * Map with other players pseudo as key
     */


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

    socket.on('sendInitGrid', function (data) {
        playerGridInfo = data;
        initRendering();
    });

    socket.on('sendInitGridOtherPlayers', function(data) {

    });
    //#endregion

    function init() {
        pseudo = askPseudo(); // Get pseudo
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
                drawEverything(canvasContext, playerGridInfo, pseudo, otherPlayersGridInfos);
            })
        }
    }
})();