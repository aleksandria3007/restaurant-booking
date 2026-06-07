#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// Replace this URL with your deployed app URL or a public tunnel URL.
// Wokwi cannot send requests directly to http://127.0.0.1:3000.
const char* SENSOR_API_URL = "https://restaurant-booking-wine.vercel.app/api/sensor";

// One ESP32 is mounted under one physical table.
// Example configs:
// Gasova lyampa, table 1: RESTAURANT_ID = "1", TABLE_ID = 1
// Gasova lyampa, table 2: RESTAURANT_ID = "1", TABLE_ID = 2
// Rebernya, table 1:      RESTAURANT_ID = "2", TABLE_ID = 1
const char* RESTAURANT_ID = "1";
const int TABLE_ID = 1;
const int TABLE_CAPACITY = 2;

const int TRIG_PIN = 5;
const int ECHO_PIN = 18;
const int GREEN_LED_PIN = 26;
const int RED_LED_PIN = 27;

const float OCCUPIED_DISTANCE_CM = 60.0;
// 15 сек стабільного руху → надсилаємо "зайнятий" (захист від людей, що проходять повз)
const unsigned long OCCUPIED_CONFIRM_MS = 15000;
// 5 сек без руху → надсилаємо "вільний" (сервер додатково тримає 15 хв grace-period)
const unsigned long FREE_CONFIRM_MS = 5000;
const unsigned long READ_INTERVAL_MS = 400;

bool currentOccupied = false;
bool candidateOccupied = false;
bool hasReportedInitialState = false;
unsigned long candidateChangedAt = 0;
unsigned long lastReadAt = 0;

float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0) {
    return 999.0;
  }

  return duration * 0.0343 / 2.0;
}

void updateLeds(bool isOccupied) {
  digitalWrite(RED_LED_PIN, isOccupied ? HIGH : LOW);
  digitalWrite(GREEN_LED_PIN, isOccupied ? LOW : HIGH);
}

void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("Connected. IP: ");
  Serial.println(WiFi.localIP());
}

bool sendTableState(bool isOccupied) {
  connectWifi();

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  http.begin(client, SENSOR_API_URL);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"restaurantId\":\"";
  payload += RESTAURANT_ID;
  payload += "\",\"tableId\":";
  payload += TABLE_ID;
  payload += ",\"capacity\":";
  payload += TABLE_CAPACITY;
  payload += ",\"isOccupied\":";
  payload += isOccupied ? "true" : "false";
  payload += "}";

  Serial.print("POST ");
  Serial.println(payload);

  int responseCode = http.POST(payload);
  String response = http.getString();

  Serial.print("HTTP ");
  Serial.println(responseCode);
  Serial.println(response);

  http.end();

  return responseCode >= 200 && responseCode < 300;
}

void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);

  updateLeds(false);
  connectWifi();

  candidateChangedAt = millis();
  Serial.println("Restaurant table sensor started.");
}

void loop() {
  unsigned long now = millis();
  if (now - lastReadAt < READ_INTERVAL_MS) {
    return;
  }

  lastReadAt = now;
  float distance = readDistanceCm();
  bool measuredOccupied = distance > 0 && distance < OCCUPIED_DISTANCE_CM;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.print(" cm, measured: ");
  Serial.println(measuredOccupied ? "occupied" : "free");

  if (measuredOccupied != candidateOccupied) {
    candidateOccupied = measuredOccupied;
    candidateChangedAt = now;
  }

  unsigned long confirmMs = candidateOccupied ? OCCUPIED_CONFIRM_MS : FREE_CONFIRM_MS;
  bool stableLongEnough = now - candidateChangedAt >= confirmMs;
  bool stateChanged = candidateOccupied != currentOccupied;

  if (stableLongEnough && (stateChanged || !hasReportedInitialState)) {
    if (sendTableState(candidateOccupied)) {
      currentOccupied = candidateOccupied;
      hasReportedInitialState = true;
      updateLeds(currentOccupied);
    }
  }
}
