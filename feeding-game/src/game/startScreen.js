function StartScreen() {
  var background;
  var startButton;

  console.log('in startScreen');

	function init() {
    startButton = null;
	}

	function preload() {
    game.load.image('background', 'assets/startScreen.png');
    game.load.image('startButton', 'assets/startButton.png');
	}

	function create() {
    background = game.add.tileSprite(0, 0, 800, 600, 'background');
    startButton = game.add.button(game.world.centerX, game.world.centerY, 'startButton', null, null, 2, 1, 0);
    startButton.inputEnabled = true;
    startButton.events.onInputUp.add(transitionToNextState);
    //startButton.events.onInputOver.add()
	}

	function update() {

	}

  function transitionToNextState() {
    var properties = {alpha: 0};
    var fadeOutDuration = 2000;
    var ease = Phaser.Easing.Linear.None;
    var autoStart = true;
    var delay = 500;
    var repeat = false;
    var yoyo = false;

    startButton.kill();
    game.add.tween(background).to(properties, fadeOutDuration, ease, autoStart, delay, repeat, yoyo);
    setTimeout(startGame, fadeOutDuration + delay - 250);
  }

  function startGame() {
    game.state.add('game', new Game());
    game.state.start('game');
  }

	return {
		init: init,
    preload: preload,
    create: create,
    update: update
	}
}

game.state.add('start-screen', new StartScreen());
game.state.start('start-screen');