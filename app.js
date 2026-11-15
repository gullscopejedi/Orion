/* ============================================================
   EFS Calculator — Egg Farm Simulator (Roblox)
   Full calculator with accurate game formulas
   ============================================================ */

// ---- Number formatting utilities ----
const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'q', 'Q', 's', 'S', 'O', 'N', 'D'];

function parseNum(val) {
  if (typeof val === 'number') return val;
  if (!val || val === '') return 0;
  val = val.toString().trim().replace(/,/g, '');
  // scientific notation
  if (/^[eE]/.test(val)) val = '1' + val;
  if (val.includes('e') || val.includes('E')) {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  }
  // suffix notation like 5.5K, 3M
  const suffixMap = { K: 3, M: 6, B: 9, T: 12, q: 15, Q: 18, s: 21, S: 24, O: 27, N: 30, D: 33 };
  const match = val.match(/^([\d.]+)\s*([KMBTqQsSOND])$/i);
  if (match) {
    const base = parseFloat(match[1]);
    const exp = suffixMap[match[2].toUpperCase()] || suffixMap[match[2]] || 0;
    return base * Math.pow(10, exp);
  }
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

function fmtNum(n, decimals = 2) {
  if (!isFinite(n)) return '∞';
  if (n === 0) return '0';
  if (n < 0) return '-' + fmtNum(-n, decimals);
  if (n < 1000) return n.toFixed(n < 10 ? decimals : (n < 100 ? 1 : 0));
  // Check if it's very large
  const exp = Math.floor(Math.log10(n));
  if (exp >= 33) {
    return n.toExponential(decimals);
  }
  const tier = Math.floor(exp / 3);
  if (tier < SUFFIXES.length) {
    const scaled = n / Math.pow(10, tier * 3);
    return scaled.toFixed(decimals) + SUFFIXES[tier];
  }
  return n.toExponential(decimals);
}

function fmtInt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 1000) return Math.floor(n).toString();
  return fmtNum(n, 2);
}

function fmtPct(n, d = 2) {
  return (n * 100).toFixed(d) + '%';
}

function log10Safe(n) {
  if (n <= 0) return 0;
  return Math.log10(n);
}

// ---- Farmer Data ----
const FARMERS = [
  { n: 1, name: "Master Pai Mei", hireCost: 10, baseDps: 1, ability: "Tornado (Lvl 25)", note: "Attack damage, not DPS" },
  { n: 2, name: "Tarzan", hireCost: 100, baseDps: 5, ability: "-" },
  { n: 3, name: "Beowulf", hireCost: 500, baseDps: 22, ability: "Battle Shout (Lvl 75)" },
  { n: 4, name: "Robin Hood", hireCost: 2000, baseDps: 74, ability: "-" },
  { n: 5, name: "Bacon Hair", hireCost: 8000, baseDps: 245, ability: "-" },
  { n: 6, name: "Mozart", hireCost: 40000, baseDps: 976, ability: "-" },
  { n: 7, name: "Spartacus", hireCost: 200e3, baseDps: 3725, ability: "-" },
  { n: 8, name: "Julius Caesar", hireCost: 800e3, baseDps: 10859, ability: "-" },
  { n: 9, name: "Joan of Arc", hireCost: 5e6, baseDps: 47143, ability: "-" },
  { n: 10, name: "Naruto Uzumaki", hireCost: 30e6, baseDps: 186e3, ability: "Nine-Tails Chakra (Lvl 100)" },
  { n: 11, name: "Wolverine", hireCost: 200e6, baseDps: 782e3, ability: "-" },
  { n: 12, name: "Medusa", hireCost: 1.6e9, baseDps: 3721e3, ability: "-" },
  { n: 13, name: "Hercules", hireCost: 13e9, baseDps: 17010e3, ability: "-" },
  { n: 14, name: "Jack Sparrow", hireCost: 100e9, baseDps: 69480e3, ability: "Treasure Hunt (Lvl 100)" },
  { n: 15, name: "Albert Einstein", hireCost: 900e9, baseDps: 460e6, ability: "-" },
  { n: 16, name: "Old MacDonald", hireCost: 8e12, baseDps: 14383e6, ability: "Fertilizer (Lvl 100)" },
  { n: 17, name: "V", hireCost: 72e12, baseDps: 20000e6, ability: "-" },
  { n: 18, name: "Hacker", hireCost: 640e12, baseDps: 131e9, ability: "Exploit (Lvl 75)" },
  { n: 19, name: "King Midas", hireCost: 5.4e15, baseDps: 814e9, ability: "-" },
  { n: 20, name: "Queen Elizabeth II", hireCost: 48e15, baseDps: 5335e9, ability: "-" },
  { n: 21, name: "Goku", hireCost: 6e17, baseDps: 49140e9, ability: "Super Saiyan (Lvl 100)" },
  { n: 22, name: "Superman", hireCost: 18e18, baseDps: 1.086e12, ability: "-" },
  { n: 23, name: "Loki", hireCost: 7e17, baseDps: 31120e12, ability: "Decoy (Lvl 100)" },
  { n: 24, name: "Gordon Ramsay", hireCost: 2.8e19, baseDps: 7.638e15, ability: "Hamburger (Lvl 100)" },
  { n: 25, name: "Captain America", hireCost: 8.3e21, baseDps: 202e15, ability: "-" },
  { n: 26, name: "Aang", hireCost: 2.1e24, baseDps: 74690e15, ability: "-" },
  { n: 27, name: "Mikasa Ackerman", hireCost: 2e25, baseDps: 131e36, ability: "-" },
  { n: 28, name: "Michael Jordan", hireCost: 2e55, baseDps: 9.655e44, ability: "-" },
  { n: 29, name: "James Bond", hireCost: 2e70, baseDps: 7.113e57, ability: "-" },
  { n: 30, name: "Thor", hireCost: 2e85, baseDps: 5.241e70, ability: "-" },
  { n: 31, name: "Donald Trump", hireCost: 2e100, baseDps: 3.861e83, ability: "-" },
  { n: 32, name: "Sherlock Holmes", hireCost: 2e115, baseDps: 2.845e96, ability: "-" },
  { n: 33, name: "Noob", hireCost: 2e130, baseDps: 2.096e109, ability: "-" },
  { n: 34, name: "Percy Jackson", hireCost: 2e145, baseDps: 1.544e122, ability: "-" },
  { n: 35, name: "Shrek", hireCost: 2e160, baseDps: 1.138e135, ability: "-" },
  { n: 36, name: "Astronaut", hireCost: 2e175, baseDps: 8.386e147, ability: "-" },
  { n: 37, name: "The Flash", hireCost: 2e190, baseDps: 6.178e160, ability: "-" },
  { n: 38, name: "Indiana Jones", hireCost: 2e205, baseDps: 4.552e173, ability: "-" },
  { n: 39, name: "Private Ryan", hireCost: 2e220, baseDps: 3.354e186, ability: "-" },
  { n: 40, name: "Batman", hireCost: 2e235, baseDps: 2.471e199, ability: "-" },
  { n: 41, name: "Joker", hireCost: 2e500, baseDps: 1.82e425, ability: "-" },
  { n: 42, name: "Dracula", hireCost: 2e1000, baseDps: 1.341e846, ability: "-" },
  { n: 43, name: "Queen Elsa", hireCost: 2e2000, baseDps: 9.885e1678, ability: "-" },
  { n: 44, name: "Santa Claus", hireCost: 2e4000, baseDps: 7.283e3333, ability: "-" },
  { n: 45, name: "Antman", hireCost: 2e8000, baseDps: 5.366e6630, ability: "-" },
  { n: 46, name: "Bruce Lee", hireCost: 2e14000, baseDps: 3.954e11681, ability: "-" },
  { n: 47, name: "Annie", hireCost: 2e25500, baseDps: 2.913e26444, ability: "+" + "1e10,800% DPS from Tibbers" },
  { n: 48, name: "Tibbers", hireCost: 2e25500, baseDps: 2.146e26444, ability: "+" + "1e9,100% DPS from Annie" },
  { n: 49, name: "Deadpool", hireCost: 2e45500, baseDps: 1.581e61730, ability: "-" },
  { n: 50, name: "Cristiano Ronaldo", hireCost: 2e72000, baseDps: 1.165e98692, ability: "+11% Global DPS" },
  { n: 51, name: "Michael Jackson", hireCost: 2e108000, baseDps: 8.586e148592, ability: "-" },
  { n: 52, name: "Iron Man", hireCost: 2e114500, baseDps: 6.326e158831, ability: "-" },
  { n: 53, name: "D.Va", hireCost: 2e127500, baseDps: 4.661e178104, ability: "-" },
  { n: 54, name: "Developer", hireCost: 2e142200, baseDps: 3.434e199738, ability: "-" },
];

