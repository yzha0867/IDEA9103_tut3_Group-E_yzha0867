// =======================================================================
// ======================== Global Variables =============================
// =======================================================================
// This section defines all shared state used across the sketch, including
// the global background colour, colour palettes for circles and patterns,
// and the arrays that store Circle objects and the subset of circles used
// as connection nodes. These variables are initialised in setup() and then
// read by the drawing functions in draw(), layout, and the Circle class.

let globalBgColor;       // Background colour
let circleBasePalette;   // Base colours for the circles (Deep Earth tones)
let patternPalette;      // Colours for patterns/details (High contrast/Bright)
let circles;             // Stores all circle objects
let connectedNodes;      // Stores the circles selected as connection nodes (key "VIP" nodes)

// =================== AUDIO VARIABLES (Individual Task) ===================
// These variables are added for the individual animation task to make circles
// respond to specific musical notes in the audio file.
let song;                // Holds the loaded audio file
let fft;                 // FFT analyser for frequency analysis
let button;              // Play/Pause button for user interaction
let noteCircles;         // Array of 7 circles that respond to musical notes C-D-E-F-G-A-B

// Musical note frequencies (C4 to B4 octave)
// Source: Standard musical pitch frequencies
// https://en.wikipedia.org/wiki/Piano_key_frequencies
const noteFrequencies = {
    'C': { low: 241, high: 282, center: 261.63 },  // C4
    'D': { low: 273, high: 314, center: 293.66 },  // D4
    'E': { low: 309, high: 350, center: 329.63 },  // E4
    'F': { low: 329, high: 370, center: 349.23 },  // F4
    'G': { low: 372, high: 412, center: 392.00 },  // G4
    'A': { low: 420, high: 460, center: 440.00 },  // A4
    'B': { low: 473, high: 515, center: 493.88 }   // B4
};

// =========================================================================
// ======================= Layout & Background =============================
// =========================================================================

// --- Responsiveness ---
function windowResized() {
    let size = min(windowWidth, windowHeight);
    resizeCanvas(size, size);
    
    // Reposition the play/pause button
    if (button) {
        button.position((width - button.width) / 2, height - button.height - 10);
    }
}

// --- Layout generation ---
function createFixedLayout() {
    circles = [];        // Initialise
    connectedNodes = []; 
    noteCircles = [];    // Initialise note-reactive circles array
  
    // Base radius unit relative to canvas width
    let r = width / 8; 

    // Add circles along specific diagonal coordinates
    // Parameters: count, startX, startY, stepX, stepY, radius
    addCirclesOnLine(5, width / 7.1, height / 7.1, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, width / 2, (height * 2) / 20, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, (width * 4) / 5, 0, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, width / 20, height / 2.2, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, 0, (height * 8) / 10, width / 4.8, height / 4.8, r);
    
    // ===== INDIVIDUAL TASK: Select 7 circles for musical note response =====
    // We select circles at strategic positions to create visual balance.
    // These 7 circles will respond to the 7 musical notes: C, D, E, F, G, A, B.
    let noteIndices = [2, 6, 10, 12, 14, 18, 22]; // Chosen for diagonal spread
    let noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    
    for (let i = 0; i < noteIndices.length; i++) {
        let circle = circles[noteIndices[i]];
        circle.isNoteCircle = true;           // Mark as note-reactive
        circle.noteName = noteNames[i];       // Assign note name
        circle.noteFreq = noteFrequencies[noteNames[i]]; // Assign frequency range
        noteCircles.push(circle);             // Add to noteCircles array
    }
}

function addCirclesOnLine(count, startX, startY, stepX, stepY, r) {
    for (let i = 0; i < count; i++) {
        let x = startX + stepX * i;
        let y = startY + stepY * i;
        let c = new Circle(x, y, r);
        circles.push(c);
        // Randomly select 70% of circles to be "nodes" for connections
        if (random(1) < 0.7) {
            connectedNodes.push(c);
        }
    }
}

// --- Draw connecting lines ---
function drawNetworkLines() {
    let linkColor = color(240, 230, 200, 180); // Creamy colour, semi-transparent

    // Use push/pop to isolate style settings for lines
    push(); 
    stroke(linkColor);
    strokeWeight(10); // Fixed wide width
    // Rounded line endings for smoother, organic-looking connectors.
    strokeCap(ROUND); // Rounded ends for natural look

    for (let i = 0; i < connectedNodes.length; i++) {
        for (let j = i + 1; j < connectedNodes.length; j++) {
            let c1 = connectedNodes[i];
            let c2 = connectedNodes[j];
            // Compute Euclidean distance between two circle centers.
            let d = dist(c1.x, c1.y, c2.x, c2.y); // Calculate distance between two nodes
            // Only connect nodes that are within a certain distance
            if (d < width / 2.8) { 
                line(c1.x, c1.y, c2.x, c2.y); 
            }
        }   
    }
    pop();
}

