from unittest.mock import patch

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Plant
from .perenual import PerenualError
from .realtime import analyze_telemetry
from .images import fallback_image_url, is_usable_image_url


class PlantApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="tester",
            email="tester@example.com",
            password="strongpass123",
        )
        self.plant = Plant.objects.create(
            name="Monstera Deliciosa",
            species="Swiss Cheese Plant",
            image_url="https://example.com/plant.jpg",
            secret_fact="It can grow very large indoors.",
            light="Bright Indirect Light",
            water="Every 7 days",
        )
        token_response = self.client.post(
            reverse("token_obtain_pair"),
            {"username": "tester", "password": "strongpass123"},
            format="json",
        )
        self.access_token = token_response.data["access"]
        self.auth_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.access_token}"}

    def test_custom_login_accepts_username(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "tester", "password": "strongpass123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertEqual(response.data["username"], self.user.username)

    def test_custom_login_accepts_email_case_insensitively(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "TESTER@EXAMPLE.COM", "password": "strongpass123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_legacy_login_alias_is_supported(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "tester", "password": "strongpass123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_register_rejects_duplicate_email(self):
        response = self.client.post(
            "/api/v1/auth/register/",
            {
                "username": "another-user",
                "email": "TESTER@example.com",
                "password": "strongpass123",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_protected_endpoint_blocks_unauthorized_access(self):
        response = self.client.get("/api/v1/plants/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_plants_returns_paginated_results(self):
        response = self.client.get("/api/v1/plants/?page=1&limit=10", **self.auth_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("pagination", response.data)
        self.assertIn("results", response.data)
        self.assertIn("no-store", response["Cache-Control"])
        self.assertIn("Authorization", response["Vary"])

    def test_get_single_plant(self):
        response = self.client.get(f"/api/v1/plants/{self.plant.id}/", **self.auth_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.plant.id)
        self.assertEqual(response.data["name"], self.plant.name)

    @patch("plants.serializers.resolve_plant_image_url")
    def test_create_plant(self, resolve_plant_image_url_mock):
        resolve_plant_image_url_mock.return_value = "https://images.unsplash.com/photo-1416879595882-3373a0480b5b"
        payload = {
            "name": "Snake Plant",
            "species": "Sansevieria trifasciata",
            "imageUrl": "https://example.com/snake.jpg",
            "secretfact": "It releases oxygen at night.",
            "light": "Low to Bright Indirect Light",
            "water": "Every 10 days",
        }
        response = self.client.post("/api/v1/plants/", payload, format="json", **self.auth_headers)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], payload["name"])

    @patch("plants.serializers.resolve_plant_image_url")
    def test_patch_plant(self, resolve_plant_image_url_mock):
        resolve_plant_image_url_mock.return_value = "https://images.unsplash.com/photo-1416879595882-3373a0480b5b"
        response = self.client.patch(
            f"/api/v1/plants/{self.plant.id}/",
            {"water": "Every 14 days"},
            format="json",
            **self.auth_headers,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["water"], "Every 14 days")

    def test_delete_plant(self):
        response = self.client.delete(f"/api/v1/plants/{self.plant.id}/", **self.auth_headers)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    @patch("plants.views.import_random_perenual_species")
    def test_discover_random_plants(self, import_random_perenual_species_mock):
        discovered = Plant.objects.create(
            name="Prayer Plant",
            species="Maranta leuconeura",
            image_url="https://example.com/prayer-plant.jpg",
            secret_fact="Leaves fold upward at night.",
            perenual_id=9999,
        )
        import_random_perenual_species_mock.return_value = [discovered]

        response = self.client.post(
            "/api/v1/plants/discover/",
            {"count": 1},
            format="json",
            **self.auth_headers,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertEqual(response.data["results"][0]["name"], discovered.name)

    @patch("plants.views.import_random_plantnet_species")
    @patch("plants.views.import_random_perenual_species")
    def test_discover_random_plants_falls_back_to_plantnet(
        self,
        import_random_perenual_species_mock,
        import_random_plantnet_species_mock,
    ):
        import_random_perenual_species_mock.side_effect = PerenualError("Perenual quota reached.")
        discovered = Plant.objects.create(
            name="Boxwood",
            species="Buxus sempervirens",
            image_url="https://example.com/boxwood.jpg",
            secret_fact="Imported from Pl@ntNet fallback.",
        )
        import_random_plantnet_species_mock.return_value = [discovered]

        response = self.client.post(
            "/api/v1/plants/discover/",
            {"count": 1},
            format="json",
            **self.auth_headers,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["providers"], ["plantnet"])
        self.assertEqual(response.data["results"][0]["name"], discovered.name)

    def test_public_summary_endpoint(self):
        response = self.client.get("/api/v1/plants/summary/?page=1&limit=10")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertNotIn("no-store", response.get("Cache-Control", ""))

    def test_get_profile(self):
        response = self.client.get("/api/v1/auth/profile/", **self.auth_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], self.user.username)
        self.assertEqual(response.data["email"], self.user.email)

    def test_update_profile(self):
        response = self.client.patch(
            "/api/v1/auth/profile/",
            {"first_name": "Tester", "email": "updated@example.com"},
            format="json",
            **self.auth_headers,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "Tester")
        self.assertEqual(response.data["email"], "updated@example.com")

    def test_delete_account(self):
        response = self.client.delete("/api/v1/auth/profile/", **self.auth_headers)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(username=self.user.username).exists())

    def test_analyze_telemetry_marks_stressed_plant(self):
        telemetry = analyze_telemetry(
            {
                "deviceId": "sensor-1",
                "temperature": 36,
                "humidity": 30,
                "soilMoisture": 22,
            }
        )

        self.assertEqual(telemetry["severity"], "critical")
        self.assertEqual(telemetry["prediction"], "Plant stress likely")
        self.assertIn("High temperature", telemetry["alerts"])
        self.assertIn("Low humidity", telemetry["alerts"])
        self.assertIn("Dry soil", telemetry["alerts"])

    def test_image_resolver_rejects_perenual_upgrade_and_signed_urls(self):
        self.assertFalse(is_usable_image_url("https://perenual.test/image/upgrade_access.jpg"))
        self.assertFalse(is_usable_image_url("https://s3.test/photo.jpg?X-Amz-Signature=abc"))
        self.assertFalse(is_usable_image_url("https://example.com/plant.jpg"))

    def test_image_fallback_is_unique_per_plant(self):
        images = {
            fallback_image_url("Snake Plant", "Dracaena trifasciata"),
            fallback_image_url("Peace Lily", "Spathiphyllum"),
            fallback_image_url("Jade Plant", "Crassula ovata"),
        }

        self.assertGreater(len(images), 1)
        for image in images:
            self.assertTrue(image.startswith("https://images.unsplash.com/"))
