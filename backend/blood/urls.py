
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DonationViewSet, DistributeBloodView, ExportAuditTrailPDF, ExportAuditTrailXMLView, UserRegistrationView, PublicRegistrationView, CurrentUserProfileView, ResearchDonationsList

router = DefaultRouter()
router.register(r'donations', DonationViewSet, basename='donation')

from rest_framework.authtoken.views import obtain_auth_token
urlpatterns = [
    path('', include(router.urls)),
    path('distribute/', DistributeBloodView.as_view(), name='distribute-blood'),
    path('export/audit-trail/', ExportAuditTrailPDF.as_view(), name='export-audit-trail'),
    path('export/audit-trail/xml/', ExportAuditTrailXMLView.as_view(), name='export-audit-trail-xml'),
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', obtain_auth_token, name='api-login'),
    path('public-register/', PublicRegistrationView.as_view(), name='public-register'),
    path('me/', CurrentUserProfileView.as_view(), name='me'),
    path('research/donations/', ResearchDonationsList.as_view(), name='research-donations'),
]
