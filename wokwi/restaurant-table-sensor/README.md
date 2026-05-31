# Wokwi: ESP32 table occupancy sensor

This simulation sends table occupancy changes to the app endpoint:

```txt
POST /api/sensor
```

Payload:

```json
{
  "restaurantId": "1",
  "tableId": 1,
  "capacity": 2,
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

Each table has its own ESP32, so change `RESTAURANT_ID`, `TABLE_ID`, and `TABLE_CAPACITY` per device.

Examples already configured in the web app:

| Restaurant | `RESTAURANT_ID` | `TABLE_ID` | `TABLE_CAPACITY` |
| --- | --- | --- | --- |
| Гасова лямпа, стіл 1 | `"1"` | `1` | `2` |
| Гасова лямпа, стіл 2 | `"1"` | `2` | `2` |
| Реберня під Арсеналом, стіл 1 | `"2"` | `1` | `4` |

For example, to simulate Реберня table 1:

```cpp
const char* RESTAURANT_ID = "2";
const int TABLE_ID = 1;
const int TABLE_CAPACITY = 4;
```

The web app polls `/api/tables`, so the catalog and availability grid update automatically after the sensor changes the MongoDB state.
