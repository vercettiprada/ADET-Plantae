# ─── Plantae API — Dockerfile ─────────────────────────────────────────────────
# Checklist #12: Containerization / Deployment Discussion
# Module 4: Secure by design — non-root user, minimal image, no secrets baked in
#
# Build:  docker build -t plantae-api .
# Run:    docker run -p 8000:8000 --env-file .env plantae-api
# ──────────────────────────────────────────────────────────────────────────────

# Stage 1: Base — use slim Python image to reduce attack surface
FROM python:3.12-slim AS base

# Security: non-root user (Principle of Least Privilege — Module 4 §4.4)
RUN groupadd --gid 1001 plantae && \
    useradd --uid 1001 --gid plantae --no-create-home --shell /bin/false plantae

# Set working directory
WORKDIR /app

# Install system dependencies (only what's needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: Dependencies — install Python packages
COPY requirements.txt .

# Install argon2 (for Argon2PasswordHasher — Module 4 §4.3)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    argon2-cffi \
    bcrypt \
    -r requirements.txt

# Stage 3: Application
COPY . .

# Security: ensure no .env is baked into image — use runtime env injection
# Secrets must be passed via --env-file or Docker secrets at runtime

# Create logs directory and set ownership
RUN mkdir -p logs && chown -R plantae:plantae /app

# Switch to non-root user
USER plantae

# Expose only the application port
EXPOSE 8000

# Health check — verifies API is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/')" || exit 1

# Run with Daphne (ASGI server — supports WebSocket + HTTP)
# Module 5: Daphne is required for Django Channels / WebSocket support
CMD ["python", "-m", "daphne", "-b", "0.0.0.0", "-p", "8000", "plantae_api.asgi:application"]
