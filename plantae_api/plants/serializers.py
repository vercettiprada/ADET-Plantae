from rest_framework import serializers
from .models import Plant

class PlantSerializer(serializers.ModelSerializer):
    imageUrl = serializers.URLField(source='image_url', required=False, allow_blank=True)
    secretfact = serializers.CharField(source='secret_fact', required=False, allow_blank=True)

    class Meta:
        model = Plant
        fields = ['id', 'name', 'species', 'imageUrl', 'secretfact', 'light', 'water', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Plant name must be at least 2 characters.")
        return value

    def validate_species(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Species name must be at least 2 characters.")
        return value

class PlantCreateSerializer(PlantSerializer):
    name = serializers.CharField(required=True, max_length=200)
    species = serializers.CharField(required=True, max_length=200)
    imageUrl = serializers.URLField(source='image_url', required=False, allow_blank=True, default='')
    secretfact = serializers.CharField(source='secret_fact', required=False, allow_blank=True, default='')
    light = serializers.CharField(required=False, allow_blank=True, default='')
    water = serializers.CharField(required=False, allow_blank=True, default='')

class PlantSummarySerializer(serializers.ModelSerializer):
    imageUrl = serializers.URLField(source='image_url')

    class Meta:
        model = Plant
        fields = ['id', 'name', 'species', 'imageUrl', 'light', 'water']