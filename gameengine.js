window.requestAnimFrame = (function () {
    return function (/* function */ callback, /* DOMElement */ element) {
		window.setTimeout(callback, 4);
	};

})();
/*
window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
*/

function GameEngine() {
    this.entities = [];

    this.tiles = null;
    this.ctx = null;
    this.canvas = document.getElementById("gameWorld");

    this.surfaceWidth = null;
    this.surfaceHeight = null;

    this.isPaused = false;
    this.ticked = false;
    this.isStepping = false;

    this.play = null;
    this.pause = null;
    this.step = null;
    this.save = null;
    this.load = null;

    this.newMap = null;
    this.new = null;
    this.newAnt = null;

    this.mound = null;
    this.avgAges = [];

    this.roleGraph;
    this.forageGraph;
    this.roleMemeGraph;
    this.forageMemeGraph;
  
    this.breedableGenes;
    this.breedableMemes;

    for (var i = 0; i < 9; i++) {
        this.avgAges.push({
            breeders: [],
            generalists: [],
            foragers: [],
            total: []
        });
    };

    this.runNum = 0;
};

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    // this.socket = io.connect("http://24.16.255.56:8888");
    this.play = document.getElementById("play");
    this.pause = document.getElementById("pause");
    this.step = document.getElementById("step");
    this.save = document.getElementById("save");
    this.load = document.getElementById("load");

    this.mouse = new Mouse(this, "black", "grey", 5, 1);

    this.newMap = document.getElementById("newMap");
    this.new = document.getElementById("new");
    this.newAnt = document.getElementById("newAnt");

    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;

    this.timer = new Timer();
    this.fastTimer = new Timer();
    this.settings = this.setSettings();
    this.currentSetting = -1;
    this.avgAges = [];
    for (var i = 0; i < 9; i++) {
        this.avgAges.push({
            breeders: [],
            generalists: [],
            foragers: [],
            total: []
        });
    };
    this.runNum = 0;
    this.setParameters();
    this.setup();
    this.startInput();
    /*
	this.socket.on("connect", function () {
        console.log("Socket connected.")
	});
	*/

    console.log('sim initialized');
};