// ---- Easter Egg Data ----
const EASTER_EGGS = [
  { name: "Good Knight", category: "Damage", costType: "Constant", costBase: 1, desc: "+11% DPS per level", formula: n => 0.11 * n },
  { name: "AFK", category: "DPS (Idle)", costType: "Linear", desc: "+25% DPS when idle per level", formula: n => 0.25 * n },
  { name: "Demeaning", category: "Crit Damage", costType: "Linear", desc: "+15% crit attack damage per level", formula: n => 0.15 * n },
  { name: "Dragon", category: "Damage", costType: "Linear", desc: "+20% attack damage per level", formula: n => 0.20 * n },
  { name: "Eggplant", category: "Eggs", costType: "Linear", desc: "+30% White Eggs from Fertilizer per level", formula: n => 0.30 * n },
  { name: "Faberge", category: "Eggs", costType: "Linear", desc: "+5% White Eggs dropped per level", formula: n => 0.05 * n },
  { name: "Newton", category: "Eggs", costType: "Linear", desc: "+50% White Eggs from Eggceptions per level", formula: n => 0.50 * n },
  { name: "Wonderland", category: "Damage", costType: "Linear", desc: "+2% damage from Trophy bonuses per level", formula: n => 0.02 * n },
  { name: "Cactus", category: "Ability", costType: "Exponential", desc: "+2 sec to Fertilizer per level", formula: n => 2 * n },
  { name: "Garbage", category: "Cost", costType: "Exponential", desc: "Reduces farmer hire/upgrade cost", formula: n => 99.99999999 * (1 - Math.exp(-0.01 * n)) / 100 },
  { name: "Hourglass", category: "Boss", costType: "Exponential", desc: "Increases boss heal time", formula: n => 30 * (1 - Math.exp(-0.034 * n)) },
  { name: "Idol", category: "Progress", costType: "Exponential", desc: "Reduces chickens/level (min 2)", formula: n => 8 * (1 - Math.exp(-0.025 * n)) },
  { name: "King Cobra", category: "Boss", costType: "Exponential", desc: "Reduces boss HP (min 5 chicken equiv.)", formula: n => n }, // handled specially
  { name: "Ninja", category: "Ability", costType: "Exponential", desc: "+2 sec to Nine-Tails Chakra per level", formula: n => 2 * n },
  { name: "Present", category: "Eggs", costType: "Exponential", desc: "Chance of 10x eggs dropping", formula: n => (1 - Math.exp(-0.0025 * n)) },
  { name: "Radioactive", category: "Boss", costType: "Exponential", desc: "Increases mutated boss chance", formula: n => 75 * (1 - Math.exp(-0.013 * n)) },
  { name: "Scientist", category: "Eggs", costType: "Exponential", desc: "Increases Eggception spawn chance", formula: n => 9900 * (1 - Math.exp(-0.002 * n)) },
  { name: "Super", category: "Ability", costType: "Exponential", desc: "+2 sec to Super Saiyan per level", formula: n => 2 * n },
  { name: "Treasure", category: "Ability", costType: "Exponential", desc: "+2 sec to Treasure Hunt per level", formula: n => 2 * n },
  { name: "Turtle", category: "Damage", costType: "Turtle (n^1.5)", desc: "+0.01% DPS per attack per level", formula: n => 0.0001 * n },
  { name: "Unstable", category: "Ability", costType: "Exponential", desc: "+2 sec to Tornado per level", formula: n => 2 * n },
  { name: "Volcano", category: "Ability", costType: "Exponential", desc: "+2 sec to Battle Shout per level", formula: n => 2 * n },
];

// ---- Phoenix Egg Data ----
const PHOENIX_EGGS = [
  { name: "Acid", desc: "+50% effectiveness of King Cobra Egg per level", costType: "Linear", formula: n => 0.50 * n },
  { name: "Earth", desc: "Increases BE from mutated bosses by (n² × 1000%)", costType: "Linear", formula: n => n * n * 10 },
  { name: "Electricity", desc: "+100% effectiveness of Scientist Egg per level", costType: "Linear", formula: n => 1.0 * n },
  { name: "Fire", desc: "+100% Damage per level", costType: "Constant", costBase: 1, formula: n => 1.0 * n },
  { name: "Magnetism", desc: "+25% effectiveness of Radioactive Egg per level", costType: "Linear", formula: n => 0.25 * n },
  { name: "Sound", desc: "+12.5% effectiveness of Idol Egg per level", costType: "Linear", formula: n => 0.125 * n },
  { name: "Water", desc: "Decreases Easter Egg cost by (1-0.95^n)×100%", costType: "Linear", formula: n => (1 - Math.pow(0.95, n)) },
  { name: "Wind", desc: "+75% effectiveness of Hourglass Egg", costType: "Linear", formula: n => 0.75 * n },
];

// ---- Cost calculation functions ----

// Exponential cost: 2^(n+1), cumulative: 2^(n+1) - 3 (for levels 1..n)
// Actually cumulative from level 0 to n: sum of 2^(k+1) for k=0..n-1 = 2(2^n - 1) = 2^(n+1) - 2
// But the wiki says 2^(n+1) - 3 which accounts for first level being 2 BE (2^1 = 2)
function expCostAtLevel(currentLevel) {
  return Math.pow(2, currentLevel + 1);
}

function expCumulativeCost(targetLevel) {
  if (targetLevel <= 0) return 0;
  return Math.pow(2, targetLevel + 1) - 3; // from wiki
}

function expMaxLevels(budget) {
  if (budget <= 0) return 0;
  return Math.floor(Math.log2(budget + 1) - 1);
}

// Linear cost: level up cost = currentLevel + 1, cumulative = n(n+1)/2
function linearCostAtLevel(currentLevel) {
  return currentLevel + 1;
}

function linearCumulativeCost(targetLevel) {
  if (targetLevel <= 0) return 0;
  return 0.5 * targetLevel * (targetLevel + 1);
}

function linearMaxLevels(budget) {
  if (budget <= 0) return 0;
  return Math.floor(Math.sqrt(2 * budget + 0.25) - 0.5);
}

// Turtle cost: n^1.5, cumulative: sum of k^1.5 for k=1..n
function turtleCostAtLevel(currentLevel) {
  return Math.pow(currentLevel + 1, 1.5);
}

function turtleCumulativeCost(targetLevel) {
  let total = 0;
  for (let k = 1; k <= targetLevel; k++) {
    total += Math.pow(k, 1.5);
  }
  return total;
}

function turtleMaxLevels(budget) {
  let total = 0;
  let level = 0;
  while (true) {
    const next = Math.pow(level + 1, 1.5);
    if (total + next > budget) break;
    total += next;
    level++;
    if (level > 1e6) break;
  }
  return level;
}

// Constant cost: 1 BE per level
function constantCumulativeCost(targetLevel) {
  return targetLevel;
}

function constantMaxLevels(budget) {
  return Math.floor(budget);
}

