"use strict";

(function () {
    let socket = io();
    let title = document.getElementById('title');
    let container = document.getElementById('container');

    let renderLoop;

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
     * This is an object received from server with informations to render the grid.
     * @anchor to know where rendrer the grid
     * @grid to render properly the grid's player client owner (not other player's grid)
     * 
     * See Server code to understanding
     */
    let playerGridInfo = null;

    /**
     * Array to stock informations about THE OTHER PLAYERS grids to render those
     * 
     * Each other player info is in this format :
     * @pseudo other player pseudo use to render it next to the grid
     * @anchor user's grid origin = { x: int, y: int }. USe as id
     * @grid Two dimensional array with info updated by server
     */
    let otherPlayersGridInfos = [];

    /**
     * @type string
     */
    let pseudo = "";

    const GRID_WIDTH = 10;
    const GRID_HEIGHT = 10;

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
        socket.emit('askGrid');
    });

    socket.on('sendInitGrid', function (data) {
        playerGridInfo = data;
        initRendering();
    });

    socket.on('sendInitGridToOtherPlayers', function (data) {
        // At this point, we know that a new player join the game, or
        // as a new player we need the grid of precedent players.
        // We must create a grid client side. In it, we will stock the
        // info send by server.
        otherPlayersGridInfos.push({ pseudo: data.pseudo, anchor: data.gridInfo.anchor, grid: data.gridInfo.grid });

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
        pseudo = "pseudo" + (Math.floor(Math.random() * 100000));
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
        console.log("Init launch");
        console.log("I'm in onload");
        canvasContext = canvas.getContext('2d');

        // TODO: ADD EVENT LISTENER ONCLICK ON CANVAS
        // canvas.addEventListener('mousedown', function (evt) {
        //     let mousePos = getCursorPosition(evt); // See solo project to copy
        // });

        renderLoop = setInterval(function () {
            console.log("Render activate");
            drawEverything(canvas.width, canvas.height, canvasContext, playerGridInfo, pseudo, otherPlayersGridInfos);
        }, 1000 / FRAMES_PER_SECOND);
    }

    function getCursorPosition(canvas, event) {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        console.log("x: " + x + " y: " + y);
    }

    /**
     * @deprecated Since server send position and generate grid from other players passed at initialisation
     * 
     * Create a new object with one other player infos : his grid, an anchor and his pseudo.
     * 
     * Return the object create.
     * @param {Object} data Data send by the server, with the anchor and the pseudo
     */
    function initGridOtherPlayer(data) {
        let gridInfo = {};
        gridInfo.anchor = data.grid.anchor;
        // DEBUG
        gridInfo.pseudo = data.pseudo;
        gridInfo.grid = [];
        console.log("player with pseudo " + gridInfo.pseudo + " anchor is: x=" + gridInfo.anchor.x + " y=" + gridInfo.anchor.y);
        for (let x = 0; x < GRID_WIDTH; x++) {
            gridInfo.grid.push([]);
            for (let y = 0; y < GRID_HEIGHT; y++) {
                gridInfo.grid[x].push();
                gridInfo.grid[x][y] = {
                    touched: false, // Does the cell was touched by any player ? To show it.
                    boat: false, // If there is a boat, to render it when touched
                }
            }
        }
        return gridInfo;
    }
})();