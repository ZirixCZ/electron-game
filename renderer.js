/////////////////////////////
/// Renderer process
/////////////////////////////

/**
 * Reference to object with the specified value of the ID attribute.
 * CanvasRenderingContext2D provides methods and properties for drawing graphics on a canvas element
 */
let ctx = document.getElementById("canvas").getContext("2d");
/**
 * Global properties
 * @type {{arc_y: number, playerHeight: number, movementDirection: number, arc_y_direction: number, speedMultiplier: number, arc_x: number, arc_x_direction: number, playerPosition_x: number, playerWidth: number, gameScore: number, bottomPlayerPadding: number}}
 */
const values = {
    gameScore: 0,
    numOfTargets: 5,
    targets: [],
    targetHeight: 150,
    speedMultiplier: 30,
    bottomPlayerPadding: 8,
    playerHeight: 150,
    playerWidth: 150,
    playerPosition_x: 0, // Player location. Defines start of the player object
    movementDirection: 0, // Defines the direction of travel for the player
    arc_x: 200, // Arc x location
    arc_y: 300, // Arc y location
    arcRadius: 75,
    arc_y_direction: 1, // Defines the direction of vertical travel for the arc
    arc_x_direction: 1 // Defines the direction of horizontal travel for the arc
}

let football = new Image();
football.src = "./assets/football.png";
let footballgoal = new Image();
footballgoal.src = "./assets/footballgoal.png";
let footballgoalcheckmark = new Image();
footballgoalcheckmark.src = "./assets/footballgoalcheckmark.png";
let foot = new Image();
foot.src = "./assets/foot.png";



/**
 * Fires immediately after the browser loads the object.
 */
window.onload = () => {
    requestAnimationFrame(update);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {String} color - Background color
 */
function drawCtx(ctx, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.imageSmoothingQuality = "high"
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

/**
 * Draws the player
 * Determines if and where should the player move
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} playerPosition_x - Position of the player
 * @param {Number} direction - Can be either > 0 || < 0
 */
function drawPlayer(ctx, playerPosition_x, direction) {
    direction *= values.speedMultiplier;
    playerPosition_x = playerPosition_x + direction;

    if (playerPosition_x >= 0 && playerPosition_x <= window.innerWidth - values.playerWidth + 5)
        values.playerPosition_x = playerPosition_x;

    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.moveTo(playerPosition_x, window.innerHeight - window.innerHeight / values.bottomPlayerPadding);
    //ctx.rect(playerPosition_x, window.innerHeight - window.innerHeight / values.bottomPlayerPadding, values.playerWidth, values.playerHeight);
    ctx.drawImage(foot, playerPosition_x, window.innerHeight - window.innerHeight / values.bottomPlayerPadding, values.playerWidth, values.playerHeight);
    ctx.fillStyle = "white";
    ctx.stroke();
}

/**
 * Draws the arc
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} y - Defines the current position of the arc
 */
function drawBall(ctx, y) {
    values.arc_y = y + (15 * values.arc_y_direction);
    values.arc_x = values.arc_x + (5  * values.arc_x_direction);

    if (values.arc_x < 0) {
        values.arc_x += 25;
        values.arc_x_direction *= -1;
    } else if (values.arc_x > window.innerWidth) {
        values.arc_x -= 25;
        values.arc_x_direction *= -1;
    }

    if (values.arc_y >= (window.innerHeight - window.innerHeight / values.bottomPlayerPadding) - values.arcRadius
        && values.arc_y <= window.innerHeight - window.innerHeight / values.bottomPlayerPadding - values.arcRadius/8
        && values.arc_x >= values.playerPosition_x - 50 - values.arcRadius / 2
        && values.arc_x <= values.playerPosition_x + 50 + values.playerWidth + values.arcRadius / 2) {
        values.arc_y_direction *= -1;
        if (values.movementDirection !== values.arc_x_direction && values.movementDirection !== 0) {
            values.arc_x_direction *= -1;
        }


        if (values.arc_y < (window.innerHeight - window.innerHeight / values.bottomPlayerPadding) - (values.playerHeight + 25))
            return;

        values.gameScore++;
    }

    if (values.arc_y <= values.targetHeight)
        values.arc_y_direction *= -1;

    if (values.arc_x <= 0 || values.arc_x >= window.innerWidth) {
        values.arc_x_direction *= -1;
    }
    ctx.beginPath();
    ctx.drawImage(football, values.arc_x, values.arc_y, values.arcRadius, values.arcRadius);
    ctx.fill();
}

class Target {
    constructor(identification) {
        this.identification = identification;
    }

    getId() {
        return this.identification;
    }
}

function createTargets() {
    for (let i = 0; i < values.numOfTargets; i++)
        values.targets[i] = new Target(i);
}

/**
 * Draws the targets depending on values.Targets[]
 * When the ball collides with any of the targets, the target disappears (by replacing its id with -1)
 * The ball also changes it's y direction
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} targets
 */
function drawTargets(ctx, targets) {
    let offset = 75;

    let isInTargetArea = false;
    if (values.arc_y <= values.targetHeight + values.arcRadius / 2)
        isInTargetArea = true;

    let targetExists = false;
    targets.forEach((target) => {
        if (target.getId() !== -1)
            targetExists = true;
        if (isInTargetArea && values.arc_x >= offset && values.arc_x <= offset + window.innerWidth / values.numOfTargets) {
            target.identification = -1;
            values.arc_y_direction *= -1;
        }
        ctx.beginPath();
        ctx.drawImage(target.getId() === -1 ? footballgoalcheckmark : footballgoal, offset, 0, window.innerWidth / values.numOfTargets - 150, values.targetHeight);
        ctx.fill();
        offset = offset + window.innerWidth / values.numOfTargets;
    })

    if (!targetExists) {
        createTargets()
    }
}

/**
 * Recursive update function
 * Takes care of drawing everything onto the screen && checks for user inputs
 */
function update() {
    if (!ctx.canvas) return;

    document.onkeydown = (e) =>
        values.movementDirection = e.key === "d" || e.key === "ArrowRight" ? 1 : e.key === "a" || e.key === "ArrowLeft" ? -1 : 0;

    document.onkeyup = (e) =>
        values.movementDirection = 0;

    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    drawCtx(ctx, "#112");
    drawBall(ctx, values.arc_y);
    drawPlayer(ctx, values.playerPosition_x, values.movementDirection);
    drawTargets(ctx, values.targets);


    ctx.font = '48px serif';
    ctx.fillText('My beloved game', window.innerWidth / 2, window.innerHeight / 2);
    ctx.font = '90px serif';
    ctx.fillText(values.gameScore, window.innerWidth / 2, window.innerHeight / 2 + 150);

    setTimeout(() => {
        requestAnimationFrame(update);
    }, 1000 / 60);
}


