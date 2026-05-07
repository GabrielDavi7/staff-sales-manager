from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """Permite acesso apenas se usuário for ADMIN."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.cargo == 'ADMIN'

class IsSupervisorOrAdmin(BasePermission):
    """Permite acesso se usuário for SUPERVISOR ou ADMIN."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.cargo in ('SUPERVISOR', 'ADMIN')

class IsVendedor(BasePermission):
    """Permite acesso apenas se usuário for VENDEDOR."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.cargo == 'VENDEDOR'

class IsDispositivo(BasePermission):
    """Permite acesso apenas se usuário for DISPOSITIVO."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.cargo == 'DISPOSITIVO'
