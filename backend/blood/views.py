# Add missing import for APIView
from rest_framework.views import APIView
from .serializers import PublicRegistrationSerializer
# Public registration view (no auth required, role is always 'staff')
from rest_framework.permissions import AllowAny
class PublicRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PublicRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Account created successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from xml.etree.ElementTree import Element, tostring
import xml.dom.minidom

from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserRegistrationSerializer
from .models import UserProfile
from django.contrib.auth.models import User

# Only Admins can create users
class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'userprofile') and request.user.userprofile.role == 'admin'

class UserRegistrationView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User created successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from django.utils.timezone import now
from .models import Donation, Distribution, AuditTrail
from .serializers import DonationSerializer, DistributionSerializer, DonationDeidentifiedSerializer, CurrentUserProfileSerializer
from .permissions import ReadOnlyForResearchers


class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all()
    permission_classes = [ReadOnlyForResearchers]

    def get_serializer_class(self):
        user = self.request.user
        role = getattr(getattr(user, 'userprofile', None), 'role', None)
        if role == 'researcher':
            return DonationDeidentifiedSerializer
        return DonationSerializer

    def perform_create(self, serializer):
        donation = serializer.save()
        AuditTrail.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="Donation added",
            details=f"Donor: {donation.donor_name}, Blood Type: {donation.blood_type}, Date: {donation.donation_date}"
        )


class DistributeBloodView(APIView):
    permission_classes = [ReadOnlyForResearchers]
    def post(self, request):
        blood_type = request.data.get("blood_type")
        quantity = int(request.data.get("quantity", 0))

        available = Donation.objects.filter(blood_type=blood_type)[:quantity]

        if len(available) < quantity:
            return Response(
                {"message": f"❌ אין מספיק מנות מסוג {blood_type}. קיימות: {len(available)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        for donation in available:
            donation.delete()

        dist = Distribution.objects.create(blood_type=blood_type, quantity=quantity)

        AuditTrail.objects.create(
            user=request.user if request.user.is_authenticated else None,
            action="Blood distribution",
            details=f"Distributed {quantity} units of type {blood_type}"
        )

        serializer = DistributionSerializer(dist)

        return Response(
            {"message": f"✅ נופקו {quantity} מנות מסוג {blood_type}", "distribution": serializer.data},
            status=status.HTTP_201_CREATED
        )


class ExportAuditTrailPDF(APIView):
    permission_classes = [IsAdmin]
    def get(self, request):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="audit_trail.pdf"'

        p = canvas.Canvas(response, pagesize=letter)
        width, height = letter

        p.setFont("Helvetica-Bold", 16)
        p.drawString(230, height - 50, "Audit Trail Report")

        p.setFont("Helvetica", 10)
        y = height - 80
        logs = AuditTrail.objects.order_by('-timestamp')

        for log in logs:
            user_display = str(log.user) if log.user else "Admin"
            line = f"[{log.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] - {user_display} - {log.action} - {log.details}"
            p.drawString(40, y, line)
            y -= 15
            if y < 40:
                p.showPage()
                p.setFont("Helvetica", 10)
                y = height - 40

        p.save()
        return response


class ExportAuditTrailXMLView(APIView):
    permission_classes = [IsAdmin]
    def get(self, request):
        logs = AuditTrail.objects.order_by('-timestamp')

        root = Element('AuditTrailReport')
        for log in logs:
            entry = Element('Entry')
            entry.set('id', str(log.id))

            timestamp = Element('timestamp')
            timestamp.text = log.timestamp.isoformat()
            entry.append(timestamp)

            action = Element('action')
            action.text = log.action
            entry.append(action)

            model = Element('model')
            model.text = log.model if hasattr(log, 'model') else "N/A"
            entry.append(model)

            object_id = Element('object_id')
            object_id.text = str(log.object_id) if hasattr(log, 'object_id') else "N/A"
            entry.append(object_id)

            user = Element('user')
            user.text = log.user.username if log.user else "Admin"
            entry.append(user)

            details = Element('details')
            details.text = log.details
            entry.append(details)

            root.append(entry)

        xml_str = xml.dom.minidom.parseString(tostring(root)).toprettyxml(indent="  ")
        return HttpResponse(xml_str, content_type='application/xml')


class CurrentUserProfileView(APIView):
    def get(self, request):
        profile = getattr(request.user, 'userprofile', None)
        if not profile:
            return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        data = CurrentUserProfileSerializer(profile).data
        return Response(data)


class ResearchDonationsList(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        role = getattr(getattr(request.user, 'userprofile', None), 'role', None)
        if role != 'researcher':
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        donations = Donation.objects.all().only('blood_type', 'donation_date')
        data = DonationDeidentifiedSerializer(donations, many=True).data
        return Response(data)