// --- Background texture: dense random scattered white dots ---
function drawBackgroundDots() {
    push();
    noStroke();
  
    let density = 0.004; // Controls how many dots per pixel area
    let numDots = floor(width * height * density);

    for (let i = 0; i < numDots; i++) {
        let x = random(width);
        let y = random(height);
        let dotSize = random(width * 0.002, width * 0.005);
        let alpha = random(100, 200);
        fill(255, 255, 255, alpha);
        ellipse(x, y, dotSize);
    }
    pop();
}

// ======================================================================
// ======================== CIRCLE CLASS ================================
// ======================================================================

class Circle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r; 

        // Randomly assign pattern types
        this.outerPatternType = floor(random(4)); 
        this.middlePatternType = floor(random(4)); 
        this.innerPatternType = floor(random(2)); 

        this.irregularity = 0.02;
        
        // ===== INDIVIDUAL TASK: Animation properties =====
        this.isNoteCircle = false;    // Whether this circle responds to audio
        this.noteName = '';           // Musical note name (C, D, E, etc.)
        this.noteFreq = null;         // Frequency range object
        this.currentScale = 1.0;      // Current scale factor
        this.targetScale = 1.0;       // Target scale factor
        this.scaleSpeed = 0.15;       // Speed of scale interpolation (0-1)
    }

    // ===== INDIVIDUAL TASK: Update scale based on audio =====
    // This method uses lerp() to create smooth scaling animation.
    updateScale() {
        // Smoothly interpolate current scale towards target scale
        this.currentScale = lerp(this.currentScale, this.targetScale, this.scaleSpeed);
    }

    // --- Main Display Method ---
    display() {
        push(); 
        
        // 1. Move origin to the circle's center
        translate(this.x, this.y);
        
        // ===== INDIVIDUAL TASK: Apply scale transformation =====
        // If this is a note-reactive circle, scale it based on audio
        if (this.isNoteCircle) {
            scale(this.currentScale);
        }
        
        // 2. Draw Buffer Circle (Mask)
        this.drawHandDrawnCircle(this.r * 1.05, globalBgColor, null, 0);

        // 3. Draw Patterns
        this.displayOuterPattern();  
        this.displayMiddlePattern(); 
        this.displayInnerPattern();  

        pop();
    }

    // --- Drawing Utilities (Helpers) ---
    /*
        Many of the custom shapes in this sketch use beginShape() together with
        curveVertex() to build smooth, organic outlines instead of perfect geometric primitives. 
        This technique was not fully covered in class and is adapted from the official p5.js reference:
            - beginShape(): https://p5js.org/reference/p5/beginShape/
            - curveVertex(): https://p5js.org/reference/p5/curveVertex/
    */

    drawIrregularBlob(rOffset, angle, size, col) {
        let x = cos(angle) * rOffset;
        let y = sin(angle) * rOffset;

        fill(col);
        noStroke();
        
        push();
        translate(x, y); 
        rotate(random(TWO_PI));
        beginShape();
        let points = 8;  
        for (let i = 0; i < points; i++) {
            let a = TWO_PI / points * i;
            let r = size * 0.5 * random(0.85, 1.15); 
            curveVertex(cos(a) * r, sin(a) * r); 
        }
        endShape(CLOSE);
        pop();
    }

    drawHandDrawnCircle(r, fillCol, strokeCol, strokeW) {
        if (fillCol) fill(fillCol); else noFill();
        if (strokeCol) stroke(strokeCol); else noStroke();
        if (strokeW) strokeWeight(strokeW);

        beginShape();
        let points = 50;
        for (let i = 0; i <= points; i++) {
            let angle = (TWO_PI / points) * i;
            let jitter = random(-r * 0.01, r * 0.01); 
            let radius = r + jitter;
            curveVertex(cos(angle) * radius, sin(angle) * radius);
        }
        endShape(CLOSE);
    }

    // ================= OUTER PATTERNS =================
    displayOuterPattern() {
        let baseColor = random(circleBasePalette);
        this.drawHandDrawnCircle(this.r, baseColor, color(0, 50), 2);
        let patCol = random(patternPalette);

        switch (this.outerPatternType) {
            case 0: this.drawOuterDotsPattern(patCol); break;
            case 1: this.drawOuterRadiatingLinesPattern(patCol); break;
            case 2: this.drawOuterStripedRingPattern(patCol); break;
            case 3: this.drawOuterRadialDashPattern(patCol); break; 
        }
    }

    drawOuterDotsPattern(col) {
        let dotSize = this.r * 0.07;  
        let dotSpacing = this.r * 0.09; 
        for (let radius = this.r * 0.65; radius < this.r * 0.95; radius += dotSpacing) { 
            let count = floor((TWO_PI * radius) / dotSpacing);
            for (let i = 0; i < count; i++) {
                let angle = (TWO_PI / count) * i;
                this.drawIrregularBlob(radius, angle, dotSize, col);
            }
        }
    }

    drawOuterRadiatingLinesPattern(col) {
        let numLines = 40;
        stroke(col);
        strokeWeight(this.r * 0.015);
        strokeCap(ROUND);
        
        for (let i = 0; i < numLines; i++) {
            let angle = (TWO_PI / numLines) * i + random(-0.05, 0.05);
            
            push(); 
            rotate(angle);
            line(this.r * 0.6, 0, this.r * 0.95, 0);
            this.drawIrregularBlob(this.r * 0.95, 0, this.r * 0.03, col); 
            pop(); 
        }
    }

    drawOuterStripedRingPattern(col) {
        noFill();
        stroke(col);
        let baseStrokeWeight = this.r * 0.025; 
        let numRings = 2;
        for (let i = 0; i < numRings; i++) {
            let radius = map(i, 0, numRings - 1, this.r * 0.65, this.r * 0.9);
            strokeWeight(baseStrokeWeight * random(0.8, 1.2)); 
            this.drawHandDrawnCircle(radius, null, col, null);
        }
    }
    
    drawOuterRadialDashPattern(col) {
        noFill(); 
        stroke(col); 
        strokeWeight(this.r * 0.025);
        let baseRadius = this.r * 0.73;
        let waveHeight = baseRadius * 0.30;
        let waveFrequency = 60;
        let totalPoints = 240;   
        
        beginShape();
        for (let j = 0; j <= totalPoints; j++) {
            let angle = (TWO_PI / totalPoints) * j;
            let offset = sin(angle * waveFrequency) * waveHeight;
            let finalRadius = baseRadius + offset;
            finalRadius += random(-this.r * 0.005, this.r * 0.005);
            curveVertex(cos(angle) * finalRadius, sin(angle) * finalRadius);
        }
        endShape(CLOSE); 
    }

    // ================= MIDDLE PATTERNS =================
    displayMiddlePattern() {
        let midBgColor = random(circleBasePalette);
        this.drawHandDrawnCircle(this.r * 0.55, midBgColor, null, 0);
        let patCol = random(patternPalette);

        switch (this.middlePatternType) {
            case 0: this.drawMiddleConcentricDotsPattern(patCol); break;
            case 1: this.drawMiddleUshapePattern(patCol); break;
            case 2: this.drawMiddleSolidRings(patCol); break;
            case 3: this.drawMiddleConcentricRings(patCol); break; 
        }
    }

    drawMiddleConcentricDotsPattern(col) {
        let dotSize = this.r * 0.04;
        for (let r = this.r * 0.2; r < this.r * 0.5; r += dotSize * 1.5) {
            let count = floor((TWO_PI * r) / (dotSize * 1.5));
            for (let i = 0; i < count; i++) {
                let angle = (TWO_PI / count) * i;
                this.drawIrregularBlob(r, angle, dotSize, col);
            }
        }
    }

    drawMiddleUshapePattern(col) {
        noFill();
        stroke(col);
        strokeWeight(this.r * 0.02);
        let count = 8;
        let r = this.r * 0.35;
    
        for (let i = 0; i < count; i++) {
            let angle = (TWO_PI / count) * i;
            push();
            rotate(angle); 
            translate(r, 0); 
            rotate(PI / 2); 
            arc(0, 0, this.r * 0.15, this.r * 0.15, 0, PI); 
            pop();
        }
    }

    drawMiddleSolidRings(col) {
        this.drawHandDrawnCircle(this.r * 0.45, col, null, 0);
        let col2 = random(patternPalette);
        this.drawHandDrawnCircle(this.r * 0.3, col2, null, 0);
    }

    drawMiddleConcentricRings(col) {
        noFill();
        stroke(col);
        let baseStrokeWeight = this.r * 0.01; 
        let numRings = 5;
        for (let j = 0; j < numRings; j++) {
            let currentRadius = map(j, 0, numRings - 1, this.r * 0.3, this.r * 0.5);
            strokeWeight(baseStrokeWeight * random(0.8, 1.2)); 
            beginShape();
            let points = 25; 
            for (let i = 0; i <= points; i++) {
                let angle = (TWO_PI / points) * i;
                let jitter = random(-this.r * 0.025, this.r * 0.025); 
                let radius = currentRadius + jitter;
                curveVertex(cos(angle) * radius, sin(angle) * radius);
            }
            endShape(CLOSE);
        }
    }

    // ================= INNER PATTERNS =================
    displayInnerPattern() {
        this.drawHandDrawnCircle(this.r * 0.25, random(circleBasePalette), null, 0);
        let patCol = random(patternPalette);
        
        if (this.innerPatternType === 0) {
            this.drawIrregularBlob(0, 0, this.r * 0.15, patCol);
        } else {
            noFill();
            stroke(patCol);
            strokeWeight(this.r * 0.015);
            beginShape();
            for (let i = 0; i < 50; i++) {
                let r = map(i, 0, 50, 0, this.r * 0.2);
                let angle = i * 0.4;
                curveVertex(cos(angle) * r, sin(angle) * r);
            }
            endShape();
        }
    }
}

