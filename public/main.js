"use strict";

(function () {
    let socket = io();
    let title = document.getElementById('title');
    let container = document.getElementById('container');

    init();

    function init() {
        let pseudo = askPseudo(); // Get pseudo
        socket.emit('getPseudo', pseudo); // Send it to server
        showRestRoom(container, title); // Put player in restRoom where he will choose to join lobby 
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
                    pseudo = prompt("Je viens de commander plein de pizzas qui vont arriver à ton domicile");
                    break;
            }
        }
        return pseudo;
    }
})();