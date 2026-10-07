from unfold.sites import UnfoldAdminSite


class MaintenanceAdminSite(UnfoldAdminSite):
    """Temporary maintenance entry, never available to customer identities."""
    def has_permission(self, request):
        user = request.user
        return user.is_active and user.is_staff and user.is_superuser and not user.cliente_id
