"""
Plantae API Pagination
Checklist §4: Pagination implemented for large data (?page=1&limit=10)
"""

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class PlantaePagination(PageNumberPagination):
    """
    Custom pagination matching checklist requirement:
    GET /api/v1/plants/?page=1&limit=10
    """
    page_size = 10
    page_size_query_param = 'limit'   # ?limit=10
    page_query_param = 'page'          # ?page=1
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'pagination': {
                'count': self.page.paginator.count,
                'total_pages': self.page.paginator.num_pages,
                'current_page': self.page.number,
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
            },
            'results': data
        })

    def get_paginated_response_schema(self, schema):
        return {
            'type': 'object',
            'properties': {
                'pagination': {
                    'type': 'object',
                    'properties': {
                        'count': {'type': 'integer'},
                        'total_pages': {'type': 'integer'},
                        'current_page': {'type': 'integer'},
                        'next': {'type': 'string', 'nullable': True},
                        'previous': {'type': 'string', 'nullable': True},
                    }
                },
                'results': schema,
            }
        }
