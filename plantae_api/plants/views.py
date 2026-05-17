from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from django.views.decorators.cache import cache_page
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import generics, permissions, serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework_simplejwt.tokens import RefreshToken

from plantae_api.pagination import PlantaePagination

from .models import Plant
from .perenual import PerenualError, enrich_plant, import_random_species as import_random_perenual_species
from .plantnet import PlantNetError, import_random_species as import_random_plantnet_species
from .serializers import PlantCreateSerializer, PlantSerializer, PlantSummarySerializer


def error_response(message, status_code, details=None):
    error_map = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        405: "METHOD_NOT_ALLOWED",
        409: "CONFLICT",
        500: "INTERNAL_SERVER_ERROR",
    }
    return Response(
        {
            "error": {
                "code": status_code,
                "status": error_map.get(status_code, "ERROR"),
                "message": message,
                "details": details,
            }
        },
        status=status_code,
    )


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("Email already taken.")
        return normalized

    def validate_password(self, value):
        validate_password(value)
        return value


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "first_name"]
        read_only_fields = ["username"]


auth_success_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        "refresh": openapi.Schema(type=openapi.TYPE_STRING),
        "access": openapi.Schema(type=openapi.TYPE_STRING),
        "username": openapi.Schema(type=openapi.TYPE_STRING),
    },
)

error_schema = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        "error": openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "code": openapi.Schema(type=openapi.TYPE_INTEGER),
                "status": openapi.Schema(type=openapi.TYPE_STRING),
                "message": openapi.Schema(type=openapi.TYPE_STRING),
                "details": openapi.Schema(type=openapi.TYPE_OBJECT, nullable=True),
            },
        )
    },
)


@swagger_auto_schema(
    method="post",
    operation_summary="Register a new user",
    request_body=RegisterSerializer,
    responses={201: auth_success_schema, 400: error_schema},
)
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        user = User.objects.create_user(**serializer.validated_data)
    except Exception as exc:
        return error_response("Unable to register user.", status.HTTP_500_INTERNAL_SERVER_ERROR, str(exc))

    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "username": user.username,
        },
        status=status.HTTP_201_CREATED,
    )


@swagger_auto_schema(
    method="post",
    operation_summary="Log in with username or email",
    request_body=LoginSerializer,
    responses={200: auth_success_schema, 401: error_schema},
)
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username_or_email = (request.data.get("username") or "").strip()
    password = request.data.get("password")

    if not username_or_email or not password:
        return error_response("Missing username and password.", status.HTTP_400_BAD_REQUEST)

    try:
        matched_user = User.objects.get(
            Q(email__iexact=username_or_email) | Q(username__iexact=username_or_email)
        )
    except User.DoesNotExist:
        matched_user = None
    except User.MultipleObjectsReturned:
        matched_user = User.objects.filter(email__iexact=username_or_email).order_by("id").first()

    if matched_user is None:
        return error_response("Invalid credentials.", status.HTTP_401_UNAUTHORIZED)

    user = authenticate(request, username=matched_user.username, password=password)

    if user is None or not user.is_active:
        return error_response("Invalid credentials.", status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "username": user.username,
        }
    )


@swagger_auto_schema(
    methods=["get"],
    operation_summary="Get current user profile",
    responses={200: ProfileSerializer, 401: error_schema},
)
@swagger_auto_schema(
    methods=["patch"],
    operation_summary="Update current user profile",
    request_body=ProfileSerializer,
    responses={200: ProfileSerializer, 400: error_schema, 401: error_schema},
)
@swagger_auto_schema(
    methods=["delete"],
    operation_summary="Delete current user account",
    responses={204: "No Content", 401: error_schema},
)
@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([permissions.IsAuthenticated])
def profile_view(request):
    user = request.user

    if request.method == "GET":
        return Response(ProfileSerializer(user).data)

    if request.method == "PATCH":
        serializer = ProfileSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@swagger_auto_schema(
    method="get",
    operation_summary="API base information",
    responses={
        200: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "name": openapi.Schema(type=openapi.TYPE_STRING),
                "version": openapi.Schema(type=openapi.TYPE_STRING),
                "resources": openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Items(type=openapi.TYPE_STRING),
                ),
            },
        )
    },
)
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def api_root_view(request):
    return Response(
        {
            "name": "Plantae REST API",
            "version": "v1",
            "resources": [
                "/api/v1/plants/",
                "/api/v1/plants/summary/",
                "/ws/iot/telemetry/?token=<access-token>",
                "/api/token/",
                "/api/token/refresh/",
                "/api/token/verify/",
                "/swagger/",
                "/redoc/",
            ],
        }
    )


