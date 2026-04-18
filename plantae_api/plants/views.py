from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Plant
from .serializers import PlantSerializer

# --- REGISTER VIEW ---
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request, version=None):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not password or not email:
        return Response({'error': 'Missing username, email, or password'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(username=username, email=email, password=password)
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- LOGIN VIEW ---
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request, version=None):
    username = request.data.get('username')
    password = request.data.get('password')

    # Try username first, then fall back to email lookup
    user = authenticate(username=username, password=password)
    if not user:
        try:
            email_user = User.objects.get(email=username)
            user = authenticate(username=email_user.username, password=password)
        except User.DoesNotExist:
            pass

    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


# --- PLANT LIST VIEW ---
@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def plant_list_view(request, version=None):
    plants = Plant.objects.all().order_by('name')
    paginator = PageNumberPagination()
    paginator.page_size = 6
    result_page = paginator.paginate_queryset(plants, request)
    serializer = PlantSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


# --- PLANT DETAIL VIEW ---
@csrf_exempt
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def plant_detail_view(request, pk, version=None):
    try:
        plant = Plant.objects.get(pk=pk)
    except Plant.DoesNotExist:
        return Response({'error': 'Plant not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = PlantSerializer(plant)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = PlantSerializer(plant, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        plant.delete()
        return Response({'message': 'Plant deleted'}, status=status.HTTP_204_NO_CONTENT)


# --- PLANT CREATE VIEW ---
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def plant_create_view(request, version=None):
    serializer = PlantSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)