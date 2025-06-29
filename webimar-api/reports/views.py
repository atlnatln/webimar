from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def health_check(request):
    """Reports app health check endpoint"""
    return Response({
        'status': 'ok',
        'app': 'reports',
        'message': 'Reports app is running successfully'
    })
