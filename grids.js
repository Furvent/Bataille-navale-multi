/**
 * Handle all function relative to grid and boats generation.
 * Also stock the grids itself.
 */

module.exports = {

    CONST: { // In pixels
        CELL_SIDE: 25,
        SPACE_BETWEEN_GRIDS: 50,
        SPACE_BETWEEN_GRIDS_AND_CANVAS: 25
    },

    /**
     * Generate grid informations.
     * gridInfo have those properties :
     *  - anchor position
     *  - the grid itself with all informations (touchedCell, boats in cell, and cell's positions)
     * @param {Integer} width : number of cells in width
     * @param {Integer} height : number of cells in height
     * @param {Integer} playerIndex : to determinate at wich position the player will be
     */
    generateGrid: function (width, height, playerIndex) {
        let gridInfo = {};
        gridInfo.grid = [];
        let xAndYDistant = SPACE_BETWEEN_GRIDS_AND_CANVAS + SPACE_BETWEEN_GRIDS + (CELL_SIDE * width);
        switch (playerIndex) {
            case 1: // Top left
                gridInfo.anchor = {
                    x: SPACE_BETWEEN_GRIDS_AND_CANVAS,
                    y: SPACE_BETWEEN_GRIDS_AND_CANVAS
                }
                break;
            case 2: // Top right
                gridInfo.anchor = {
                    x: xAndYDistant,
                    y: SPACE_BETWEEN_GRIDS_AND_CANVAS
                }
                break;
            case 3: // Bottom left
                gridInfo.anchor = {
                    x: SPACE_BETWEEN_GRIDS_AND_CANVAS,
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
                    x: SPACE_BETWEEN_GRIDS_AND_CANVAS,
                    y: SPACE_BETWEEN_GRIDS_AND_CANVAS
                }
                break;
        }
        let grid = gridInfo.grid; // Shortcut
        for (let x = 0; x < width; x++) {
            grid.push([]);
            for (let y = 0; y < height; y++) {
                grid[x].push();
                grid[x][y] = {
                    touched: false, // Does the cell was touched by any player ? To render it visible on client side.
                    boat: null, // Ref to a boat if there is one.
                    pos: { // Position of cell's anchor in pixels. Use to collision with mouse
                        x: grid.anchor.x + (x * CELL_SIDE),
                        y: grid.anchor.y + (y * CELL_SIDE)
                    }
                }
            }
        }
        return gridInfo;
    }
};

// function initGrid(widthCell, heightCell) {
//     let grid = [];
//     for (let i = 0; i < widthCell; i++) {
//         grid.push([]);
//         for (let j = 0; j < heightCell; j++) {
//             grid[i].push();
//             grid[i][j] = {
//                 // Does the cell was touched ?
//                 touched: false,
//                 // If there a boat at this cell ?
//                 thereIsBoat: false,
//                 // If this cell is at one square from a boat (use to generate distants boats)
//                 // closeToBoat: false,
//                 // Position in pixels used to draw
//                 originPos: {
//                     x: 0,
//                     y: 0
//                 }
//             }
//         }
//     }
//     return grid;
// }