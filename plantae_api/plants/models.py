from django.db import models

from .images import fallback_image_url, image_from_payload, is_usable_image_url

class Plant(models.Model):
    name = models.CharField(max_length=200)
    species = models.CharField(max_length=200)
    image_url = models.URLField(max_length=500, blank=True, default='')
    secret_fact = models.TextField(blank=True, default='')
    light = models.CharField(max_length=100, blank=True, default='')
    water = models.CharField(max_length=100, blank=True, default='')
    description = models.TextField(blank=True, default='')
    cycle = models.CharField(max_length=100, blank=True, default='')
    maintenance = models.CharField(max_length=100, blank=True, default='')
    growth_rate = models.CharField(max_length=100, blank=True, default='')
    hardiness_min = models.CharField(max_length=20, blank=True, default='')
    hardiness_max = models.CharField(max_length=20, blank=True, default='')
    perenual_id = models.PositiveIntegerField(blank=True, null=True, db_index=True)
    perenual_payload = models.JSONField(blank=True, default=dict)
    care_guides = models.JSONField(blank=True, default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.species})"

    def save(self, *args, **kwargs):
        if not is_usable_image_url(self.image_url):
            self.image_url = image_from_payload(self.perenual_payload) or fallback_image_url(self.name, self.species)
        
        super().save(*args, **kwargs)

     
