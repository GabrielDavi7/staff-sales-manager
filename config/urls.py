"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from users.views import UserMeView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/admin/', include('management.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/users/', include('users.urls')),
    path('api/user/me/', UserMeView.as_view(), name='user-me-alias'),
    path('api/core/', include('core.urls')),
    # ... outras URLs
]
