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

  // Score
  var textScore;
  var score = 0;

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
    textScore = game.add.text(700, 50, "Noms: 0", {font: "16px Arial", fill: "#ff0000", align: "center"});

    spBowl = game.add.sprite(575, 325, 'bowl');

    spMouthClosed = game.add.sprite(0, 0, 'mouth-closed');
    spMouthOpen1 = new Mouth(300, 150, 'mouth-open1');
    spMouthOpen2 = new Mouth(300, 150, 'mouth-open2');

    spSpoonFood = game.add.sprite(0, 0, 'spoon-food');
    spSpoonDefault = game.add.sprite(0, 0, 'spoon-nofood');

    // Set anchor to middle of sprite
    spMouthClosed.anchor.setTo(0.5, 0.5);
    spSpoonFood.anchor.setTo(0.5, 0.5);
    spSpoonDefault.anchor.setTo(0.5, 0.5);

    // Some sprites stay hidden until they're needed
    spMouthClosed.visible = false;
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
    var nextX;
    var nextY;
    var nextVelocity;

    currTime = (new Date()).getTime();
    deltaTime = currTime - lastTimeCheck;
    lastTimeCheck = currTime;

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

      // DEBUG STUFF
      // console.log('Time: %s / x: %d, y: %d', timeTilNextPos, nextX, nextY);
      // graphics.beginFill(0xff0000);
      // graphics.drawCircle(nextX, nextY, 4);
      // graphics.endFill();

      spMouthOpen1.setPosition(nextX, nextY);
      spMouthOpen2.setPosition(nextX, nextY);
    }

    // Mouth position
    spMouthOpen1.update(deltaTime);
    spMouthOpen2.update(deltaTime);

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

if (spMouthOpen1.nextPosition.x == 300) {
  spMouthOpen1.setPosition(444, 183);
  spMouthOpen2.setPosition(444, 183);
}
else if(spMouthOpen1.nextPosition.x == 444) {
  spMouthOpen1.setPosition(308, 227);
  spMouthOpen2.setPosition(308, 2276);
}
else if(spMouthOpen1.nextPosition.x == 308) {
  spMouthOpen1.setPosition(258, 251);
  spMouthOpen2.setPosition(258, 251);
}
    }
  }

  function onInputUp(sprite, pointer) {
    var overlapMouth1;
    var overlapMouth2;

    if (sprite.key == 'bowl') {
      spSpoonFood.visible = false;
      spSpoonDefault.visible = true;
    }

    overlapMouth1 = spMouthOpen1.sprite.visible && spMouthOpen1.overlap(spSpoonFood);
    overlapMouth2 = spMouthOpen2.sprite.visible && spMouthOpen2.overlap(spSpoonFood);
    if (overlapMouth1 || overlapMouth2) {
      console.log('NOM');
      score++;
      textScore.setText('Noms: ' + score);
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