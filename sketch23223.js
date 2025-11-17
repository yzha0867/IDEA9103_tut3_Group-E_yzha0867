// =======================================================================
// ======================== Global Variables =============================
// =======================================================================

let globalBgColor;       
let circleBasePalette;   
let patternPalette;      
let circles;             
let connectedNodes;      
let backgroundDots;      

// =================== AUDIO VARIABLES ===================
let songs = [];              
let currentSongIndex = 0;   
let fft;                    
let amplitude;              
let playPauseButton;
let prevButton;
let nextButton;
let noteCircles;            

// Song List
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
];

// Album information
const ALBUM_NAME = 'Dreamtime Return';

// Musical note frequencies
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
    'C': { r: 255, g: 50,  b: 50  },  // 🔴 Red
    'D': { r: 255, g: 140, b: 0   },  // 🟠 Orange
    'E': { r: 255, g: 220, b: 0   },  // 🟡 Yellow
    'F': { r: 50,  g: 255, b: 100 },  // 🟢 Green
    'G': { r: 0,   g: 200, b: 255 },  // 🔵 Cyan
    'A': { r: 80,  g: 80,  b: 255 },  // 🔷 Blue
    'B': { r: 200, g: 50,  b: 255 }   // 🟣 Purple
};

// =========================================================================
// ======================= Layout & Background =============================
// =========================================================================

function windowResized() {
    let size = min(windowWidth, windowHeight);
    resizeCanvas(size, size);
    repositionButtons();
    generateBackgroundDots();
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

    addCirclesOnLine(5, width / 7.1, height / 7.1, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, width / 2, (height * 2) / 20, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, (width * 4) / 5, 0, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, width / 20, height / 2.2, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, 0, (height * 8) / 10, width / 4.8, height / 4.8, r);
    
    let noteIndices = [15, 16, 2, 3, 6, 21, 4]; //
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
            let d = dist(c1.x, c1.y, c2.x, c2.y);
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

class Circle {
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

        this.irregularity = 0.02;
        
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

    displayOuterPattern() {
        let baseColor, patCol;
        
        if (this.isNoteCircle && this.isActive) {
            baseColor = random(circleBasePalette);
            patCol = random(patternPalette);
        } else {
            baseColor = this.outerBaseColor;
            patCol = this.outerPatternColor;
        }
        
        //  Use colored stroke for active note circles
        let strokeColor = color(0, 50);  // Default dark stroke
        let strokeW = 2;
        
        if (this.isNoteCircle && this.isActive && this.glowColor) {
            // Use the note's glow color for the stroke, with higher intensity
            strokeColor = this.glowColor;
            strokeW = map(this.colorIntensity, 0, 1, 2, 6);  // Thicker stroke when active
        }
        
        this.drawHandDrawnCircle(this.r, baseColor, strokeColor, strokeW);
        
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
        this.drawHandDrawnCircle(this.r * 0.3, col, null, 0);
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
// ======================= PRELOAD =====================================
// =====================================================================
function preload() {
    if (SONG_LIST.length > 0) {
        for (let i = 0; i < SONG_LIST.length; i++){
           songs.push(loadSound('assets/' + SONG_LIST[i]));
        }
    }
}

// =====================================================================
// ======================= SETUP =======================================
// =====================================================================
function setup() {
    let size = min(windowWidth, windowHeight);
    createCanvas(size, size);

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
// ======================= DRAW ========================================
// =====================================================================
function draw() {
    background(globalBgColor); 
    drawBackgroundDots();
    drawNetworkLines();
    
    if (songs.length > 0) {
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

