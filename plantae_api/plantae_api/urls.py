"""
Plantae API — Root URL Configuration
Checklist §2: REST endpoints, naming conventions (plural, no verbs)
Checklist §4: API versioning /api/v1/
Checklist §5: Token endpoints /api/token/
Checklist §7: Swagger docs at /swagger/
"""

from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

# ─── Swagger / OpenAPI Documentation (Checklist §7) ──────────────────────────
schema_view = get_schema_view(
    openapi.Info(
        title="Plantae API",
        default_version='v1',
        description="""
## Plantae Plant Care REST API

A fully RESTful backend for the PlantaeMobile app.

### Features
- **JWT Authentication** — obtain tokens at `/api/token/`
- **Full CRUD** — GET, POST, PUT, DELETE on `/api/v1/plants/`
- **Pagination** — `?page=1&limit=10`
- **Search** — `?search=monstera`
- **Ordering** — `?ordering=name`
- **Versioning** — `/api/v1/`

### Authentication
1. POST to `/api/token/` with `{"username": "...", "password": "..."}`
2. Copy the `access` token
3. Add header: `Authorization: Bearer <token>`
        """,
        terms_of_service="https://www.plantae.app/terms/",
        contact=openapi.Contact(email="support@plantae.app"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # ── Authentication (Checklist §5) ─────────────────────────────────────────
    # POST /api/token/         → obtain access + refresh tokens
    # POST /api/token/refresh/ → refresh access token
    # POST /api/token/verify/  → verify token validity
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # ── Versioned API (Checklist §4 — /api/v1/) ───────────────────────────────
    path('api/<str:version>/', include('plants.urls')),

    # ── API Documentation (Checklist §7) ─────────────────────────────────────
    # Swagger UI: http://127.0.0.1:8000/swagger/
    re_path(r'^swagger(?P<format>\.json|\.yaml)$',
            schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # ── API Root ──────────────────────────────────────────────────────────────
    path('api/', include('plants.urls')),
]
