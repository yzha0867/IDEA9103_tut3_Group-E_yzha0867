// =======================================================================
// ======================== Global Variables =============================
// =======================================================================
// This section defines all shared state used across the sketch, including
// the global background colour, colour palettes for circles and patterns,
// and the arrays that store Circle objects and the subset of circles used
// as connection nodes. These variables are initialised in setup() and then
// read by the drawing functions in draw(), layout, and the Circle class.

let globalBgColor;       // Background colour
let circleBasePalette;   // Base colours for the circles 
let patternPalette;      // Colours for patterns/details 
let circles;             // Stores all circle objects
let connectedNodes;      // Stores the circles selected as connection nodes (key "VIP" nodes)
let backgroundDots;

// =================== AUDIO VARIABLES (Individual Task) ===================
// These variables are added for the individual animation task to make circles
// respond to specific musical notes in the audio file.
let songs = [];              // Array to hold all song objects
let currentSongIndex = 0;   // Index of currently playing song
let fft;                    // FFT analyser for frequency analysis
let noteCircles;            // Array of 7 circles that respond to musical notes C-D-E-F-G-A-B
let amplitude;              // Amplitude analyser for overall volume
let playPauseButton;
let nextButton;
let prevButton;

// Song List - song filenames here 
const SONG_LIST = [
    'Towards the Dream.MP3',
    'The Continent.MP3',
    'Songline.MP3',
    'Aitribe Meets the Dream Ghost.MP3',
    'A Circular Ceremon.MP3',
    'The Other Side.MP3',
    'Magnificent Gallery.MP3',
    'Truth In Passing.MP3',
    'Australian Dawn - The Quiet Earth Cries Inside.MP3',
]

// Album information
const ALBUM_NAME = 'Dreamtime Return';

// Musical note frequencies (C4 to B4 octave)
// Source: Standard musical pitch frequencies
// https://en.wikipedia.org/wiki/Piano_key_frequencies
const noteFrequencies = {
    'C': { low: 246, high: 277, center: 261.63 },  
    'D': { low: 277, high: 311, center: 293.66 },  
    'E': { low: 311, high: 349, center: 329.63 },  
    'F': { low: 349, high: 392, center: 369.99 },  
    'G': { low: 370, high: 415, center: 392.00 },  
    'A': { low: 415, high: 466, center: 440.00 },  
    'B': { low: 466, high: 523, center: 493.88 },   
};

// Color mapping for each musical note (rainbow spectrum)
// Each note gets a unique glow color when activated
const noteColors = {
    'C': { r: 255, g: 50,  b: 50  },  // Red
    'D': { r: 255, g: 140, b: 0   },  // Orange
    'E': { r: 255, g: 220, b: 0   },  // Yellow
    'F': { r: 50,  g: 255, b: 100 },  // Green
    'G': { r: 0,   g: 200, b: 255 },  // Cyan
    'A': { r: 80,  g: 80,  b: 255 },  // Blue
    'B': { r: 200, g: 50,  b: 255 }   // Purple
};


// =========================================================================
// ======================= Layout & Background =============================
// =========================================================================
// This section is responsible for the overall composition of the artwork.
// It generates the fixed layout of circle centres, selects some of them as
// "VIP" nodes for the network layer, draws the distance-based connection
// lines between those nodes, and renders the random dot background texture
// that sits underneath all circles.


// --- Responsiveness ---
function windowResized() {
    let size = min(windowWidth, windowHeight);
    resizeCanvas(size, size);
    
   // Reposition all buttons
   repositionButtons();
}

function repositionButtons() {
    if (playPauseButton && prevButton && nextButton) {
        let buttonY = height - 60;
        let spacing = 160; // Space between buttons
        
        // Center the play/pause button
        playPauseButton.position((windowWidth - playPauseButton.width) / 2, buttonY);
        
        // Position prev button to the left
        prevButton.position(
            (windowWidth - playPauseButton.width) / 2 - spacing,
            buttonY
        );
        
        // Position next button to the right
        nextButton.position(
            (windowWidth - playPauseButton.width) / 2 + playPauseButton.width + spacing - nextButton.width,
            buttonY
        );
    }
}


