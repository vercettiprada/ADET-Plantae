import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response

logger = logging.getLogger('plantae_api')

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        error_map = {
            400: 'BAD_REQUEST', 401: 'UNAUTHORIZED', 403: 'FORBIDDEN',
            404: 'NOT_FOUND', 405: 'METHOD_NOT_ALLOWED', 500: 'INTERNAL_SERVER_ERROR',
        }
        code = response.status_code
        status_text = error_map.get(code, 'ERROR')
        if code >= 400:
            view = context.get('view')
            request = context.get('request')
            logger.error(f"HTTP {code} | {status_text} | View: {view.__class__.__name__ if view else 'unknown'} | Path: {request.path if request else 'unknown'}")
        detail = response.data
        if isinstance(detail, dict) and 'detail' in detail:
            message = str(detail['detail'])
            extra = None
        elif isinstance(detail, dict):
            message = 'Validation error. Please check the fields below.'
            extra = detail
        else:
            message = str(detail)
            extra = None
        response.data = {
            'error': {
                'code': code,
                'status': status_text,
                'message': message,
                'details': extra,
            }
        }
    return response