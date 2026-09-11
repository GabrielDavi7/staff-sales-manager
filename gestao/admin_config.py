from django.contrib.admin.apps import AdminConfig


class MaintenanceAdminConfig(AdminConfig):
    default_site = 'gestao.admin_site.MaintenanceAdminSite'
