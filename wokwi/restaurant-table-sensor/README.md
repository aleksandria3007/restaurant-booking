# Wokwi: ESP32 table occupancy sensor

This simulation sends table occupancy changes to the app endpoint:

```txt
POST /api/sensor
```

Payload:

```json
{
  "tableId": 1,
  "isOccupied": true
}
```

## How to run

1. Open Wokwi and create an ESP32 Arduino project.
2. Copy `sketch.ino` and `diagram.json` into the Wokwi project.
3. In `sketch.ino`, replace:

```cpp
const char* SENSOR_API_URL = "https://your-project.vercel.app/api/sensor";
```

The simulation is already configured for this deployed Vercel URL:

```cpp
const char* SENSOR_API_URL = "https://restaurant-booking-wine.vercel.app/api/sensor";
```

If you want to test a local server instead, use a public tunnel such as Ngrok because Wokwi cannot send requests directly to `http://127.0.0.1:3000`.

4. Start the simulation.
5. Change the HC-SR04 distance:
   - less than `60 cm` for 5 seconds means occupied;
   - more than `60 cm` for 5 seconds means free.

Green LED means the place is free. Red LED means it is occupied.

## Matching the web app

`TABLE_ID = 1` matches restaurant/card id `1` in the app. Change `TABLE_ID` to simulate another place:

```cpp
const int TABLE_ID = 2;
```

The web app polls `/api/tables`, so the catalog and availability grid update automatically after the sensor changes the MongoDB state.
