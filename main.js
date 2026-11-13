AM = new AssetManager();


AM.downloadAll(function () {
  var canvas = document.getElementById("gameWorld");
  var ctx = canvas.getContext("2d");
  var gameEngine = new GameEngine();

	// main
	CELL_SIZE = parseInt(PARAMETERS.cellSize);
	XSIZE = Math.floor(800/CELL_SIZE);
	YSIZE = Math.floor(600/CELL_SIZE);

  window.ENGINE = gameEngine;
  gameEngine.init(ctx);
	gameEngine.start();
  gameEngine.resumeGame(); // run on load
  setRunLabel();

  console.log("All Done!");
});
