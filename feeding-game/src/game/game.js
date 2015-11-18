function Game() {
  // Sprites
  var spBowl;
  var spMouthClosed;
  var spMouthOpen1 = {};
  var spMouthOpen2 = {};
  var spSpoonFood;
  var spSpoonDefault;

  // Timers
  var lastTimeCheck = 0;

  // Mouth movement
  var timeTilNextPos = 5000;
  var minVelocity = 200;
  var maxVelocity = 600;
  var minX = 200;
  var maxX = 600;
  var minY = 150;
  var maxY = 300;
  var minTimeTilNextPos = 2000;
  var maxTimeTilNextPos = 6000;
  var timeTilNextMouthChange = 2500;
  var minTimeTilNextMouthChange = 1000;
  var maxTimeTilNextMouthChange = 5000;

  // Score
  var textScore;
  var scoreCounter = 0;
  var textMissed;
  var missedCounter = 0;

  // More text
  var textTimer;
  var levelTime;
  var startingTime = 30;

  function init() {

  }

  function preload() {
    game.load.image('bowl', 'assets/bowl_placeholder.png');
    game.load.image('mouth-closed', 'assets/mouth_closed_placeholder.png');
    game.load.image('mouth-open1', 'assets/mouth_open1_placeholder.png');
    game.load.image('mouth-open2', 'assets/mouth_open2_placeholder.png');
    game.load.image('spoon-food', 'assets/spoon_food_placeholder.png');
    game.load.image('spoon-nofood', 'assets/spoon_nofood_placeholder.png');
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

    spMouthClosed = new Mouth(300, 150, 'mouth-closed');
    spMouthOpen1 = new Mouth(300, 150, 'mouth-open1');
    spMouthOpen2 = new Mouth(300, 150, 'mouth-open2');

    spSpoonFood = game.add.sprite(0, 0, 'spoon-food');
    spSpoonDefault = game.add.sprite(0, 0, 'spoon-nofood');

    // Set anchor to middle of sprite
    spSpoonFood.anchor.setTo(0.5, 0.5);
    spSpoonDefault.anchor.setTo(0.5, 0.5);

    // Some sprites stay hidden until they're needed
    spMouthClosed.sprite.visible = false;
    spMouthOpen1.sprite.visible = true;
    spMouthOpen2.sprite.visible = false;
    spSpoonFood.visible = false;
    spSpoonDefault.visible = false;

    // Enable input events on sprites
    spBowl.inputEnabled = true;
    spSpoonFood.inputEnabled = true;

    spBowl.events.onInputDown.add(onInputDown, this);
    spBowl.events.onInputUp.add(onInputUp, this);
    spSpoonFood.events.onInputUp.add(onInputUp, this);
    spMouthOpen1.onInputUp(onInputUp, this);
    spMouthOpen2.onInputUp(onInputUp, this);
  }

  function update() {
    var currTime;
    var deltaTime;
    var mouthState;
    var nextX;
    var nextY;
    var nextVelocity;
    var timerText;

    currTime = (new Date()).getTime();
    deltaTime = currTime - lastTimeCheck;
    lastTimeCheck = currTime;

    // Game Time
    levelTime -= deltaTime;
    if (levelTime < 0) {
      console.log('game over');
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

    // Update mouth position // @todo 
    if (timeTilNextPos > 0) {
      timeTilNextPos -= deltaTime;
    }
    else {
      // Reset time
      timeTilNextPos = Math.floor(Math.random() * (maxTimeTilNextPos - minTimeTilNextPos)) + minTimeTilNextPos;

      // Select new position
      nextX = Math.floor(Math.random() * (maxX - minX)) + minX;
      nextY = Math.floor(Math.random() * (maxY - minY)) + minY;

      // New velocity
      nextVelocity = Math.floor(Math.random() * (maxVelocity - minVelocity)) + minVelocity;
      spMouthOpen1.velocity = nextVelocity;
      spMouthOpen2.velocity = nextVelocity;
      spMouthClosed.velocity = nextVelocity;

      // DEBUG STUFF
      // console.log('Time: %s / x: %d, y: %d', timeTilNextPos, nextX, nextY);
      // graphics.beginFill(0xff0000);
      // graphics.drawCircle(nextX, nextY, 4);
      // graphics.endFill();

      spMouthOpen1.setPosition(nextX, nextY);
      spMouthOpen2.setPosition(nextX, nextY);
      spMouthClosed.setPosition(nextX, nextY);
    }

    // Mouth movement
    spMouthOpen1.update(deltaTime);
    spMouthOpen2.update(deltaTime);
    spMouthClosed.update(deltaTime);

    if (timeTilNextMouthChange > 0) {
      timeTilNextMouthChange -= deltaTime;
    }
    else {
      timeTilNextMouthChange = Math.floor(Math.random() * (maxTimeTilNextMouthChange - minTimeTilNextMouthChange) + minTimeTilNextMouthChange);

      mouthState = Math.floor(Math.random() * 3);
      if (mouthState == 0) {
        // open 1
        spMouthOpen1.sprite.visible = true;
        spMouthOpen2.sprite.visible = false;
        spMouthClosed.sprite.visible = false;
      }
      else if (mouthState == 1) {
        // open 2
        spMouthOpen1.sprite.visible = false;
        spMouthOpen2.sprite.visible = true;
        spMouthClosed.sprite.visible = false;
      }
      else if (mouthState == 2) {
        // closed 2
        spMouthOpen1.sprite.visible = false;
        spMouthOpen2.sprite.visible = false;
        spMouthClosed.sprite.visible = true;
      }
    }

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

      overlapMouth1 = spMouthOpen1.sprite.visible && spMouthOpen1.overlap(spSpoonFood);
      overlapMouth2 = spMouthOpen2.sprite.visible && spMouthOpen2.overlap(spSpoonFood);
      if (overlapMouth1 || overlapMouth2) {
        scoreCounter++;
        textScore.setText('Noms: ' + scoreCounter);
      }
      else {
        missedCounter++;
        textMissed.setText('Missed: ' + missedCounter);
      }
    }
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