const LED_UUID = "5F324CFF-0000-47F5-9F83-760B18C0E261".toLowerCase();
const RGB_UUID = "5F324CFF-0001-47F5-9F83-760B18C0E261".toLowerCase();

let blePeripheral;
let rgbCharacteristic;
let connectButton;
let colorPicker;

function setup() {
  // Create a p5ble class
  blePeripheral = new p5ble();

  // Create a 'Connect' button
  connectButton = createButton("Connect");
  connectButton.mousePressed(connectToPeripheral);

  colorPicker = createColorPicker();
  colorPicker.input(onColorChange);

  createCanvas(displayWidth, displayHeight, WEBGL);

  noLoop();
}

function draw() {
}

async function onColorChange() {
  const color = this.value();
  const r = red(color);
  const g = green(color);
  const b = blue(color);

  background(r, g, b);

  if (rgbCharacteristic) {
    const value = new Uint8Array([r, g, b]);

    rgbCharacteristic.writeValue(value);
  }
}

function connectToPeripheral() {
  if (!blePeripheral.isConnected()) {
    blePeripheral.connect(LED_UUID, onConnect);
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

    if (uuid === RGB_UUID) {
      rgbCharacteristic = characteristics[c];
    }
  }
}

function onDisconnect() {
  // change the name of the Connect button:
  connectButton.html('Connect');

  rgbCharacteristic = undefined;
}
