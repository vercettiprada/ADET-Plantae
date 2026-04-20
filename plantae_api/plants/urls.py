from django.urls import path

from .views import (
    PlantListCreateView,
    PlantRetrieveUpdateDestroyView,
    identify_plant_view,
    login_view,
    plant_summary_view,
    profile_view,
    register_view,
)

urlpatterns = [
    path("auth/login/", login_view, name="login"),
    path("auth/register/", register_view, name="register"),
    path("auth/profile/", profile_view, name="profile"),
    path("plants/identify/", identify_plant_view, name="plant-identify"),
    path("plants/", PlantListCreateView.as_view(), name="plant-list-create"),
    path("plants/summary/", plant_summary_view, name="plant-summary"),
    path("plants/<int:pk>/", PlantRetrieveUpdateDestroyView.as_view(), name="plant-detail"),
]
