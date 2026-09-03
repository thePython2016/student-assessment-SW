from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(['GET'])
def student(request, token):
    try:
        validated_token = AccessToken(token)
        user_email = validated_token['user_id']
        user = User.objects.get(email=user_email)
    except (TokenError, User.DoesNotExist):
        raise NotFound(detail="Invalid or expired token.")

    return Response({
        'email': user.email,
        'phone': user.phone,
        'address': user.address,
    })