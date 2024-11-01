// Initialize socket connection
let socket = io();
socket.on('connect', function () {
    console.log("Connected");
});

// Preload images
let defaultImage;
let imgPos = [];

function preload(){
    defaultImage = loadImage("media/male-nipple.png");
}

function setup() {
    // Create a canvas that covers the entire viewport
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);  // Position canvas at the top-left corner
    canvas.style('z-index', '10'); // Ensure canvas is on top of other elements
    canvas.style('pointer-events', 'none'); // Allow clicks to pass through to HTML elements

    // Listen for mouse position data from the server
    socket.on('data', function (mousePos) {
        console.log("Received mousePos", mousePos);
        imgPos.push(mousePos);
        
        // Check if both target clicks have been met to unblur images
        checkAndUnblur(mousePos);
    });
}

function draw(){
    clear(); // Clear previous frame for a clean redraw
    for (let i = 0; i < imgPos.length; i++){
        drawNipple(imgPos[i]);
    }
}

// Get mouse position and send to server
function mouseClicked() {
    let mousePos = { x: mouseX, y: mouseY };
    socket.emit('data', mousePos);
}

// Draw nipple image at specified position
function drawNipple(pos) {
    imageMode(CENTER);
    image(defaultImage, pos.x, pos.y, 30, 30);
}

// Target coordinates and threshold for unblurring each image
const targets = {
    img1: [{ x: 180, y: 170 }, { x: 217, y: 155 }],
    img2: [{ x: 639, y: 175 }, { x: 692, y: 159 }],
    img3: [{ x: 1132, y: 78 }, { x: 1163, y: 107 }]
};
const threshold = 5; // Adjusted threshold to ±5 pixels

// Track clicks for each image
let clickStates = {
    img1: { point1: false, point2: false },
    img2: { point1: false, point2: false },
    img3: { point1: false, point2: false }
};

// Check if both clicks for each image are near target points to unblur
function checkAndUnblur(mousePos) {
    // Check img1
    if (isNearTarget(mousePos, targets.img1[0])) clickStates.img1.point1 = true;
    if (isNearTarget(mousePos, targets.img1[1])) clickStates.img1.point2 = true;
    if (clickStates.img1.point1 && clickStates.img1.point2) {
        document.getElementById('img-1').style.filter = 'blur(0)';
        // Reset click states for img1 if you want to allow unblur on subsequent clicks
        clickStates.img1 = { point1: false, point2: false };
    }

    // Check img2
    if (isNearTarget(mousePos, targets.img2[0])) clickStates.img2.point1 = true;
    if (isNearTarget(mousePos, targets.img2[1])) clickStates.img2.point2 = true;
    if (clickStates.img2.point1 && clickStates.img2.point2) {
        document.getElementById('img-2').style.filter = 'blur(0)';
        clickStates.img2 = { point1: false, point2: false };
    }

    // Check img3
    if (isNearTarget(mousePos, targets.img3[0])) clickStates.img3.point1 = true;
    if (isNearTarget(mousePos, targets.img3[1])) clickStates.img3.point2 = true;
    if (clickStates.img3.point1 && clickStates.img3.point2) {
        document.getElementById('img-3').style.filter = 'blur(0)';
        clickStates.img3 = { point1: false, point2: false };
    }
}

// Function to check if mouse position is near a specific target
function isNearTarget(mousePos, target) {
    return (
        Math.abs(mousePos.x - target.x) <= threshold &&
        Math.abs(mousePos.y - target.y) <= threshold
    );
}
