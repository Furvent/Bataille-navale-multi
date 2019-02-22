"use strict";

let col = require('./collision'); // Use to handle collisions

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
    },
    searchWhichCellIsTouched: function(pos, grids) {
        // Search which grid is touched
        return whichGridTouched(pos, this.players, grids);
        // Search which cell is touched
    }
}

function playersReinitiateTurn(players) {
    players.forEach(player => {
        player.haveFinishedHisTurn = false;
    });
}

function whichGridTouched(pos, players, grids) {
    /**
     * The grid width in pixels
     */
    let gridW = grids.CELL_SIDE * grids.GRID_WIDTH;
    /**
     * The grid height in pixels
     */
    let gridH = grids.CELL_SIDE * grids.GRID_HEIGHT;
    for (let i = 0; i < players.length; i++) {
        if (isThisGrid(pos, players[i]), gridW, gridH) {

        }
    }
}

function isThisGrid(pos, player, gridW, gridH) {
    let rect = {};
    let x = player.gridInfo.anchor.x;
    let y = player.gridInfo.anchor.y;
    /**
     * The anchor point of the grid, the same from player.gridInfo.anchor
     */
    rect.begin.x = x;
    rect.begin.y = y;
    /**
     * The last anchor point of the grid
     */
    rect.end.x = x + gridW;
    rect.end.y = y + gridH;
    return col.rectWithPoint(rect, pos);
}