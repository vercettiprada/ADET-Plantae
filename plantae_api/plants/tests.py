from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Plant


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

    def test_protected_endpoint_blocks_unauthorized_access(self):
        response = self.client.get("/api/v1/plants/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("error", response.data)

    def test_get_plants_returns_paginated_results(self):
        response = self.client.get("/api/v1/plants/?page=1&limit=10", **self.auth_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("pagination", response.data)
        self.assertIn("results", response.data)

    def test_homepage_loads(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, "Plantae API is running")

    def test_create_plant(self):
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

    def test_patch_plant(self):
        response = self.client.patch(
            f"/api/v1/plants/{self.plant.id}/",
            {"water": "Every 14 days"},
            format="json",
            **self.auth_headers,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["water"], "Every 14 days")

    def test_put_plant(self):
        response = self.client.put(
            f"/api/v1/plants/{self.plant.id}/",
            {
                "name": "Updated Monstera",
                "species": "Monstera deliciosa",
                "imageUrl": "https://example.com/updated.jpg",
                "secretfact": "Updated fact",
                "light": "Medium Light",
                "water": "Every 9 days",
            },
            format="json",
            **self.auth_headers,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Updated Monstera")

    def test_delete_plant(self):
        response = self.client.delete(f"/api/v1/plants/{self.plant.id}/", **self.auth_headers)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_public_summary_endpoint(self):
        response = self.client.get("/api/v1/plants/summary/?page=1&limit=10")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)

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

    def test_invalid_create_returns_json_error(self):
        response = self.client.post(
            "/api/v1/plants/",
            {"name": "A", "species": ""},
            format="json",
            **self.auth_headers,
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"]["status"], "BAD_REQUEST")

    def test_swagger_accessible(self):
        response = self.client.get("/swagger/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
