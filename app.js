"use strict";

let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let grids = require('./grids');

const numberMaxPlayers = 2;

app.use(express.static('public'));

const server = 7589;

// User is a map with a list of player with id as key
let users = new Map();
let user = null;

/**
 * user structure :
 * {
 *   pseudo: pseudo,
 *   gridInfo: { anchor: {x: x, y: y}, grid: grid[][]}
 * }
 */

// In object lobby, players is a list of id of players in lobby room
let lobby = { isEmpty: true, isFull: false, players: [] };

http.listen(server, function () {
    console.log("Server started, listening on *:" + server);
});

io.on('connection', function (socket) {
    console.log("USER: " + socket.id + " CONNECTED TO SERVER.");
    users.set(socket.id, { pseudo: "pseudo" + (Math.floor(Math.random() * 100000)) }); // Debug only
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
     * Lobby is full, so party is currently launch and player can't enter in it
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
                io.in('lobby').emit('launchGame');
                console.log("Lobby is full, launch a party.");
            }
        }
    });

    // Number of cell FOR ONE GRID in width
    const gridWidth = 10;
    // Number of cell FOR ONE GRID in height
    const gridHeight = 10;

    socket.on('askGrid', function () {
        initClientGrid(gridWidth, gridHeight); // Generate grid for client

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
        socket.emit('launchGame');
    }

    let indexPlayer = 1; // Use to know in wich order players are generating grid, to after that place them in the canvas.
    function initClientGrid(width, height) {
        if (indexPlayer <= numberMaxPlayers) {
            // Generate grid
            user.gridInfo = grids.generateGrid(width, height, playerIndex);
            indexPlayer++;
        } else {
            Console.log("ERROR: TO MUCH CLIENT ASKING FOR A GRID, in func initClientGrid().")
        }

    }
});

/**
 * Take the map with users and return pseudos of players
 * @param {Map<id, user>} players 
 */
function returnPlayersPseudos(players) {
    let pseudos = [];
    players.forEach(function (user) {
        console.log("Debug in returnPlayersPseudos, user: " + user); // Debug TODO: REMOVE
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