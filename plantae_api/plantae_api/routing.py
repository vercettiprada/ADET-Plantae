from django.urls import path

from plants.consumers import TelemetryConsumer

websocket_urlpatterns = [
    path("ws/iot/telemetry/", TelemetryConsumer.as_asgi()),
]