// =====================================================================
// ======================= PRELOAD (Individual Task) ===================
// =====================================================================
// The preload() function is required for loading external assets like audio files.
function preload() {
    // Load the audio file uploaded by the user
    song = loadSound('assets/audio.MP3');
}

// =====================================================================
// ======================= SETUP =======================================
// =====================================================================
function setup() {
    let size = min(windowWidth, windowHeight);
    createCanvas(size, size);
  
    // pixelDensity() was not covered in class. 
    // It comes from the p5.js reference: https://p5js.org/reference/p5/pixelDensity/
    // It increases the device pixel ratio so the artwork renders more sharply on high-DPI/Retina screens.
    pixelDensity(2); 

    // --- Colour palette system (Aboriginal-inspired style) ---
    globalBgColor = color(30, 20, 15);

    circleBasePalette = [
        color(90, 40, 20),
        color(60, 30, 15),
        color(40, 45, 35),
        color(110, 60, 30),
        color(20, 20, 20)
    ];

    patternPalette = [
        color(255, 255, 255),
        color(255, 240, 200),
        color(255, 215, 0),
        color(255, 140, 80),
        color(160, 180, 140),
        color(200, 200, 210)
    ];
    
    // ===== INDIVIDUAL TASK: Audio Setup =====
    // Create FFT analyser with smoothing for cleaner frequency detection
    // Parameters: smoothing (0-1), bins (must be a power of 2).
    fft = new p5.FFT(0.8, 512);
    song.connect(fft);
    
    // Create Play/Pause button for user interaction
    // Browser policy requires user interaction before playing audio.
    button = createButton('Play/Pause');
    button.position((width - button.width) / 2, height - button.height - 10);
    button.mousePressed(togglePlay);
    
    // ===== Generate layout with note-reactive circles =====
    createFixedLayout();
}

