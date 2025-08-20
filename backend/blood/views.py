from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from xml.etree.ElementTree import Element, tostring
import xml.dom.minidom

from django.utils.timezone import now
from .models import Donation, Distribution, AuditTrail
from .serializers import DonationSerializer, DistributionSerializer


class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer

    def perform_create(self, serializer):
        donation = serializer.save()
        AuditTrail.objects.create(
            user=self.request.user if self.request.user.is_authenticated else None,
            action="Donation added",
            details=f"Donor: {donation.donor_name}, Blood Type: {donation.blood_type}, Date: {donation.donation_date}"
        )


class DistributeBloodView(APIView):
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
