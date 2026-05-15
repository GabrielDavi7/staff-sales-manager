from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet
from .views import LojaViewSet, EquipeViewSet, MetricaViewSet

router = DefaultRouter()
router.register(r'usuarios', UserViewSet, basename='admin-usuarios')
router.register(r'lojas', LojaViewSet, basename='loja')
router.register(r'equipes', EquipeViewSet, basename='equipe')
router.register(r'metricas', MetricaViewSet, basename='metrica')


urlpatterns = [
    path('', include(router.urls)),
]