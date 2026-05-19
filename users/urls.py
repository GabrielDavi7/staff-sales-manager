from django.urls import path
from .views import CustomLoginView, UserMeView, VendedorListView, LogoutView

urlpatterns = [
    path('login/', CustomLoginView.as_view(), name='api_login'),
    path('user/me/', UserMeView.as_view(), name='user-me'),
    path('vendedores/', VendedorListView.as_view(), name='vendedor-list'),
    path('logout/', LogoutView.as_view(), name='logout')


]