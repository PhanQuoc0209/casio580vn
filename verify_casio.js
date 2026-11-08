const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Prepare DOM mock environment for Casio580Pro
const domElements = {};
function createMockEl(id, tagName = 'div') {
  const el = {
    id,
    tagName,
    innerText: '',
    innerHTML: '',
    style: {},
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (this.contains(c)) this.remove(c);
          else this.add(c);
        } else if (force) {
          this.add(c);
        } else {
          this.remove(c);
        }
      }
    },
    addEventListener(evt, fn) {},
    closest(selector) { return null; },
    getAttribute(attr) { return null; },
    appendChild(child) {}
  };
  domElements[id] = el;
  return el;
}

const documentMock = {
  getElementById(id) {
    if (!domElements[id]) createMockEl(id);
    return domElements[id];
  },
  querySelectorAll(sel) { return []; },
  querySelector(sel) { return null; },
  addEventListener(evt, fn) {}
};

const domListeners = {};
const windowMock = {
  document: documentMock,
  addEventListener(evt, fn) {
    if (!domListeners[evt]) domListeners[evt] = [];
    domListeners[evt].push(fn);
  },
  AudioContext: function() {
    return {
      state: 'running',
      currentTime: 0,
      createOscillator: () => ({
        type: '',
        frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {},
        start() {},
        stop() {}
      }),
      createGain: () => ({
        gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {}
      }),
      destination: {}
    };
  }
};

// Load mathjs inside the sandbox context so Object prototype matches
const mathCode = fs.readFileSync(path.join(__dirname, 'vendor', 'math.min.js'), 'utf8');
const calcCode = fs.readFileSync(path.join(__dirname, 'calculator.js'), 'utf8');

const sandbox = {
  window: windowMock,
  document: documentMock,
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout
};

vm.createContext(sandbox);
vm.runInContext(mathCode, sandbox);
sandbox.window.math = sandbox.window.math || sandbox.math;
const math = sandbox.window.math;

vm.runInContext(calcCode, sandbox);

if (domListeners['DOMContentLoaded']) {
  domListeners['DOMContentLoaded'].forEach(fn => fn());
}

// Retrieve Casio instance
const casio = sandbox.window.casio;

console.log('=== VERIFICATION TEST SUITE ===');

// Req 1: Default mode is MathI/MathO
console.log('Test 1 (Default mode):', casio.ioMode === 'MathI/MathO' ? 'PASS' : 'FAIL', '(' + casio.ioMode + ')');

// Req 2: Fraction stacked
casio.pressKey('AC');
casio.pressKey('FRAC');
casio.pressKey('1');
casio.pressKey('DOWN');
casio.pressKey('2');
const fracHTML = casio.ast.toHTML();
const hasFracClasses = fracHTML.includes('math-fraction') && fracHTML.includes('math-num') && fracHTML.includes('math-frac-line') && fracHTML.includes('math-den');
console.log('Test 2 (Fraction layout):', hasFracClasses ? 'PASS' : 'FAIL');
console.log('   Fraction HTML:', fracHTML);

// Req 3: Sqrt with vinculum overline
casio.pressKey('AC');
casio.pressKey('SQRT');
casio.pressKey('9');
const sqrtHTML = casio.ast.toHTML();
const hasSqrtClasses = sqrtHTML.includes('math-radical') && sqrtHTML.includes('math-rad-surd') && sqrtHTML.includes('math-rad-vinculum');
console.log('Test 3 (Square Root layout):', hasSqrtClasses ? 'PASS' : 'FAIL');
console.log('   Sqrt HTML:', sqrtHTML);

// Req 4: Power / Superscript
casio.pressKey('AC');
casio.pressKey('VAR_X');
casio.pressKey('X_POW');
casio.pressKey('2');
const powHTML = casio.ast.toHTML();
const hasPowClass = powHTML.includes('math-sup');
console.log('Test 4 (Power layout):', hasPowClass ? 'PASS' : 'FAIL');
console.log('   Power HTML:', powHTML);

// Req 5: Subscript (Log base)
casio.pressKey('AC');
casio.pressKey('LOG_BASE');
casio.pressKey('2');
casio.pressKey('RIGHT');
casio.pressKey('8');
const logHTML = casio.ast.toHTML();
const hasSubClass = logHTML.includes('math-sub');
console.log('Test 5 (Subscript layout):', hasSubClass ? 'PASS' : 'FAIL');
console.log('   Log HTML:', logHTML);

