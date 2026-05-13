# calculator/urls.py  ← CREATE this file inside the calculator/ folder

from django.urls import path
from . import views

urlpatterns = [
    path('calculate/', views.calculate, name='calculate'),
]