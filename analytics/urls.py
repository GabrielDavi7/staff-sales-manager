from django.urls import path

from management import views
from .views import MeuDesempenhoView, LojaDesempenhoView, VisaoGeralView
from . import views
# Por enquanto deixamos vazio ou com uma rota de teste

urlpatterns = [
    path('meu-desempenho/', MeuDesempenhoView.as_view(), name='meu-desempenho'),
    path('loja/', LojaDesempenhoView.as_view(), name='loja-desempenho'),
    path('geral/', VisaoGeralView.as_view(), name='visao-geral'),
    path('exportar-<str:formato>/', views.ExportarDadosView.as_view(), name='exportar-dados'),
    # path('funcionarios/', views.listar_funcionarios, name='listar_funcionarios'),
]