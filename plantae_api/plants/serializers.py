from rest_framework import serializers
from .models import Plant
from .images import resolve_plant_image_url

class PlantSerializer(serializers.ModelSerializer):
    imageUrl = serializers.URLField(source='image_url', required=False, allow_blank=True)
    secretfact = serializers.CharField(source='secret_fact', required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    cycle = serializers.CharField(required=False, allow_blank=True)
    maintenance = serializers.CharField(required=False, allow_blank=True)
    growthRate = serializers.CharField(source='growth_rate', required=False, allow_blank=True)
    hardinessMin = serializers.CharField(source='hardiness_min', required=False, allow_blank=True)
    hardinessMax = serializers.CharField(source='hardiness_max', required=False, allow_blank=True)
    perenualId = serializers.IntegerField(source='perenual_id', required=False, allow_null=True)
    perenualData = serializers.JSONField(source='perenual_payload', required=False)
    careGuides = serializers.JSONField(source='care_guides', required=False)

    class Meta:
        model = Plant
        fields = [
            'id',
            'name',
            'species',
            'imageUrl',
            'secretfact',
            'description',
            'light',
            'water',
            'cycle',
            'maintenance',
            'growthRate',
            'hardinessMin',
            'hardinessMax',
            'perenualId',
            'perenualData',
            'careGuides',
            'created_at',
            'updated_at',
        ]
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

    def validate_imageUrl(self, value):
        return (value or "").strip()

    def ensure_auto_image(self, instance):
        resolved = resolve_plant_image_url(
            instance.name,
            instance.species,
            current_url=instance.image_url,
            payload=instance.perenual_payload,
        )
        if resolved and resolved != instance.image_url:
            instance.image_url = resolved
            instance.save(update_fields=["image_url", "updated_at"])
        return instance

class PlantCreateSerializer(PlantSerializer):

    name = serializers.CharField(required=True, max_length=200)

    species = serializers.CharField(required=True, max_length=200)

    imageUrl = serializers.URLField(source='image_url', required=False, allow_blank=True, default='')

    secretfact = serializers.CharField(source='secret_fact', required=False, allow_blank=True, default='')

    description = serializers.CharField(required=False, allow_blank=True, default='')

    light = serializers.CharField(required=False, allow_blank=True, default='')

    water = serializers.CharField(required=False, allow_blank=True, default='')

    cycle = serializers.CharField(required=False, allow_blank=True, default='')

    maintenance = serializers.CharField(required=False, allow_blank=True, default='')

    growthRate = serializers.CharField(source='growth_rate', required=False, allow_blank=True, default='')

    hardinessMin = serializers.CharField(source='hardiness_min', required=False, allow_blank=True, default='')

    hardinessMax = serializers.CharField(source='hardiness_max', required=False, allow_blank=True, default='')

    perenualId = serializers.IntegerField(source='perenual_id', required=False, allow_null=True)

    perenualData = serializers.JSONField(source='perenual_payload', required=False, default=dict)

    careGuides = serializers.JSONField(source='care_guides', required=False, default=list)

    def create(self, validated_data):
        return self.ensure_auto_image(super().create(validated_data))

    def update(self, instance, validated_data):
        return self.ensure_auto_image(super().update(instance, validated_data))

class PlantSummarySerializer(serializers.ModelSerializer):
    imageUrl = serializers.URLField(source='image_url')

    class Meta:
        model = Plant
        fields = ['id', 'name', 'species', 'imageUrl', 'light', 'water']
