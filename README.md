# Individual Prototype for Major Assignment of IDEA9103

## 1. Project Overview

This artwork is built on our group’s shared **Space odyssey 1001** base code.  

On top of this shared foundation, I designed a special **artistic music player** inspired by Steve Roach’s album **_Dreamtime Return_**:

- All circles still use the group’s layered pattern system (outer / middle / inner rings).  
- **Seven circles** are assigned as musical-note circles corresponding to C–D–E–F–G–A–B frequency bands.  
- When music plays, these seven circles **pulse, rotate, and emit colored glows**, allowing the viewer to “see” the movement of sound.

_Dreamtime Return_ (1988) is considered one of the landmark works of ambient electronic music. Steve Roach was inspired by the Australian desert, Aboriginal Dreamtime philosophy, and field experiences walking through the outback.  
The album combines synthesizers, tribal percussion, and didgeridoo-like textures to create a vast, ritualistic soundscape.

---

![Dreamtime Return Album Cover](/assets/album%20cover.jpg)
*Album cover that inspired this project*

---

## How to Interact with the Artwork

Click the **Play** button and wait for the music to start.  
Use **Prev** and **Next** to switch between tracks.

---

## Individual Animation Approach

### Animation Driver: **Audio Analysis**

Unlike other group members' approaches, my animation is driven entirely by **real-time audio frequency analysis**. The artwork responds to the actual musical content of Steve Roach's *Dreamtime Return* album.

### Key Differences from Group Members' Work:

| Approach | Description | Key Feature |
|----------|-------------|-------------|
| **Audio-driven (Mine)** | Circles react to specific musical note frequencies in real-time | Seven designated circles respond to notes C-G-A-B with color-coded glows |
| **User Interaction** | Clicking creates/animates circles based on user input | Users can click blank areas to create new circles and click existing circles to trigger breathing animations |
| **Time-based Animation** | Progressive reveal animation on page load | Circles appear gradually from innermost to outermost ring after refresh |
| **Perlin Noise** | Organic, fluid movement patterns | Circles orbit around each other with stars floating; positions and colors randomize on refresh |



---

## Inspiration and Creative Vision

### Primary Inspirations

1. **Vintage Vinyl Record Players**
   ![Music Player Interface](/assets/music%20player.PNG)
   *A QQ Music player interface showing a vintage turntable aesthetic*
   
   The nostalgic aesthetic of analog music playback inspired the earthy color palette and organic circular patterns. The tactile, physical nature of vinyl records influenced the hand-drawn, imperfect quality of the circles.

2. **Steve Roach's "Dreamtime Return" (1988)**
   
   This groundbreaking ambient/electronic album draws from Australian Aboriginal culture and the concept of "Dreamtime" - the indigenous Australian understanding of the world's creation and spiritual realm. The album blends:
   - Atmospheric synthesizers
   - Tribal rhythms and didgeridoo
   - Field recordings from the Australian outback
   - Meditative, trance-inducing soundscapes
   
   The album's fusion of ancient indigenous wisdom with modern electronic music perfectly aligns with visualizing traditional Aboriginal dot painting through contemporary code-based art.

3. **Aboriginal Dot Painting Traditions**
   
   The circular motifs, concentric rings, and connecting lines ("songlines") are direct references to indigenous Australian art, where:
   - Circles represent meeting places, waterholes, or campsites
   - Connecting lines represent paths or relationships between locations
   - Dot patterns tell stories and map ancestral journeys
   
   By making these traditional visual elements responsive to Roach's music (which itself honors Aboriginal culture), the artwork creates a bridge between indigenous artistic traditions and digital generative art.

### Conceptual Goal

I envisioned creating a **"synesthetic music player"** - a way to not just hear but *see* the music. Each circle becomes a visual instrument, translating specific frequency ranges into animated visual poetry. The rainbow spectrum of colors for each note (C=red through B=purple) provides an intuitive way to understand the harmonic structure of the music.

---

## Technical Implementation

### Audio Processing Architecture

The animation system uses **p5.sound's FFT (Fast Fourier Transform)** to analyze audio in real-time:

```javascript
// Initialize FFT analyzer with smoothing and resolution
fft = new p5.FFT(0.9, 1024);

// In draw loop: Analyze frequency spectrum
let spectrum = fft.analyze();
```

### Frequency-to-Circle Mapping

Seven specific circles are designated as "note circles," each mapped to a musical note frequency range:

