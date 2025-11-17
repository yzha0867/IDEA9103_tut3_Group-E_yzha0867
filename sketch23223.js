// ===== 调试工具：显示所有圆圈的索引 =====
// 这个文件帮助你找出哪些圆圈在画布范围内
// 使用方法：
// 1. 将这个文件作为 sketch.js 运行
// 2. 观察每个圆圈上显示的数字（索引）
// 3. 记录下在画布可见范围内的圆圈索引
// 4. 在正式版本中使用这些索引

let globalBgColor;
let circleBasePalette;
let patternPalette;
let circles;
let connectedNodes;

// 调试模式开关
let DEBUG_MODE = true;

function windowResized() {
    let size = min(windowWidth, windowHeight);
    resizeCanvas(size, size);
}

function createFixedLayout() {
    circles = [];
    connectedNodes = []; 
  
    let r = width / 10;

    addCirclesOnLine(5, width / 7.1, height / 7.1, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, width / 2, (height * 2) / 20, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, (width * 4) / 5, 0, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, width / 20, height / 2.2, width / 4.8, height / 4.8, r);
    addCirclesOnLine(5, 0, (height * 8) / 10, width / 4.8, height / 4.8, r);
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

function drawBackgroundDots() {
    push();
    noStroke();
    let density = 0.004;
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

class Circle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.outerPatternType = floor(random(4));
        this.middlePatternType = floor(random(4));
        this.innerPatternType = floor(random(2));
        this.irregularity = 0.02;
    }

    display() {
        push();
        translate(this.x, this.y);
        this.drawHandDrawnCircle(this.r * 1.05, globalBgColor, null, 0);
        this.displayOuterPattern();
        this.displayMiddlePattern();
        this.displayInnerPattern();
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

    createFixedLayout();
}

function draw() {
    background(globalBgColor);
    drawBackgroundDots();
    drawNetworkLines();

    // 绘制所有圆圈
    for (let c of circles) {
        c.display();
    }

    // ===== 调试模式：显示索引和边界检查 =====
    if (DEBUG_MODE) {
        textAlign(CENTER, CENTER);
        textSize(16);
        
        for (let i = 0; i < circles.length; i++) {
            let c = circles[i];
            
            // 检查圆圈是否完全在画布内
            let margin = c.r * 1.5; // 给一些边距
            let isInBounds = 
                c.x - margin > 0 && 
                c.x + margin < width && 
                c.y - margin > 0 && 
                c.y + margin < height;
            
            // 根据是否在边界内设置不同颜色
            if (isInBounds) {
                fill(0, 255, 0); // 绿色 = 安全（在边界内）
                stroke(0, 255, 0);
            } else {
                fill(255, 0, 0); // 红色 = 危险（可能溢出）
                stroke(255, 0, 0);
            }
            
            strokeWeight(2);
            
            // 显示索引号
            text(i, c.x, c.y);
            
            // 在圆圈周围画一个框表示边界
            noFill();
            if (isInBounds) {
                stroke(0, 255, 0, 100);
            } else {
                stroke(255, 0, 0, 100);
            }
            strokeWeight(1);
            rect(c.x - margin, c.y - margin, margin * 2, margin * 2);
        }
        
        // 显示说明文字
        fill(255);
        noStroke();
        textAlign(LEFT, TOP);
        textSize(14);
        text("绿色索引 = 在画布内（安全）", 10, 10);
        text("红色索引 = 可能溢出（避免选择）", 10, 30);
        text("画布边界：", 10, 50);
        stroke(255, 255, 0);
        strokeWeight(2);
        noFill();
        rect(5, 5, width - 10, height - 10);
    }
}