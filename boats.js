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
        this.pos = pos;
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

let boats = require('./boats');
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
* Return a boat
    * @param {Integer} size : The size of the boat
    * @param {[[]]} grid : the grid where add the boat
    */
function placeBoat(size, grid) {
    let newBoat = null;

    // While the boat is not placed
    while (newBoat === null) {

        // We choose randomly two indexes
        let xIndex = getRandomInt(grid.length);
        let yIndex = getRandomInt(grid[0].length);

        newBoat = tryToPlaceBoatAtThisPosition(size, grid, xIndex, yIndex)
    }
    return newBoat;
}

/**
 * See func placeBoat(size, grid).
 * Return a boat.
 * **REFACTO WORK**: Use 1, 0 -1 to give direction to a function call in each direction
 * @param {Integer} boatSize : the size of the boat
 * @param {[[]]} grid : the grid where add the boat
 * @param {Integer} xIndex : the random pos in x
 * @param {Integer} yIndex : the random pos in y
 */
function tryToPlaceBoatAtThisPosition(boatSize, grid, xIndex, yIndex) {
    let newBoat = null;
    // We choose a random direction
    let direction = getRandomDirection();
    let counterDirection = 0; // If we reach 4, it means we tried all directions.

    // While we don't try all direction and we didn't find a place to our boat
    while (counterDirection < 4 && newBoat === null) {
        switch (direction) {
            case "Up":

                // We verify that the end position of the newBoat will not be out of the grid
                if (grid[xIndex][yIndex - boatSize] !== undefined) {
                    let flagBoatCantBePlacedInThisDirection = false;

                    for (let i = 0; i < boatSize && !flagBoatCantBePlacedInThisDirection; i++) {
                        let pos = { x: xIndex, y: yIndex - i }; // Shortcut
                        // We check if another boat will cross our new one, or if it will be too close
                        if (thereIsAlreadyABoat(pos, grid) || isToCloseToAnotherBoat(pos, grid)) {
                            flagBoatCantBePlacedInThisDirection = true; // Can't place the newBoat, out of loop.
                        }
                    } // Out of loop

                    if (!flagBoatCantBePlacedInThisDirection) {
                        // If we reach this point, we can instantiate a new boat
                        newBoat = new boats.Boat(boatSize, []);
                        console.log("---BOAT GENERATE with size:" + boatSize + ". POSITIONS: ")

                        // Find and give all positions to the newBoat, and reference them to the grid
                        for (let i = 0; i < boatSize; i++) {
                            let pos = { x: xIndex, y: yIndex - i };
                            newBoat.pos.push(pos);
                            grid[pos.x][pos.y].boat = newBoat;
                            console.log("Pos: " + i + " is: " + pos.x + "-" + pos.y);
                        }
                        console.log("END OF THIS BOAT GENERATION---");
                    }
                }
                break;

            case "Right":

                // We verify that the end position of the newBoat will not be out of the grid
                if (grid[xIndex + boatSize] !== undefined) {
                    let flagBoatCantBePlacedInThisDirection = false;

                    for (let i = 0; i < boatSize && !flagBoatCantBePlacedInThisDirection; i++) {
                        let pos = { x: xIndex + i, y: yIndex }; // Shortcut
                        // We check if another boat will cross our new one, or if it will be too close
                        if (thereIsAlreadyABoat(pos, grid) || isToCloseToAnotherBoat(pos, grid)) {
                            flagBoatCantBePlacedInThisDirection = true; // Can't place the newBoat, out of loop.
                        }
                    } // Out of loop

                    if (!flagBoatCantBePlacedInThisDirection) {
                        // If we reach this point, we can instantiate a new boat
                        newBoat = new boats.Boat(boatSize, []);
                        console.log("---BOAT GENERATE with size:" + boatSize + ". POSITIONS: ")

                        // Find and give all positions to the newBoat, and reference them to the grid
                        for (let i = 0; i < boatSize; i++) {
                            let pos = { x: xIndex + i, y: yIndex };
                            newBoat.pos.push(pos);
                            grid[pos.x][pos.y].boat = newBoat;
                            console.log("Pos: " + i + " is: " + pos.x + "-" + pos.y);
                        }
                        console.log("END OF THIS BOAT GENERATION---");
                    }
                }
                break;

            case "Down":

                // We verify that the end position of the newBoat will not be out of the grid
                if (grid[xIndex][yIndex + boatSize] !== undefined) {
                    let flagBoatCantBePlacedInThisDirection = false;

                    for (let i = 0; i < boatSize && !flagBoatCantBePlacedInThisDirection; i++) {
                        let pos = { x: xIndex, y: yIndex + i }; // Shortcut
                        // We check if another boat will cross our new one, or if it will be too close
                        if (thereIsAlreadyABoat(pos, grid) || isToCloseToAnotherBoat(pos, grid)) {
                            flagBoatCantBePlacedInThisDirection = true; // Can't place the newBoat, out of loop.
                        }
                    } // Out of loop

                    if (!flagBoatCantBePlacedInThisDirection) {
                        // If we reach this point, we can instantiate a new boat
                        newBoat = new boats.Boat(boatSize, []);
                        console.log("---BOAT GENERATE with size:" + boatSize + ". POSITIONS: ")

                        // Find and give all positions to the newBoat, and reference them to the grid
                        for (let i = 0; i < boatSize; i++) {
                            let pos = { x: xIndex, y: yIndex + i };
                            newBoat.pos.push(pos);
                            grid[pos.x][pos.y].boat = newBoat;
                            console.log("Pos: " + i + " is: " + pos.x + "-" + pos.y);
                        }
                        console.log("END OF THIS BOAT GENERATION---");
                    }
                }
                break;

            case "Left":

                // We verify that the end position of the newBoat will not be out of the grid
                if (grid[xIndex - boatSize] !== undefined) {
                    let flagBoatCantBePlacedInThisDirection = false;

                    for (let i = 0; i < boatSize && !flagBoatCantBePlacedInThisDirection; i++) {
                        let pos = { x: xIndex - i, y: yIndex }; // Shortcut
                        // We check if another boat will cross our new one, or if it will be too close
                        if (thereIsAlreadyABoat(pos, grid) || isToCloseToAnotherBoat(pos, grid)) {
                            flagBoatCantBePlacedInThisDirection = true; // Can't place the newBoat, out of loop.
                        }
                    } // Out of loop

                    if (!flagBoatCantBePlacedInThisDirection) {
                        // If we reach this point, we can instantiate a new boat
                        newBoat = new boats.Boat(boatSize, []);
                        console.log("---BOAT GENERATE with size:" + boatSize + ". POSITIONS: ")

                        // Find and give all positions to the newBoat, and reference them to the grid
                        for (let i = 0; i < boatSize; i++) {
                            let pos = { x: xIndex - i, y: yIndex };
                            newBoat.pos.push(pos);
                            grid[pos.x][pos.y].boat = newBoat;
                            console.log("Pos: " + i + " is: " + pos.x + "-" + pos.y);
                        }
                        console.log("END OF THIS BOAT GENERATION---");
                    }
                }
                break;

            default:
                Console.log("ERROR: not normal to reach the default in this switch, in func tryToPlaceBoatAtThisPosition")
                break;
        }
        // If we reach this instruction, try another direction
        direction = nextDirection();
        // To go out from this position
        counterDirection++;
    }
    return newBoat;
}

