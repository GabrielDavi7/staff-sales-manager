from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RelatorioViewSet, MetricaViewSet, LojaViewSet

router = DefaultRouter()
router.register(r'atendimentos', RelatorioViewSet, basename='atendimento')
router.register(r'metricas', MetricaViewSet, basename='metrica')
router.register(r'lojas', LojaViewSet, basename='loja')

# Por enquanto deixamos vazio ou com uma rota de teste
urlpatterns = [
    path('', include(router.urls)),
    # path('funcionarios/', views.listar_funcionarios, name='listar_funcionarios'),
]