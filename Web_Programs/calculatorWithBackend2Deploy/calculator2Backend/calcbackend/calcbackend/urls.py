# calcbackend/urls.py  ← EDIT the existing file

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('calculator.urls')),   # ← add this line
]
