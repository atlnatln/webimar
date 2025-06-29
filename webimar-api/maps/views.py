from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import json
import logging
from .kml_helper import (
    load_kml_data, check_point_in_polygons,
    get_kml_polygons, get_izmir_kapali_polygons, get_izmir_il_polygons
)

logger = logging.getLogger('maps')

@api_view(['GET'])
def health_check(request):
    """Maps app health check endpoint"""
    return Response({
        'status': 'ok',
        'app': 'maps',
        'message': 'Maps app is running successfully'
    })

@api_view(['POST'])
def check_coordinate(request):
    """
    Verilen koordinatın hangi poligonların içinde olduğunu kontrol eder.
    
    POST parametreleri:
    - lat: Enlem
    - lng: Boylam
    
    Yanıt:
    - inside_polygons: Koordinatın içinde kaldığı büyük ova poligonlarının listesi
    - inside_kapali_alan_polygons: Koordinatın içinde kaldığı kapalı alan poligonlarının listesi
    - in_izmir: Koordinatın İzmir il sınırları içinde olup olmadığı
    """
    try:
        # İstek verilerini al
        lat = float(request.data.get('lat'))
        lng = float(request.data.get('lng'))
        
        logger.info(f"Coordinate check request: lat={lat}, lng={lng}")
    except (ValueError, TypeError) as e:
        return Response({
            'error': f'Geçersiz koordinat değerleri: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # KML dosyalarını yükle (eğer henüz yüklenmemişse)
        load_kml_data()
        
        # Polygon verilerini thread-safe şekilde al
        polygons, polygon_names = get_kml_polygons()
        izmir_kapali_polygons, izmir_kapali_names = get_izmir_kapali_polygons()
        izmir_il_polygons, izmir_il_names = get_izmir_il_polygons()
        
        # Koordinatı her üç KML için kontrol et
        inside_polygons = check_point_in_polygons(lat, lng, polygons, polygon_names)
        inside_kapali_alan_polygons = check_point_in_polygons(lat, lng, izmir_kapali_polygons, izmir_kapali_names)
        inside_izmir_polygons = check_point_in_polygons(lat, lng, izmir_il_polygons, izmir_il_names)
        
        # İzmir il sınırları içinde olup olmadığını belirle
        in_izmir = len(inside_izmir_polygons) > 0
        
        # YAS Kapalı Alan içinde mi kontrol et
        in_yas_kapali_alan = len(inside_kapali_alan_polygons) > 0
        
        result = {
            'inside_polygons': inside_polygons,
            'inside_kapali_alan_polygons': inside_kapali_alan_polygons,
            'in_izmir': in_izmir,
            'in_yas_kapali_alan': in_yas_kapali_alan, 
            'izmir_polygons': inside_izmir_polygons,
            'lat': lat, 
            'lng': lng,
            'total_ova_polygons': len(polygons),
            'total_kapali_alan_polygons': len(izmir_kapali_polygons),
            'total_izmir_polygons': len(izmir_il_polygons)
        }
        
        logger.info(f"Coordinate check result: {result}")
        return Response(result)
        
    except Exception as e:
        logger.error(f"Coordinate check error: {str(e)}")
        return Response({
            'error': f'Koordinat kontrol sırasında hata oluştu: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
