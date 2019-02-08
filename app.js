"use strict";

let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

app.use(express.static('public'));

const server = 7589;

let users = new Map();

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

    socket.on('disconnect', function () {

    });
});