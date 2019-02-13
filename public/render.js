"use strict";

// Side of a cell in pixels
const CELL_SIDE = 25;

/**
 * Main render loop, call each func to render game
 * @param {*} canvasWidth The width of the canvas
 * @param {*} canvasHeight The height of the canvas
 * @param {*} canvasContext Where draw
 * @param {*} playerGridInfo The client grid
 * @param {*} pseudo The pseudo of the client grid
 * @param {*} otherPlayersGrid The other players hidden grid
 */
function drawEverything(canvasWidth, canvasHeight, canvasContext, playerGridInfo, pseudo, otherPlayersGrid) {
    drawBackground(canvasContext, canvasWidth, canvasHeight);
    // Draw player grid
    if (playerGridInfo !== null) {
        drawClientGrid(canvasContext, playerGridInfo, pseudo);
    } else {
        console.log("Can't render client grid, playerGridInfo is null");
    }
    // Draw other player's grid
    if (otherPlayersGrid.length > 0) {
        drawOtherPlayersGrid(canvasContext, otherPlayersGrid);
    } else {
        console.log("Can't render other player's grid, otherPlayersGrid is empty");
    }
}

/**
 * Draw the background
 * @param {*} ctx The canvas where draw
 * @param {*} cWidth The width of the canvas
 * @param {*} cHeight The height of the canvas
 */
function drawBackground(ctx, cWidth, cHeight) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, cWidth, cHeight);
}

/**
 * Render the grid of the player
 * @param {*} ctx The canvas where draw
 * @param {*} pInfo The info of player to render : object with anchor and grid
 * @param {*} pseudo The pseudo to show next the grid
 */
function drawClientGrid(ctx, pInfo, pseudo) {
    let grid = pInfo.grid; // Shortcut
    let anchor = pInfo.anchor; // Shortcut

    // Draw the pseudo at the top of the grid
    drawPseudo(ctx, pseudo, anchor, grid.length);

    for (let x = 0; x < grid.length; x++) {
        // Draw number in the top of the first row
        drawIndexGrid(
            ctx,
            x + 1,
            anchor.x + (CELL_SIDE / 2) + (CELL_SIDE * x) - 3,
            anchor.y - 5
        );

        for (let y = 0; y < grid[x].length; y++) {
            // Draw letters at the left of the first column
            if (x === 0) {
                drawIndexGrid(
                    ctx,
                    translateNumToLetter(y),
                    anchor.x - 5,
                    anchor.y + (CELL_SIDE / 2) + (CELL_SIDE * y) + 3
                );
            }
            let cell = grid[x][y]; // Shortcut
            // To draw the inner grid
            ctx.strokeStyle = "black";
            ctx.linWidth = 1;
            ctx.strokeRect(cell.pos.x, cell.pos.y, CELL_SIDE, CELL_SIDE);

            // Here we render the importants info
            if (cell.touched && cell.boat) { // If there is a boat and cell is touched
                ctx.fillStyle = "red";
                ctx.fillRect(cell.pos.x, cell.pos.y, CELL_SIDE, CELL_SIDE);
            } else if (cell.boat) {
                ctx.fillStyle = "blue";
                ctx.fillRect(cell.pos.x, cell.pos.y, CELL_SIDE, CELL_SIDE);
            } else if (cell.touched) {
                ctx.fillStyle = "yellow";
                ctx.fillRect(cell.pos.x, cell.pos.y, CELL_SIDE, CELL_SIDE);
            } // No need else, by default it's in white.
        }
    }
}

function drawOtherPlayersGrid(canvasContext, otherPlayersGrid) {
    for (let i = 0; i < otherPlayersGrid.length; i++) {
        drawOneGridOfOtherPlayer(canvasContext, otherPlayersGrid[i]);
    }
}


function drawOneGridOfOtherPlayer(ctx, pInfoOtherPlayer) {
    let grid = pInfoOtherPlayer.grid; // Shortcut
    let anchor = pInfoOtherPlayer.anchor; // Shortcut
    let pseudo = pInfoOtherPlayer.pseudo // Shortcut

    // Draw the pseudo at the top of the grid
    drawPseudo(ctx, pseudo, anchor, grid.length);

    for (let x = 0; x < grid.length; x++) {
        // Draw number in the top of the first row
        drawIndexGrid(
            ctx,
            x + 1,
            anchor.x + (CELL_SIDE / 2) + (CELL_SIDE * x) - 3,
            anchor.y - 5
        );

        for (let y = 0; y < grid[x].length; y++) {
            // Draw letters at the left of the first column
            if (x === 0) {
                drawIndexGrid(
                    ctx,
                    translateNumToLetter(y),
                    anchor.x - 5,
                    anchor.y + (CELL_SIDE / 2) + (CELL_SIDE * y) + 3
                );
            }
            let cell = grid[x][y]; // Shortcut
            // To draw the inner grid
            ctx.strokeStyle = "black";
            ctx.linWidth = 1;
            ctx.strokeRect(cell.pos.x, cell.pos.y, CELL_SIDE, CELL_SIDE);

            // Here we render the importants info
            if (cell.touched && cell.boat) { // If there is a boat and cell is touched
                ctx.fillStyle = "red";
                ctx.fillRect(cell.pos.x, cell.pos.y, CELL_SIDE, CELL_SIDE);
            } else if (!cell.touched) { // IF NOT TOUCHED, at the difference of client rendering grid
                ctx.fillStyle = "grey";
                ctx.fillRect(cell.pos.x, cell.pos.y, CELL_SIDE, CELL_SIDE);
            } // No need else, by default it's in white.
        }
    }
}

/**
 * Show numbers and letters at the side of the grid
 */
function drawIndexGrid(ctx, text, x, y) {
    ctx.fillStyle = "red";
    ctx.font = "10px Arial";
    ctx.fillText(text, x, y);
}

function drawPseudo(ctx, pseudo, anchor, width) {
    ctx.fillStyle = "red";
    ctx.font = "15px Arial";
    ctx.fillText(
        pseudo,
        anchor.x + (CELL_SIDE * width / 2), // At the middle of the grid
        anchor.y - 15 // At the top of th grid
    );
}

/**
 * Take a num and translate it as number : 0 -> a, 1 -> b etc
 * @param {*} num The num to translate in letter
 */
function translateNumToLetter(num) {
    let str = "abcdefghijklmnopqrstuvwxyz";
    return str.charAt(num);
}