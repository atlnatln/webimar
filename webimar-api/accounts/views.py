from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.password_validation import validate_password
from django.conf import settings

@api_view(['GET'])
def health_check(request):
    """Accounts app health check endpoint"""
    return Response({
        'status': 'ok',
        'app': 'accounts',
        'message': 'Accounts app is running successfully'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response({
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    if not old_password or not new_password:
        return Response({'detail': 'Mevcut ve yeni şifre gereklidir.'}, status=status.HTTP_400_BAD_REQUEST)
    if not user.check_password(old_password):
        return Response({'detail': 'Mevcut şifre yanlış.'}, status=status.HTTP_400_BAD_REQUEST)
    # Şifre validasyonunu devre dışı bırak
    # try:
    #     validate_password(new_password, user)
    # except Exception as e:
    #     return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new_password)
    user.save()
    return Response({'detail': 'Şifre başarıyla değiştirildi.'}, status=status.HTTP_200_OK)