// =====================================================================
// ======================= DRAW (Modified for Animation) ===============
// =====================================================================
function draw() {
    background(globalBgColor); 

    // 1. Background Texture
    drawBackgroundDots();

    // 2. Connection Layer (Songlines)
    drawNetworkLines();
    
    // ===== INDIVIDUAL TASK: Audio-reactive Animation =====
    // Analyse frequency spectrum and update circle scales while audio plays.
    if (song.isPlaying()) {
        // Get frequency spectrum data (array of 0-255 values).
        let spectrum = fft.analyze();
        // For each note circle, find the max energy in its frequency band.
        for (let c of noteCircles) {
            let bandLow = c.noteFreq.low;
            let bandHigh = c.noteFreq.high;
            // Convert Hz to index in spectrum array (assuming 0 Hz to 22050 Hz mapped to spectrum.length)
            let idxLow = floor(map(bandLow, 0, 22050, 0, spectrum.length - 1));
            let idxHigh = floor(map(bandHigh, 0, 22050, 0, spectrum.length - 1));
            let maxVal = 0;
            for (let i = idxLow; i <= idxHigh; i++) {
                if (spectrum[i] > maxVal) maxVal = spectrum[i];
            }
            // Map maxVal (0-255) to scale factor (1.0 to 1.45)
            c.targetScale = map(maxVal, 0, 255, 1.0, 1.45, true);
        }
    } else if (noteCircles) {
        // If not playing, reset all note circles to normal size
        for (let c of noteCircles) {
            c.targetScale = 1.0;
        }
    }
    // Update all note circle scales smoothly
    if (noteCircles) {
        for (let c of noteCircles) {
            c.updateScale();
        }
    }

    // 3. Main Circle Layer
    for (let c of circles) {
        c.display();
    }
}

// ===== INDIVIDUAL TASK: Play/Pause Button Handler =====
function togglePlay() {
    if (song.isPlaying()) {
        song.pause();
    } else {
        song.play();
    }
}