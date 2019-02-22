"use strict";

let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let grids = require('./grids');
let boats = require('./boats');
let party = require('./party')

const NUMBER_MAX_PLAYERS = 4;

const MESSAGE_PLAYER_CAN_ATTACK = "Fire !";
const MESSAGE_PLAYER_WAIT = "Waiting others players";

app.use(express.static('public'));

const SERVER_PORT = 7589;

/**
 * A map with id as key, and an user as value
 */
let users = new Map();
/**
 * Use as shortcut of users.get(socket.id)
 * @pseudo
 * @gridInfo All info of the grid
 * @boats All boats of the player
 */
let user = null;

/**
 * user structure :
 * {
 *   pseudo: string,
 *   playerNumber: int,
 *   gridInfo: {
 *      anchor:
 *          {x: int, y: int},
 *      grid: grid[ [ // Each entry is a cell
 *          {touched: bool
 *           boat: reference to an object Boat
 *           pos : {
 *              x: int,
 *              y: int
 *           }
 *          }]]},
 *   boats: [ Boat: // Array of objects Boat
 *      { size: int,
 *        life: int,
 *        POS: 
 *          { x: int,
 *            y: int }
 *      } ],
 *   haveFinishedHisTurn: bool, // Use to know if player can play
 *   haveLoadedHisGrid: bool // Use to know when begin game
 * }
 */

/**
 * Use to know in wich order players are generating grid,
 * to place them in the canvas at the good position
 * (determinate anchor of the grid).
 */
var indexPlayer = 1;

// In object lobby, players is a list of id of players in lobby room
let lobby = { isEmpty: true, isFull: false, players: [] };

http.listen(SERVER_PORT, function () {
    console.log("Server started, listening on *:" + SERVER_PORT);
});

//#region io.on
io.on('connection', function (socket) {
    console.log("USER: " + socket.id + " CONNECTED TO SERVER.");
    /**DEBUG ONLY */users.set(socket.id, { pseudo: "pseudo" + (Math.floor(Math.random() * 100000)) }); // Debug only
    user = users.get(socket.id); // Use as reference to quick selection // TODO : Need verify it's really working...
    console.log("User: " + socket.id + " have pseudo: " + user.pseudo);

    // Use to debug only, call when client is connected first time.
    socket.on('debugEnterCanvas', function () {
        debugInitGame();
    });

    socket.on('getPseudo', function (pseudo) {
        user.pseudo = pseudo;
        console.log("User: " + socket.id + " gave pseudo: " + user.pseudo);
    });

    /**
     * Here 3 states :
     * Lobby is empty, must create a new one.
     * Lobby is filling.
     * Lobby is full, so party was launch and new player can't enter in it
     */
    socket.on('wantJoinLobby', function () {
        if (lobby.isEmpty) {
            console.log("Lobby is opening with user: " + socket.id);
            lobby.isEmpty = false;
            lobby.players.push(socket.id); // Add id of socket in lobby.
            socket.join('lobby'); // It's a room, used to broadcast at the right players.
            socket.emit("enterLobby", returnPlayersPseudosInLobby(lobby.players, users)); // Emit to connected socket
        } else if (lobby.isFull) {
            console.log("User: " + socket.id + " tried to enter in lobby but it was full.");
        } else {
            console.log("User: " + socket.id + " joins the lobby." + Math.abs((lobby.players.length - NUMBER_MAX_PLAYERS)) + " place(s) left.");
            lobby.players.push(socket.id); // Add id of socket in lobby.
            socket.join('lobby');
            socket.emit("enterLobby", returnPlayersPseudosInLobby(lobby.players, users)); // Emit to connected socket
            socket.broadcast.emit("updateLobby", returnPlayersPseudosInLobby(lobby.players, users)); // Update others sockets

            if (lobby.players.length >= NUMBER_MAX_PLAYERS) {
                lobby.isFull = true;
                io.in('lobby').emit('initGame');
                console.log("Lobby is full, launch a party.");
            }
        }
    });
    //#region Game Turn
    socket.on('LoadedMyOwnGrid', function () {
        user.haveLoadedHisGrid = true;
        if (checkIfPartyCanBegin()) { // Players can begin the party and shoot each other
            io.in('party').emit('letsPlay', MESSAGE_PLAYER_CAN_ATTACK);
            newTurn()
        }
    });
    /**Receive mouse pos */
    socket.on('sendPosMouse', function (mousePos) {
        // IMPORTANT : LOOK IF PLAYER CAN PLAY
        //if (playerCanPlay()) // Send back boolean to tell if player can play
        //let cell = whichCellIsTouched(/**Take pos as argument*/) // Send back an object with {playerId: id, cellIndexOnGrid: {x: int, y:int }}, or null
        //strikeCell(/**Take a pos and an id */)// Search if a boat is touch // Determine if a boat is sinked // Determine if a player loose all his boats
        // Emission retour doit contenir : la grille qui a été touché en l'identifiant grace à son encre,
        // Et les coordonnées de la case touchée. Ou l'index ?
    });
    //#endregion

    socket.on('askGrid', function () {
        // Generate grid
        console.log("*** GENERATING GRID to player: " + user.pseudo + " ***");
        initClientGrid();

        // Generate boats on grid
        console.log("*** GENERATE BOATS to player: " + user.pseudo + " ***");
        initClientBoats();
        console.log("*** END OF GENERATION BOATS to player: " + user.pseudo + " ***");

        // Send grid and boats to client and others player
        socket.emit('sendInitGrid', returnGridClientOwner(user.gridInfo));
        socket.to('party').emit('sendInitGridToOtherPlayers',
            { pseudo: user.pseudo, gridInfo: returnGridToOtherPlayer(user.gridInfo) });

        // If this player is not the first to enter in the party
        // we need to send other players grid already in party to him
        for (let i = 0; i < party.players.length; i++) {
            let otherPlayer = party.players[i];
            if (otherPlayer != user) { // To avoid send another time to player his own grid
                socket.emit('sendInitGridToOtherPlayers', {
                    pseudo: otherPlayer.pseudo, gridInfo: returnGridToOtherPlayer(otherPlayer.gridInfo)
                });
            }
        }
    });

    socket.on('disconnect', function () {
        console.log("USER: " + socket.id + " disconnected from server.")
        // If disconnected, remove from user and lobby
        let index = lobby.players.indexOf(socket.id);
        if (index > -1) {
            lobby.players.splice(index, 1);
            console.log("Removed player: " + socket.id + " from lobby.")
        }
        users.delete(socket.id) ? console.log("Remove user: " + socket.id + " from users list.")
            : console.log("ERROR: tried to remove an inexistant user from users.");
    });

    function debugInitGame() {
        lobby.players.push(socket.id);
        socket.join('lobby');
        socket.join('party'); // Use to emit to the good players
        socket.emit('initGame');
        party.players.push(user) // Add ref to party
        user.haveFinishedHisTurn = true;
    }

    function initClientGrid() {
        if (indexPlayer <= NUMBER_MAX_PLAYERS) {
            // Generate grid
            user.gridInfo = grids.generateGrid(indexPlayer);
            console.log("USER " + socket.id + " with pseudo " + user.pseudo + " have indexPlayer of " + indexPlayer);
            user.playerNumber = indexPlayer;
            indexPlayer++;
        } else {
            console.log("ERROR: TO MUCH CLIENT ASKING FOR A GRID, in func initClientGrid().")
        }

    }

    function initClientBoats() {
        user.boats = boats.generateBoats(user.gridInfo.grid);
    }
});
//#endregion io.com