GameEngine.prototype.readParameters = function() {
	// main
	CELL_SIZE = parseInt(PARAMETERS["cellSize"]);
	XSIZE = Math.floor(800/CELL_SIZE);
	YSIZE = Math.floor(600/CELL_SIZE);

	GAME_LIFE_TIME = parseInt(PARAMETERS["simDuration"]);
	UPDATE_PERIOD = parseInt(PARAMETERS["updatePeriod"]);
	DRAW_PERIOD = parseInt(PARAMETERS["drawPeriod"]);
	MAX_RUN_COUNT = parseInt(PARAMETERS["runCount"]);

	// mound
	BREED_AGE = parseInt(PARAMETERS["breedAge"]);
	BREED_AGE_TOGGLE = PARAMETERS["breedAgeToggle"];

	INIT_ANTS = parseInt(PARAMETERS["initPop"]);

	EXTREME_GENE_TOGGLE = PARAMETERS["geneToggle"];
	RANDOM_OR_QUEUE_TOGGLE = PARAMETERS["randomOrQueueToggle"];
	SUM_OR_MAX_FITNESS_TOGGLE = PARAMETERS["sumOrMaxToggle"];
	ROLE_GENE_TOGGLE = PARAMETERS["geneRoleToggle"];

	GENE_LIFE_TOGGLE = PARAMETERS["geneLifeToggle"];
	MIN_AGE = parseInt(PARAMETERS["minAge"]);
	MIN_CHANCE_TO_DIE = Number(PARAMETERS["minDeathChance"]);
	MAX_CHANCE_TO_DIE = Number(PARAMETERS["maxDeathChance"]);

	GENE_BREED_SPEED_TOGGLE = PARAMETERS["geneBreedSpeedToggle"];
	MAX_LAY_TIME = parseInt(PARAMETERS["maxEggLayTime"]);
	MIN_LAY_TIME = parseInt(PARAMETERS["minEggLayTime"]);

	GENE_FOOD_CARRY_TOGGLE = PARAMETERS["geneFoodCarryToggle"];
	MAX_ANT_FOOD = parseInt(PARAMETERS["maxCarryingCapacity"]);
	MIN_ANT_FOOD = parseInt(PARAMETERS["minCarryingCapacity"]);

	GENE_ENERGY_TOGGLE = PARAMETERS["geneEnergyToggle"];
	MAX_ENERGY = parseInt(PARAMETERS["maxEnergy"]);
	MIN_ENERGY = parseInt(PARAMETERS["minEnergy"]);
	ENERGY_DECAY = parseInt(PARAMETERS["energyDecay"]);

	BREED_TOGGLE = PARAMETERS["breedToggle"];
	//EFFECT_TOGGLE = PARAMETERS["effectToggle"];
	BREEDER_STANDBY = PARAMETERS["breedStandby"];
	STANDBY_THRESHOLD = parseInt(PARAMETERS["standbyThreshold"]);

	BREEDER_PENALTY_TOGGLE = PARAMETERS["standbyPenaltyToggle"];
	BREEDER_PENALTY_AMOUNT = Number(PARAMETERS["standbyPenalty"]);

	FORAGE_WEIGHT = Number(PARAMETERS["forageWeight"]);
	BREED_WEIGHT = Number(PARAMETERS["breedWeight"]);

	HUNGER_THRESHHOLD = parseInt(PARAMETERS["hungerThreshold"]);
	EAT_AMOUNT = parseInt(PARAMETERS["foodIntake"]);
	MUTATION_RATE = Number(PARAMETERS["mutationRate"]);
	MAX_DEVIATION = Number(PARAMETERS["maxDev"]);

	// larva

	MATURE_TIME = parseInt(PARAMETERS["matureTime"]);

	//tile
	MAX_PHEROMONE = MAX_ENERGY;
	MULT = Math.ceil(MAX_PHEROMONE/10);
	DECAY_RATE = Math.ceil(MAX_PHEROMONE/200);
	MAX_TOTAL_FOOD = parseInt(PARAMETERS["maxTotalFood"]);
	MAX_TILE_FOOD = parseInt(PARAMETERS["maxFood"]);
	FOOD_ABUNDANCE = Number(PARAMETERS["foodAbundance"]);
	NUM_OF_SEASONS = Number(PARAMETERS["seasons"]);

	SEASON_LENGTH = Number(PARAMETERS["seasonLength1"]);
	FOOD_REGEN_AMOUNT = Number(PARAMETERS["foodRegenAmount1"]);
	FOOD_REPLENISH_AMOUNT = Number(PARAMETERS["foodReplenishAmount1"]);
	FOOD_REGEN_RATE = Number(PARAMETERS["foodRegenRate1"]);
	FOOD_REPLENISH_RATE = Number(PARAMETERS["foodReplenishRate1"]);
	FOOD_DENSITY = Number(PARAMETERS["foodDensity1"]);

}

GameEngine.prototype.setParameters = function() {
	this.readParameters();
	this.entities = [];
	this.updateCounter = 0;
	this.seasonCounter = 0;
	this.currentSeason = 0;
}

