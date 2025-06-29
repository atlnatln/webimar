from lxml import etree
from shapely.geometry import Point, Polygon
import os

def parse_kml_file(kml_path):
    """KML dosyasını okur ve içindeki poligonları çıkarır"""
    try:
        # KML dosyasını oku
        with open(kml_path, 'rb') as f:
            kml_str = f.read()
            
        # XML'i ayrıştır
        root = etree.fromstring(kml_str)
        
        # KML namespace'leri
        namespaces = {
            'kml': 'http://www.opengis.net/kml/2.2',
        }
        
        # Poligonları bul
        polygons = []
        polygon_names = []
        
        # Placemark elemanlarını bul (poligonlar genellikle burada bulunur)
        placemarks = root.xpath('//kml:Placemark', namespaces=namespaces)
        
        for placemark in placemarks:
            # Poligon adını al
            name_elem = placemark.find('.//kml:name', namespaces=namespaces)
            name = name_elem.text if name_elem is not None else "İsimsiz Poligon"
            
            # Poligon koordinatlarını al
            coordinates_elem = placemark.xpath('.//kml:coordinates', namespaces=namespaces)
            
            if coordinates_elem:
                for coord_elem in coordinates_elem:
                    # Koordinat string'ini işle
                    coords_str = coord_elem.text.strip() if coord_elem.text else ""
                    
                    # Eğer koordinat string'i boşsa, bir sonraki elemana geç
                    if not coords_str:
                        continue
                    
                    # Koordinatları ayır ve düzenle
                    coords_list = []
                    for coord in coords_str.split():
                        if coord.strip():
                            parts = coord.split(',')
                            # KML formatında: longitude,latitude,altitude (opsiyonel)
                            if len(parts) >= 2:
                                lon, lat = float(parts[0]), float(parts[1])
                                coords_list.append((lon, lat))
                    
                    # Shapely Polygon nesnesi oluştur
                    if len(coords_list) >= 3:  # En az 3 nokta gerekli
                        poly = Polygon(coords_list)
                        polygons.append(poly)
                        polygon_names.append(name)
        
        return polygons, polygon_names
    
    except Exception as e:
        print(f"KML dosyası okunurken hata oluştu: {e}")
        # Hata durumunda boş liste dön
        return [], []

def check_point_in_polygons(lat, lon, polygons, polygon_names):
    """
    Verilen koordinatın (lat, lon) poligonların içinde kalıp kalmadığını kontrol eder
    """
    point = Point(lon, lat)  # Shapely Point nesnesi oluştur (dikkat: longitude önce)
    
    results = []
    
    for i, poly in enumerate(polygons):
        if poly.contains(point):
            results.append(polygon_names[i])
    
    return results