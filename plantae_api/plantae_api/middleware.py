import logging
import time

# ─── Security Headers Middleware (Checklist #16/#17 — Vulnerabilities & Best Practices)
# ─────────────────────────────────────────────────────────────────────────────────────
# This middleware layer addresses the following OWASP API Security Top 10 threats:
#
#   [A2] Broken Authentication   → JWT verification enforced at view level (simplejwt)
#   [A3] Excessive Data Exposure → Cache-Control: no-store prevents response caching
#   [A4] Lack of Rate Limiting   → Handled by DRF throttling (anon: 30/min, user: 120/min)
#   [A6] Mass Assignment         → DRF serializers use explicit field declarations
#   [A7] Security Misconfiguration → Headers: X-Content-Type-Options, Referrer-Policy set here
#   [A8] Injection              → DRF validators + Django ORM (parameterized queries)
#
# Mitigations implemented in this file:
#   - X-Content-Type-Options: nosniff  → prevents MIME-sniffing attacks
#   - Referrer-Policy: same-origin     → limits referrer header leakage
#   - Cache-Control: no-store          → prevents sensitive API responses from being cached
#   - Vary: Authorization, Origin      → ensures proxy caches respect auth/CORS headers

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

        if request.path.startswith("/api/"):
            response["X-Content-Type-Options"] = "nosniff"
            response["Referrer-Policy"] = "same-origin"

            vary_values = [value.strip() for value in response.get("Vary", "").split(",") if value.strip()]
            for header_name in ("Authorization", "Origin"):
                if header_name not in vary_values:
                    vary_values.append(header_name)
            if vary_values:
                response["Vary"] = ", ".join(vary_values)

            if request.path != "/api/v1/plants/summary/":
                response["Cache-Control"] = "no-store, no-cache, must-revalidate, private, max-age=0"
                response["Pragma"] = "no-cache"
                response["Expires"] = "0"

        # Log the outgoing response
        logger.info(f"<< {request.method} {request.path} | Status: {response.status_code} | Duration: {duration_ms}ms")
        
        return response
