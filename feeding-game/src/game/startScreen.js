function StartScreen() {
  var background;
  var startButton;

  function init() {
    startButton = null;
  }

  function preload() {
    game.load.image('background', 'assets/kitchen_bg.jpg');
    game.load.image('startButton', 'assets/startButton.png');
  }

  function create() {
    var text1;
    var text2;

    background = game.add.sprite(0, 0, 'background');

    startButton = game.add.button(game.world.centerX, 256, 'startButton', null, null, 2, 1, 0);
    startButton.anchor.setTo(0.5, 0);
    startButton.inputEnabled = true;
    startButton.events.onInputUp.add(startGame);

    text1 = game.add.text(game.world.centerX, 64, '', {font: '16px PressStart2P', fill: '#000000'});
    text1.setText("[Placeholder Text] You're running late for school and have :15 seconds to feed your baby.");
    text1.wordWrap = true;
    text1.wordWrapWidth = 700;
    text1.anchor.setTo(0.5, 0);

    text2 = game.add.text(game.world.centerX, 152, '', {font: '16px PressStart2P', fill: '#000000'});
    text2.setText("Click on the bowl and drag and drop food into your baby's mouth");
    text2.wordWrap = true;
    text2.wordWrapWidth = 700;
    text2.anchor.setTo(0.5, 0);
  }

  function update() {

  }

  function startGame() {
    game.state.add('game', new Game());
    game.state.start('game');
    ga('send', 'event', 'teen-pregnancy-exp-A', 'button-clicked', 'start');
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
