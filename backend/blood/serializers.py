
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile, Donation, Distribution


class CurrentUserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'role', 'unique_id']

class UserRegistrationSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES)
    password = serializers.CharField(write_only=True)
    unique_id = serializers.CharField(max_length=32)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'role', 'unique_id')

    def validate_unique_id(self, value):
        if UserProfile.objects.filter(unique_id=value).exists():
            raise serializers.ValidationError("A user with this ID already exists.")
        return value

    def create(self, validated_data):
        role = validated_data.pop('role')
        password = validated_data.pop('password')
        unique_id = validated_data.pop('unique_id')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        UserProfile.objects.create(user=user, role=role, unique_id=unique_id)
        return user

class PublicRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    unique_id = serializers.CharField(max_length=32)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'unique_id')

    def validate_unique_id(self, value):
        if UserProfile.objects.filter(unique_id=value).exists():
            raise serializers.ValidationError("A user with this ID already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        unique_id = validated_data.pop('unique_id')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        UserProfile.objects.create(user=user, role='staff', unique_id=unique_id)
        return user

class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = '__all__'

class DonationDeidentifiedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = ['blood_type', 'donation_date']

class DistributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Distribution
        fields = '__all__'