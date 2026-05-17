import json

from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.authentication import JWTAuthentication

from .realtime import analyze_telemetry



class TelemetryConsumer(AsyncWebsocketConsumer):
    group_name = "plantae.telemetry"

    async def connect(self):
        
        if not await self._has_valid_token():
            await self.close(code=4401)  
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_json(
            {
                "type": "telemetry.ready",
                "message": "Plantae telemetry WebSocket connected.",
            }
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        try:
            payload = json.loads(text_data or "{}")
        except json.JSONDecodeError:
            await self.send_json({"type": "telemetry.error", "message": "Invalid JSON payload."})
            return

        telemetry = analyze_telemetry(payload)
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "telemetry_update",
                "telemetry": telemetry,
            },
        )

    async def telemetry_update(self, event):
        await self.send_json({"type": "telemetry.update", "data": event["telemetry"]})

    async def send_json(self, content):
        await self.send(text_data=json.dumps(content))

    async def _has_valid_token(self):

        query_string = self.scope.get("query_string", b"").decode()
        token = ""
        for part in query_string.split("&"):
            key, _, value = part.partition("=")
            if key == "token":
                token = value
                break

        if not token:
            return False

        authenticator = JWTAuthentication()
        try:
            authenticator.get_validated_token(token)
        except Exception:
            return False

        return True
