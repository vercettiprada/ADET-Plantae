from datetime import datetime, timezone


def analyze_telemetry(payload):
    temperature = float(payload.get("temperature", 0) or 0)
    humidity = float(payload.get("humidity", 0) or 0)
    soil_moisture = float(payload.get("soilMoisture", payload.get("soil_moisture", 0)) or 0)

    alerts = []
    if temperature >= 35:
        alerts.append("High temperature")
    if humidity <= 35:
        alerts.append("Low humidity")
    if soil_moisture <= 30:
        alerts.append("Dry soil")

    severity = "critical" if len(alerts) >= 2 else "warning" if alerts else "normal"
    prediction = "Plant stress likely" if alerts else "Plant condition stable"

    return {
        "deviceId": str(payload.get("deviceId") or payload.get("device_id") or "demo-sensor-01"),
        "plantId": payload.get("plantId") or payload.get("plant_id"),
        "temperature": temperature,
        "humidity": humidity,
        "soilMoisture": soil_moisture,
        "prediction": prediction,
        "severity": severity,
        "alerts": alerts,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
