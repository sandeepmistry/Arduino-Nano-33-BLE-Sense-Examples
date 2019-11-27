const APDS_UUID = "EB7D0A8A-0000-4BB4-855B-E1C85AF41ECC".toLowerCase();
const COLOR_UUID = "EB7D0A8A-0001-4BB4-855B-E1C85AF41ECC".toLowerCase();

let blePeripheral;
let connectButton;

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
}

function connectToPeripheral() {
  if (!blePeripheral.isConnected()) {
    blePeripheral.connect(APDS_UUID, onConnect);
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
console.log(uuid);
    /*if (uuid === COLOR_UUID)*/ {
      blePeripheral.startNotifications(characteristics[c], onColorData, 'custom');
    }
  }
}

function onDisconnect() {
  // change the name of the Connect button:
  connectButton.html('Connect');
}

function onColorData(data) {
  const LITTLE_ENDIAN = true;

  r = data.getInt16(0, LITTLE_ENDIAN);
  g = data.getInt16(2, LITTLE_ENDIAN);
  b = data.getInt16(4, LITTLE_ENDIAN);

  console.log(r, g, b);
}
