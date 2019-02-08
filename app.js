"use strict";

let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

app.use(express.static('public'));

const server = 7589;

let users = new Map();
let lobby = {isEmpty: true, isFull: false, players: []};

http.listen(server, function () {
    console.log("Server started, listening on *:" + server);
});

io.on('connection', function (socket) {
    console.log("USER: " + socket.id + "    CONNECTED TO SERVER.");
    users.set(socket.id, {});
    let user = users.get(socket.id) // Use as reference to quick selection

    socket.on('getPseudo', function (pseudo) {
        user.pseudo = pseudo;
        console.log("User: " + socket.id + " gave pseudo: " + users.get(socket.id).pseudo)
    });

    /**
     * Here 3 states :
     * Lobby is empty, must create a new one.
     * Lobby is filling.
     * Lobby is full, so party is currently launch and player can't enter in it
     */
    socket.on('wantJoinLobby', function() {
        if (lobby.isEmpty) {
            console.log("Lobby is opening with user: " + socket.id);
            lobby.isEmpty = false;
            lobby.players.push(socket.id);
            let pseudos = returnPlayersPseudos(users);
            socket.emit("updateLobby", pseudos)
            console.log("Server emit pseudos of users: " + pseudos);
        } else if (lobby.isFull) {
            console.log("User: " + socket.id + " tried to enter in lobby but it was full.");
        } else {
            console.log("User: " + socket.id + " joins the lobby." + (lobby.length - 4) + " place(s) left.");
        }
    });

    socket.on('disconnect', function () {

    });
});

/**
 * Take the map with users and return pseudos of players
 * @param {Map} players 
 */
function returnPlayersPseudos(players) {
    let pseudos = [];
    players.forEach( function (user) {
        console.log("Debug in returnPlayersPseudos, user: " + user); // Debug TODO: REMOVE
        pseudos.push(user.pseudo);
    })
    return pseudos;
}