from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, proxy_drive_image

router = DefaultRouter()
router.register(r'products', ProductViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('proxy-image/', proxy_drive_image, name='proxy-drive-image'),
]