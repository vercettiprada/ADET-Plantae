import json
import random
import ssl
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

import certifi
from django.conf import settings


class PerenualError(Exception):
    pass


def _normalize(value):
    return " ".join((value or "").strip().lower().split())


def _usable_image_url(*candidates):
    for candidate in candidates:
        if candidate and "upgrade_access" not in candidate:
            return candidate
    return ""


def _request_json(path, params=None):
    api_key = getattr(settings, "PERENUAL_API_KEY", "").strip()
    if not api_key:
        raise PerenualError("PERENUAL_API_KEY is not configured.")

    query = dict(params or {})
    query["key"] = api_key
    url = f"{settings.PERENUAL_API_BASE_URL.rstrip('/')}/{path.lstrip('/')}?{urlencode(query, doseq=True)}"
    ssl_context = ssl.create_default_context(cafile=certifi.where())

    try:
        with urlopen(url, timeout=20, context=ssl_context) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        raise PerenualError(f"Perenual API returned HTTP {exc.code}: {body}") from exc
    except URLError as exc:
        raise PerenualError(f"Unable to reach Perenual API: {exc.reason}") from exc


def search_species(query):
    return _request_json("v2/species-list", {"q": query})


def get_species_details(species_id):
    return _request_json(f"v2/species/details/{species_id}")


def get_care_guides(species_id):
    payload = _request_json("species-care-guide-list", {"species_id": species_id})
    return payload.get("data", [])


def list_species(page=1, **filters):
    params = {"page": page}
    params.update(filters)
    return _request_json("v2/species-list", params)


def _candidate_names(item):
    names = []
    common_name = item.get("common_name")
    if common_name:
        names.append(common_name)
    for scientific_name in item.get("scientific_name") or []:
        if scientific_name:
            names.append(scientific_name)
    for other_name in item.get("other_name") or []:
        if other_name:
            names.append(other_name)
    return names


def choose_best_match(plant_name, plant_species, results):
    targets = [_normalize(plant_name), _normalize(plant_species)]
    scored = []

    for item in results or []:
        names = [_normalize(name) for name in _candidate_names(item)]
        common_name = _normalize(item.get("common_name"))

        score = 0
        for target in targets:
            if not target:
                continue
            if target in names:
                score = max(score, 100)
            elif target == common_name:
                score = max(score, 95)
            elif any(target in name or name in target for name in names if name):
                score = max(score, 70)

        if score:
            scored.append((score, item))

    if not scored:
        return (results or [None])[0]

    scored.sort(key=lambda pair: pair[0], reverse=True)
    return scored[0][1]


def build_watering_label(details):
    watering = details.get("watering") or ""
    benchmark = details.get("watering_general_benchmark") or {}
    value = benchmark.get("value")
    unit = benchmark.get("unit")

    if value and unit:
        return f"{watering} ({value} {unit})".strip()

    return watering


def build_secret_fact(details, guides, fallback):
    description = (details.get("description") or "").strip()
    if description:
        return description

    for guide in guides or []:
        guide_description = (guide.get("description") or "").strip()
        if guide_description:
            return guide_description

    if details.get("medicinal"):
        return "This plant is noted in Perenual as having medicinal value."
    if details.get("poisonous_to_pets"):
        return "This plant is marked in Perenual as poisonous to pets."
    if details.get("drought_tolerant"):
        return "This plant is marked in Perenual as drought tolerant."

    return fallback


def apply_enrichment(plant, details, guides):
    scientific_names = details.get("scientific_name") or []
    default_image = details.get("default_image") or {}
    sunlight = details.get("sunlight") or []
    hardiness = details.get("hardiness") or {}

    plant.perenual_id = details.get("id")
    plant.name = details.get("common_name") or plant.name
    if scientific_names:
        plant.species = scientific_names[0]
    plant.image_url = (
        _usable_image_url(
            default_image.get("regular_url"),
            default_image.get("medium_url"),
            default_image.get("original_url"),
            default_image.get("thumbnail"),
        )
        or plant.image_url
    )
    plant.light = ", ".join(sunlight) or plant.light
    plant.water = build_watering_label(details) or plant.water
    plant.secret_fact = build_secret_fact(details, guides, plant.secret_fact)
    plant.description = (details.get("description") or plant.description or "").strip()
    plant.cycle = details.get("cycle") or plant.cycle
    plant.maintenance = details.get("maintenance") or plant.maintenance
    plant.growth_rate = details.get("growth_rate") or plant.growth_rate
    plant.hardiness_min = str(hardiness.get("min") or plant.hardiness_min or "")
    plant.hardiness_max = str(hardiness.get("max") or plant.hardiness_max or "")
    plant.perenual_payload = details
    plant.care_guides = guides or []
    return plant


def upsert_from_perenual_item(item, guides=None):
    from .models import Plant

    scientific_names = item.get("scientific_name") or []
    lookup_species = scientific_names[0] if scientific_names else item.get("common_name") or "Unknown Species"

    plant = None
    perenual_id = item.get("id")
    if perenual_id:
        plant = Plant.objects.filter(perenual_id=perenual_id).first()

    if plant is None:
        plant = Plant.objects.filter(species__iexact=lookup_species).first()

    if plant is None:
        plant = Plant(
            name=item.get("common_name") or lookup_species,
            species=lookup_species,
            secret_fact="Imported from Perenual.",
        )

    apply_enrichment(plant, item, guides or [])
    plant.save()
    return plant


def enrich_plant(plant):
    search_terms = [plant.species, plant.name]

    best_match = None
    for term in search_terms:
        payload = search_species(term)
        best_match = choose_best_match(plant.name, plant.species, payload.get("data") or [])
        if best_match:
            break

    if not best_match:
        raise PerenualError(f"No Perenual match found for '{plant.name}' / '{plant.species}'.")

    try:
        details = get_species_details(best_match["id"])
    except PerenualError:
        details = best_match

    try:
        guides = get_care_guides(best_match["id"])
    except PerenualError:
        guides = []

    return apply_enrichment(plant, details, guides)


def import_random_species(count=4):
    candidate_pages = list(range(1, 21))
    random.shuffle(candidate_pages)
    selected = []
    seen = set()

    for page in candidate_pages[:4]:
        payload = list_species(page=page, indoor=1)
        items = payload.get("data") or []
        random.shuffle(items)

        for item in items:
            item_id = item.get("id")
            default_image = item.get("default_image") or {}
            if not item_id or item_id in seen:
                continue
            if not item.get("common_name") or not default_image:
                continue
            if not _usable_image_url(
                default_image.get("regular_url"),
                default_image.get("medium_url"),
                default_image.get("original_url"),
                default_image.get("thumbnail"),
            ):
                continue

            seen.add(item_id)
            selected.append(upsert_from_perenual_item(item))

            if len(selected) >= count:
                return selected

    return selected
