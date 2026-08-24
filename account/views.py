# from rest_framework import generics, status
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny
# from rest_framework.authtoken.models import Token
# from .serializers import RegisterSerializer, LoginSerializer

# class RegisterView(generics.CreateAPIView):
#     serializer_class = RegisterSerializer
#     permission_classes = [AllowAny]

# class LoginView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         serializer = LoginSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         user = serializer.validated_data['user']

#         token, created = Token.objects.get_or_create(user=user)

#         return Response({
#             'token': token.key,
#             'email': user.email,
#             'username': user.username,
#         }, status=status.HTTP_200_OK)




from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import RegisterSerializer, LoginSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        return Response({
            'email': user.email,
            'username': user.username,
        }, status=status.HTTP_200_OK)