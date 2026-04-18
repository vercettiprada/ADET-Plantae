from django.db import models

class Plant(models.Model):
    name = models.CharField(max_length=200)

    species = models.CharField(max_length=200)
    
    image_url = models.URLField(max_length=500, blank=True, default='')
    
    secret_fact = models.TextField(blank=True, default='')
    
    light = models.CharField(max_length=100, blank=True, default='')
    
    water = models.CharField(max_length=100, blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.species})"