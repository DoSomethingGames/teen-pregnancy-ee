/**
 *
 * This is a simple state template to use for getting a Phaser game up
 * and running quickly. Simply add your own game logic to the default
 * state object or delete it and make your own.
 *
 */

var state = {
    init: function() {
        // Delete this init block or replace with your own logic.

        // Create simple text display for current Phaser version
        var text = "Phaser Version "+Phaser.VERSION + " works!";
        var style = { font: "24px Arial", fill: "#fff", align: "center" };
        var t = game.add.text(this.world.centerX, this.world.centerY, text, style);
        t.anchor.setTo(0.5, 0.5);
    },
    preload: function() {
        // STate preload logic goes here
    },
    create: function(){
      // State create logic goes here
    },
    update: function() {
        // State Update Logic goes here.
    }
};

var game = new Phaser.Game(
    800,
    480,
    Phaser.AUTO,
    'game',
    state
);
var gameGraphics;

function Game() {
  // Sprites
  var spBody;
  var spBowl;
  var spBowlBg;
  var spSpoonFood;
  var spSpoonDefault;
  var vomitSprite;

  // Audio
  var fxBeep;
  var fxEndDing;
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
  var scoreGoal = Math.floor(Math.random() * 6) + 10; //Randomizes between 1 and 15
  var scoreBar;

  //Check for vomit 
  var isVomit = false;
  var vomit; //holds text

  // The score and missed counters map to more generic buckets of results
  var foodStatusMap = [
    {count: 10, status: 'Chubby Bunny', key: 'mouth-open1'},
    {count: 7, status: 'Satisfied', key: 'mouth-open2'},
    {count: 4, status: '*Stomach Growl*', key: 'mouth-closed'},
    {count: 0, status: 'HANGRY', key: 'mouth-open1'}
  ];
  var messStatusMap = [
    {count: 5, status: 'DEFCON 1', faceFrame: 3},
    {count: 3, status: 'Gonna need a mop', faceFrame: 2},
    {count: 1, status: 'Just a Smidge', faceFrame: 1},
    {count: 0, status: 'Spotless', faceFrame: 0}
  ];

  // More text
  var textTimer;
  var levelTime;
  var startingTime = 16;

  // Restart and share button for end game screen
  var restartButton;
  var shareButton;

  // Boolean game has ended
  var isGameOver = false;

  // URL to level players up to
  var campaignUrl = 'https://www.dosomething.org/us/campaigns/pregnancy-text';

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
    game.load.spritesheet('body', 'assets/body_spritesheet.png', 438, 183);
    game.load.image('bowl', 'assets/bowl.png');
    game.load.image('barf', 'assets/barf.gif');

    game.load.spritesheet('face', 'assets/face_spritesheet.png', 256, 256);
    game.load.image('eyes', 'assets/eyes.png');
    game.load.image('mouth-closed', 'assets/mouth_closed.png');
    game.load.image('mouth-open1', 'assets/mouth_open1.png');
    game.load.image('mouth-open2', 'assets/mouth_open2.png');

    game.load.image('spoon-food', 'assets/spoon_food.png');
    game.load.image('spoon-nofood', 'assets/spoon_empty.png');
    game.load.image('restart-button', 'assets/restartButton.png');
    game.load.image('share-button', 'assets/shareButton.png');
    game.load.image('campaign-button', 'assets/campaignButton.png');

    game.load.audio('beep', 'assets/sounds/beep.mp3');
    game.load.audio('end-ding', 'assets/sounds/end_ding.mp3');
    game.load.audio('nom', 'assets/sounds/nom.mp3');
    game.load.audio('splat', 'assets/sounds/splat.mp3');
    game.load.audio('victory', 'assets/sounds/baby_laugh.mp3');
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
    fxEndDing = game.add.audio('end-ding');
    fxNom = game.add.audio('nom');
    fxSplat = game.add.audio('splat');
    fxVictory = game.add.audio('victory');
  }

  function update() {
    var currTime;
    var deltaTime;
    var timerText;

    if (isGameOver) {
      return;
    }

    currTime = (new Date()).getTime();
    deltaTime = currTime - lastTimeCheck;
    lastTimeCheck = currTime;

    // Game Time
    levelTime -= deltaTime;
    if (levelTime < 0) {
      endGame();
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

  function barf() {
    var vomitText = "BLEH!";
    var vomitTextStyle = {"font": "72px Helvetica", fill: "0x000000"};

    vomitSprite = game.add.sprite(0, 0, 'barf');
    vomit = game.add.text(game.world.centerX - 100, game.world.centerY - 36, vomitText, vomitTextStyle);
    isVomit = true;
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
        feedSuccess();
      }
      else {
        feedMissed();
      }

      if (scoreCounter > scoreGoal) {
        barf();
        endGame();
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

    if (missedCounter >= 5) {
      mouth.setFaceFrame(3);
      spBody.frame = 3;
    }
    else if (missedCounter >= 3) {
      mouth.setFaceFrame(2);
      spBody.frame = 2;
    }
    else if (missedCounter >= 1) {
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
    var colorFillDefault = 0xf0992f;
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

  function endGame() {
    isGameOver = true;

    // Disable input detection on sprites
    spBowl.inputEnabled = false;
    spSpoonFood.inputEnabled = false;

    fxEndDing.play();

    setTimeout(showEndGameScreen, 1500);
  }

  function showEndGameScreen() {
    var margin = 12;
    var pitch;
    var pitchButton;
    var pitchButtonText = "Give It A Try";
    var pitchChoose = ["94% of teens believe they would stay in school if they were pregnant. In reality, only 70% do. Think you can take care of a virtual baby for a day?", 
                       "51% of teens think if they were involved in a pregnancy they would marry the baby's mother or father. In reality, 81% remain unmarried. Think you could take care of a virtual baby by yourself for a day?",
                       "A sexually active teen who doesn’t use contraceptives has a 90% chance of becoming pregnant within a year. Think you can handle a virtual baby for a day?"];
    var random = Math.floor(Math.random() * pitchChoose.length);
    var pitchText = pitchChoose[random];
    var pitchStyle = {"font": "18px Helvetica", fill: "0x000000"};

    //Clean up vomit
    if (isVomit) {
      vomitSprite.kill();
      vomit.kill();
    }

    // Overlay background
    gameGraphics.lineStyle(4, 0x000000, 1);
    gameGraphics.beginFill(0xffffff, 1);
    gameGraphics.drawRect(margin, margin, game.world.width - (margin * 2), game.world.height - (margin * 2));
    gameGraphics.endFill();

    // Pitch to level up to a campaign
    pitch = game.add.text(game.world.centerX, margin * 3, pitchText, pitchStyle);
    pitch.wordWrap = true;
    pitch.wordWrapWidth = game.world.width - (margin * 6);
    pitch.anchor.setTo(0.5, 0);

    // Results
    game.add.text(360, 220, 'Food Eaten:', {font: '22px Helvetica', fill: '0x000000'});
    game.add.text(500, 220, scoreCounter, {font: 'bold 22px Helvetica', fill: '0x000000'});
    game.add.text(360, 250, 'Hunger Level:', {font: '22px Helvetica', fill: '0x000000'});
    game.add.text(360, 280, getScoreMapping(scoreCounter).status, {font: 'bold 22px Helvetica', fill: '0x000000'});

    game.add.text(360, 330, 'Food Missed:' , {font: '22px Helvetica', fill: '0x000000'});
    game.add.text(500, 330, missedCounter, {font: 'bold 22px Helvetica', fill: '0x000000'});
    game.add.text(360, 360, 'Mess Level:', {font: '22px Helvetica', fill: '0x000000'});
    game.add.text(360, 390, getMissedMapping(missedCounter).status, {font: 'bold 22px Helvetica', fill: '0x000000'});

    // Face!
    var resultFace = game.add.sprite(200, 384, 'face');
    resultFace.frame = getMissedMapping(missedCounter).faceFrame;

    var resultEyes = game.add.sprite(200, 384, 'eyes');
    var resultMouthKey = getScoreMapping(scoreCounter).key;
    var resultMouth = game.add.sprite(200, 384, resultMouthKey);

    resultFace.anchor.setTo(0.5, 0.75);
    resultEyes.anchor.setTo(0.5, 0.75);
    resultMouth.anchor.setTo(0.5, 0.5);

    // Button to go to campaign
    var px = game.world.centerX;
    var py = pitch.position.y + margin * 7;
    var pKey = 'campaign-button';
    var pCallback = function() { window.open(campaignUrl,'_blank'); };
    pitchButton = game.add.button(px, py, pKey, pCallback);
    pitchButton.anchor.setTo(0.5, 0);

    var rx = 650;
    var ry = 300;
    restartButton = game.add.button(rx, ry, 'restart-button');
    restartButton.anchor.setTo(0.5, 0.5);
    restartButton.inputEnabled = true;
    restartButton.events.onInputUp.add(restartGame);

    var sx = 650;
    var sy = 366;
    shareButton = game.add.button(sx, sy, 'share-button');
    shareButton.anchor.setTo(0.5, 0.5);
    shareButton.inputEnabled = true;
    shareButton.events.onInputUp.add(shareResults);
  }

  function restartGame() {
    restartButton.kill();
    game.state.add('game', new Game());
    game.state.start('game');
  }

  function shareResults() {
    var intent = "https://twitter.com/intent/tweet?text=";
    var text = "I got a score of " + scoreCounter + " feeding my DoSomething.org virtual baby. Take care of your own and learn more at https://www.dosomething.org/us/facts/11-facts-about-teen-pregnancy";

    window.open(intent + text, '_blank');
  }

  function getScoreMapping(val) {
    var i;

    for (i = 0; i < foodStatusMap.length; i++) {
      if (scoreCounter >= foodStatusMap[i].count) {
        return foodStatusMap[i];
      }
    }

    return '';
  }

  function getMissedMapping(val) {
    var i;

    for (i = 0; i < messStatusMap.length; i++) {
      if (missedCounter >= messStatusMap[i].count) {
        return messStatusMap[i];
      }
    }

    return '';
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

var debugGraphics;

function Mouth(openKey1, openKey2, closedKey, faceKey, eyesKey) {
  var ex1, ex2, ey1, ey2;

  var startPos = {x: 250, y: 325};

  this.currentState = 'open1';
  this.currentPos = {x: startPos.x, y: startPos.y};
  this.nextPos = {x: startPos.x, y: startPos.y};

  this.validPositions = [
    {x: 200, y: 325},
    {x: 250, y: 325},
    {x: 300, y: 325},
    {x: 200, y: 300},
    {x: 250, y: 300},
    {x: 300, y: 300}
  ];

  this.eyeAnchors = [
    {x: 0.5, y: 0.75},
    {x: 0.4, y: 0.75},
    {x: 0.6, y: 0.75}
  ];

  this.mouthAnchors = [
    {x: 0.5, y: 0.5},
    {x: 0.6, y: 0.4},
    {x: 0.4, y: 0.4},
    {x: 0.6, y: 0.5},
    {x: 0.4, y: 0.5},
  ];

  // Velocity measured by # of px / 1000 ms
  this.velocity = 200;

  // Timer things
  this.timeToNextPos = 3000;
  this.minTimeToNextPos = 1000;
  this.maxTimeToNextPos = 3000;
  this.timeToNextState = 1500;
  this.minTimeToNextState = 1000;
  this.maxTimeToNextState = 3000;
  this.timeToNextEyeAnchor = 3000;
  this.minTimeToNextEyeAnchor = 1500;
  this.maxTimeToNextEyeAnchor = 3000;
  this.timeToNextMouthAnchor = 3000;
  this.minTimeToNextMouthAnchor = 1500;
  this.maxTimeToNextMouthAnchor = 3000;

  this.spFace = game.add.sprite(startPos.x, startPos.y, faceKey);
  // Face is a spritesheet. Setting initial face to initial frame.
  this.spFace.frame = 0;

  this.spEyes = game.add.sprite(startPos.x, startPos.y, eyesKey);
  this.openState1 = {
    sprite: game.add.sprite(startPos.x, startPos.y, openKey1),
    ellipse: undefined
  };
  
  this.openState2 = {
    sprite: game.add.sprite(startPos.x, startPos.y, openKey2),
    ellipse: undefined
  };

  this.closedState = {
    sprite: game.add.sprite(startPos.x, startPos.y, closedKey),
    ellipse: undefined
  };

  // Set anchor and visibility
  this.openState1.sprite.anchor.setTo(this.mouthAnchors[0].x, this.mouthAnchors[0].y);
  this.openState2.sprite.anchor.setTo(this.mouthAnchors[0].x, this.mouthAnchors[0].y);
  this.closedState.sprite.anchor.setTo(this.mouthAnchors[0].x, this.mouthAnchors[0].y);
  this.spFace.anchor.setTo(0.5, 0.75);
  this.spEyes.anchor.setTo(this.eyeAnchors[0].x, this.eyeAnchors[0].y);

  this.openState1.sprite.visible = true;
  this.openState2.sprite.visible = false;
  this.closedState.sprite.visible = false;

  // Ellipses for hit detection
  ex1 = startPos.x - Math.floor(this.openState1.sprite.width / 2);
  ey1 = startPos.y - Math.floor(this.openState1.sprite.height / 2);
  this.openState1.ellipse = new Phaser.Ellipse(ex1, ey1, this.openState1.sprite.width, this.openState1.sprite.height);
  ex2 = startPos.x - Math.floor(this.openState2.sprite.width / 2);
  ey2 = startPos.y - Math.floor(this.openState2.sprite.height / 2);
  this.openState2.ellipse = new Phaser.Ellipse(ex2, ey2, this.openState2.sprite.width, this.openState2.sprite.height);

  // DEBUG DRAW ELLIPSE
  debugGraphics = game.add.graphics(0, 0);
  /*
  debugGraphics.lineStyle(1, 0xffd900);
  var ew1 = Math.floor(this.openState1.sprite.width / 2);
  var eh1 = Math.floor(this.openState1.sprite.height / 2);
  debugGraphics.drawEllipse(startPos.x, startPos.y, ew1, eh1);
  debugGraphics.lineStyle(1, 0x009dff);
  var ew2 = Math.floor(this.openState2.sprite.width / 2);
  var eh2 = Math.floor(this.openState2.sprite.height / 2);
  debugGraphics.drawEllipse(startPos.x, startPos.y, ew2, eh2);
  */
  // DEBUG DRAW VALID POSITIONS
  /*
  debugGraphics.beginFill(0x0000ff, 1);
  for (var i = 0; i < this.validPositions.length; i++) {
    debugGraphics.drawCircle(this.validPositions[i].x, this.validPositions[i].y, 3);
  }
  */
}

Mouth.prototype.onInputUp = function(callback, context) {
  this.openState1.sprite.events.onInputUp.add(callback, context);
  this.openState2.sprite.events.onInputUp.add(callback, context);
}

Mouth.prototype.update = function(deltaTime) {
  var deltaX;
  var deltaY;
  var dirX;
  var dirY;
  var dist;
  var newX;
  var newY;
  var startX;
  var startY;
  var theta;
  var selection;
  var stateSelected;
  var newPosSelected = false;

  // Position
  if (this.timeToNextPos > 0) {
    this.timeToNextPos -= deltaTime;

    startX = this.currentPos.x;
    startY = this.currentPos.y;

    deltaX = this.nextPos.x - startX;
    deltaY = this.nextPos.y - startY;

    if (deltaX != 0 || deltaY != 0) {
      dirX = deltaX > 0 ? 1 : -1;
      dirY = deltaY > 0 ? 1 : -1;

      dist = this.velocity * deltaTime / 1000;

      // hack. don't let it try to divide by 0
      if (deltaX == 0) {
        newX = this.nextPos.x;
        newY = this.nextPos.y;
      }
      else {
        theta = Math.atan(deltaY / deltaX);

        var modX = 1;
        var modY = 1;
        if (Math.cos(theta) < 0 && dirX > 0) modX = -1;
        if (Math.cos(theta) > 0 && dirX < 0) modX = -1; 
        if (Math.sin(theta) < 0 && dirY > 0) modY = -1;
        if (Math.sin(theta) > 0 && dirY < 0) modY = -1; 
        newX = Math.cos(theta) * dist * modX;
        newY = Math.sin(theta) * dist * modY;
        newX += this.currentPos.x;
        newY += this.currentPos.y;

        if ((startX <= this.nextPos.x && newX > this.nextPos.x) ||
            (startX >= this.nextPos.x && newX < this.nextPos.x)) {
          newX = this.nextPos.x;
        }
        if ((startY <= this.nextPos.y && newY > this.nextPos.y) ||
            (startY >= this.nextPos.y && newY < this.nextPos.y)) {
          newY = this.nextPos.y;
        }
      }

      this.currentPos.x = newX;
      this.currentPos.y = newY;

      this.updatePosition(this.currentPos.x, this.currentPos.y);
    }
  }
  // Select a new position
  else {
    while (!newPosSelected) {
      selection = Math.floor(Math.random() * this.validPositions.length);
      if (this.validPositions[selection].x != this.nextPos.x && this.validPositions[selection].y != this.nextPos.y) {
        // Set new position
        this.nextPos.x = this.validPositions[selection].x;
        this.nextPos.y = this.validPositions[selection].y;
        newPosSelected = true;

        // Reset timer
        this.timeToNextPos = Math.floor(Math.random() * (this.maxTimeToNextPos - this.minTimeToNextPos) + this.minTimeToNextPos);
      }
    }
  }

  // State
  if (this.timeToNextState > 0) {
    this.timeToNextState -= deltaTime;
  }
  // Select next state
  else {
    // Don't let next state be closed if the previous one already was
    if (this.currentState == 'closed') {
      stateSelected = Math.floor(Math.random() * 2);
    }
    else {
      stateSelected = Math.floor(Math.random() * 3);
    }

    // Update sprite visibility
    if (stateSelected == 0) {
      this.currentState = 'open1';
      this.openState1.sprite.visible = true;
      this.openState2.sprite.visible = false;
      this.closedState.sprite.visible = false;
    }
    else if (stateSelected == 1) {
      this.currentState = 'open2';
      this.openState1.sprite.visible = false;
      this.openState2.sprite.visible = true;
      this.closedState.sprite.visible = false;
    }
    else if (stateSelected == 2) {
      this.currentState = 'closed';
      this.openState1.sprite.visible = false;
      this.openState2.sprite.visible = false;
      this.closedState.sprite.visible = true;
    }
    
    // Reset timer
    this.timeToNextState = Math.floor(Math.random() * (this.maxTimeToNextState - this.minTimeToNextState) + this.minTimeToNextState);
  }

  // Eye anchor
  if (this.timeToNextEyeAnchor > 0) {
    this.timeToNextEyeAnchor -= deltaTime;
  }
  else {
    // Set a new eye anchor
    selection = Math.floor(Math.random() * this.eyeAnchors.length);
    newEyeAnchor = this.eyeAnchors[selection];
    this.spEyes.anchor.setTo(this.eyeAnchors[selection].x, this.eyeAnchors[selection].y);

    // Reset timer
    this.timeToNextEyeAnchor = Math.floor(Math.random() * (this.maxTimeToNextEyeAnchor - this.minTimeToNextEyeAnchor) + this.minTimeToNextEyeAnchor);
  }

  // Mouth anchor
  if (this.timeToNextMouthAnchor > 0) {
    this.timeToNextMouthAnchor -= deltaTime;
  }
  else {
    // Set a new mouth anchor
    selection = Math.floor(Math.random() * this.mouthAnchors.length);
    this.openState1.sprite.anchor.setTo(this.mouthAnchors[selection].x, this.mouthAnchors[selection].y);
    this.openState2.sprite.anchor.setTo(this.mouthAnchors[selection].x, this.mouthAnchors[selection].y);
    this.closedState.sprite.anchor.setTo(this.mouthAnchors[selection].x, this.mouthAnchors[selection].y);

    // Reset timer
    this.timeToNextMouthAnchor = Math.floor(Math.random() * (this.maxTimeToNextMouthAnchor - this.minTimeToNextMouthAnchor) + this.minTimeToNextMouthAnchor);
  }
}

Mouth.prototype.updatePosition = function(x, y) {
  this.openState1.sprite.position.x = x;
  this.openState1.sprite.position.y = y;
  this.openState2.sprite.position.x = x;
  this.openState2.sprite.position.y = y;
  this.closedState.sprite.position.x = x;
  this.closedState.sprite.position.y = y;
  this.spFace.position.x = x;
  this.spFace.position.y = y;
  this.spEyes.position.x = x;
  this.spEyes.position.y = y;

  this.openState1.ellipse.x = x - Math.floor(this.openState1.sprite.width / 2);
  this.openState1.ellipse.y = y - Math.floor(this.openState1.sprite.height / 2);
  this.openState2.ellipse.x = x - Math.floor(this.openState2.sprite.width / 2);
  this.openState2.ellipse.y = y - Math.floor(this.openState2.sprite.height / 2);
}

Mouth.prototype.hitDetect = function(otherSprite) {
  var hit;

  hit = this.openState1.sprite.visible && this.openState1.ellipse.contains(otherSprite.position.x, otherSprite.position.y);
  if (hit) {
    return true;
  }

  hit = this.openState2.sprite.visible && this.openState2.ellipse.contains(otherSprite.position.x, otherSprite.position.y);
  if (hit) {
    return true;
  }

  return false;
}

Mouth.prototype.setFaceFrame = function(frame) {
  if (frame < 0) {
    console.log('Invalid frame index for face: ' + frame);
  }
  this.spFace.frame = frame;
}
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
    var title;
    var text1;
    var text2;

    background = game.add.sprite(0, 0, 'background');
    background.tint = 0x336699;

    startButton = game.add.button(game.world.centerX, 320, 'startButton', null, null, 2, 1, 0);
    startButton.anchor.setTo(0.5, 0);
    startButton.inputEnabled = true;
    startButton.events.onInputUp.add(startGame);

    title = game.add.text(game.world.centerX, 64, '', {font: '32px PressStart2P', fill: '#FFFFFF'});
    title.setText("FEED THE BABY");
    title.wordWrap = true;
    title.wordWrapWidth = 700;
    title.anchor.setTo(0.5, 0);

    text1 = game.add.text(game.world.centerX, 136, '', {font: '16px PressStart2P', fill: '#FFFFFF'});
    text1.setText("You're running late for school and have 15 seconds to feed your baby.");
    text1.wordWrap = true;
    text1.wordWrapWidth = 700;
    text1.anchor.setTo(0.5, 0);

    text2 = game.add.text(game.world.centerX, 200, '', {font: '16px PressStart2P', fill: '#FFFFFF'});
    text2.setText("Click on the bowl and drag and drop food into your baby's mouth. Make sure not to miss, or overfeed - or else you'll get a different type of mess!");
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
