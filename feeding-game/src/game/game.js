var gameGraphics;

function Game() {
  // Sprites
  var spBody;
  var spBowl;
  var spBowlBg;
  var spSpoonFood;
  var spSpoonDefault;

  // Audio
  var fxBeep;
  var fxNom;
  var fxSplat;
  var fxVictory;

  // Timers
  var lastTimeCheck = 0;

  // Beeps in the final seconds of each game
  var beepCountdown = 5;

  // Mouth controller
  var mouth;

  // Score
  var textScore;
  var scoreCounter = 0;
  var textMissed;
  var missedCounter = 0;
  var scoreGoal = 20;
  var scoreBar;

  // More text
  var textTimer;
  var levelTime;
  var startingTime = 21;

  // Restart button
  var restartButton;

  // Text styles
  var textStyle = {
    font: '20px PressStart2P',
    fill: '#000000'
  };
  var textTimerStyle = {
    font: '32px PressStart2P',
    fill: '#000000'
  };
  var textTimerStyleCoundown = {
    font: '32px PressStart2P',
    fill: '#ff0000'
  };

  function init() {
    game.stage.backgroundColor = 0xffffff;
  }

  function preload() {
    game.load.image('bg', 'assets/kitchen_bg.jpg');
    game.load.spritesheet('body', 'assets/body_placeholder_spritesheet.png', 450, 183);
    game.load.image('bowl-bg', 'assets/bowl_placeholder_full.png');
    game.load.image('bowl', 'assets/bowl.png');

    game.load.spritesheet('face', 'assets/face_spritesheet_placeholder.png', 256, 256);
    game.load.image('eyes', 'assets/eyes_placeholder.png');
    game.load.image('mouth-closed', 'assets/mouth_closed_placeholder.png');
    game.load.image('mouth-open1', 'assets/mouth_open1_placeholder.png');
    game.load.image('mouth-open2', 'assets/mouth_open2_placeholder.png');

    game.load.image('spoon-food', 'assets/spoon_food.png');
    game.load.image('spoon-nofood', 'assets/spoon_empty.png');
    game.load.image('restart-button', 'assets/restartButton.png');

    game.load.audio('beep', 'assets/sounds/beep.wav');
    game.load.audio('nom', 'assets/sounds/nom.wav');
    game.load.audio('splat', 'assets/sounds/splat.wav');
    game.load.audio('victory', 'assets/sounds/baby_laugh.wav');
  }

  function create() {
    var textFillBar;

    levelTime = startingTime * 1000;
    lastTimeCheck = (new Date()).getTime();

    // Background
    game.add.sprite(0, 0, 'bg');

    // Body
    spBody = game.add.sprite(50, 297, 'body');
    spBody.frame = 0;

    // Bowl
    spBowl = game.add.sprite(475, 325, 'bowl');

    // Mouth
    mouth = new Mouth('mouth-open1', 'mouth-open2', 'mouth-closed', 'face', 'eyes');

    // Spoon
    spSpoonFood = game.add.sprite(0, 0, 'spoon-food');
    spSpoonDefault = game.add.sprite(0, 0, 'spoon-nofood');

    // Set anchor to middle of sprite
    spSpoonFood.anchor.setTo(0.17, 0.7);
    spSpoonDefault.anchor.setTo(0.17, 0.7);

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

    // Debug temporary text
    textScore = game.add.text(8, 424, '', textStyle);
    textMissed = game.add.text(8, 452, '', textStyle);
    textTimer = game.add.text(400, 8, '', textTimerStyle);
    textTimer.anchor.setTo(0.5, 0);

    textScore.setText('Noms: 0');
    textMissed.setText('Miss: 0');
    textTimer.setText('0:' + startingTime);

    textFillBar = game.add.text(8, 8, 'Full!', textStyle);
    gameGraphics = game.add.graphics();
    drawFillBar();

    // Audio
    fxBeep = game.add.audio('beep');
    fxNom = game.add.audio('nom');
    fxSplat = game.add.audio('splat');
    fxVictory = game.add.audio('victory');
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
      restartButton.anchor.setTo(0.5, 0.5);
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
      textTimer.setText(timerText);

      // Change color in the final 5 seconds
      if (levelTime < 6000) {
        textTimer.setStyle(textTimerStyleCoundown);
      }

      if (levelTime <= (beepCountdown + 1) * 1000) {
        fxBeep.play();
        beepCountdown--;
      }

      // Update mouth position, state and movement
      mouth.update(deltaTime);

      // Spoon position follows the mouse
      spSpoonFood.position = game.input.position;
      spSpoonDefault.position = game.input.position;
    }
  }

  function render() {
    
  }

  function onInputDown(sprite, pointer) {
    if (sprite.key == 'bowl') {
      spSpoonFood.visible = true;
      spSpoonDefault.visible = false;
      // fxSplat.play();
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
        feedSuccess();
      }
      else {
        feedMissed();
      }
    }
  }

  function feedSuccess() {
    scoreCounter++;
    textScore.setText('Noms: ' + scoreCounter);

    drawFillBar();

    fxNom.play();

    if (scoreCounter == scoreGoal) {
      fxVictory.play();
    }
  }

  function feedMissed() {
    missedCounter++;
    textMissed.setText('Miss: ' + missedCounter);

    if (missedCounter >= 6) {
      mouth.setFaceFrame(3);
      spBody.frame = 3;
    }
    else if (missedCounter >= 4) {
      mouth.setFaceFrame(2);
      spBody.frame = 2;
    }
    else if (missedCounter >= 2) {
      mouth.setFaceFrame(1);
      spBody.frame = 1;
    }

    fxSplat.play();
  }

  function drawFillBar() {
    var height = 350;
    var width = 52;
    var x0 = 12;
    var y0 = 50;
    var colorOutlineDefault = 0x000000;
    var colorOutlineWin = 0xffffff;
    var colorOutline = scoreCounter >= scoreGoal ? colorOutlineWin : colorOutlineDefault;
    var colorFillDefault = 0x117024;
    var colorFillWin = 0xfefe56;
    var colorFill = scoreCounter >= scoreGoal ? colorFillWin : colorFillDefault;
    var interval = Math.floor(height / scoreGoal);
    var scoreBarHeight = scoreCounter >= scoreGoal ? height : interval * scoreCounter;
    var scoreBarY = height - scoreBarHeight + y0;

    gameGraphics.lineStyle(1, colorFill, 1);
    gameGraphics.beginFill(colorFill, 1);
    scoreBar = gameGraphics.drawRect(x0, scoreBarY, width, scoreBarHeight);
    gameGraphics.endFill();

    gameGraphics.lineStyle(4, colorOutline, 1);
    gameGraphics.moveTo(x0, y0);
    gameGraphics.lineTo(x0, y0 + height);

    gameGraphics.lineStyle(4, colorOutline, 1);
    gameGraphics.moveTo(x0, y0 + height);
    gameGraphics.lineTo(x0 + width, y0 + height);

    gameGraphics.lineStyle(4, colorOutline, 1);
    gameGraphics.moveTo(x0 + width, y0 + height);
    gameGraphics.lineTo(x0 + width, y0);

    gameGraphics.lineStyle(4, colorOutline, 1);
    gameGraphics.moveTo(x0 + width, y0);
    gameGraphics.lineTo(x0, y0);
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