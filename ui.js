// The page around the sim: parameters, control strip, charts and the season dial.
// The sim core reads PARAMETERS (keys are the old input ids) and never touches these elements.

var PARAMETERS = {
    // environment
    cellSize: 10, runCount: 10, simDuration: 200000, updatePeriod: 50, drawPeriod: 100,
    maxFood: 200, maxTotalFood: 100000, foodAbundance: 0, seasons: 1,
    // population
    initPop: 100, maxEnergy: 500, minEnergy: 5, energyDecay: 5,
    hungerThreshold: 500, foodIntake: 10, matureTime: 100,
    maxCarryingCapacity: 100, minCarryingCapacity: 1,
    maxEggLayTime: 100, minEggLayTime: 1, breedAge: 100, breedAgeToggle: false,
    forageWeight: 2, breedWeight: 7,
    minDeathChance: 0.0001, maxDeathChance: 0.01, minAge: 100,
    mutationRate: 0.05, maxDev: 0.1,
    standbyThreshold: 100, standbyPenalty: 0.1, standbyPenaltyToggle: false,
    // rules
    breedToggle: false, breedStandby: true, geneToggle: false,
    randomOrQueueToggle: true, sumOrMaxToggle: true,
    geneLifeToggle: true, geneBreedSpeedToggle: true, geneFoodCarryToggle: true,
    geneEnergyToggle: true, geneRoleToggle: true,
    // developer
    downloadResults: false, printOngoingResults: false, 'simple GUI': false,
    drawAntPortion: 1, drawTileabstraction: 1,
};
// four seasons' worth of food settings; "seasons" says how many of them the year uses
for (var s = 1; s <= 4; s++) {
    PARAMETERS['seasonLength' + s] = 1000;
    PARAMETERS['foodRegenRate' + s] = 0.01;
    PARAMETERS['foodRegenAmount' + s] = 200;
    PARAMETERS['foodReplenishRate' + s] = 0;
    PARAMETERS['foodReplenishAmount' + s] = 0;
    PARAMETERS['foodDensity' + s] = 3;
}

