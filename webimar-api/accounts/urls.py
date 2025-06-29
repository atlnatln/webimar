from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='accounts_health'),
    path('me/', views.me, name='accounts_me'),
    path('me/change-password/', views.change_password, name='accounts_change_password'),
]