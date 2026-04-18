"""
Plantae API — Custom Exception Handler
Checklist §6: Proper HTTP status codes, clear JSON error messages
"""

import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger('plantae_api')


def custom_exception_handler(exc, context):
    """
    Returns consistent JSON error structure:
    {
        "error": {
            "code": 404,
            "status": "NOT_FOUND",
            "message": "Plant not found.",
            "details": null
        }
    }
    """
    # Call DRF's default handler first
    response = exception_handler(exc, context)

    if response is not None:
        error_map = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            405: 'METHOD_NOT_ALLOWED',
            409: 'CONFLICT',
            422: 'UNPROCESSABLE_ENTITY',
            429: 'TOO_MANY_REQUESTS',
            500: 'INTERNAL_SERVER_ERROR',
        }

        code = response.status_code
        status_text = error_map.get(code, 'ERROR')

        # Log all 4xx/5xx errors (Checklist §9)
        if code >= 400:
            view = context.get('view')
            request = context.get('request')
            logger.error(
                f"HTTP {code} | {status_text} | "
                f"View: {view.__class__.__name__ if view else 'unknown'} | "
                f"Path: {request.path if request else 'unknown'} | "
                f"Detail: {exc}"
            )

        # Normalise the error detail
        detail = response.data
        if isinstance(detail, dict) and 'detail' in detail:
            message = str(detail['detail'])
            extra = None
        elif isinstance(detail, dict):
            message = 'Validation error. Please check the fields below.'
            extra = detail
        elif isinstance(detail, list):
            message = detail[0] if detail else 'An error occurred.'
            extra = None
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
