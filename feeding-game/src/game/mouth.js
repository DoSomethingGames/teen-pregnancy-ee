var graphics;
function Mouth(x, y, spriteKey) {
  var ex;
  var ey;

  // velocity: # of px / 1000 ms
  this.minVelocity = 200;
  this.maxVelocity = 600;
  
  this.minX = 200;
  this.maxX = 600;
  this.minY = 150;
  this.maxY = 300;

  this.minTimeTilNext = 5000;
  this.maxTimeTilNext = 5000;

  this.timeTilNext = 5000;

  this.velocity = 200; // # of px / 1000 ms

  this.nextPosition = {x: 300, y: 150};

  // Sprite
  this.sprite = game.add.sprite(x, y, spriteKey);
  this.sprite.anchor.setTo(0.5, 0.5);
  this.sprite.inputEnabled = true;

  // Ellipse used as as form of collision/overlap detection
  ex = x - Math.floor(this.sprite.width / 2);
  ey = y - Math.floor(this.sprite.height / 2);
  this.ellipse = new Phaser.Ellipse(ex, ey, this.sprite.width, this.sprite.height);

  // DEBUG DRAW ELLIPSE
  graphics = game.add.graphics(0, 0);
  // graphics.lineStyle(1, 0xffd900);
  // var ew = Math.floor(this.sprite.width / 2);
  // var eh = Math.floor(this.sprite.height / 2);
  // graphics.drawEllipse(x, y, ew, eh);
}

Mouth.prototype.onInputUp = function(callback, context) {
  this.sprite.events.onInputUp.add(callback, context);
}

Mouth.prototype.overlap = function(otherSprite) {
  return this.ellipse.contains(otherSprite.position.x, otherSprite.position.y);
}

Mouth.prototype.setPosition = function(x, y) {
  this.nextPosition.x = x;
  this.nextPosition.y = y;
}

Mouth.prototype.update = function(deltaTime) {
  var deltaX;
  var deltaY;
  var dirX;
  var dirY;
  var dist;
  var theta;
  var startX;
  var startY;
  var x;
  var y;

  startX = this.sprite.position.x;
  startY = this.sprite.position.y;

  deltaX = this.nextPosition.x - startX;
  deltaY = this.nextPosition.y - startY;

  // Position
  if (deltaX != 0 || deltaY != 0) {
    dirX = deltaX > 0 ? 1 : -1;
    dirY = deltaY > 0 ? 1 : -1;

    dist = this.velocity * deltaTime / 1000;

    // hack. don't let it try to divide by 0
    if (deltaX == 0) {
      x = this.nextPosition.x;
      y = this.nextPosition.y;
    }
    else {
      theta = Math.atan(deltaY / deltaX);

      var modX = 1;
      var modY = 1;
      if (Math.cos(theta) < 0 && dirX > 0) modX = -1;
      if (Math.cos(theta) > 0 && dirX < 0) modX = -1; 
      if (Math.sin(theta) < 0 && dirY > 0) modY = -1;
      if (Math.sin(theta) > 0 && dirY < 0) modY = -1; 
      x = Math.cos(theta) * dist * modX;
      y = Math.sin(theta) * dist * modY;
      x += this.sprite.position.x;
      y += this.sprite.position.y;

      if ((startX <= this.nextPosition.x && x > this.nextPosition.x) ||
          (startX >= this.nextPosition.x && x < this.nextPosition.x)) {
        x = this.nextPosition.x;
      }
      if ((startY <= this.nextPosition.y && y > this.nextPosition.y) ||
          (startY >= this.nextPosition.y && y < this.nextPosition.y)) {
        y = this.nextPosition.y;
      }
    }

    this.sprite.position.x = x;
    this.sprite.position.y = y;
// console.log(this.sprite.position.x + ', ' + this.sprite.position.y);

    this.ellipse.x = x - Math.floor(this.sprite.width / 2);
    this.ellipse.y = y - Math.floor(this.sprite.height / 2);
  }
}