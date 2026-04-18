"""
Plantae API — Serializers
Checklist §3: Correct request/response structure, JSON format
Checklist §5: Input validation implemented
"""

from rest_framework import serializers
from .models import Plant


class PlantSerializer(serializers.ModelSerializer):
    """
    Full plant serializer — used for list and detail views.
    Response mirrors the mobile app's plant.js data shape.
    """
    # Map snake_case DB fields → camelCase for mobile app compatibility
    imageUrl = serializers.URLField(source='image_url', required=False, allow_blank=True)
    secretfact = serializers.CharField(source='secret_fact', required=False, allow_blank=True)

    class Meta:
        model = Plant
        fields = [
            'id',
            'name',
            'species',
            'imageUrl',
            'secretfact',
            'light',
            'water',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    # ── Input Validation (Checklist §5) ──────────────────────────────────────

    def validate_name(self, value):
        """Name must not be empty and must be at least 2 characters."""
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError(
                "Plant name must be at least 2 characters long."
            )
        return value

    def validate_species(self, value):
        """Species name must not be empty."""
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError(
                "Species name must be at least 2 characters long."
            )
        return value

    def validate_imageUrl(self, value):
        """Validate image URL format if provided."""
        if value and not (value.startswith('http://') or value.startswith('https://')):
            raise serializers.ValidationError(
                "Image URL must be a valid http or https URL."
            )
        return value

    def validate(self, data):
        """Object-level validation."""
        name = data.get('name', '').strip()
        species = data.get('species', '').strip()

        if name and species and name.lower() == species.lower():
            raise serializers.ValidationError(
                "Plant name and species should be different."
            )
        return data


class PlantCreateSerializer(PlantSerializer):
    """Used for POST — name and species are required."""
    name = serializers.CharField(required=True, max_length=200)
    species = serializers.CharField(required=True, max_length=200)
    imageUrl = serializers.URLField(source='image_url', required=False, allow_blank=True, default='')
    secretfact = serializers.CharField(source='secret_fact', required=False, allow_blank=True, default='')
    light = serializers.CharField(required=False, allow_blank=True, default='')
    water = serializers.CharField(required=False, allow_blank=True, default='')


class PlantSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for list endpoints."""
    imageUrl = serializers.URLField(source='image_url')

    class Meta:
        model = Plant
        fields = ['id', 'name', 'species', 'imageUrl', 'light', 'water']