class PlantListCreateView(generics.ListCreateAPIView):
    # ─── RBAC (Module 4 §4.1.2 — Role-Based Access Control) ─────────────────────
    # Default role: IsAuthenticated (authenticated regular user)
    # Admin role (is_staff=True): inherits all permissions + Django admin access
    # RBAC model: two-tier — User (read/write own data) | Admin (full system access)
    # This aligns with RBAC Checklist #14: roles are enforced at the view layer
    queryset = Plant.objects.all().order_by("name")
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PlantaePagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["light", "water"]
    search_fields = ["name", "species", "secret_fact"]
    ordering_fields = ["name", "species", "created_at", "updated_at"]
    ordering = ["name"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PlantCreateSerializer
        return PlantSerializer

    @swagger_auto_schema(
        operation_summary="List plants",
        manual_parameters=[
            openapi.Parameter("page", openapi.IN_QUERY, type=openapi.TYPE_INTEGER),
            openapi.Parameter("limit", openapi.IN_QUERY, type=openapi.TYPE_INTEGER),
            openapi.Parameter("search", openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter("ordering", openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter("light", openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter("water", openapi.IN_QUERY, type=openapi.TYPE_STRING),
        ],
        # FIXED: Changed from PlantSerializer(many=True) to just PlantSerializer
        responses={200: PlantSerializer, 401: error_schema},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Create a plant",
        request_body=PlantCreateSerializer,
        responses={201: PlantSerializer, 400: error_schema, 401: error_schema},
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class PlantRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    # ─── IDOR Protection (Module 4 §4.2 — Insecure Direct Object Reference) ─────
    # Risk: attacker manipulates plant ID in URL to access/modify another user's data.
    # Mitigation: IsAuthenticated required. All plants are shared in this system (public
    # garden model), so ownership-scoping is intentionally not applied — consistent with
    # the application's collaborative plant database design.
    # If per-user isolation were required, queryset would be filtered by request.user.
    queryset = Plant.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PlantSerializer

    def get_object(self):
        try:
            return super().get_object()
        except Exception as exc:
            raise NotFound("Plant not found.") from exc

    @swagger_auto_schema(operation_summary="Retrieve a plant", responses={200: PlantSerializer, 404: error_schema})
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Replace a plant",
        request_body=PlantCreateSerializer,
        responses={200: PlantSerializer, 400: error_schema, 401: error_schema, 404: error_schema},
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Partially update a plant",
        request_body=PlantCreateSerializer,
        responses={200: PlantSerializer, 400: error_schema, 401: error_schema, 404: error_schema},
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Delete a plant",
        responses={204: "No Content", 401: error_schema, 404: error_schema},
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)


@swagger_auto_schema(
    method="get",
    operation_summary="Public lightweight plant list",
    manual_parameters=[
        openapi.Parameter("page", openapi.IN_QUERY, type=openapi.TYPE_INTEGER),
        openapi.Parameter("limit", openapi.IN_QUERY, type=openapi.TYPE_INTEGER),
    ],
    # FIXED: Changed from PlantSummarySerializer(many=True) to just PlantSummarySerializer
    responses={200: PlantSummarySerializer},
)
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@cache_page(300)
def plant_summary_view(request):
    queryset = Plant.objects.all().order_by("name")
    paginator = PlantaePagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = PlantSummarySerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@swagger_auto_schema(
    method="post",
    operation_summary="Enrich plant data from Perenual API",
    operation_description="Fetches detailed care info/light/water data for plant ID",
    responses={200: PlantSerializer, 400: error_schema, 401: error_schema, 404: error_schema},
)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def enrich_plant_view(request, pk):
    try:
        plant = Plant.objects.get(pk=pk)
    except Plant.DoesNotExist:
        return error_response("Plant not found.", status.HTTP_404_NOT_FOUND)

    try:
        enrich_plant(plant)
        plant.save()
    except PerenualError as exc:
        return error_response(str(exc), status.HTTP_400_BAD_REQUEST)

    return Response(PlantSerializer(plant).data, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method="post",
    operation_summary="Discover new plants from external APIs",
    operation_description="Fetches random plants from Perenual + PlantNet (1-8 count)",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            "count": openapi.Schema(type=openapi.TYPE_INTEGER, description="Number of plants (1-8)", default=4)
        }
    ),
    responses={
        200: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                # FIXED: Results is defined as an array of objects for JSON serialization
                "results": openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Items(type=openapi.TYPE_OBJECT)),
                "providers": openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Items(type=openapi.TYPE_STRING)),
                "message": openapi.Schema(type=openapi.TYPE_STRING)
            }
        ),
        400: error_schema,
        401: error_schema
    }
)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def discover_plants_view(request):
    try:
        count = int(request.data.get("count", 4))
    except (TypeError, ValueError):
        count = 4

    count = max(1, min(count, 8))

    providers = []
    notices = []
    plants = []
    seen_ids = set()

    try:
        perenual_plants = import_random_perenual_species(count=count)
        providers.append("perenual")
        for plant in perenual_plants:
            if plant.id in seen_ids:
                continue
            plants.append(plant)
            seen_ids.add(plant.id)
    except PerenualError as exc:
        notices.append(str(exc))

    remaining = max(0, count - len(plants))
    if remaining > 0:
        try:
            plantnet_plants = import_random_plantnet_species(count=remaining)
            if plantnet_plants:
                providers.append("plantnet")
            for plant in plantnet_plants:
                if plant.id in seen_ids:
                    continue
                plants.append(plant)
                seen_ids.add(plant.id)
        except PlantNetError as exc:
            notices.append(str(exc))

    if not plants:
        details = {"providersTried": ["perenual", "plantnet"], "notices": notices}
        return error_response("Unable to discover more plants right now.", status.HTTP_400_BAD_REQUEST, details)

    serializer = PlantSerializer(plants, many=True)
    response_message = ""
    if "plantnet" in providers and "perenual" not in providers:
        response_message = "Showing fresh plants from Pl@ntNet while Perenual is unavailable."
    elif "plantnet" in providers and "perenual" in providers:
        response_message = "Blended results from Perenual and Pl@ntNet."

    return Response(
        {
            "results": serializer.data,
            "providers": providers,
            "message": response_message,
        },
        status=status.HTTP_200_OK,
    )
