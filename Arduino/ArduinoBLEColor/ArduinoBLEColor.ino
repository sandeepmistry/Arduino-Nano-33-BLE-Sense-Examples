#include <ArduinoBLE.h>
#include <Arduino_APDS9960.h>

BLEService        apdsService         ("EB7D0A8A-0000-4BB4-855B-E1C85AF41ECC");
BLECharacteristic colorCharacteristic ("EB7D0A8A-0001-4BB4-855B-E1C85AF41ECC", BLENotify, sizeof(unsigned short) * 4);

void setup() {
  Serial.begin(9600);
  //  while (!Serial); // uncomment to wait for Serial port to be opened

  if (!APDS.begin()) {
    Serial.println("Error initializing APDS9960 sensor.");
  }

  if (!BLE.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1);
  }

  BLE.setLocalName("ArduinoColor");
  BLE.setDeviceName("ArduinoColor");
  BLE.setAdvertisedService(apdsService);
  BLE.setConnectionInterval(0x06, 0x06); // high connection interval :)

  apdsService.addCharacteristic(colorCharacteristic);

  BLE.addService(apdsService);

  BLE.advertise();
}

void loop() {
  if (BLE.connected()) {
    if (colorCharacteristic.subscribed() && APDS.colorAvailable()) {
      int r, g, b, c;

      APDS.readColor(r, g, b, c);

      unsigned short color[4] = { r, g, b, c };

      colorCharacteristic.writeValue(color, sizeof(color));
    }
  }
}
