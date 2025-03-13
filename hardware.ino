#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include <NimBLEDevice.h>

#define SS_PIN 5    // H16
#define RST_PIN 22  // N16

MFRC522 mfrc522(SS_PIN, RST_PIN); // Create MFRC522 instance

// BLE Variables
NimBLEServer* pServer = nullptr;
NimBLECharacteristic* pCharacteristic = nullptr;
bool deviceConnected = false;
String lastUID = "";

class ServerCallbacks : public NimBLEServerCallbacks {
  void onConnect(NimBLEServer* pServer) {
    deviceConnected = true;
    Serial.println("BLE Device Connected!");
  }
  void onDisconnect(NimBLEServer* pServer) {
    deviceConnected = false;
    Serial.println("BLE Device Disconnected!");
  }
};

void setup() {
  Serial.begin(115200);
  SPI.begin();               // Init SPI bus
  mfrc522.PCD_Init();        // Init MFRC522
  Serial.println("Scan an RFID card or enter UID in Serial Monitor...");

  // Initialize BLE with a generic device name
  NimBLEDevice::init("ESP32-RFID");
  pServer = NimBLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  // Create a BLE service with a full 128-bit UUID
  NimBLEService* pService = pServer->createService("0000181c-0000-1000-8000-00805f9b34fb");

  // Create a characteristic for UID transmission
  pCharacteristic = pService->createCharacteristic(
    "00002a99-0000-1000-8000-00805f9b34fb",
    NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY
  );

  pService->start();
  NimBLEAdvertising* pAdvertising = NimBLEDevice::getAdvertising();
  pAdvertising->addServiceUUID("0000181c-0000-1000-8000-00805f9b34fb");
  pAdvertising->start();

  Serial.println("BLE Server Started!");
}

void loop() {
  // Check if there's data in the Serial Monitor
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n'); // Read until newline
    input.trim(); // Remove whitespace
    if (input.length() > 0) {
      Serial.print("Sending custom UID: ");
      Serial.println(input);
      lastUID = input;
      pCharacteristic->setValue(input.c_str());
      pCharacteristic->notify();
    }
  } else {
    // Use the simple working logic for RFID scanning
    if (!mfrc522.PICC_IsNewCardPresent()) {
      return;
    }
    if (!mfrc522.PICC_ReadCardSerial()) {
      return;
    }

    // Build the UID string
    String currentUID = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      currentUID += (mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
      currentUID += String(mfrc522.uid.uidByte[i], HEX);
    }

    // Print UID to Serial Monitor
    Serial.print("UID: ");
    Serial.println(currentUID);

    // If the UID is new, send via BLE
    if (currentUID != lastUID) {
      Serial.print("New UID: ");
      Serial.println(currentUID);
      lastUID = currentUID;
      pCharacteristic->setValue(currentUID.c_str());
      pCharacteristic->notify();
    }
    mfrc522.PICC_HaltA(); // Halt card
  }
}