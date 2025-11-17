## 6. Technical Explanation

### 6.1 Audio Analysis with p5.FFT

```javascript
fft = new p5.FFT(0.9, 1024);
let spectrum = fft.analyze();
```

### 6.2 Frequency Band Mapping

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

### 6.3 Glow Effect

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

### 6.4 Organic Circle Shapes

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

### 6.5 External Techniques Used

The following techniques were not taught in the lecture/tutorial and come from external references or original experimentation:

- **Note‑frequency mapping (C–B ranges)**  
  Derived from external music theory resources and Wikipedia’s piano frequency tables.  
  *Used so that each visual element corresponds to a meaningful musical pitch range, making the animation musically grounded.*

- **Multi‑layer glow effect (`drawGlowEffect`)**  
  The glow rendering technique was developed with guidance from ChatGPT.  
  The assistant explained how to simulate a soft radial glow by:
    - Drawing multiple semi‑transparent ellipses of increasing radius  
    - Reducing alpha per layer to create a smooth falloff  
    - Introducing slight colour shifts for depth  
    - Placing a bright “core” layer at the centre  
  *Used to make the “note circles” feel luminous and alive, matching the dream‑like quality of the music.*

- **Hand‑drawn / sketch‑style circles (`beginShape()` + `curveVertex()`)**  
  Adapted from p5.js reference examples to create organic, uneven outlines.  
  *Used to avoid perfect digital geometry and better match the natural, human‑made aesthetic of Aboriginal‑inspired patterns.*
- **Multi-layer concentric pattern system**  
  Built upon the group’s custom base code.

---


## 7. References and Resources

### Technical References
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
