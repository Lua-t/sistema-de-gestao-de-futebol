from django.urls import path

from .views import PerfilView, RecuperacaoSenhaView, RegistroView, ResetSenhaView

urlpatterns = [
    path('register/', RegistroView.as_view(), name='register'),
    path('password/recovery/', RecuperacaoSenhaView.as_view(), name='password_recovery'),
    path('password/reset/', ResetSenhaView.as_view(), name='password_reset'),
    path('perfil/', PerfilView.as_view(),name='perfil'),
]
