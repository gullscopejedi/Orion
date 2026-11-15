/* Cost-based estimates. Values are represented by base-10 logarithms. */
(function () {
  'use strict';
  const main = ['AFK', 'Demeaning', 'Dragon', 'Eggplant', 'Faberge', 'Newton', 'Wonderland'];
  const misc = ['Cactus', 'Garbage', 'Hourglass', 'Idol', 'King Cobra', 'Ninja', 'Present', 'Radioactive', 'Scientist', 'Super', 'Treasure', 'Unstable', 'Volcano'];
  const eggs = ['Good Knight', ...main, 'Turtle', ...misc];
  const inputs = document.getElementById('big-inputs');
  const miscInputs = document.getElementById('big-misc-inputs');
  eggs.forEach((name, i) => {
    const wrap = document.createElement('div'); wrap.className = 'stat';
    const label = document.createElement('label'); label.htmlFor = 'big-level-' + i; label.textContent = name + ' current level';
    const input = document.createElement('input'); input.id = label.htmlFor; input.type = 'text'; input.placeholder = i < 9 ? 'Enter current level' : 'Use common level';
    wrap.append(label, input); (i < 9 ? inputs : miscInputs).appendChild(wrap);
  });
  const suffix = {K:3,M:6,B:9,T:12,q:15,Q:18,s:21,S:24,O:27,N:30,d:33,U:36,D:39,Td:42};
  function parseLog(text, label) {
    const match = text.trim().match(/^((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d*)?|\.\d+)\s*(?:[eE]([+-]?\d+)|([A-Za-z]+))?$/);
    if (!match || (match[3] && !(match[3] in suffix))) throw Error(label + ': enter a non-negative number like 1.2e333 or 17q.');
    const raw = match[1].replace(/,/g, '');
    const [integer, fraction = ''] = raw.split('.'); const all = integer + fraction;
    const first = all.search(/[1-9]/); if (first < 0) return -Infinity;
    const exponent = match[2] ? Number(match[2]) : (suffix[match[3]] || 0);
    if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 1000000) throw Error(label + ': exponent must be between -1000000 and 1000000.');
    return exponent + integer.length - first - 1 + Math.log10(Number(all.slice(first, first + 15)) / Math.pow(10, Math.min(15, all.length - first) - 1));
  }
  function add(a,b) { if (a === -Infinity) return b; if (b === -Infinity) return a; const m = Math.max(a,b); return m + Math.log10(1 + Math.pow(10, Math.min(a,b)-m)); }
  function subtract(a,b) { if (b === -Infinity) return a; if (b >= a) return -Infinity; return a + Math.log10(-Math.expm1((b-a)*Math.LN10)); }
  function fmt(log, floor) {
    if (log === -Infinity) return '0';
    if (log < 0) return '0';
    if (log < 12) return String(Math.max(0, Math.floor(Math.pow(10, log) + (floor ? 0 : 1e-7))));
    const e = Math.floor(log), m = Math.pow(10, log-e);
    // truncate to five significant digits, leaving a margin for floating point error
    const n = Math.floor(m * 9999.999) / 10000;
    return n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '') + 'e' + e;
  }
  function purchases(type, current, budget, waterLog) {
    // All shares retain 1% safety; Water multiplies undiscounted costs by 0.95^level.
    const available = budget + Math.log10(0.99) - waterLog;
    if (type === 'gk') return available;
    if (type === 'main') {
      // k*(2c+k+1)/2 <= undiscounted share. Stable quadratic form.
      const b = add(current + Math.log10(2), 0); // 2c+1
      const root = 0.5 * add(2*b, available + Math.log10(8));
      return Math.log10(4) + available - add(root, b);
    }
    // Sum of (c+j)^1.5 is bounded above by integral from c+1 to c+k+1.
    // Inverting that upper bound deliberately leaves some of the share unused.
    const base = add(current, 0);
    const targetPlus = 0.4 * add(2.5 * base, available + Math.log10(2.5));
    const k = subtract(targetPlus, base);
    return k;
  }
  function calculate(budget, water, levels, cap, idolCap, discount) {
    const waterLog = discount === undefined ? water * Math.log10(0.95) : Math.log10(1 - discount);
    const output = [];
    eggs.forEach((name, i) => {
      const current = levels[i];
      if (i < 9) {
        const share = budget + Math.log10(i === 0 ? .2 : i === 8 ? .2 : .5/7);
        const buy = purchases(i === 0 ? 'gk' : i === 8 ? 'turtle' : 'main', current, share, waterLog);
        output.push({name, current:fmt(current), buy:fmt(buy, true), target:fmt(add(current, buy)), note: i === 8 ? 'Conservative bound' : 'Estimated'});
      } else {
        // Misc current levels are capped to a manageable integer; 2^(c+1) is the next cost.
        if (current > Math.log10(1000000)) throw Error(name + ': current level must be at most 1,000,000.');
        const c = current === -Infinity ? 0 : Math.round(Math.pow(10, current));
        const logShare = budget + Math.log10(.1/13) + Math.log10(.99) - waterLog;
        // sum of next k costs = 2^(c+1) * (2^k - 1)
        const rawTarget = Math.floor(add((c+1)*Math.log10(2), logShare) / Math.log10(2) - 1 + 1e-10);
        const limit = name === 'Idol' ? idolCap : cap;
        const target = Math.max(c, Math.min(rawTarget, limit));
        const reference = Math.min(limit, Math.floor(add(Math.log10(4), logShare) / Math.log10(2)-1+1e-10));
        const diff = reference - c;
        output.push({name, current:String(c), buy:String(target-c), target:String(target), note: c > limit ? 'Over cap by ' + (c-limit) : diff < 0 ? 'Budget-only reference: ' + diff + ' (already above reference)' : target === limit ? 'Cap reached' : 'Estimated'});
      }
    });
    return output;
  }
  const modeEl = document.getElementById('big-mode');
  const waterMode = document.getElementById('big-water-mode');
  function updateMode() {
    document.getElementById('big-prev-wrap').hidden = modeEl.value !== 'auto';
    document.getElementById('big-other-wrap').hidden = modeEl.value === 'shortcut';
  }
  modeEl.addEventListener('change', updateMode);
  waterMode.addEventListener('change', function () {
    const field = document.getElementById('big-water');
    const decimal = waterMode.value === 'decimal';
    document.getElementById('big-water-label').textContent = decimal ? 'Water cost reduction decimal (0 to less than 1)' : 'Water Phoenix Egg level (0–150)';
    field.min = '0'; field.max = decimal ? '0.999999' : '150'; field.step = decimal ? 'any' : '1'; field.value = '0';
  });
  function shouldUseShortcut(budget, previous) {
    if (previous === -Infinity) throw Error('Previous retirement budget must be greater than zero.');
    return budget - previous >= 3 - 1e-10;
  }
  function levelLog(value, name) {
    const x = parseLog(value, name);
    if (x === -Infinity || x < 0) throw Error(name + ': enter a current level of at least 1 for a hatched egg.');
    if (x < 12 && Math.abs(Math.pow(10, x) - Math.round(Math.pow(10, x))) > 0.001) throw Error(name + ': level must be a whole number.');
    return x;
  }
  document.getElementById('big-form').addEventListener('submit', function(e) {
    e.preventDefault(); const result = document.getElementById('big-results');
    try {
      const budget = parseLog(document.getElementById('big-budget').value, 'Budget');
      if (budget < 0) throw Error('Enter at least 1 unspent BE.');
      const water = Number(document.getElementById('big-water').value);
      const decimal = waterMode.value === 'decimal';
      const cap = Number(document.getElementById('big-cap').value), idol = Number(document.getElementById('big-idol-cap').value);
      if ((decimal ? !Number.isFinite(water) || water < 0 || water >= 1 : !Number.isInteger(water) || water < 0 || water > 150) || !Number.isInteger(cap) || cap < 1 || cap > 1000000 || !Number.isInteger(idol) || idol < 1 || idol > 1000000) throw Error('Check Water value and cap values.');
      let shortcut = modeEl.value === 'shortcut';
      if (modeEl.value === 'auto') shortcut = shouldUseShortcut(budget, parseLog(document.getElementById('big-prev').value, 'Previous budget'));
      const common = document.getElementById('big-misc-common').value.trim();
      levelLog(common, 'Common Misc level');
      const levels = eggs.map((n,i) => {
        if (shortcut && i < 9) return -Infinity; // zero assumed; not the actual current level
        const value = document.getElementById('big-level-'+i).value.trim();
        if (i < 9 && !value) throw Error(n + ': enter your current level, or select the e3 shortcut.');
        return levelLog(i >= 9 ? value || common : value, n);
      });
      const rows = calculate(budget, decimal ? 0 : water, levels, cap, idol, decimal ? water : undefined);
      if (shortcut) rows.forEach((r,i) => { if (i < 9) { r.current = 'Not entered'; r.target = 'Not known'; r.note = 'Assumes 0 current; purchase is approximate'; } });
      result.replaceChildren();
      const p = document.createElement('p'); p.textContent = 'Estimated purchases from your unspent BE. Water cost multiplier: ' + (decimal ? 1-water : Math.pow(.95,water)).toPrecision(5) + '. ' + (shortcut ? 'e3 shortcut: other current levels are assumed zero, not verified; target levels cannot be known.' : 'Using the entered current levels.') + ' Confirm prices in game; displayed targets are approximate.'; result.appendChild(p);
      const wrap=document.createElement('div'); wrap.className='table-wrap'; const table=document.createElement('table');
      const head=document.createElement('thead'); const hr=document.createElement('tr'); ['Egg','Current','Buy (estimate)','Target (estimate)','Note'].forEach(x=>{const th=document.createElement('th');th.textContent=x;hr.appendChild(th)});head.appendChild(hr);table.appendChild(head);
      const body=document.createElement('tbody');rows.forEach(row=>{const tr=document.createElement('tr');['name','current','buy','target','note'].forEach(key=>{const td=document.createElement('td');td.textContent=row[key];tr.appendChild(td)});body.appendChild(tr)});table.appendChild(body);wrap.appendChild(table);result.appendChild(wrap);
      const note=document.createElement('p');note.textContent='A negative budget-only reference means your existing level is above what this retirement’s per-egg share alone could fund from level 1; it does not prove you overspent previously. No negative purchases are suggested.';result.appendChild(note);
    } catch(err) { result.textContent = err.message; }
  });
  if (typeof module !== 'undefined') module.exports = {parseLog, calculate, purchases, fmt, shouldUseShortcut};
})();