/**
 * Take the map with users and return pseudos of players
 * @param {Map<id, user>} players 
 */
function returnPlayersPseudos(players) {
    let pseudos = [];
    players.forEach(function (user) {
        pseudos.push(user.pseudo);
    });
    return pseudos;
}

/**
 * Take the list of lobby.players and send back a list of pseudos
 * @param {[id]} ids
 * @param {Map<id, user>} users
 */
function returnPlayersPseudosInLobby(ids, users) {
    let pseudos = [];
    ids.forEach(function (id) {
        pseudos.push(users.get(id).pseudo);
    });
    return pseudos;
}

/**
 * This function purge the propertie gridInfo from user to just send the data 
 * necessary to render correctly the client. Client don't have to get access
 * to pointers to his boat, he just needs to know where they are.
 * Work with the actuel socket or other users.
 * 
 * Return the purged grid
 * @param {*} gridInfo user.gridInfo (in real: users.get(socket.id).gridInfo)
 */
function returnGridClientOwner(gridInfo) {
    let gridToSend = Object.assign({}, gridInfo);

    for (let x = 0; x < gridToSend.grid.length; x++) {

        for (let y = 0; y < gridToSend.grid[x].length; y++) {
            if (gridToSend.grid[x][y].boat !== null) { // If there is a pointer to a boat, change it to a boolean with value true
                gridToSend.grid[x][y].boat = true;
            } else { // Or if there is no boat, change the null value to a boolean with false
                gridToSend.grid[x][y].boat = false;
            }
        }
    }
    return gridToSend;
}

/**
 * This function purge the propertie gridInfo from user to pass it to other player's client.
 * 
 * Returned the purged grid
 * @param {*} gridInfo user.gridInfo (in real: users.get(socket.id).gridInfo)
 */
function returnGridToOtherPlayer(gridInfo) {
    let gridToSend = Object.assign({}, gridInfo);

    for (let x = 0; x < gridToSend.grid.length; x++) {

        for (let y = 0; y < gridToSend.grid[x].length; y++) {
            // We hide info to others clients/players.
            gridToSend.grid[x][y].boat = false;
            gridToSend.grid[x][y].touched = false;
        }
    }
    return gridToSend;
}

/**
 * Search in the party if all players has entered the game and has loaded his grid.
 */
function checkIfPartyCanBegin() {
    let flag = true;
    if (party.players.length === NUMBER_MAX_PLAYERS) { // Check if all players are in the party
        party.players.forEach(player => {
            if (!player.haveLoadedHisGrid) {
                return false;
            }
        });
        return true;
    }
}

function canPlayerPlaye(user) {
    if (!user.haveFinishedHisTurn) {
        return true;
    } else {
        console.log("USER " + socket.id + " with pseudo " + user.pseudo + " tried to shoot out of his turn");
    }
}

// TODO test function to get pos of cursor. Added to client
// TODO : Enlever le debug
// TODO : instituer le tour par tour
// TODO : Systeme de victoire
