from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """Permite acesso apenas se usuário for ADMIN."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.cargo == 'ADMIN'

class IsAdminCliente(BasePermission):
    """Permite acesso apenas se usuário for ADMIN_CLIENTE."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.cargo == 'ADMIN_CLIENTE'

class IsAdminOrAdminCliente(BasePermission):
    """Permite acesso se usuário for ADMIN ou ADMIN_CLIENTE."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.cargo in ('ADMIN', 'ADMIN_CLIENTE')

class IsSupervisorOrAdmin(BasePermission):
    """Permite acesso se usuário for SUPERVISOR, ADMIN ou ADMIN_CLIENTE."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.cargo in ('SUPERVISOR', 'ADMIN', 'ADMIN_CLIENTE')

class IsVendedor(BasePermission):
    """Permite acesso apenas se usuário for VENDEDOR."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.cargo == 'VENDEDOR'

class IsDispositivo(BasePermission):
    """Permite acesso apenas se usuário for DISPOSITIVO."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.cargo == 'DISPOSITIVO'
