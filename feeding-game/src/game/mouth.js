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