// --- Layout generation ---
function createFixedLayout() {
    circles = [];       
    connectedNodes = []; 
    noteCircles = [];    

   
    // Compared to the Group file, this makes circles smaller so they have room to grow without overcrowding
    let r = width / 10;  

    // Add circles along specific diagonal coordinates
    // Parameters: count, startX, startY, stepX, stepY, radius
    addCirclesOnLine(5, width / 7.1, height / 7.1, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, width / 2, (height * 2) / 20, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, (width * 4) / 5, 0, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, width / 20, height / 2.2, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, 0, (height * 8) / 10, width / 4.8, height / 4.8, r);
    
    // ===== INDIVIDUAL TASK: Select 7 circles for musical note response =====

    // All circles are pushed into circles[] in sequence within createFixedLayout(), 
    // i.e. their order in the array is the order in which they were created.
    // The indices below were chosen manually after inspecting the layout,
    // so that the 7 note circles are visually balanced and spread across the canvas.
    let noteIndices = [15, 16, 2, 3, 6, 21, 4]; 

    let noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    
    for (let i = 0; i < noteIndices.length; i++) {
        if (noteIndices[i] < circles.length) {
            let circle = circles[noteIndices[i]];
            circle.isNoteCircle = true;
            circle.noteName = noteNames[i];
            circle.noteFreq = noteFrequencies[noteNames[i]];
            
            // Assign the unique glow color for this note
            let noteColor = noteColors[noteNames[i]];
            circle.glowColor = color(noteColor.r, noteColor.g, noteColor.b);
            
            noteCircles.push(circle);
        }
    }
}

function addCirclesOnLine(count, startX, startY, stepX, stepY, r) {
    for (let i = 0; i < count; i++) {
        let x = startX + stepX * i;
        let y = startY + stepY * i;
        let c = new Circle(x, y, r);
        circles.push(c);
        if (random(1) < 0.7) {
            connectedNodes.push(c);
        }
    }
}

function drawNetworkLines() {
    let linkColor = color(240, 230, 200, 180);
    push(); 
    stroke(linkColor);
    strokeWeight(10);
    for (let i = 0; i < connectedNodes.length; i++) {
        for (let j = i + 1; j < connectedNodes.length; j++) {
            let c1 = connectedNodes[i];
            let c2 = connectedNodes[j];
            // Compute Euclidean distance between two circle centers.
            // dist() is from the p5.js reference: https://p5js.org/reference/p5/dist/
            let d = dist(c1.x, c1.y, c2.x, c2.y); // Calculate distance between two nodes
            // Only connect nodes that are within a certain distance, so that circles next to each other are connected
            if (d < width / 2.8) { 
                line(c1.x, c1.y, c2.x, c2.y); 
            }
        }   
    }
    pop();
}


function generateBackgroundDots() {
    backgroundDots = [];
    let density = 0.004;
    let numDots = floor(width * height * density);

    for (let i = 0; i < numDots; i++) {
        let dot = {
            x: random(width),
            y: random(height),
            size: random(width * 0.002, width * 0.005),
            alpha: random(100, 200)
        };
        backgroundDots.push(dot);
    }
}

function drawBackgroundDots() {
    push();
    noStroke();
    
    for (let dot of backgroundDots) {
        fill(255, 255, 255, dot.alpha);
        ellipse(dot.x, dot.y, dot.size);
    }
    pop();
}

// ======================================================================
// ======================== CIRCLE CLASS ================================
// ======================================================================
// The Circle class encapsulates all logic for drawing a single circular
// motif. Each Circle instance stores its position, radius, and randomly
// chosen pattern types for the outer, middle, and inner layers. The class
// provides a display() method that renders the circle as a three-layer
// structure (buffer, outer, middle, inner) using a variety of generative
// pattern functions.