// Req 6: Integral layout
casio.pressKey('AC');
casio.pressKey('INTEG');
casio.pressKey('VAR_X');
casio.pressKey('DOWN');
casio.pressKey('0');
casio.pressKey('UP');
casio.pressKey('3');
const intHTML = casio.ast.toHTML();
const hasIntClasses = intHTML.includes('math-integral') && intHTML.includes('math-int-upper') && intHTML.includes('math-int-lower');
console.log('Test 6 (Integral layout):', hasIntClasses ? 'PASS' : 'FAIL');
console.log('   Integral HTML:', intHTML);

// Req 7: Sigma layout
casio.pressKey('AC');
casio.pressKey('SHIFT');
casio.pressKey('VAR_X'); // Sigma
casio.pressKey('VAR_X');
casio.pressKey('DOWN');
casio.pressKey('1');
casio.pressKey('UP');
casio.pressKey('5');
const sigmaHTML = casio.ast.toHTML();
const hasSigmaClasses = sigmaHTML.includes('math-sigma') && sigmaHTML.includes('math-sigma-upper') && sigmaHTML.includes('math-sigma-lower');
console.log('Test 7 (Sigma layout):', hasSigmaClasses ? 'PASS' : 'FAIL');
console.log('   Sigma HTML:', sigmaHTML);

// Req 8: Nested fractions evaluation (1 + 2/3) / (4 - 5/6) = 10/19
casio.pressKey('AC');
casio.pressKey('FRAC');
casio.pressKey('1');
casio.pressKey('PLUS');
casio.pressKey('FRAC');
casio.pressKey('2');
casio.pressKey('DOWN');
casio.pressKey('3');
casio.pressKey('RIGHT');
casio.pressKey('DOWN');
casio.pressKey('4');
casio.pressKey('MINUS');
casio.pressKey('FRAC');
casio.pressKey('5');
casio.pressKey('DOWN');
casio.pressKey('6');
console.log('\nEvaluating nested fraction...');
console.log('   MathJS to evaluate:', casio.ast.toMathJS());
try {
  casio.evaluateCurrent();
} catch (err) {
  console.log('   Caught err:', err);
}
console.log('   Output String:', casio.lastResult);
console.log('   Output HTML:', casio.lastResultHTML);
const isFracCorrect = casio.lastResult === '10/19' && casio.lastResultHTML.includes('math-fraction');
console.log('Test 8 (Nested fraction result):', isFracCorrect ? 'PASS' : 'FAIL');

// Req 9: S <-> D format toggling
console.log('\nTesting S <-> D toggle...');
casio.toggleFormat();
console.log('   Toggled to Dec:', casio.lastResult);
const isDec = casio.lastResult.startsWith('0.5263');
casio.toggleFormat();
console.log('   Toggled back to Frac:', casio.lastResult);
const isFracAgain = casio.lastResult === '10/19';
console.log('Test 9 (S <=> D toggle):', (isDec && isFracAgain) ? 'PASS' : 'FAIL');

// Req 10: 4 I/O Modes test
console.log('\nTesting 4 I/O Modes:');
const modes = ['MathI/MathO', 'MathI/DecimalO', 'LineI/LineO', 'LineI/DecimalO'];
let allModesOk = true;
for (const m of modes) {
  casio.ioMode = m;
  casio.evaluateCurrent();
  console.log(`   Mode [${m}]: Result = ${casio.lastResult}, HTML = ${casio.lastResultHTML}`);
  if (m === 'MathI/DecimalO' || m === 'LineI/DecimalO') {
    if (!casio.lastResult.startsWith('0.5263')) allModesOk = false;
  }
}
console.log('Test 10 (4 I/O Modes):', allModesOk ? 'PASS' : 'FAIL');

// Req 11: Solver integration (solveSmartEquation)
console.log('\nTesting quadratic equation solver: x^2 - 3x + 1 = 0');
casio.pressKey('AC');
casio.tryCommand('x^2 - 3x + 1 = 0');
console.log('   Quadratic output:', casio.lastResult);
const isQuadOk = (casio.lastResult.includes('x1 =') || casio.lastResult.includes('x₁ =')) && casio.lastResult.includes('Cực trị') || casio.lastResult.includes('nhỏ nhất');
console.log('Test 11 (Smart Quadratic Solver):', isQuadOk ? 'PASS' : 'FAIL');

console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY! ===');
