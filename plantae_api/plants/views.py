import logging
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Plant
from .serializers import PlantSerializer, PlantCreateSerializer, PlantSummarySerializer

logger = logging.getLogger('plants')

class PlantViewSet(viewsets.ModelViewSet):
    queryset = Plant.objects.all().order_by('name')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['light', 'water']
    search_fields = ['name', 'species', 'secret_fact']
    ordering_fields = ['name', 'species', 'created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return PlantCreateSerializer
        return PlantSerializer

    def list(self, request, *args, **kwargs):
        logger.info(f"GET /plants/ by user: {request.user}")
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        logger.info(f"POST /plants/ by user: {request.user}")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Validation failed: {serializer.errors}")
            return Response({
                'error': {
                    'code': 400,
                    'status': 'BAD_REQUEST',
                    'message': 'Validation error.',
                    'details': serializer.errors,
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        logger.info(f"Plant created: {serializer.data.get('name')}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        plant = self.get_object()
        logger.info(f"DELETE /plants/{plant.id}/ ({plant.name}) by user: {request.user}")
        plant.delete()
        return Response({'message': f'Plant "{plant.name}" deleted.'}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path='summary')
    def list_summary(self, request, *args, **kwargs):
        queryset = Plant.objects.all().order_by('name')
        serializer = PlantSummarySerializer(queryset, many=True)
        return Response({'plants': serializer.data, 'count': queryset.count()})