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

// =================== AUDIO VARIABLES (Individual Task) ===================
// These variables are added for the individual animation task to make circles
// respond to specific musical notes in the audio file.
let songs = [];              // Array to hold all song objects
let currentSongIndex = 0;   // Index of currently playing song
let fft;                    // FFT analyser for frequency analysis
let button;                 // Play/Pause button for user interaction
let noteCircles;            // Array of 7 circles that respond to musical notes C-D-E-F-G-A-B
let amplitude;              // Amplitude analyser for overall volume
let playPauseButton;
let nextButton;
let prevButton;

// Song List - song filenames here 
const SONG_LIST = [
    'audio.MP3',
]

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

// =========================================================================
// ======================= Layout & Background =============================
// =========================================================================

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

    let noteIndices = [1, 2, 3, 5, 6, 16, 17]; // More evenly distributed across canvas
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
        
        // OPTIMIZATION 3: Enhanced animation properties for richer visual effects
        this.currentScale = 1.0;      // Current scale factor
        this.targetScale = 1.0;       // Target scale factor
        this.scaleSpeed = 0.2;        // Speed of scale interpolation (increased from 0.15)
        
        // OPTIMIZATION 4: Adding color intensity animation
        // This technique was inspired by the Week 11 tutorial examples but adapted
        // to work with the existing color palette system.
        this.colorIntensity = 0;      // Current color glow intensity (0-1)
        this.targetColorIntensity = 0; // Target glow intensity
        this.colorSpeed = 0.25;        // Speed of color transition
        
        // OPTIMIZATION 5: Adding rotation animation for extra visual interest
        // Rotation adds dynamic movement that complements the scaling effect.
        this.rotation = 0;             // Current rotation angle
        this.targetRotation = 0;       // Target rotation angle
        this.rotationSpeed = 0.1;      // Speed of rotation
        
        // FIX 1: Remove ambient pulse - circles only respond when music is playing
        // and only note circles respond to their specific frequencies
        // Non-note circles will remain static
    }

    // ===== INDIVIDUAL TASK: Update scale based on audio =====
    // OPTIMIZATION 7: Smooth interpolation using lerp()
    // lerp() creates smooth transitions instead of instant jumps, making the animation
    // feel more natural and organic. This is demonstrated in the course examples.
    updateScale() {
        // Smoothly interpolate current scale towards target scale
        this.currentScale = lerp(this.currentScale, this.targetScale, this.scaleSpeed);
        
        // Smoothly interpolate color intensity
        this.colorIntensity = lerp(this.colorIntensity, this.targetColorIntensity, this.colorSpeed);
        
        // Smoothly interpolate rotation
        this.rotation = lerp(this.rotation, this.targetRotation, this.rotationSpeed);
    }

    // --- Main Display Method ---
    display() {
        push(); 
        
        // 1. Move origin to the circle's center
        translate(this.x, this.y);
        
        // ===== INDIVIDUAL TASK: Apply transformations =====
        // FIX 1 & FIX 2: Only apply scaling and rotation for note circles when active
        // Non-note circles remain completely static
        if (this.isNoteCircle) {
            scale(this.currentScale);
            rotate(this.rotation);
        }
        
        // OPTIMIZATION 9: Add glow effect for active note circles
        // This technique uses layered semi-transparent circles to create a glow effect.
        // Inspired by various p5.js glow tutorials but implemented using basic drawing.
        // Reference: https://p5js.org/examples/color-radial-gradient.html concept
        if (this.isNoteCircle && this.colorIntensity > 0.1) {
            this.drawGlowEffect(this.colorIntensity);
        }
        
        // 2. Draw Buffer Circle (Mask)
        this.drawHandDrawnCircle(this.r * 1.05, globalBgColor, null, 0);

        // 3. Draw Patterns
        this.displayOuterPattern();  
        this.displayMiddlePattern(); 
        this.displayInnerPattern();  

        pop();
    }
    
    // OPTIMIZATION 10: Glow effect method
    // This was not covered in class but creates a nice visual enhancement.
    // It draws multiple semi-transparent circles with decreasing opacity to simulate glow.
    drawGlowEffect(intensity) {
        noStroke();
        // Draw 5 concentric circles with decreasing opacity for glow effect
        for (let i = 5; i > 0; i--) {
            let glowSize = this.r * (1.1 + i * 0.08);
            let alpha = (intensity * 60) / i; // Decreasing opacity
            // Use a warm highlight color for the glow
            fill(255, 200, 100, alpha);
            ellipse(0, 0, glowSize, glowSize);
        }
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
    for (let i = 0; i < SONG_LIST.length; i++){
       songs.push(loadSound('assets/' + SONG_LIST[i]));
    }
   
}

