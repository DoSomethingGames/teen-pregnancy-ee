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
  var scoreGoal = 10;
  var scoreBar;

  // The score and missed counters map to more generic buckets of results
  var foodStatusMap = [
    {count: 20, status: 'Chubby Bunny', key: 'mouth-open1'},
    {count: 16, status: 'Satisfied', key: 'mouth-open2'},
    {count: 10, status: 'Meh', key: 'mouth-closed'},
    {count: 0, status: 'HANGRY', key: 'mouth-open1'}
  ];
  var messStatusMap = [
    {count: 6, status: 'A Hot Mess', faceFrame: 3},
    {count: 4, status: 'Uhhhhh', faceFrame: 2},
    {count: 2, status: 'Decent', faceFrame: 1},
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
    game.load.image('share-button', 'assets/shareButton.png');
    game.load.image('campaign-button', 'assets/campaignButton.png');

    game.load.audio('beep', 'assets/sounds/beep.wav');
    game.load.audio('end-ding', 'assets/sounds/end_ding.wav');
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
    var pitchText = "94% of teens believe they would stay in school if they were pregnant. In reality, only 70% do. Think you can take care of a virtual baby for a day?";
    var pitchStyle = {"font": "18px Helvetica", fill: "0x000000"};

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
    game.add.text(380, 220, 'Food Status:', {font: 'bold 24px Helvetica', fill: '0x000000'});
    game.add.text(380, 260, getScoreMapping(scoreCounter).status, {font: 'bold 18px Helvetica', fill: '0x000000'});
    game.add.text(380, 285, scoreCounter + ' Noms', {font: '18px Helvetica', fill: '0x000000'});

    game.add.text(380, 325, 'Mess Status:', {font: 'bold 24px Helvetica', fill: '0x000000'});
    game.add.text(380, 365, getMissedMapping(missedCounter).status, {font: 'bold 18px Helvetica', fill: '0x000000'});
    game.add.text(380, 390, missedCounter + ' Misses', {font: '18px Helvetica', fill: '0x000000'});

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
    var py = pitch.position.y + margin * 6;
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
    var scoreStatus = getScoreMapping(scoreCounter).status;
    var missStatus = getMissedMapping(missedCounter).status;
    var intentUrl = "https://twitter.com/intent/tweet?text=";
    var shareText = "Results from feeding my DoSomething.org virtual baby: " + scoreStatus + " and " + missStatus + ".";
    var shareUrl = intentUrl + shareText;

    window.open(shareUrl, '_blank');
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
