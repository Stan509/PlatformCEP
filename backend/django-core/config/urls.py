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

from rest_framework.routers import DefaultRouter
from apps.api_views import (
    ElectionViewSet, ElectorViewSet, CandidateViewSet, PartyViewSet,
    MandateViewSet, PollingStationViewSet, DeviceViewSet,
    AssignmentTransferView, RecordParticipationView, SubmitBallotView,
    CommandCenterView, AuditLogView
)

router = DefaultRouter()
router.register(r"elections", ElectionViewSet, basename="election")
router.register(r"electors", ElectorViewSet, basename="elector")
router.register(r"candidates", CandidateViewSet, basename="candidate")
router.register(r"parties", PartyViewSet, basename="party")
router.register(r"mandates", MandateViewSet, basename="mandate")
router.register(r"stations", PollingStationViewSet, basename="station")
router.register(r"devices", DeviceViewSet, basename="device")

urlpatterns = [
    path("", root_api_index, name="api-root-index"),
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("api/admin/me", root_api_index),
    path("api/actions/transfer", AssignmentTransferView.as_view(), name="action-transfer"),
    path("api/actions/participation", RecordParticipationView.as_view(), name="action-participation"),
    path("api/actions/submit-ballot", SubmitBallotView.as_view(), name="action-submit-ballot"),
    path("api/command-center", CommandCenterView.as_view(), name="command-center"),
    path("api/audit", AuditLogView.as_view(), name="audit-log"),
    path("api/", include(router.urls)),
    path("api/", include("apps.accounts.urls")),
]