```javascript
const noteFrequencies = {
    'C': { low: 246, high: 277, center: 261.63 },  // C4
    'D': { low: 277, high: 311, center: 293.66 },  // D4
    'E': { low: 311, high: 349, center: 329.63 },  // E4
    'F': { low: 349, high: 392, center: 369.99 },  // F4
    'G': { low: 370, high: 415, center: 392.00 },  // G4
    'A': { low: 415, high: 466, center: 440.00 },  // A4
    'B': { low: 466, high: 523, center: 493.88 }   // B4
};
```

**Note:** These frequency ranges are based on standard musical pitch frequencies for the fourth octave (C4-B4). See [Piano Key Frequencies - Wikipedia](https://en.wikipedia.org/wiki/Piano_key_frequencies)

### Color Coding System

Each musical note is assigned a unique color from the rainbow spectrum:

```javascript
const noteColors = {
    'C': { r: 255, g: 50,  b: 50  },  // Red
    'D': { r: 255, g: 140, b: 0   },  // Orange
    'E': { r: 255, g: 220, b: 0   },  // Yellow
    'F': { r: 50,  g: 255, b: 100 },  // Green
    'G': { r: 0,   g: 200, b: 255 },  // Cyan
    'A': { r: 80,  g: 80,  b: 255 },  // Blue
    'B': { r: 200, g: 50,  b: 255 }   // Purple
};
```

This creates an intuitive visual-audio synesthesia where lower notes (C) glow red and higher notes (B) glow purple.

### Real-time Animation Response

On every frame, the code:

1. **Analyzes the frequency spectrum** of the current audio
2. **Calculates energy levels** for each note's frequency band
3. **Triggers visual responses** when energy exceeds threshold (50):

```javascript
// For each note circle
if (avgEnergy > 50) {
    c.isActive = true;
    
    // Map energy to visual parameters
    c.targetScale = map(avgEnergy, 50, 255, 1.0, 1.8, true);        // Scale up
    c.targetColorIntensity = map(avgEnergy, 50, 255, 0, 0.8, true); // Glow intensity
    let rotationAmount = map(avgEnergy, 50, 255, 0, 0.08, true);    // Rotation speed
    c.targetRotation += rotationAmount;
}
```

**Key animation properties:**
- **Scale:** Circles grow 1.0x to 1.8x based on audio energy
- **Glow effect:** Multi-layered radial gradient with note-specific color
- **Rotation:** Continuous rotation accumulates over time
- **Color shifts:** Active circles randomly select new colors from palette

### Smooth Interpolation

To avoid jarring visual jumps, all animations use **linear interpolation (lerp)** for smooth transitions:

```javascript
updateScale() {
    this.currentScale = lerp(this.currentScale, this.targetScale, 0.12);
    this.colorIntensity = lerp(this.colorIntensity, this.targetColorIntensity, 0.15);
    this.rotation = lerp(this.rotation, this.targetRotation, 0.05);
}
```

This creates fluid, organic motion that feels natural rather than mechanical.

---

## Advanced Techniques Used

### 1. Organic Shape Generation with `beginShape()` and `curveVertex()`

Unlike basic geometric primitives, this artwork uses **Bézier curve-based shapes** for hand-drawn aesthetics:

```javascript
drawHandDrawnCircle(r, fillCol, strokeCol, strokeW) {
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
```

**Why use this?** Creates imperfect, organic circles that mimic traditional hand-painted Aboriginal art rather than computer-perfect circles.

**Source:** p5.js reference documentation:
- [`beginShape()`](https://p5js.org/reference/p5/beginShape/)
- [`curveVertex()`](https://p5js.org/reference/p5/curveVertex/)

### 2. Multi-layered Glow Effects

The glow effect uses **multiple concentric ellipses with decreasing opacity** to simulate light bloom:

```javascript
drawGlowEffect(intensity) {
    for (let i = 8; i > 0; i--) {
        let glowSize = this.r * (1.15 + i * 0.12);
        let alpha = (intensity * 80) / i;
        fill(glowR, glowG, glowB, alpha);
        ellipse(0, 0, glowSize, glowSize);
    }
}
```

**Why use this?** Creates realistic light diffusion effect, making active circles appear to emit light. Inspired by photography lens flares and digital bloom effects.

### 3. FFT Frequency Band Analysis

Custom frequency band analysis to isolate specific musical notes:

```javascript
// Calculate FFT bin indices for frequency range
let binSize = 22050 / spectrum.length;  // Nyquist frequency / resolution
let idxLow = floor(bandLow / binSize);
let idxHigh = floor(bandHigh / binSize);

// Sum energy in frequency band
let totalEnergy = 0;
for (let i = idxLow; i <= idxHigh; i++) {
    totalEnergy += spectrum[i];
}
let avgEnergy = totalEnergy / count;
```

**Why use this?** Allows precise targeting of specific musical notes rather than responding to all frequencies equally. This technique is borrowed from audio visualization software like Audacity and professional music production tools.

**Source:** Digital Signal Processing fundamentals + p5.sound FFT documentation

### 4. Responsive Canvas System

The artwork adapts to any screen size:

```javascript
function windowResized() {
    let size = min(windowWidth, windowHeight);
    resizeCanvas(size, size);
    repositionButtons();
}
```

**Why use this?** Ensures the artwork maintains square aspect ratio and proper button positioning on any device, from mobile phones to large displays.

---

## Code Structure and Comments

The code is organized into clearly commented sections:

1. **Global Variables** - All shared state and audio/visual parameters
2. **Layout & Background** - Composition generation and texture rendering  
3. **Circle Class** - OOP encapsulation of circle drawing and animation logic
4. **Audio System** - Song loading, FFT analysis, and frequency mapping
5. **Player Controls** - UI for music playback control
6. **Main Loop** - Real-time audio analysis and visual updates

### Key Modifications from Group Code

- **Added:** Complete audio-reactive system with FFT analysis
- **Added:** Seven designated "note circles" with frequency mapping
- **Added:** Rainbow color system for musical notes
- **Added:** Multi-layered glow effects with per-note colors
- **Added:** Music player UI (play/pause, prev/next buttons)
- **Added:** Song information display (album, track number, title)
- **Modified:** Circle class to support audio-reactive animation properties
- **Modified:** Layout to work with smaller circles (room to grow when active)

All external techniques are documented with comments and source links in the code.

---

## Track Listing

The visualizer plays Steve Roach's *Dreamtime Return* (1988):

1. Towards the Dream
2. The Continent
3. Songline
4. Aitribe Meets the Dream Ghost
5. A Circular Ceremony
6. The Other Side
7. Magnificent Gallery
8. Truth In Passing
9. Australian Dawn - The Quiet Earth Cries Inside

---

## References and Resources

### Technical References
- [p5.js Reference](https://p5js.org/reference/)
- [p5.sound FFT Documentation](https://p5js.org/reference/#/p5.FFT)
- [Piano Key Frequencies - Wikipedia](https://en.wikipedia.org/wiki/Piano_key_frequencies)
- [beginShape() Documentation](https://p5js.org/reference/p5/beginShape/)
- [curveVertex() Documentation](https://p5js.org/reference/p5/curveVertex/)

### Cultural References
- Australian Aboriginal Art and Dreamtime concepts
- Indigenous songlines and sacred geography
- Dot painting techniques and symbolism

### Musical Inspiration
- Steve Roach - *Dreamtime Return* (1988)
- Ambient/tribal electronic music aesthetics
- Didgeridoo and indigenous Australian instrumentation

---

## Color Palette

The artwork uses an **Aboriginal-inspired earth tone palette**:

**Background:**
- Deep earth: `rgb(30, 20, 15)`

**Circle Base Colors:**
- Red Ochre: `rgb(90, 40, 20)`
- Deep Earth: `rgb(60, 30, 15)`
- Bush Green: `rgb(40, 45, 35)`
- Burnt Orange: `rgb(110, 60, 30)`
- Charcoal: `rgb(20, 20, 20)`

**Pattern Colors:**
- Ceremony White: `rgb(255, 255, 255)`
- Cream: `rgb(255, 240, 200)`
- Sun Yellow: `rgb(255, 215, 0)`
- Bright Ochre: `rgb(255, 140, 80)`
- Sage: `rgb(160, 180, 140)`
- Ash: `rgb(200, 200, 210)`

**Note Glow Colors (Rainbow Spectrum):**
- C (Red), D (Orange), E (Yellow), F (Green), G (Cyan), A (Blue), B (Purple)

---

## Future Enhancements

Potential additions for future versions:
- Upload custom audio files
- User-adjustable frequency ranges for each circle
- Recording/exporting animations as video
- MIDI input for live instrument control
- Additional Aboriginal art pattern variations
- Particle effects for high-energy audio passages

---

## License & Credits

**Code:** Original work based on group assignment template  
**Music:** Steve Roach - *Dreamtime Return* (1988)  
**Cultural Inspiration:** Australian Aboriginal art traditions  
**Technical Framework:** p5.js and p5.sound libraries  

---

*This project is an artistic homage to indigenous Australian culture and Steve Roach's pioneering ambient music. It represents a fusion of traditional art forms with modern generative techniques, creating a bridge between ancient wisdom and contemporary technology.*
# Individual Prototype for Major Assignment of IDEA9103

## 1. Project Overview

This artwork is built on our group’s shared **Space Odyssey 1001** base code.

On top of this shared foundation, I designed a special **artistic music player** inspired by Steve Roach’s album **_Dreamtime Return_**:

- All circles still use the group’s layered pattern system (outer / middle / inner rings).  
- **Seven circles** are assigned as musical-note circles corresponding to the C–D–E–F–G–A–B frequency bands.  
- When music plays, these seven circles **pulse, rotate, and emit coloured glows**, allowing the viewer to “see” the movement of sound.

_Dreamtime Return_ (1988) is widely regarded as a landmark ambient electronic album. Steve Roach drew inspiration from the Australian desert, Aboriginal Dreamtime concepts, and field experiences walking through the outback. The album combines synthesizers, tribal percussion, and didgeridoo-like textures to create a vast, ritual-like soundscape.

---

![Dreamtime Return Album Cover](/assets/album%20cover.jpg)  
*Album cover that inspired this prototype*

---

## 2. How to Interact

Click the **Play** button and wait for the music to start.  
Use **Prev** and **Next** to switch between tracks.

No additional input is required – once the music is playing, you can sit back and watch how the circles respond.

---

## 3. Mechanism of My Work

My individual prototype modifies the group work by introducing an **audio-driven animation system** using `p5.FFT` and `p5.Amplitude` from the p5.sound library.

- Seven specific circles are designated as **note circles**.  
- Each note circle is mapped to a musical note in the fourth octave (C4–B4), using approximate frequency ranges (e.g. C ≈ 261.63 Hz, A ≈ 440 Hz).  
- During playback of tracks from *Dreamtime Return*, the sketch analyses the current audio spectrum in real time and calculates the energy in each note’s frequency band.  
- The visual behaviour of each note circle (scale, rotation, glow intensity) is then driven by this energy.

This is different from other group members’ mechanisms:

- One version is **interaction-driven**: clicking on empty areas creates new circles; clicking existing circles triggers breathing animations; clicking two different circles connects them and evolves their visual state.
- One version is **time-based**: after refresh, circles appear gradually from the innermost ring to the outermost, creating a temporal unfolding of the composition.
- One version uses **Perlin noise**: circles orbit around each other smoothly and stars float in the background; with each refresh, circle positions and colours change.

In contrast, my version **does not rely on user interaction, time sequences, or noise fields**. Instead, it turns the music itself into the animation engine.

---

## 4. Animation

The animation focuses on the seven note circles. The following properties are animated:

### 4.1 Scale (Breathing Effect)

- Each note circle has a `currentScale` and `targetScale`.  
- When the energy in its frequency band exceeds a threshold, its `targetScale` is set higher (e.g. from 1.0 up to about 1.8).  
- `currentScale` smoothly interpolates towards `targetScale` using `lerp()`, creating a breathing or pulsing effect.

### 4.2 Glow Intensity and Colour

- Each note is assigned a unique colour, following a rainbow mapping:

  - C – Red  
  - D – Orange  
  - E – Yellow  
  - F – Green  
  - G – Cyan  
  - A – Blue  
  - B – Purple  

- When a note circle is active, a custom `drawGlowEffect()` function draws multiple translucent ellipses around it.  
- The glow radius and alpha depend on the note’s energy, so louder notes produce stronger halos.

### 4.3 Rotation

- Each note circle has a `rotation` and a `targetRotation`.  
- The average energy in its frequency band is mapped to a small rotation increment.  
- Over time, this makes active circles gently rotate, as if they were spinning on a turntable.

### 4.4 Pattern Recolouring

- For active note circles, the colours of the outer/middle/inner rings are occasionally re-sampled from the existing palette.  
- This creates subtle shifts in the internal patterns during strong musical moments.

### 4.5 Static Elements

- Non-note circles remain static and keep the original group composition.  
- Background dots and Songline-like connecting lines are also static, acting as a calm backdrop for the animated note circles.

---

## 5. Originality

While all group members share the same base composition (concentric circles, connecting lines, dot patterns), this prototype is unique in several ways:

- It functions as an **audio-reactive music visualiser** specifically for the album *Dreamtime Return*.  
- The animation is tightly linked to **specific pitch ranges** rather than generic volume or time.  
- The coloured halos and gentle rotation give the impression of a **breathing vinyl record** mapped into an Aboriginal-inspired abstract landscape.  
- Conceptually, it aims to create a **“synesthetic music player”** – allowing viewers to see pitch and energy as light, scale and motion.

Compared with:

- **Interaction-driven version** – focuses on user agency and playful manipulation of circles and connections.  
- **Time-based version** – focuses on the temporal reveal of the composition layer by layer.  
- **Perlin-noise version** – focuses on fluid, galaxy-like orbital motion and star-field dynamics.

My version instead centres on **sound–image mapping**: the music itself becomes the timeline and the driver of the visuals.

---

## 6. Inspiration and Reference Images

### 6.1 Vintage Music Player UI

![Music Player Interface](/assets/music%20player.PNG)  
*A music player interface with a vintage turntable aesthetic*

The circular layout and soft lighting of modern vinyl-style music players influenced:

- The idea of treating the circle arrangement as a kind of **abstract turntable**.  
- The use of gentle rotation and glowing highlights to convey the feeling of spinning media.  
- The choice to present the album cover and track information as part of the visual experience.

### 6.2 Steve Roach – *Dreamtime Return*

The album itself was a major conceptual guide:

- Long, evolving ambient textures suggested **slow, breathing movement** rather than fast or flashing effects.  
- Rhythmic but non-aggressive percussive elements suggested subtle pulsing rather than hard, strobing visuals.  
- The connection to Aboriginal Dreamtime concepts fits naturally with the group’s Aboriginal dot painting and Songline imagery.

### 6.3 Aboriginal Dot Painting and Songlines

The group base code already references:

- **Concentric circles** as meeting places or waterholes  
- **Lines** as paths or Songlines  
- **Dots** as landscape texture and storytelling elements  

By making only selected circles respond to music, my prototype treats them like **instruments** or **nodes on a sonic map**, reinforcing the idea of a musical journey through a symbolic landscape.

---

## 7. Technical Explanation

### 7.1 Audio Analysis with p5.FFT

```javascript
fft = new p5.FFT(0.9, 1024);
let spectrum = fft.analyze();
```

### 7.2 Frequency Band Mapping

```javascript
const noteFrequencies = {
  C: { low: 246, high: 277, center: 261.63 },
  D: { low: 277, high: 311, center: 293.66 },
  E: { low: 311, high: 349, center: 329.63 },
  F: { low: 349, high: 392, center: 349.23 },
  G: { low: 370, high: 415, center: 392.00 },
  A: { low: 415, high: 466, center: 440.00 },
  B: { low: 466, high: 523, center: 493.88 }
};
```

### 7.3 Glow Effect

```javascript
function drawGlowEffect(baseRadius, color, intensity) {
  for (let i = 8; i > 0; i--) {
    let glowSize = baseRadius * (1.15 + i * 0.12);
    let alpha = (intensity * 80) / i;
    fill(color.r, color.g, color.b, alpha);
    noStroke();
    ellipse(0, 0, glowSize, glowSize);
  }
}
```

### 7.4 Organic Circle Shapes

```javascript
function drawHandDrawnCircle(r, fillCol, strokeCol, strokeW) {
  push();
  fill(fillCol);
  stroke(strokeCol);
  strokeWeight(strokeW);
  beginShape();
  let points = 50;
  for (let i = 0; i <= points; i++) {
    let angle = (TWO_PI / points) * i;
    let jitter = random(-r * 0.01, r * 0.01);
    let radius = r + jitter;
    curveVertex(cos(angle) * radius, sin(angle) * radius);
  }
  endShape(CLOSE);
  pop();
}
```

### 7.5 External Techniques Used

- p5.sound FFT & Amplitude (official documentation)  
- Standard piano frequency tables (Wikipedia)  

---

## 8. References

**Technical**
- p5.js Reference — https://p5js.org/reference/  
- p5.sound FFT — https://p5js.


**Musical**
- Steve Roach – Dreamtime Return (Fortuna Records, 1988)



*This prototype is intended as an artistic homage that connects ambient electronic music, Aboriginal-inspired visual language and contemporary generative coding practice in p5.js.*