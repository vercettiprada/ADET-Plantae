from django.core.management.base import BaseCommand

from plants.images import resolve_plant_image_url
from plants.models import Plant


class Command(BaseCommand):
    help = "Replace blank, placeholder, upsell, or expired plant images with stable auto images."

    def add_arguments(self, parser):
        parser.add_argument(
            "--no-network",
            action="store_true",
            help="Skip Wikimedia lookups and only use deterministic fallback images.",
        )
        parser.add_argument(
            "--refresh",
            action="store_true",
            help="Re-resolve every plant image instead of only replacing bad URLs.",
        )

    def handle(self, *args, **options):
        repaired = 0
        allow_network = not options["no_network"]
        refresh = options["refresh"]

        for plant in Plant.objects.all():
            resolved = resolve_plant_image_url(
                plant.name,
                plant.species,
                current_url="" if refresh else plant.image_url,
                payload=plant.perenual_payload,
                allow_network=allow_network,
            )

            if resolved and resolved != plant.image_url:
                Plant.objects.filter(pk=plant.pk).update(image_url=resolved)
                repaired += 1
                self.stdout.write(f"{plant.id}: {plant.name} -> {resolved}")

        self.stdout.write(self.style.SUCCESS(f"Repaired {repaired} plant image(s)."))
