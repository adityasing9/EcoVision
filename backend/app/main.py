"""
EcoVision FastAPI Application Entrypoint.
AI-Powered Bird Biodiversity & Environmental Monitoring Platform.
"""

from contextlib import asynccontextmanager
import logging
import sys
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.ml.classifier import classifier_service
from app.api.endpoints.health import router as health_router
from app.api.endpoints.auth import router as auth_router
from app.api.endpoints.predict import router as predict_router
from app.api.endpoints.species import router as species_router
from app.api.endpoints.observations import router as observations_router
from app.api.endpoints.dashboard import router as dashboard_router
from app.api.endpoints.map import router as map_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("ecovision")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager to initialize the ML classifier once on startup."""
    logger.info("Initializing EcoVision platform...")
    logger.info(f"Loading deep-learning model: {settings.MODEL_ARCHITECTURE}")
    try:
        classifier_service.load_model()
    except Exception as e:
        logger.error(f"Failed to initialize ML model during startup: {e}", exc_info=True)
    yield
    logger.info("EcoVision shutdown complete.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler to prevent leaking stack traces
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred. Please try again later.",
            "path": request.url.path,
        },
    )


# Root route
@app.get("/", tags=["System"])
def root():
    return {
        "name": settings.PROJECT_NAME,
        "tagline": "See. Identify. Understand Biodiversity.",
        "version": settings.VERSION,
        "docs": "/docs",
        "status": "operational",
    }


# Include Routers under /api
api_prefix = settings.API_V1_STR
app.include_router(health_router, prefix=api_prefix)
app.include_router(auth_router, prefix=api_prefix)
app.include_router(predict_router, prefix=api_prefix)
app.include_router(species_router, prefix=api_prefix)
app.include_router(observations_router, prefix=api_prefix)
app.include_router(dashboard_router, prefix=api_prefix)
app.include_router(map_router, prefix=api_prefix)
