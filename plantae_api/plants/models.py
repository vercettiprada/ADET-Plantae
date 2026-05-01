from django.db import models

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
        # 1. Check if we need an image and if payload is a valid dictionary
        if not self.image_url and self.perenual_payload and isinstance(self.perenual_payload, dict):
            # Safely grab the default_image block (it might be None/null)
            default_image = self.perenual_payload.get('default_image')
            
            # ONLY try to get 'original_url' if default_image is actually a dictionary
            if isinstance(default_image, dict):
                api_image = default_image.get('original_url')
                if api_image:
                    self.image_url = api_image
        
        # 2. DYNAMIC FALLBACK
        if not self.image_url:
            # Fallback string just in case name is empty or None
            safe_name = self.name if self.name else "Unknown Plant"
            clean_name = safe_name.replace(" ", "+")
            self.image_url = f"https://placehold.co/600x400/2e4d32/white?text={clean_name}"

        super().save(*args, **kwargs)

     