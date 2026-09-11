from rest_framework.permissions import BasePermission
from .tenant import tenant_allowed

class IsTenantUser(BasePermission):
    def has_permission(self, request, view):
        return tenant_allowed(request.user)

class IsAdminCliente(IsTenantUser):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.cargo == 'ADMIN_CLIENTE'

# Compatibility imports only: neither class grants global access.
IsAdmin = IsAdminCliente
IsAdminOrAdminCliente = IsAdminCliente

class IsSupervisorOrAdmin(IsTenantUser):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.cargo in ('SUPERVISOR', 'ADMIN_CLIENTE')

class IsVendedor(IsTenantUser):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.cargo == 'VENDEDOR'

class IsDispositivo(IsTenantUser):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.cargo == 'DISPOSITIVO'
