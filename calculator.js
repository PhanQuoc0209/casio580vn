/**
 * CASIO fx-580VN X PRO - ENGINE & INTERACTIVE CONTROLLER
 * Full smart equation detection, dropdown tool integration, audio synthesizer,
 * and authentic key mappings matching the user's photo.
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

    // Linear System Solver (Gaussian elimination)
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

    // Numerical Derivative: f'(x0)
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

      this.angleUnit = 'RAD'; // 'RAD', 'DEG', 'GRA' (as default in photo)
      this.formatMode = 'FRAC'; // 'FRAC', 'DEC'
      this.normMode = 'NORM'; // 'NORM', 'FIX', 'SCI'

      this.currentTheme = 'dark'; // 'dark', 'classic', 'oled'

      this.variables = {
        A: 0, B: 0, C: 0, D: 0, T: 0, F: 0,
        x: 0, y: 0, z: 0, M: 0
      };

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

        // Pills
        pillAngle: document.getElementById('pillAngle'),
        pillFormat: document.getElementById('pillFormat'),
        pillNorm: document.getElementById('pillNorm'),

        // Dropdown & Buttons
        featureDropdownBtn: document.getElementById('featureDropdownBtn'),
        featureDropdownMenu: document.getElementById('featureDropdownMenu'),
        currentFeatureLabel: document.getElementById('currentFeatureLabel'),
        btnNewDoc: document.getElementById('btnNewDoc'),
        btnSaveDoc: document.getElementById('btnSaveDoc'),
        btnScreenMenu: document.getElementById('btnScreenMenu'),
        btnHelp: document.getElementById('btnHelp'),
        btnTheme: document.getElementById('btnTheme'),

        // Modal
        toolModal: document.getElementById('toolModal'),
        modalTitle: document.getElementById('modalTitle'),
        modalBody: document.getElementById('modalBody'),
        modalCloseBtn: document.getElementById('modalCloseBtn'),

        // History
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

      // Dropdown toggle
      this.el.featureDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.el.featureDropdownMenu.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        this.el.featureDropdownMenu.classList.remove('show');
      });

      // Dropdown item selection
      document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = item.getAttribute('data-action');
          const label = item.innerText.split(' ')[1] || item.innerText;
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
          alert('Đã lưu biểu thức và kết quả vào danh sách gần đây!');
        } else {
          alert('Chưa có kết quả để lưu!');
        }
      });

      this.el.btnHelp.addEventListener('click', () => this.showHelpModal());
      this.el.btnTheme.addEventListener('click', () => this.cycleTheme());

      this.el.modalCloseBtn.addEventListener('click', () => {
        this.el.toolModal.classList.remove('active');
      });

      // Keyboard physical input
      window.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // --- KEYPAD INPUT DISPATCHER ---
    pressKey(keyId, e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.sound.playClick();

      // SHIFT & ALPHA toggles
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

      // Check SHIFT secondary functions
      if (this.isShift) {
        this.isShift = false;
        this.updateModifiersVisual();
        this.handleShiftKey(keyId);
        return;
      }

      // Check ALPHA secondary functions
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
        case 'CALC': this.evaluateCurrent(); return;
        case 'INTEG': this.rawExpr += 'integrate('; break;

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
        case 'INV': this.rawExpr += '!'; break; // x!
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

    // --- EVALUATION WITH SMART EQUATION DETECTION ---
    evaluateCurrent() {
      if (!this.rawExpr || this.rawExpr.trim() === '') return;

      const expr = this.rawExpr.trim();

      // 1. SMART EQUATION DETECTION: e.g. "x^2 - 3x + 1 = 0"
      if (expr.includes('=')) {
        this.solveSmartEquation(expr);
        return;
      }

      // 2. STANDARD CALCULATION
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

        // Angle unit conversions for trigonometric functions
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

        // Process Result Format
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

    // Smart equation solver: splits LHS = RHS
    solveSmartEquation(equationStr) {
      const parts = equationStr.split('=');
      if (parts.length !== 2) {
        this.lastResult = 'Phương trình không hợp lệ';
        this.updateDisplay();
        return;
      }

      const lhs = parts[0].trim();
      const rhs = parts[1].trim();

      // Check Quadratic: e.g. x^2 - 3x + 1 = 0
      try {
        // Collect coefficients by evaluating for x = 0, 1, -1
        const fStr = `(${lhs}) - (${rhs})`;
        const f = (xVal) => math.evaluate(fStr, { x: xVal });

        const c = f(0);
        const f1 = f(1);
        const fm1 = f(-1);

        // a + b + c = f1 => a + b = f1 - c
        // a - b + c = fm1 => a - b = fm1 - c
        // => 2a = f1 + fm1 - 2c => a = (f1 + fm1 - 2c)/2
        // => b = f1 - c - a
        const a = (f1 + fm1 - 2 * c) / 2;
        const b = f1 - c - a;

        // Check if degree 2
        const f2 = f(2);
        const expectedF2 = 4 * a + 2 * b + c;

        if (Math.abs(f2 - expectedF2) < 1e-6 && Math.abs(a) > 1e-6) {
          // Quadratic Equation!
          const quadResult = MathSolvers.solveQuadratic(a, b, c);
          this.lastResult = quadResult;
          this.addHistory(equationStr, quadResult.replace(/\n/g, ' | '));
          this.updateDisplay();
          return;
        }

        // Check Linear: ax + b = 0
        if (Math.abs(a) < 1e-6 && Math.abs(b) > 1e-6) {
          const xVal = -c / b;
          const res = `Nghiệm duy nhất: x = ${xVal.toFixed(4)}`;
          this.lastResult = res;
          this.addHistory(equationStr, res);
          this.updateDisplay();
          return;
        }

        // Generic numerical search
        this.lastResult = 'Đang giải phương trình tổng quát...';
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

    // --- DISPLAY UPDATES ---
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

    // --- MODAL FEATURES & TOOLS ---
    openFeatureModal(type) {
      const modal = this.el.toolModal;
      const title = this.el.modalTitle;
      const body = this.el.modalBody;

      modal.classList.add('active');

      if (type === 'fact') {
        title.innerText = '🌿 Phân tích thừa số nguyên tố (FACT)';
        body.innerHTML = `
          <div>Nhập số nguyên cần phân tích (hoặc để trống để phân tích kết quả hiện tại):</div>
          <input type="number" id="factInput" class="modal-input-field" placeholder="Ví dụ: 120" value="${this.ans || ''}">
          <button class="modal-action-btn" id="factSubmit">Phân tích ngay</button>
          <div id="factResult" style="font-size:16px; font-weight:bold; color:#38bdf8; margin-top:8px;"></div>
        `;
        document.getElementById('factSubmit').onclick = () => {
          const val = parseFloat(document.getElementById('factInput').value) || this.ans;
          const res = MathSolvers.factorize(val);
          document.getElementById('factResult').innerText = `${val} = ${res}`;
          this.lastResult = res;
          this.updateDisplay();
        };
      } else if (type === 'quad') {
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
      } else if (type === 'cubic') {
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
      } else if (type === 'simul2') {
        title.innerText = '📊 Giải hệ 2 phương trình bậc nhất';
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
      } else if (type === 'deriv') {
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
            this.lastResult = `${val.toFixed(4)}`;
            this.updateDisplay();
          } catch (e) {
            document.getElementById('dfRes').innerText = 'Lỗi tính toán đạo hàm';
          }
        };
      } else if (type === 'integ') {
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
            this.lastResult = `${val.toFixed(4)}`;
            this.updateDisplay();
          } catch (e) {
            document.getElementById('intRes').innerText = 'Lỗi tích phân';
          }
        };
      } else if (type === 'gcd_lcm') {
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
          this.lastResult = `GCD=${g}, LCM=${l}`;
          this.updateDisplay();
        };
      }
    }

    showHelpModal() {
      const modal = this.el.toolModal;
      this.el.modalTitle.innerText = '❓ Hướng dẫn sử dụng Casio 580VN X Pro';
      this.el.modalBody.innerHTML = `
        <div style="font-size:13px; line-height:1.6; display:flex; flex-direction:column; gap:8px;">
          <div><b>1. Bàn phím số & Phép tính:</b> Nhập trực tiếp từ máy tính hoặc bấm các phím chuột. Hai phím <b>DEL & AC màu xanh</b> dùng để xóa ký tự hoặc xóa toàn bộ.</div>
          <div><b>2. Tự động giải phương trình:</b> Gõ trực tiếp <code>x^2 - 3x + 1 = 0</code> rồi bấm <code>=</code> để nhận nghiệm và toạ độ đỉnh Parabol ngay lập tức!</div>
          <div><b>3. Menu xổ xuống (Dropdown):</b> Chọn chức năng giải PT, BPT, Hệ PT, Thừa số nguyên tố, Đạo hàm, Tích phân chỉ bằng 1 thao tác.</div>
          <div><b>4. Các nút BADGE trạng thái:</b> Nhấn trực tiếp vào <code>RAD</code> để đổi ĐỘ/RADIAN; nhấn <code>FRAC</code> để đổi Phân số/Thập phân.</div>
        </div>
      `;
      modal.classList.add('active');
    }

    cycleTheme() {
      const themes = ['dark', 'classic', 'oled'];
      const idx = (themes.indexOf(this.currentTheme) + 1) % themes.length;
      this.currentTheme = themes[idx];

      document.body.className = '';
      if (this.currentTheme !== 'dark') {
        document.body.classList.add(`theme-${this.currentTheme}`);
      }
      this.sound.playClick();
    }

    addHistory(expr, res) {
      this.history.unshift({ expr, res });
      if (this.history.length > 20) this.history.pop();
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
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const k = e.key;
      if (k >= '0' && k <= '9') this.pressKey(k);
      else if (k === '.' || k === ',') this.pressKey(',');
      else if (k === '+') this.pressKey('PLUS');
      else if (k === '-') this.pressKey('MINUS');
      else if (k === '*') this.pressKey('MUL');
      else if (k === '/') { e.preventDefault(); this.pressKey('DIV'); }
      else if (k === 'Enter' || k === '=') { e.preventDefault(); this.pressKey('EQ'); }
      else if (k === 'Backspace') this.pressKey('DEL');
      else if (k === 'Escape') this.pressKey('AC');
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
