import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plantae_api.settings')
django.setup()

# Import your model (Change 'api' if your app folder is named differently)
try:
    from api.models import Plant
except ImportError:
    from plants.models import Plant

def seed_data():
    premium_plants = [
        {"name": "Monstera Deliciosa", "species": "Swiss Cheese Plant", "light": "Bright, Indirect", "water": "Every 7-10 days", "fact": "Named for its delicious fruit."},
        {"name": "Fiddle Leaf Fig", "species": "Ficus lyrata", "light": "Bright, Indirect", "water": "Every 7-10 days", "fact": "Not actually a fig tree!"},
        {"name": "Snake Plant", "species": "Dracaena trifasciata", "light": "Low to Bright", "water": "Every 2-3 weeks", "fact": "Master of air purification."},
        {"name": "Peace Lily", "species": "Spathiphyllum", "light": "Low to Bright", "water": "Every 1-2 weeks", "fact": "Neutralizes indoor toxins."}
    ]

    for p in premium_plants:
        # This matches your React component fields
        Plant.objects.update_or_create(
            name=p['name'],
            defaults={
                'species': p['species'],
                'light': p['light'],
                'water': p['water'],
                'secret_fact': p['fact']
            }
        )
    print("✅ Sanctuary successfully seeded with premium plants!")

if __name__ == '__main__':
    seed_data()