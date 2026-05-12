from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RelatorioViewSet, MetricaViewSet

router = DefaultRouter()
router.register(r'atendimentos', RelatorioViewSet, basename='atendimento')
router.register(r'metricas', MetricaViewSet, basename='metrica')

# Por enquanto deixamos vazio ou com uma rota de teste
urlpatterns = [
    path('', include(router.urls)),
    # path('funcionarios/', views.listar_funcionarios, name='listar_funcionarios'),
]