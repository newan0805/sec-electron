#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

const char *apSSID = "newan0805_server";
const char *apPassword = "password";
const char *UUID = "newan0805";

const char *expectedEncryptionKey = "enkey@123";

const long utcOffsetInSeconds = 5 * 3600 + 30 * 60;

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", utcOffsetInSeconds);

ESP8266WebServer server(80);

void handleGetData() {
  if (server.hasArg("key") && server.arg("key") == expectedEncryptionKey) {
    String response = "UUID: " + String(UUID) + "\n";
    response += "Date-Time: " + timeClient.getFormattedTime() + "\n";
    response += "X: 1.23\n";
    response += "Y: 4.56\n";
    response += "Z: 7.89\n";

    server.send(200, "text/plain", response);
  } else {
    server.send(403, "text/plain", "Forbidden: Invalid encryption key");
  }
}

void setup() {
  Serial.begin(115200);

  WiFi.softAP(apSSID, apPassword);
  Serial.println("Access Point started");

  Serial.println("AP IP address: " + WiFi.softAPIP().toString());

  timeClient.begin();
  timeClient.update();

  // Routes
  server.on("/get_data", HTTP_GET, handleGetData);

  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  timeClient.update();
  server.handleClient();
}