// Controls in groups. `resets` starts a new colony when released; everything else applies live.
var CONTROL_GROUPS = [
    { title: 'Colony', open: true, schema: [
        { key: 'initPop', label: 'Starting ants', min: 10, max: 500, step: 10, resets: true },
        { key: 'forageWeight', label: 'Forage weight', min: 0, max: 20, step: 0.5 },
        { key: 'breedWeight', label: 'Breed weight', min: 0, max: 20, step: 0.5 },
        { key: 'mutationRate', label: 'Mutation rate', min: 0, max: 0.5, step: 0.01 },
        { key: 'maxDev', label: 'Mutation size', min: 0, max: 0.5, step: 0.01 },
        { key: 'drawPeriod', label: 'Cycles per frame', min: 1, max: 500, step: 1 },
    ] },
    { title: 'Genes and rules', schema: [
        { key: 'geneRoleToggle', label: 'Role gene works' },
        { key: 'geneLifeToggle', label: 'Breeders live longer' },
        { key: 'geneBreedSpeedToggle', label: 'Breeders breed faster' },
        { key: 'geneFoodCarryToggle', label: 'Foragers carry more food' },
        { key: 'geneEnergyToggle', label: 'Foragers have more energy' },
        { key: 'breedToggle', label: 'Breed without checking for food' },
        { key: 'breedStandby', label: 'Breeders wait when they can’t breed' },
        { key: 'randomOrQueueToggle', label: 'Breeders queue (off: picked at random)' },
        { key: 'sumOrMaxToggle', label: 'Fitness is a sum (off: a max)' },
        { key: 'breedAgeToggle', label: 'Breeding needs a minimum age' },
        { key: 'standbyPenaltyToggle', label: 'Standby costs breeders' },
    ] },
    { title: 'Ant life', schema: [
        { key: 'maxEnergy', label: 'Max energy', min: 50, max: 2000, step: 10 },
        { key: 'minEnergy', label: 'Min energy', min: 1, max: 100, step: 1 },
        { key: 'energyDecay', label: 'Energy decay', min: 0, max: 50, step: 1 },
        { key: 'hungerThreshold', label: 'Hunger threshold', min: 0, max: 2000, step: 10 },
        { key: 'foodIntake', label: 'Food intake', min: 1, max: 100, step: 1 },
        { key: 'maxCarryingCapacity', label: 'Max carrying capacity', min: 1, max: 500, step: 1 },
        { key: 'minCarryingCapacity', label: 'Min carrying capacity', min: 1, max: 100, step: 1 },
        { key: 'matureTime', label: 'Larva maturation (cycles)', min: 1, max: 1000, step: 1 },
        { key: 'maxEggLayTime', label: 'Max egg-laying time', min: 1, max: 1000, step: 1 },
        { key: 'minEggLayTime', label: 'Min egg-laying time', min: 1, max: 100, step: 1 },
        { key: 'breedAge', label: 'Minimum breeding age', min: 0, max: 1000, step: 10 },
        { key: 'standbyThreshold', label: 'Max standby', min: 0, max: 1000, step: 10 },
        { key: 'standbyPenalty', label: 'Standby penalty', min: 0, max: 1, step: 0.01 },
        { key: 'minDeathChance', label: 'Min chance to die', min: 0, max: 0.01, step: 0.0001 },
        { key: 'maxDeathChance', label: 'Max chance to die', min: 0, max: 0.1, step: 0.001 },
        { key: 'minAge', label: 'Minimum age', min: 0, max: 1000, step: 10 },
    ] },
    { title: 'World and food', schema: [
        { key: 'cellSize', label: 'Cell size (px)', options: [5, 8, 10, 12, 16, 20], resets: true },
        { key: 'maxFood', label: 'Max food per cell', min: 10, max: 5000, step: 10 },
        { key: 'maxTotalFood', label: 'Max food on the map', min: 1000, max: 500000, step: 1000 },
        { key: 'foodAbundance', label: 'Starting food', min: 0, max: 1, step: 0.01, resets: true },
        { key: 'seasons', label: 'Seasons per year', options: [1, 2, 3, 4], resets: true },
        { key: 'simDuration', label: 'Run length (cycles)', min: 10000, max: 1000000, step: 10000 },
        { key: 'updatePeriod', label: 'Cycles per chart point', min: 10, max: 500, step: 10, resets: true },
    ] },
];
for (var s2 = 1; s2 <= 4; s2++) {
    CONTROL_GROUPS.push({ title: 'Season ' + s2, season: s2, schema: [
        { key: 'seasonLength' + s2, label: 'Length (cycles)', min: 100, max: 100000, step: 100, resets: true },
        { key: 'foodDensity' + s2, label: 'Food density', min: 0, max: 20, step: 1 },
        { key: 'foodRegenRate' + s2, label: 'Regrowth chance', min: 0, max: 1, step: 0.001 },
        { key: 'foodRegenAmount' + s2, label: 'Regrowth amount', min: 0, max: 2000, step: 10 },
        { key: 'foodReplenishRate' + s2, label: 'Replenish chance', min: 0, max: 1, step: 0.001 },
        { key: 'foodReplenishAmount' + s2, label: 'Replenish amount', min: 0, max: 2000, step: 10 },
    ] });
}
CONTROL_GROUPS.push({ title: 'Developer', schema: [
    { key: 'printOngoingResults', label: 'Print results to the console' },
    { key: 'downloadResults', label: 'Download results at the end of a run' },
    { key: 'drawAntPortion', label: 'Fraction of ants drawn', min: 0, max: 1, step: 0.05 },
] });

var $ = function (id) { return document.getElementById(id); };
var SEASON_TONES = ['ok', 'gold', 'warn', 'info'];

// Copy PARAMETERS into the sim's globals without restarting, and keep the current season's food rules.
function applyLive() {
    var g = window.ENGINE;
    if (!g) return;
    g.readParameters();
    var n = g.currentSeason + 1;
    SEASON_LENGTH = PARAMETERS['seasonLength' + n];
    FOOD_REGEN_AMOUNT = PARAMETERS['foodRegenAmount' + n];
    FOOD_REPLENISH_AMOUNT = PARAMETERS['foodReplenishAmount' + n];
    FOOD_REGEN_RATE = PARAMETERS['foodRegenRate' + n];
    FOOD_REPLENISH_RATE = PARAMETERS['foodReplenishRate' + n];
    FOOD_DENSITY = PARAMETERS['foodDensity' + n];
}

function newColony() { if (window.ENGINE) window.ENGINE.newGame(); setRunLabel(); }

function setRunLabel() {
    var b = $('runBtn');
    if (b && window.ENGINE) b.textContent = window.ENGINE.isPaused ? 'Run' : 'Pause';
}

