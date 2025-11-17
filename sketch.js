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
let song;                // Holds the loaded audio file
let fft;                 // FFT analyser for frequency analysis
let button;              // Play/Pause button for user interaction
let noteCircles;         // Array of 7 circles that respond to musical notes C-D-E-F-G-A-B
let amplitude;           // Amplitude analyser for overall volume

// Musical note frequencies (C4 to B4 octave)
// Source: Standard musical pitch frequencies
// https://en.wikipedia.org/wiki/Piano_key_frequencies
// 
// OPTIMIZATION 1: Wider frequency ranges for better detection
// Each note now covers a wider band to capture harmonics and variations in the music.
// The ranges are calculated as ±1 semitone from the center frequency to catch musical variations.
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
    
    // FIX 3: Better button repositioning that stays centered regardless of canvas size
    if (button) {
        button.position(
            (windowWidth - button.width) / 2,  // Use windowWidth instead of width
            height - button.height - 20         // Add more spacing from bottom
        );
    }
}

// --- Layout generation ---
function createFixedLayout() {
    circles = [];        // Initialise
    connectedNodes = []; 
    noteCircles = [];    // Initialise note-reactive circles array
  
    // FIX 2: Reduce base radius to half the original size
    // This makes circles smaller so they have room to grow without overcrowding
    let r = width / 10;  

    // Add circles along specific diagonal coordinates
    // Parameters: count, startX, startY, stepX, stepY, radius
    addCirclesOnLine(5, width / 7.1, height / 7.1, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, width / 2, (height * 2) / 20, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, (width * 4) / 5, 0, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, width / 20, height / 2.2, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, 0, (height * 8) / 10, width / 4.8, height / 4.8, r);
    
    // ===== INDIVIDUAL TASK: Select 7 circles for musical note response =====
    // FIX 4: Better distribution - choosing circles that are visible and well-distributed
    // across the canvas (top, middle-left, center, middle-right, bottom areas)
    // These indices were manually selected after analyzing the circle positions
    // to ensure: 1) All are within canvas bounds, 2) Good visual distribution
    let noteIndices = [1, 5, 8, 11, 15, 19, 23]; // More evenly distributed across canvas
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
    song = loadSound('assets/audio.MP3');
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
    fft = new p5.FFT(0.85, 1024);
    song.connect(fft);
    
    // OPTIMIZATION 12: Add amplitude analyser for overall music response
    // This creates a "global pulse" effect based on overall volume
    // Covered in Week 11 lecture examples.
    amplitude = new p5.Amplitude();
    amplitude.setInput(song);
    
    // FIX 3: Create larger Play/Pause button with better positioning
    button = createButton('Play/Pause');
    button.style('font-size', '18px');
    button.style('padding', '12px 30px');
    button.style('background-color', '#8B4513');
    button.style('color', 'white');
    button.style('border', 'none');
    button.style('border-radius', '8px');
    button.style('cursor', 'pointer');
    button.style('font-weight', 'bold');
    
    // Position using windowWidth to ensure it stays centered even when canvas changes size
    button.position((windowWidth - 150) / 2, height - 60);
    button.mousePressed(togglePlay);
    
    // Add hover effect using mouseOver and mouseOut events
    // This provides better user feedback
    
    
    // ===== Generate layout with note-reactive circles =====
    createFixedLayout();
}

// =====================================================================
// ======================= DRAW (Optimized for Better Animation) ========
// =====================================================================
function draw() {
    background(globalBgColor); 

    // 1. Background Texture
    drawBackgroundDots();

    // 2. Connection Layer (Songlines)
    drawNetworkLines();
    
    // ===== INDIVIDUAL TASK: Audio-reactive Animation =====
    // FIX 1: Only process audio and animate when song is actually playing
    if (song.isPlaying()) {
        
        // OPTIMIZATION 14: Improved frequency analysis with better Hz-to-index conversion
        // Get frequency spectrum data (array of amplitude values per frequency bin)
        let spectrum = fft.analyze();
        
        // The Nyquist frequency is half the sample rate (44100/2 = 22050 Hz)
        // This is the maximum frequency the FFT can detect.
        // Reference: https://en.wikipedia.org/wiki/Nyquist_frequency
        let nyquist = 22050;
        
        // OPTIMIZATION 15: More accurate frequency-to-index mapping
        // Instead of simple linear mapping, we calculate the exact bin size
        let binSize = nyquist / spectrum.length;
        
        // Process each note circle
        for (let c of noteCircles) {
            let bandLow = c.noteFreq.low;
            let bandHigh = c.noteFreq.high;
            
            // Convert Hz to spectrum array indices using bin size
            let idxLow = floor(bandLow / binSize);
            let idxHigh = floor(bandHigh / binSize);
            
            // Clamp indices to valid range
            idxLow = constrain(idxLow, 0, spectrum.length - 1);
            idxHigh = constrain(idxHigh, 0, spectrum.length - 1);
            
            // OPTIMIZATION 16: Use average energy instead of max for smoother response
            // Averaging provides more stable detection than picking the max value,
            // reducing jittery movements. This technique comes from audio analysis best practices.
            // Reference: "Audio Programming" concepts from digital signal processing
            let totalEnergy = 0;
            let count = 0;
            for (let i = idxLow; i <= idxHigh; i++) {
                totalEnergy += spectrum[i];
                count++;
            }
            let avgEnergy = count > 0 ? totalEnergy / count : 0;
            
            // FIX 2: Adjusted scale range to accommodate smaller base size
            // Since circles are now half the original size (r = width/16 instead of width/8),
            // we can use a more dramatic scale factor (up to 2.5x) without overcrowding
            // Map average energy (0-255) to scale factor (1.0 to 2.5)
            c.targetScale = map(avgEnergy, 0, 255, 1.0, 2.5, true);
            
            // OPTIMIZATION 18: Add color intensity based on energy
            // Higher energy = more glow, creating a multi-dimensional response
            c.targetColorIntensity = map(avgEnergy, 0, 255, 0, 1, true);
            
            // OPTIMIZATION 19: Add subtle rotation based on energy
            // Creates a dynamic "breathing" rotation effect. The rotation increases
            // with higher note energy, adding another layer of visual interest.
            // Rotation angle is proportional to the note's energy level.
            let rotationAmount = map(avgEnergy, 0, 255, 0, 0.15, true);
            c.targetRotation += rotationAmount;
        }
        
    } else {
        // FIX 1: When not playing, reset all animation values to defaults
        // This prevents any animation when music is paused/stopped
        if (noteCircles) {
            for (let c of noteCircles) {
                c.targetScale = 1.0;
                c.targetColorIntensity = 0;
                c.targetRotation = c.rotation; // Hold current rotation
            }
        }
    }
    
    // OPTIMIZATION 21: Update all animation properties with smooth interpolation
    // This must happen every frame regardless of whether audio is playing
    // to ensure smooth transitions when starting/stopping
    for (let c of circles) {
        c.updateScale();
    }

    // 3. Main Circle Layer - draw all circles
    for (let c of circles) {
        c.display();
    }
}

// ===== INDIVIDUAL TASK: Play/Pause Button Handler =====
function togglePlay() {
    if (song.isPlaying()) {
        song.pause();
    } else {
        song.loop(); // Loop the song for continuous visualization
    }
}