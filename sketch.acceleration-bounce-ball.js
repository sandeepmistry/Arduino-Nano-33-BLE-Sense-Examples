const IMU_UUID = "2A5A20B9-0000-4B9C-9C69-4975713E0FF2".toLowerCase();
const ACCELERATION_UUID = "2A5A20B9-0001-4B9C-9C69-4975713E0FF2".toLowerCase();

let blePeripheral;
let connectButton;

let accelerationX = 0;
let accelerationY = 0;
let accelerationZ = 0;

// Position Variables
let x = 0;
let y = 0;

// Speed - Velocity
let vx = 0;
let vy = 0;

// Acceleration
let ax = 0;
let ay = 0;

let vMultiplier = 0.007;
let bMultiplier = 0.6;

function setup() {
  // Create a p5ble class
  blePeripheral = new p5ble();

  // Create a 'Connect' button
  connectButton = createButton("Connect");
  connectButton.mousePressed(connectToPeripheral);

  createCanvas(displayWidth, displayHeight);
  fill(0);
}

function draw() {
  background(255);
  ballMove();
  ellipse(x, y, 30, 30);
}

function ballMove() {
  ax = accelerationX;
  ay = accelerationY;

  vx = vx + ay;
  vy = vy + ax;
  y = y + vy * vMultiplier;
  x = x + vx * vMultiplier;

  // Bounce when touch the edge of the canvas
  if (x < 0) {
    x = 0;
    vx = -vx * bMultiplier;
  }
  if (y < 0) {
    y = 0;
    vy = -vy * bMultiplier;
  }
  if (x > width - 20) {
    x = width - 20;
    vx = -vx * bMultiplier;
  }
  if (y > height - 20) {
    y = height - 20;
    vy = -vy * bMultiplier;
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

  // G's to m/s^2
  accelerationX = x * 9.80665;
  accelerationY = y * 9.80665;
  accelerationZ = z * 9.80665;
}
