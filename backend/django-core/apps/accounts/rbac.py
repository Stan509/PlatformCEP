"""DRF Permission Guard & ABAC Scope Enforcement.

Enforces server-side granular permissions (`resource.action`) and territorial/electoral scopes.
Never relies on role string shortcuts alone.
"""
from typing import Any
from rest_framework.permissions import BasePermission
from rest_framework.request import Request


class HasGranularPermissionAndScope(BasePermission):
    """DRF Permission Class checking required permission code and resource scope."""

    required_permission: str | None = None

    def __init__(self, required_permission: str | None = None) -> None:
        if required_permission:
            self.required_permission = required_permission
        super().__init__()

    def has_permission(self, request: Request, view: Any) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False

        # Get permission required on view
        required_perm = getattr(view, "required_permission", self.required_permission)
        if not required_perm:
            return True

        return request.user.has_perm_code(required_perm)

    def has_object_permission(self, request: Request, view: Any, obj: Any) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False

        # Check required permission
        required_perm = getattr(view, "required_permission", self.required_permission)
        if required_perm and not request.user.has_perm_code(required_perm):
            return False

        # Build scope target from object attributes
        target_scope = {}
        if hasattr(obj, "department") and getattr(obj, "department"):
            target_scope["department"] = getattr(obj, "department")
        elif hasattr(obj, "territorial_node") and getattr(obj, "territorial_node"):
            node = getattr(obj, "territorial_node")
            target_scope["department"] = getattr(node, "code", None)

        if hasattr(obj, "commune") and getattr(obj, "commune"):
            target_scope["commune"] = getattr(obj, "commune")

        if hasattr(obj, "election") and getattr(obj, "election"):
            election = getattr(obj, "election")
            target_scope["election"] = str(getattr(election, "id", election))

        if hasattr(obj, "party") and getattr(obj, "party"):
            party = getattr(obj, "party")
            target_scope["party"] = str(getattr(party, "id", party))

        return request.user.has_scope_target(target_scope)


def make_permission_class(perm_code: str):
    """Factory creating a dynamic DRF Permission class for a specific permission code."""
    class DynamicPermission(HasGranularPermissionAndScope):
        required_permission = perm_code
    return DynamicPermission
