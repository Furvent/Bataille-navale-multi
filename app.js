"use strict";

let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let grids = require('./grids');
let boats = require('./boats');
let party = require('./party')

const numberMaxPlayers = 4;

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
 *   haveFinishedIsTurn: bool // Use to know if player can play
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

io.on('connection', function (socket) {
    console.log("USER: " + socket.id + " CONNECTED TO SERVER.");
    /**DEBUG ONLY */users.set(socket.id, { pseudo: "pseudo" + (Math.floor(Math.random() * 100000)) }); // Debug only
    user = users.get(socket.id); // Use as reference to quick selection // TODO : Need verify it's really working...
    console.log("User: " + socket.id + " have pseudo: " + user.pseudo);

    socket.on('debugEnterCanvas', function () { // Use to debug only, call when client is connected first time.
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
            console.log("User: " + socket.id + " joins the lobby." + Math.abs((lobby.players.length - numberMaxPlayers)) + " place(s) left.");
            lobby.players.push(socket.id); // Add id of socket in lobby.
            socket.join('lobby');
            socket.emit("enterLobby", returnPlayersPseudosInLobby(lobby.players, users)); // Emit to connected socket
            socket.broadcast.emit("updateLobby", returnPlayersPseudosInLobby(lobby.players, users)); // Update others sockets

            if (lobby.players.length >= numberMaxPlayers) {
                lobby.isFull = true;
                io.in('lobby').emit('initGame');
                console.log("Lobby is full, launch a party.");
            }
        }
    });

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
        { pseudo: user.pseudo, gridInfo: returnGridToOtherPlayer(user.gridInfo)});

        // If this player is not the first to enter in the party, we need to send other players grid already in party
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
    }

    function initClientGrid() {
        if (indexPlayer <= numberMaxPlayers) {
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
            // We hide info to other client.
            gridToSend.grid[x][y].boat = false; 
            gridToSend.grid[x][y].touched = false;
        }
    }
    return gridToSend;
}

// TODO BUG : Les joueurs qui arrivent ne voient pas les joueurs déjà connectés
// TODO : créer un objet "party" qui stockera des infos sur la partie :
// - les joueurs avec leur socket.id et un boolean pour savoir si ils ont joué sur ce tour
// - un compteur de tour