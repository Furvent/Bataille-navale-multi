"use strict";

module.exports = {
    /**
     * Return if there is a collision between a rectangle and a point
     * @param {*} rect The rectangle (the grid) to the form : {begin: {x:int, y:int}, end: {x:int, y:int}}
     * @param {*} point {x:int, y:int}
     * 
     * @return a boolean
     */
    rectWithPoint: function (rect, point) {
        console.log("DEBUG: Is " + rect.begin + "-" + rect.end + " touch by " + point);
        return pointIsSup(rect.begin, point) && pointIsInf(rect.end, point);
    }
}

/**
 * Compare two points and say if the second one is superior to the first one
 * @param {*} pos1 
 * @param {*} pos2
 * 
 * @return a boolean
 */
function pointIsSup(pos1, pos2) {
    return pos2.x > pos1.x && pos2.y > pos1.y
}

/**
 * Compare two points and say if the second one is inferior to the first one
 * @param {*} pos1 
 * @param {*} pos2
 * 
 * @return a boolean
 */
function pointIsInf(pos1, pos2) {
    return pos2.x < pos1.x && pos2.y < pos1.y
}