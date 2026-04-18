import logging
import time

# 1. Define the logger
logger = logging.getLogger('plantae_api')

class RequestLoggingMiddleware:  # Make sure this name matches settings.py
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log the incoming request
        logger.info(f">> {request.method} {request.path}")
        
        start_time = time.time()
        response = self.get_response(request)
        duration_ms = int((time.time() - start_time) * 1000)

        # Log the outgoing response
        logger.info(f"<< {request.method} {request.path} | Status: {response.status_code} | Duration: {duration_ms}ms")
        
        return response