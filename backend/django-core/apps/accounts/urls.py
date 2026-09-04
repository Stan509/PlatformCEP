"""Routes — authentification (JWT + MFA) et profil."""
from django.urls import path

from .views import LoginView, MFAVerifyView, ProfileView

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/mfa/", MFAVerifyView.as_view(), name="auth-mfa"),
    path("auth/me/", ProfileView.as_view(), name="auth-me"),
]
