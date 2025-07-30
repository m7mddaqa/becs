from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DonationViewSet,DistributeBloodView

router = DefaultRouter()
router.register(r'donations', DonationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('distribute/', DistributeBloodView.as_view(), name='distribute-blood'),

]
