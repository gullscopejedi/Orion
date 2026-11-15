const assert = require('assert');
const elements = {};
global.document = {
  getElementById(id) { return elements[id] ||= { appendChild() {}, addEventListener() {} }; },
  createElement() { return { append() {} }; },
};
const { parseLog, calculate } = require('../big-planner.js');
const levels = Array(22).fill(0);
for (const budget of ['1e308', '1e333', '3e56057']) {
  const result = calculate(parseLog(budget, 'budget'), 2, levels, 150000, 30000);
  assert.strictEqual(result.length, 22);
  assert(!/NaN|Infinity/.test(JSON.stringify(result)));
}
assert.strictEqual(parseLog('1d', 'test'), 33);
assert.strictEqual(parseLog('1D', 'test'), 39);
assert.throws(() => parseLog('1e4x', 'test'));
const current = Array(22).fill(Math.log10(455));
const low = calculate(parseLog('1e240', 'budget'), 0, current, 150000, 30000);
const high = calculate(parseLog('1e240', 'budget'), 100, current, 150000, 30000);
assert(Number(high[9].buy) > Number(low[9].buy));
assert.strictEqual(Number(high[9].target), 455 + Number(high[9].buy));
const cap = calculate(parseLog('3e56057', 'budget'), 0, levels, 150000, 30000);
assert.strictEqual(cap.find(x => x.name === 'Idol').target, '30000');
console.log('Large BE planner tests passed');
const { shouldUseShortcut } = require('../big-planner.js');
assert(shouldUseShortcut(parseLog('1e303', 'b'), parseLog('1e300', 'p')));
assert(!shouldUseShortcut(parseLog('9.99e302', 'b'), parseLog('1e300', 'p')));
assert(shouldUseShortcut(parseLog('1.179e241', 'b'), parseLog('7.399e138', 'p')));
assert.throws(() => shouldUseShortcut(10, -Infinity));
const screenshotLevels = Array(22).fill(-Infinity);
for (let i = 9; i < 22; i++) screenshotLevels[i] = Math.log10(455);
let screenshot = calculate(parseLog('1.179e241', 'budget'), 0, screenshotLevels, 150000, 30000, .5367);
assert.strictEqual(screenshot[9].buy, '338'); // LifeTraveler: 339; our 1% reserve differs
for (let i = 9; i < 22; i++) screenshotLevels[i] = Math.log10(794);
screenshot = calculate(parseLog('1e308', 'budget'), 0, screenshotLevels, 150000, 30000, .5367);
assert.strictEqual(screenshot[9].buy, '222'); // LifeTraveler: 223
const over = calculate(parseLog('1e10', 'budget'), 0, screenshotLevels, 150000, 30000, .5367);
assert(over[9].note.includes('Budget-only reference: -'));
assert(Number(over[9].buy) >= 0);
console.log('e3 shortcut and screenshot comparison tests passed');
