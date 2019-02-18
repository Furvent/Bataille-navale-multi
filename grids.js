"use strict";
/**
 * Handle all function relative to grids generation.
 */
module.exports = {

    // In pixels
    CELL_SIDE: 25,
    SPACE_BETWEEN_GRIDS: 50,
    SPACE_BETWEEN_GRIDS_AND_CANVAS: 50,

    // Number of cell FOR ONE GRID in width
    GRID_WIDTH: 10,
    // Number of cell FOR ONE GRID in height
    GRID_HEIGHT: 10,

    /**
     * Generate grid informations.
     * gridInfo have those properties :
     *  - anchor position
     *  - the grid itself with all informations (touchedCell, boats in cell, and cell's positions)
     * @param {Integer} width : number of cells in width
     * @param {Integer} height : number of cells in height
     * @param {Integer} playerIndex : to determinate at wich position the player will be
     */
    generateGrid: function (playerIndex) {
        /**
         * Is composed of the anchor and the grid itself
         */
        let gridInfo = {};
        /**
         * The grid itself with infos on all cells
         */
        gridInfo.grid = [];
        
        // Si je veux des grilles rectangulaires, c'est ici que je devrais revoir la distance des ancres.
        let xAndYDistant = this.SPACE_BETWEEN_GRIDS_AND_CANVAS + this.SPACE_BETWEEN_GRIDS + (this.CELL_SIDE * this.GRID_WIDTH);
        switch (playerIndex) {
            case 1: // Top left
                console.log("Give anchor to player " + playerIndex);
                gridInfo.anchor = {
                    x: this.SPACE_BETWEEN_GRIDS_AND_CANVAS,
                    y: this.SPACE_BETWEEN_GRIDS_AND_CANVAS
                }
                break;
            case 2: // Top right
                gridInfo.anchor = {
                    x: xAndYDistant,
                    y: this.SPACE_BETWEEN_GRIDS_AND_CANVAS
                }
                break;
            case 3: // Bottom left
                gridInfo.anchor = {
                    x: this.SPACE_BETWEEN_GRIDS_AND_CANVAS,
                    y: xAndYDistant
                }
                break;
            case 4: // Bottom right
                gridInfo.anchor = {
                    x: xAndYDistant,
                    y: xAndYDistant
                }
                break;

            default:
                gridInfo.anchor = {
                    x: this.SPACE_BETWEEN_GRIDS_AND_CANVAS,
                    y: this.SPACE_BETWEEN_GRIDS_AND_CANVAS
                }
                break;
        }
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            gridInfo.grid.push([]);
            for (let y = 0; y < this.GRID_HEIGHT; y++) {
                gridInfo.grid[x].push();
                gridInfo.grid[x][y] = {
                    touched: false, // Does the cell was touched by any player ? To render it visible on client side.
                    boat: null, // Ref to a boat if there is one.
                    pos: { // Position of cell's anchor in pixels. Use to collision with mouse
                        x: gridInfo.anchor.x + (x * this.CELL_SIDE),
                        y: gridInfo.anchor.y + (y * this.CELL_SIDE)
                    }
                }
            }
        }
        return gridInfo;
    }
};