# Individual Prototype for Major Assignment of IDEA9103

## 1. Project Overview

This artwork is built on our group’s shared **Space odyssey 1001** base code.  

Inspired by the vinyl-style UI of modern music apps, I designed a unique artistic music player specifically for Steve Roach’s *Dreamtime Return*. When the music plays, the circular “vinyl record” comes to life—rotating, glowing, and shifting subtly—allowing viewers to *"see"* the movement and energy of the sound. (Technical details are explained later in the Mechanism section.)


_Dreamtime Return_ (1988) is considered one of the landmark works of ambient electronic music. Steve Roach was inspired by the Australian desert, Aboriginal Dreamtime philosophy, and field experiences walking through the outback.  
The album combines synthesizers, tribal percussion, and didgeridoo-like textures to create a vast, ritualistic soundscape.

---



## 2. How to Interact with the Artwork

Click the **Play** button and wait for the music to start.  
Use **Prev** and **Next** to switch between tracks.

No additional input is required - once the music is playing, you can sit back and watch how the circles respond.

---

## 3. Machanism of My Work

My individual prototype modifies the group work by introducing an **audio-driven animation system** using `p5.FFT` and `p5.Amplitude` from the p5.sound library.

- Seven specific circles are designated as **note circles**.  
- Each note circle is mapped to a musical note in the fourth octave (C4–B4), using approximate frequency ranges (e.g. C ≈ 261.63 Hz, A ≈ 440 Hz).  
- During playback of tracks from *Dreamtime Return*, the sketch analyses the current audio spectrum in real time and calculates the energy in each note’s frequency band.  
- The visual behaviour of each note circle (scale, rotation, glow intensity) is then driven by this energy.

This is different from other group members’ mechanisms:

- One version is **interaction**: clicking on empty areas creates new circles; clicking existing circles triggers breathing animations; clicking two different circles connects them and evolves their visual state.
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


*This prototype is intended as an artistic homage that connects ambient electronic music, Aboriginal-inspired visual language and contemporary generative coding practice in p5.js.*

