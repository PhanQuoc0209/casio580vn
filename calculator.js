/**
 * CASIO fx-580VN X PRO - ENGINE & INTERACTIVE CONTROLLER
 * Full 12-Mode Menu, Interactive Command Learning ("Học lệnh"),
 * Complete mathematical solvers (Degree 2, 3, 4, Linear 2, 3 unknowns,
 * Inequality, Derivative, Integral, Limit, Sum, GCD, LCM, Complex, Table, Settings).
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

  // --- MATHEMATICAL SOLVERS ---
  const MathSolvers = {
    // Prime Factorization
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

    // Quadratic Solver: ax^2 + bx + c = 0
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

    // Cubic Solver: ax^3 + bx^2 + cx + d = 0
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

    // Quartic Solver: ax^4 + bx^3 + cx^2 + dx + e = 0 (Durand-Kerner method)
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

    // Linear System Solver
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

    // Quadratic Inequality Solver
    solveInequality(a, b, c, op) {
      // op: 1: >0, 2: <0, 3: >=0, 4: <=0
      if (Math.abs(a) < 1e-12) return 'a phải khác 0 cho BPT bậc 2';
      const delta = b * b - 4 * a * c;
      if (delta < -1e-12) {
        // Delta < 0: sign of f(x) is sign of a
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

    // GCD & LCM
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

    // Derivative f'(x0)
    derivative(fnStr, x0) {
      const h = 1e-6;
      const f1 = math.evaluate(fnStr, { x: x0 + h, deg: Math.PI / 180 });
      const f0 = math.evaluate(fnStr, { x: x0 - h, deg: Math.PI / 180 });
      return (f1 - f0) / (2 * h);
    },

    // Numerical Integral (Simpson's Rule)
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

    // Summation
    summation(fnStr, a, b) {
      let total = 0;
      for (let x = a; x <= b; x++) {
        total += math.evaluate(fnStr, { x, deg: Math.PI / 180 });
      }
      return total;
    },

    // Limit
    limit(fnStr, x0) {
      const h = 1e-6;
      const valPlus = math.evaluate(fnStr, { x: x0 + h, deg: Math.PI / 180 });
      const valMinus = math.evaluate(fnStr, { x: x0 - h, deg: Math.PI / 180 });
      if (Math.abs(valPlus - valMinus) < 1e-2) {
        return (valPlus + valMinus) / 2;
      }
      return valPlus;
    }
  };

  // --- CASIO 580 PRO CLASS ---
  class Casio580Pro {
    constructor() {
      this.sound = new SoundManager();

      this.rawExpr = '';
      this.lastResult = null;
      this.ans = 0;
      this.preAns = 0;

      this.isShift = false;
      this.isAlpha = false;

      this.angleUnit = 'RAD'; // 'RAD', 'DEG', 'GRA'
      this.formatMode = 'FRAC'; // 'FRAC', 'DEC'
      this.normMode = 'NORM'; // 'NORM', 'FIX', 'SCI'

      this.currentTheme = 'dark'; // 'dark', 'classic', 'oled'

      this.history = [];

      this.initDom();
      this.bindEvents();
      this.updateDisplay();
    }

    initDom() {
      this.el = {
        screenArea: document.getElementById('screenArea'),
        screenInput: document.getElementById('screenInput'),
        screenOutput: document.getElementById('screenOutput'),
        placeholderText: document.getElementById('placeholderText'),

        pillAngle: document.getElementById('pillAngle'),
        pillFormat: document.getElementById('pillFormat'),
        pillNorm: document.getElementById('pillNorm'),

        featureDropdownBtn: document.getElementById('featureDropdownBtn'),
        featureDropdownMenu: document.getElementById('featureDropdownMenu'),
        currentFeatureLabel: document.getElementById('currentFeatureLabel'),
        btnNewDoc: document.getElementById('btnNewDoc'),
        btnSaveDoc: document.getElementById('btnSaveDoc'),
        btnScreenMenu: document.getElementById('btnScreenMenu'),
        btnHelp: document.getElementById('btnHelp'),
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
      this.el.pillAngle.addEventListener('click', () => {
        const units = ['RAD', 'DEG', 'GRA'];
        const idx = (units.indexOf(this.angleUnit) + 1) % units.length;
        this.angleUnit = units[idx];
        this.el.pillAngle.innerText = this.angleUnit;
        this.sound.playClick();
      });

      this.el.pillFormat.addEventListener('click', () => {
        this.formatMode = this.formatMode === 'FRAC' ? 'DEC' : 'FRAC';
        this.el.pillFormat.innerText = this.formatMode;
        this.sound.playClick();
        if (this.lastResult) this.toggleFormat();
      });

      this.el.pillNorm.addEventListener('click', () => {
        const modes = ['NORM', 'FIX', 'SCI'];
        const idx = (modes.indexOf(this.normMode) + 1) % modes.length;
        this.normMode = modes[idx];
        this.el.pillNorm.innerText = this.normMode;
        this.sound.playClick();
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
        this.rawExpr = '';
        this.lastResult = null;
        this.updateDisplay();
      });

      this.el.btnSaveDoc.addEventListener('click', () => {
        this.sound.playClick();
        if (this.rawExpr && this.lastResult) {
          this.addHistory(this.rawExpr, this.lastResult);
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
        case '(':
        case ')':
          this.rawExpr += (keyId === ',' ? '.' : keyId);
          break;

        case 'PLUS': this.rawExpr += '+'; break;
        case 'MINUS': this.rawExpr += '-'; break;
        case 'MUL': this.rawExpr += '×'; break;
        case 'DIV': this.rawExpr += '÷'; break;

        case 'DEL':
          this.rawExpr = this.rawExpr.slice(0, -1);
          break;

        case 'AC':
          this.rawExpr = '';
          this.lastResult = null;
          break;

        case 'EQ':
          this.evaluateCurrent();
          return;

        case 'FRAC': this.rawExpr += '/'; break;
        case 'SQRT': this.rawExpr += '√('; break;
        case 'X2': this.rawExpr += '^2'; break;
        case 'X_POW': this.rawExpr += '^'; break;
        case 'LOG_BASE': this.rawExpr += 'log('; break;
        case 'LN': this.rawExpr += 'ln('; break;
        case 'NEG': this.rawExpr += '-'; break;
        case 'INV': this.rawExpr += '^-1'; break;
        case 'SIN': this.rawExpr += 'sin('; break;
        case 'COS': this.rawExpr += 'cos('; break;
        case 'TAN': this.rawExpr += 'tan('; break;
        case 'VAR_X': this.rawExpr += 'x'; break;
        case 'EXP': this.rawExpr += '×10^'; break;
        case 'ANS': this.rawExpr += 'Ans'; break;
        case 'SD': this.toggleFormat(); return;
        case 'MENU': this.openFeatureModal('menu'); return;
        case 'SETTINGS': this.openFeatureModal('settings'); return;
        case 'CALC': this.evaluateCurrent(); return;
        case 'INTEG': this.openFeatureModal('integ'); return;

        default:
          break;
      }

      this.updateDisplay();
    }

    handleShiftKey(keyId) {
      switch (keyId) {
        case 'CALC': this.openFeatureModal('quad'); return; // SOLVE
        case 'INTEG': this.openFeatureModal('deriv'); return; // d/dx
        case 'VAR_X': this.openFeatureModal('sum'); return; // ∑
        case 'SQRT': this.rawExpr += 'cbrt('; break;
        case 'X2': this.rawExpr += '^3'; break;
        case 'X_POW': this.rawExpr += 'nthRoot('; break;
        case 'LOG_BASE': this.rawExpr += '10^('; break;
        case 'LN': this.rawExpr += 'e^('; break;
        case 'NEG': this.rawExpr += 'log('; break;
        case 'DEG': this.openFeatureModal('fact'); return; // FACT
        case 'INV': this.rawExpr += '!'; break;
        case 'SIN': this.rawExpr += 'asin('; break;
        case 'COS': this.rawExpr += 'acos('; break;
        case 'TAN': this.rawExpr += 'atan('; break;
        case '7': this.rawExpr += 'CONST('; break;
        case '9': this.openFeatureModal('limit'); return;
        case 'MUL': this.rawExpr += ' nPr '; break;
        case 'DIV': this.rawExpr += ' nCr '; break;
        case '2': this.openFeatureModal('cmplx'); return;
        case 'PLUS': this.rawExpr += 'Pol('; break;
        case 'MINUS': this.rawExpr += 'Rec('; break;
        case ',': this.rawExpr += 'Ran#'; break;
        case 'EXP': this.rawExpr += 'π'; break;
        case 'ANS': this.rawExpr += '%'; break;
        default: break;
      }
      this.updateDisplay();
    }

    handleAlphaKey(keyId) {
      switch (keyId) {
        case 'CALC': this.rawExpr += ' = '; break;
        case 'INTEG': this.rawExpr += ':'; break;
        case 'FRAC': this.rawExpr += ' ÷R '; break;
        case 'X2': this.rawExpr += ' mod '; break;
        case 'X_POW': this.rawExpr += 'cot('; break;
        case 'LOG_BASE': this.rawExpr += 'acot('; break;
        case 'NEG': this.rawExpr += 'A'; break;
        case 'DEG': this.rawExpr += 'B'; break;
        case 'INV': this.rawExpr += 'C'; break;
        case 'SIN': this.rawExpr += 'D'; break;
        case 'COS': this.rawExpr += 'T'; break;
        case 'TAN': this.rawExpr += 'F'; break;
        case 'ENG': this.rawExpr += 'i'; break;
        case '(': this.rawExpr += 'x'; break;
        case ')': this.rawExpr += 'y'; break;
        case 'SD': this.rawExpr += 'z'; break;
        case 'M_PLUS': this.rawExpr += 'M'; break;
        case '9': this.rawExpr += 'Infinity'; break;
        case 'MUL': this.openFeatureModal('gcd_lcm'); return;
        case 'DIV': this.openFeatureModal('gcd_lcm'); return;
        case 'PLUS': this.rawExpr += 'ceil('; break;
        case 'MINUS': this.rawExpr += 'floor('; break;
        case 'EXP': this.rawExpr += 'e'; break;
        case 'ANS': this.rawExpr += 'PreAns'; break;
        default: break;
      }
      this.updateDisplay();
    }

    updateModifiersVisual() {
      const shiftBtn = document.querySelector('.btn-shift');
      const alphaBtn = document.querySelector('.btn-alpha');
      if (shiftBtn) shiftBtn.classList.toggle('active', this.isShift);
      if (alphaBtn) alphaBtn.classList.toggle('active', this.isAlpha);
    }

    // --- EVALUATION WITH COMMAND PARSER & SMART EQUATION SOLVER ---
    evaluateCurrent() {
      if (!this.rawExpr || this.rawExpr.trim() === '') return;

      const expr = this.rawExpr.trim();

      // 1. COMMAND PARSER ("HỌC LỆNH")
      // fact(n)
      const mFact = expr.match(/^(?:fact|FACT)\s*\(?(\d+)\)?$/);
      if (mFact) {
        const val = parseInt(mFact[1], 10);
        const res = `${val} = ` + MathSolvers.factorize(val);
        this.lastResult = res;
        this.addHistory(expr, res);
        this.updateDisplay();
        return;
      }

      // gcd(a, b)
      const mGcd = expr.match(/^(?:gcd|GCD)\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)$/);
      if (mGcd) {
        const res = MathSolvers.gcd(parseInt(mGcd[1], 10), parseInt(mGcd[2], 10));
        this.lastResult = `${res}`;
        this.addHistory(expr, `${res}`);
        this.updateDisplay();
        return;
      }

      // lcm(a, b)
      const mLcm = expr.match(/^(?:lcm|LCM)\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)$/);
      if (mLcm) {
        const res = MathSolvers.lcm(parseInt(mLcm[1], 10), parseInt(mLcm[2], 10));
        this.lastResult = `${res}`;
        this.addHistory(expr, `${res}`);
        this.updateDisplay();
        return;
      }

      // diff(f, x0) or d/dx(f, x0)
      const mDiff = expr.match(/^(?:diff|d\/dx)\s*\(\s*(.+?)\s*,\s*([-+]?\d*\.?\d+)\s*\)$/);
      if (mDiff) {
        try {
          const val = MathSolvers.derivative(mDiff[1], parseFloat(mDiff[2]));
          this.lastResult = `${val.toFixed(4)}`;
          this.addHistory(expr, this.lastResult);
          this.updateDisplay();
          return;
        } catch (e) {}
      }

      // int(f, a, b) or integrate(f, a, b)
      const mInt = expr.match(/^(?:int|integrate)\s*\(\s*(.+?)\s*,\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*\)$/);
      if (mInt) {
        try {
          const val = MathSolvers.integrate(mInt[1], parseFloat(mInt[2]), parseFloat(mInt[3]));
          this.lastResult = `${val.toFixed(4)}`;
          this.addHistory(expr, this.lastResult);
          this.updateDisplay();
          return;
        } catch (e) {}
      }

      // sum(f, a, b)
      const mSum = expr.match(/^(?:sum|sigma)\s*\(\s*(.+?)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
      if (mSum) {
        try {
          const val = MathSolvers.summation(mSum[1], parseInt(mSum[2], 10), parseInt(mSum[3], 10));
          this.lastResult = `${val}`;
          this.addHistory(expr, this.lastResult);
          this.updateDisplay();
          return;
        } catch (e) {}
      }

      // limit(f, x0)
      const mLim = expr.match(/^(?:limit|lim)\s*\(\s*(.+?)\s*,\s*([-+]?\d*\.?\d+)\s*\)$/);
      if (mLim) {
        try {
          const val = MathSolvers.limit(mLim[1], parseFloat(mLim[2]));
          this.lastResult = typeof val === 'number' ? `${val.toFixed(4)}` : `${val}`;
          this.addHistory(expr, this.lastResult);
          this.updateDisplay();
          return;
        } catch (e) {}
      }

      // 2. SMART EQUATION DETECTION: e.g. "x^2 - 3x + 1 = 0"
      if (expr.includes('=')) {
        this.solveSmartEquation(expr);
        return;
      }

      // 3. STANDARD CALCULATION
      try {
        let parsed = expr
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
          integrate: (fn, a, b) => MathSolvers.integrate(fn, a, b)
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
          this.ans = result.re;
        } else if (typeof result === 'number') {
          if (Math.abs(result - Math.round(result)) < 1e-12) {
            result = Math.round(result);
          } else {
            result = parseFloat(result.toPrecision(10));
          }
          this.preAns = this.ans;
          this.ans = result;

          if (this.formatMode === 'FRAC') {
            const frac = floatToFraction(result);
            this.lastResult = frac && frac.den > 1 ? frac.text : `${result}`;
          } else {
            this.lastResult = `${result}`;
          }
        } else {
          this.lastResult = `${result}`;
        }

        this.addHistory(this.rawExpr, this.lastResult);
      } catch (err) {
        this.lastResult = 'Cú pháp không hợp lệ (Syntax Error)';
        this.sound.playBeep();
      }

      this.updateDisplay();
    }

    solveSmartEquation(equationStr) {
      let eqClean = equationStr.replace(/^solve\s*\(/i, '').replace(/\)$/, '').trim();
      const parts = eqClean.split('=');
      if (parts.length !== 2) {
        this.lastResult = 'Phương trình không hợp lệ';
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
          this.addHistory(equationStr, quadResult.replace(/\n/g, ' | '));
          this.updateDisplay();
          return;
        }

        if (Math.abs(a) < 1e-6 && Math.abs(b) > 1e-6) {
          const xVal = -c / b;
          const res = `Nghiệm duy nhất: x = ${xVal.toFixed(4)}`;
          this.lastResult = res;
          this.addHistory(equationStr, res);
          this.updateDisplay();
          return;
        }

        this.lastResult = 'Đang giải phương trình...';
      } catch (e) {
        this.lastResult = 'Không thể giải tự động dạng này';
      }

      this.updateDisplay();
    }

    toggleFormat() {
      if (!this.ans && this.ans !== 0) return;
      const num = this.ans;
      const frac = floatToFraction(num);

      if (this.lastResult && this.lastResult.includes('/')) {
        this.lastResult = `${num}`;
      } else if (frac && frac.den > 1) {
        this.lastResult = frac.text;
      }
      this.updateDisplay();
    }

    updateDisplay() {
      if (this.rawExpr) {
        this.el.placeholderText.style.display = 'none';
        this.el.screenInput.innerText = this.rawExpr;
      } else {
        this.el.placeholderText.style.display = 'inline';
        this.el.screenInput.innerHTML = '';
        this.el.screenInput.appendChild(this.el.placeholderText);
      }

      this.el.screenOutput.innerText = this.lastResult !== null ? this.lastResult : '';
    }

    // --- MODAL FEATURES & TOOLS CONTROLLER ---
    openFeatureModal(type) {
      const modal = this.el.toolModal;
      const title = this.el.modalTitle;
      const body = this.el.modalBody;

      modal.classList.add('active');

      // 1. MENU CHÍNH (MODE SELECT GRID)
      if (type === 'menu') {
        title.innerText = '📋 MENU CHỌN CHẾ ĐỘ & HỌC LỆNH (MODE)';
        body.innerHTML = `
          <div style="display:flex; gap:8px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px; margin-bottom:10px;">
            <button class="cmd-try-btn" id="menuTab1" style="background:#38bdf8; color:#0f172a; padding:6px 14px;">12 Chế độ Casio 580</button>
            <button class="cmd-try-btn" id="menuTab2" style="background:transparent; color:#94a3b8; padding:6px 14px;">💡 Bảng học lệnh toán học</button>
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
            <div class="menu-card-tile" onclick="window.casio.selectModeFromMenu('4')">
              <span class="menu-tile-badge">4</span>
              <span class="menu-tile-title">Ma trận</span>
              <span class="menu-tile-desc">Định thức Det, ma trận nghịch đảo, nhân</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.selectModeFromMenu('5')">
              <span class="menu-tile-badge">5</span>
              <span class="menu-tile-title">Véc-tơ</span>
              <span class="menu-tile-desc">Tích vô hướng, tích có hướng véc-tơ 3D</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.selectModeFromMenu('6')">
              <span class="menu-tile-badge">6</span>
              <span class="menu-tile-title">Thống kê</span>
              <span class="menu-tile-desc">Số trung bình x̄, phương sai, độ lệch chuẩn</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.selectModeFromMenu('7')">
              <span class="menu-tile-badge">7</span>
              <span class="menu-tile-title">Phân phối</span>
              <span class="menu-tile-desc">Phân phối chuẩn Normal, nhị thức Binomial</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.selectModeFromMenu('8')">
              <span class="menu-tile-badge">8</span>
              <span class="menu-tile-title">Bảng giá trị</span>
              <span class="menu-tile-desc">Bảng giá trị hàm số f(x) với Start, End, Step</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.selectModeFromMenu('9')">
              <span class="menu-tile-badge">9</span>
              <span class="menu-tile-title">PT / Hệ PT</span>
              <span class="menu-tile-desc">PT bậc 2 (Min/Max Parabol), bậc 3, 4, Hệ 2-3 ẩn</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.selectModeFromMenu('A')">
              <span class="menu-tile-badge">A</span>
              <span class="menu-tile-title">Bất PT</span>
              <span class="menu-tile-desc">Bất phương trình bậc 2, bậc 3 (&gt;, &lt;, ≥, ≤)</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.selectModeFromMenu('B')">
              <span class="menu-tile-badge">B</span>
              <span class="menu-tile-title">Tỉ lệ thức</span>
              <span class="menu-tile-desc">Tìm ẩn trong tỉ lệ a:b = c:d</span>
            </div>
            <div class="menu-card-tile" onclick="window.casio.openFeatureModal('learn_cmd')">
              <span class="menu-tile-badge">C</span>
              <span class="menu-tile-title">Học lệnh</span>
              <span class="menu-tile-desc">Toàn bộ danh sách lệnh và ví dụ mẫu gõ trực tiếp</span>
            </div>
          </div>

          <div id="menuViewCommands" style="display:none; flex-direction:column; gap:8px;"></div>
        `;

        document.getElementById('menuTab1').onclick = () => {
          document.getElementById('menuViewModes').style.display = 'grid';
          document.getElementById('menuViewCommands').style.display = 'none';
          document.getElementById('menuTab1').style.background = '#38bdf8';
          document.getElementById('menuTab1').style.color = '#0f172a';
          document.getElementById('menuTab2').style.background = 'transparent';
          document.getElementById('menuTab2').style.color = '#94a3b8';
        };

        document.getElementById('menuTab2').onclick = () => {
          document.getElementById('menuViewModes').style.display = 'none';
          document.getElementById('menuViewCommands').style.display = 'flex';
          document.getElementById('menuTab2').style.background = '#38bdf8';
          document.getElementById('menuTab2').style.color = '#0f172a';
          document.getElementById('menuTab1').style.background = 'transparent';
          document.getElementById('menuTab1').style.color = '#94a3b8';
          this.renderCommandListInContainer('menuViewCommands');
        };
      }

      // 2. HỌC LỆNH (COMMAND LEARNING & CHEATSHEET)
      else if (type === 'learn_cmd') {
        title.innerText = '💡 BẢNG HỌC LỆNH CHỨC NĂNG (GÕ LỆNH TRỰC TIẾP)';
        body.innerHTML = `
          <div style="font-size:12.5px; color:#cbd5e1; line-height:1.5;">
            Bạn có thể gõ trực tiếp các lệnh này vào màn hình hoặc bấm nút <b>"Thử ngay"</b> để máy tự động nạp và tính toán!
          </div>
          <div id="cmdListContainer" style="display:flex; flex-direction:column; gap:8px; max-height:420px; overflow-y:auto; padding-right:4px;"></div>
        `;
        this.renderCommandListInContainer('cmdListContainer');
      }

      // 3. PHÂN TÍCH THỪA SỐ NGUYÊN TỐ (FACT)
      else if (type === 'fact') {
        title.innerText = '🌿 Phân tích thừa số nguyên tố (FACT)';
        body.innerHTML = `
          <div>Nhập số nguyên cần phân tích:</div>
          <input type="number" id="factInput" class="modal-input-field" placeholder="Ví dụ: 120" value="${this.ans || '120'}">
          <button class="modal-action-btn" id="factSubmit">Phân tích thừa số (FACT)</button>
          <div id="factResult" style="font-size:16px; font-weight:bold; color:#38bdf8; margin-top:8px;"></div>
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

      // 4. PHƯƠNG TRÌNH BẬC 2
      else if (type === 'quad') {
        title.innerText = '🎯 Giải phương trình bậc 2 (ax² + bx + c = 0)';
        body.innerHTML = `
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;">
            <div><label>Hệ số a:</label><input type="number" id="qa" class="modal-input-field" value="1"></div>
            <div><label>Hệ số b:</label><input type="number" id="qb" class="modal-input-field" value="-3"></div>
            <div><label>Hệ số c:</label><input type="number" id="qc" class="modal-input-field" value="1"></div>
          </div>
          <button class="modal-action-btn" id="qSubmit" style="margin-top:6px;">Giải phương trình</button>
          <div id="qResult" style="white-space:pre-wrap; font-size:14px; font-weight:bold; color:#38bdf8; margin-top:8px;"></div>
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

      // 5. PHƯƠNG TRÌNH BẬC 3
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
          <div id="cResult" style="white-space:pre-wrap; font-size:14px; font-weight:bold; color:#38bdf8; margin-top:8px;"></div>
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

      // 6. PHƯƠNG TRÌNH BẬC 4
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
          <div id="q4Result" style="white-space:pre-wrap; font-size:14px; font-weight:bold; color:#38bdf8; margin-top:8px;"></div>
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

      // 7. HỆ 2 PHƯƠNG TRÌNH
      else if (type === 'simul2') {
        title.innerText = '📊 Giải hệ 2 phương trình bậc nhất (2 ẩn)';
        body.innerHTML = `
          <div>PT 1: a₁·x + b₁·y = c₁</div>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
            <input type="number" id="s1_a" class="modal-input-field" placeholder="a₁" value="2">
            <input type="number" id="s1_b" class="modal-input-field" placeholder="b₁" value="1">
            <input type="number" id="s1_c" class="modal-input-field" placeholder="c₁" value="8">
          </div>
          <div style="margin-top:6px;">PT 2: a₂·x + b₂·y = c₂</div>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
            <input type="number" id="s2_a" class="modal-input-field" placeholder="a₂" value="1">
            <input type="number" id="s2_b" class="modal-input-field" placeholder="b₂" value="2">
            <input type="number" id="s2_c" class="modal-input-field" placeholder="c₂" value="7">
          </div>
          <button class="modal-action-btn" id="simulSubmit" style="margin-top:10px;">Tìm nghiệm (x, y)</button>
          <div id="simulResult" style="white-space:pre-wrap; font-size:15px; font-weight:bold; color:#38bdf8; margin-top:8px;"></div>
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

      // 8. HỆ 3 PHƯƠNG TRÌNH
      else if (type === 'simul3') {
        title.innerText = '📊 Giải hệ 3 phương trình bậc nhất (3 ẩn)';
        body.innerHTML = `
          <div>Nhập các hệ số [a, b, c = d]:</div>
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:4px;">
            <input type="number" id="s3_11" class="modal-input-field" value="2">
            <input type="number" id="s3_12" class="modal-input-field" value="1">
            <input type="number" id="s3_13" class="modal-input-field" value="1">
            <input type="number" id="s3_14" class="modal-input-field" value="8">
            <input type="number" id="s3_21" class="modal-input-field" value="1">
            <input type="number" id="s3_22" class="modal-input-field" value="2">
            <input type="number" id="s3_23" class="modal-input-field" value="1">
            <input type="number" id="s3_24" class="modal-input-field" value="7">
            <input type="number" id="s3_31" class="modal-input-field" value="1">
            <input type="number" id="s3_32" class="modal-input-field" value="1">
            <input type="number" id="s3_33" class="modal-input-field" value="2">
            <input type="number" id="s3_34" class="modal-input-field" value="9">
          </div>
          <button class="modal-action-btn" id="s3Submit" style="margin-top:8px;">Tìm nghiệm (x, y, z)</button>
          <div id="s3Result" style="white-space:pre-wrap; font-size:15px; font-weight:bold; color:#38bdf8; margin-top:8px;"></div>
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

      // 9. BẤT PHƯƠNG TRÌNH BẬC 2
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
          <div id="ineqResult" style="font-size:15px; font-weight:bold; color:#38bdf8; margin-top:8px;"></div>
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

      // 10. BẢNG GIÁ TRỊ TABLE f(x)
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

          let html = '<table style="width:100%; border-collapse:collapse; font-size:12px;"><tr><th style="border:1px solid #334155; padding:4px;">x</th><th style="border:1px solid #334155; padding:4px;">f(x)</th></tr>';
          for (let x = start; x <= end + 1e-9; x += step) {
            try {
              const y = math.evaluate(fn, { x, deg: Math.PI / 180 });
              html += `<tr><td style="border:1px solid #334155; text-align:center; padding:3px;">${x.toFixed(2)}</td><td style="border:1px solid #334155; text-align:right; padding:3px; color:#38bdf8; font-weight:bold;">${typeof y === 'number' ? y.toFixed(4) : y}</td></tr>`;
            } catch (e) {}
          }
          html += '</table>';
          document.getElementById('tabResult').innerHTML = html;
        };
      }

      // 11. ĐẠO HÀM d/dx
      else if (type === 'deriv') {
        title.innerText = '🧮 Tính đạo hàm d/dx tại 1 điểm';
        body.innerHTML = `
          <div>Nhập hàm số f(x):</div>
          <input type="text" id="dfExpr" class="modal-input-field" value="x^3 - 2*x + 1">
          <div style="margin-top:6px;">Tại x = x₀:</div>
          <input type="number" id="dfX0" class="modal-input-field" value="2">
          <button class="modal-action-btn" id="dfSubmit" style="margin-top:8px;">Tính f'(x₀)</button>
          <div id="dfRes" style="font-size:16px; font-weight:bold; color:#38bdf8; margin-top:8px;"></div>
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

      // 12. TÍCH PHÂN XÁC ĐỊNH
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
          <div id="intRes" style="font-size:16px; font-weight:bold; color:#38bdf8; margin-top:8px;"></div>
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

      // 13. TỔNG XÍCH MA ∑
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
          <div id="sumRes" style="font-size:16px; font-weight:bold; color:#38bdf8; margin-top:8px;"></div>
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

      // 14. GIỚI HẠN LIMIT
      else if (type === 'limit') {
        title.innerText = '🚀 Giới hạn Limit lim_{x ➔ x₀} f(x)';
        body.innerHTML = `
          <div>Hàm f(x):</div>
          <input type="text" id="limF" class="modal-input-field" value="(x^2 - 1)/(x - 1)">
          <div style="margin-top:6px;">Khi x tiến tới x₀:</div>
          <input type="number" id="limX0" class="modal-input-field" value="1">
          <button class="modal-action-btn" id="limSubmit" style="margin-top:8px;">Tính giới hạn</button>
          <div id="limRes" style="font-size:16px; font-weight:bold; color:#38bdf8; margin-top:8px;"></div>
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

      // 15. ƯCLN (GCD) & BCNN (LCM)
      else if (type === 'gcd_lcm') {
        title.innerText = '🔢 ƯCLN (GCD) & BCNN (LCM)';
        body.innerHTML = `
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div><label>Số A:</label><input type="number" id="glA" class="modal-input-field" value="24"></div>
            <div><label>Số B:</label><input type="number" id="glB" class="modal-input-field" value="36"></div>
          </div>
          <button class="modal-action-btn" id="glSubmit" style="margin-top:8px;">Tính ƯCLN & BCNN</button>
          <div id="glRes" style="font-size:15px; font-weight:bold; color:#38bdf8; margin-top:8px;"></div>
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

      // 16. SỐ PHỨC (COMPLEX)
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
          <div id="cxRes" style="font-size:16px; font-weight:bold; color:#38bdf8; margin-top:8px;"></div>
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

      // 17. SETTINGS MODAL
      else if (type === 'settings') {
        title.innerText = '🎚 CÀI ĐẶT HỆ THỐNG (SETTINGS)';
        body.innerHTML = `
          <div><b>1. Đơn vị góc (Angle Unit):</b></div>
          <div style="display:flex; gap:10px;">
            <label><input type="radio" name="setAngle" value="RAD" ${this.angleUnit === 'RAD' ? 'checked' : ''}> Radian (rad)</label>
            <label><input type="radio" name="setAngle" value="DEG" ${this.angleUnit === 'DEG' ? 'checked' : ''}> Degree (Độ °)</label>
            <label><input type="radio" name="setAngle" value="GRA" ${this.angleUnit === 'GRA' ? 'checked' : ''}> Gradian (gra)</label>
          </div>

          <div style="margin-top:10px;"><b>2. Định dạng số mặc định:</b></div>
          <div style="display:flex; gap:10px;">
            <label><input type="radio" name="setFmt" value="FRAC" ${this.formatMode === 'FRAC' ? 'checked' : ''}> Phân số (FRAC)</label>
            <label><input type="radio" name="setFmt" value="DEC" ${this.formatMode === 'DEC' ? 'checked' : ''}> Thập phân (DEC)</label>
          </div>

          <div style="margin-top:10px;"><b>3. Âm thanh phím bấm:</b></div>
          <div>
            <label><input type="checkbox" id="setSound" ${this.sound.enabled ? 'checked' : ''}> Bật âm thanh bàn phím (Tactile Audio Clicks)</label>
          </div>

          <div style="margin-top:10px;"><b>4. Giao diện (Theme):</b></div>
          <div style="display:flex; gap:8px;">
            <button class="cmd-try-btn" onclick="window.casio.setTheme('dark')">Casio Dark</button>
            <button class="cmd-try-btn" onclick="window.casio.setTheme('classic')">Classic Light</button>
            <button class="cmd-try-btn" onclick="window.casio.setTheme('oled')">OLED Contrast</button>
          </div>

          <button class="modal-action-btn" id="setSave" style="margin-top:12px;">Áp dụng cài đặt</button>
        `;
        document.getElementById('setSave').onclick = () => {
          const ang = document.querySelector('input[name="setAngle"]:checked').value;
          const fmt = document.querySelector('input[name="setFmt"]:checked').value;
          const snd = document.getElementById('setSound').checked;
          this.angleUnit = ang;
          this.formatMode = fmt;
          this.sound.enabled = snd;
          this.el.pillAngle.innerText = ang;
          this.el.pillFormat.innerText = fmt;
          modal.classList.remove('active');
        };
      }

      // 18. SCREEN 3-DOTS MENU
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
      if (themeName !== 'dark') {
        document.body.classList.add(`theme-${themeName}`);
      }
      this.sound.playClick();
    }

    cycleTheme() {
      const themes = ['dark', 'classic', 'oled'];
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
          <div style="font-size:12px; color:#94a3b8;">${h.expr}</div>
          <div style="font-size:14px; font-weight:bold; color:#38bdf8; text-align:right;">${h.res}</div>
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
      if (k >= '0' && k <= '9') this.pressKey(k);
      else if (k === '.' || k === ',') this.pressKey(',');
      else if (k === '+') this.pressKey('PLUS');
      else if (k === '-') this.pressKey('MINUS');
      else if (k === '*') this.pressKey('MUL');
      else if (k === '/') { e.preventDefault(); this.pressKey('DIV'); }
      else if (k === 'Enter' || k === '=') { e.preventDefault(); this.pressKey('EQ'); }
      else if (k === 'Backspace') this.pressKey('DEL');
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
