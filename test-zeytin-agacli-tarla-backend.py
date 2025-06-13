#!/usr/bin/env python3
"""
Zeytin ağaçlı + tarla Backend API Test
Tests the new land type functionality for olive tree + field
"""

import requests
import json

# Test data
test_cases = [
    {
        "name": "Başarılı Senaryo - Normal yoğunluk",
        "data": {
            "alan_m2": 25000,
            "arazi_vasfi": "Zeytin ağaçlı + tarla",
            "tarla_alani": 25000,
            "zeytin_alani": 150  # 6 ağaç/dekar (< 10 ✅)
        },
        "expected": "ONAYLANIR"
    },
    {
        "name": "Başarılı Senaryo - Sınır değer",
        "data": {
            "alan_m2": 20000,
            "arazi_vasfi": "Zeytin ağaçlı + tarla",
            "tarla_alani": 20000,
            "zeytin_alani": 199  # 9.95 ağaç/dekar (< 10 ✅)
        },
        "expected": "ONAYLANIR"
    },
    {
        "name": "Başarısız Senaryo - Yüksek ağaç yoğunluğu",
        "data": {
            "alan_m2": 20000,
            "arazi_vasfi": "Zeytin ağaçlı + tarla",
            "tarla_alani": 20000,
            "zeytin_alani": 250  # 12.5 ağaç/dekar (>= 10 ❌)
        },
        "expected": "REDDEDİLİR"
    },
    {
        "name": "Başarısız Senaryo - Yetersiz tarla alanı",
        "data": {
            "alan_m2": 15000,
            "arazi_vasfi": "Zeytin ağaçlı + tarla",
            "tarla_alani": 15000,
            "zeytin_alani": 90  # 6 ağaç/dekar (< 10 ama alan yetersiz)
        },
        "expected": "REDDEDİLİR"
    }
]

def test_zeytin_agacli_tarla():
    """Test zeytin ağaçlı + tarla API endpoint"""
    url = "http://127.0.0.1:8000/api/calculations/bag-evi/"
    
    print("🫒 Zeytin ağaçlı + tarla Backend API Test")
    print("=" * 50)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}: {test_case['name']}")
        print("-" * 40)
        
        data = test_case['data']
        expected = test_case['expected']
        
        # Calculate density for info
        tarla_dekar = data['tarla_alani'] / 1000
        density = data['zeytin_alani'] / tarla_dekar
        
        print(f"📊 Test Verileri:")
        print(f"   - Tarla alanı: {data['tarla_alani']:,} m² ({tarla_dekar:.1f} dekar)")
        print(f"   - Zeytin ağacı: {data['zeytin_alani']} adet")
        print(f"   - Yoğunluk: {density:.2f} ağaç/dekar")
        print(f"   - Beklenen: {expected}")
        
        try:
            response = requests.post(url, json=data, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                
                print(f"✅ API Response: {response.status_code}")
                print(f"📋 Success: {result.get('success', False)}")
                
                # Check response structure
                if 'data' in result:
                    data_response = result['data']
                    print(f"🏗️ İzin Durumu: {data_response.get('izin_durumu', 'N/A')}")
                    
                    if 'ana_mesaj' in data_response:
                        print(f"📝 Ana Mesaj: {data_response['ana_mesaj']}")
                    
                    # Check if result matches expected
                    izin_durumu = data_response.get('izin_durumu', '')
                    actual_result = "ONAYLANIR" if izin_durumu == 'izin_verilebilir' else "REDDEDİLİR"
                    
                    if actual_result == expected:
                        print(f"🎯 Test BAŞARILI: Beklenen sonuç alındı ({actual_result})")
                    else:
                        print(f"❌ Test BAŞARISIZ: Beklenen {expected}, Alınan {actual_result}")
                        
                else:
                    print("❌ Response'da 'data' anahtarı bulunamadı")
                    print(f"📋 Full Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
                    
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"📋 Response: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Request Error: {e}")
        except json.JSONDecodeError as e:
            print(f"❌ JSON Decode Error: {e}")
        except Exception as e:
            print(f"❌ Unexpected Error: {e}")

def verify_business_logic():
    """Verify the business logic implementation"""
    print("\n🧮 Business Logic Verification")
    print("=" * 30)
    
    print("📋 Zeytin ağaçlı + tarla Kriterleri:")
    print("   1. Tarla alanı ≥ 20,000 m²")
    print("   2. Zeytin ağacı yoğunluğu < 10 ağaç/dekar")
    print("   3. Sadece tarla alanı hesaplanır (zeytin alanı ayrı hesaplanmaz)")
    print("   4. Harita/manuel kontrol gerektirmez")
    
    print("\n🔢 Yoğunluk Hesaplama Formülü:")
    print("   Yoğunluk = Zeytin ağacı sayısı ÷ (Tarla alanı ÷ 1000)")
    print("   Örnek: 150 ağaç ÷ (25000 m² ÷ 1000) = 150 ÷ 25 = 6 ağaç/dekar")

if __name__ == "__main__":
    verify_business_logic()
    test_zeytin_agacli_tarla()
