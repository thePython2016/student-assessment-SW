from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .permissions import IsAdminRole, IsStudentRole
from .serializers import LoginSerializer, RegisterSerializer


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh["role"] = user.role  # role also available inside the JWT payload
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


def build_auth_response(user):
    tokens = get_tokens_for_user(user)
    return {
        "access": tokens["access"],
        "refresh": tokens["refresh"],
        "email": user.email,
        "username": user.username,
        "phone": user.phone,
        "address": user.address,
        "role": user.role,
    }


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(build_auth_response(user), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        return Response(build_auth_response(user), status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "email": user.email,
            "username": user.username,
            "phone": user.phone,
            "address": user.address,
            "role": user.role,
        })


class AdminOnlyView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        return Response({"message": "Hello admin"})


class StudentOnlyView(APIView):
    permission_classes = [IsAuthenticated, IsStudentRole]

    def get(self, request):
        return Response({"message": "Hello student"})