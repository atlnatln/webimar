#!/usr/bin/env python3
"""
İzmir Kapalı Alan KML Dosyası Standardizasyon Scripti v2
Bu script KML dosyasındaki poligonları standardize eder ve MultiGeometry'leri işler.
"""

import xml.etree.ElementTree as ET
import os

def standardize_kml_v2(input_file, output_file):
    """
    KML dosyasını standardize eder - sadece poligon geometrilerini tutar,
    isim ve açıklama bilgilerini kaldırır. MultiGeometry'leri de işler.
    """
    try:
        # KML dosyasını parse et
        tree = ET.parse(input_file)
        root = tree.getroot()
        
        # KML namespace'ini tanımla
        namespace = {'kml': 'http://www.opengis.net/kml/2.2'}
        
        # Yeni KML dokümenti oluştur
        new_root = ET.Element("kml")
        new_root.set("xmlns", "http://www.opengis.net/kml/2.2")
        
        document = ET.SubElement(new_root, "Document")
        folder = ET.SubElement(document, "Folder")
        folder_name = ET.SubElement(folder, "name")
        folder_name.text = "kapali_su_havzasi"
        
        polygon_count = 0
        
        # Tüm Placemark'ları bul (namespace ile)
        placemarks = root.findall(".//kml:Placemark", namespace)
        print(f"Toplam {len(placemarks)} Placemark bulundu.")
        
        for placemark_idx, placemark in enumerate(placemarks):
            print(f"\nPlacemark {placemark_idx + 1} işleniyor...")
            
            # Direkt Polygon'ları bul
            direct_polygons = placemark.findall("kml:Polygon", namespace)
            print(f"  - Direkt polygon sayısı: {len(direct_polygons)}")
            
            # MultiGeometry içindeki Polygon'ları bul
            multigeometries = placemark.findall(".//kml:MultiGeometry", namespace)
            multi_polygons = []
            for multigeom in multigeometries:
                multi_polys = multigeom.findall("kml:Polygon", namespace)
                multi_polygons.extend(multi_polys)
            print(f"  - MultiGeometry içindeki polygon sayısı: {len(multi_polygons)}")
            
            # Tüm polygon'ları birleştir
            all_polygons = direct_polygons + multi_polygons
            print(f"  - Toplam polygon sayısı: {len(all_polygons)}")
            
            for poly_idx, polygon in enumerate(all_polygons):
                # Yeni Placemark oluştur
                new_placemark = ET.SubElement(folder, "Placemark")
                
                # Basit bir isim ekle
                name_elem = ET.SubElement(new_placemark, "name")
                name_elem.text = f"KapaliSuHavzasi_{polygon_count + 1}"
                
                # Polygon geometrisini kopyala (namespace bilgilerini temizleyerek)
                new_polygon = ET.SubElement(new_placemark, "Polygon")
                
                # outerBoundaryIs kopyala
                outer_boundary = polygon.find("kml:outerBoundaryIs", namespace)
                if outer_boundary is not None:
                    new_outer = ET.SubElement(new_polygon, "outerBoundaryIs")
                    linear_ring = outer_boundary.find("kml:LinearRing", namespace)
                    if linear_ring is not None:
                        new_linear_ring = ET.SubElement(new_outer, "LinearRing")
                        coordinates = linear_ring.find("kml:coordinates", namespace)
                        if coordinates is not None:
                            new_coordinates = ET.SubElement(new_linear_ring, "coordinates")
                            new_coordinates.text = coordinates.text
                            print(f"    ✓ Polygon {poly_idx + 1} koordinatları kopyalandı")
                
                # innerBoundaryIs varsa kopyala
                inner_boundaries = polygon.findall("kml:innerBoundaryIs", namespace)
                for inner_boundary in inner_boundaries:
                    new_inner = ET.SubElement(new_polygon, "innerBoundaryIs")
                    linear_ring = inner_boundary.find("kml:LinearRing", namespace)
                    if linear_ring is not None:
                        new_linear_ring = ET.SubElement(new_inner, "LinearRing")
                        coordinates = linear_ring.find("kml:coordinates", namespace)
                        if coordinates is not None:
                            new_coordinates = ET.SubElement(new_linear_ring, "coordinates")
                            new_coordinates.text = coordinates.text
                
                polygon_count += 1
        
        print(f"\n✅ Toplam {polygon_count} polygon bulundu ve standardize edildi.")
        
        if polygon_count == 0:
            print("❌ Hiç polygon bulunamadı! KML yapısını kontrol ediyorum...")
            # Debug için yapıyı yazdır
            print("\nKML yapısı analizi:")
            for elem in root.iter():
                tag = elem.tag.replace('{http://www.opengis.net/kml/2.2}', 'kml:') if '}' in elem.tag else elem.tag
                print(f"  - {tag}")
            return 0
        
        # Yeni KML dosyasını yaz
        new_tree = ET.ElementTree(new_root)
        
        # XML'i güzelce formatla
        ET.indent(new_tree, space="  ", level=0)
        new_tree.write(output_file, encoding='utf-8', xml_declaration=True)
        
        print(f"📁 Standardize edilmiş KML dosyası '{output_file}' olarak kaydedildi.")
        
        return polygon_count
        
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
        import traceback
        traceback.print_exc()
        return 0

if __name__ == "__main__":
    input_file = "/home/akn/Genel/web/webimar-react/public/izmir_kapali_alan.kml"
    output_file = "/home/akn/Genel/web/webimar-react/public/izmir_kapali_alan_standardized.kml"
    
    print("🔧 İzmir Kapalı Alan KML Standardizasyon v2")
    print(f"📂 Input: {input_file}")
    print(f"📂 Output: {output_file}")
    print("-" * 60)
    
    if os.path.exists(input_file):
        count = standardize_kml_v2(input_file, output_file)
        if count > 0:
            print(f"\n🎉 Başarılı! {count} polygon standardize edildi.")
            print("\n🔄 Yeni KML dosyasını kullanmak için:")
            print(f"   mv {output_file} {input_file}")
            print("\n📋 Ardından React uygulamasını test edin.")
        else:
            print("\n❌ Hiç polygon bulunamadı. KML dosyası yapısını kontrol edin.")
    else:
        print(f"❌ Girdi dosyası bulunamadı: {input_file}")
