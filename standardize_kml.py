#!/usr/bin/env python3
"""
İzmir Kapalı Alan KML Dosyası Standardizasyon Scripti
Bu script KML dosyasındaki poligonları standardize eder:
- Gereksiz açıklamaları kaldırır
- Sadece koordinat verilerini korur  
- Tüm poligonları aynı formata getirir
"""

import xml.etree.ElementTree as ET
import re
from pathlib import Path

def clean_kml_file(input_file, output_file):
    """KML dosyasını temizler ve standardize eder"""
    
    # KML namespace
    ns = {'kml': 'http://www.opengis.net/kml/2.2'}
    
    # XML dosyasını parse et
    tree = ET.parse(input_file)
    root = tree.getroot()
    
    # Yeni KML oluştur
    new_kml = ET.Element('kml', xmlns="http://www.opengis.net/kml/2.2")
    new_document = ET.SubElement(new_kml, 'Document')
    new_document.set('id', 'kapali_su_havzalari')
    
    # Document başlığı
    name_elem = ET.SubElement(new_document, 'name')
    name_elem.text = 'İzmir Kapalı Su Havzaları'
    
    # Folder oluştur
    folder = ET.SubElement(new_document, 'Folder')
    folder_name = ET.SubElement(folder, 'name')
    folder_name.text = 'Kapalı Su Havzaları'
    
    polygon_count = 0
    
    # Tüm Placemark'ları bul
    for placemark in root.findall('.//Placemark', ns):
        # Polygon koordinatlarını bul
        polygon = placemark.find('.//Polygon', ns)
        if polygon is not None:
            # Yeni standardize placemark oluştur
            new_placemark = ET.SubElement(folder, 'Placemark')
            
            # Basit name ekle
            placemark_name = ET.SubElement(new_placemark, 'name')
            placemark_name.text = f'Kapalı Su Havzası {polygon_count + 1}'
            
            # Polygon'u direkt kopyala
            new_placemark.append(polygon)
            
            polygon_count += 1
            print(f"Polygon {polygon_count} eklendi")
    
    # Yeni XML dosyasını kaydet
    tree = ET.ElementTree(new_kml)
    ET.indent(tree, space="  ", level=0)
    tree.write(output_file, encoding='utf-8', xml_declaration=True)
    
    print(f"\n✅ Standardizasyon tamamlandı!")
    print(f"📊 Toplam {polygon_count} polygon işlendi")
    print(f"📁 Yeni dosya: {output_file}")
    
    return polygon_count

def extract_coordinates_only(input_file, output_file):
    """Sadece koordinatları içeren minimal KML oluştur"""
    
    ns = {'kml': 'http://www.opengis.net/kml/2.2'}
    tree = ET.parse(input_file)
    root = tree.getroot()
    
    # Minimal KML yapısı
    new_kml = ET.Element('kml', xmlns="http://www.opengis.net/kml/2.2")
    new_document = ET.SubElement(new_kml, 'Document')
    
    polygon_count = 0
    
    # Sadece koordinatları çıkar
    for placemark in root.findall('.//Placemark', ns):
        coordinates = placemark.find('.//coordinates', ns)
        if coordinates is not None and coordinates.text:
            # Yeni minimal placemark
            new_placemark = ET.SubElement(new_document, 'Placemark')
            
            # Polygon yapısı
            polygon = ET.SubElement(new_placemark, 'Polygon')
            outer_boundary = ET.SubElement(polygon, 'outerBoundaryIs')
            linear_ring = ET.SubElement(outer_boundary, 'LinearRing')
            new_coordinates = ET.SubElement(linear_ring, 'coordinates')
            new_coordinates.text = coordinates.text.strip()
            
            polygon_count += 1
    
    # Kaydet
    tree = ET.ElementTree(new_kml)
    ET.indent(tree, space="  ", level=0)
    tree.write(output_file, encoding='utf-8', xml_declaration=True)
    
    print(f"🎯 Minimal KML oluşturuldu: {polygon_count} polygon")
    return polygon_count

if __name__ == "__main__":
    input_file = "/home/akn/Genel/web/webimar-react/public/izmir_kapali_alan.kml"
    output_file = "/home/akn/Genel/web/webimar-react/public/izmir_kapali_alan_standardized.kml"
    minimal_file = "/home/akn/Genel/web/webimar-react/public/izmir_kapali_alan_minimal.kml"
    
    print("🔧 İzmir Kapalı Alan KML Standardizasyonu Başlıyor...")
    print(f"📂 Input: {input_file}")
    print(f"📂 Output: {output_file}")
    print(f"📂 Minimal: {minimal_file}")
    print("-" * 60)
    
    # 1. Standardize et
    polygon_count = clean_kml_file(input_file, output_file)
    
    # 2. Minimal versiyon oluştur  
    minimal_count = extract_coordinates_only(input_file, minimal_file)
    
    print("-" * 60)
    print("✅ İşlem tamamlandı!")
    print(f"📊 Standardized: {polygon_count} polygon")
    print(f"📊 Minimal: {minimal_count} polygon")
    print("\n🎯 Test etmek için minimal KML dosyasını kullanın:")
    print(f"   mv {minimal_file} {input_file}")
