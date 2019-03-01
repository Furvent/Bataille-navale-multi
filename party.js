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

    /**
     * Initiate a new turn
     */
    playerNextTurn: function () {
        playersReinitiateTurn(this.players);
        this.numberTurns++;
        this.allPlayersHavePlayedThisTurn = false;
    },
    /**
     * Send back infos about where the player shoot
     * @param {*} pos The pos in pixel where player shooted
     * @param {*} grids a ref to the module grids.js to use its constante value
     * @param {*} shooter a ref to the user shooting
     */
    playerShoot: function (pos, grids, shooter) {
        // Search which player is touched
        let playerTouched = whichGridTouched(pos, this.players, grids);
        if (grid) /** If grid not null */ {

            if (shooter === playerTouched) /** If shooter is dumb and shoot is boat */ {
                console.log("PLAYER tried to shoot his own grid... *sigh*");
            } else {
                console.log("PLAYER shoot the grid of PLAYER: " + playerTouched.pseudo);
                let cellTouched = wichCellIsTouched(playerTouched.gridInfo.grid, pos, grids);

                if (cellTouched) /** If cell not null */ {
                    console.log("PLAYER touched the cell with index x: " + cellTouched.x + "-" + "y: " + cellTouched.y + ".");
                    return cellTouched;
                } else {
                    console.log("DEBUG : It's weird, the player touched a grid, but no cell was found. See function Party.playerShoot()");
                }

            }

        } else {
            console.log("PLAYER try to shoot at pos " + pos.x + "-" + pos.y + " en touched nothing.");
        }
        // If we reach that part of the func, send back null
        return null;
    }
}

function playersReinitiateTurn(players) {
    players.forEach(player => {
        player.haveFinishedHisTurn = false;
    });
}

/**
 * 
 * @param {*} pos the pos where player shooted
 * @param {*} players Array of players in the game 
 * @param {*} grids Ref to use grid const
 */
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
        if (isThisGrid(pos, players[i]), gridW, gridH) /** If this grid is touched */ {
            return players[i];
        }
    }
    return null;
}

/**
 * Search if the grid of this player is the one touched by the shooter.
 * @param {*} pos the pos where sthe shooter... shooted.
 * @param {*} player the player whose grid is testing
 * @param {*} gridW Grid width in pixels
 * @param {*} gridH Grid height in pixels
 */
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
/**
 * If this function is called, we know that a cell in this grid is touched.
 * Each cell is a rectangle, so we can use the collision algo use to find which grid was touched
 * @param {*} grid The grid to search in (it's a ref)
 * @param {*} pos The pos shooted
 * @param {*} grids A ref to the module grids.js
 * 
 * @return The index of the cell touched;
 */
function wichCellIsTouched(grid, pos, grids) {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            let cellPos = {
                begin: { /** The top left corner of the cell collider */
                    x: grid[i][j].pos.x + 1, // Add 1 to avoid touch the border of the cell
                    y: grid[i][j].pos.y + 1
                },
                end: { /** The bottom right corner of the cell collider */
                    x: grid[i][j].pos.x + grids.CELL_SIDE - 1,
                    y: grid[i][j].pos.y + grids.CELL_SIDE - 1
                }
            }
            if (col.rectWithPoint(cellPos, pos)) {
                return { x: i, y: j };
            }
        } // End j loop
    } // End i loop
    // If we reach that part of the code, send back null
    return null;
}