GameEngine.prototype.setup = function() {
	var squares = [];
	var tiles = [];

	for (var i = 0; i < YSIZE; i++) {
		squares.push([]);
		for (var j = 0; j < XSIZE; j++) {
			var tile = new Tile(this, j, i);
			squares[i].push(tile);
			tiles.push(tile);
			this.addEntity(tile);
		}
	}

	this.tiles = tiles;

	for (var i = 0; i < YSIZE; i++) {
		for (var j = 0; j < XSIZE; j++) {
			var neighbors = [];
			if (i === 0) {
				neighbors.push(squares[YSIZE-1][j]);
				if (j === 0) {
					neighbors.push(squares[i][j+1]);
					neighbors.push(squares[i+1][j]);
					neighbors.push(squares[i][XSIZE-1]);
				} else if (j === XSIZE-1) {
					neighbors.push(squares[i][0]);
					neighbors.push(squares[i+1][j]);
					neighbors.push(squares[i][j-1]);
				} else {
					neighbors.push(squares[i][j+1]);
					neighbors.push(squares[i+1][j]);
					neighbors.push(squares[i][j-1]);
				}
			} else if (i === YSIZE-1) {
				neighbors.push(squares[i-1][j]);
				if (j === 0) {
					neighbors.push(squares[i][j+1]);
					neighbors.push(squares[0][j]);
					neighbors.push(squares[i][XSIZE-1]);
				} else if (j === XSIZE-1) {
					neighbors.push(squares[i][0]);
					neighbors.push(squares[0][j]);
					neighbors.push(squares[i][j-1]);
				} else {
					neighbors.push(squares[i][j+1]);
					neighbors.push(squares[0][j]);
					neighbors.push(squares[i][j-1]);
				}
			} else if (j === 0) {
				neighbors.push(squares[i-1][j]);
				neighbors.push(squares[i][j+1]);
				neighbors.push(squares[i+1][j]);
				neighbors.push(squares[i][XSIZE-1]);
			} else if (j === XSIZE-1) {
				neighbors.push(squares[i-1][j]);
				neighbors.push(squares[i][0]);
				neighbors.push(squares[i+1][j]);
				neighbors.push(squares[i][j-1]);
			} else {
				neighbors.push(squares[i-1][j]);
				neighbors.push(squares[i][j+1]);
				neighbors.push(squares[i+1][j]);
				neighbors.push(squares[i][j-1]);
			}
			squares[i][j].setNeighbors(neighbors);
		}
	}
	this.mound = squares[Math.round(YSIZE/2)-1][Math.round(XSIZE/2)-1].setHome();
  this.mound.tiles = squares;
	// (pretty sure this is not how you have to do this) this.mound.setTiles(squares);
	/*
	this.addEntity(this.mound.roleHistogramData);
	this.addEntity(this.mound.forageHistogramData);
	this.addEntity(this.mound.graph1);
	this.addEntity(this.mound.graph2);
	*/

	for (var i = 0; i < INIT_ANTS; i++) {
		this.mound.spawnAnt();
	}

  // charts: see ui.js (the page draws them from the mound's records)
}

GameEngine.prototype.start = function () {
	console.log("starting sim");
	this.pauseGame();
    var that = this;
	(function simLoop() {
		that.loop();
		requestAnimFrame(simLoop, that.ctx.canvas);
	})();
}

GameEngine.prototype.restart = function() {
	//console.clear();
	var str = this.buildDownloadData(this.mound, this.mound.graph1, this.mound.graph2,
									 this.mound.roleHistogramData, this.mound.forageHistogramData);

  if(DOWNLOAD_RESULTS) {
    	this.download(document.getElementById("filename").textContent+".csv", str);
  }
	var runNum = Number(document.getElementById("runNum").innerHTML);
	runNum++;
	document.getElementById("runNum").innerHTML = runNum;
	console.log("restarting sim");
	foodTotal = 0;
  this.setParameters();
	this.setup();
}

