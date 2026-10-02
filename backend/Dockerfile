# Multi-stage production Dockerfile for EcoVision ML Backend
FROM python:3.10-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies with wheel caching
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final Production Runner
FROM python:3.10-slim AS runner

WORKDIR /app

# Install runtime system libraries (libgl, libgomp for image and vision operations)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Copy backend code
COPY . .

# Pre-cache ResNet-50 weights during build to avoid runtime delays on container start
RUN python -c "from torchvision import models; models.resnet50(weights=models.ResNet50_Weights.DEFAULT)"

# Default dynamic port assignment for Render, Railway, Cloud Run, AWS
ENV PORT=8000
EXPOSE 8000

# Production startup using uvicorn
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2 --timeout-keep-alive 65"]