// =====================================================================
// ======================= SETUP =======================================
// =====================================================================
function setup() {
    let size = min(windowWidth, windowHeight);
    createCanvas(size, size);
  

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
    // OPTIMIZATION 11: Increased smoothing and bins for better frequency resolution
    // More bins (1024 vs 512) provides finer frequency resolution, allowing better
    // detection of individual musical notes. Higher smoothing (0.85 vs 0.8) creates
    // smoother visual transitions.
    fft = new p5.FFT(0.9, 1024);
 
    //connect FFT to first song initially
    if (songs.length > 0){
        songs[currentSongIndex].connect(fft);
    }
    
    // OPTIMIZATION 12: Add amplitude analyser for overall music response
    // This creates a "global pulse" effect based on overall volume
    // Covered in Week 11 lecture examples.
    amplitude = new p5.Amplitude();
    if(songs.length > 0){
         amplitude.setInput(songs[currentSongIndex]);
    }
   
    
    // ==== Create Player Button ====
    // Previous button
    prevButton = createButton('⏮ Prev');
    prevButton.id('prevButton');
    prevButton.mousePressed(playPreviousSong);
    
    // Play/Pause button
    playPauseButton = createButton('▶ Play');
    playPauseButton.id('playButton');
    playPauseButton.mousePressed(togglePlay);
    
    // Next button
    nextButton = createButton('Next ⏭');
    nextButton.id('nextButton');
    nextButton.mousePressed(playNextSong);
    
    // Position buttons
    repositionButtons();


    // ===== Generate layout with note-reactive circles =====
    createFixedLayout();
}

// ===== INDIVIDUAL TASK: Player Functions =====

function togglePlay() {
    let currentSong = songs[currentSongIndex];

    if (currentSong.isPlaying()) {
        currentSong.pause();
        playPauseButton.html('▶ Play');
    } else {
        currentSong.loop(); 
        playPauseButton.html('⏸ Pause');
    }
}

function playPreviousSong(){
    //stop current song
    if (songs[currentSongIndex].isPlaying()){
        songs[currentSongIndex].stop();
    }

    //move to previous song
    currentSongIndex--;
    if(currentSongIndex < 0){
        currentSongIndex = songs.length - 1 //Wrap to last song
    }


    // Connect new song to FFT and amplitude
    songs[currentSongIndex].disconnect();
    songs[currentSongIndex].connect(fft);
    amplitude.setInput(songs[currentSongIndex]);
    
    // Play new song
    songs[currentSongIndex].loop();
    playPauseButton.html('⏸ Pause');
}

function playNextSong() {
    // Stop current song
    if (songs[currentSongIndex].isPlaying()) {
        songs[currentSongIndex].stop();
    }
    
    // Move to next song
    currentSongIndex++;
    if (currentSongIndex >= songs.length) {
        currentSongIndex = 0; // Wrap to first song
    }
    
    // Connect new song to FFT and amplitude
    songs[currentSongIndex].disconnect();
    songs[currentSongIndex].connect(fft);
    amplitude.setInput(songs[currentSongIndex]);
    
    // Play new song
    songs[currentSongIndex].loop();
    playPauseButton.html('⏸ Pause');
}

// =====================================================================
// ======================= DRAW ========================================
// =====================================================================
function draw() {
    background(globalBgColor); 

    // 1. Background Texture
    drawBackgroundDots();

    // 2. Connection Layer (Songlines)
    drawNetworkLines();
    
    let currentSong = songs[currentSongIndex];
    
    if (currentSong && currentSong.isPlaying()) {
        let spectrum = fft.analyze();
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
                c.targetScale = map(avgEnergy, 50, 255, 1.0, 1.8, true);
                c.targetColorIntensity = map(avgEnergy, 50, 255, 0, 0.8, true);
                let rotationAmount = map(avgEnergy, 50, 255, 0, 0.08, true);
                c.targetRotation += rotationAmount;
            } else {
                // 能量低时快速回归默认状态
                c.targetScale = 1.0;
                c.targetColorIntensity = 0;
            }
        }
    } else {
        if (noteCircles) {
            for (let c of noteCircles) {
                c.targetScale = 1.0;
                c.targetColorIntensity = 0;
                c.targetRotation = c.rotation;
            }
        }
    }
    
    for (let c of circles) {
        c.updateScale();
    }

    for (let c of circles) {
        c.display();
    }
    
    // Display current song info
    displaySongInfo();
}

function displaySongInfo() {
    push();
    fill(255);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(14);
    text(`Track ${currentSongIndex + 1} / ${songs.length}`, width / 2, 20);
    text(SONG_LIST[currentSongIndex], width / 2, 40);
    pop();
}