GameEngine.prototype.setSettings = function() {
	var settings = [];

	for (var i = 0; i < 3; i++) {
		settings.push({
			roleToggle: true,
			scatteredOrDense: true,
			extremeGenes: false,
			breedLife: false,
			breedSpeed: false,
			foodCarry: false,
			energy: false,
			fWeight: 1,
			bWeight: 1
		});
	}
	// for (var i = 0; i < 9; i++) {
	// 	settings.push({
	// 		roleToggle: true,
	// 		scatteredOrDense: true,
	// 		extremeGenes: false,
	// 		breedLife: false,
	// 		breedSpeed: false,
	// 		foodCarry: false,
	// 		energy: false,
	// 		fWeight: 1,
	// 		bWeight: 1
	// 	});
	// }

	settings[0].foodCarry = true;
	settings[0].energy = true;
	settings[0].bWeight = 4;
	settings[0].fWeight = 1;

	settings[1].energy = true;
	settings[1].bWeight = 3;
	settings[1].fWeight = 1;

	settings[2].foodCarry = true;
	settings[2].bWeight = 9;
	settings[2].fWeight = 2;
  
	// settings[0].roleToggle = false;
  //
	// settings[1].bWeight = 5;
	// settings[1].fWeight = 2;
  //
	// settings[2].foodCarry = true;
	// settings[2].energy = true;
	// settings[2].bWeight = 7;
	// settings[2].fWeight = 2;
  //
	// settings[3].breedLife = true;
	// settings[3].breedSpeed = true;
	// settings[3].bWeight = 5;
	// settings[3].fWeight = 2;
  //
	// settings[4].breedLife = true;
	// settings[4].breedSpeed = true;
	// settings[4].foodCarry = true;
	// settings[4].energy = true;
	// settings[4].bWeight = 3;
	// settings[4].fWeight = 2;
  //
	// settings[5].energy = true;
	// settings[5].bWeight = 5;
	// settings[5].fWeight = 2;
  //
	// settings[6].foodCarry = true;
	// settings[6].bWeight = 6;
	// settings[6].fWeight = 2;
  //
	// settings[7].breedSpeed = true;
	// settings[7].bWeight = 5;
	// settings[7].fWeight = 2;
  //
	// settings[8].breedLife = true;
	// settings[8].bWeight = 5;
	// settings[8].fWeight = 2;

	/*
	settings[5].breedSpeed = false;
	settings[5].energy = false;

	settings[6].foodCarry = false;
	settings[6].energy = false;

	settings[7].breedSpeed = false;
	settings[7].foodCarry = false;
	settings[7].energy = false;

	settings[8].breedSpeed = false;
	settings[8].foodCarry = false;
	settings[8].energy = false;
	settings[8].extremeGenes = true;

	settings[9].breedLife = false;
	settings[9].breedSpeed = false;
	settings[9].foodCarry = false;
	settings[9].energy = false;
	settings[9].extremeGenes = true;

	settings[10].breedLife = false;
	settings[10].breedSpeed = false;
	settings[10].foodCarry = true;
	settings[10].energy = false;
	settings[10].extremeGenes = false;
	settings[10].fWeight = 1;
	settings[10].bWeight = 3;


	settings[9].breedSpeed = false;

	settings[10].foodCarry = false;

	settings[11].energy = false;

	settings[12].breedSpeed = false;
	settings[12].foodCarry = false;

	settings[13].breedSpeed = false;
	settings[13].energy = false;

	settings[14].foodCarry = false;
	settings[14].energy = false;

	settings[15].breedSpeed = false;
	settings[15].foodCarry = false;
	settings[15].energy = false;
*/
	return settings;
}

