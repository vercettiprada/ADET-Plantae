# Video Script: Security Concepts in Plantae API
# This script explains key security concepts used in our Django REST API
# Each section includes code snippets from our codebase with explanations

"""
VIDEO SCRIPT OUTLINE:

[Opening Scene - Show Plantae app running]
Narrator: "Welcome to Plantae, a plant identification app. Today we'll explore
the security concepts that protect user data and ensure safe API communication.
Let's dive into the code!"

[Section 1: APIs - Application Programming Interfaces]
"""

# === APIs: The Foundation of Modern Web Apps ===
"""
APIs (Application Programming Interfaces) are the backbone of modern web applications.
They allow different systems to communicate with each other.

In Plantae, our Django REST API serves as the bridge between:
- React web frontend (plantae/)
- React Native mobile app (PlantaeMobile/)
- External plant identification services (PlantNet API)

Key API concepts in our code:
"""

# From plantae_api/plantae_api/settings.py - REST Framework Configuration
REST_FRAMEWORK = {
    # APIs use JSON for data exchange (stateless, lightweight)
    'DEFAULT_RENDERER_CLASSES': ('rest_framework.renderers.JSONRenderer',),
    'DEFAULT_PARSER_CLASSES': ('rest_framework.parsers.JSONParser',),

    # APIs need versioning for backward compatibility
    'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.URLPathVersioning',
    'DEFAULT_VERSION': 'v1',
    'ALLOWED_VERSIONS': ['v1'],

    # APIs implement pagination to handle large datasets efficiently
    'DEFAULT_PAGINATION_CLASS': 'plantae_api.pagination.PlantaePagination',
    'PAGE_SIZE': 10,
}

"""
[Visual: Show API request/response flow]
Narrator: "APIs work by sending requests and receiving responses. Our Plantae API
handles plant data, user authentication, and integrates with external services.
APIs are stateless - each request contains all needed information."

[Section 2: JWT Tokens - JSON Web Tokens]
"""

# === JWT Tokens: Secure User Authentication ===
"""
JWT (JSON Web Tokens) provide secure, stateless authentication.
Instead of storing user sessions on the server, JWTs contain user info in an encrypted token.

How JWT works:
1. User logs in with credentials
2. Server validates and creates a signed token
3. Client sends token with each request
4. Server verifies token without database lookup

Benefits: Scalable, stateless, cross-domain compatible
"""

# From plantae_api/plants/views.py - JWT Token Generation
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_view(request):
    # ... validation code ...

    # JWT Token Creation - This is where the magic happens!
    refresh = RefreshToken.for_user(user)  # Creates refresh token
    return Response({
        "refresh": str(refresh),              # Long-lived token (24 hours)
        "access": str(refresh.access_token),  # Short-lived token (15 minutes)
        "username": user.username,
    })

# From plantae_api/plantae_api/settings.py - JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),  # Short-lived for security
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),     # Longer-lived for convenience
    'ROTATE_REFRESH_TOKENS': True,                   # Security best practice
    'BLACKLIST_AFTER_ROTATION': True,                # Prevents token reuse
    'ALGORITHM': 'HS256',                            # Symmetric encryption (see below)
    'SIGNING_KEY': SECRET_KEY,                       # Secret key for signing
}

"""
[Visual: JWT structure diagram - Header.Payload.Signature]
Narrator: "A JWT has three parts: Header (algorithm), Payload (user data), Signature (verification).
The signature ensures the token hasn't been tampered with."

[Section 3: Symmetric vs Asymmetric Encryption]
"""

# === Symmetric vs Asymmetric Encryption ===
"""
Encryption protects data by making it unreadable without a key.

SYMMETRIC ENCRYPTION:
- Same key for encryption and decryption
- Fast, efficient for large data
- Used in JWT signing (HS256 algorithm)
- Challenge: How to securely share the key?

ASYMMETRIC ENCRYPTION:
- Public key encrypts, private key decrypts
- Slower, used for key exchange and digital signatures
- Used in SSL/TLS certificates
"""

# Symmetric Encryption in JWT (HS256 uses shared secret)
# From settings.py - JWT uses symmetric encryption with shared SECRET_KEY
'SIGNING_KEY': SECRET_KEY,  # Same key used by server to sign and verify tokens

# Asymmetric Encryption in SSL/TLS (Public/Private key pairs)
# Our app would use this for HTTPS connections
# Public key: Encrypts data anyone can send
# Private key: Decrypts data only server can read

