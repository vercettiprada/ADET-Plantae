from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_GET


@require_GET
def home_view(request):
    return HttpResponse(
        """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8" />
            <title>Plantae API</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.5; }
                .card { max-width: 720px; padding: 24px; border: 1px solid #d7e3d4; border-radius: 12px; background: #f8fff7; }
                h1 { margin-top: 0; color: #1e4d2b; }
                code { background: #eef6ec; padding: 2px 6px; border-radius: 4px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Plantae API is running</h1>
                <p>This Django REST API is available locally and ready for testing.</p>
                <p><code>/api/</code> <code>/api/v1/plants/</code> <code>/api/token/</code> <code>/swagger/</code></p>
            </div>
        </body>
        </html>
        """
    )


def api_server_error_view(request):
    return JsonResponse(
        {
            "error": {
                "code": 500,
                "status": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected server error occurred.",
                "details": None,
            }
        },
        status=500,
    )


def api_not_found_view(request, exception):
    if request.path.startswith("/api/"):
        return JsonResponse(
            {
                "error": {
                    "code": 404,
                    "status": "NOT_FOUND",
                    "message": "The requested API endpoint was not found.",
                    "details": None,
                }
            },
            status=404,
        )
    return JsonResponse(
        {
            "error": {
                "code": 404,
                "status": "NOT_FOUND",
                "message": "Page not found.",
                "details": None,
            }
        },
        status=404,
    )
