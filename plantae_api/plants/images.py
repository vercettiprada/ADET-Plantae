import hashlib
import json
import re
import ssl
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen


UNUSABLE_IMAGE_MARKERS = (
    "upgrade_access",
    "placehold.co",
    "example.com",
    "x-amz-signature",
    "x-amz-expires",
    "photo-1463936575829-25148e1db1b8",
    "photo-1416879595882-3373a0480b5b",
    "photo-1485955900006-10f4d324d411",
    "photo-1497250681960-ef046c08a56e",
    "photo-1501004318641-b39e6451bec6",
    "photo-1520412099551-62b6bafeb5bb",
    "photo-1483794344563-d27a8d18014e",
    "flag_of_",
)

FALLBACK_IMAGES = (
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1483794344563-d27a8d18014e?auto=format&fit=crop&w=900&q=80",
)


def is_usable_image_url(url):
    candidate = (url or "").strip()
    lowered = candidate.lower()

    if not lowered.startswith(("http://", "https://")):
        return False
    if len(candidate) > 500:
        return False
    return not any(marker in lowered for marker in UNUSABLE_IMAGE_MARKERS)


def image_from_payload(payload):
    if not isinstance(payload, dict):
        return ""

    default_image = payload.get("default_image") or payload.get("defaultImage") or {}
    if not isinstance(default_image, dict):
        return ""

    for key in ("regular_url", "medium_url", "original_url", "thumbnail"):
        candidate = default_image.get(key)
        if is_usable_image_url(candidate):
            return candidate.strip()

    return ""


def fallback_image_url(name, species):
    seed = f"{name or ''}|{species or ''}".encode("utf-8")
    index = int(hashlib.sha256(seed).hexdigest(), 16) % len(FALLBACK_IMAGES)
    return FALLBACK_IMAGES[index]


def resolve_plant_image_url(name, species, current_url="", payload=None, allow_network=True):
    if is_usable_image_url(current_url):
        return current_url.strip()

    payload_image = image_from_payload(payload)
    if payload_image:
        return payload_image

    if allow_network:
        wikimedia_image = resolve_wikimedia_image_url(name, species)
        if wikimedia_image:
            return wikimedia_image

    return fallback_image_url(name, species)


def resolve_wikimedia_image_url(name, species):
    for term in search_terms(name, species):
        image_url = wikipedia_summary_image(term)
        if image_url:
            return image_url
    return ""


def search_terms(name, species):
    seen = set()
    terms = []

    for value in (species, _scientific_base(species), name):
        term = _clean_term(value)
        if term and term.lower() not in seen:
            terms.append(term)
            seen.add(term.lower())

    return terms


def wikipedia_summary_image(term):
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(term)}"
    payload = _request_json(url)

    for key in ("originalimage", "thumbnail"):
        image = payload.get(key) or {}
        source = image.get("source")
        if is_usable_image_url(source):
            return source.strip()

    return ""


def wikipedia_search_image(term):
    params = urlencode(
        {
            "action": "query",
            "generator": "search",
            "gsrsearch": term,
            "gsrlimit": 5,
            "prop": "pageimages",
            "pithumbsize": 900,
            "format": "json",
            "origin": "*",
        }
    )
    payload = _request_json(f"https://en.wikipedia.org/w/api.php?{params}")
    pages = (payload.get("query") or {}).get("pages") or {}

    for page in pages.values():
        source = (page.get("thumbnail") or {}).get("source")
        if is_usable_image_url(source):
            return source.strip()

    return ""


def _request_json(url):
    request = Request(url, headers={"User-Agent": "Plantae/1.0 image resolver"})
    try:
        with urlopen(request, timeout=6, context=_ssl_context()) as response:
            return json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, OSError):
        return {}


def _ssl_context():
    try:
        import certifi

        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return ssl.create_default_context()


def _clean_term(value):
    cleaned = re.sub(r"\([^)]*\)", " ", value or "")
    cleaned = re.sub(r"'[^']*'", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" -")
    return cleaned


def _scientific_base(value):
    cleaned = _clean_term(value)
    words = re.findall(r"[A-Za-z][A-Za-z-]*", cleaned)
    if len(words) >= 2:
        return " ".join(words[:2])
    return cleaned
