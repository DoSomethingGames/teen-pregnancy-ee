function Game() {
  // Sprites
  var spBowl;
  var spSpoonFood;
  var spSpoonDefault;

  // Timers
  var lastTimeCheck = 0;

  // Mouth controller
  var mouth;

  // Score
  var textScore;
  var scoreCounter = 0;
  var textMissed;
  var missedCounter = 0;

  // More text
  var textTimer;
  var levelTime;
  var startingTime = 30;

  // Restart button
  var restartButton;

  function init() {

  }

  function preload() {
    game.load.image('bowl', 'assets/bowl_placeholder.png');
    game.load.image('mouth-closed', 'assets/mouth_closed_placeholder.png');
    game.load.image('mouth-open1', 'assets/mouth_open1_placeholder.png');
    game.load.image('mouth-open2', 'assets/mouth_open2_placeholder.png');
    game.load.image('spoon-food', 'assets/spoon_food_placeholder.png');
    game.load.image('spoon-nofood', 'assets/spoon_nofood_placeholder.png');
    game.load.image('restart-button', 'assets/restartButton.png');
  }

  function create() {
    var textStyle = {
      font: '16px Helvetica',
      fill: '#ff0000'
    };
    textScore = game.add.text(700, 10, 'Noms: 0', textStyle);
    textMissed = game.add.text(700, 30, 'Missed: 0', textStyle);
    textTimer = game.add.text(700, 50, 'Timer: 0:' + startingTime, textStyle);

    levelTime = startingTime * 1000;
    lastTimeCheck = (new Date()).getTime();

    spBowl = game.add.sprite(575, 325, 'bowl');

    mouth = new Mouth('mouth-open1', 'mouth-open2', 'mouth-closed');

    spSpoonFood = game.add.sprite(0, 0, 'spoon-food');
    spSpoonDefault = game.add.sprite(0, 0, 'spoon-nofood');

    // Set anchor to middle of sprite
    spSpoonFood.anchor.setTo(0.5, 0.5);
    spSpoonDefault.anchor.setTo(0.5, 0.5);

    // Some sprites stay hidden until they're needed
    spSpoonFood.visible = false;
    spSpoonDefault.visible = true;

    // Enable input events on sprites
    spBowl.inputEnabled = true;
    spSpoonFood.inputEnabled = true;

    spBowl.events.onInputDown.add(onInputDown, this);
    spBowl.events.onInputUp.add(onInputUp, this);
    spSpoonFood.events.onInputUp.add(onInputUp, this);
    mouth.onInputUp(onInputUp, this);
  }

  function update() {
    var currTime;
    var deltaTime;
    var timerText;

    currTime = (new Date()).getTime();
    deltaTime = currTime - lastTimeCheck;
    lastTimeCheck = currTime;

    // Game Time
    levelTime -= deltaTime;
    if (levelTime < 0) {
      restartButton = game.add.button(game.world.centerX, game.world.centerY, 'restart-button', null, null, 2, 1, 0);
      restartButton.inputEnabled = true;
      restartButton.events.onInputUp.add(restartGame);
      return;
    }
    else {
      timerText = '0:';
      if (levelTime < 10000) {
        timerText += '0'
      }
      timerText += Math.floor(levelTime / 1000);
      textTimer.setText('Timer: ' + timerText);
    }

    // Update mouth position, state and movement
    mouth.update(deltaTime);

    // Spoon position follows the mouse
    spSpoonFood.position = game.input.position;
    spSpoonDefault.position = game.input.position;
  }

  function render() {
    
  }

  function onInputDown(sprite, pointer) {
    if (sprite.key == 'bowl') {
      spSpoonFood.visible = true;
      spSpoonDefault.visible = false;
    }
  }

  function onInputUp(sprite, pointer) {
    var overlapMouth1;
    var overlapMouth2;

    // Noms?
    if (sprite.key == 'bowl') {
      spSpoonFood.visible = false;
      spSpoonDefault.visible = true;

      if (mouth.hitDetect(spSpoonFood)) {
        scoreCounter++;
        textScore.setText('Noms: ' + scoreCounter);
      }
      else {
        missedCounter++;
        textMissed.setText('Missed: ' + missedCounter);
      }
    }
  }

  function restartGame() {
    restartButton.kill();
    game.state.add('game', new Game());
    game.state.start('game');
  }

  return {
    init: init,
    preload: preload,
    create: create,
    update: update,
    render: render
  }
}

game.state.add('game', new Game());
game.state.start('game');