GameEngine.prototype.runNextSetting = function() {
	var limit = this.settings.length * 5;
	if(this.runNum < limit) {
	    if (this.currentSetting !== -1) {
	        /*
			var er = this.buildDownloadData(this.mound, this.mound.graph1, this.mound.graph2,
				this.mound.roleHistogramData, this.mound.forageHistogramData);
				*/
	        this.avgAges[this.currentSetting].breeders.push(this.mound.averageAges.breeders);
	        this.avgAges[this.currentSetting].generalists.push(this.mound.averageAges.generalists);
	        this.avgAges[this.currentSetting].foragers.push(this.mound.averageAges.foragers);
	        this.avgAges[this.currentSetting].total.push(this.mound.averageAges.total);
	        if (DOWNLOAD_RESULTS) {
	            var avgObj = JSON.stringify(this.avgAges);
	            this.download(document.getElementById("runName").textContent + ".txt", avgObj);
	        }
	    }

		this.currentSetting = (this.currentSetting + 1) % this.settings.length;

    //ben commented for now. (scatteredOrDense references how dense the food is I think.)
		// if (this.settings[this.currentSetting].scatteredOrDense) {
		// 	PARAMETERS["simDuration"] = 100000;
		// 	PARAMETERS["maxFood"] = 200;
		// 	PARAMETERS["foodRegenRate1"] = 0.01;
		// 	PARAMETERS["foodRegenAmount1"] = 200;
		// 	PARAMETERS["foodReplenishRate1"] = 0;
		// 	PARAMETERS["foodReplenishAmount1"] = 0;
		// 	PARAMETERS["foodDensity1"] = 3;
    //
		// 	PARAMETERS["seasonLength1"] = 100;
		// } else {
		// 	PARAMETERS["simDuration"] = 200000;
		// 	PARAMETERS["maxFood"] = 5000;
		// 	PARAMETERS["seasons"] = 5;
		// 	setupSeasons(5);
    //
		// 	PARAMETERS["seasonLength1"] = 50000;
		// 	PARAMETERS["foodRegenRate1"] = 0.01;
		// 	PARAMETERS["foodRegenAmount1"] = 200;
		// 	PARAMETERS["foodReplenishRate1"] = 0;
		// 	PARAMETERS["foodReplenishAmount1"] = 0;
		// 	PARAMETERS["foodDensity1"] = 3;
    //
		// 	PARAMETERS["seasonLength2"] = 25000;
		// 	PARAMETERS["foodRegenRate2"] = 0.005;
		// 	PARAMETERS["foodRegenAmount2"] = 500;
		// 	PARAMETERS["foodReplenishRate2"] = 0;
		// 	PARAMETERS["foodReplenishAmount2"] = 0;
		// 	PARAMETERS["foodDensity2"] = 8;
    //
		// 	PARAMETERS["seasonLength3"] = 25000;
		// 	PARAMETERS["foodRegenRate3"] = 0.004;
		// 	PARAMETERS["foodRegenAmount3"] = 1250;
		// 	PARAMETERS["foodReplenishRate3"] = 1;
		// 	PARAMETERS["foodReplenishAmount3"] = 500;
		// 	PARAMETERS["foodDensity3"] = 13;
    //
		// 	PARAMETERS["seasonLength4"] = 25000;
		// 	PARAMETERS["foodRegenRate4"] = 0.003;
		// 	PARAMETERS["foodRegenAmount4"] = 2500;
		// 	PARAMETERS["foodReplenishRate4"] = 1;
		// 	PARAMETERS["foodReplenishAmount4"] = 1500;
		// 	PARAMETERS["foodDensity4"] = 18;
    //
		// 	PARAMETERS["seasonLength5"] = 75000;
		// 	PARAMETERS["foodRegenRate5"] = 0.002;
		// 	PARAMETERS["foodRegenAmount5"] = 5000;
		// 	PARAMETERS["foodReplenishRate5"] = 1;
		// 	PARAMETERS["foodReplenishAmount5"] = 5000;
		// 	PARAMETERS["foodDensity5"] = 23;
		// }
		PARAMETERS["forageWeight"] = this.settings[this.currentSetting].fWeight;
		PARAMETERS["breedWeight"] = this.settings[this.currentSetting].bWeight;
		PARAMETERS["geneLifeToggle"] = this.settings[this.currentSetting].breedLife;
		PARAMETERS["geneBreedSpeedToggle"] = this.settings[this.currentSetting].breedSpeed;
		PARAMETERS["geneFoodCarryToggle"] = this.settings[this.currentSetting].foodCarry;
		PARAMETERS["geneEnergyToggle"] = this.settings[this.currentSetting].energy;
		PARAMETERS["geneToggle"] = this.settings[this.currentSetting].extremeGenes;
		PARAMETERS["geneRoleToggle"] = this.settings[this.currentSetting].roleToggle;
		var tf = PARAMETERS["geneToggle"]
			? "t"
			: "f";

		var str = this.settings[this.currentSetting].scatteredOrDense
			? "s"
			: "d6";
		str += "-f" + PARAMETERS["forageWeight"] + "-b" + PARAMETERS["breedWeight"] + "-ft-" + tf + "tt-";
		str = PARAMETERS["geneLifeToggle"]
			? str + "t"
			: str + "f";
		str = PARAMETERS["geneBreedSpeedToggle"]
			? str + "t"
			: str + "f";
		str = PARAMETERS["geneFoodCarryToggle"]
			? str + "t"
			: str + "f";
		str = PARAMETERS["geneEnergyToggle"]
			? str + "t"
			: str + "f";
		str = PARAMETERS["geneRoleToggle"]
			? str
			: str + "-c3";

		document.getElementById("runName").innerText = str;
		this.newGame();
	} else {
		console.clear();
    if(PRINT_RESULTS) {
      console.log(JSON.stringify(this.avgAges));
    }
	}
}

