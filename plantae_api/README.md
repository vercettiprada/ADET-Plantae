#  Plantae REST API — Backend

Django REST Framework backend for the **PlantaeMobile** Expo app.  
Implements every item from the **Module 3 Web Services Checklist**.

---

## Quick Start

```bash
# 1. Install dependencies
pip install django djangorestframework djangorestframework-simplejwt \
            drf-yasg django-filter

# 2. Run migrations
python manage.py migrate

# 3. Seed plant data (all 11 plants from plant.js)
python manage.py seed_plants

# 4. Create a superuser
python manage.py createsuperuser

# 5. Start the server
python manage.py runserver 0.0.0.0:8000 
```

API is live at: **http://127.0.0.1:8000**  
Swagger UI:     **http://127.0.0.1:8000/swagger/**

---

## Checklist Coverage

| # | Checklist Item | Implementation |
|---|----------------|----------------|
| 1 | Local server running | `python manage.py runserver` → Django homepage |
| 1 | API base URL accessible | `localhost:8000/api/v1/plants` |
| 2 | Resources clearly defined | `/api/v1/plants/` (plural, no verbs) |
| 2 | Proper HTTP methods | GET, POST, PUT, PATCH, DELETE all implemented |
| 2 | Endpoint naming conventions | `/plants/` not `/getPlants/` |
| 2 | API is stateless | JWT-only, no session dependency |
| 3 | Standard JSON format | All responses are `application/json` |
| 3 | Correct request/response structure | Serializers with validation |
| 4 | Pagination | `?page=1&limit=10` → `pagination.count`, `results` |
| 4 | API versioning | `/api/v1/plants/` via URL path versioning |
| 4 | Caching | `cache_page(300)` on list/summary endpoints |
| 5 | Authentication (JWT) | `POST /api/token/` → access + refresh tokens |
| 5 | Protected endpoints | All CRUD requires `Authorization: Bearer <token>` |
| 5 | Input validation | Serializer-level field + object validation |
| 5 | HTTPS concept | Settings include production HTTPS config (commented) |
| 6 | Proper HTTP status codes | 200, 201, 204, 400, 401, 403, 404, 500 |
| 6 | Clear JSON error messages | `{"error": {"code": 404, "status": "NOT_FOUND", ...}}` |
| 7 | API documentation | Swagger UI at `/swagger/`, ReDoc at `/redoc/` |
| 7 | Endpoints + params documented | Full Swagger with request/response schemas |
| 7 | Auth and error codes documented | Documented in Swagger + Postman collection |
| 8 | Functional testing | Postman collection with auto-tests |
| 8 | Security testing | 401 test included in Postman collection |
| 8 | Integration testing (API + DB) | All CRUD operations persist to SQLite |
| 9 | Logging implemented | Console + `logs/plantae.log` + `logs/errors.log` |
| 9 | Errors traceable | All 4xx/5xx logged with view, path, detail |
| 9 | Data format validation | Serializer validates on every POST/PUT/PATCH |
| 10 | GET endpoint works | `GET /api/v1/plants/` and `GET /api/v1/plants/{id}/` |
| 10 | POST endpoint works | `POST /api/v1/plants/` → 201 Created |
| 10 | PUT/PATCH endpoint works | `PUT /api/v1/plants/{id}/` and `PATCH /api/v1/plants/{id}/` |
| 10 | DELETE endpoint works | `DELETE /api/v1/plants/{id}/` → 204 No Content |
| 11 | Framework usage | Django REST Framework + SimpleJWT + drf-yasg |
| 11 | Testing tools | Postman collection + Swagger UI |
| 12 | Working REST API | All endpoints live and tested |
| 12 | Source code | This repository |
| 12 | Documentation | Swagger + this README |

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/token/` | Obtain access + refresh tokens |
| POST | `/api/token/refresh/` | Refresh access token |
| POST | `/api/token/verify/` | Verify token validity |

**Login example:**
```json
POST /api/token/
{
  "username": "admin",
  "password": "plantae123"
}
```
Response:
```json
{
  "access": "eyJ...",
  "refresh": "eyJ..."
}
```

Use the token in all subsequent requests:
```
Authorization: Bearer eyJ...
```

---

### Plants — `/api/v1/plants/`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/plants/`  List all (paginated) |
| POST | `/api/v1/plants/`  | Create a plant |
| GET | `/api/v1/plants/{id}/`  | Get single plant |
| PUT | `/api/v1/plants/{id}/`  | Full update |
| PATCH | `/api/v1/plants/{id}/`  | Partial update |
| DELETE | `/api/v1/plants/{id}/`  | Delete plant |
| GET | `/api/v1/plants/summary/`  | Public lightweight list |

**Query parameters:**
- `?page=1&limit=10` — pagination
- `?search=monstera` — search name/species/fact
- `?ordering=name` or `?ordering=-created_at` — sort
- `?light=Full+Sun` — filter by light requirement

**Plant JSON shape** (matches mobile app's `plant.js`):
```json
{
  "id": 1,
  "name": "Monstera Deliciosa",
  "species": "Swiss Cheese Plant",
  "imageUrl": "https://...",
  "secretfact": "Named for its delicious fruit...",
  "light": "Bright, Indirect",
  "water": "Every 7-10 days",
  "created_at": "2026-04-18T10:00:00Z",
  "updated_at": "2026-04-18T10:00:00Z"
}
```

---

### Error Response Format

All errors follow a consistent JSON structure:
```json
{
  "error": {
    "code": 404,
    "status": "NOT_FOUND",
    "message": "No Plant matches the given query.",
    "details": null
  }
}
```

---

## Connecting to PlantaeMobile

Copy `apiService.js` into your Expo project:
```
PlantaeMobile/
  services/
    apiService.js   ← drop it here
```

Then in `GardenScreen.js`, replace the static import:
```js
// Before (static data)
import { plantData } from '../data/plant';

// After (live API)
import { getPublicPlants } from '../services/apiService';

useEffect(() => {
  getPublicPlants().then(data => setPlants(data.plants));
}, []);
```

---

## Testing with Postman

1. Import `Plantae_API_Postman_Collection.json` into Postman
2. Set collection variable `base_url` = `http://127.0.0.1:8000`
3. Run **"§5 AUTH — Obtain Token"** first (auto-saves token)
4. Run all other requests — each has automated pass/fail tests

---

## Project Structure

```
plantae_api/
├── plantae_api/
│   ├── settings.py      # JWT, pagination, logging, caching config
│   ├── urls.py          # Root URLs: /api/v1/, /swagger/, /api/token/
│   ├── pagination.py    # PlantaePagination (?page=1&limit=10)
│   ├── exceptions.py    # Custom JSON error handler
│   └── middleware.py    # Request/response logging middleware
├── plants/
│   ├── models.py        # Plant model (mirrors plant.js structure)
│   ├── serializers.py   # Validation + camelCase field mapping
│   ├── views.py         # Full CRUD ViewSet with Swagger docs
│   ├── urls.py          # Router: /plants/, /plants/{id}/
│   ├── admin.py         # Django admin registration
│   └── fixtures/
│       └── plants.json  # All 11 plants from plant.js
├── logs/
│   ├── plantae.log      # All requests logged here
│   └── errors.log       # 4xx/5xx errors logged here
├── apiService.js        # → copy to PlantaeMobile/services/
├── Plantae_API_Postman_Collection.json
├── manage.py
└── README.md
```