// Apply Water Egg discount to exponential costs
function waterDiscount(waterLevel) {
  // Reduces cost by (1 - 0.95^n) * 100%
  // So multiplier = 0.95^n
  return Math.pow(0.95, waterLevel);
}

// Get cost functions based on cost type
function getCumulativeCostFn(costType) {
  switch (costType) {
    case 'Exponential': return expCumulativeCost;
    case 'Linear': return linearCumulativeCost;
    case 'Constant': return constantCumulativeCost;
    case 'Turtle (n^1.5)': return turtleCumulativeCost;
    default: return linearCumulativeCost;
  }
}

function getMaxLevelsFn(costType) {
  switch (costType) {
    case 'Exponential': return expMaxLevels;
    case 'Linear': return linearMaxLevels;
    case 'Constant': return constantMaxLevels;
    case 'Turtle (n^1.5)': return turtleMaxLevels;
    default: return linearMaxLevels;
  }
}

function getNextLevelCost(costType, currentLevel, waterLvl = 0) {
  let cost;
  switch (costType) {
    case 'Exponential': cost = expCostAtLevel(currentLevel); break;
    case 'Linear': cost = linearCostAtLevel(currentLevel); break;
    case 'Constant': cost = 1; break;
    case 'Turtle (n^1.5)': cost = turtleCostAtLevel(currentLevel); break;
    default: cost = currentLevel + 1;
  }
  // Apply water egg discount for exponential
  if (costType === 'Exponential') {
    cost *= waterDiscount(waterLvl);
  }
  return cost;
}

// ---- Farmer DPS calculation ----
// Every 25 levels above 200: 4x damage boost (cumulative)
// Every 1000 levels: one-time 10x boost
function farmerDpsMultiplier(level) {
  if (level <= 1) return 1;
  let mult = 1;
  // 4x boost every 25 levels above 200
  if (level > 200) {
    const steps = Math.floor((level - 200) / 25);
    // But cap at 1000 boundary
    const stepsBefore1000 = Math.min(steps, Math.floor(800 / 25)); // steps from 200 to <1000
    mult *= Math.pow(4, stepsBefore1000);
    // After 1000, resume
    if (level > 1000) {
      const stepsAfter1000 = Math.floor((level - 1000) / 25);
      mult *= Math.pow(4, stepsAfter1000);
    }
  }
  // 10x at 1000
  if (level >= 1000) {
    mult *= 10;
  }
  return mult;
}

function calcFarmerDps(farmer, level) {
  if (level <= 0) return 0;
  return farmer.baseDps * farmerDpsMultiplier(level);
}

// ---- Farm mechanics calculations ----

function chickensPerLevel(farmLevel, idolLevel, soundLevel) {
  // Base: 10 chickens/level for farm levels 1-499
  // +0.1 per 500 levels
  let base = 10;
  const hundreds = Math.floor((farmLevel - 1) / 500);
  base += hundreds * 0.1;
  
  // Idol Egg reduction: 8 * (1 - e^(-0.025*n))
  let idolReduction = 0;
  if (idolLevel > 0) {
    idolReduction = 8 * (1 - Math.exp(-0.025 * idolLevel));
  }
  
  // Sound Egg boosts idol effectiveness: each level adds another -1 chickens/level
  // Sound Egg effect hinges on Idol being at max effective level
  let soundReduction = 0;
  if (soundLevel > 0 && idolLevel > 0) {
    soundReduction = soundLevel; // each sound egg level adds -1
  }
  
  const totalReduction = idolReduction + soundReduction;
  return Math.max(2, Math.round(base - totalReduction));
}

function bossHpMultiplier(farmLevel, kingCobraLevel, acidLevel) {
  // Base: x10 for farm levels 1-499
  // +0.4x per 500 farm levels complete
  let base = 10;
  const hundreds = Math.floor((farmLevel - 1) / 500);
  base += hundreds * 0.4;
  
  // King Cobra reduction
  let kcReduction = 0;
  if (kingCobraLevel > 0) {
    kcReduction = 5 * (1 - Math.exp(-0.013 * kingCobraLevel));
    // Max -5x from KC alone at KC level 18715
  }
  
  // Acid Egg: +50% effectiveness of KC per level → -2.5x per acid level
  let acidReduction = 0;
  if (acidLevel > 0) {
    acidReduction = 2.5 * acidLevel * (1 + 0.5 * acidLevel > 0 ? 1 : 0);
    // simplified: acid adds -2.5 per level, enhanced by KC
  }
  
  const totalReduction = kcReduction + acidReduction;
  return Math.max(5, base - totalReduction);
}

function bossTimer(farmLevel, hourglassLevel, windLevel) {
  // Base: 30 seconds for farm levels 1-499
  // Hourglass: 30 * (1 - e^(-0.034*n)) seconds added
  let base = 30;
  
  let hgBonus = 0;
  if (hourglassLevel > 0) {
    hgBonus = 30 * (1 - Math.exp(-0.034 * hourglassLevel));
  }
  
  // Wind: +75% effectiveness of hourglass per level
  let windMult = 1;
  if (windLevel > 0) {
    windMult = 1 + 0.75 * windLevel;
  }
  
  return base + hgBonus * windMult;
}

function mutatedBossChance(radioLevel, magnetLevel) {
  // Base: 25% mutated chance
  // Radioactive: +75 * (1 - e^(-0.013*n)) %
  let base = 25;
  
  let radioBonus = 0;
  if (radioLevel > 0) {
    radioBonus = 75 * (1 - Math.exp(-0.013 * radioLevel));
  }
  
  // Magnetism: +25% effectiveness of radioactive per level
  let magnetMult = 1;
  if (magnetLevel > 0) {
    magnetMult = 1 + 0.25 * magnetLevel;
  }
  
  return Math.min(100, base + radioBonus * magnetMult);
}

function eggceptionChance(farmLevel, scientistLevel, electricityLevel, newtonLevel) {
  // Base: 1% for farm levels 1-499
  // Decreases by ~0.994x per 500 farm levels
  let base = 1;
  const hundreds = Math.floor((farmLevel - 1) / 500);
  base *= Math.pow(0.994, hundreds);
  
  // Scientist: 9900 * (1 - e^(-0.002*n)) % increase
  let sciBonus = 0;
  if (scientistLevel > 0) {
    sciBonus = 9900 * (1 - Math.exp(-0.002 * scientistLevel));
  }
  
  // Electricity: +100% effectiveness of scientist per level
  let elecMult = 1;
  if (electricityLevel > 0) {
    elecMult = 1 + 1.0 * electricityLevel;
  }
  
  const totalPct = base + sciBonus * elecMult;
  return Math.min(100, totalPct);
}

function blackEggsPerBoss(farmLevel, earthLevel, rpMultiplier) {
  // BE = max(1, floor((10 * earthLevel^2 + 1) * ((level-80)/25)^1.3))
  // With RP: BE = (10 * earthLevel^2 + 1) * (20 * (1 + multiplier)^(level/5 - 20) + ((level-80)/25)^1.3)
  const earthMult = 10 * earthLevel * earthLevel + 1;
  if (farmLevel < 100) return 0;
  
  const levelTerm = Math.pow((farmLevel - 80) / 25, 1.3);
  
  if (rpMultiplier > 0) {
    const rpTerm = 20 * Math.pow(1 + rpMultiplier, farmLevel / 5 - 20);
    return Math.max(1, Math.floor(earthMult * (rpTerm + levelTerm)));
  }
  return Math.max(1, Math.floor(earthMult * levelTerm));
}

function rpMultiplier(geTotal) {
  // Multiplier = (1/100) * (25 - 23 * e^(-0.0003 * GE))
  return (1 / 100) * (25 - 23 * Math.exp(-0.0003 * geTotal));
}

function rpPercent(geTotal) {
  // RP% = 25 - 23 * e^(-0.0003 * GE)
  return 25 - 23 * Math.exp(-0.0003 * geTotal);
}