GameEngine.prototype.newGame = function() {
	console.clear();
	//document.getElementById("runNum").innerHTML = "1";
	console.log("starting new sim");
	foodTotal = 0;
    this.setParameters();
	this.setup();

	this.resumeGame();
}

GameEngine.prototype.download = function(filename, text) {
  if(DOWNLOAD_RESULTS) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
  }
}

GameEngine.prototype.saveGame = function() {
}

GameEngine.prototype.pauseGame = function() {
	console.log("pausing sim");
	this.isPaused = true;
}

GameEngine.prototype.endGame = function() {
  console.log("ending sim");
  if(DOWNLOAD_RESULTS) {
    this.isPaused = true;
    var str = this.buildDownloadData(this.mound, this.mound.graph1, this.mound.graph2,
                     this.mound.roleHistogramData, this.mound.forageHistogramData);
    this.download(document.getElementById("filename").textContent+".csv", str);
    /*
    this.download(PARAMETERS["cellSize"] + "cS_" +
            PARAMETERS["simDuration"] + "sD_" +
            PARAMETERS["updatePeriod"] + "cPT_" +
            PARAMETERS["drawPeriod"] + "cPSD_" +
            PARAMETERS["maxFood"] + "mFV_" +
            PARAMETERS["maxTotalFood"] + "mTFOM_" +
            PARAMETERS["foodAbundance"] + "iFA_" +
            PARAMETERS["foodRegenRate"] + "-" +
            PARAMETERS["foodRegenAmount"] + "fReg_" +
            PARAMETERS["foodReplenishRate"] + "-" +
            PARAMETERS["foodReplenishAmount"] + "fRep_" +
            PARAMETERS["geneToggle"] + "-tG_" +
            PARAMETERS["breedToggle"] + "-tB_" +
            PARAMETERS["effectToggle"] + "-tGE_" +
            PARAMETERS["breedStandby"] + "-tBS_" +
            PARAMETERS["initPop"] + "iP_" +
            PARAMETERS["maxEnergy"] + "-" +
            PARAMETERS["minEnergy"] + "E_" +
            PARAMETERS["maxEggLayTime"] + "-" +
            PARAMETERS["minEggLayTime"] + "ELT_" +
            PARAMETERS["forageWeight"] + "fW_" +
            PARAMETERS["breedWeight"] + "bW_" +
            PARAMETERS["deathChance"] + "cTD_" +
            PARAMETERS["minAge"] + "mA_" +
            PARAMETERS["hungerThreshold"] + "hT_" +
            PARAMETERS["foodIntake"] + "fI_" +
            PARAMETERS["mutationRate"] + "mR_" +
            PARAMETERS["maxDev"] + "mD_" +
            PARAMETERS["maxCarryingCapacity"] + "-" +
            PARAMETERS["minCarryingCapacity"] + "CC_" +
            PARAMETERS["energyDecay"] + "eD_" +
            PARAMETERS["matureTime"] + "lMIC.txt", "");
            */
  }
}

