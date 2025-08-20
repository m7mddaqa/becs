from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User

class Donation(models.Model):
    BLOOD_TYPES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]

    blood_type = models.CharField(max_length=3, choices=BLOOD_TYPES)
    donor_name = models.CharField(max_length=100)
    donor_id = models.CharField(max_length=20)
    donation_date = models.DateField()

    def __str__(self):
        return f"{self.blood_type} - {self.donor_name}"

class Distribution(models.Model):
    blood_type = models.CharField(max_length=3)
    quantity = models.PositiveIntegerField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity} מנות של {self.blood_type} - {self.date}"
    
    User = get_user_model()

class AuditTrail(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(blank=True)

    def __str__(self):
        return f"{self.timestamp} - {self.user} - {self.action}"