function buildControls() {
    var host = $('controls');
    host.innerHTML = '';
    var buttons = [
        { label: 'Pause', primary: true, onClick: function () {
            var g = window.ENGINE; if (g.isPaused) g.resumeGame(); else g.pauseGame(); setRunLabel(); } },
        { label: 'Step', onClick: function () { window.ENGINE.pauseGame(); window.ENGINE.isStepping = true; setRunLabel(); } },
        { label: 'New colony', onClick: newColony },
    ];

    CONTROL_GROUPS.forEach(function (g) {
        var d = document.createElement('details');
        d.className = 'cb-disclosure group';
        if (g.open) d.open = true;
        if (g.season) d.dataset.season = g.season;
        d.innerHTML = '<summary>' + g.title + '</summary><div class="body"></div>';
        host.appendChild(d);
        // the first panel carries the run buttons; the rest get none (CB would add a Reset)
        CB.sim.controls(d.querySelector('.body'), g.schema, PARAMETERS, {
            onChange: applyLive,
            onReset: newColony,
            buttons: g.open ? buttons : [],
        });
        if (g.open) d.querySelector('.btns button').id = 'runBtn';
    });
    showSeasons();
}

// Only the seasons the year uses get a panel.
function showSeasons() {
    document.querySelectorAll('details[data-season]').forEach(function (d) {
        d.hidden = +d.dataset.season > PARAMETERS.seasons;
    });
}

// The year as a dial: one band per season.
function setClock() {
    var clock = $('clock'), from = 0, bands = [];
    for (var i = 1; i <= PARAMETERS.seasons; i++) {
        var len = PARAMETERS['seasonLength' + i];
        bands.push({ from: from, to: from + len, label: 'season ' + i, tone: SEASON_TONES[i - 1] });
        from += len;
    }
    clock.setAttribute('period', from);
    clock.setAttribute('bands', JSON.stringify(bands));
}

// One record per chart point, kept by the page so the sim stays as it was.
var DM = null;
function newDM() {
    return { ants: [], larvae: [], foraging: [], laying: [], waiting: [], food: [], genMin: [], genAvg: [], genMax: [] };
}

function wireCharts(mound) {
    var dx = PARAMETERS.updatePeriod;
    $('population').data = { dx: dx, series: [
        { label: 'ants', values: DM.ants, color: 'var(--cb-series-1)' },
        { label: 'larvae', values: DM.larvae, color: 'var(--cb-series-2)' } ] };
    $('roles').data = { dx: dx, series: [
        // the world's own ant colours, so the chart reads against the map
        { label: 'foraging', values: DM.foraging, color: '#00BB00' },
        { label: 'laying eggs', values: DM.laying, color: '#AA00AA' },
        { label: 'waiting to breed', values: DM.waiting, color: '#FF0000' } ] };
    $('food').data = { dx: dx, series: [
        { label: 'stored food', values: DM.food, color: 'var(--cb-series-4)' } ] };
    $('generation').data = { dx: dx, series: [
        { label: 'min', values: DM.genMin, color: 'var(--cb-muted)' },
        { label: 'mean', values: DM.genAvg, color: 'var(--cb-series-1)' },
        { label: 'max', values: DM.genMax, color: 'var(--cb-muted)' } ] };
    $('roleGene').data = { dx: dx, columns: mound.roleHistogram };
    $('roleMeme').data = { dx: dx, columns: mound.roleMemeHistogram };
    $('breedGene').data = { dx: dx, columns: mound.breedableGeneHistogram };
    $('breedMeme').data = { dx: dx, columns: mound.breedableMemeHistogram };
}

// Hook the sim: a new colony gets fresh records, and every chart period adds a row.
var _setup = GameEngine.prototype.setup;
GameEngine.prototype.setup = function () {
    _setup.call(this);
    DM = newDM();
    setClock();
    showSeasons();
    wireCharts(this.mound);
};
var _period = Mound.prototype.updatePeriod;
Mound.prototype.updatePeriod = function () {
    _period.call(this);
    DM.ants.push(this.antCount);
    DM.larvae.push(this.larvaCount);
    // what the colony is doing right now, by each ant's current task
    var forage = 0, lay = 0, wait = 0;
    for (var i = 0; i < this.colony.length; i++) {
        var r = this.colony[i] && this.colony[i].role;
        if (r === EXPLOIT || r === EXPLORE) forage++;
        else if (r === LAY_EGG || r === EGG_DOWN_TIME) lay++;
        else if (r === STANDBY) wait++;
    }
    DM.foraging.push(forage);
    DM.laying.push(lay);
    DM.waiting.push(wait);
    DM.food.push(this.foodStorage);
    DM.genMin.push(this.minGen);
    DM.genAvg.push(this.averageGen);
    DM.genMax.push(this.maxGen);
};

// The dial follows the sim's cycle count.
(function pump() {
    var g = window.ENGINE;
    if (g) $('clock').value = g.updateCounter;
    requestAnimationFrame(pump);
})();

buildControls();
setClock();
CB.theme.picker && $('picker').appendChild(CB.theme.picker());
