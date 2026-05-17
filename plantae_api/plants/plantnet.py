import json
import random
import ssl
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

import certifi
from django.conf import settings

from .images import is_usable_image_url


class PlantNetError(Exception):
    pass


DISCOVERY_BBOXES = [
    {"topLeftLon": -124.8, "topLeftLat": 49.1, "bottomRightLon": -66.9, "bottomRightLat": 24.5},
    {"topLeftLon": -10.8, "topLeftLat": 59.8, "bottomRightLon": 30.4, "bottomRightLat": 35.0},
    {"topLeftLon": 95.0, "topLeftLat": 23.9, "bottomRightLon": 126.4, "bottomRightLat": -10.7},
    {"topLeftLon": 72.0, "topLeftLat": 35.7, "bottomRightLon": 89.5, "bottomRightLat": 7.8},
    {"topLeftLon": 112.0, "topLeftLat": -10.0, "bottomRightLon": 154.0, "bottomRightLat": -44.0},
    {"topLeftLon": -81.8, "topLeftLat": 12.8, "bottomRightLon": -34.7, "bottomRightLat": -55.8},
    {"topLeftLon": 13.0, "topLeftLat": 15.5, "bottomRightLon": 40.0, "bottomRightLat": -35.0},
]


def _request_json(path, params=None):
    api_key = getattr(settings, "PLANTNET_API_KEY", "").strip()
    if not api_key:
        raise PlantNetError("PLANTNET_API_KEY is not configured.")

    query = dict(params or {})
    query["api-key"] = api_key
    url = f"{settings.PLANTNET_API_BASE_URL.rstrip('/')}/{path.lstrip('/')}?{urlencode(query, doseq=True)}"
    ssl_context = ssl.create_default_context(cafile=certifi.where())

    try:
        with urlopen(url, timeout=20, context=ssl_context) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        raise PlantNetError(f"PlantNet API returned HTTP {exc.code}: {body}") from exc
    except URLError as exc:
        raise PlantNetError(f"Unable to reach PlantNet API: {exc.reason}") from exc


def _usable_image_url(images):
    for image in images or []:
        for key in ("o", "m", "s"):
            candidate = (image or {}).get(key)
            if is_usable_image_url(candidate):
                return candidate.strip()
    return ""


def _build_secret_fact(item):
    family = item.get("family")
    genus = item.get("genus")

    parts = ["Imported from Pl@ntNet fallback."]
    if family:
        parts.append(f"Family: {family}.")
    if genus:
        parts.append(f"Genus: {genus}.")
    return " ".join(parts)


def _build_description(item):
    growth_forms = ((item.get("iucn") or {}).get("growth_forms") or [])
    habitats = ((item.get("iucn") or {}).get("habitats") or [])

    parts = []
    if growth_forms:
        parts.append(f"Growth forms: {', '.join(growth_forms[:3])}.")
    if habitats:
        habitat_names = [entry.get("habitat") for entry in habitats if entry.get("habitat")]
        if habitat_names:
            parts.append(f"Common habitats: {', '.join(habitat_names[:3])}.")

    return " ".join(parts)


def upsert_from_geo_prediction(item):
    from .models import Plant

    common_names = item.get("commonNames") or []
    scientific_name = (item.get("name") or "").strip() or "Unknown Species"
    display_name = (common_names[0] if common_names else scientific_name).strip() or scientific_name
    image_url = _usable_image_url(item.get("images"))

    if not image_url:
        return None

    plant = Plant.objects.filter(species__iexact=scientific_name).first()
    if plant is None and display_name:
        plant = Plant.objects.filter(name__iexact=display_name).first()

    if plant is None:
        plant = Plant(
            name=display_name,
            species=scientific_name,
        )

    plant.name = display_name or plant.name
    plant.species = scientific_name or plant.species
    plant.image_url = image_url or plant.image_url
    if not plant.secret_fact:
        plant.secret_fact = _build_secret_fact(item)
    if not plant.description:
        plant.description = _build_description(item)
    plant.save()
    return plant


def predict_geo_species(bbox):
    return _request_json("v2/prediction/geo/species", bbox)


def import_random_species(count=4):
    bboxes = DISCOVERY_BBOXES[:]
    random.shuffle(bboxes)
    selected = []
    seen_species = set()

    for bbox in bboxes:
        payload = predict_geo_species(bbox)
        candidates = payload if isinstance(payload, list) else []
        random.shuffle(candidates)

        for item in candidates:
            scientific_name = (item.get("name") or "").strip().lower()
            if not scientific_name or scientific_name in seen_species:
                continue
            if not _usable_image_url(item.get("images")):
                continue

            plant = upsert_from_geo_prediction(item)
            if plant is None:
                continue

            seen_species.add(scientific_name)
            selected.append(plant)

            if len(selected) >= count:
                return selected

    return selected