GameEngine.prototype.resumeGame = function() {
	console.log("resuming sim");
	this.isPaused = false;
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');

    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        if (x < 1024) {
            x = Math.floor(x / 32);
            y = Math.floor(y / 32);
        }

        return { x: x, y: y };
    }

    var that = this;

    // event listeners are added here

	if (this.play) this.play.addEventListener("click", function (e) {
		that.resumeGame();
    }, false);

	if (this.pause) this.pause.addEventListener("click", function (e) {
		that.pauseGame();
    }, false);

	if (this.step) this.step.addEventListener("click", function (e) {
		that.isStepping = true;
    }, false);

	if (this.save) this.save.addEventListener("click", function (e) {
		console.log("Doesn't do anything yet");
    }, false);

	if (this.load) this.load.addEventListener("click", function (e) {
		console.log("Doesn't do anything yet");
	}, false);

	if (this.new) this.new.addEventListener("click", function(e) {
		that.runNextSetting();
	});

	if (this.newMap) this.newMap.addEventListener("click", function(e) {
		that.newGame();
	});

  document.getElementById('canvas');

  this.ctx.canvas.addEventListener('mousemove', e => {
    that.mouse.x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
    that.mouse.y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
  });

  this.ctx.canvas.addEventListener('click', e => {
    that.mouse.clickX = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
    that.mouse.clickY = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
    that.mouse.isClicked = true;
    console.log("clicked: " + that.mouse.clickX + ", " + that.mouse.clickY)
  });

  console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
    //console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.removeEntity = function(entity) {
	//console.log('Removed entity.');
	var index = this.entities.indexOf(entity);
	this.entities.splice(index, 1);
}

GameEngine.prototype.draw = function () {
  if (this.updateCounter % DRAW_PERIOD === 0) {
    this.ctx.clearRect(0, 0, SIM_X, SIM_Y);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
      this.entities[i].draw(this.ctx);
	  }
	  this.mound.draw();
    this.ctx.restore();
	}
}

//hive_graph drawing.
GameEngine.prototype.drawPeriod = function() {
	if (this.updateCounter % UPDATE_PERIOD === 0) {
    //hive_graph
		this.ctx.clearRect(SIM_X, 0, CHART_X + 50, CHART_Y);
    //larva/ant graph
		this.ctx.clearRect(0, SIM_Y, SIM_X + CHART_X, CHART_BOTTOM_Y);

    this.ctx.clearRect(SIM_X, 0, SIM_X, CHART_Y + CHART_BOTTOM_Y);

    this.ctx.save();
		for (var i = 0; i < this.entities.length; i++) {
			this.entities[i].drawPeriod(this.ctx);
		}
		this.mound.drawPeriod();
		this.ctx.restore();
	}
}

GameEngine.prototype.update = function () {
	foods = 0;
	if (this.seasonCounter / SEASON_LENGTH >= 1) {
		this.changeSeason();
	}

  var entitiesCount = this.entities.length;

  for (var i = 0; i < entitiesCount; i++) {
    var entity = this.entities[i];

    if (entity != undefined) {
			entity.update();
		}
	}

	this.mound.update();

	this.updateCounter++;
	this.seasonCounter++;
}

GameEngine.prototype.updatePeriod = function () {
  var entitiesCount = this.entities.length;
	if (this.updateCounter % UPDATE_PERIOD === 0) {
		for (var i = 0; i < entitiesCount; i++) {
			var entity = this.entities[i];
			if (entity != undefined) {
				entity.updatePeriod();
			}
		}

		this.mound.updatePeriod();
	}
  DOWNLOAD_RESULTS = PARAMETERS["downloadResults"];
  PRINT_RESULTS = PARAMETERS["printOngoingResults"];
  SIMPLE_INFO = PARAMETERS["simple GUI"];
  DRAW_ANT_PORTION = PARAMETERS["drawAntPortion"];
  DRAW_TILE_ABSTRACT = PARAMETERS["drawTileabstraction"];

  // GRAPH_TIME =  PARAMETERS["numCycles"];
  // GRAPH_SHIFT = PARAMETERS["cycleShift"];
}

GameEngine.prototype.loop = function () {
	if (this.isStepping) {
		this.updatePeriod();
		this.update();
		this.draw();
		this.drawPeriod();
		this.isStepping = false;
	}
	if (!this.isPaused) {
		this.clockTick = this.timer.tick();
		this.update();
		this.updatePeriod();
		this.draw();
		this.drawPeriod();
    this.mouse.drawMouse();
    this.mouse.updateMouse();
	}
}

