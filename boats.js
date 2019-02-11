"use strict";
/**
 * Handle all functions relative to boats generation and populate them in grids.
 */
module.exports = {
    BOATS: [5, 4, 3, 3, 2, 2], // Boats that must be put in the grid. Each number correspond to a boat size.
    /**
     * Create a new boat with a size and an array of positions.
     * @param {Integer} size : The size of the boat 
     * @param {Array} pos : All pos of the boat, in format : [ {x: int, y: int} {x: int, y: int}, etc... ]
     */
    Boat: function (size, pos) {
        this.SIZE = size;
        this.life = size;
        this.POS = pos;
    },

    /**
     * Populate the grid with boats.
     * @param {Array[[]]} grid : the grid of a player
     */
    generateBoats: function (grid) {
        let boats = [];
        for (let i = 0; i < this.BOATS.length; i++) {
            boats.push(placeBoat(this.BOATS[i], grid));
        }
        return boats;
    }
}

/**
 * Return a number between 0 and "max" exclusif without float
 * @param {Integer} max 
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

/**
 * Return a direction
 */
function getRandomDirection() {
    let rand = getRandomInt(4);
    switch (rand) {
        case 0:
            return "Up"
        case 1:
            return "Right"
        case 2:
            return "Down"
        case 3:
            return "Left"
        default:
            return "Up";
    }
}

/**
 *  Return the nexDirection. "Up" -> "Right" -> "Down" -> "Left" -> "Up"
 * @param {String} dir 
 */
function nextDirection(dir) {
    if (dir === "Up") return "Right";
    else if (dir === "Right") return "Down";
    else if (dir === "Down") return "Left";
    else return "Up";
}

/**
* Tries to instantiate a boat in the grid with size (in cells) in parameters.
* First, make a random position, then make a random direction,
* and try to place it in the grid.
* Try means that the function verifies if another boat will cross the boat that it tries
* to place. And verifies also that the boat will not be too close from another boat (1 cell
* space).
* If it fails to do it, it tries another direction. If all directions are tested, it tries
* another position.
    * @param {Integer} size : The size of the boat
    * @param {[[]]} grid : the grid where add the boat
    */
function placeBoat(size, grid) {
    let boat = null;

    // While the boat is not placed
    while (boat === null) {

        // We choose randomly two indexes
        let xIndex = getRandomInt(grid.length);
        let yIndex = getRandomInt(grid[0].length);

        boat = tryToPlaceBoatInThisPosition(size, grid, xIndex, yIndex)
    }
    return boat;
}

function tryToPlaceBoatInThisPosition(size, grid, xIndex, yIndex) {
    let boat = null;
    // We choose a random direction
    let direction = getRandomDirection();
    let counterDirection = 0; // If we reach 4, it means we tried all directions.

    // While we don't try all direction and we didn't find a place to our boat
    while (counterDirection < 4 && !flagBoatWasPlaced) {
        switch (direction) {
            case "Up":
                // We verify that the end position of the boat will not be out of the grid
                if (grid[xIndex][yIndex - boatSize] !== undefined) {
                    let flagBoatCantBePlacedInThisDirection = false; // I'm using the flag to avoid use a break statement in next loop.
                    // TODO : just copy the algo in solo battle 
                }
                break;

            default:
                break;
        }
        // If we reach this instruction, try another direction
        direction = nextDirection();
        // To go out from this position
        counterDirection++;
    }
    return boat;
}