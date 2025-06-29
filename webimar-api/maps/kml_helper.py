"""
KML dosyalarını işlemek için yardımcı fonksiyonlar.
Bu modül, KML dosyalarını okuyup polygon verilerini çıkarır.
"""
import os
from django.conf import settings
import xml.etree.ElementTree as ET
from shapely.geometry import Point, Polygon
import json
import threading
from typing import List, Tuple, Optional

def parse_kml_coordinates(coordinates_text):
    """
    KML koordinat metnini ayrıştırır ve Shapely Polygon formatına dönüştürür.
    """
    coordinates = []
    coord_pairs = coordinates_text.strip().split()
    
    for coord_pair in coord_pairs:
        if coord_pair.strip():
            parts = coord_pair.split(',')
            if len(parts) >= 2:
                try:
                    lon = float(parts[0])
                    lat = float(parts[1])
                    coordinates.append((lon, lat))
                except ValueError:
                    continue
    
    if len(coordinates) >= 3:  # Polygon için minimum 3 nokta gerekli
        return Polygon(coordinates)
    return None

def load_kml_file(file_path):
    """
    Tek bir KML dosyasını yükler ve polygon listesi döndürür.
    """
    polygons = []
    names = []
    
    if not os.path.exists(file_path):
        print(f"KML dosyası bulunamadı: {file_path}")
        return polygons, names
    
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
        
        # KML namespace
        ns = {'kml': 'http://www.opengis.net/kml/2.2'}
        
        # Tüm Placemark'ları bul
        for placemark in root.findall('.//kml:Placemark', ns):
            name_elem = placemark.find('.//kml:name', ns)
            name = name_elem.text if name_elem is not None else "Unnamed"
            
            # Polygon koordinatlarını bul
            coordinates_elem = placemark.find('.//kml:coordinates', ns)
            if coordinates_elem is not None:
                polygon = parse_kml_coordinates(coordinates_elem.text)
                if polygon:
                    polygons.append(polygon)
                    names.append(name)
    
    except ET.ParseError as e:
        print(f"KML dosyası ayrıştırma hatası {file_path}: {e}")
    except Exception as e:
        print(f"KML dosyası yükleme hatası {file_path}: {e}")
    
    print(f"Yüklenen dosya: {file_path}, Polygon sayısı: {len(polygons)}")
    return polygons, names

class KMLDataManager:
    """
    KML verilerini yönetmek için thread-safe singleton sınıfı.
    Global değişken sorunlarını çözer ve thread güvenliği sağlar.
    """
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self.polygons = []
            self.polygon_names = []
            self.izmir_kapali_polygons = []
            self.izmir_kapali_names = []
            self.izmir_il_polygons = []
            self.izmir_il_names = []
            self._kml_loaded = False
            self._data_lock = threading.RLock()
            self._initialized = True
    
    def get_data(self):
        """Thread-safe veri erişimi"""
        with self._data_lock:
            if not self._kml_loaded:
                self._load_kml_data()
            return {
                'polygons': self.polygons.copy(),
                'polygon_names': self.polygon_names.copy(),
                'izmir_kapali_polygons': self.izmir_kapali_polygons.copy(),
                'izmir_kapali_names': self.izmir_kapali_names.copy(),
                'izmir_il_polygons': self.izmir_il_polygons.copy(),
                'izmir_il_names': self.izmir_il_names.copy()
            }
    
    def _load_kml_data(self):
        """
        Tüm KML dosyalarını yükler ve instance değişkenlerine atar.
        Bu metod thread-safe'dir.
        """
        if self._kml_loaded:
            return
            
        # KML dosyalarının yolları (static dosyalar olarak)
        base_path = os.path.join(settings.BASE_DIR, 'static', 'kml')
        
        # Dosya yolları
        kml_files = {
            'buyuk_ovalar': os.path.join(base_path, 'Büyük Ovalar İzmir.kml'),
            'izmir_kapali': os.path.join(base_path, 'izmir_kapali_alan.kml'),
            'izmir_sinir': os.path.join(base_path, 'izmir.kml')
        }
        
        # Static klasörü yoksa oluştur
        os.makedirs(base_path, exist_ok=True)
        
        # Her dosyayı yükle
        if os.path.exists(kml_files['buyuk_ovalar']):
            self.polygons, self.polygon_names = load_kml_file(kml_files['buyuk_ovalar'])
        
        if os.path.exists(kml_files['izmir_kapali']):
            self.izmir_kapali_polygons, self.izmir_kapali_names = load_kml_file(kml_files['izmir_kapali'])
        
        if os.path.exists(kml_files['izmir_sinir']):
            self.izmir_il_polygons, self.izmir_il_names = load_kml_file(kml_files['izmir_sinir'])
        
        self._kml_loaded = True
        print(f"KML veriler yüklendi - Büyük Ovalar: {len(self.polygons)}, Kapalı Alanlar: {len(self.izmir_kapali_polygons)}, İzmir Sınırları: {len(self.izmir_il_polygons)}")

