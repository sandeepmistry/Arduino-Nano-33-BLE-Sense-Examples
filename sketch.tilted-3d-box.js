const IMU_UUID = "2A5A20B9-0000-4B9C-9C69-4975713E0FF2".toLowerCase();
const ACCELERATION_UUID = "2A5A20B9-0001-4B9C-9C69-4975713E0FF2".toLowerCase();

let blePeripheral;
let connectButton;

let accelerationX = 0;
let accelerationY = 0;

function setup() {
  createCanvas(500, 600, WEBGL);
  // Create a p5ble class
  blePeripheral = new p5ble();

  // Create a 'Connect' button
  connectButton = createButton("Connect");
  connectButton.mousePressed(connectToPeripheral);
}

function draw() {
  background(250);
  normalMaterial();
  rotateX(accelerationX * 0.1);
  rotateY(accelerationY * 0.1);
  box(100, 100, 100);
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
}