GameEngine.prototype.changeSeason = function () {
	this.seasonCounter = 0;
	this.currentSeason = this.currentSeason + 1 > NUM_OF_SEASONS-1 ? 0 : this.currentSeason + 1;
	var sL = "seasonLength" + Number(this.currentSeason + 1);
	var regA = "foodRegenAmount" + (this.currentSeason + 1);
	var repA = "foodReplenishAmount" + (this.currentSeason + 1);
	var regR = "foodRegenRate" + (this.currentSeason + 1);
	var repR = "foodReplenishRate" + (this.currentSeason + 1);
	var foodD = "foodDensity" + (this.currentSeason + 1);
	SEASON_LENGTH = Number(PARAMETERS[sL]);
	FOOD_REGEN_AMOUNT = Number(PARAMETERS[regA]);
	FOOD_REPLENISH_AMOUNT = Number(PARAMETERS[repA]);
	FOOD_REGEN_RATE = Number(PARAMETERS[regR]);
	FOOD_REPLENISH_RATE = Number(PARAMETERS[repR]);
	FOOD_DENSITY = Number(PARAMETERS[foodD]);
	for (var i = 0; i < this.tiles.length; i++) {
		this.tiles[i].foodLevel = 0;
	}
}

GameEngine.prototype.buildDownloadData = function(mound, graph1, graph2, hist1, hist2) {
	var listNum = GAME_LIFE_TIME/UPDATE_PERIOD;
	var seasonNum = PARAMETERS["seasons"];
	var seasons = [];
	for (var i = 1; i <= seasonNum; i++) {
		let season = {};
		season.regenRate = PARAMETERS["foodRegenRate"+i];
		season.regenAmount = PARAMETERS["foodRegenAmount"+i];
		season.replenishRate = PARAMETERS["foodReplenishRate"+i];
		season.replenishAmount = PARAMETERS["foodReplenishAmount"+i];
		seasons.push(season);
	}
	var dataObj = {
		mode: "update",
		run: document.getElementById("runName").textContent,
		params: {
			maxFood: PARAMETERS["maxFood"],
			maxTotalFood: PARAMETERS["maxTotalFood"],

			geneToggle: PARAMETERS["geneToggle"],
			breedToggle: PARAMETERS["breedToggle"],

			randOrQueueToggle: PARAMETERS["randomOrQueueToggle"],
			sumOrMaxToggle: PARAMETERS["sumOrMaxToggle"],

			geneLifeToggle: PARAMETERS["geneLifeToggle"],
			geneBreedSpeedToggle: PARAMETERS["geneBreedSpeedToggle"],
			geneFoodCarryToggle: PARAMETERS["geneFoodCarryToggle"],
			geneEnergyToggle: PARAMETERS["geneEnergyToggle"],

			breedStandby: PARAMETERS["breedStandby"],
			forageWeight: PARAMETERS["forageWeight"],
			breedWeight: PARAMETERS["breedWeight"]
		},

		ants: graph1.antData,
		larva: graph1.larvaData,
		food: graph1.foodData,

		roleHistogram: hist1.data,
		forageHistogram: hist2.data,

		foragePeriod: mound.foragePeriodData,
		larvaPeriod: mound.larvaPeriodData
	};

	// this.socket.emit('saveAnts', dataObj);


	var str = ",Ant,Larva,Food\n";
	for (var i = 1; i <= listNum; i++) {
		str += i + ",";
		if (graph1.antData.length >= i) {
			str += graph1.antData[i-1] + "," +
			graph1.larvaData[i-1] + "," +
			graph1.foodData[i-1];
		} else {
			str+="0,0,0";
		}
		str += "\n";
	}
	str+="\n,Breed,0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.75,0.8,0.85,0.9,Forage\n";
	for (var i = 1; i <= listNum; i++) {
		str += i + ",";
		if (graph1.antData.length >= i) {
			str += hist1.data[i-1] + ",";
		} else {
			str+="0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0";
		}
		str += "\n";
	}
	str+="\n,Exploit,0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5,0.55,0.6,0.65,0.7,0.75,0.8,0.85,0.9,Explore\n";
	for (var i = 1; i <= listNum; i++) {
		str += i + ",";
		if (graph1.antData.length >= i) {
			str += hist2.data[i-1] + ",";
		} else {
			str+="0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0";
		}
		str += "\n";
	}

	console.log(dataObj);
	return str;
}

