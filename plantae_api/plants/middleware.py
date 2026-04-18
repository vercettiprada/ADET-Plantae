"""
Plantae API — Request Logging Middleware
Checklist §9: Logging implemented, errors traceable in terminal
"""

import logging
import time

logger = logging.getLogger('plantae_api')


class RequestLoggingMiddleware:
    """
    Logs every incoming request with method, path, status, and duration.
    Output visible in console and logs/plantae.log
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()

        # Log incoming request
        logger.info(
            f"→ {request.method} {request.path} "
            f"| User: {request.user if hasattr(request, 'user') else 'anonymous'}"
        )

        response = self.get_response(request)

        duration_ms = round((time.time() - start_time) * 1000, 2)

        # Log response
        level = logging.WARNING if response.status_code >= 400 else logging.INFO
        logger.log(
            level,
            f"← {request.method} {request.path} "
            f"| Status: {response.status_code} "
            f"| Duration: {duration_ms}ms"
        )

        return response
