from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

def root_api_index(request):
    return JsonResponse({
        "status": "online",
        "service": "CEP Écosystème Numérique Électoral - Django Core API",
        "version": "0.1.0",
        "documentation": {
            "swagger": "/api/docs/",
            "redoc": "/api/redoc/",
            "schema": "/api/schema/"
        },
        "admin": "/admin/"
    })

urlpatterns = [
    path("", root_api_index, name="api-root-index"),
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("api/", include("apps.elections.urls")),
    path("api/", include("apps.candidates.urls")),
    path("api/", include("apps.accounts.urls")),
]
