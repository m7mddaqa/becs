from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Donation, Distribution
from .serializers import DonationSerializer, DistributionSerializer


class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer

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
        serializer = DistributionSerializer(dist)

        return Response(
            {"message": f"✅ נופקו {quantity} מנות מסוג {blood_type}", "distribution": serializer.data},
            status=status.HTTP_201_CREATED
        )