function goldenEggsFromBE(be) {
  // GE = 5 * log10(BE)
  if (be <= 0) return 0;
  return 5 * log10Safe(be);
}

function farmerHireCost(farmer, garbageLevel) {
  // Garbage reduces cost by 99.99999999 * (1 - e^(-0.01*n)) %
  const reduction = garbageLevel > 0 ? 99.99999999 * (1 - Math.exp(-0.01 * garbageLevel)) / 100 : 0;
  return farmer.hireCost * (1 - reduction);
}

// ---- UI Logic ----

// State
const state = {
  farmerLevels: {},
  easterEggLevels: {},
  phoenixEggLevels: {},
};

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// Toast notification
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Save / Load / Reset
document.getElementById('btn-save').addEventListener('click', () => {
  localStorage.setItem('efs-calc-state', JSON.stringify(state));
  showToast('State saved! 💾');
});

document.getElementById('btn-load').addEventListener('click', () => {
  const saved = localStorage.getItem('efs-calc-state');
  if (saved) {
    Object.assign(state, JSON.parse(saved));
    refreshAll();
    showToast('State loaded! 📂');
  } else {
    showToast('No saved state found.');
  }
});

document.getElementById('btn-reset').addEventListener('click', () => {
  if (confirm('Reset all inputs and farmer/egg levels?')) {
    state.farmerLevels = {};
    state.easterEggLevels = {};
    state.phoenixEggLevels = {};
    localStorage.removeItem('efs-calc-state');
    document.querySelectorAll('input').forEach(inp => {
      if (inp.type === 'number') inp.value = inp.min || 0;
      else if (inp.type === 'text') inp.value = '';
    });
    refreshAll();
    showToast('All reset! 🗑️');
  }
});

// ---- Dashboard ----
function updateDashboard() {
  const farmLevel = parseNum(document.getElementById('dash-farm-level').value) || 1;
  const rpPct = parseNum(document.getElementById('dash-rp').value) || 0;
  const rpMult = rpPct / 100;
  
  // Get egg levels from EE table
  const eeLevels = {};
  document.querySelectorAll('#ee-tbody tr').forEach(row => {
    const name = row.dataset.name;
    const lvl = parseInt(row.querySelector('input')?.value) || 0;
    eeLevels[name] = lvl;
  });
  
  // Get PE levels from PE table
  const peLevels = {};
  document.querySelectorAll('#pe-tbody tr').forEach(row => {
    const name = row.dataset.name;
    const lvl = parseInt(row.querySelector('input')?.value) || 0;
    peLevels[name] = lvl;
  });
  
  const idolLevel = eeLevels['Idol'] || 0;
  const soundLevel = peLevels['Sound'] || 0;
  const kcLevel = eeLevels['King Cobra'] || 0;
  const acidLevel = peLevels['Acid'] || 0;
  const hgLevel = eeLevels['Hourglass'] || 0;
  const windLevel = peLevels['Wind'] || 0;
  const radioLevel = eeLevels['Radioactive'] || 0;
  const magnetLevel = peLevels['Magnetism'] || 0;
  const scientistLevel = eeLevels['Scientist'] || 0;
  const electricityLevel = peLevels['Electricity'] || 0;
  const newtonLevel = eeLevels['Newton'] || 0;
  const dragonLevel = eeLevels['Dragon'] || 0;
  const gkLevel = eeLevels['Good Knight'] || 0;
  const afkLevel = eeLevels['AFK'] || 0;
  const fabergeLevel = eeLevels['Faberge'] || 0;
  const demeaningLevel = eeLevels['Demeaning'] || 0;
  const fireLevel = peLevels['Fire'] || 0;
  const earthLevel = peLevels['Earth'] || 0;
  const waterLevel = peLevels['Water'] || 0;
  
  // Total DPS from farmers
  let totalDps = 0;
  let attackDmg = 0;
  FARMERS.forEach(f => {
    const lvl = state.farmerLevels[f.n] || 0;
    if (lvl > 0) {
      if (f.n === 1) {
        attackDmg = calcFarmerDps(f, lvl);
      } else {
        totalDps += calcFarmerDps(f, lvl);
      }
    }
  });
  
  // Trophy bonus: base +250% per trophy, Wonderland adds level %
  const trophies = parseInt(document.getElementById('dash-trophies').value) || 0;
  const wonderlandLevel = (eeLevels['Wonderland'] || 0);
  const trophyBonusPercent = (trophies * 250) + wonderlandLevel; // user described: 400k Wonderland = +400k%
  const trophyMult = 1 + (trophyBonusPercent / 100); // e.g. 400k% = x4001

  // Apply Trophy to total DPS
  totalDps *= trophyMult;
  attackDmg *= trophyMult;

  // Apply Good Knight: +11% per level (additive)
  const gkMult = 1 + 0.11 * gkLevel;
  totalDps *= gkMult;
  attackDmg *= gkMult;
  
  // Apply Dragon: +20% per level to attack damage
  const dragonMult = 1 + 0.20 * dragonLevel;
  attackDmg *= dragonMult;
  
  // Apply Fire Phoenix: +100% per level to damage
  const fireMult = 1 + 1.0 * fireLevel;
  totalDps *= fireMult;
  attackDmg *= fireMult;
  
  // Crit
  const critChance = (parseNum(document.getElementById('dash-crit-chance').value) || 0) / 100;
  const critDmg = parseNum(document.getElementById('dash-crit-dmg').value) || 10;
  const critMult = 1 + critChance * (critDmg - 1);
  
  // Effective DPS
  const effDps = totalDps * critMult;
  
  // AFK
  const afkMult = 1 + 0.25 * afkLevel;
  
  // Cost reduction from garbage
  const garbageLvl = eeLevels['Garbage'] || 0;
  const costReduction = garbageLvl > 0 ? 99.99999999 * (1 - Math.exp(-0.01 * garbageLvl)) : 0;
  
  // Faberge egg multiplier on eggs
  const fabergeMult = 1 + 0.05 * fabergeLevel;
  
  // Demeaning crit damage bonus
  const demeaningBonus = 1 + 0.15 * demeaningLevel;
  
  // Update display
  document.getElementById('sum-dps').textContent = fmtNum(totalDps);
  document.getElementById('sum-atk').textContent = fmtNum(attackDmg);
  document.getElementById('sum-eff-dps').textContent = fmtNum(effDps);
  document.getElementById('sum-chickens').textContent = chickensPerLevel(farmLevel, idolLevel, soundLevel);
  document.getElementById('sum-boss-hp').textContent = 'x' + bossHpMultiplier(farmLevel, kcLevel, acidLevel).toFixed(1);
  document.getElementById('sum-boss-timer').textContent = bossTimer(farmLevel, hgLevel, windLevel).toFixed(1) + 's';
  document.getElementById('sum-eggception').textContent = eggceptionChance(farmLevel, scientistLevel, electricityLevel, newtonLevel).toFixed(2) + '%';
  document.getElementById('sum-mutated').textContent = mutatedBossChance(radioLevel, magnetLevel).toFixed(1) + '%';
  document.getElementById('sum-afk').textContent = 'x' + afkMult.toFixed(2);
  document.getElementById('sum-cost-red').textContent = costReduction.toFixed(2) + '%';
  
  // BE per boss estimate
  const beTotal = parseNum(document.getElementById('dash-be-total').value);
  const rpM = rpMult;
  const bePerBoss = blackEggsPerBoss(farmLevel, earthLevel, rpM);
  document.getElementById('sum-be-boss').textContent = bePerBoss > 0 ? fmtNum(bePerBoss) : '—';
  
  // Recommendations
  updateRecommendations(eeLevels, peLevels, farmLevel, totalDps, effDps);
}

