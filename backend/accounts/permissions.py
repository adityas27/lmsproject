from rest_framework.permissions import BasePermission

class IsAdminOrSemiAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_superuser or request.user.is_semi_admin
        )