const IMU_UUID = "2A5A20B9-0000-4B9C-9C69-4975713E0FF2".toLowerCase();
const ACCELERATION_UUID = "2A5A20B9-0001-4B9C-9C69-4975713E0FF2".toLowerCase();

let blePeripheral;
let connectButton;

let accelerationX = 0;
let accelerationY = 0;
let accelerationZ = 0;

let r, g, b;

function setup() {
  // Create a p5ble class
  blePeripheral = new p5ble();

  // Create a 'Connect' button
  connectButton = createButton("Connect");
  connectButton.mousePressed(connectToPeripheral);

  createCanvas(displayWidth, displayHeight, WEBGL);
  r = random(50, 255);
  g = random(0, 200);
  b = random(50, 255);
}

function draw() {
  background(r, g, b);
  // console.log('draw');
}

function deviceMoved() {
  r = map(accelerationX, -90, 90, 100, 175);
  g = map(accelerationY, -90, 90, 100, 200);
  b = map(accelerationZ, -90, 90, 100, 200);
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

  const x = event.target.value.getFloat32(0, LITTLE_ENDIAN);
  const y = event.target.value.getFloat32(4, LITTLE_ENDIAN);
  const z = event.target.value.getFloat32(8, LITTLE_ENDIAN);

  // console.log(x, y, z);

  accelerationX = x * 90;
  accelerationY = y * 90;
  accelerationZ = z * 90;

  deviceMoved();
}