function updateRecommendations(eeLevels, peLevels, farmLevel, totalDps, effDps) {
  const recs = [];
  
  // Good Knight is always priority (cheapest)
  if ((eeLevels['Good Knight'] || 0) < 50) {
    recs.push({ text: '💰 Level up Good Knight Egg — it\'s the cheapest (+11% DPS per level, only 1 BE each).', type: 'good' });
  }
  
  // Check if player should focus on Dragon/Faberge
  if ((eeLevels['Dragon'] || 0) < 10) {
    recs.push({ text: '⚔️ Invest in Dragon Egg for +20% attack damage per level (linear cost).', type: '' });
  }
  
  if ((eeLevels['Faberge'] || 0) < 10) {
    recs.push({ text: '🥚 Faberge Egg gives +5% eggs per level — great for early progression.', type: '' });
  }
  
  // Boss stuck?
  if (farmLevel % 5 === 0 && farmLevel > 5) {
    const kcLvl = eeLevels['King Cobra'] || 0;
    const hgLvl = eeLevels['Hourglass'] || 0;
    if (kcLvl < 5 || hgLvl < 5) {
      recs.push({ text: '🐔 Struggling on bosses? Level King Cobra (reduces boss HP) and Hourglass (more time).', type: 'important' });
    }
  }
  
  // Pre-rebirth tips
  if (farmLevel > 200 && (eeLevels['Newton'] || 0) < 5) {
    recs.push({ text: '🔬 Before rebirth, make sure to invest in the Main 7 Easter Eggs with your Black Eggs.', type: '' });
  }
  
  // Earth egg
  if ((peLevels['Earth'] || 0) === 0 && farmLevel > 500) {
    recs.push({ text: '🌍 Consider leveling Earth Phoenix Egg — boosts Black Egg earnings significantly.', type: 'good' });
  }
  
  if (recs.length === 0) {
    recs.push({ text: '✅ Looking good! Keep pushing farm levels and investing in the Main 7 Easter Eggs.', type: 'good' });
  }
  
  const recDiv = document.getElementById('recommendations');
  recDiv.innerHTML = recs.map(r => `<div class="rec-item ${r.type}">${r.text}</div>`).join('');
}

