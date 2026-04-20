import logging
import time

from django.http import JsonResponse

# 1. Define the logger
logger = logging.getLogger('plantae_api')

class RequestLoggingMiddleware:  # Make sure this name matches settings.py
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log the incoming request
        logger.info(f">> {request.method} {request.path}")

        start_time = time.time()
        try:
            response = self.get_response(request)
        except Exception:
            duration_ms = int((time.time() - start_time) * 1000)
            logger.exception(f"!! Unhandled error {request.method} {request.path} | Duration: {duration_ms}ms")
            if request.path.startswith('/api/'):
                return JsonResponse(
                    {
                        'error': {
                            'code': 500,
                            'status': 'INTERNAL_SERVER_ERROR',
                            'message': 'An unexpected server error occurred.',
                            'details': None,
                        }
                    },
                    status=500,
                )
            raise
        duration_ms = int((time.time() - start_time) * 1000)

        # Log the outgoing response
        logger.info(f"<< {request.method} {request.path} | Status: {response.status_code} | Duration: {duration_ms}ms")

        return response
