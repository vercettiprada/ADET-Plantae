from django.contrib import admin
from .models import Plant

@admin.register(Plant)
class PlantAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'species', 'light', 'water', 'created_at']
    search_fields = ['name', 'species']
    ordering = ['name']