# Singleton instance'ı oluştur
_kml_manager = KMLDataManager()


def load_kml_data():
    """
    Geriye uyumluluk için eski API'yi korur.
    KML verilerini yükler.
    """
    _kml_manager.get_data()  # Bu otomatik olarak verileri yükler


def get_kml_polygons():
    """
    Thread-safe şekilde büyük ova polygonlarını döndürür.
    Returns: (polygons, names) tuple
    """
    data = _kml_manager.get_data()
    return data['polygons'], data['polygon_names']


def get_izmir_kapali_polygons():
    """
    Thread-safe şekilde İzmir kapalı alan polygonlarını döndürür.
    Returns: (polygons, names) tuple
    """
    data = _kml_manager.get_data()
    return data['izmir_kapali_polygons'], data['izmir_kapali_names']


def get_izmir_il_polygons():
    """
    Thread-safe şekilde İzmir il sınır polygonlarını döndürür.
    Returns: (polygons, names) tuple
    """
    data = _kml_manager.get_data()
    return data['izmir_il_polygons'], data['izmir_il_names']


def get_all_kml_data():
    """
    Thread-safe şekilde tüm KML verilerini döndürür.
    Returns: dict with all polygon data
    """
    return _kml_manager.get_data()


# Geriye uyumluluk için global değişken benzeri erişim
# Bu fonksiyonlar kullanılmalı, global değişkenler değil
def get_polygons():
    """Büyük ova polygonlarını döndürür"""
    polygons, _ = get_kml_polygons()
    return polygons


def get_polygon_names():
    """Büyük ova polygon isimlerini döndürür"""
    _, names = get_kml_polygons()
    return names


def get_izmir_kapali_polygon_list():
    """İzmir kapalı alan polygonlarını döndürür"""
    polygons, _ = get_izmir_kapali_polygons()
    return polygons


def get_izmir_kapali_names():
    """İzmir kapalı alan polygon isimlerini döndürür"""
    _, names = get_izmir_kapali_polygons()
    return names


def get_izmir_il_polygon_list():
    """İzmir il sınır polygonlarını döndürür"""
    polygons, _ = get_izmir_il_polygons()
    return polygons


def get_izmir_il_names():
    """İzmir il sınır polygon isimlerini döndürür"""
    _, names = get_izmir_il_polygons()
    return names


def check_point_in_polygons(lat, lng, polygons, names):
    """
    Verilen koordinatın hangi polygonların içinde olduğunu kontrol eder.
    """
    point = Point(lng, lat)  # Shapely Point(lon, lat) formatını kullanır
    inside_polygons = []
    
    for i, polygon in enumerate(polygons):
        try:
            if polygon.contains(point):
                name = names[i] if i < len(names) else f"Polygon_{i}"
                inside_polygons.append(name)
        except Exception as e:
            print(f"Polygon kontrol hatası: {e}")
            continue
    
    return inside_polygons