// ---- Farmer Table ----
function buildFarmerTable() {
  const showTo = parseInt(document.getElementById('farmer-show').value) || 26;
  const garbageLevel = parseInt(document.getElementById('farmer-garbage').value) || 0;
  const availableWE = parseNum(document.getElementById('farmer-we').value);
  const tbody = document.getElementById('farmer-tbody');
  tbody.innerHTML = '';
  
  FARMERS.slice(0, showTo).forEach(f => {
    const lvl = state.farmerLevels[f.n] || 0;
    const dps = calcFarmerDps(f, Math.max(lvl, 1));
    const hireCost = farmerHireCost(f, garbageLevel);
    const lvlDps = calcFarmerDps(f, lvl);
    const ratio = lvl > 0 ? lvlDps / (availableWE || 1) : 0;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${f.n}</td>
      <td><strong>${f.name}</strong></td>
      <td>${fmtNum(hireCost)}</td>
      <td>${fmtNum(f.baseDps)}</td>
      <td><input type="number" min="0" value="${lvl}" data-farmer="${f.n}" class="farmer-level-input"></td>
      <td class="num">${fmtNum(lvlDps)}</td>
      <td class="num">${fmtNum(ratio)}</td>
      <td>${f.ability}</td>
    `;
    tbody.appendChild(tr);
  });
  
  // Level change listeners
  document.querySelectorAll('.farmer-level-input').forEach(inp => {
    inp.addEventListener('change', (e) => {
      const fNum = parseInt(e.target.dataset.farmer);
      state.farmerLevels[fNum] = parseInt(e.target.value) || 0;
      updateDashboard();
    });
  });
}

document.getElementById('farmer-calc-btn').addEventListener('click', () => {
  buildFarmerTable();
  
  // Optimal spending
  const availableWE = parseNum(document.getElementById('farmer-we').value);
  const garbageLevel = parseInt(document.getElementById('farmer-garbage').value) || 0;
  const showTo = parseInt(document.getElementById('farmer-show').value) || 26;
  
  if (availableWE > 0) {
    const card = document.getElementById('farmer-optimal-card');
    card.style.display = 'block';
    
    // Calculate DPS per WE for next hire/level of each farmer
    const options = [];
    FARMERS.slice(0, showTo).forEach(f => {
      const curLvl = state.farmerLevels[f.n] || 0;
      const curDps = calcFarmerDps(f, curLvl);
      
      // Option 1: Hire (if level 0)
      if (curLvl === 0) {
        const cost = farmerHireCost(f, garbageLevel);
        const newDps = calcFarmerDps(f, 1);
        if (cost <= availableWE) {
          options.push({ farmer: f, action: 'Hire', cost, dpsGain: newDps - 0, ratio: (newDps) / cost });
        }
      }
      
      // Option 2: Level up
      if (curLvl > 0) {
        // Upgrade cost scales with farmer - simplified: next level cost = hireCost * (curLvl + 1)
        // Actually the game uses a scaling formula. We'll approximate: cost ≈ hireCost * level^0.7
        // More accurately, the upgrade cost is typically hireCost * some multiplier
        const upgradeCost = farmerHireCost(f, garbageLevel) * Math.pow(curLvl, 0.8);
        const newDps = calcFarmerDps(f, curLvl + 1);
        const dpsGain = newDps - curDps;
        if (upgradeCost <= availableWE && dpsGain > 0) {
          options.push({ farmer: f, action: `Level ${curLvl} → ${curLvl + 1}`, cost: upgradeCost, dpsGain, ratio: dpsGain / upgradeCost });
        }
      }
    });
    
    options.sort((a, b) => b.ratio - a.ratio);
    const top5 = options.slice(0, 5);
    
    const resultsDiv = document.getElementById('farmer-optimal-results');
    if (top5.length === 0) {
      resultsDiv.innerHTML = '<p>Not enough White Eggs for any purchase. Keep farming!</p>';
    } else {
      resultsDiv.innerHTML = `
        <div class="results-panel">
          <p style="color:var(--text-secondary);margin-bottom:0.5rem">Best DPS/WE ratio options:</p>
          ${top5.map((o, i) => `
            <div class="result-row">
              <span>#${i + 1} ${o.farmer.name}: ${o.action}</span>
              <span>Cost: ${fmtNum(o.cost)} WE | +${fmtNum(o.dpsGain)} DPS (ratio: ${fmtNum(o.ratio)})</span>
            </div>
          `).join('')}
        </div>
      `;
    }
  }
});

// ---- Easter Egg Table ----
function buildEasterEggTable() {
  const waterLevel = parseInt(document.getElementById('ee-water').value) || 0;
  const tbody = document.getElementById('ee-tbody');
  tbody.innerHTML = '';
  
  EASTER_EGGS.forEach(ee => {
    const lvl = state.easterEggLevels[ee.name] || 0;
    const effect = ee.formula(lvl);
    const nextCost = getNextLevelCost(ee.costType, lvl, waterLevel);
    const cumCostFn = getCumulativeCostFn(ee.costType);
    const cumCost = cumCostFn(lvl);
    
    const tr = document.createElement('tr');
    tr.dataset.name = ee.name;
    tr.innerHTML = `
      <td><strong>${ee.name}</strong></td>
      <td>${ee.category}</td>
      <td>${ee.costType}</td>
      <td><input type="number" min="0" value="${lvl}" data-ee="${ee.name}" class="ee-level-input"></td>
      <td class="num">${formatEffect(ee.name, effect)}</td>
      <td class="num">${fmtNum(nextCost)} BE</td>
      <td class="num">${fmtNum(cumCost)} BE</td>
    `;
    tbody.appendChild(tr);
  });
  
  document.querySelectorAll('.ee-level-input').forEach(inp => {
    inp.addEventListener('change', (e) => {
      state.easterEggLevels[e.target.dataset.ee] = parseInt(e.target.value) || 0;
      updateDashboard();
    });
  });
}

function formatEffect(name, value) {
  switch (name) {
    case 'Good Knight': return `+${(value * 100).toFixed(0)}% DPS`;
    case 'AFK': return `+${(value * 100).toFixed(0)}% idle DPS`;
    case 'Demeaning': return `+${(value * 100).toFixed(0)}% crit dmg`;
    case 'Dragon': return `+${(value * 100).toFixed(0)}% atk dmg`;
    case 'Eggplant': return `+${(value * 100).toFixed(0)}% fertilizer eggs`;
    case 'Faberge': return `+${(value * 100).toFixed(0)}% eggs`;
    case 'Newton': return `+${(value * 100).toFixed(0)}% eggception eggs`;
    case 'Wonderland': return `+${(value * 100).toFixed(0)}% trophy dmg`;
    case 'Cactus': return `+${value.toFixed(0)}s fertilizer`;
    case 'Garbage': return `${(value * 100).toFixed(2)}% cost reduction`;
    case 'Hourglass': return `+${value.toFixed(1)}s boss timer`;
    case 'Idol': return `-${value.toFixed(2)} chickens/level`;
    case 'King Cobra': return `-${value.toFixed(1)}x boss HP (w/ Acid)`;
    case 'Ninja': return `+${value.toFixed(0)}s nine-tails`;
    case 'Present': return `${(value * 100).toFixed(2)}% 10x eggs`;
    case 'Radioactive': return `+${value.toFixed(1)}% mutated chance`;
    case 'Scientist': return `+${value.toFixed(0)}% eggception`;
    case 'Super': return `+${value.toFixed(0)}s super saiyan`;
    case 'Treasure': return `+${value.toFixed(0)}s treasure hunt`;
    case 'Turtle': return `+${(value * 100).toFixed(2)}% DPS/attack`;
    case 'Unstable': return `+${value.toFixed(0)}s tornado`;
    case 'Volcano': return `+${value.toFixed(0)}s battle shout`;
    default: return value.toFixed(2);
  }
}

// Auto-distribution
document.getElementById('ee-auto-dist-btn')?.addEventListener('click', () => {
  const budget = parseNum(document.getElementById('ee-budget').value);
  if (budget <= 0) {
    showToast('Enter a BE budget first!');
    return;
  }
  
  const waterLevel = parseInt(document.getElementById('ee-water').value) || 0;
  const main7 = ['AFK', 'Demeaning', 'Dragon', 'Eggplant', 'Faberge', 'Newton', 'Wonderland'];
  const perEgg = budget / main7.length;
  
  const results = document.getElementById('ee-auto-results');
  let html = `<p style="color:var(--text-secondary);margin-bottom:0.5rem">Splitting ${fmtNum(budget)} BE across 7 eggs (${fmtNum(perEgg)} each):</p>`;
  
  main7.forEach(name => {
    const maxLevels = linearMaxLevels(perEgg);
    const actualCost = linearCumulativeCost(maxLevels);
    html += `
      <div class="result-row">
        <span>${name}</span>
        <span>${maxLevels} levels (costs ${fmtNum(actualCost)} BE)</span>
      </div>
    `;
  });
  
  results.innerHTML = html;
});

// Cost calculator
function buildEeCostSelect() {
  const sel = document.getElementById('ee-cost-egg');
  sel.innerHTML = '';
  EASTER_EGGS.forEach(ee => {
    sel.innerHTML += `<option value="${ee.name}">${ee.name} (${ee.costType})</option>`;
  });
}

document.getElementById('ee-cost-calc-btn')?.addEventListener('click', () => {
  const eggName = document.getElementById('ee-cost-egg').value;
  const budget = parseNum(document.getElementById('ee-cost-be').value);
  const currentLvl = parseInt(document.getElementById('ee-cost-current').value) || 0;
  const waterLevel = parseInt(document.getElementById('ee-water').value) || 0;
  
  const ee = EASTER_EGGS.find(e => e.name === eggName);
  if (!ee || budget <= 0) {
    showToast('Enter valid inputs!');
    return;
  }
  
  // Calculate max levels from current level
  let canAfford = 0;
  let totalCost = 0;
  let lvl = currentLvl;
  
  if (ee.costType === 'Exponential') {
    const discountedBudget = budget / waterDiscount(waterLevel);
    // cumulative from 0 to currentLvl+canAfford minus cumulative from 0 to currentLvl
    // Cost for levels currentLvl to currentLvl+n = sum of 2^(k+1) for k=currentLvl..currentLvl+n-1
    // = 2^(currentLvl+n+1) - 2^(currentLvl+1)
    // We need this <= budget/waterDiscount
    const startTerm = Math.pow(2, currentLvl + 1);
    // 2^(currentLvl+n+1) - startTerm <= discountedBudget
    // 2^(currentLvl+n+1) <= discountedBudget + startTerm
    // currentLvl+n+1 <= log2(discountedBudget + startTerm)
    // n <= log2(discountedBudget + startTerm) - currentLvl - 1
    canAfford = Math.floor(Math.log2(discountedBudget + startTerm) - currentLvl - 1);
    canAfford = Math.max(0, canAfford);
    totalCost = (Math.pow(2, currentLvl + canAfford + 1) - startTerm) * waterDiscount(waterLevel);
  } else if (ee.costType === 'Linear') {
    // sum from k=currentLvl+1 to currentLvl+n of k
    // = sum(1..currentLvl+n) - sum(1..currentLvl)
    // = (currentLvl+n)(currentLvl+n+1)/2 - currentLvl(currentLvl+1)/2
    // Binary search or solve quadratic
    let lo = 0, hi = 1e9;
    while (lo < hi) {
      const mid = Math.floor((lo + hi + 1) / 2);
      const newLvl = currentLvl + mid;
      const cost = 0.5 * newLvl * (newLvl + 1) - 0.5 * currentLvl * (currentLvl + 1);
      if (cost <= budget) lo = mid;
      else hi = mid - 1;
    }
    canAfford = lo;
    const newLvl = currentLvl + canAfford;
    totalCost = 0.5 * newLvl * (newLvl + 1) - 0.5 * currentLvl * (currentLvl + 1);
  } else if (ee.costType === 'Constant') {
    canAfford = Math.floor(budget);
    totalCost = canAfford;
  } else {
    // Turtle or other
    let lvl2 = currentLvl;
    while (true) {
      const nextCost = turtleCostAtLevel(lvl2);
      if (totalCost + nextCost > budget) break;
      totalCost += nextCost;
      lvl2++;
      canAfford++;
      if (canAfford > 1e6) break;
    }
  }
  
  const resultDiv = document.getElementById('ee-cost-result');
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = `
    <strong>${eggName} Egg</strong><br>
    Can afford <strong class="val-good">${canAfford} levels</strong> (from ${currentLvl} → ${currentLvl + canAfford})<br>
    Total cost: <strong>${fmtNum(totalCost)} BE</strong><br>
    Remaining: <strong>${fmtNum(budget - totalCost)} BE</strong><br>
    Effect at level ${currentLvl + canAfford}: <strong>${formatEffect(eggName, ee.formula(currentLvl + canAfford))}</strong>
  `;
});

// ---- Phoenix Egg Table ----
function buildPhoenixEggTable() {
  const tbody = document.getElementById('pe-tbody');
  tbody.innerHTML = '';
  
  PHOENIX_EGGS.forEach(pe => {
    const lvl = state.phoenixEggLevels[pe.name] || 0;
    const effect = pe.formula(lvl);
    
    // Phoenix eggs cost: linear = n GE per level (next level = currentLevel + 1)
    // Fire egg: constant cost = 1 GE
    let nextCost;
    if (pe.costType === 'Constant') {
      nextCost = 1;
    } else {
      nextCost = lvl + 1;
    }
    
    const cumCost = pe.costType === 'Constant' ? lvl : 0.5 * lvl * (lvl + 1);
    
    const tr = document.createElement('tr');
    tr.dataset.name = pe.name;
    tr.innerHTML = `
      <td><strong>${pe.name}</strong></td>
      <td><input type="number" min="0" value="${lvl}" data-pe="${pe.name}" class="pe-level-input"></td>
      <td class="num">${formatPeEffect(pe.name, effect)}</td>
      <td class="num">${nextCost} GE</td>
      <td class="num">${fmtInt(cumCost)} GE</td>
    `;
    tbody.appendChild(tr);
  });
  
  document.querySelectorAll('.pe-level-input').forEach(inp => {
    inp.addEventListener('change', (e) => {
      state.phoenixEggLevels[e.target.dataset.pe] = parseInt(e.target.value) || 0;
      updateDashboard();
    });
  });
}

function formatPeEffect(name, value) {
  switch (name) {
    case 'Acid': return `+${(value * 100).toFixed(0)}% KC effectiveness`;
    case 'Earth': return `+${(value * 100).toFixed(0)}% BE from mutated`;
    case 'Electricity': return `+${(value * 100).toFixed(0)}% Scientist effectiveness`;
    case 'Fire': return `+${(value * 100).toFixed(0)}% damage`;
    case 'Magnetism': return `+${(value * 100).toFixed(0)}% Radioactive eff.`;
    case 'Sound': return `+${(value * 100).toFixed(1)}% Idol effectiveness`;
    case 'Water': return `${(value * 100).toFixed(2)}% EE cost reduction`;
    case 'Wind': return `+${(value * 100).toFixed(0)}% Hourglass eff.`;
    default: return value.toFixed(2);
  }
}

// PE Cost Calculator
function buildPeCostSelect() {
  const sel = document.getElementById('pe-cost-egg');
  sel.innerHTML = '';
  PHOENIX_EGGS.forEach(pe => {
    sel.innerHTML += `<option value="${pe.name}">${pe.name}</option>`;
  });
}

document.getElementById('pe-cost-calc-btn').addEventListener('click', () => {
  const eggName = document.getElementById('pe-cost-egg').value;
  const ge = parseInt(document.getElementById('pe-cost-ge').value) || 0;
  const currentLvl = parseInt(document.getElementById('pe-cost-current').value) || 0;
  
  const pe = PHOENIX_EGGS.find(p => p.name === eggName);
  if (!pe) return;
  
  let canAfford = 0;
  let totalCost = 0;
  
  if (pe.costType === 'Constant') {
    canAfford = ge;
    totalCost = ge;
  } else {
    // Linear: cost for level k is k GE, total from currentLvl to currentLvl+n
    // sum from k=currentLvl+1 to currentLvl+n of k
    // = n*(2*currentLvl + n + 1)/2
    // Binary search
    let lo = 0, hi = 1e9;
    while (lo < hi) {
      const mid = Math.floor((lo + hi + 1) / 2);
      const cost = mid * (2 * currentLvl + mid + 1) / 2;
      if (cost <= ge) lo = mid;
      else hi = mid - 1;
    }
    canAfford = lo;
    totalCost = canAfford * (2 * currentLvl + canAfford + 1) / 2;
  }
  
  const resultDiv = document.getElementById('pe-cost-result');
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = `
    <strong>${eggName} Phoenix Egg</strong><br>
    Can afford <strong class="val-good">${canAfford} levels</strong> (from ${currentLvl} → ${currentLvl + canAfford})<br>
    Total cost: <strong>${fmtInt(totalCost)} GE</strong><br>
    Remaining: <strong>${fmtInt(ge - totalCost)} GE</strong><br>
    Effect at level ${currentLvl + canAfford}: <strong>${formatPeEffect(eggName, pe.formula(currentLvl + canAfford))}</strong>
  `;
});

// ---- Black Egg Calculator ----
document.getElementById('be-calc-btn').addEventListener('click', () => {
  const earthLevel = parseInt(document.getElementById('be-earth').value) || 0;
  const radioLevel = parseInt(document.getElementById('be-radio').value) || 0;
  const rpPct = parseNum(document.getElementById('be-rp').value) || 0;
  const targetLevel = parseInt(document.getElementById('be-target-level').value) || 1000;
  const rpMult = rpPct / 100;
  
  const resultsDiv = document.getElementById('be-results');
  const breakdownTbody = document.getElementById('be-breakdown-tbody');
  
  // Calculate BE at various levels
  let html = '';
  let breakdownHtml = '';
  let cumulativeBE = 0;
  
  const checkpoints = [];
  for (let lvl = 100; lvl <= targetLevel; lvl += Math.max(1, Math.floor(targetLevel / 20))) {
    checkpoints.push(lvl);
  }
  if (!checkpoints.includes(targetLevel)) checkpoints.push(targetLevel);
  
  checkpoints.forEach(lvl => {
    const bePerBoss = blackEggsPerBoss(lvl, earthLevel, rpMult);
    // Cumulative: sum BE from all bosses from level 100 to this level
    let cumSum = 0;
    for (let bl = 100; bl <= lvl; bl += 5) {
      cumSum += blackEggsPerBoss(bl, earthLevel, rpMult);
    }
    
    breakdownHtml += `
      <tr>
        <td>${lvl}</td>
        <td class="num">${fmtNum(bePerBoss)}</td>
        <td class="num">${fmtNum(cumSum)}</td>
      </tr>
    `;
  });
  
  // Summary
  const beAtTarget = blackEggsPerBoss(targetLevel, earthLevel, rpMult);
  const mutatedPct = mutatedBossChance(radioLevel, 0);
  
  html = `
    <div class="result-row">
      <span>BE per boss at level ${targetLevel}:</span>
      <span class="num val-good">${fmtNum(beAtTarget)}</span>
    </div>
    <div class="result-row">
      <span>Mutated Boss Chance:</span>
      <span class="num">${mutatedPct.toFixed(1)}%</span>
    </div>
    <div class="result-row">
      <span>Expected BE/boss (with mutation):</span>
      <span class="num">${fmtNum(beAtTarget * mutatedPct / 100)}</span>
    </div>
    <div class="result-row">
      <span>Golden Eggs equivalent:</span>
      <span class="num val-gold">${goldenEggsFromBE(beAtTarget).toFixed(1)} GE</span>
    </div>
    <div class="result-row">
      <span>RP Multiplier:</span>
      <span class="num">${(rpMult * 100).toFixed(3)}%</span>
    </div>
  `;
  
  resultsDiv.innerHTML = html;
  breakdownTbody.innerHTML = breakdownHtml;
});

// GE from BE calculator
document.getElementById('ge-calc-btn').addEventListener('click', () => {
  const totalBE = parseNum(document.getElementById('ge-from-be-total').value);
  const prevBE = parseNum(document.getElementById('ge-from-be-prev').value);
  
  const resultsDiv = document.getElementById('ge-results');
  
  if (totalBE <= 0) {
    resultsDiv.innerHTML = '<p>Enter total BE earned.</p>';
    return;
  }
  
  const totalGE = goldenEggsFromBE(totalBE);
  const prevGE = goldenEggsFromBE(prevBE);
  const newGE = totalGE - prevGE;
  
  resultsDiv.innerHTML = `
    <div class="result-row">
      <span>Total GE from all BE:</span>
      <span class="num val-gold">${totalGE.toFixed(1)}</span>
    </div>
    <div class="result-row">
      <span>GE already claimed:</span>
      <span class="num">${prevGE.toFixed(1)}</span>
    </div>
    <div class="result-row">
      <span>New GE to claim:</span>
      <span class="num val-good">${Math.max(0, newGE).toFixed(1)}</span>
    </div>
  `;
});

// ---- Rebirth Calculator ----
document.getElementById('rp-calc-btn').addEventListener('click', () => {
  const ge = parseInt(document.getElementById('rp-ge').value) || 0;
  const resultsDiv = document.getElementById('rp-results');
  
  const rp = rpPercent(ge);
  const mult = rpMultiplier(ge);
  
  resultsDiv.innerHTML = `
    <div class="result-row">
      <span>Rebirth Power:</span>
      <span class="num val-good">${rp.toFixed(4)}%</span>
    </div>
    <div class="result-row">
      <span>BE Multiplier:</span>
      <span class="num">x${(1 + mult).toFixed(6)}</span>
    </div>
    <div class="result-row">
      <span>Progress to 25%:</span>
      <span class="num">${(rp / 25 * 100).toFixed(1)}%</span>
    </div>
    <div class="result-row">
      <span>Approx GE needed for 24%:</span>
      <span class="num val-info">~10,500</span>
    </div>
  `;
});

document.getElementById('ret-calc-btn').addEventListener('click', () => {
  const currentLevel = parseInt(document.getElementById('ret-current-level').value) || 1;
  const earthLevel = parseInt(document.getElementById('ret-earth').value) || 0;
  const radioLevel = parseInt(document.getElementById('ret-radio').value) || 0;
  const rpPct = parseNum(document.getElementById('ret-rp').value) || 0;
  const lifetimeGE = parseInt(document.getElementById('ret-lifetime-ge').value) || 0;
  const prevBE = parseNum(document.getElementById('ret-prev-be').value);
  const rpMult = rpPct / 100;
  
  const resultsDiv = document.getElementById('ret-results');
  
  // Calculate total BE from this run
  let totalBE = 0;
  for (let bl = 100; bl <= currentLevel; bl += 5) {
    totalBE += blackEggsPerBoss(bl, earthLevel, rpMult);
  }
  
  // New GE
  const totalGE = goldenEggsFromBE(totalBE + prevBE);
  const prevGE = goldenEggsFromBE(prevBE);
  const newGE = Math.max(0, totalGE - prevGE);
  
  // New RP
  const newRP = rpPercent(lifetimeGE + newGE);
  
  resultsDiv.innerHTML = `
    <div class="result-row">
      <span>Estimated BE this run:</span>
      <span class="num val-good">${fmtNum(totalBE)}</span>
    </div>
    <div class="result-row">
      <span>Golden Eggs to claim:</span>
      <span class="num val-gold">${newGE.toFixed(1)}</span>
    </div>
    <div class="result-row">
      <span>New lifetime GE:</span>
      <span class="num">${(lifetimeGE + newGE).toFixed(1)}</span>
    </div>
    <div class="result-row">
      <span>New Rebirth Power:</span>
      <span class="num val-info">${newRP.toFixed(4)}%</span>
    </div>
    <div class="result-row">
      <span>Bosses defeated (mutated):</span>
      <span class="num">${Math.floor((currentLevel - 95) / 5 * mutatedBossChance(radioLevel, 0) / 100)}</span>
    </div>
    <div class="result-row">
      <span>Recommendation:</span>
      <span class="num">${newGE >= 5 ? '✅ Worth retiring!' : '⏳ Keep farming for more GE.'}</span>
    </div>
  `;
});

// ---- Boss Calculator ----
document.getElementById('boss-calc-btn').addEventListener('click', () => {
  const bossLevel = parseInt(document.getElementById('boss-level').value) || 5;
  const playerDps = parseNum(document.getElementById('boss-dps').value);
  const kcLevel = parseInt(document.getElementById('boss-kc').value) || 0;
  const acidLevel = parseInt(document.getElementById('boss-acid').value) || 0;
  const hgLevel = parseInt(document.getElementById('boss-hg').value) || 0;
  const windLevel = parseInt(document.getElementById('boss-wind').value) || 0;
  
  const resultsDiv = document.getElementById('boss-results');
  
  const chickensPerLvl = chickensPerLevel(bossLevel, 0, 0); // raw for HP calc
  const baseBossHP = chickensPerLvl * bossHpMultiplier(bossLevel, kcLevel, acidLevel);
  const timer = bossTimer(bossLevel, hgLevel, windLevel);
  
  // Chicken HP scales with farm level
  // Each chicken at level L has roughly L * some_factor HP
  // Simplified: chicken HP = level * base_factor
  const chickenHP = bossLevel * 2; // rough scaling
  const totalBossHP = baseBossHP * chickenHP;
  
  const minDps = totalBossHP / timer;
  const canBeat = playerDps >= minDps;
  const timeNeeded = playerDps > 0 ? totalBossHP / playerDps : Infinity;
  
  resultsDiv.innerHTML = `
    <div class="result-row">
      <span>Boss Level:</span>
      <span class="num">${bossLevel}</span>
    </div>
    <div class="result-row">
      <span>Chickens equivalent:</span>
      <span class="num">${fmtNum(baseBossHP)}</span>
    </div>
    <div class="result-row">
      <span>Boss HP Mult:</span>
      <span class="num">x${bossHpMultiplier(bossLevel, kcLevel, acidLevel).toFixed(1)}</span>
    </div>
    <div class="result-row">
      <span>Est. Boss HP:</span>
      <span class="num">${fmtNum(totalBossHP)}</span>
    </div>
    <div class="result-row">
      <span>Boss Timer:</span>
      <span class="num">${timer.toFixed(1)}s</span>
    </div>
    <div class="result-row">
      <span>Min DPS Required:</span>
      <span class="num ${canBeat ? 'val-good' : 'val-bad'}">${fmtNum(minDps)}</span>
    </div>
    <div class="result-row">
      <span>Your DPS:</span>
      <span class="num">${fmtNum(playerDps)}</span>
    </div>
    <div class="result-row">
      <span>Time to Kill:</span>
      <span class="num ${timeNeeded <= timer ? 'val-good' : 'val-bad'}">${isFinite(timeNeeded) ? timeNeeded.toFixed(1) + 's' : '∞'}</span>
    </div>
    <div class="result-row">
      <span>Can Beat Boss?</span>
      <span class="${canBeat ? 'val-good' : 'val-bad'}">${canBeat ? '✅ YES' : '❌ NO — Need ' + fmtNum(minDps - playerDps) + ' more DPS'}</span>
    </div>
  `;
});

// Boss requirement table
function buildBossReqTable() {
  const tbody = document.getElementById('boss-req-tbody');
  tbody.innerHTML = '';
  
  const levels = [5, 10, 15, 20, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000];
  levels.forEach(lvl => {
    const chickensPerLvl = chickensPerLevel(lvl, 0, 0);
    const hpMult = bossHpMultiplier(lvl, 0, 0);
    const timer = bossTimer(lvl, 0, 0);
    const chickenHP = lvl * 2;
    const totalHP = chickensPerLvl * hpMult * chickenHP;
    const minDps = totalHP / timer;
    
    tbody.innerHTML += `
      <tr>
        <td>${lvl}</td>
        <td class="num">${fmtNum(chickensPerLvl * hpMult)}</td>
        <td>${timer.toFixed(0)}s</td>
        <td class="num val-warn">${fmtNum(minDps)}</td>
      </tr>
    `;
  });
}

// ---- Initialize ----
function refreshAll() {
  buildFarmerTable();
  if (document.getElementById('ee-tbody')) buildEasterEggTable();
  buildPhoenixEggTable();
  buildBossReqTable();
  if (document.getElementById('ee-cost-egg')) buildEeCostSelect();
  buildPeCostSelect();
  updateDashboard();
}

// Auto-recalculate on dashboard input changes
document.querySelectorAll('#tab-dashboard input').forEach(inp => {
  inp.addEventListener('input', updateDashboard);
});

// EE table and PE table changes trigger dashboard update
document.addEventListener('change', (e) => {
  if (e.target.classList.contains('ee-level-input') || e.target.classList.contains('pe-level-input') || e.target.classList.contains('farmer-level-input')) {
    updateDashboard();
  }
});

// Water egg changes rebuild EE table
document.getElementById('ee-water')?.addEventListener('change', buildEasterEggTable);

// Initialize
refreshAll();

// The LifeTraveler planner is implemented in big-planner.js using logarithms.