"""
[Visual: Key exchange diagram]
Narrator: "Symmetric encryption is like a shared locker key - fast but needs secure sharing.
Asymmetric is like a mailbox - anyone can put mail in (public key), only you can open it (private key)."

[Section 4: SSL/TLS - Secure Socket Layer/Transport Layer Security]
"""

# === SSL/TLS: Encrypting Data in Transit ===
"""
SSL/TLS encrypts data between client and server, preventing eavesdropping.
Without SSL, data travels as plain text - anyone can read it!

How SSL works:
1. Client requests secure connection
2. Server sends SSL certificate (contains public key)
3. Client verifies certificate authenticity
4. Shared symmetric key is established
5. All communication encrypted with symmetric key

In production, our Django app would be served over HTTPS.
"""

# SSL Configuration (would be in production settings)
# SECURE_SSL_REDIRECT = True          # Force HTTPS
# SECURE_HSTS_SECONDS = 31536000      # HTTP Strict Transport Security
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True
# SECURE_HSTS_PRELOAD = True

# Session cookies would be secure
# SESSION_COOKIE_SECURE = True        # Only send over HTTPS
# CSRF_COOKIE_SECURE = True          # CSRF protection over HTTPS

"""
[Visual: HTTP vs HTTPS comparison]
Narrator: "Without SSL, login credentials and plant data travel as plain text.
With SSL, everything is encrypted - essential for user privacy!"

[Section 5: OWASP - Open Web Application Security Project]
"""

# === OWASP: Security Best Practices ===
"""
OWASP provides guidelines for secure web applications.
Our Plantae API implements several OWASP recommendations:

1. Authentication & Session Management (JWT tokens)
2. Access Control (Django permissions)
3. Input Validation & Sanitization
4. Secure Communications (HTTPS in production)
5. Error Handling (Custom error responses)
"""

# OWASP: Input Validation - Prevent SQL injection, XSS
# From plants/views.py - Input validation with serializers
class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()  # Validates email format
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

# OWASP: Secure Error Handling - Don't leak sensitive information
def error_response(message, status_code, details=None):
    # Structured error responses, no stack traces in production
    return Response({
        "error": {
            "code": status_code,
            "status": "ERROR_TYPE",
            "message": message,
            "details": details,  # Sanitized details only
        }
    }, status=status_code)

# OWASP: Access Control - Permissions protect resources
@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([permissions.IsAuthenticated])  # Requires valid JWT
def profile_view(request):
    user = request.user  # Only authenticated users can access

"""
[Visual: OWASP Top 10 vulnerabilities list]
Narrator: "OWASP helps us avoid common security pitfalls like injection attacks,
broken authentication, and sensitive data exposure."

[Section 6: NIST - National Institute of Standards and Technology]
"""

# === NIST: Security Frameworks and Standards ===
"""
NIST provides cybersecurity frameworks and standards.
Our Plantae API follows NIST guidelines for:

1. Access Control (SP 800-53 AC-2) - JWT authentication
2. Identification & Authentication (SP 800-53 IA-2) - User login
3. Audit & Accountability (SP 800-53 AU-2) - Request logging
4. System & Communications Protection (SP 800-53 SC-8) - Encryption
"""

# NIST: Audit & Accountability - Logging security events
# From plantae_api/middleware.py - Request logging middleware
class RequestLoggingMiddleware:
    def __call__(self, request):
        logger.info(f">> {request.method} {request.path}")  # Log all requests

        start_time = time.time()
        response = self.get_response(request)
        duration_ms = int((time.time() - start_time) * 1000)

        logger.info(f"<< {request.method} {request.path} | Status: {response.status_code} | Duration: {duration_ms}ms")
        return response

# NIST: Access Control - Role-based permissions
# From Django REST Framework settings
'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticated',)

# NIST: Identification & Authentication - Strong passwords
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

"""
[Visual: NIST Cybersecurity Framework diagram]
Narrator: "NIST provides a roadmap for implementing comprehensive security controls.
From password policies to encryption standards, NIST guides our security decisions."

[Closing Scene]
"""

"""
CONCLUSION:

Security is not a checkbox - it's an ongoing process. Our Plantae API demonstrates
how modern applications implement multiple layers of security:

- APIs enable secure communication
- JWT provides stateless authentication
- Encryption (symmetric/asymmetric) protects data
- SSL/TLS secures data in transit
- OWASP prevents common vulnerabilities
- NIST provides security frameworks

Together, these concepts create a secure foundation for user trust and data protection.

[End with Plantae app demo and call-to-action]
"""