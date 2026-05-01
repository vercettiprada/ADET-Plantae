from django.core.management.base import BaseCommand

from plants.models import Plant
from plants.perenual import PerenualError, enrich_plant


class Command(BaseCommand):
    help = "Match local plants to Perenual and store enriched plant details."

    def add_arguments(self, parser):
        parser.add_argument("--id", type=int, help="Sync only one plant id.")

    def handle(self, *args, **options):
        queryset = Plant.objects.all().order_by("id")
        if options.get("id"):
            queryset = queryset.filter(id=options["id"])

        synced = 0
        failed = 0

        for plant in queryset:
            try:
                enrich_plant(plant)
                plant.save()
                synced += 1
                self.stdout.write(self.style.SUCCESS(f"Synced {plant.id}: {plant.name}"))
            except PerenualError as exc:
                failed += 1
                safe_message = str(exc).encode("ascii", "ignore").decode("ascii")
                self.stdout.write(self.style.WARNING(f"Skipped {plant.id}: {plant.name} - {safe_message}"))

        self.stdout.write(self.style.SUCCESS(f"Finished. Synced={synced}, Failed={failed}"))