class Circle {
/*
    Each Circle object randomly selects pattern types for its outer, middle,
    and inner layers. This modular structure expands on OOP techniques,
    enabling controlled variation through generative rules.
*/

    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r; 

        this.outerPatternType = floor(random(4)); 
        this.middlePatternType = floor(random(4)); 
        this.innerPatternType = floor(random(2)); 

        this.outerBaseColor = random(circleBasePalette);
        this.outerPatternColor = random(patternPalette);
        this.middleBaseColor = random(circleBasePalette);
        this.middlePatternColor = random(patternPalette);
        this.innerBaseColor = random(circleBasePalette);
        this.innerPatternColor = random(patternPalette);
        
        this.isNoteCircle = false;
        this.noteName = '';
        this.noteFreq = null;
        this.isActive = false;
        
        // Store the glow color for this note (will be set when assigned a note)
        this.glowColor = null;  // Will be set in createFixedLayout()
        
        this.currentScale = 1.0;
        this.targetScale = 1.0;
        this.scaleSpeed = 0.12;
        this.colorIntensity = 0;
        this.targetColorIntensity = 0;
        this.colorSpeed = 0.15;
        this.rotation = 0;
        this.targetRotation = 0;
        this.rotationSpeed = 0.05;
    }

    updateScale() {
        this.currentScale = lerp(this.currentScale, this.targetScale, this.scaleSpeed);
        this.colorIntensity = lerp(this.colorIntensity, this.targetColorIntensity, this.colorSpeed);
        this.rotation = lerp(this.rotation, this.targetRotation, this.rotationSpeed);
    }

    display() {
        push(); 
        translate(this.x, this.y);
        
        if (this.isNoteCircle) {
            scale(this.currentScale);
            rotate(this.rotation);
        }
        
        if (this.isNoteCircle && this.colorIntensity > 0.1) {
            this.drawGlowEffect(this.colorIntensity);
        }
        
        this.drawHandDrawnCircle(this.r * 1.05, globalBgColor, null, 0);
        this.displayOuterPattern();  
        this.displayMiddlePattern(); 
        this.displayInnerPattern();  
        pop();
    }
    
    /*
        This glow rendering method was developed with guidance from ChatGPT.
        The technique simulates a soft, luminous halo by:
          - Layering multiple semi‑transparent ellipses of increasing size
          - Gradually reducing alpha for smooth falloff
          - Adding slight colour shifts to enhance depth
          - Drawing a bright “core” layer at the centre
        This glow effect is used to make each musical note visually “come alive,” 
        matching the dreamy, luminous atmosphere of *Dreamtime Return* and giving the note‑circles a clear, 
        expressive identity during playback.
    */
    drawGlowEffect(intensity) {
        // Use note-specific color for glow effect
        // Each note has its own unique color from the rainbow spectrum
        
        noStroke();
        
        // Use the note's unique glow color, or default to warm yellow if not set
        let glowR, glowG, glowB;
        if (this.glowColor) {
            glowR = red(this.glowColor);
            glowG = green(this.glowColor);
            glowB = blue(this.glowColor);
        } else {
            // Fallback color (warm yellow-orange)
            glowR = 255;
            glowG = 200;
            glowB = 100;
        }
        
        // Draw multiple layers of glow with decreasing opacity
        // Outer layers are larger and more transparent for soft glow effect
        for (let i = 8; i > 0; i--) {
            let glowSize = this.r * (1.15 + i * 0.12);  // Larger glow radius
            let alpha = (intensity * 80) / i;            // Stronger glow
            
            // Add slight color variation to outer layers for more depth
            let colorShift = (8 - i) * 5;
            fill(
                constrain(glowR + colorShift, 0, 255),
                constrain(glowG + colorShift, 0, 255), 
                constrain(glowB + colorShift, 0, 255),
                alpha
            );
            ellipse(0, 0, glowSize, glowSize);
        }
        
        //  Add bright inner core with note color
        let coreAlpha = intensity * 120;
        fill(glowR, glowG, glowB, coreAlpha);
        ellipse(0, 0, this.r * 1.05, this.r * 1.05);
    }

    // --- Drawing Utilities ---
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

    // larger version of drawIrregularBlob() used to draw big circular motifs
    drawHandDrawnCircle(r, fillCol, strokeCol, strokeW) {
    // draws a large base circle with a slightly jittered radius, 
    // beginShape() + curveVertex(): described above to create an organic, hand-drawn outline.

        //This function can be used to draw circles both with fill and without fill. 
        if (fillCol) fill(fillCol); else noFill();
        if (strokeCol) stroke(strokeCol); else noStroke();
        if (strokeW) strokeWeight(strokeW);
        beginShape();
        let points = 50; // if the number of points is too small, the circle will look like a polygon.
        // if the number of points is too big, the circle will look like too perfect!
        for (let i = 0; i <= points; i++) {
            let angle = (TWO_PI / points) * i;
             // Jitter the main radius
            let jitter = random(-r * 0.01, r * 0.01); 
            let radius = r + jitter;
            curveVertex(cos(angle) * radius, sin(angle) * radius);
        }
        endShape(CLOSE);
    }
    
    // ========================= OUTER PATTERNS ===============================
     displayOuterPattern() {
         // we want random color to increase the diversity of the outer patterns
        let baseColor, patCol;
        
        if (this.isNoteCircle && this.isActive) {
            baseColor = random(circleBasePalette);
            patCol = random(patternPalette);
        } else {
            baseColor = this.outerBaseColor;
            patCol = this.outerPatternColor;
        }
        
        //  Use colored stroke for active note circles
        let strokeColor = color(0, 50);  
        let strokeW = 2;
        
        if (this.isNoteCircle && this.isActive && this.glowColor) {
            // Use the note's glow color for the stroke, with higher intensity
            strokeColor = this.glowColor;
            strokeW = map(this.colorIntensity, 0, 1, 2, 6);  // Thicker stroke when active
        }
        
        this.drawHandDrawnCircle(this.r, baseColor, strokeColor, strokeW);
        
        // draw the outer pattern based on the pattern type
        switch (this.outerPatternType) {
            case 0: this.drawOuterDotsPattern(patCol); break;
            case 1: this.drawOuterRadiatingLinesPattern(patCol); break;
            case 2: this.drawOuterStripedRingPattern(patCol); break;
            case 3: this.drawOuterRadialDashPattern(patCol); break; 
        }
    }

    // Pattern 0: Irregular Dots Ring
    drawOuterDotsPattern(col) {
        let dotSize = this.r * 0.07;  
        let dotSpacing = this.r * 0.09; 
        // the dots ring starts from a radius of 0.65 times the radius of the circle
        // and will end at 0.95 times the radius of the circle
        // you can adjust all the parameters to achieve the effect you want
        for (let radius = this.r * 0.65; radius < this.r * 0.95; radius += dotSpacing) { 
            let count = floor((TWO_PI * radius) / dotSpacing);  // calculate the number of dots in this radius
            //so the density of dots on each circle is identical
            for (let i = 0; i < count; i++) { // draw dots ring
                let angle = (TWO_PI / count) * i;
                this.drawIrregularBlob(radius, angle, dotSize, col);
            }
        }
    }

    // Pattern 1: Radiating Lines (Sunburst)
    // Uses rotate() to simplify drawing lines radiating from center
    drawOuterRadiatingLinesPattern(col) {
        let numLines = 40;
        stroke(col);
        strokeWeight(this.r * 0.015);
        strokeCap(ROUND);
        for (let i = 0; i < numLines; i++) {
            let angle = (TWO_PI / numLines) * i + random(-0.05, 0.05);// add random jitter to each line

            push(); 
            rotate(angle); // Rotate context
            // Draw line along the X-axis
            line(this.r * 0.6, 0, this.r * 0.95, 0);
            // Draw dot at the tip
            this.drawIrregularBlob(this.r * 0.95, 0, this.r * 0.03, col); 
            pop(); 
        }
    }

     // Pattern 2: Striped Ring
    drawOuterStripedRingPattern(col) {
        noFill();
        stroke(col);
        let baseStrokeWeight = this.r * 0.025; 
        let numRings = 2; // we only want 2 rings to make the pattern look more brief
        // You can increase the number to get a more dense ring pattern
        for (let i = 0; i < numRings; i++) {
            let radius = map(i, 0, numRings - 1, this.r * 0.65, this.r * 0.9);
            // The map() function scales a value from one range to another.
            // Here, it takes the loop counter 'i' (which goes from 0 to numRings - 1)
            // and converts it to a corresponding radius value within the desired range
            // (from this.r * 0.65 to this.r * 0.9).
            strokeWeight(baseStrokeWeight * random(0.8, 1.2)); 
            this.drawHandDrawnCircle(radius, null, col, null);
            // Because we don't want a circle with fill, we pass 'null' for fillCol.
        }
    }
    
    // Pattern 3: Radial Dash (Sine Wave Spring)
    // Uses sin() to create a continuous wavy circumference
    // This pattern also relies on beginShape() + curveVertex() to render the wavy outer contour as a continuous organic loop.
    drawOuterRadialDashPattern(col) {
        noFill(); 
        stroke(col); 
        strokeWeight(this.r * 0.025);
        let baseRadius = this.r * 0.73;
        let waveHeight = baseRadius * 0.30;
        // waveHeight is the amplitude: how far the wave goes "in" and "out" from the baseRadius.
        let waveFrequency = 60;
        // waveFrequency controls how many full oscillations (bounces) happen around the circle.
        let totalPoints = 240; 
        // totalPoints determines the smoothness (resolution) of the shape. More points = smoother.
        // we use sin to create a wavy effect, it looks like a spring   
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
        let midBgColor, patCol;
        
        if (this.isNoteCircle && this.isActive) {
            midBgColor = random(circleBasePalette);
            patCol = random(patternPalette);
        } else {
            midBgColor = this.middleBaseColor;
            patCol = this.middlePatternColor;
        }
        
        this.drawHandDrawnCircle(this.r * 0.55, midBgColor, null, 0);
        
        switch (this.middlePatternType) {
            case 0: this.drawMiddleConcentricDotsPattern(patCol); break;
            case 1: this.drawMiddleUshapePattern(patCol); break;
            case 2: this.drawMiddleSolidRings(patCol); break;
            case 3: this.drawMiddleConcentricRings(patCol); break; 
        }
    }

    // Pattern 0: Concentric Dots
    // small version of drawOuterConcentricDotsPattern
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

    // Pattern 1: U-Shape Symbols
    // Represents a person sitting in Indigenous art
    drawMiddleUshapePattern(col) {
        noFill();
        stroke(col);
        strokeWeight(this.r * 0.02);
        let count = 8; // The total number of U-shapes to draw.
        let r = this.r * 0.35; // The radius of the orbit (the circle) on which the U-shapes will be placed.
        for (let i = 0; i < count; i++) {
            let angle = (TWO_PI / count) * i;
            // Calculate the angle for this specific shape's position around the circle.
            // (e.g., 0, 45, 90, 135 degrees...)
            push();
            rotate(angle); 
            translate(r, 0); 
            rotate(PI / 2); 
            // arc() draws a semicircle from angle 0 to PI (180 degrees), creating a U-shape. 
            arc(0, 0, this.r * 0.15, this.r * 0.15, 0, PI); 
            pop();
        }
    }

    // Pattern 2: Solid Rings
    drawMiddleSolidRings(col) {
        this.drawHandDrawnCircle(this.r * 0.45, col, null, 0);
        this.drawHandDrawnCircle(this.r * 0.3, col, null, 0);
    }

    // Pattern 3: Concentric Rings
    drawMiddleConcentricRings(col) {
        noFill();
        stroke(col);
        let baseStrokeWeight = this.r * 0.01; 
        let numRings = 5; // The total number of concentric rings to draw.
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
        let innerBgColor, patCol;
        
        if (this.isNoteCircle && this.isActive) {
            innerBgColor = random(circleBasePalette);
            patCol = random(patternPalette);
        } else {
            innerBgColor = this.innerBaseColor;
            patCol = this.innerPatternColor;
        }
        
        this.drawHandDrawnCircle(this.r * 0.25, innerBgColor, null, 0);
        
        if (this.innerPatternType === 0) {
        // Simple large blob (Center Eye)
            this.drawIrregularBlob(0, 0, this.r * 0.15, patCol);
        } else {
            noFill();
            stroke(patCol);
            strokeWeight(this.r * 0.015);
            // Here we again use beginShape() + curveVertex() to build a spiral-like
            // path, applying the same hand-drawn curve technique to the inner core.
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
// ========================== PRELOAD ==================================
// =====================================================================
function preload() {
    if (SONG_LIST.length > 0) {
        for (let i = 0; i < SONG_LIST.length; i++){
           songs.push(loadSound('assets/' + SONG_LIST[i]));
        }
    }
}

// =====================================================================
// ============================ SETUP ==================================
// =====================================================================
function setup() {
    // Use min dimension to ensure square aspect ratio fits screen
    let size = min(windowWidth, windowHeight);
    createCanvas(size, size);

    // --- 1. Colour palette system (Aboriginal-inspired style) ---
    globalBgColor = color(30, 20, 15); // Deep, dark earth background
    circleBasePalette = [
        color(90, 40, 20),   //  (Red Ochre)
        color(60, 30, 15),   //  (Deep Earth)
        color(40, 45, 35),   //  (Bush Green)
        color(110, 60, 30),  //  (Burnt Orange)
        color(20, 20, 20)    //  (Charcoal)
    ];


    patternPalette = [
        color(255, 255, 255), //  (Ceremony White)
        color(255, 240, 200), //  (Cream)
        color(255, 215, 0),   //  (Sun Yellow)
        color(255, 140, 80),  //  (Bright Ochre)
        color(160, 180, 140), //  (Sage)
        color(200, 200, 210)  //  (Ash)
    ];
    
    fft = new p5.FFT(0.9, 1024);
    amplitude = new p5.Amplitude();
    

    if (songs.length > 0) {
        for (let song of songs) {
            song.connect(fft);
        }
        amplitude.setInput(songs[currentSongIndex]);
    }
   
    prevButton = createButton('⏮ Prev');
    prevButton.id('prevButton');
    prevButton.mousePressed(playPreviousSong);
    
    playPauseButton = createButton('▶ Play');
    playPauseButton.id('playButton');
    playPauseButton.mousePressed(togglePlay);
    
    nextButton = createButton('Next ⏭');
    nextButton.id('nextButton');
    nextButton.mousePressed(playNextSong);
    
    repositionButtons();
    createFixedLayout();
    generateBackgroundDots();
}

// =====================================================================
// ======================= PLAYER FUNCTIONS ============================
// =====================================================================

function togglePlay() {
    if (songs.length === 0) return;
    let currentSong = songs[currentSongIndex];
    if (currentSong.isPlaying()) {
        currentSong.pause();
        playPauseButton.html('▶ Play');
    } else {
        currentSong.loop(); 
        playPauseButton.html('⏸ Pause');
    }
}

function playPreviousSong() {
    if (songs.length === 0) return;
    
    // Stop current song
    if (songs[currentSongIndex].isPlaying()) {
        songs[currentSongIndex].stop();
    }
    
    // Update index
    currentSongIndex--;
    if (currentSongIndex < 0) {
        currentSongIndex = songs.length - 1;
    }
    

    amplitude.setInput(songs[currentSongIndex]);
    songs[currentSongIndex].loop();
    playPauseButton.html('⏸ Pause');
}

function playNextSong() {
    if (songs.length === 0) return;
    
    // Stop current song
    if (songs[currentSongIndex].isPlaying()) {
        songs[currentSongIndex].stop();
    }
    
    // Update index
    currentSongIndex++;
    if (currentSongIndex >= songs.length) {
        currentSongIndex = 0;
    }
    
 
    amplitude.setInput(songs[currentSongIndex]);
    songs[currentSongIndex].loop();
    playPauseButton.html('⏸ Pause');
}

// =====================================================================
// =========================== DRAW ====================================
// =====================================================================
function draw() {
    background(globalBgColor); 

    // 1. Background Texture
    // Draw random white dots that fill the canvas to create atmosphere
    drawBackgroundDots();

    // 2. Connection Layer (Songlines)
    // Draw wide network lines between selected circle centres (VIP nodes)
    // Rendered BEFORE circles so lines appear to go *under* them
    drawNetworkLines();
    
    if (songs.length > 0) {
        let currentSong = songs[currentSongIndex];
        
        if (currentSong && currentSong.isPlaying()) {
            let spectrum = fft.analyze();

            // External DSP-style extension:
            // Use Nyquist frequency and spectrum length to map a target frequency band (C–B ranges)
            // to FFT bin indices, so we can approximate the energy of each musical note.
            //Referenc: https://sangarshanan.com/2024/11/05/visualising-music/
            let nyquist = 22050;
            let binSize = nyquist / spectrum.length;
            
            for (let c of noteCircles) {
                let bandLow = c.noteFreq.low;
                let bandHigh = c.noteFreq.high;
                let idxLow = floor(bandLow / binSize);
                let idxHigh = floor(bandHigh / binSize);
                idxLow = constrain(idxLow, 0, spectrum.length - 1);
                idxHigh = constrain(idxHigh, 0, spectrum.length - 1);
                
                let totalEnergy = 0;
                let count = 0;
                for (let i = idxLow; i <= idxHigh; i++) {
                    totalEnergy += spectrum[i];
                    count++;
                }
                let avgEnergy = count > 0 ? totalEnergy / count : 0;
                
                if (avgEnergy > 50) {
                    c.isActive = true;
                    c.targetScale = map(avgEnergy, 50, 255, 1.0, 1.8, true);
                    c.targetColorIntensity = map(avgEnergy, 50, 255, 0, 0.8, true);
                    let rotationAmount = map(avgEnergy, 50, 255, 0, 0.08, true);
                    c.targetRotation += rotationAmount;
                } else {
                    c.isActive = false;
                    c.targetScale = 1.0;
                    c.targetColorIntensity = 0;
                }
            }
        } else {
            if (noteCircles) {
                for (let c of noteCircles) {
                    c.isActive = false;
                    c.targetScale = 1.0;
                    c.targetColorIntensity = 0;
                    c.targetRotation = c.rotation;
                }
            }
        }
    }
    
    for (let c of circles) {
        c.updateScale();
    }

    for (let c of circles) {
        c.display();
    }
    
    if (songs.length > 0) {
        displaySongInfo();
    }
    
}

function displaySongInfo() {
    push();
    fill(255);
    noStroke();
    textAlign(CENTER, TOP);

    //Album name at the top
    textSize(16);
    fill(255, 215, 0); // Gold
    text(ALBUM_NAME, width / 2, 15);

    //Track Number
    textSize(14);
    fill(255); //White
    text(`Track ${currentSongIndex + 1} / ${songs.length}`, width / 2, 38);

    //Song title
    textSize(13);
    fill(255, 240, 200); //Cream 
    text(SONG_LIST[currentSongIndex], width / 2, 58);

    pop();
}

