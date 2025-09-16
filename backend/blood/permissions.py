from rest_framework import permissions


class IsAuthenticated(permissions.IsAuthenticated):
    pass


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and hasattr(user, 'userprofile') and user.userprofile.role == 'admin'
        )


class IsStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and hasattr(user, 'userprofile') and user.userprofile.role == 'staff'
        )


class IsResearcher(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and hasattr(user, 'userprofile') and user.userprofile.role == 'researcher'
        )


class ReadOnlyForResearchers(permissions.BasePermission):
    """Allow researchers read-only access; admins and staff have full access."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # Safe methods are allowed for all authenticated roles
        if request.method in permissions.SAFE_METHODS:
            return True
        # Non-safe methods allowed only for admin/staff
        role = getattr(getattr(request.user, 'userprofile', None), 'role', None)
        return role in {"admin", "staff"}


