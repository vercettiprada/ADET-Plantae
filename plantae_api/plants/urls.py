from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from .views import plant_list_view, plant_detail_view, plant_create_view, register_view, login_view

urlpatterns = [
    path('auth/login/',      csrf_exempt(login_view),        name='login'),
    path('auth/register/',   csrf_exempt(register_view),     name='register'),
    path('plants/',          csrf_exempt(plant_list_view),   name='plant-list'),
    path('plants/add/',      csrf_exempt(plant_create_view), name='plant-create'),
    path('plants/<int:pk>/', csrf_exempt(plant_detail_view), name='plant-detail'),
]