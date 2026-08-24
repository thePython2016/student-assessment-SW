from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import Profile

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    phone = serializers.CharField(write_only=True, required=True)
    address = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'phone', 'address']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already in use.")
        return value

    def create(self, validated_data):
        phone = validated_data.pop('phone')
        address = validated_data.pop('address')

        username = validated_data['email'].split('@')[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password']
        )

        Profile.objects.create(user=user, phone=phone, address=address)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            user_obj = User.objects.get(email=data['email'])
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")

        user = authenticate(username=user_obj.username, password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        data['user'] = user
        return data