#include <ArduinoBLE.h>

BLEService        ledService        ("5F324CFF-0000-47F5-9F83-760B18C0E261");
BLECharacteristic rgbCharacteristic ("5F324CFF-0001-47F5-9F83-760B18C0E261", BLEWrite, sizeof(byte) * 3);

void setup() {
  Serial.begin(9600);
  //  while (!Serial); // uncomment to wait for Serial port to be opened

  if (!BLE.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1);
  }

  BLE.setLocalName("ArduinoRGB");
  BLE.setDeviceName("ArduinoRGB");
  BLE.setAdvertisedService(ledService);
  BLE.setConnectionInterval(0x06, 0x06); // high connection interval :)

  ledService.addCharacteristic(rgbCharacteristic);

  rgbCharacteristic.setEventHandler(BLEWritten, onRgbLedCharacteristicWrite);

  BLE.addService(ledService);

  BLE.advertise();
}

void loop() {
  BLE.poll();
}

void onRgbLedCharacteristicWrite(BLEDevice central, BLECharacteristic characteristic) {
  byte r = rgbCharacteristic[0];
  byte g = rgbCharacteristic[1];
  byte b = rgbCharacteristic[2];

  setLedPinValue(LEDR, r);
  setLedPinValue(LEDG, g);
  setLedPinValue(LEDB, b);
}

void setLedPinValue(int pin, int value) {
  // RGB LED's are pulled up, so the PWM needs to be inverted

  if (value == 0) {
    // special case to clear LED
    analogWrite(pin, 256);
  } else {
    analogWrite(pin, 255 - value);
  }
}
