#include <ArduinoBLE.h>
#include <Arduino_LSM9DS1.h> // change to Arduino_LSM6DS3.h for Nano 33 IoT or Uno WiFi Rev 2

BLEService        imuService                 ("2A5A20B9-0000-4B9C-9C69-4975713E0FF2");
BLECharacteristic accelerationCharacteristic ("2A5A20B9-0001-4B9C-9C69-4975713E0FF2", BLENotify, sizeof(float) * 3);
BLECharacteristic gyroscopeCharacteristic    ("2A5A20B9-0002-4B9C-9C69-4975713E0FF2", BLENotify, sizeof(float) * 3);

void setup() {
  Serial.begin(9600);
  //  while (!Serial); // uncomment to wait for Serial port to be opened

  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1);
  }

  if (!BLE.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1);
  }

  BLE.setLocalName("ArduinoIMU");
  BLE.setDeviceName("ArduinoIMU");
  BLE.setAdvertisedService(imuService);
  BLE.setConnectionInterval(0x06, 0x06); // high connection interval :)

  imuService.addCharacteristic(accelerationCharacteristic);
  imuService.addCharacteristic(gyroscopeCharacteristic);

  BLE.addService(imuService);

  BLE.advertise();
}

void loop() {
  if (BLE.connected()) {
    if (accelerationCharacteristic.subscribed() && IMU.accelerationAvailable()) {
      float acceleration[3];

      // x, y, z
      IMU.readAcceleration(acceleration[0], acceleration[1], acceleration[2]);

      accelerationCharacteristic.writeValue(acceleration, sizeof(acceleration));
    }

    if (gyroscopeCharacteristic.subscribed() && IMU.gyroscopeAvailable()) {
      float gyroscope[3];

      // x, y, z
      IMU.readGyroscope(gyroscope[0], gyroscope[1], gyroscope[2]);

      gyroscopeCharacteristic.writeValue(gyroscope, sizeof(gyroscope));
    }
  }
}
