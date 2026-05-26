from django.urls import path
from .views import CustomLoginView, UserMeView, VendedorListView, LogoutView, PasswordResetRequestView, PasswordResetConfirmView

urlpatterns = [
    path('login/', CustomLoginView.as_view(), name='api_login'),
    path('user/me/', UserMeView.as_view(), name='user-me'),
    path('vendedores/', VendedorListView.as_view(), name='vendedor-list'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),


]