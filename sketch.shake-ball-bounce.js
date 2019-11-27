const IMU_UUID = "2A5A20B9-0000-4B9C-9C69-4975713E0FF2".toLowerCase();
const ACCELERATION_UUID = "2A5A20B9-0001-4B9C-9C69-4975713E0FF2".toLowerCase();

let blePeripheral;
let connectButton;

let balls = [];

let threshold = 30;
let accChangeX = 0;
let accChangeY = 0;
let accChangeT = 0;

let accelerationX = 0;
let accelerationY = 0;

function setup() {
  // Create a p5ble class
  blePeripheral = new p5ble();

  // Create a 'Connect' button
  connectButton = createButton("Connect");
  connectButton.mousePressed(connectToPeripheral);

  createCanvas(displayWidth, displayHeight);

  for (let i = 0; i < 20; i++) {
    balls.push(new Ball());
  }
}

function draw() {
  background(0);

  for (let i = 0; i < balls.length; i++) {
    balls[i].move();
    balls[i].display();
  }

  checkForShake();
}

function checkForShake() {
  // Calculate total change in accelerationX and accelerationY
  accChangeX = abs(accelerationX - pAccelerationX);
  accChangeY = abs(accelerationY - pAccelerationY);
  accChangeT = accChangeX + accChangeY;
  // If shake
  if (accChangeT >= threshold) {
    for (let i = 0; i < balls.length; i++) {
      balls[i].shake();
      balls[i].turn();
    }
  }
  // If not shake
  else {
    for (let i = 0; i < balls.length; i++) {
      balls[i].stopShake();
      balls[i].turn();
      balls[i].move();
    }
  }
}

function connectToPeripheral() {
  if (!blePeripheral.isConnected()) {
    blePeripheral.connect(IMU_UUID, onConnect);
  } else {
    blePeripheral.disconnect();
  }
}

function onConnect(error, characteristics) {
  if (error) {
    console.error(error);
    return;
  }

  connectButton.html('Disconnect');
  // set a disconnect handler for the peripheral:
  blePeripheral.onDisconnected(onDisconnect);

  console.log('characteristics: ', characteristics);

  for (c in characteristics) {
    const uuid = characteristics[c].uuid;

    if (uuid === ACCELERATION_UUID) {
      blePeripheral.startNotifications(characteristics[c], onAccelerationData, 'custom');
    }
  }
}

function onDisconnect() {
  // change the name of the Connect button:
  connectButton.html('Connect');
}

function onAccelerationData(data) {
  const LITTLE_ENDIAN = true;

  const x = data.getFloat32(0, LITTLE_ENDIAN);
  const y = data.getFloat32(4, LITTLE_ENDIAN);
  const z = data.getFloat32(8, LITTLE_ENDIAN);

  // console.log(x, y, z);

  accelerationX = x * 5;
  accelerationY = y * 5;
}

// Ball class
class Ball {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.diameter = random(10, 30);
    this.xspeed = random(-2, 2);
    this.yspeed = random(-2, 2);
    this.oxspeed = this.xspeed;
    this.oyspeed = this.yspeed;
    this.direction = 0.7;
  }

  move() {
    this.x += this.xspeed * this.direction;
    this.y += this.yspeed * this.direction;
  }

  // Bounce when touch the edge of the canvas
  turn() {
    if (this.x < 0) {
      this.x = 0;
      this.direction = -this.direction;
    } else if (this.y < 0) {
      this.y = 0;
      this.direction = -this.direction;
    } else if (this.x > width - 20) {
      this.x = width - 20;
      this.direction = -this.direction;
    } else if (this.y > height - 20) {
      this.y = height - 20;
      this.direction = -this.direction;
    }
  }

  // Add to xspeed and yspeed based on
  // the change in accelerationX value
  shake() {
    this.xspeed += random(5, accChangeX / 3);
    this.yspeed += random(5, accChangeX / 3);
  }

  // Gradually slows down
  stopShake() {
    if (this.xspeed > this.oxspeed) {
      this.xspeed -= 0.6;
    } else {
      this.xspeed = this.oxspeed;
    }
    if (this.yspeed > this.oyspeed) {
      this.yspeed -= 0.6;
    } else {
      this.yspeed = this.oyspeed;
    }
  }

  display() {
    ellipse(this.x, this.y, this.diameter, this.diameter);
  }
}

