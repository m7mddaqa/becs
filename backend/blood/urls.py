from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DonationViewSet, DistributeBloodView, ExportAuditTrailPDF,ExportAuditTrailXMLView

router = DefaultRouter()
router.register(r'donations', DonationViewSet, basename='donation')

urlpatterns = [
    path('', include(router.urls)),
    path('distribute/', DistributeBloodView.as_view(), name='distribute-blood'),
    path('export/audit-trail/', ExportAuditTrailPDF.as_view(), name='export-audit-trail'),
    path('export/audit-trail/xml/', ExportAuditTrailXMLView.as_view(), name='export-audit-trail-xml'),

]
