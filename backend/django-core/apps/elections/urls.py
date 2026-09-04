"""Routes — élections."""
from rest_framework.routers import DefaultRouter

from .views import ElectionViewSet

router = DefaultRouter()
router.register("elections", ElectionViewSet, basename="election")

urlpatterns = router.urls