/**
 * Search in grid if a boat is already positionned at given position.
 * Return a bool
 * @param {Object} pos : {x: int, y: int}
 * @param {Object} grid : the grid where search
 */
function thereIsAlreadyABoat(pos, grid) {
    return (grid[pos.x][pos.y].boat !== null);
}

/**
 * Look at all cell around to check if another boat is present.
 * Return a bool
 * @param {Object} pos : {x: int, y: int}
 * @param {Object} grid : the grid where search
 */
function isToCloseToAnotherBoat(pos, grid) {
    // Check left
    if (grid[pos.x - 1] !== undefined) { // To avoid - Error: out of array
        if (grid[pos.x - 1][pos.y] !== undefined) { // To avoid - Error: out of array
            if (grid[pos.x - 1][pos.y].boat !== null) return true;
        }
        // left up
        if (grid[pos.x - 1][pos.y - 1] !== undefined) {
            if (grid[pos.x - 1][pos.y - 1].boat !== null) return true;
        }
        // left down
        if (grid[pos.x - 1][pos.y + 1] !== undefined) {
            if (grid[pos.x - 1][pos.y + 1].boat !== null) return true;
        }
    }

    // Check up
    if (grid[pos.x][pos.y - 1] !== undefined) {
        if (grid[pos.x][pos.y - 1].boat !== null) return true;
    }
    // Check down
    if (grid[pos.x][pos.y + 1] !== undefined) {
        if (grid[pos.x][pos.y + 1].boat !== null) return true;
    }
    // Check right
    if (grid[pos.x + 1] !== undefined) {
        if (grid[pos.x + 1][pos.y] !== undefined) {
            if (grid[pos.x + 1][pos.y].boat !== null) return true;
        }
        // right up
        if (grid[pos.x + 1][pos.y - 1] !== undefined) {
            if (grid[pos.x + 1][pos.y - 1].boat !== null) return true;
        }
        //right down
        if (grid[pos.x + 1][pos.y + 1] !== undefined) {
            if (grid[pos.x + 1][pos.y + 1].boat !== null) return true;
        }
    }
    return false;
}