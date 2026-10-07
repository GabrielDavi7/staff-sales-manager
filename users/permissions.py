from rest_framework.permissions import BasePermission
from .tenant import tenant_allowed

class IsTenantUser(BasePermission):
    def has_permission(self, request, view):
        return tenant_allowed(request.user)

class IsAdmin(IsTenantUser):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.cargo == 'ADMIN'

class IsSupervisorOrAdmin(IsTenantUser):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.cargo in ('SUPERVISOR', 'ADMIN')

class IsVendedor(IsTenantUser):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.cargo == 'VENDEDOR'

class IsDispositivo(IsTenantUser):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.cargo == 'DISPOSITIVO'
