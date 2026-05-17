from django.urls import path

from .views import (
    PlantListCreateView,
    PlantRetrieveUpdateDestroyView,
    discover_plants_view,
    enrich_plant_view,
    login_view,
    plant_summary_view,
    profile_view,
    register_view,
)

urlpatterns = [
    path("auth/login/", login_view, name="login"),
    path("auth/register/", register_view, name="register"),
    path("auth/profile/", profile_view, name="profile"),
    path("plants/", PlantListCreateView.as_view(), name="plant-list-create"),
    path("plants/discover/", discover_plants_view, name="plant-discover"),
    path("plants/summary/", plant_summary_view, name="plant-summary"),
    path("plants/<int:pk>/enrich/", enrich_plant_view, name="plant-enrich"),
    path("plants/<int:pk>/", PlantRetrieveUpdateDestroyView.as_view(), name="plant-detail"),
]
