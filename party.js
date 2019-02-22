"use strict";

module.exports = {
    /**
     * Array of ref to players
     */
    players: [],
    numberTurns: 0,
    allPlayerHaveLoadedHisGrid: false,
    allPlayersHavePlayedThisTurn: false,
    playerNextTurn: function () {
        playersReinitiateTurn(this.players);
        this.numberTurns++;
        this.allPlayersHavePlayedThisTurn = false;   
    }
}

function playersReinitiateTurn(players) {
    players.forEach(player => {
        player.haveFinishedHisTurn = false;
    });
}