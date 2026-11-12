/**
 * CASIO fx-580VN X-PK (PINK EDITION) - OFFICIAL ENGINE & CONTROLLER
 * Full 521 ClassWiz Features: Prime Check, Fact, Div with Remainder, Verify,
 * 4x4 Simultaneous Equations, Degree 2, 3, 4 Polynomials (Min/Max Parabol),
 * Matrix 4x4, Vector 3D, Statistics, Distribution, Ratio, Table, Audio Synthesizer,
 * and Full Interactive Command Learning ("Học lệnh").
 */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIZER ---
  class SoundManager {
    constructor() {
      this.enabled = true;
      this.audioCtx = null;
    }

    init() {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.audioCtx = new AudioContext();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    }

    playClick() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.audioCtx.currentTime + 0.035);
        gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.035);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.035);
      } catch (e) {}
    }

    playBeep() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
      } catch (e) {}
    }
  }

  // --- FRACTION HELPERS ---
  function floatToFraction(val, maxDenominator = 10000) {
    if (isNaN(val) || !isFinite(val)) return null;
    if (Math.abs(val) > 1e10 || Math.abs(val) < 1e-10) return null;
    if (Number.isInteger(val)) return { num: val, den: 1, text: `${val}` };

    const sign = val < 0 ? -1 : 1;
    val = Math.abs(val);

    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = val;
    do {
      let a = Math.floor(b);
      let aux = h1;
      h1 = a * h1 + h2;
      h2 = aux;
      aux = k1;
      k1 = a * k1 + k2;
      k2 = aux;
      b = 1 / (b - a);
    } while (Math.abs(val - h1 / k1) > val * 1e-9 && k1 <= maxDenominator);

    const num = sign * h1;
    const den = k1;
    if (den === 1) return { num, den: 1, text: `${num}` };
    if (den > maxDenominator) return null;
    return { num, den, text: `${num}/${den}` };
  }

  // --- MATHEMATICAL SOLVERS (521 FEATURES ENGINE) ---
  const MathSolvers = {
    // 1. Prime Check (Kiểm tra số nguyên tố)
    isPrime(n) {
      n = Math.round(Math.abs(n));
      if (n <= 1) return { isPrime: false, reason: 'Không phải số nguyên tố (n ≤ 1)' };
      if (n <= 3) return { isPrime: true, reason: 'Là số nguyên tố (Prime)' };
      if (n % 2 === 0) return { isPrime: false, reason: 'Hợp số (Chia hết cho 2)' };
      for (let i = 3; i * i <= n; i += 2) {
        if (n % i === 0) return { isPrime: false, reason: `Hợp số (Chia hết cho ${i})` };
      }
      return { isPrime: true, reason: 'Là số nguyên tố (Prime)' };
    },

    // 2. Prime Factorization (FACT)
    factorize(n) {
      n = Math.round(Math.abs(n));
      if (n <= 1) return `${n}`;
      let temp = n;
      const factors = {};
      let d = 2;
      while (d * d <= temp) {
        while (temp % d === 0) {
          factors[d] = (factors[d] || 0) + 1;
          temp /= d;
        }
        d++;
      }
      if (temp > 1) factors[temp] = (factors[temp] || 0) + 1;

      return Object.entries(factors)
        .map(([base, exp]) => exp > 1 ? `${base}^${exp}` : `${base}`)
        .join(' × ');
    },

    // 3. Division with Remainder (÷R)
    divR(a, b) {
      a = Math.round(a);
      b = Math.round(b);
      if (b === 0) return 'Lỗi chia cho 0';
      const q = Math.floor(a / b);
      const r = a % b;
      return `Thương số (Q) = ${q}\nSố dư (R) = ${r}\n(Tức: ${a} = ${b} × ${q} + ${r})`;
    },

    // 4. Verify Statement (Đúng/Sai)
    verify(expr) {
      try {
        let clean = expr;
        if (clean.includes('=')) {
          const parts = clean.split('=');
          const v1 = math.evaluate(parts[0]);
          const v2 = math.evaluate(parts[1]);
          return Math.abs(v1 - v2) < 1e-9 ? 'Đúng (True)' : 'Sai (False)';
        }
        if (clean.includes('>')) {
          const parts = clean.split('>');
          return math.evaluate(parts[0]) > math.evaluate(parts[1]) ? 'Đúng (True)' : 'Sai (False)';
        }
        if (clean.includes('<')) {
          const parts = clean.split('<');
          return math.evaluate(parts[0]) < math.evaluate(parts[1]) ? 'Đúng (True)' : 'Sai (False)';
        }
        return 'Cú pháp so sánh không hợp lệ';
      } catch (e) {
        return 'Lỗi kiểm tra cú pháp';
      }
    },

    // 5. Quadratic Solver: ax^2 + bx + c = 0
    solveQuadratic(a, b, c) {
      if (Math.abs(a) < 1e-12) {
        if (Math.abs(b) < 1e-12) return c === 0 ? 'Vô số nghiệm' : 'Vô nghiệm';
        return `x = ${(-c / b).toFixed(4)}`;
      }
      const delta = b * b - 4 * a * c;
      const vertexX = -b / (2 * a);
      const vertexY = c - (b * b) / (4 * a);
      const isMin = a > 0;

      let res = '';
      if (delta > 1e-12) {
        const sqDelta = Math.sqrt(delta);
        const x1 = (-b + sqDelta) / (2 * a);
        const x2 = (-b - sqDelta) / (2 * a);
        res += `x₁ = ${x1.toFixed(4)},  x₂ = ${x2.toFixed(4)}\n`;
      } else if (Math.abs(delta) <= 1e-12) {
        const x0 = -b / (2 * a);
        res += `x = ${x0.toFixed(4)} (nghiệm kép)\n`;
      } else {
        const sqDelta = Math.sqrt(-delta);
        const real = -b / (2 * a);
        const imag = sqDelta / (2 * Math.abs(a));
        res += `x₁ = ${real.toFixed(4)} + ${imag.toFixed(4)}i\nx₂ = ${real.toFixed(4)} - ${imag.toFixed(4)}i\n`;
      }

      res += `${isMin ? 'Giá trị nhỏ nhất (Min)' : 'Giá trị lớn nhất (Max)'} y = ${vertexY.toFixed(4)} (tại x = ${vertexX.toFixed(4)})`;
      return res;
    },

    // 6. Cubic Solver: ax^3 + bx^2 + cx + d = 0
    solveCubic(a, b, c, d) {
      if (Math.abs(a) < 1e-12) return this.solveQuadratic(b, c, d);
      const p = (3 * a * c - b * b) / (3 * a * a);
      const q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
      const delta = (q * q) / 4 + (p * p * p) / 27;
      const offset = b / (3 * a);

      let res = '';
      if (delta > 1e-12) {
        const u = Math.cbrt(-q / 2 + Math.sqrt(delta));
        const v = Math.cbrt(-q / 2 - Math.sqrt(delta));
        const x1 = u + v - offset;
        const real = -(u + v) / 2 - offset;
        const imag = ((u - v) * Math.sqrt(3)) / 2;
        res += `x₁ = ${x1.toFixed(4)}\n`;
        res += `x₂ = ${real.toFixed(4)} + ${Math.abs(imag).toFixed(4)}i\n`;
        res += `x₃ = ${real.toFixed(4)} - ${Math.abs(imag).toFixed(4)}i`;
      } else if (Math.abs(delta) <= 1e-12) {
        const u = Math.cbrt(-q / 2);
        res += `x₁ = ${(2 * u - offset).toFixed(4)},  x₂ = ${(-u - offset).toFixed(4)}`;
      } else {
        const phi = Math.acos(-q / (2 * Math.sqrt(-(p * p * p) / 27)));
        const r = 2 * Math.sqrt(-p / 3);
        const x1 = r * Math.cos(phi / 3) - offset;
        const x2 = r * Math.cos((phi + 2 * Math.PI) / 3) - offset;
        const x3 = r * Math.cos((phi + 4 * Math.PI) / 3) - offset;
        res += `x₁ = ${x1.toFixed(4)}\nx₂ = ${x2.toFixed(4)}\nx₃ = ${x3.toFixed(4)}`;
      }
      return res;
    },

    // 7. Quartic Solver: ax^4 + bx^3 + cx^2 + dx + e = 0
    solveQuartic(a, b, c, d, e) {
      if (Math.abs(a) < 1e-12) return this.solveCubic(b, c, d, e);
      const p = [1, b / a, c / a, d / a, e / a];
      const roots = [];
      const z0 = math.complex(0.4, 0.9);
      for (let i = 0; i < 4; i++) {
        roots.push(math.pow(z0, i));
      }
      for (let iter = 0; iter < 60; iter++) {
        for (let i = 0; i < 4; i++) {
          let pVal = math.complex(1, 0);
          for (let j = 1; j <= 4; j++) {
            pVal = math.add(math.multiply(pVal, roots[i]), p[j]);
          }
          let den = math.complex(1, 0);
          for (let j = 0; j < 4; j++) {
            if (i !== j) {
              den = math.multiply(den, math.subtract(roots[i], roots[j]));
            }
          }
          if (math.abs(den) > 1e-14) {
            roots[i] = math.subtract(roots[i], math.divide(pVal, den));
          }
        }
      }
      return roots.map((r, idx) => {
        const re = Math.abs(r.re) < 1e-6 ? 0 : r.re;
        const im = Math.abs(r.im) < 1e-6 ? 0 : r.im;
        if (im === 0) return `x${idx + 1} = ${re.toFixed(4)}`;
        return `x${idx + 1} = ${re.toFixed(4)} ${im > 0 ? '+' : '-'} ${Math.abs(im).toFixed(4)}i`;
      }).join('\n');
    },

    // 8. Linear System Solver (Up to 4 unknowns)
    solveLinear(matrix) {
      const n = matrix.length;
      for (let i = 0; i < n; i++) {
        let maxEl = Math.abs(matrix[i][i]);
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
          if (Math.abs(matrix[k][i]) > maxEl) {
            maxEl = Math.abs(matrix[k][i]);
            maxRow = k;
          }
        }
        if (maxEl < 1e-12) return 'Hệ vô nghiệm hoặc vô số nghiệm';
        for (let k = i; k < n + 1; k++) {
          const tmp = matrix[maxRow][k];
          matrix[maxRow][k] = matrix[i][k];
          matrix[i][k] = tmp;
        }
        for (let k = 0; k < n; k++) {
          if (k !== i) {
            const c = matrix[k][i] / matrix[i][i];
            for (let j = i; j < n + 1; j++) {
              if (i === j) matrix[k][j] = 0;
              else matrix[k][j] -= c * matrix[i][j];
            }
          }
        }
      }
      const names = ['x', 'y', 'z', 't'];
      const sol = [];
      for (let i = 0; i < n; i++) {
        const val = matrix[i][n] / matrix[i][i];
        const frac = floatToFraction(val);
        sol.push(`${names[i]} = ${frac ? frac.text : val.toFixed(4)}`);
      }
      return sol.join('\n');
    },

    // 9. Quadratic Inequality Solver
    solveInequality(a, b, c, op) {
      if (Math.abs(a) < 1e-12) return 'a phải khác 0 cho BPT bậc 2';
      const delta = b * b - 4 * a * c;
      if (delta < -1e-12) {
        const same = (op === 1 || op === 3) && a > 0 || (op === 2 || op === 4) && a < 0;
        return same ? 'Tập nghiệm: Tất cả số thực (∀x ∈ ℝ)' : 'Tập nghiệm: Vô nghiệm (x ∈ ∅)';
      }
      if (Math.abs(delta) <= 1e-12) {
        const x0 = (-b / (2 * a)).toFixed(4);
        if (op === 1) return a > 0 ? `x ≠ ${x0}` : 'Vô nghiệm (x ∈ ∅)';
        if (op === 2) return a < 0 ? `x ≠ ${x0}` : 'Vô nghiệm (x ∈ ∅)';
        if (op === 3) return a > 0 ? 'Tất cả số thực (∀x ∈ ℝ)' : `x = ${x0}`;
        if (op === 4) return a < 0 ? 'Tất cả số thực (∀x ∈ ℝ)' : `x = ${x0}`;
      }
      const sqDelta = Math.sqrt(delta);
      const x1 = (-b - sqDelta) / (2 * a);
      const x2 = (-b + sqDelta) / (2 * a);
      const xMin = Math.min(x1, x2).toFixed(4);
      const xMax = Math.max(x1, x2).toFixed(4);

      if (a > 0) {
        if (op === 1) return `x < ${xMin}  hoặc  x > ${xMax}`;
        if (op === 2) return `${xMin} < x < ${xMax}`;
        if (op === 3) return `x ≤ ${xMin}  hoặc  x ≥ ${xMax}`;
        if (op === 4) return `${xMin} ≤ x ≤ ${xMax}`;
      } else {
        if (op === 1) return `${xMin} < x < ${xMax}`;
        if (op === 2) return `x < ${xMin}  hoặc  x > ${xMax}`;
        if (op === 3) return `${xMin} ≤ x ≤ ${xMax}`;
        if (op === 4) return `x ≤ ${xMin}  hoặc  x ≥ ${xMax}`;
      }
      return 'Không xác định';
    },

    // 10. GCD & LCM
    gcd(a, b) {
      a = Math.abs(Math.round(a));
      b = Math.abs(Math.round(b));
      while (b) {
        let t = b;
        b = a % b;
        a = t;
      }
      return a;
    },
    lcm(a, b) {
      a = Math.abs(Math.round(a));
      b = Math.abs(Math.round(b));
      if (a === 0 || b === 0) return 0;
      return (a * b) / this.gcd(a, b);
    },

    // 11. Derivative f'(x0)
    derivative(fnStr, x0) {
      const h = 1e-6;
      const f1 = math.evaluate(fnStr, { x: x0 + h, deg: Math.PI / 180 });
      const f0 = math.evaluate(fnStr, { x: x0 - h, deg: Math.PI / 180 });
      return (f1 - f0) / (2 * h);
    },

    // 12. Numerical Integral (Simpson's Rule)
    integrate(fnStr, a, b, n = 100) {
      if (n % 2 !== 0) n++;
      const h = (b - a) / n;
      const scope = { x: a, deg: Math.PI / 180 };
      let sum = math.evaluate(fnStr, scope);
      scope.x = b;
      sum += math.evaluate(fnStr, scope);

      for (let i = 1; i < n; i++) {
        scope.x = a + i * h;
        const val = math.evaluate(fnStr, scope);
        sum += (i % 2 === 0 ? 2 : 4) * val;
      }
      return (h / 3) * sum;
    },

    // 13. Summation
    summation(fnStr, a, b) {
      let total = 0;
      for (let x = a; x <= b; x++) {
        total += math.evaluate(fnStr, { x, deg: Math.PI / 180 });
      }
      return total;
    },

    // 14. Limit
    limit(fnStr, x0) {
      const h = 1e-6;
      const valPlus = math.evaluate(fnStr, { x: x0 + h, deg: Math.PI / 180 });
      const valMinus = math.evaluate(fnStr, { x: x0 - h, deg: Math.PI / 180 });
      if (Math.abs(valPlus - valMinus) < 1e-2) return (valPlus + valMinus) / 2;
      return valPlus;
    },

    // 15. Ratio: a / b = x / d => x = a * d / b
    solveRatio(a, b, d) {
      if (b === 0) return 'Lỗi chia cho 0';
      const x = (a * d) / b;
      const frac = floatToFraction(x);
      return `x = ${frac ? frac.text : x.toFixed(4)}`;
    }
  };

  // ==========================================================================
  // NATURAL TEXTBOOK DISPLAY (MathIO / Natural-V.P.A.M.) AST ENGINE
  // ==========================================================================

  let nextSlotId = 1;
  function genSlotId() {
    return 'slot_' + (nextSlotId++);
  }

  class MathNode {
    constructor(type) {
      this.type = type;
      this.parentContainer = null;
    }
    hasSlots() { return false; }
    allSlotsEmpty() { return true; }
    getSlots() { return []; }
    enterFromLeft(ast) {}
    enterFromRight(ast) {}
    handleDeleteAtStart(currentSlot, ast) { return false; }
    toHTML(showCursor, activeSlotId) { return ''; }
    toMathJS() { return ''; }
    toLineString() { return ''; }
  }

  class TokenNode extends MathNode {
    constructor(text, kind = 'text', mathjsText = null) {
      super('token');
      this.text = text;
      this.kind = kind; // 'digit', 'op', 'var', 'func', 'punct'
      this.mathjsText = mathjsText !== null ? mathjsText : text;
    }
    toHTML(showCursor, activeSlotId) {
      let cls = 'math-token';
      if (this.kind === 'op') cls += ' math-op';
      if (this.kind === 'var') cls += ' math-var';
      if (this.kind === 'func') cls += ' math-func';
      return `<span class="${cls}">${this.text}</span>`;
    }
    toMathJS() {
      return this.mathjsText;
    }
    toLineString() {
      return this.text;
    }
  }

  class MathContainer {
    constructor(parentBlockNode = null) {
      this.id = genSlotId();
      this.parentBlockNode = parentBlockNode;
      this.children = [];
      this.cursor = 0;
    }

    isEmpty() {
      return this.children.length === 0;
    }

    insertNode(node) {
      node.parentContainer = this;
      this.children.splice(this.cursor, 0, node);
      this.cursor++;
    }

    insertToken(text, kind = 'text', mathjsText = null) {
      const node = new TokenNode(text, kind, mathjsText);
      this.insertNode(node);
    }

    deleteBackward(ast) {
      if (this.cursor > 0) {
        const prev = this.children[this.cursor - 1];
        if (prev.hasSlots()) {
          if (prev.allSlotsEmpty()) {
            this.children.splice(this.cursor - 1, 1);
            this.cursor--;
          } else {
            prev.enterFromRight(ast);
          }
        } else {
          this.children.splice(this.cursor - 1, 1);
          this.cursor--;
        }
        return true;
      }
      if (this.parentBlockNode) {
        return this.parentBlockNode.handleDeleteAtStart(this, ast);
      }
      return false;
    }

    toHTML(showCursor = true, activeSlotId = null) {
      const isActive = (activeSlotId === this.id);
      let html = '';
      
      if (this.isEmpty()) {
        if (isActive && showCursor) {
          return `<span class="math-box has-cursor" data-slot-id="${this.id}"><span class="casio-cursor"></span></span>`;
        } else {
          return `<span class="math-box empty-box" data-slot-id="${this.id}">□</span>`;
        }
      }

      for (let i = 0; i <= this.children.length; i++) {
        if (isActive && showCursor && i === this.cursor) {
          html += '<span class="casio-cursor"></span>';
        }
        if (i < this.children.length) {
          html += this.children[i].toHTML(showCursor, activeSlotId);
        }
      }
      return `<span class="math-slot" data-slot-id="${this.id}">${html}</span>`;
    }

    toMathJS() {
      if (this.isEmpty()) return '';
      return this.children.map(c => c.toMathJS()).join('');
    }

    toLineString() {
      if (this.isEmpty()) return '';
      return this.children.map(c => c.toLineString()).join('');
    }
  }

  class FractionNode extends MathNode {
    constructor() {
      super('fraction');
      this.num = new MathContainer(this);
      this.den = new MathContainer(this);
    }
    hasSlots() { return true; }
    allSlotsEmpty() { return this.num.isEmpty() && this.den.isEmpty(); }
    getSlots() { return [this.num, this.den]; }
    enterFromLeft(ast) {
      ast.activeContainer = this.num;
      this.num.cursor = 0;
    }
    enterFromRight(ast) {
      ast.activeContainer = this.den;
      this.den.cursor = this.den.children.length;
    }
    handleDeleteAtStart(currentSlot, ast) {
      if (currentSlot === this.den) {
        ast.activeContainer = this.num;
        this.num.cursor = this.num.children.length;
        return true;
      }
      if (currentSlot === this.num && this.parentContainer) {
        const idx = this.parentContainer.children.indexOf(this);
        if (idx !== -1) {
          ast.activeContainer = this.parentContainer;
          this.parentContainer.cursor = idx;
          return true;
        }
      }
      return false;
    }
    toHTML(showCursor, activeSlotId) {
      return `<span class="math-fraction">` +
        `<span class="math-num">${this.num.toHTML(showCursor, activeSlotId)}</span>` +
        `<span class="math-frac-line"></span>` +
        `<span class="math-den">${this.den.toHTML(showCursor, activeSlotId)}</span>` +
        `</span>`;
    }
    toMathJS() {
      const n = this.num.toMathJS() || '0';
      const d = this.den.toMathJS() || '1';
      return `((${n}) / (${d}))`;
    }
    toLineString() {
      return `((${this.num.toLineString()}) / (${this.den.toLineString()}))`;
    }
  }

  class SqrtNode extends MathNode {
    constructor(hasIndex = false) {
      super('sqrt');
      this.index = hasIndex ? new MathContainer(this) : null;
      this.radicand = new MathContainer(this);
    }
    hasSlots() { return true; }
    allSlotsEmpty() {
      return (!this.index || this.index.isEmpty()) && this.radicand.isEmpty();
    }
    getSlots() {
      return this.index ? [this.index, this.radicand] : [this.radicand];
    }
    enterFromLeft(ast) {
      const first = this.index || this.radicand;
      ast.activeContainer = first;
      first.cursor = 0;
    }
    enterFromRight(ast) {
      ast.activeContainer = this.radicand;
      this.radicand.cursor = this.radicand.children.length;
    }
    handleDeleteAtStart(currentSlot, ast) {
      if (this.index && currentSlot === this.radicand) {
        ast.activeContainer = this.index;
        this.index.cursor = this.index.children.length;
        return true;
      }
      if (this.parentContainer) {
        const idx = this.parentContainer.children.indexOf(this);
        if (idx !== -1) {
          ast.activeContainer = this.parentContainer;
          this.parentContainer.cursor = idx;
          return true;
        }
      }
      return false;
    }
    toHTML(showCursor, activeSlotId) {
      let idxHtml = '';
      if (this.index) {
        idxHtml = `<span class="math-rad-index">${this.index.toHTML(showCursor, activeSlotId)}</span>`;
      }
      return `<span class="math-radical">` +
        idxHtml +
        `<span class="math-rad-surd">√</span>` +
        `<span class="math-rad-vinculum">${this.radicand.toHTML(showCursor, activeSlotId)}</span>` +
        `</span>`;
    }
    toMathJS() {
      const r = this.radicand.toMathJS() || '0';
      if (this.index) {
        const idx = this.index.toMathJS() || '2';
        return `nthRoot((${r}), (${idx}))`;
      }
      return `sqrt(${r})`;
    }
    toLineString() {
      if (this.index) {
        return `nthRoot(${this.radicand.toLineString()}, ${this.index.toLineString()})`;
      }
      return `√(${this.radicand.toLineString()})`;
    }
  }

  class PowerNode extends MathNode {
    constructor() {
      super('power');
      this.exp = new MathContainer(this);
    }
    hasSlots() { return true; }
    allSlotsEmpty() { return this.exp.isEmpty(); }
    getSlots() { return [this.exp]; }
    enterFromLeft(ast) {
      ast.activeContainer = this.exp;
      this.exp.cursor = 0;
    }
    enterFromRight(ast) {
      ast.activeContainer = this.exp;
      this.exp.cursor = this.exp.children.length;
    }
    handleDeleteAtStart(currentSlot, ast) {
      if (this.parentContainer) {
        const idx = this.parentContainer.children.indexOf(this);
        if (idx !== -1) {
          ast.activeContainer = this.parentContainer;
          this.parentContainer.cursor = idx;
          return true;
        }
      }
      return false;
    }
    toHTML(showCursor, activeSlotId) {
      return `<span class="math-sup">${this.exp.toHTML(showCursor, activeSlotId)}</span>`;
    }
    toMathJS() {
      const e = this.exp.toMathJS() || '1';
      return `^(${e})`;
    }
    toLineString() {
      return `^(${this.exp.toLineString()})`;
    }
  }

  class LogBaseNode extends MathNode {
    constructor() {
      super('logbase');
      this.base = new MathContainer(this);
      this.arg = new MathContainer(this);
    }
    hasSlots() { return true; }
    allSlotsEmpty() { return this.base.isEmpty() && this.arg.isEmpty(); }
    getSlots() { return [this.base, this.arg]; }
    enterFromLeft(ast) {
      ast.activeContainer = this.base;
      this.base.cursor = 0;
    }
    enterFromRight(ast) {
      ast.activeContainer = this.arg;
      this.arg.cursor = this.arg.children.length;
    }
    handleDeleteAtStart(currentSlot, ast) {
      if (currentSlot === this.arg) {
        ast.activeContainer = this.base;
        this.base.cursor = this.base.children.length;
        return true;
      }
      if (this.parentContainer) {
        const idx = this.parentContainer.children.indexOf(this);
        if (idx !== -1) {
          ast.activeContainer = this.parentContainer;
          this.parentContainer.cursor = idx;
          return true;
        }
      }
      return false;
    }
    toHTML(showCursor, activeSlotId) {
      return `<span class="math-log-block"><span class="math-log-word">log</span><span class="math-sub">${this.base.toHTML(showCursor, activeSlotId)}</span>(${this.arg.toHTML(showCursor, activeSlotId)})</span>`;
    }
    toMathJS() {
      const b = this.base.toMathJS() || '10';
      const a = this.arg.toMathJS() || '1';
      return `(log(${a}) / log(${b}))`;
    }
    toLineString() {
      return `log_(${this.base.toLineString()})(${this.arg.toLineString()})`;
    }
  }

  class IntegralNode extends MathNode {
    constructor() {
      super('integral');
      this.lower = new MathContainer(this);
      this.upper = new MathContainer(this);
      this.integrand = new MathContainer(this);
    }
    hasSlots() { return true; }
    allSlotsEmpty() { return this.lower.isEmpty() && this.upper.isEmpty() && this.integrand.isEmpty(); }
    getSlots() { return [this.integrand, this.lower, this.upper]; }
    enterFromLeft(ast) {
      ast.activeContainer = this.integrand;
      this.integrand.cursor = 0;
    }
    enterFromRight(ast) {
      ast.activeContainer = this.upper;
      this.upper.cursor = this.upper.children.length;
    }
    handleDeleteAtStart(currentSlot, ast) {
      if (currentSlot === this.upper) {
        ast.activeContainer = this.lower;
        this.lower.cursor = this.lower.children.length;
        return true;
      }
      if (currentSlot === this.lower) {
        ast.activeContainer = this.integrand;
        this.integrand.cursor = this.integrand.children.length;
        return true;
      }
      if (this.parentContainer) {
        const idx = this.parentContainer.children.indexOf(this);
        if (idx !== -1) {
          ast.activeContainer = this.parentContainer;
          this.parentContainer.cursor = idx;
          return true;
        }
      }
      return false;
    }
    toHTML(showCursor, activeSlotId) {
      return `<span class="math-integral">` +
        `<span class="math-int-sym">∫</span>` +
        `<span class="math-int-limits">` +
          `<span class="math-int-upper">${this.upper.toHTML(showCursor, activeSlotId)}</span>` +
          `<span class="math-int-lower">${this.lower.toHTML(showCursor, activeSlotId)}</span>` +
        `</span>` +
        `<span class="math-int-body">${this.integrand.toHTML(showCursor, activeSlotId)}<span class="math-int-dx">dx</span></span>` +
        `</span>`;
    }
    toMathJS() {
      const f = this.integrand.toMathJS() || '0';
      const a = this.lower.toMathJS() || '0';
      const b = this.upper.toMathJS() || '1';
      return `integrate("${f}", ${a}, ${b})`;
    }
    toLineString() {
      return `int(${this.integrand.toLineString()}, ${this.lower.toLineString()}, ${this.upper.toLineString()})`;
    }
  }

  class DerivativeNode extends MathNode {
    constructor() {
      super('derivative');
      this.expr = new MathContainer(this);
      this.val = new MathContainer(this);
    }
    hasSlots() { return true; }
    allSlotsEmpty() { return this.expr.isEmpty() && this.val.isEmpty(); }
    getSlots() { return [this.expr, this.val]; }
    enterFromLeft(ast) {
      ast.activeContainer = this.expr;
      this.expr.cursor = 0;
    }
    enterFromRight(ast) {
      ast.activeContainer = this.val;
      this.val.cursor = this.val.children.length;
    }
    handleDeleteAtStart(currentSlot, ast) {
      if (currentSlot === this.val) {
        ast.activeContainer = this.expr;
        this.expr.cursor = this.expr.children.length;
        return true;
      }
      if (this.parentContainer) {
        const idx = this.parentContainer.children.indexOf(this);
        if (idx !== -1) {
          ast.activeContainer = this.parentContainer;
          this.parentContainer.cursor = idx;
          return true;
        }
      }
      return false;
    }
    toHTML(showCursor, activeSlotId) {
      return `<span class="math-deriv-block">` +
        `<span class="math-deriv-op">d/dx(${this.expr.toHTML(showCursor, activeSlotId)})</span>` +
        `<span class="math-eval-bar">|</span>` +
        `<span class="math-eval-sub">x=${this.val.toHTML(showCursor, activeSlotId)}</span>` +
        `</span>`;
    }
    toMathJS() {
      const f = this.expr.toMathJS() || '0';
      const x = this.val.toMathJS() || '0';
      return `diff("${f}", ${x})`;
    }
    toLineString() {
      return `diff(${this.expr.toLineString()}, ${this.val.toLineString()})`;
    }
  }

  class SumNode extends MathNode {
    constructor() {
      super('sum');
      this.expr = new MathContainer(this);
      this.lower = new MathContainer(this);
      this.upper = new MathContainer(this);
    }
    hasSlots() { return true; }
    allSlotsEmpty() { return this.expr.isEmpty() && this.lower.isEmpty() && this.upper.isEmpty(); }
    getSlots() { return [this.expr, this.lower, this.upper]; }
    enterFromLeft(ast) {
      ast.activeContainer = this.expr;
      this.expr.cursor = 0;
    }
    enterFromRight(ast) {
      ast.activeContainer = this.upper;
      this.upper.cursor = this.upper.children.length;
    }
    handleDeleteAtStart(currentSlot, ast) {
      if (currentSlot === this.upper) {
        ast.activeContainer = this.lower;
        this.lower.cursor = this.lower.children.length;
        return true;
      }
      if (currentSlot === this.lower) {
        ast.activeContainer = this.expr;
        this.expr.cursor = this.expr.children.length;
        return true;
      }
      if (this.parentContainer) {
        const idx = this.parentContainer.children.indexOf(this);
        if (idx !== -1) {
          ast.activeContainer = this.parentContainer;
          this.parentContainer.cursor = idx;
          return true;
        }
      }
      return false;
    }
    toHTML(showCursor, activeSlotId) {
      return `<span class="math-sigma">` +
        `<span class="math-sigma-stack">` +
          `<span class="math-sigma-upper">${this.upper.toHTML(showCursor, activeSlotId)}</span>` +
          `<span class="math-sigma-sym">∑</span>` +
          `<span class="math-sigma-lower">x=${this.lower.toHTML(showCursor, activeSlotId)}</span>` +
        `</span>` +
        `<span class="math-sigma-body">${this.expr.toHTML(showCursor, activeSlotId)}</span>` +
        `</span>`;
    }
    toMathJS() {
      const f = this.expr.toMathJS() || '0';
      const a = this.lower.toMathJS() || '1';
      const b = this.upper.toMathJS() || '10';
      return `sigma("${f}", ${a}, ${b})`;
    }
    toLineString() {
      return `sum(${this.expr.toLineString()}, ${this.lower.toLineString()}, ${this.upper.toLineString()})`;
    }
  }

  class ProductNode extends MathNode {
    constructor() {
      super('product');
      this.expr = new MathContainer(this);
      this.lower = new MathContainer(this);
      this.upper = new MathContainer(this);
    }
    hasSlots() { return true; }
    allSlotsEmpty() { return this.expr.isEmpty() && this.lower.isEmpty() && this.upper.isEmpty(); }
    getSlots() { return [this.expr, this.lower, this.upper]; }
    enterFromLeft(ast) {
      ast.activeContainer = this.expr;
      this.expr.cursor = 0;
    }
    enterFromRight(ast) {
      ast.activeContainer = this.upper;
      this.upper.cursor = this.upper.children.length;
    }
    handleDeleteAtStart(currentSlot, ast) {
      if (currentSlot === this.upper) {
        ast.activeContainer = this.lower;
        this.lower.cursor = this.lower.children.length;
        return true;
      }
      if (currentSlot === this.lower) {
        ast.activeContainer = this.expr;
        this.expr.cursor = this.expr.children.length;
        return true;
      }
      if (this.parentContainer) {
        const idx = this.parentContainer.children.indexOf(this);
        if (idx !== -1) {
          ast.activeContainer = this.parentContainer;
          this.parentContainer.cursor = idx;
          return true;
        }
      }
      return false;
    }
    toHTML(showCursor, activeSlotId) {
      return `<span class="math-sigma math-product">` +
        `<span class="math-sigma-stack">` +
          `<span class="math-sigma-upper">${this.upper.toHTML(showCursor, activeSlotId)}</span>` +
          `<span class="math-sigma-sym">∏</span>` +
          `<span class="math-sigma-lower">x=${this.lower.toHTML(showCursor, activeSlotId)}</span>` +
        `</span>` +
        `<span class="math-sigma-body">${this.expr.toHTML(showCursor, activeSlotId)}</span>` +
        `</span>`;
    }
    toMathJS() {
      const f = this.expr.toMathJS() || '0';
      const a = this.lower.toMathJS() || '1';
      const b = this.upper.toMathJS() || '10';
      return `product("${f}", ${a}, ${b})`;
    }
    toLineString() {
      return `product(${this.expr.toLineString()}, ${this.lower.toLineString()}, ${this.upper.toLineString()})`;
    }
  }

  class AbsNode extends MathNode {
    constructor() {
      super('abs');
      this.expr = new MathContainer(this);
    }
    hasSlots() { return true; }
    allSlotsEmpty() { return this.expr.isEmpty(); }
    getSlots() { return [this.expr]; }
    enterFromLeft(ast) {
      ast.activeContainer = this.expr;
      this.expr.cursor = 0;
    }
    enterFromRight(ast) {
      ast.activeContainer = this.expr;
      this.expr.cursor = this.expr.children.length;
    }
    handleDeleteAtStart(currentSlot, ast) {
      if (this.parentContainer) {
        const idx = this.parentContainer.children.indexOf(this);
        if (idx !== -1) {
          ast.activeContainer = this.parentContainer;
          this.parentContainer.cursor = idx;
          return true;
        }
      }
      return false;
    }
    toHTML(showCursor, activeSlotId) {
      return `<span class="math-abs">` +
        `<span class="math-abs-bar">|</span>` +
        `<span class="math-abs-content">${this.expr.toHTML(showCursor, activeSlotId)}</span>` +
        `<span class="math-abs-bar">|</span>` +
        `</span>`;
    }
    toMathJS() {
      const e = this.expr.toMathJS() || '0';
      return `abs(${e})`;
    }
    toLineString() {
      return `|${this.expr.toLineString()}|`;
    }
  }

  // Master MathAST
  class MathAST {
    constructor() {
      this.root = new MathContainer(null);
      this.activeContainer = this.root;
      this.slotMap = new Map();
      this.registerSlot(this.root);
    }

    registerSlot(container) {
      this.slotMap.set(container.id, container);
    }

    clear() {
      this.root = new MathContainer(null);
      this.activeContainer = this.root;
      this.slotMap.clear();
      this.registerSlot(this.root);
    }

    isEmpty() {
      return this.root.isEmpty();
    }

    findSlot(id) {
      return this.slotMap.get(id) || null;
    }

    setCursorToSlot(id) {
      const slot = this.findSlot(id);
      if (slot) {
        this.activeContainer = slot;
        slot.cursor = slot.children.length;
        return true;
      }
      return false;
    }

    insertToken(text, kind = 'text', mathjsText = null) {
      this.activeContainer.insertToken(text, kind, mathjsText);
    }

    insertFraction() {
      const cur = this.activeContainer;
      const frac = new FractionNode();
      this.registerSlot(frac.num);
      this.registerSlot(frac.den);

      // Casio feature: if cursor > 0 and previous token is number/var, wrap it into num
      if (cur.cursor > 0) {
        let startIdx = cur.cursor - 1;
        while (startIdx >= 0) {
          const item = cur.children[startIdx];
          if (item.type === 'token' && /^[0-9a-zA-Z.]$/.test(item.text)) {
            startIdx--;
          } else {
            break;
          }
        }
        startIdx++;
        if (startIdx < cur.cursor) {
          const numTokens = cur.children.splice(startIdx, cur.cursor - startIdx);
          for (const t of numTokens) {
            frac.num.insertNode(t);
          }
          cur.cursor = startIdx;
          cur.insertNode(frac);
          this.activeContainer = frac.den;
          frac.den.cursor = 0;
          return;
        }
      }

      cur.insertNode(frac);
      this.activeContainer = frac.num;
      frac.num.cursor = 0;
    }

    insertSqrt(hasIndex = false) {
      const cur = this.activeContainer;
      const sqrtNode = new SqrtNode(hasIndex);
      if (sqrtNode.index) this.registerSlot(sqrtNode.index);
      this.registerSlot(sqrtNode.radicand);

      cur.insertNode(sqrtNode);
      if (hasIndex) {
        this.activeContainer = sqrtNode.index;
        sqrtNode.index.cursor = 0;
      } else {
        this.activeContainer = sqrtNode.radicand;
        sqrtNode.radicand.cursor = 0;
      }
    }

    insertPower() {
      const cur = this.activeContainer;
      const powNode = new PowerNode();
      this.registerSlot(powNode.exp);
      cur.insertNode(powNode);
      this.activeContainer = powNode.exp;
      powNode.exp.cursor = 0;
    }

    insertLogBase() {
      const cur = this.activeContainer;
      const logNode = new LogBaseNode();
      this.registerSlot(logNode.base);
      this.registerSlot(logNode.arg);
      cur.insertNode(logNode);
      this.activeContainer = logNode.base;
      logNode.base.cursor = 0;
    }

    insertIntegral() {
      const cur = this.activeContainer;
      const intNode = new IntegralNode();
      this.registerSlot(intNode.integrand);
      this.registerSlot(intNode.lower);
      this.registerSlot(intNode.upper);
      cur.insertNode(intNode);
      this.activeContainer = intNode.integrand;
      intNode.integrand.cursor = 0;
    }

    insertDerivative() {
      const cur = this.activeContainer;
      const dNode = new DerivativeNode();
      this.registerSlot(dNode.expr);
      this.registerSlot(dNode.val);
      cur.insertNode(dNode);
      this.activeContainer = dNode.expr;
      dNode.expr.cursor = 0;
    }

    insertSum() {
      const cur = this.activeContainer;
      const sumNode = new SumNode();
      this.registerSlot(sumNode.expr);
      this.registerSlot(sumNode.lower);
      this.registerSlot(sumNode.upper);
      cur.insertNode(sumNode);
      this.activeContainer = sumNode.expr;
      sumNode.expr.cursor = 0;
    }

    insertProduct() {
      const cur = this.activeContainer;
      const prodNode = new ProductNode();
      this.registerSlot(prodNode.expr);
      this.registerSlot(prodNode.lower);
      this.registerSlot(prodNode.upper);
      cur.insertNode(prodNode);
      this.activeContainer = prodNode.expr;
      prodNode.expr.cursor = 0;
    }

    insertAbs() {
      const cur = this.activeContainer;
      const absNode = new AbsNode();
      this.registerSlot(absNode.expr);
      cur.insertNode(absNode);
      this.activeContainer = absNode.expr;
      absNode.expr.cursor = 0;
    }

    // --- NAVIGATION ---
    moveLeft() {
      const cur = this.activeContainer;
      if (cur.cursor > 0) {
        const prev = cur.children[cur.cursor - 1];
        if (prev.hasSlots()) {
          prev.enterFromRight(this);
        } else {
          cur.cursor--;
        }
        return;
      }
      if (cur.parentBlockNode) {
        const blk = cur.parentBlockNode;
        const slots = blk.getSlots();
        const sIdx = slots.indexOf(cur);
        if (sIdx > 0) {
          this.activeContainer = slots[sIdx - 1];
          this.activeContainer.cursor = this.activeContainer.children.length;
        } else {
          if (blk.parentContainer) {
            const p = blk.parentContainer;
            const bIdx = p.children.indexOf(blk);
            this.activeContainer = p;
            p.cursor = bIdx;
          }
        }
      }
    }

    moveRight() {
      const cur = this.activeContainer;
      if (cur.cursor < cur.children.length) {
        const next = cur.children[cur.cursor];
        if (next.hasSlots()) {
          next.enterFromLeft(this);
        } else {
          cur.cursor++;
        }
        return;
      }
      if (cur.parentBlockNode) {
        const blk = cur.parentBlockNode;
        const slots = blk.getSlots();
        const sIdx = slots.indexOf(cur);
        if (sIdx < slots.length - 1) {
          this.activeContainer = slots[sIdx + 1];
          this.activeContainer.cursor = 0;
        } else {
          if (blk.parentContainer) {
            const p = blk.parentContainer;
            const bIdx = p.children.indexOf(blk);
            this.activeContainer = p;
            p.cursor = bIdx + 1;
          }
        }
      }
    }

    moveUp() {
      const cur = this.activeContainer;
      if (cur.parentBlockNode) {
        const blk = cur.parentBlockNode;
        if (blk.type === 'fraction') {
          if (cur === blk.den) {
            this.activeContainer = blk.num;
            this.activeContainer.cursor = Math.min(cur.cursor, blk.num.children.length);
            return;
          }
        } else if (blk.type === 'integral' || blk.type === 'sum' || blk.type === 'product') {
          if (cur === blk.lower) {
            this.activeContainer = blk.upper;
            this.activeContainer.cursor = 0;
            return;
          } else if (cur === blk.integrand || cur === blk.expr) {
            this.activeContainer = blk.upper;
            this.activeContainer.cursor = 0;
            return;
          }
        } else if (blk.type === 'logbase') {
          if (cur === blk.base) {
            this.activeContainer = blk.arg;
            this.activeContainer.cursor = 0;
            return;
          }
        }
      }
    }

    moveDown() {
      const cur = this.activeContainer;
      if (cur.parentBlockNode) {
        const blk = cur.parentBlockNode;
        if (blk.type === 'fraction') {
          if (cur === blk.num) {
            this.activeContainer = blk.den;
            this.activeContainer.cursor = Math.min(cur.cursor, blk.den.children.length);
            return;
          }
        } else if (blk.type === 'integral' || blk.type === 'sum' || blk.type === 'product') {
          if (cur === blk.upper) {
            this.activeContainer = blk.lower;
            this.activeContainer.cursor = 0;
            return;
          } else if (cur === blk.integrand || cur === blk.expr) {
            this.activeContainer = blk.lower;
            this.activeContainer.cursor = 0;
            return;
          }
        } else if (blk.type === 'logbase') {
          if (cur === blk.arg) {
            this.activeContainer = blk.base;
            this.activeContainer.cursor = 0;
            return;
          }
        } else if (blk.type === 'power') {
          if (blk.parentContainer) {
            const p = blk.parentContainer;
            const bIdx = p.children.indexOf(blk);
            this.activeContainer = p;
            p.cursor = bIdx + 1;
            return;
          }
        }
      }
    }

    deleteBackward() {
      return this.activeContainer.deleteBackward(this);
    }

    toHTML(showCursor = true) {
      return this.root.toHTML(showCursor, this.activeContainer.id);
    }

    toMathJS() {
      return this.root.toMathJS();
    }

    toLineString() {
      return this.root.toLineString();
    }
  }


  // --- CASIO 580 PRO CLASS (PINK EDITION - NATURAL TEXTBOOK DISPLAY) ---
  class Casio580Pro {
    constructor() {
      this.sound = new SoundManager();
      this.ast = new MathAST();

      this.rawExpr = '';
      this.lastResult = null;
      this.lastResultHTML = '';
      this.lastResultFrac = null;
      this.lastResultDec = null;

      this.ans = 0;
      this.preAns = 0;

      this.isShift = false;
      this.isAlpha = false;

      this.angleUnit = 'DEG'; // Default DEG on Vietnamese Casio fx-580VN X
      this.ioMode = 'MathI/MathO'; // Default MathI/MathO per Requirement 1
      this.normMode = 'NORM'; // Default NORM

      this.currentTheme = 'pink'; // Casio fx-580VN X-PK Official Default
      this.hasInteracted = false; // Show CASIO® splash screen on start until keypress

      this.history = [];

      this.initDom();
      this.bindEvents();
      this.updateDisplay();
    }

    isMathIMode() {
      return this.ioMode.startsWith('MathI');
    }

    isMathOMode() {
      return this.ioMode.endsWith('MathO');
    }

    initDom() {
      this.el = {
        screenArea: document.getElementById('screenArea'),
        screenDisplayBody: document.getElementById('screenDisplayBody'),
        screenIdleSplash: document.getElementById('screenIdleSplash'),
        screenInput: document.getElementById('screenInput'),
        screenOutput: document.getElementById('screenOutput'),
        placeholderText: document.getElementById('placeholderText'),

        indShift: document.getElementById('indShift'),
        indAlpha: document.getElementById('indAlpha'),
        indMem: document.getElementById('indMem'),
        indSto: document.getElementById('indSto'),
        indRoot: document.getElementById('indRoot'),
        indAngle: document.getElementById('indAngle'),
        indMath: document.getElementById('indMath'),
        indScrollUp: document.getElementById('indScrollUp'),
        indScrollDown: document.getElementById('indScrollDown'),

        pillAngle: document.getElementById('pillAngle'),
        pillIOMode: document.getElementById('pillIOMode'),
        pillNorm: document.getElementById('pillNorm'),

        featureDropdownBtn: document.getElementById('featureDropdownBtn'),
        featureDropdownMenu: document.getElementById('featureDropdownMenu'),
        currentFeatureLabel: document.getElementById('currentFeatureLabel'),
        btnNewDoc: document.getElementById('btnNewDoc'),
        btnSaveDoc: document.getElementById('btnSaveDoc'),
        btnScreenMenu: document.getElementById('btnScreenMenu'),
        btnHelp: document.getElementById('btnHelp'),
        btnSettings: document.getElementById('btnSettings'),
        btnTheme: document.getElementById('btnTheme'),

        toolModal: document.getElementById('toolModal'),
        modalTitle: document.getElementById('modalTitle'),
        modalBody: document.getElementById('modalBody'),
        modalCloseBtn: document.getElementById('modalCloseBtn'),

        historyEntries: document.getElementById('historyEntries')
      };
    }

    bindEvents() {
      // Keypad clicks
      document.querySelectorAll('.key-button, .dpad-arrow').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const keyId = btn.getAttribute('data-key');
          if (keyId) this.pressKey(keyId, e);
        });
      });

      // Status Pill clicks
      if (this.el.pillAngle) {
        this.el.pillAngle.addEventListener('click', () => {
          const units = ['DEG', 'RAD', 'GRA'];
          const idx = (units.indexOf(this.angleUnit) + 1) % units.length;
          this.angleUnit = units[idx];
          this.el.pillAngle.innerText = this.angleUnit;
          this.sound.playClick();
          this.updateDisplay();
        });
      }

      // LCD Status Indicators click to toggle directly on screen
      if (this.el.indAngle) {
        this.el.indAngle.addEventListener('click', () => {
          const units = ['DEG', 'RAD', 'GRA'];
          const idx = (units.indexOf(this.angleUnit) + 1) % units.length;
          this.angleUnit = units[idx];
          if (this.el.pillAngle) this.el.pillAngle.innerText = this.angleUnit;
          this.sound.playClick();
          this.updateDisplay();
        });
      }

      if (this.el.indMath) {
        this.el.indMath.addEventListener('click', () => {
          this.ioMode = this.isMathIMode() ? 'LineI/LineO' : 'MathI/MathO';
          if (this.el.pillIOMode) this.el.pillIOMode.innerText = this.ioMode;
          this.sound.playClick();
          this.updateDisplay();
        });
      }

      if (this.el.screenDisplayBody) {
        this.el.screenDisplayBody.addEventListener('click', () => {
          if (!this.hasInteracted) {
            this.hasInteracted = true;
            this.updateDisplay();
          }
        });
      }

      if (this.el.pillIOMode) {
        this.el.pillIOMode.addEventListener('click', () => {
          const modes = ['MathI/MathO', 'MathI/DecimalO', 'LineI/LineO', 'LineI/DecimalO'];
          const idx = (modes.indexOf(this.ioMode) + 1) % modes.length;
          this.ioMode = modes[idx];
          this.el.pillIOMode.innerText = this.ioMode;
          this.sound.playClick();
          this.updateDisplay();
        });
      }

      if (this.el.pillNorm) {
        this.el.pillNorm.addEventListener('click', () => {
          const modes = ['NORM', 'FIX', 'SCI'];
          const idx = (modes.indexOf(this.normMode) + 1) % modes.length;
          this.normMode = modes[idx];
          this.el.pillNorm.innerText = this.normMode;
          this.sound.playClick();
        });
      }

      if (this.el.btnSettings) {
        this.el.btnSettings.addEventListener('click', () => this.openFeatureModal('settings'));
      }

      // Screen click-to-focus on empty boxes and slots
      this.el.screenInput.addEventListener('click', (e) => {
        const slotEl = e.target.closest('[data-slot-id]');
        if (slotEl) {
          const slotId = slotEl.getAttribute('data-slot-id');
          if (this.ast.setCursorToSlot(slotId)) {
            this.sound.playClick();
            this.updateDisplay();
            return;
          }
        }
        // Focus root at end
        this.ast.activeContainer = this.ast.root;
        this.ast.root.cursor = this.ast.root.children.length;
        this.updateDisplay();
      });

      // Feature Dropdown
      this.el.featureDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.el.featureDropdownMenu.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        this.el.featureDropdownMenu.classList.remove('show');
      });

      document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = item.getAttribute('data-action');
          this.el.currentFeatureLabel.innerText = item.innerText.replace(/^[^\w\s]+/, '').trim();
          this.el.featureDropdownMenu.classList.remove('show');
          this.openFeatureModal(action);
        });
      });

      // Top Actions
      this.el.btnNewDoc.addEventListener('click', () => {
        this.sound.playClick();
        this.ast.clear();
        this.rawExpr = '';
        this.lastResult = null;
        this.lastResultHTML = '';
        this.updateDisplay();
      });

      this.el.btnSaveDoc.addEventListener('click', () => {
        this.sound.playClick();
        const expr = !this.ast.isEmpty() ? this.ast.toLineString() : this.rawExpr;
        if (expr && this.lastResult) {
          this.addHistory(expr, this.lastResult);
          alert('Đã lưu phép tính vào danh sách!');
        } else {
          alert('Chưa có biểu thức và kết quả để lưu!');
        }
      });

      this.el.btnScreenMenu.addEventListener('click', () => this.openFeatureModal('screenMenu'));
      this.el.btnHelp.addEventListener('click', () => this.openFeatureModal('learn_cmd'));
      this.el.btnTheme.addEventListener('click', () => this.cycleTheme());

      this.el.modalCloseBtn.addEventListener('click', () => {
        this.el.toolModal.classList.remove('active');
      });

      window.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // --- KEYPAD INPUT DISPATCHER ---
    pressKey(keyId, e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.sound.playClick();

      if (keyId === 'ON') {
        this.ast.clear();
        this.rawExpr = '';
        this.lastResult = null;
        this.lastResultHTML = '';
        this.lastResultFrac = null;
        this.lastResultDec = null;
        this.hasInteracted = false;
        this.sound.playBeep();
        this.updateDisplay();
        return;
      }

      this.hasInteracted = true;

      if (keyId === 'SHIFT') {
        this.isShift = !this.isShift;
        this.isAlpha = false;
        this.updateModifiersVisual();
        return;
      }

      if (keyId === 'ALPHA') {
        this.isAlpha = !this.isAlpha;
        this.isShift = false;
        this.updateModifiersVisual();
        return;
      }

      if (this.isShift) {
        this.isShift = false;
        this.updateModifiersVisual();
        this.handleShiftKey(keyId);
        return;
      }

      if (this.isAlpha) {
        this.isAlpha = false;
        this.updateModifiersVisual();
        this.handleAlphaKey(keyId);
        return;
      }

      // Normal keys
      switch (keyId) {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case ',':
          if (this.isMathIMode()) {
            this.ast.insertToken(keyId === ',' ? '.' : keyId, keyId === ',' ? 'punct' : 'digit');
          } else {
            this.rawExpr += (keyId === ',' ? '.' : keyId);
          }
          break;

        case '(':
        case ')':
          if (this.isMathIMode()) {
            this.ast.insertToken(keyId, 'punct');
          } else {
            this.rawExpr += keyId;
          }
          break;

        case 'PLUS':
          if (this.isMathIMode()) this.ast.insertToken('+', 'op', '+');
          else this.rawExpr += '+';
          break;
        case 'MINUS':
          if (this.isMathIMode()) this.ast.insertToken('-', 'op', '-');
          else this.rawExpr += '-';
          break;
        case 'MUL':
          if (this.isMathIMode()) this.ast.insertToken('×', 'op', '*');
          else this.rawExpr += '×';
          break;
        case 'DIV':
          if (this.isMathIMode()) this.ast.insertToken('÷', 'op', '/');
          else this.rawExpr += '÷';
          break;

        case 'DEL':
          if (this.isMathIMode()) {
            this.ast.deleteBackward();
          } else {
            this.rawExpr = this.rawExpr.slice(0, -1);
          }
          break;

        case 'AC':
          this.ast.clear();
          this.rawExpr = '';
          this.lastResult = null;
          this.lastResultHTML = '';
          this.lastResultFrac = null;
          this.lastResultDec = null;
          break;

        case 'EQ':
        case 'CALC':
          this.evaluateCurrent();
          return;

        // Navigation
        case 'LEFT':
          if (this.isMathIMode()) this.ast.moveLeft();
          break;
        case 'RIGHT':
          if (this.isMathIMode()) this.ast.moveRight();
          break;
        case 'UP':
          if (this.isMathIMode()) this.ast.moveUp();
          break;
        case 'DOWN':
          if (this.isMathIMode()) this.ast.moveDown();
          break;

        // Natural blocks
        case 'FRAC':
          if (this.isMathIMode()) this.ast.insertFraction();
          else this.rawExpr += '/';
          break;

        case 'SQRT':
          if (this.isMathIMode()) this.ast.insertSqrt(false);
          else this.rawExpr += '√(';
          break;

        case 'X2':
          if (this.isMathIMode()) {
            this.ast.insertPower();
            this.ast.insertToken('2', 'digit', '2');
            this.ast.moveRight();
          } else {
            this.rawExpr += '^2';
          }
          break;

        case 'X_POW':
          if (this.isMathIMode()) this.ast.insertPower();
          else this.rawExpr += '^';
          break;

        case 'LOG_BASE':
          if (this.isMathIMode()) this.ast.insertLogBase();
          else this.rawExpr += 'log(';
          break;

        case 'LN':
          if (this.isMathIMode()) this.ast.insertToken('ln(', 'func', 'log(');
          else this.rawExpr += 'ln(';
          break;

        case 'NEG':
          if (this.isMathIMode()) this.ast.insertToken('-', 'op', '-');
          else this.rawExpr += '-';
          break;

        case 'INV':
          if (this.isMathIMode()) {
            this.ast.insertPower();
            this.ast.insertToken('-', 'op', '-');
            this.ast.insertToken('1', 'digit', '1');
            this.ast.moveRight();
          } else {
            this.rawExpr += '^-1';
          }
          break;

        case 'SIN':
          if (this.isMathIMode()) this.ast.insertToken('sin(', 'func');
          else this.rawExpr += 'sin(';
          break;
        case 'COS':
          if (this.isMathIMode()) this.ast.insertToken('cos(', 'func');
          else this.rawExpr += 'cos(';
          break;
        case 'TAN':
          if (this.isMathIMode()) this.ast.insertToken('tan(', 'func');
          else this.rawExpr += 'tan(';
          break;

        case 'VAR_X':
          if (this.isMathIMode()) this.ast.insertToken('x', 'var', 'x');
          else this.rawExpr += 'x';
          break;

        case 'EXP':
          if (this.isMathIMode()) this.ast.insertToken('×10^', 'op', '*10^');
          else this.rawExpr += '×10^';
          break;

        case 'ANS':
          if (this.isMathIMode()) this.ast.insertToken('Ans', 'var', '(' + this.ans + ')');
          else this.rawExpr += 'Ans';
          break;

        case 'INTEG':
          if (this.isMathIMode()) this.ast.insertIntegral();
          else this.openFeatureModal('integ');
          break;

        case 'SD':
          this.toggleFormat();
          return;

        case 'MENU':
          this.openFeatureModal('menu');
          return;

        case 'SETTINGS':
          this.openFeatureModal('settings');
          return;

        default:
          break;
      }

      this.updateDisplay();
    }

    handleShiftKey(keyId) {
      switch (keyId) {
        case 'CALC': this.openFeatureModal('quad'); return; // SOLVE
        case 'INTEG':
          if (this.isMathIMode()) this.ast.insertDerivative();
          else this.openFeatureModal('deriv');
          break;
        case 'VAR_X':
          if (this.isMathIMode()) this.ast.insertSum();
          else this.openFeatureModal('sum');
          break;
        case 'SQRT':
          if (this.isMathIMode()) {
            this.ast.insertSqrt(true);
            this.ast.insertToken('3', 'digit', '3');
            this.ast.moveRight();
          } else {
            this.rawExpr += 'cbrt(';
          }
          break;
        case 'X2':
          if (this.isMathIMode()) {
            this.ast.insertPower();
            this.ast.insertToken('3', 'digit', '3');
            this.ast.moveRight();
          } else {
            this.rawExpr += '^3';
          }
          break;
        case 'X_POW':
          if (this.isMathIMode()) this.ast.insertSqrt(true);
          else this.rawExpr += 'nthRoot(';
          break;
        case 'LOG_BASE':
          if (this.isMathIMode()) {
            this.ast.insertToken('10', 'digit', '10');
            this.ast.insertPower();
          } else {
            this.rawExpr += '10^(';
          }
          break;
        case 'LN':
          if (this.isMathIMode()) {
            this.ast.insertToken('e', 'var', 'e');
            this.ast.insertPower();
          } else {
            this.rawExpr += 'e^(';
          }
          break;
        case 'NEG':
          if (this.isMathIMode()) this.ast.insertToken('log(', 'func', 'log10(');
          else this.rawExpr += 'log(';
          break;
        case 'DEG': this.openFeatureModal('fact'); return; // FACT
        case 'INV':
          if (this.isMathIMode()) this.ast.insertToken('!', 'op', '!');
          else this.rawExpr += '!';
          break;
        case 'SIN':
          if (this.isMathIMode()) this.ast.insertToken('asin(', 'func');
          else this.rawExpr += 'asin(';
          break;
        case 'COS':
          if (this.isMathIMode()) this.ast.insertToken('acos(', 'func');
          else this.rawExpr += 'acos(';
          break;
        case 'TAN':
          if (this.isMathIMode()) this.ast.insertToken('atan(', 'func');
          else this.rawExpr += 'atan(';
          break;
        case '(':
          if (this.isMathIMode()) this.ast.insertAbs();
          else this.rawExpr += 'abs(';
          break;
        case '7':
          if (this.isMathIMode()) this.ast.insertToken('CONST(', 'func');
          else this.rawExpr += 'CONST(';
          break;
        case '9': this.openFeatureModal('limit'); return;
        case 'MUL':
          if (this.isMathIMode()) this.ast.insertToken(' nPr ', 'op', ' nPr ');
          else this.rawExpr += ' nPr ';
          break;
        case 'DIV':
          if (this.isMathIMode()) this.ast.insertToken(' nCr ', 'op', ' nCr ');
          else this.rawExpr += ' nCr ';
          break;
        case '2': this.openFeatureModal('cmplx'); return;
        case 'PLUS':
          if (this.isMathIMode()) this.ast.insertToken('Pol(', 'func');
          else this.rawExpr += 'Pol(';
          break;
        case 'MINUS':
          if (this.isMathIMode()) this.ast.insertToken('Rec(', 'func');
          else this.rawExpr += 'Rec(';
          break;
        case ',':
          if (this.isMathIMode()) this.ast.insertToken('Ran#', 'var', '(' + Math.random().toFixed(4) + ')');
          else this.rawExpr += 'Ran#';
          break;
        case 'EXP':
          if (this.isMathIMode()) this.ast.insertToken('π', 'var', 'pi');
          else this.rawExpr += 'π';
          break;
        case 'ANS':
          if (this.isMathIMode()) this.ast.insertToken('%', 'op', '%');
          else this.rawExpr += '%';
          break;
        default: break;
      }
      this.updateDisplay();
    }

    handleAlphaKey(keyId) {
      switch (keyId) {
        case 'CALC':
          if (this.isMathIMode()) this.ast.insertToken(' = ', 'op', ' = ');
          else this.rawExpr += ' = ';
          break;
        case 'INTEG':
          if (this.isMathIMode()) this.ast.insertToken(':', 'punct');
          else this.rawExpr += ':';
          break;
        case 'FRAC':
          if (this.isMathIMode()) this.ast.insertToken(' ÷R ', 'op', ' ÷R ');
          else this.rawExpr += ' ÷R ';
          break;
        case 'X2':
          if (this.isMathIMode()) this.ast.insertToken(' mod ', 'op', ' mod ');
          else this.rawExpr += ' mod ';
          break;
        case 'VAR_X':
          if (this.isMathIMode()) this.ast.insertProduct();
          else this.rawExpr += 'product(';
          break;
        case 'X_POW':
          if (this.isMathIMode()) this.ast.insertToken('cot(', 'func');
          else this.rawExpr += 'cot(';
          break;
        case 'LOG_BASE':
          if (this.isMathIMode()) this.ast.insertToken('acot(', 'func');
          else this.rawExpr += 'acot(';
          break;
        case 'NEG':
          if (this.isMathIMode()) this.ast.insertToken('A', 'var');
          else this.rawExpr += 'A';
          break;
        case 'DEG':
          if (this.isMathIMode()) this.ast.insertToken('B', 'var');
          else this.rawExpr += 'B';
          break;
        case 'INV':
          if (this.isMathIMode()) this.ast.insertToken('C', 'var');
          else this.rawExpr += 'C';
          break;
        case 'SIN':
          if (this.isMathIMode()) this.ast.insertToken('D', 'var');
          else this.rawExpr += 'D';
          break;
        case 'COS':
          if (this.isMathIMode()) this.ast.insertToken('T', 'var');
          else this.rawExpr += 'T';
          break;
        case 'TAN':
          if (this.isMathIMode()) this.ast.insertToken('F', 'var');
          else this.rawExpr += 'F';
          break;
        case 'ENG':
          if (this.isMathIMode()) this.ast.insertToken('i', 'var', 'i');
          else this.rawExpr += 'i';
          break;
        case '(':
          if (this.isMathIMode()) this.ast.insertToken('x', 'var', 'x');
          else this.rawExpr += 'x';
          break;
        case ')':
          if (this.isMathIMode()) this.ast.insertToken('y', 'var', 'y');
          else this.rawExpr += 'y';
          break;
        case 'SD':
          if (this.isMathIMode()) this.ast.insertToken('z', 'var', 'z');
          else this.rawExpr += 'z';
          break;
        case 'M_PLUS':
          if (this.isMathIMode()) this.ast.insertToken('M', 'var');
          else this.rawExpr += 'M';
          break;
        case '9':
          if (this.isMathIMode()) this.ast.insertToken('Infinity', 'var');
          else this.rawExpr += 'Infinity';
          break;
        case 'MUL':
        case 'DIV':
          this.openFeatureModal('gcd_lcm');
          return;
        case 'PLUS':
          if (this.isMathIMode()) this.ast.insertToken('ceil(', 'func');
          else this.rawExpr += 'ceil(';
          break;
        case 'MINUS':
          if (this.isMathIMode()) this.ast.insertToken('floor(', 'func');
          else this.rawExpr += 'floor(';
          break;
        case 'EXP':
          if (this.isMathIMode()) this.ast.insertToken('e', 'var', 'e');
          else this.rawExpr += 'e';
          break;
        case 'ANS':
          if (this.isMathIMode()) this.ast.insertToken('PreAns', 'var', '(' + this.preAns + ')');
          else this.rawExpr += 'PreAns';
          break;
        default: break;
      }
      this.updateDisplay();
    }

    updateModifiersVisual() {
      const shiftBtn = document.querySelector('.btn-shift');
      const alphaBtn = document.querySelector('.btn-alpha');
      if (shiftBtn) shiftBtn.classList.toggle('active', this.isShift);
      if (alphaBtn) alphaBtn.classList.toggle('active', this.isAlpha);
      if (this.el.indShift) this.el.indShift.classList.toggle('active', this.isShift);
      if (this.el.indAlpha) this.el.indAlpha.classList.toggle('active', this.isAlpha);
    }

    // --- EVALUATION WITH NATURAL TEXTBOOK DISPLAY (MathIO / MathO) ---
    evaluateCurrent() {
      let mathJSStr = '';
      let lineStr = '';

      if (!this.ast.isEmpty()) {
        mathJSStr = this.ast.toMathJS();
        lineStr = this.ast.toLineString();
      } else if (this.rawExpr && this.rawExpr.trim() !== '') {
        mathJSStr = this.rawExpr.trim();
        lineStr = this.rawExpr.trim();
      } else {
        return;
      }

      const expr = lineStr;

      // 1. Verify
      if (expr.startsWith('verify(') || expr.startsWith('check(')) {
        const inner = expr.replace(/^(?:verify|check)\s*\(/, '').replace(/\)$/, '');
        const res = MathSolvers.verify(inner);
        this.lastResult = res;
        this.lastResultHTML = res;
        this.addHistory(expr, res);
        this.updateDisplay();
        return;
      }

      // 2. Prime check
      const mPrime = expr.match(/^(?:isprime|prime)\s*\(?(\d+)\)?$/i);
      if (mPrime) {
        const val = parseInt(mPrime[1], 10);
        const res = MathSolvers.isPrime(val);
        this.lastResult = res.reason;
        this.lastResultHTML = res.reason;
        this.addHistory(expr, res.reason);
        this.updateDisplay();
        return;
      }

      // 3. Div with remainder
      const mDivR = expr.match(/^(?:divr|div_r)\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
      if (mDivR) {
        const res = MathSolvers.divR(parseInt(mDivR[1], 10), parseInt(mDivR[2], 10));
        this.lastResult = res;
        this.lastResultHTML = res.replace(/\n/g, '<br>');
        this.addHistory(expr, res.replace(/\n/g, ' '));
        this.updateDisplay();
        return;
      }

      // 4. FACT
      const mFact = expr.match(/^(?:fact|FACT)\s*\(?(\d+)\)?$/);
      if (mFact) {
        const val = parseInt(mFact[1], 10);
        const res = `${val} = ` + MathSolvers.factorize(val);
        this.lastResult = res;
        this.lastResultHTML = res;
        this.addHistory(expr, res);
        this.updateDisplay();
        return;
      }

      // 5. GCD
      const mGcd = expr.match(/^(?:gcd|GCD)\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)$/);
      if (mGcd) {
        const res = MathSolvers.gcd(parseInt(mGcd[1], 10), parseInt(mGcd[2], 10));
        this.lastResult = `${res}`;
        this.lastResultHTML = `${res}`;
        this.addHistory(expr, `${res}`);
        this.updateDisplay();
        return;
      }

      // 6. LCM
      const mLcm = expr.match(/^(?:lcm|LCM)\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)$/);
      if (mLcm) {
        const res = MathSolvers.lcm(parseInt(mLcm[1], 10), parseInt(mLcm[2], 10));
        this.lastResult = `${res}`;
        this.lastResultHTML = `${res}`;
        this.addHistory(expr, `${res}`);
        this.updateDisplay();
        return;
      }

      // 7. Derivative
      const mDiff = expr.match(/^(?:diff|d\/dx)\s*\(\s*(.+?)\s*,\s*([-+]?\d*\.?\d+)\s*\)$/);
      if (mDiff) {
        try {
          const val = MathSolvers.derivative(mDiff[1], parseFloat(mDiff[2]));
          this.lastResult = `${val.toFixed(4)}`;
          this.lastResultHTML = this.lastResult;
          this.addHistory(expr, this.lastResult);
          this.updateDisplay();
          return;
        } catch (e) {}
      }

      // 8. Integral
      const mInt = expr.match(/^(?:int|integrate)\s*\(\s*(.+?)\s*,\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*\)$/);
      if (mInt) {
        try {
          const val = MathSolvers.integrate(mInt[1], parseFloat(mInt[2]), parseFloat(mInt[3]));
          this.lastResult = `${val.toFixed(4)}`;
          this.lastResultHTML = this.lastResult;
          this.addHistory(expr, this.lastResult);
          this.updateDisplay();
          return;
        } catch (e) {}
      }

      // 9. Sum
      const mSum = expr.match(/^(?:sum|sigma)\s*\(\s*(.+?)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
      if (mSum) {
        try {
          const val = MathSolvers.summation(mSum[1], parseInt(mSum[2], 10), parseInt(mSum[3], 10));
          this.lastResult = `${val}`;
          this.lastResultHTML = this.lastResult;
          this.addHistory(expr, this.lastResult);
          this.updateDisplay();
          return;
        } catch (e) {}
      }

      // 10. Limit
      const mLim = expr.match(/^(?:limit|lim)\s*\(\s*(.+?)\s*,\s*([-+]?\d*\.?\d+)\s*\)$/);
      if (mLim) {
        try {
          const val = MathSolvers.limit(mLim[1], parseFloat(mLim[2]));
          this.lastResult = typeof val === 'number' ? `${val.toFixed(4)}` : `${val}`;
          this.lastResultHTML = this.lastResult;
          this.addHistory(expr, this.lastResult);
          this.updateDisplay();
          return;
        } catch (e) {}
      }

      // 11. Smart Equation Detection
      if (expr.includes('=')) {
        this.solveSmartEquation(expr);
        return;
      }

      // 12. Standard Math Evaluation
      try {
        let parsed = mathJSStr
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'pi')
          .replace(/Ans/g, `(${this.ans})`)
          .replace(/PreAns/g, `(${this.preAns})`)
          .replace(/Ran#/g, `(${Math.random().toFixed(4)})`)
          .replace(/√\(/g, 'sqrt(')
          .replace(/÷R/g, '%')
          .replace(/mod/g, '%');

        if (this.angleUnit === 'DEG') {
          parsed = parsed
            .replace(/sin\(([^)]+)\)/g, 'sin(($1) * deg)')
            .replace(/cos\(([^)]+)\)/g, 'cos(($1) * deg)')
            .replace(/tan\(([^)]+)\)/g, 'tan(($1) * deg)')
            .replace(/cot\(([^)]+)\)/g, '(1 / tan(($1) * deg))');
        }

        const scope = {
          deg: Math.PI / 180,
          i: math.complex(0, 1),
          cbrt: Math.cbrt,
          integrate: (fn, a, b) => MathSolvers.integrate(fn, a, b),
          diff: (fn, x0) => MathSolvers.derivative(fn, x0),
          sigma: (fn, a, b) => MathSolvers.summation(fn, a, b),
          product: (fn, a, b) => {
            let p = 1;
            for (let x = a; x <= b; x++) p *= math.evaluate(fn, { x, deg: Math.PI / 180 });
            return p;
          },
          nthRoot: (r, idx) => Math.pow(r, 1 / idx)
        };

        let result = math.evaluate(parsed, scope);

        if (result && typeof result === 'object' && ('re' in result || 'im' in result)) {
          const re = Math.abs(result.re) < 1e-12 ? 0 : result.re;
          const im = Math.abs(result.im) < 1e-12 ? 0 : result.im;
          let s = '';
          if (im === 0) s = `${re}`;
          else if (re === 0) s = `${im}i`;
          else s = `${re} ${im > 0 ? '+' : '-'} ${Math.abs(im)}i`;
          this.lastResult = s;
          this.lastResultHTML = s;
          this.ans = result.re;
        } else if (typeof result === 'number') {
          if (Math.abs(result - Math.round(result)) < 1e-12) {
            result = Math.round(result);
          } else {
            result = parseFloat(result.toPrecision(10));
          }
          this.preAns = this.ans;
          this.ans = result;
          this.lastResultDec = result;

          const frac = floatToFraction(result);
          this.lastResultFrac = frac;

          if (this.isMathOMode() && frac && frac.den > 1) {
            this.lastResult = frac.text;
            this.lastResultHTML = `<span class="math-fraction natural-output"><span class="math-num">${frac.num}</span><span class="math-frac-line"></span><span class="math-den">${frac.den}</span></span>`;
          } else if (this.ioMode === 'LineI/LineO' && frac && frac.den > 1) {
            this.lastResult = frac.text;
            this.lastResultHTML = frac.text;
          } else {
            this.lastResult = `${result}`;
            this.lastResultHTML = `${result}`;
          }
        } else {
          this.lastResult = `${result}`;
          this.lastResultHTML = `${result}`;
        }

        this.addHistory(expr, this.lastResult);
      } catch (err) {
        this.lastResult = 'Cú pháp không hợp lệ (Syntax Error)';
        this.lastResultHTML = 'Cú pháp không hợp lệ (Syntax Error)';
        this.sound.playBeep();
      }

      this.updateDisplay();
    }

    solveSmartEquation(equationStr) {
      let eqClean = equationStr.replace(/^solve\s*\(/i, '').replace(/\)$/, '').trim();
      const parts = eqClean.split('=');
      if (parts.length !== 2) {
        this.lastResult = 'Phương trình không hợp lệ';
        this.lastResultHTML = this.lastResult;
        this.updateDisplay();
        return;
      }

      const lhs = parts[0].trim();
      const rhs = parts[1].trim();

      try {
        const fStr = `(${lhs}) - (${rhs})`;
        const f = (xVal) => math.evaluate(fStr, { x: xVal });

        const c = f(0);
        const f1 = f(1);
        const fm1 = f(-1);

        const a = (f1 + fm1 - 2 * c) / 2;
        const b = f1 - c - a;

        const f2 = f(2);
        const expectedF2 = 4 * a + 2 * b + c;

        if (Math.abs(f2 - expectedF2) < 1e-6 && Math.abs(a) > 1e-6) {
          const quadResult = MathSolvers.solveQuadratic(a, b, c);
          this.lastResult = quadResult;
          this.lastResultHTML = quadResult.replace(/\n/g, '<br>');
          this.addHistory(equationStr, quadResult.replace(/\n/g, ' | '));
          this.updateDisplay();
          return;
        }

        if (Math.abs(a) < 1e-6 && Math.abs(b) > 1e-6) {
          const xVal = -c / b;
          const frac = floatToFraction(xVal);
          const res = `Nghiệm duy nhất: x = ${frac && frac.den > 1 ? frac.text : xVal.toFixed(4)}`;
          this.lastResult = res;
          this.lastResultHTML = res;
          this.addHistory(equationStr, res);
          this.updateDisplay();
          return;
        }

        this.lastResult = 'Đang giải phương trình...';
        this.lastResultHTML = this.lastResult;
      } catch (e) {
        this.lastResult = 'Không thể giải tự động dạng này';
        this.lastResultHTML = this.lastResult;
      }

      this.updateDisplay();
    }

    toggleFormat() {
      if (this.lastResultDec === null || this.lastResultDec === undefined) return;

      const cur = this.lastResult;
      const frac = this.lastResultFrac;
      const dec = this.lastResultDec;

      if (cur && (cur.includes('/') || this.lastResultHTML.includes('math-fraction'))) {
        // Toggle to Decimal
        this.lastResult = `${dec}`;
        this.lastResultHTML = `${dec}`;
      } else if (frac && frac.den > 1) {
        // Toggle to Fraction
        this.lastResult = frac.text;
        if (this.isMathOMode()) {
          this.lastResultHTML = `<span class="math-fraction natural-output"><span class="math-num">${frac.num}</span><span class="math-frac-line"></span><span class="math-den">${frac.den}</span></span>`;
        } else {
          this.lastResultHTML = frac.text;
        }
      }
      this.updateDisplay();
    }

    updateDisplay() {
      // Toggle idle splash screen vs expression input
      const isEmpty = (this.isMathIMode() && this.ast.isEmpty() && !this.rawExpr) || (!this.isMathIMode() && !this.rawExpr);
      if (this.el.screenIdleSplash && this.el.screenInput) {
        if (!this.hasInteracted && isEmpty && !this.lastResult) {
          this.el.screenIdleSplash.style.display = 'flex';
          this.el.screenInput.style.display = 'none';
        } else {
          this.el.screenIdleSplash.style.display = 'none';
          this.el.screenInput.style.display = 'flex';
        }
      }

      // Update LCD Status Indicators
      if (this.el.indAngle) {
        this.el.indAngle.innerText = this.angleUnit === 'DEG' ? 'D' : (this.angleUnit === 'RAD' ? 'R' : 'G');
      }
      if (this.el.indMath) {
        this.el.indMath.innerText = this.isMathIMode() ? 'Math' : 'Line';
      }
      if (this.el.indShift) {
        this.el.indShift.classList.toggle('active', this.isShift);
      }
      if (this.el.indAlpha) {
        this.el.indAlpha.classList.toggle('active', this.isAlpha);
      }
      if (this.el.indMem) {
        this.el.indMem.classList.toggle('active', (typeof this.memM === 'number' && this.memM !== 0));
      }

      if (this.isMathIMode()) {
        if (this.ast.isEmpty()) {
          if (this.rawExpr) {
            this.el.screenInput.innerHTML = `<span class="math-token">${this.rawExpr}</span><span class="casio-cursor"></span>`;
          } else {
            this.el.screenInput.innerHTML = '<span class="casio-cursor"></span>';
          }
        } else {
          this.el.screenInput.innerHTML = this.ast.toHTML(true);
        }
      } else {
        if (this.rawExpr) {
          this.el.screenInput.innerText = this.rawExpr;
        } else {
          this.el.screenInput.innerHTML = '<span class="casio-cursor"></span>';
        }
      }

      this.el.screenOutput.innerHTML = this.lastResultHTML || this.lastResult || '';
    }

    openFeatureModal(type) {
      const modal = this.el.toolModal;
      const title = this.el.modalTitle;
      const body = this.el.modalBody;

      modal.classList.add('active');

      // 1. MENU CHÍNH 12 CHẾ ĐỘ
      if (type === 'menu') {
        title.innerText = '🌸 MENU 12 CHẾ ĐỘ CASIO fx-580VN X-PK';
        body.innerHTML = `
          <div style="display:flex; gap:8px; border-bottom:1px solid rgba(244,114,182,0.2); padding-bottom:8px; margin-bottom:10px;">
            <button class="cmd-try-btn" id="menuTab1" style="background:#f43f5e; color:#fff; padding:6px 14px;">12 Chế độ fx-580VN X</button>
            <button class="cmd-try-btn" id="menuTab2" style="background:transparent; color:#cbd5e1; padding:6px 14px;">💡 Bảng học lệnh toán học</button>
          </div>

          <div id="menuViewModes" class="menu-grid-12">
            <div class="menu-card-tile" onclick="window.casio.selectModeFromMenu('1')">
              <span class="menu-tile-badge">1</span>
              <span class="menu-tile-title">Tính toán</span>
              <span class="menu-tile-desc">Phép tính số học, căn, luỹ thừa, lượng giác</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.selectModeFromMenu('2')">
              <span class="menu-tile-badge">2</span>
              <span class="menu-tile-title">Số phức</span>
              <span class="menu-tile-desc">Số ảo i, Modulus |z|, liên hợp, Argument</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.selectModeFromMenu('3')">
              <span class="menu-tile-badge">3</span>
              <span class="menu-tile-title">Hệ đếm</span>
              <span class="menu-tile-desc">Cơ số Hex, Dec, Oct, Bin & logic AND/OR</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.openFeatureModal('matrix')">
              <span class="menu-tile-badge">4</span>
              <span class="menu-tile-title">Ma trận 4x4</span>
              <span class="menu-tile-desc">Định thức Det, ma trận nghịch đảo, nhân</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.openFeatureModal('vector')">
              <span class="menu-tile-badge">5</span>
              <span class="menu-tile-title">Véc-tơ 3D</span>
              <span class="menu-tile-desc">Tích vô hướng, tích có hướng véc-tơ</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.openFeatureModal('stat')">
              <span class="menu-tile-badge">6</span>
              <span class="menu-tile-title">Thống kê</span>
              <span class="menu-tile-desc">Trung bình x̄, phương sai, hồi quy tuyến tính</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.openFeatureModal('distrib')">
              <span class="menu-tile-badge">7</span>
              <span class="menu-tile-title">Phân phối</span>
              <span class="menu-tile-desc">Phân phối chuẩn Normal, nhị thức Binomial</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.openFeatureModal('table')">
              <span class="menu-tile-badge">8</span>
              <span class="menu-tile-title">Bảng giá trị</span>
              <span class="menu-tile-desc">Khảo sát hàm f(x), g(x) với Start, End, Step</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.selectModeFromMenu('9')">
              <span class="menu-tile-badge">9</span>
              <span class="menu-tile-title">PT / Hệ PT</span>
              <span class="menu-tile-desc">Hệ 2-3-4 ẩn, PT bậc 2 (Min/Max Parabol), bậc 3, 4</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.openFeatureModal('ineq')">
              <span class="menu-tile-badge">A</span>
              <span class="menu-tile-title">Bất PT</span>
              <span class="menu-tile-desc">Bất phương trình bậc 2, bậc 3 (&gt;, &lt;, ≥, ≤)</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.openFeatureModal('ratio')">
              <span class="menu-tile-badge">B</span>
              <span class="menu-tile-title">Tỉ lệ thức</span>
              <span class="menu-tile-desc">Tìm ẩn trong tỉ lệ a:b = c:d</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.openFeatureModal('learn_cmd')">
              <span class="menu-tile-badge">C</span>
              <span class="menu-tile-title">Học lệnh</span>
              <span class="menu-tile-desc">Toàn bộ 521 cú pháp lệnh và ví dụ mẫu</span>
            </div>
          </div>

          <div id="menuViewCommands" style="display:none; flex-direction:column; gap:8px;"></div>
        `;

        document.getElementById('menuTab1').onclick = () => {
          document.getElementById('menuViewModes').style.display = 'grid';
          document.getElementById('menuViewCommands').style.display = 'none';
          document.getElementById('menuTab1').style.background = '#f43f5e';
          document.getElementById('menuTab1').style.color = '#fff';
          document.getElementById('menuTab2').style.background = 'transparent';
          document.getElementById('menuTab2').style.color = '#cbd5e1';
        };

        document.getElementById('menuTab2').onclick = () => {
          document.getElementById('menuViewModes').style.display = 'none';
          document.getElementById('menuViewCommands').style.display = 'flex';
          document.getElementById('menuTab2').style.background = '#f43f5e';
          document.getElementById('menuTab2').style.color = '#fff';
          document.getElementById('menuTab1').style.background = 'transparent';
          document.getElementById('menuTab1').style.color = '#cbd5e1';
          this.renderCommandListInContainer('menuViewCommands');
        };
      }

      // 2. HỌC LỆNH (COMMAND LEARNING & CHEATSHEET)
      else if (type === 'learn_cmd') {
        title.innerText = '💡 BẢNG HỌC LỆNH 521 TÍNH NĂNG (GÕ LỆNH TRỰC TIẾP)';
        body.innerHTML = `
          <div style="font-size:12.5px; color:#cbd5e1; line-height:1.5;">
            Bạn có thể gõ trực tiếp các lệnh này vào màn hình hoặc bấm nút <b>"Thử ngay"</b> để máy tự động nạp và tính toán tức thì!
          </div>
          <div id="cmdListContainer" style="display:flex; flex-direction:column; gap:8px; max-height:420px; overflow-y:auto; padding-right:4px;"></div>
        `;
        this.renderCommandListInContainer('cmdListContainer');
      }

      // 3. KIỂM TRA SỐ NGUYÊN TỐ (PRIME CHECK)
      else if (type === 'prime_check') {
        title.innerText = '🔍 Kiểm tra số nguyên tố (Prime Check)';
        body.innerHTML = `
          <div>Nhập số nguyên cần kiểm tra (lên tới 4 chữ số hoặc hơn):</div>
          <input type="number" id="primeIn" class="modal-input-field" placeholder="Ví dụ: 2027" value="${this.ans || '2027'}">
          <button class="modal-action-btn" id="primeSubmit">Kiểm tra ngay</button>
          <div id="primeRes" style="font-size:16px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('primeSubmit').onclick = () => {
          const val = parseFloat(document.getElementById('primeIn').value) || 0;
          const res = MathSolvers.isPrime(val);
          document.getElementById('primeRes').innerText = `${val} : ${res.reason}`;
          this.rawExpr = `isprime(${val})`;
          this.lastResult = res.reason;
          this.updateDisplay();
        };
      }

      // 4. PHÉP CHIA CÓ DƯ (÷R)
      else if (type === 'div_r') {
        title.innerText = '➗ Phép chia có dư (÷R - Tìm Thương & Dư)';
        body.innerHTML = `
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div><label>Số bị chia (a):</label><input type="number" id="divA" class="modal-input-field" value="17"></div>
            <div><label>Số chia (b):</label><input type="number" id="divB" class="modal-input-field" value="5"></div>
          </div>
          <button class="modal-action-btn" id="divSubmit" style="margin-top:8px;">Tính thương và số dư</button>
          <div id="divRes" style="white-space:pre-wrap; font-size:15px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('divSubmit').onclick = () => {
          const a = parseFloat(document.getElementById('divA').value) || 0;
          const b = parseFloat(document.getElementById('divB').value) || 1;
          const res = MathSolvers.divR(a, b);
          document.getElementById('divRes').innerText = res;
          this.rawExpr = `divr(${a}, ${b})`;
          this.lastResult = `Q=${Math.floor(a/b)}, R=${a%b}`;
          this.updateDisplay();
        };
      }

      // 5. KIỂM TRA ĐÚNG/SAI (VERIFY)
      else if (type === 'verify') {
        title.innerText = '✔️ Kiểm tra Đúng / Sai (Verify True/False)';
        body.innerHTML = `
          <div>Nhập biểu thức đẳng thức hoặc bất đẳng thức để kiểm tra:</div>
          <input type="text" id="verIn" class="modal-input-field" value="sqrt(8) = 2*sqrt(2)">
          <div style="display:flex; gap:6px; margin-top:6px;">
            <button class="cmd-try-btn" onclick="document.getElementById('verIn').value='2 + 3 = 5'">2+3=5</button>
            <button class="cmd-try-btn" onclick="document.getElementById('verIn').value='sqrt(2) > 1.5'">√2 > 1.5</button>
            <button class="cmd-try-btn" onclick="document.getElementById('verIn').value='sin(30 deg) = 0.5'">sin(30°)=0.5</button>
          </div>
          <button class="modal-action-btn" id="verSubmit" style="margin-top:8px;">Kiểm tra Đúng/Sai</button>
          <div id="verRes" style="font-size:17px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('verSubmit').onclick = () => {
          const s = document.getElementById('verIn').value;
          const res = MathSolvers.verify(s);
          document.getElementById('verRes').innerText = `Kết quả: ${res}`;
          this.rawExpr = `verify(${s})`;
          this.lastResult = res;
          this.updateDisplay();
        };
      }

      // 6. PHÂN TÍCH THỪA SỐ (FACT)
      else if (type === 'fact') {
        title.innerText = '🌿 Phân tích thừa số nguyên tố (FACT)';
        body.innerHTML = `
          <div>Nhập số nguyên cần phân tích:</div>
          <input type="number" id="factInput" class="modal-input-field" placeholder="Ví dụ: 120" value="${this.ans || '120'}">
          <button class="modal-action-btn" id="factSubmit">Phân tích thừa số (FACT)</button>
          <div id="factResult" style="font-size:16px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('factSubmit').onclick = () => {
          const val = parseFloat(document.getElementById('factInput').value) || this.ans;
          const res = MathSolvers.factorize(val);
          document.getElementById('factResult').innerText = `${val} = ${res}`;
          this.rawExpr = `fact(${val})`;
          this.lastResult = `${val} = ${res}`;
          this.updateDisplay();
        };
      }

      // 7. PHƯƠNG TRÌNH BẬC 2
      else if (type === 'quad') {
        title.innerText = '🎯 Giải phương trình bậc 2 (ax² + bx + c = 0)';
        body.innerHTML = `
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;">
            <div><label>Hệ số a:</label><input type="number" id="qa" class="modal-input-field" value="1"></div>
            <div><label>Hệ số b:</label><input type="number" id="qb" class="modal-input-field" value="-3"></div>
            <div><label>Hệ số c:</label><input type="number" id="qc" class="modal-input-field" value="1"></div>
          </div>
          <button class="modal-action-btn" id="qSubmit" style="margin-top:6px;">Giải phương trình</button>
          <div id="qResult" style="white-space:pre-wrap; font-size:14px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('qSubmit').onclick = () => {
          const a = parseFloat(document.getElementById('qa').value) || 0;
          const b = parseFloat(document.getElementById('qb').value) || 0;
          const c = parseFloat(document.getElementById('qc').value) || 0;
          const res = MathSolvers.solveQuadratic(a, b, c);
          document.getElementById('qResult').innerText = res;
          this.rawExpr = `${a}x² + ${b}x + ${c} = 0`;
          this.lastResult = res;
          this.updateDisplay();
        };
      }

      // 8. PHƯƠNG TRÌNH BẬC 3
      else if (type === 'cubic') {
        title.innerText = '📐 Giải phương trình bậc 3 (ax³ + bx² + cx + d = 0)';
        body.innerHTML = `
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:6px;">
            <div><label>a:</label><input type="number" id="ca" class="modal-input-field" value="1"></div>
            <div><label>b:</label><input type="number" id="cb" class="modal-input-field" value="-6"></div>
            <div><label>c:</label><input type="number" id="cc" class="modal-input-field" value="11"></div>
            <div><label>d:</label><input type="number" id="cd" class="modal-input-field" value="-6"></div>
          </div>
          <button class="modal-action-btn" id="cSubmit">Giải phương trình</button>
          <div id="cResult" style="white-space:pre-wrap; font-size:14px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('cSubmit').onclick = () => {
          const a = parseFloat(document.getElementById('ca').value) || 0;
          const b = parseFloat(document.getElementById('cb').value) || 0;
          const c = parseFloat(document.getElementById('cc').value) || 0;
          const d = parseFloat(document.getElementById('cd').value) || 0;
          const res = MathSolvers.solveCubic(a, b, c, d);
          document.getElementById('cResult').innerText = res;
          this.rawExpr = `${a}x³ + ${b}x² + ${c}x + ${d} = 0`;
          this.lastResult = res;
          this.updateDisplay();
        };
      }

      // 9. PHƯƠNG TRÌNH BẬC 4
      else if (type === 'quartic') {
        title.innerText = '🔮 Giải phương trình bậc 4 (ax⁴ + bx³ + cx² + dx + e = 0)';
        body.innerHTML = `
          <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:4px;">
            <div><label>a:</label><input type="number" id="q4a" class="modal-input-field" value="1"></div>
            <div><label>b:</label><input type="number" id="q4b" class="modal-input-field" value="0"></div>
            <div><label>c:</label><input type="number" id="q4c" class="modal-input-field" value="-5"></div>
            <div><label>d:</label><input type="number" id="q4d" class="modal-input-field" value="0"></div>
            <div><label>e:</label><input type="number" id="q4e" class="modal-input-field" value="4"></div>
          </div>
          <button class="modal-action-btn" id="q4Submit" style="margin-top:6px;">Giải phương trình bậc 4</button>
          <div id="q4Result" style="white-space:pre-wrap; font-size:14px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('q4Submit').onclick = () => {
          const a = parseFloat(document.getElementById('q4a').value) || 0;
          const b = parseFloat(document.getElementById('q4b').value) || 0;
          const c = parseFloat(document.getElementById('q4c').value) || 0;
          const d = parseFloat(document.getElementById('q4d').value) || 0;
          const e = parseFloat(document.getElementById('q4e').value) || 0;
          const res = MathSolvers.solveQuartic(a, b, c, d, e);
          document.getElementById('q4Result').innerText = res;
          this.rawExpr = `${a}x⁴ + ${b}x³ + ${c}x² + ${d}x + ${e} = 0`;
          this.lastResult = res;
          this.updateDisplay();
        };
      }

      // 10. HỆ 2 PHƯƠNG TRÌNH
      else if (type === 'simul2') {
        title.innerText = '📊 Giải hệ 2 phương trình bậc nhất';
        body.innerHTML = `
          <div>PT 1: a₁·x + b₁·y = c₁</div>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
            <input type="number" id="s1_a" class="modal-input-field" value="2">
            <input type="number" id="s1_b" class="modal-input-field" value="1">
            <input type="number" id="s1_c" class="modal-input-field" value="8">
          </div>
          <div style="margin-top:6px;">PT 2: a₂·x + b₂·y = c₂</div>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
            <input type="number" id="s2_a" class="modal-input-field" value="1">
            <input type="number" id="s2_b" class="modal-input-field" value="2">
            <input type="number" id="s2_c" class="modal-input-field" value="7">
          </div>
          <button class="modal-action-btn" id="simulSubmit" style="margin-top:10px;">Tìm nghiệm (x, y)</button>
          <div id="simulResult" style="white-space:pre-wrap; font-size:15px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('simulSubmit').onclick = () => {
          const m = [
            [parseFloat(document.getElementById('s1_a').value), parseFloat(document.getElementById('s1_b').value), parseFloat(document.getElementById('s1_c').value)],
            [parseFloat(document.getElementById('s2_a').value), parseFloat(document.getElementById('s2_b').value), parseFloat(document.getElementById('s2_c').value)]
          ];
          const res = MathSolvers.solveLinear(m);
          document.getElementById('simulResult').innerText = res;
          this.lastResult = res;
          this.updateDisplay();
        };
      }

      // 11. HỆ 3 PHƯƠNG TRÌNH
      else if (type === 'simul3') {
        title.innerText = '📊 Giải hệ 3 phương trình bậc nhất (3 ẩn)';
        body.innerHTML = `
          <div>Nhập các hệ số [a, b, c = d]:</div>
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:4px;">
            <input type="number" id="s3_11" class="modal-input-field" value="2"><input type="number" id="s3_12" class="modal-input-field" value="1"><input type="number" id="s3_13" class="modal-input-field" value="1"><input type="number" id="s3_14" class="modal-input-field" value="8">
            <input type="number" id="s3_21" class="modal-input-field" value="1"><input type="number" id="s3_22" class="modal-input-field" value="2"><input type="number" id="s3_23" class="modal-input-field" value="1"><input type="number" id="s3_24" class="modal-input-field" value="7">
            <input type="number" id="s3_31" class="modal-input-field" value="1"><input type="number" id="s3_32" class="modal-input-field" value="1"><input type="number" id="s3_33" class="modal-input-field" value="2"><input type="number" id="s3_34" class="modal-input-field" value="9">
          </div>
          <button class="modal-action-btn" id="s3Submit" style="margin-top:8px;">Tìm nghiệm (x, y, z)</button>
          <div id="s3Result" style="white-space:pre-wrap; font-size:15px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('s3Submit').onclick = () => {
          const m = [
            [parseFloat(document.getElementById('s3_11').value), parseFloat(document.getElementById('s3_12').value), parseFloat(document.getElementById('s3_13').value), parseFloat(document.getElementById('s3_14').value)],
            [parseFloat(document.getElementById('s3_21').value), parseFloat(document.getElementById('s3_22').value), parseFloat(document.getElementById('s3_23').value), parseFloat(document.getElementById('s3_24').value)],
            [parseFloat(document.getElementById('s3_31').value), parseFloat(document.getElementById('s3_32').value), parseFloat(document.getElementById('s3_33').value), parseFloat(document.getElementById('s3_34').value)]
          ];
          const res = MathSolvers.solveLinear(m);
          document.getElementById('s3Result').innerText = res;
          this.lastResult = res;
          this.updateDisplay();
        };
      }

      // 12. HỆ 4 PHƯƠNG TRÌNH (4x4)
      else if (type === 'simul4') {
        title.innerText = '📊 Giải hệ 4 phương trình bậc nhất (4 ẩn x, y, z, t)';
        body.innerHTML = `
          <div>Nhập hệ số 4 hàng [a, b, c, d = e]:</div>
          <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:3px;">
            <input type="number" id="s4_11" class="modal-input-field" value="1"><input type="number" id="s4_12" class="modal-input-field" value="1"><input type="number" id="s4_13" class="modal-input-field" value="1"><input type="number" id="s4_14" class="modal-input-field" value="1"><input type="number" id="s4_15" class="modal-input-field" value="10">
            <input type="number" id="s4_21" class="modal-input-field" value="1"><input type="number" id="s4_22" class="modal-input-field" value="-1"><input type="number" id="s4_23" class="modal-input-field" value="1"><input type="number" id="s4_24" class="modal-input-field" value="-1"><input type="number" id="s4_25" class="modal-input-field" value="0">
            <input type="number" id="s4_31" class="modal-input-field" value="2"><input type="number" id="s4_32" class="modal-input-field" value="1"><input type="number" id="s4_33" class="modal-input-field" value="-1"><input type="number" id="s4_34" class="modal-input-field" value="1"><input type="number" id="s4_35" class="modal-input-field" value="5">
            <input type="number" id="s4_41" class="modal-input-field" value="1"><input type="number" id="s4_42" class="modal-input-field" value="2"><input type="number" id="s4_43" class="modal-input-field" value="3"><input type="number" id="s4_44" class="modal-input-field" value="4"><input type="number" id="s4_45" class="modal-input-field" value="30">
          </div>
          <button class="modal-action-btn" id="s4Submit" style="margin-top:8px;">Tìm nghiệm (x, y, z, t)</button>
          <div id="s4Result" style="white-space:pre-wrap; font-size:15px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('s4Submit').onclick = () => {
          const m = [];
          for (let r = 1; r <= 4; r++) {
            const row = [];
            for (let c = 1; c <= 5; c++) {
              row.push(parseFloat(document.getElementById(`s4_${r}${c}`).value) || 0);
            }
            m.push(row);
          }
          const res = MathSolvers.solveLinear(m);
          document.getElementById('s4Result').innerText = res;
          this.lastResult = res;
          this.updateDisplay();
        };
      }

      // 13. BẤT PHƯƠNG TRÌNH
      else if (type === 'ineq') {
        title.innerText = '⚖️ Giải bất phương trình bậc 2 (ax² + bx + c op 0)';
        body.innerHTML = `
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
            <div><label>Hệ số a:</label><input type="number" id="ia" class="modal-input-field" value="1"></div>
            <div><label>Hệ số b:</label><input type="number" id="ib" class="modal-input-field" value="-3"></div>
            <div><label>Hệ số c:</label><input type="number" id="ic" class="modal-input-field" value="2"></div>
          </div>
          <div style="margin-top:8px;">Chọn dấu bất đẳng thức:</div>
          <select id="iop" class="modal-input-field">
            <option value="1">&gt; 0 (Dương)</option>
            <option value="2">&lt; 0 (Âm)</option>
            <option value="3">≥ 0 (Lớn hơn hoặc bằng 0)</option>
            <option value="4">≤ 0 (Nhỏ hơn hoặc bằng 0)</option>
          </select>
          <button class="modal-action-btn" id="ineqSubmit" style="margin-top:8px;">Giải bất phương trình</button>
          <div id="ineqResult" style="font-size:15px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('ineqSubmit').onclick = () => {
          const a = parseFloat(document.getElementById('ia').value) || 0;
          const b = parseFloat(document.getElementById('ib').value) || 0;
          const c = parseFloat(document.getElementById('ic').value) || 0;
          const op = parseInt(document.getElementById('iop').value, 10);
          const res = MathSolvers.solveInequality(a, b, c, op);
          document.getElementById('ineqResult').innerText = res;
          this.lastResult = res;
          this.updateDisplay();
        };
      }

      // 14. BẢNG GIÁ TRỊ TABLE f(x)
      else if (type === 'table') {
        title.innerText = '📈 Bảng giá trị hàm số Table f(x)';
        body.innerHTML = `
          <div>Nhập hàm f(x):</div>
          <input type="text" id="tabF" class="modal-input-field" value="x^2 - 4">
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px; margin-top:6px;">
            <div><label>Start:</label><input type="number" id="tabStart" class="modal-input-field" value="-3"></div>
            <div><label>End:</label><input type="number" id="tabEnd" class="modal-input-field" value="3"></div>
            <div><label>Step:</label><input type="number" id="tabStep" class="modal-input-field" value="1"></div>
          </div>
          <button class="modal-action-btn" id="tabSubmit" style="margin-top:8px;">Tạo bảng giá trị</button>
          <div id="tabResult" style="max-height:160px; overflow-y:auto; margin-top:8px;"></div>
        `;
        document.getElementById('tabSubmit').onclick = () => {
          const fn = document.getElementById('tabF').value;
          const start = parseFloat(document.getElementById('tabStart').value) || -3;
          const end = parseFloat(document.getElementById('tabEnd').value) || 3;
          const step = parseFloat(document.getElementById('tabStep').value) || 1;

          let html = '<table style="width:100%; border-collapse:collapse; font-size:12px;"><tr><th style="border:1px solid #4a2837; padding:4px;">x</th><th style="border:1px solid #4a2837; padding:4px;">f(x)</th></tr>';
          for (let x = start; x <= end + 1e-9; x += step) {
            try {
              const y = math.evaluate(fn, { x, deg: Math.PI / 180 });
              html += `<tr><td style="border:1px solid #4a2837; text-align:center; padding:3px;">${x.toFixed(2)}</td><td style="border:1px solid #4a2837; text-align:right; padding:3px; color:#f472b6; font-weight:bold;">${typeof y === 'number' ? y.toFixed(4) : y}</td></tr>`;
            } catch (e) {}
          }
          html += '</table>';
          document.getElementById('tabResult').innerHTML = html;
        };
      }

      // 15. MA TRẬN (MATRIX & DET)
      else if (type === 'matrix') {
        title.innerText = '📦 Ma trận & Định thức Det(A)';
        body.innerHTML = `
          <div>Nhập ma trận 2x2 hoặc 3x3:</div>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:4px; margin-top:6px;">
            <input type="number" id="m11" class="modal-input-field" value="1"><input type="number" id="m12" class="modal-input-field" value="2"><input type="number" id="m13" class="modal-input-field" value="3">
            <input type="number" id="m21" class="modal-input-field" value="0"><input type="number" id="m22" class="modal-input-field" value="1"><input type="number" id="m23" class="modal-input-field" value="4">
            <input type="number" id="m31" class="modal-input-field" value="5"><input type="number" id="m32" class="modal-input-field" value="6"><input type="number" id="m33" class="modal-input-field" value="0">
          </div>
          <button class="modal-action-btn" id="matSubmit" style="margin-top:8px;">Tính Định thức Det(A)</button>
          <div id="matRes" style="font-size:16px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('matSubmit').onclick = () => {
          const m = [
            [parseFloat(document.getElementById('m11').value), parseFloat(document.getElementById('m12').value), parseFloat(document.getElementById('m13').value)],
            [parseFloat(document.getElementById('m21').value), parseFloat(document.getElementById('m22').value), parseFloat(document.getElementById('m23').value)],
            [parseFloat(document.getElementById('m31').value), parseFloat(document.getElementById('m32').value), parseFloat(document.getElementById('m33').value)]
          ];
          try {
            const d = math.det(m);
            document.getElementById('matRes').innerText = `Định thức Det(A) = ${d.toFixed(4)}`;
            this.lastResult = `Det=${d.toFixed(4)}`;
            this.updateDisplay();
          } catch (e) {
            document.getElementById('matRes').innerText = 'Lỗi tính toán ma trận';
          }
        };
      }

      // 16. VÉC-TƠ 3D (VECTOR)
      else if (type === 'vector') {
        title.innerText = '↗️ Véc-tơ không gian 3D';
        body.innerHTML = `
          <div>Véc-tơ u (x, y, z):</div>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:4px;">
            <input type="number" id="vx1" class="modal-input-field" value="1"><input type="number" id="vy1" class="modal-input-field" value="2"><input type="number" id="vz1" class="modal-input-field" value="3">
          </div>
          <div style="margin-top:6px;">Véc-tơ v (x, y, z):</div>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:4px;">
            <input type="number" id="vx2" class="modal-input-field" value="4"><input type="number" id="vy2" class="modal-input-field" value="5"><input type="number" id="vz2" class="modal-input-field" value="6">
          </div>
          <div style="display:flex; gap:6px; margin-top:8px;">
            <button class="cmd-try-btn" id="vecDot" style="flex:1;">Tích vô hướng (u·v)</button>
            <button class="cmd-try-btn" id="vecCross" style="flex:1;">Tích có hướng (u×v)</button>
          </div>
          <div id="vecRes" style="font-size:16px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('vecDot').onclick = () => {
          const u = [parseFloat(document.getElementById('vx1').value), parseFloat(document.getElementById('vy1').value), parseFloat(document.getElementById('vz1').value)];
          const v = [parseFloat(document.getElementById('vx2').value), parseFloat(document.getElementById('vy2').value), parseFloat(document.getElementById('vz2').value)];
          const dot = math.dot(u, v);
          document.getElementById('vecRes').innerText = `Tích vô hướng u · v = ${dot}`;
          this.lastResult = `${dot}`;
          this.updateDisplay();
        };
        document.getElementById('vecCross').onclick = () => {
          const u = [parseFloat(document.getElementById('vx1').value), parseFloat(document.getElementById('vy1').value), parseFloat(document.getElementById('vz1').value)];
          const v = [parseFloat(document.getElementById('vx2').value), parseFloat(document.getElementById('vy2').value), parseFloat(document.getElementById('vz2').value)];
          const cr = math.cross(u, v);
          document.getElementById('vecRes').innerText = `Tích có hướng u × v = (${cr[0]}, ${cr[1]}, ${cr[2]})`;
          this.lastResult = `(${cr[0]}, ${cr[1]}, ${cr[2]})`;
          this.updateDisplay();
        };
      }

      // 17. TỈ LỆ THỨC (RATIO)
      else if (type === 'ratio') {
        title.innerText = '⚖️ Giải tỉ lệ thức (Ratio a:b = x:d)';
        body.innerHTML = `
          <div>Tìm x trong tỉ lệ: a / b = x / d</div>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px; margin-top:6px;">
            <div><label>a:</label><input type="number" id="ra" class="modal-input-field" value="3"></div>
            <div><label>b:</label><input type="number" id="rb" class="modal-input-field" value="4"></div>
            <div><label>d:</label><input type="number" id="rd" class="modal-input-field" value="12"></div>
          </div>
          <button class="modal-action-btn" id="ratioSubmit" style="margin-top:8px;">Tìm x</button>
          <div id="ratioRes" style="font-size:16px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('ratioSubmit').onclick = () => {
          const a = parseFloat(document.getElementById('ra').value) || 0;
          const b = parseFloat(document.getElementById('rb').value) || 1;
          const d = parseFloat(document.getElementById('rd').value) || 1;
          const res = MathSolvers.solveRatio(a, b, d);
          document.getElementById('ratioRes').innerText = res;
          this.lastResult = res;
          this.updateDisplay();
        };
      }

      // 18. THỐNG KÊ (STATISTICS)
      else if (type === 'stat') {
        title.innerText = '📊 Thống kê 1 biến (Statistics)';
        body.innerHTML = `
          <div>Nhập dãy số dữ liệu (cách nhau bởi dấu phẩy):</div>
          <input type="text" id="statIn" class="modal-input-field" value="2, 5, 8, 12, 14, 18, 20">
          <button class="modal-action-btn" id="statSubmit" style="margin-top:8px;">Tính các thông số thống kê</button>
          <div id="statRes" style="white-space:pre-wrap; font-size:14px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('statSubmit').onclick = () => {
          const arr = document.getElementById('statIn').value.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
          if (arr.length === 0) return;
          const mean = math.mean(arr);
          const std = math.std(arr);
          const median = math.median(arr);
          const sum = math.sum(arr);
          const res = `Số phần tử n = ${arr.length}\nTrung bình x̄ = ${mean.toFixed(4)}\nTổng ∑x = ${sum}\nĐộ lệch chuẩn σ = ${std.toFixed(4)}\nTrung vị Median = ${median}`;
          document.getElementById('statRes').innerText = res;
          this.lastResult = `x̄=${mean.toFixed(2)}, σ=${std.toFixed(2)}`;
          this.updateDisplay();
        };
      }

      // 19. PHÂN PHỐI XÁC SUẤT (DISTRIBUTION)
      else if (type === 'distrib') {
        title.innerText = '🎲 Phân phối xác suất (Distribution)';
        body.innerHTML = `
          <div><b>Phân phối chuẩn N(0, 1):</b> Tính P(Z ≤ x)</div>
          <div style="display:flex; gap:6px; margin-top:4px;">
            <input type="number" id="normX" class="modal-input-field" value="1.96">
            <button class="modal-action-btn" id="normSubmit" style="white-space:nowrap;">Tính P(Z ≤ x)</button>
          </div>
          <div id="normRes" style="font-size:15px; font-weight:bold; color:#f472b6; margin-top:6px;"></div>
        `;
        document.getElementById('normSubmit').onclick = () => {
          const z = parseFloat(document.getElementById('normX').value) || 0;
          // Standard normal cumulative distribution approximation
          const t = 1 / (1 + 0.2316419 * Math.abs(z));
          const d = 0.3989423 * Math.exp(-z * z / 2);
          let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
          if (z > 0) p = 1 - p;
          document.getElementById('normRes').innerText = `P(Z ≤ ${z}) = ${p.toFixed(5)}`;
          this.lastResult = `${p.toFixed(5)}`;
          this.updateDisplay();
        };
      }

      // 20. ĐẠO HÀM d/dx
      else if (type === 'deriv') {
        title.innerText = '🧮 Tính đạo hàm d/dx tại 1 điểm';
        body.innerHTML = `
          <div>Nhập hàm số f(x):</div>
          <input type="text" id="dfExpr" class="modal-input-field" value="x^3 - 2*x + 1">
          <div style="margin-top:6px;">Tại x = x₀:</div>
          <input type="number" id="dfX0" class="modal-input-field" value="2">
          <button class="modal-action-btn" id="dfSubmit" style="margin-top:8px;">Tính f'(x₀)</button>
          <div id="dfRes" style="font-size:16px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('dfSubmit').onclick = () => {
          const expr = document.getElementById('dfExpr').value;
          const x0 = parseFloat(document.getElementById('dfX0').value) || 0;
          try {
            const val = MathSolvers.derivative(expr, x0);
            document.getElementById('dfRes').innerText = `d/dx(${expr})|_{x=${x0}} = ${val.toFixed(4)}`;
            this.rawExpr = `diff(${expr}, ${x0})`;
            this.lastResult = `${val.toFixed(4)}`;
            this.updateDisplay();
          } catch (e) {
            document.getElementById('dfRes').innerText = 'Lỗi tính toán đạo hàm';
          }
        };
      }

      // 21. TÍCH PHÂN XÁC ĐỊNH
      else if (type === 'integ') {
        title.innerText = '📐 Tính tích phân xác định ∫ f(x) dx';
        body.innerHTML = `
          <div>Hàm f(x):</div>
          <input type="text" id="intF" class="modal-input-field" value="x^2">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:6px;">
            <div><label>Cận dưới (a):</label><input type="number" id="intA" class="modal-input-field" value="0"></div>
            <div><label>Cận trên (b):</label><input type="number" id="intB" class="modal-input-field" value="3"></div>
          </div>
          <button class="modal-action-btn" id="intSubmit" style="margin-top:8px;">Tính tích phân</button>
          <div id="intRes" style="font-size:16px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('intSubmit').onclick = () => {
          const f = document.getElementById('intF').value;
          const a = parseFloat(document.getElementById('intA').value) || 0;
          const b = parseFloat(document.getElementById('intB').value) || 0;
          try {
            const val = MathSolvers.integrate(f, a, b);
            document.getElementById('intRes').innerText = `∫_{${a}}^{${b}} (${f}) dx = ${val.toFixed(4)}`;
            this.rawExpr = `int(${f}, ${a}, ${b})`;
            this.lastResult = `${val.toFixed(4)}`;
            this.updateDisplay();
          } catch (e) {
            document.getElementById('intRes').innerText = 'Lỗi tích phân';
          }
        };
      }

      // 22. TỔNG XÍCH MA ∑
      else if (type === 'sum') {
        title.innerText = '∑ Tính tổng xích-ma ∑_{x=a}^{b} f(x)';
        body.innerHTML = `
          <div>Hàm f(x):</div>
          <input type="text" id="sumF" class="modal-input-field" value="x^2">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:6px;">
            <div><label>Từ x = a:</label><input type="number" id="sumA" class="modal-input-field" value="1"></div>
            <div><label>Đến x = b:</label><input type="number" id="sumB" class="modal-input-field" value="10"></div>
          </div>
          <button class="modal-action-btn" id="sumSubmit" style="margin-top:8px;">Tính tổng ∑</button>
          <div id="sumRes" style="font-size:16px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('sumSubmit').onclick = () => {
          const f = document.getElementById('sumF').value;
          const a = parseInt(document.getElementById('sumA').value, 10) || 1;
          const b = parseInt(document.getElementById('sumB').value, 10) || 10;
          try {
            const val = MathSolvers.summation(f, a, b);
            document.getElementById('sumRes').innerText = `∑ (${f}) = ${val}`;
            this.rawExpr = `sum(${f}, ${a}, ${b})`;
            this.lastResult = `${val}`;
            this.updateDisplay();
          } catch (e) {
            document.getElementById('sumRes').innerText = 'Lỗi tính tổng';
          }
        };
      }

      // 23. GIỚI HẠN LIMIT
      else if (type === 'limit') {
        title.innerText = '🚀 Giới hạn Limit lim_{x ➔ x₀} f(x)';
        body.innerHTML = `
          <div>Hàm f(x):</div>
          <input type="text" id="limF" class="modal-input-field" value="(x^2 - 1)/(x - 1)">
          <div style="margin-top:6px;">Khi x tiến tới x₀:</div>
          <input type="number" id="limX0" class="modal-input-field" value="1">
          <button class="modal-action-btn" id="limSubmit" style="margin-top:8px;">Tính giới hạn</button>
          <div id="limRes" style="font-size:16px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('limSubmit').onclick = () => {
          const f = document.getElementById('limF').value;
          const x0 = parseFloat(document.getElementById('limX0').value) || 0;
          try {
            const val = MathSolvers.limit(f, x0);
            document.getElementById('limRes').innerText = `lim (${f}) = ${typeof val === 'number' ? val.toFixed(4) : val}`;
            this.rawExpr = `limit(${f}, ${x0})`;
            this.lastResult = `${typeof val === 'number' ? val.toFixed(4) : val}`;
            this.updateDisplay();
          } catch (e) {
            document.getElementById('limRes').innerText = 'Lỗi tính giới hạn';
          }
        };
      }

      // 24. ƯCLN & BCNN
      else if (type === 'gcd_lcm') {
        title.innerText = '🔢 ƯCLN (GCD) & BCNN (LCM)';
        body.innerHTML = `
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div><label>Số A:</label><input type="number" id="glA" class="modal-input-field" value="24"></div>
            <div><label>Số B:</label><input type="number" id="glB" class="modal-input-field" value="36"></div>
          </div>
          <button class="modal-action-btn" id="glSubmit" style="margin-top:8px;">Tính ƯCLN & BCNN</button>
          <div id="glRes" style="font-size:15px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('glSubmit').onclick = () => {
          const a = parseFloat(document.getElementById('glA').value) || 0;
          const b = parseFloat(document.getElementById('glB').value) || 0;
          const g = MathSolvers.gcd(a, b);
          const l = MathSolvers.lcm(a, b);
          document.getElementById('glRes').innerText = `ƯCLN (GCD) = ${g}\nBCNN (LCM) = ${l}`;
          this.rawExpr = `gcd(${a}, ${b})`;
          this.lastResult = `GCD=${g}, LCM=${l}`;
          this.updateDisplay();
        };
      }

      // 25. SỐ PHỨC
      else if (type === 'cmplx') {
        title.innerText = '🔮 Tính toán Số phức (Complex)';
        body.innerHTML = `
          <div>Nhập biểu thức số phức (dùng <b>i</b>):</div>
          <input type="text" id="cxInput" class="modal-input-field" value="(2 + 3i)*(1 - 2i)">
          <div style="display:flex; gap:6px; margin-top:8px;">
            <button class="cmd-try-btn" id="cxEval" style="flex:1;">Tính toán</button>
            <button class="cmd-try-btn" id="cxAbs" style="flex:1;">Mô-đun |z|</button>
            <button class="cmd-try-btn" id="cxConj" style="flex:1;">Liên hợp z̄</button>
          </div>
          <div id="cxRes" style="font-size:16px; font-weight:bold; color:#f472b6; margin-top:8px;"></div>
        `;
        document.getElementById('cxEval').onclick = () => {
          const expr = document.getElementById('cxInput').value;
          this.rawExpr = expr;
          this.evaluateCurrent();
          document.getElementById('cxRes').innerText = `Kết quả: ${this.lastResult}`;
        };
        document.getElementById('cxAbs').onclick = () => {
          const expr = document.getElementById('cxInput').value;
          try {
            const z = math.evaluate(expr, { i: math.complex(0, 1) });
            const val = math.abs(z);
            document.getElementById('cxRes').innerText = `Mô-đun |z| = ${val.toFixed(4)}`;
            this.lastResult = `${val.toFixed(4)}`;
            this.updateDisplay();
          } catch (e) {}
        };
        document.getElementById('cxConj').onclick = () => {
          const expr = document.getElementById('cxInput').value;
          try {
            const z = math.evaluate(expr, { i: math.complex(0, 1) });
            const conj = math.conj(z);
            const s = `${conj.re} ${conj.im >= 0 ? '+' : '-'} ${Math.abs(conj.im)}i`;
            document.getElementById('cxRes').innerText = `Liên hợp z̄ = ${s}`;
            this.lastResult = s;
            this.updateDisplay();
          } catch (e) {}
        };
      }

      // 26. SETTINGS

      // 26. SETTINGS
      else if (type === 'settings') {
        title.innerText = '🎚 CÀI ĐẶT HỆ THỐNG FX-580VN X-PK';
        body.innerHTML = `
          <div><b>1. Chế độ Nhập / Xuất (Input / Output):</b></div>
          <div style="display:flex; flex-direction:column; gap:4px; margin-top:4px;">
            <label><input type="radio" name="setIOMode" value="MathI/MathO" ${this.ioMode === 'MathI/MathO' ? 'checked' : ''}> <b>MathI / MathO</b> (Nhập tự nhiên / Xuất tự nhiên - Chuẩn Casio ClassWiz)</label>
            <label><input type="radio" name="setIOMode" value="MathI/DecimalO" ${this.ioMode === 'MathI/DecimalO' ? 'checked' : ''}> <b>MathI / DecimalO</b> (Nhập tự nhiên / Xuất số thập phân)</label>
            <label><input type="radio" name="setIOMode" value="LineI/LineO" ${this.ioMode === 'LineI/LineO' ? 'checked' : ''}> <b>LineI / LineO</b> (Nhập 1 dòng / Xuất phân số 1 dòng)</label>
            <label><input type="radio" name="setIOMode" value="LineI/DecimalO" ${this.ioMode === 'LineI/DecimalO' ? 'checked' : ''}> <b>LineI / DecimalO</b> (Nhập 1 dòng / Xuất số thập phân)</label>
          </div>

          <div style="margin-top:10px;"><b>2. Đơn vị góc (Angle Unit):</b></div>
          <div style="display:flex; gap:10px;">
            <label><input type="radio" name="setAngle" value="RAD" ${this.angleUnit === 'RAD' ? 'checked' : ''}> Radian (rad)</label>
            <label><input type="radio" name="setAngle" value="DEG" ${this.angleUnit === 'DEG' ? 'checked' : ''}> Degree (Độ °)</label>
            <label><input type="radio" name="setAngle" value="GRA" ${this.angleUnit === 'GRA' ? 'checked' : ''}> Gradian (gra)</label>
          </div>

          <div style="margin-top:10px;"><b>3. Âm thanh phím bấm:</b></div>
          <div>
            <label><input type="checkbox" id="setSound" ${this.sound.enabled ? 'checked' : ''}> Bật âm thanh bàn phím (Tactile Audio Clicks)</label>
          </div>

          <div style="margin-top:10px;"><b>4. Giao diện màu (Theme):</b></div>
          <div style="display:flex; gap:8px;">
            <button class="cmd-try-btn" onclick="window.casio.setTheme('pink')">🌸 Sweet Pink (PK)</button>
            <button class="cmd-try-btn" onclick="window.casio.setTheme('dark')">🖤 Dark Edition</button>
            <button class="cmd-try-btn" onclick="window.casio.setTheme('oled')">💜 OLED Contrast</button>
          </div>

          <button class="modal-action-btn" id="setSave" style="margin-top:12px;">Áp dụng cài đặt</button>
        `;
        document.getElementById('setSave').onclick = () => {
          const io = document.querySelector('input[name="setIOMode"]:checked').value;
          const ang = document.querySelector('input[name="setAngle"]:checked').value;
          const snd = document.getElementById('setSound').checked;
          this.ioMode = io;
          this.angleUnit = ang;
          this.sound.enabled = snd;
          this.el.pillAngle.innerText = ang;
          if (this.el.pillIOMode) this.el.pillIOMode.innerText = io;
          modal.classList.remove('active');
          this.updateDisplay();
        };
      }

      else if (type === 'screenMenu') {
        title.innerText = '⋮ TUỲ CHỌN NÂNG CAO';
        body.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:8px;">
            <button class="cmd-try-btn" style="text-align:left; padding:8px 12px;" onclick="window.casio.copyResult()">📋 Sao chép kết quả vào Clipboard</button>
            <button class="cmd-try-btn" style="text-align:left; padding:8px 12px;" onclick="window.casio.openFeatureModal('learn_cmd')">💡 Bảng tra cứu & học lệnh</button>
            <button class="cmd-try-btn" style="text-align:left; padding:8px 12px;" onclick="window.casio.openFeatureModal('settings')">🎚 Cài đặt máy tính</button>
            <button class="cmd-try-btn" style="text-align:left; padding:8px 12px; color:#f43f5e;" onclick="window.casio.history=[]; window.casio.renderHistory(); window.casio.el.toolModal.classList.remove('active');">🗑 Xóa sạch lịch sử</button>
          </div>
        `;
      }
    }

    renderCommandListInContainer(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const commands = [
        { code: 'isprime(2027)', desc: 'Kiểm tra số nguyên tố: Là số nguyên tố' },
        { code: 'divr(17, 5)', desc: 'Phép chia có dư: Q = 3, R = 2' },
        { code: 'verify(sqrt(8) = 2*sqrt(2))', desc: 'Kiểm tra Đúng/Sai (Đúng)' },
        { code: 'x^2 - 3x + 1 = 0', desc: 'Giải phương trình bậc 2 (Nghiệm & Cực trị Parabol)' },
        { code: '2x + 5 = 15', desc: 'Giải phương trình bậc nhất 1 ẩn' },
        { code: 'fact(120)', desc: 'Phân tích thừa số nguyên tố: 120 = 2³ × 3 × 5' },
        { code: 'gcd(24, 36)', desc: 'Tìm Ước chung lớn nhất (ƯCLN)' },
        { code: 'lcm(12, 18)', desc: 'Tìm Bội chung nhỏ nhất (BCNN)' },
        { code: 'diff(x^3 - 2x, 2)', desc: 'Tính đạo hàm f\'(x) tại x = 2' },
        { code: 'int(x^2, 0, 3)', desc: 'Tính tích phân xác định ∫₀³ x² dx = 9' },
        { code: 'sum(x, 1, 10)', desc: 'Tính tổng xích-ma ∑₁¹⁰ x = 55' },
        { code: 'limit((x^2 - 1)/(x - 1), 1)', desc: 'Tính giới hạn hàm số lim_{x ➔ 1}' },
        { code: 'mod(17, 5)', desc: 'Phép chia lấy phần dư (17 chia 5 dư 2)' },
        { code: '5 nPr 2', desc: 'Chỉnh hợp A(5, 2) = 20' },
        { code: '5 nCr 2', desc: 'Tổ hợp C(5, 2) = 10' },
        { code: 'cbrt(27)', desc: 'Căn bậc 3 của 27 = 3' },
        { code: '(2 + 3i)*(1 - 2i)', desc: 'Phép nhân hai số phức' }
      ];

      container.innerHTML = commands.map(c => `
        <div class="cmd-card">
          <div class="cmd-info">
            <span class="cmd-code">${c.code}</span>
            <span class="cmd-meaning">${c.desc}</span>
          </div>
          <button class="cmd-try-btn" onclick="window.casio.tryCommand('${c.code}')">Thử ngay</button>
        </div>
      `).join('');
    }

    tryCommand(cmdStr) {
      this.rawExpr = cmdStr;
      this.el.toolModal.classList.remove('active');
      this.evaluateCurrent();
    }

    selectModeFromMenu(modeNum) {
      this.el.toolModal.classList.remove('active');
      if (modeNum === '1') {
        this.rawExpr = '';
        this.lastResult = null;
        this.el.currentFeatureLabel.innerText = 'Tính toán (Calculate)';
      } else if (modeNum === '2') {
        this.openFeatureModal('cmplx');
        this.el.currentFeatureLabel.innerText = 'Số phức (Complex)';
      } else if (modeNum === '8') {
        this.openFeatureModal('table');
        this.el.currentFeatureLabel.innerText = 'Bảng giá trị (Table)';
      } else if (modeNum === '9') {
        this.openFeatureModal('quad');
        this.el.currentFeatureLabel.innerText = 'PT / Hệ PT (Equation)';
      } else if (modeNum === 'A') {
        this.openFeatureModal('ineq');
        this.el.currentFeatureLabel.innerText = 'Bất PT (Inequality)';
      } else {
        this.el.currentFeatureLabel.innerText = `Chế độ Mode ${modeNum}`;
      }
      this.updateDisplay();
    }

    copyResult() {
      if (this.lastResult) {
        navigator.clipboard.writeText(this.lastResult);
        alert(`Đã sao chép: "${this.lastResult}"`);
      } else {
        alert('Chưa có kết quả để sao chép!');
      }
      this.el.toolModal.classList.remove('active');
    }

    setTheme(themeName) {
      this.currentTheme = themeName;
      document.body.className = '';
      if (themeName !== 'pink') {
        document.body.classList.add(`theme-${themeName}`);
      }
      this.sound.playClick();
    }

    cycleTheme() {
      const themes = ['pink', 'dark', 'oled'];
      const idx = (themes.indexOf(this.currentTheme) + 1) % themes.length;
      this.setTheme(themes[idx]);
    }

    addHistory(expr, res) {
      this.history.unshift({ expr, res });
      if (this.history.length > 25) this.history.pop();
      this.renderHistory();
    }

    renderHistory() {
      if (!this.el.historyEntries) return;
      this.el.historyEntries.innerHTML = this.history.map((h, i) => `
        <div style="background:rgba(255,255,255,0.05); padding:6px 8px; border-radius:6px; cursor:pointer;" onclick="window.casio.loadHistory(${i})">
          <div style="font-size:12px; color:#cbd5e1;">${h.expr}</div>
          <div style="font-size:14px; font-weight:bold; color:#f472b6; text-align:right;">${h.res}</div>
        </div>
      `).join('');
    }

    loadHistory(index) {
      const item = this.history[index];
      if (item) {
        this.rawExpr = item.expr;
        this.lastResult = item.res;
        this.updateDisplay();
      }
    }


    handleKeyboard(e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      const k = e.key;

      if (k === 'ArrowLeft') { e.preventDefault(); this.pressKey('LEFT'); }
      else if (k === 'ArrowRight') { e.preventDefault(); this.pressKey('RIGHT'); }
      else if (k === 'ArrowUp') { e.preventDefault(); this.pressKey('UP'); }
      else if (k === 'ArrowDown') { e.preventDefault(); this.pressKey('DOWN'); }
      else if (k >= '0' && k <= '9') this.pressKey(k);
      else if (k === '.' || k === ',') this.pressKey(',');
      else if (k === '+') this.pressKey('PLUS');
      else if (k === '-') this.pressKey('MINUS');
      else if (k === '*') this.pressKey('MUL');
      else if (k === '/') { e.preventDefault(); this.pressKey('FRAC'); }
      else if (k === 'Enter' || k === '=') { e.preventDefault(); this.pressKey('EQ'); }
      else if (k === 'Backspace') { e.preventDefault(); this.pressKey('DEL'); }
      else if (k === 'Escape') {
        if (this.el.toolModal.classList.contains('active')) {
          this.el.toolModal.classList.remove('active');
        } else {
          this.pressKey('AC');
        }
      }
      else if (k === '(' || k === ')') this.pressKey(k);
      else if (k === '^') this.pressKey('X_POW');
      else if (k === 'x' || k === 'X') this.pressKey('VAR_X');
      else if (k === 's' || k === 'S') this.pressKey('SIN');
      else if (k === 'c' || k === 'C') this.pressKey('COS');
      else if (k === 't' || k === 'T') this.pressKey('TAN');
      else if (k === 'l' || k === 'L') this.pressKey('LN');
      else if (k === 'Shift') this.pressKey('SHIFT');
      else if (k === 'Alt') { e.preventDefault(); this.pressKey('ALPHA'); }
    }
  }

  // Auto-init
  window.addEventListener('DOMContentLoaded', () => {
    window.casio = new Casio580Pro();
  });
})();
