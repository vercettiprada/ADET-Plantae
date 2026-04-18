import logging
import time

logger = logging.getLogger('plantae_api')

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        logger.info(f"→ {request.method} {request.path}")
        response = self.get_response(request)
        duration_ms = round((time.time() - start_time) * 1000, 2)
        level = logging.WARNING if response.status_code >= 400 else logging.INFO
        logger.log(level, f"← {request.method} {request.path} | Status: {response.status_code} | Duration: {duration_ms}ms")
        return response