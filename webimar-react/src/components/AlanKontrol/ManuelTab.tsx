import React from 'react';
import { formatArea } from '../../utils/areaCalculation';
import {
  FormSection,
  SectionTitle,
  FormGroup,
  Label,
  Input,
  Select,
  Button,
  AgacListesi,
  AgacItem,
  SonucPanel,
  HighlightBox,
  FlexContainer,
  InfoText
} from './styles';

interface ManuelTabProps {
  // Form state
  dikiliAlan: number;
  tarlaAlani: number;
  zeytinlikAlani: number;
  secilenAgacTuru: string;
  secilenAgacTipi: string;
  agacSayisi: number;
  
  // Arazi bilgileri
  araziVasfi?: string;
  
  // Tree data
  agacVerileri: any[];
  eklenenAgaclar: any[];
  
  // Polygon data
  tarlaPolygon: any;
  dikiliPolygon: any;
  zeytinlikPolygon: any;
  
  // Edit state
  editingIndex: number | null;
  editingAgacSayisi: number;
  
  // Results
  hesaplamaSonucu: any;
  
  // Actions
  updateField: (field: string, value: any) => void;
  agacEkle: () => void;
  agacEdit: (index: number) => void;
  agacEditSave: (index: number) => void;
  agacEditCancel: () => void;
  agacSil: (index: number) => void;
  updateEditCount: (count: number) => void;
  hesaplamaYap: () => void;
  temizleVeriler: () => void;
  devamEt: () => void;
  getMevcutTipler: (agacTuruId: string) => { value: string; label: string; }[];
}

const ManuelTab: React.FC<ManuelTabProps> = ({
  dikiliAlan,
  tarlaAlani,
  zeytinlikAlani,
  secilenAgacTuru,
  secilenAgacTipi,
  agacSayisi,
  araziVasfi,
  agacVerileri,
  eklenenAgaclar,
  tarlaPolygon,
  dikiliPolygon,
  zeytinlikPolygon,
  editingIndex,
  editingAgacSayisi,
  hesaplamaSonucu,
  updateField,
  agacEkle,
  agacEdit,
  agacEditSave,
  agacEditCancel,
  agacSil,
  updateEditCount,
  hesaplamaYap,
  temizleVeriler,
  devamEt,
  getMevcutTipler
}) => {

  return (
    <>
      <FormSection>
        <SectionTitle>📏 Alan Bilgisi</SectionTitle>
        
        {/* Haritadan gelen alan bilgisi uyarısı */}
        {(tarlaPolygon || dikiliPolygon || zeytinlikPolygon) && (
          <HighlightBox $variant="success">
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>
              🗺️ Haritadan Alınan Veriler
            </div>
            {tarlaPolygon && (
              <div>✅ Tarla Alanı: {formatArea(tarlaAlani).m2} m² ({formatArea(tarlaAlani).donum} dönüm)</div>
            )}
            {dikiliPolygon && (
              <div>✅ Dikili Alan: {formatArea(dikiliAlan).m2} m² ({formatArea(dikiliAlan).donum} dönüm)</div>
            )}
            {zeytinlikPolygon && (
              <div>✅ Zeytinlik Alanı: {formatArea(zeytinlikAlani).m2} m² ({formatArea(zeytinlikAlani).donum} dönüm)</div>
            )}
            {(tarlaPolygon || dikiliPolygon || zeytinlikPolygon) && (
              <div style={{ fontWeight: '600', color: '#2563eb' }}>
                📊 Toplam Parsel: {formatArea((dikiliAlan || 0) + (tarlaAlani || 0) + (zeytinlikAlani || 0)).m2} m² ({formatArea((dikiliAlan || 0) + (tarlaAlani || 0) + (zeytinlikAlani || 0)).donum} dönüm)
              </div>
            )}
            <InfoText size="12px">
              Bu değerler harita üzerinden çizilen poligonlardan otomatik hesaplanmıştır.
            </InfoText>
          </HighlightBox>
        )}
        
        <FormGroup>
          <Label htmlFor="dikili-alan-input">Dikili Alan (m²)</Label>
          <Input
            id="dikili-alan-input"
            type="number"
            value={dikiliAlan}
            onChange={(e) => updateField('dikiliAlan', Number(e.target.value))}
            placeholder="Örn: 12000"
            min="1"
          />
        </FormGroup>
        
        {/* Tarla alanı girişini sadece "Dikili vasıflı", "Zeytin ağaçlı + herhangi bir dikili vasıf", "… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf" olmayan arazi tipleri için göster */}
        {araziVasfi !== 'Dikili vasıflı' && 
         araziVasfi !== 'Tarla + Zeytinlik' && 
         araziVasfi !== 'Zeytin ağaçlı + herhangi bir dikili vasıf' && 
         araziVasfi !== '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf' && (
          <FormGroup>
            <Label htmlFor="tarla-alani-input">Tarla Alanı (m²)</Label>
            <Input
              id="tarla-alani-input"
              type="number"
              value={tarlaAlani}
              onChange={(e) => updateField('tarlaAlani', Number(e.target.value))}
              placeholder="Örn: 15000"
              min="1"
            />
            <InfoText>
              Toplam parsel alanı (dikili alan + tarla alanı)
              {dikiliAlan > 0 && tarlaAlani > 0 && (
                <div style={{ color: '#2563eb', marginTop: '2px', fontWeight: '600' }}>
                  📊 Toplam: {(dikiliAlan + tarlaAlani).toLocaleString()} m² ({((dikiliAlan + tarlaAlani) / 1000).toFixed(1)} dönüm)
                </div>
              )}
            </InfoText>
          </FormGroup>
        )}

        {/* "Tarla + Zeytinlik" arazi tipi için özel alan girişleri */}
        {araziVasfi === 'Tarla + Zeytinlik' && (
          <>
            <FormGroup>
              <Label htmlFor="tarla-alani-input">Tarla Alanı (m²)</Label>
              <Input
                id="tarla-alani-input"
                type="number"
                value={tarlaAlani}
                onChange={(e) => updateField('tarlaAlani', Number(e.target.value))}
                placeholder="Örn: 15000"
                min="1"
              />
              <InfoText>
                Tarla kullanımındaki alan büyüklüğü
              </InfoText>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="zeytinlik-alani-input">Zeytinlik Alanı (m²)</Label>
              <Input
                id="zeytinlik-alani-input"
                type="number"
                value={zeytinlikAlani}
                onChange={(e) => updateField('zeytinlikAlani', Number(e.target.value))}
                placeholder="Örn: 6000"
                min="1"
              />
              <InfoText>
                Zeytinlik kullanımındaki alan büyüklüğü
                {tarlaAlani > 0 && zeytinlikAlani > 0 && (
                  <div style={{ color: '#2563eb', marginTop: '2px', fontWeight: '600' }}>
                    📊 Toplam: {(tarlaAlani + zeytinlikAlani).toLocaleString()} m² ({((tarlaAlani + zeytinlikAlani) / 1000).toFixed(1)} dönüm)
                  </div>
                )}
              </InfoText>
            </FormGroup>
          </>
        )}
      </FormSection>

      {/* Ağaç Bilgileri - "Tarla + Zeytinlik" ve "… Adetli Zeytin Ağacı bulunan tarla" için gizli */}
      {araziVasfi !== 'Tarla + Zeytinlik' && araziVasfi !== '… Adetli Zeytin Ağacı bulunan tarla' && (
        <FormSection>
          <SectionTitle>🌱 Ağaç Bilgileri</SectionTitle>
          
          {/* "Zeytin ağaçlı + herhangi bir dikili vasıf" için özel açıklama */}
          {araziVasfi === 'Zeytin ağaçlı + herhangi bir dikili vasıf' && (
            <HighlightBox $variant="info">
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                🫒 Zeytin Ağaçlı + Dikili Vasıf Kontrolü
              </div>
              <InfoText>
                Bu arazi tipinde hem zeytin ağacı hem de diğer dikili ürünler bulunabilir. 
                Arazideki tüm ağaç türlerini ve sayılarını belirtiniz. Sistem fiili dikili durumu bu bilgilerden tespit edecektir.
              </InfoText>
            </HighlightBox>
          )}
          
          {/* "… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf" için özel açıklama */}
          {araziVasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf' && (
            <HighlightBox $variant="info">
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                🫒 Adetli Zeytin Ağacı + Dikili Vasıf Kontrolü
              </div>
              <InfoText>
                Zeytin ağacı bilgileri form üzerinden alınmıştır. Bu alanda zeytin dışında başka dikili vasıf ağaçları da bulunuyorsa 
                (meyve ağaçları, asma vs.) onları da ekleyiniz. Sistem toplam dikili vasıf yoğunluğunu hesaplayacaktır.
              </InfoText>
            </HighlightBox>
          )}
          
          <FormGroup>
            <Label htmlFor="agac-turu-select">Ağaç Türü</Label>
            <Select
              id="agac-turu-select"
              value={secilenAgacTuru}
              onChange={(e) => {
                updateField('secilenAgacTuru', e.target.value);
                updateField('secilenAgacTipi', 'normal');
              }}
            >
              <option value="">Ağaç türü seçin...</option>
              {agacVerileri.map(agac => (
                <option key={agac.sira} value={agac.sira.toString()}>
                  {agac.tur}
                </option>
              ))}
            </Select>
          </FormGroup>

          {secilenAgacTuru && (
            <FormGroup>
              <Label htmlFor="agac-tipi-select">Ağaç Tipi</Label>
              <Select
                id="agac-tipi-select"
                value={secilenAgacTipi}
                onChange={(e) => updateField('secilenAgacTipi', e.target.value as any)}
              >
                {getMevcutTipler(secilenAgacTuru).map(tip => (
                  <option key={tip.value} value={tip.value}>
                    {tip.label}
                  </option>
                ))}
              </Select>
            </FormGroup>
          )}

          <FormGroup>
            <Label htmlFor="agac-sayisi-input">Ağaç Sayısı</Label>
            <Input
              id="agac-sayisi-input"
              type="number"
              value={agacSayisi || ''}
              onChange={(e) => updateField('agacSayisi', Number(e.target.value))}
              placeholder="Ağaç sayısını girin"
              min="1"
            />
          </FormGroup>

          <Button onClick={agacEkle} $variant="success">
            ➕ Ağaç Ekle
          </Button>
        </FormSection>
      )}

      {eklenenAgaclar.length > 0 && araziVasfi !== 'Tarla + Zeytinlik' && (
        <FormSection>
          <SectionTitle>📋 Eklenen Ağaçlar</SectionTitle>
          <AgacListesi>
            {eklenenAgaclar.map((agac, index) => (
              <AgacItem key={index}>
                {editingIndex === index ? (
                  <>
                    <span>
                      <strong>{agac.turAdi}</strong> ({agac.tipi}) - 
                      <input
                        type="number"
                        value={editingAgacSayisi}
                        onChange={(e) => updateEditCount(Number(e.target.value))}
                        min="1"
                        style={{
                          width: '60px',
                          margin: '0 8px',
                          padding: '4px',
                          border: '1px solid #ccc',
                          borderRadius: '4px'
                        }}
                      />
                      adet
                    </span>
                    <FlexContainer $gap="4px">
                      <Button onClick={() => agacEditSave(index)} $variant="success" style={{ fontSize: '12px', padding: '4px 8px' }}>
                        ✓
                      </Button>
                      <Button onClick={agacEditCancel} $variant="secondary" style={{ fontSize: '12px', padding: '4px 8px' }}>
                        ✕
                      </Button>
                    </FlexContainer>
                  </>
                ) : (
                  <>
                    <span>
                      <strong>{agac.turAdi}</strong> ({agac.tipi}) - {agac.sayi} adet
                    </span>
                    <FlexContainer $gap="4px">
                      <Button onClick={() => agacEdit(index)} $variant="primary" style={{ fontSize: '12px', padding: '4px 8px' }}>
                        ✏️
                      </Button>
                      <Button onClick={() => agacSil(index)} $variant="danger" style={{ fontSize: '12px', padding: '4px 8px' }}>
                        🗑️
                      </Button>
                    </FlexContainer>
                  </>
                )}
              </AgacItem>
            ))}
          </AgacListesi>

          <FlexContainer style={{ marginTop: '16px' }}>
            <Button onClick={hesaplamaYap} $variant="primary">
              🧮 Hesapla
            </Button>
            <Button onClick={temizleVeriler} $variant="secondary">
              🗑️ Temizle
            </Button>
          </FlexContainer>
        </FormSection>
      )}

      {hesaplamaSonucu && (
        <SonucPanel $type={hesaplamaSonucu.type}>
          <h4 style={{ margin: '0 0 12px 0' }}>{hesaplamaSonucu.message}</h4>
          
          {/* Yeterlilik durumu gösterimi */}
          {hesaplamaSonucu.yeterlilik && (
            <HighlightBox $variant={hesaplamaSonucu.yeterlilik.yeterli ? 'success' : 'warning'}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                {hesaplamaSonucu.yeterlilik.yeterli ? '✅ Bağ Evi Kontrolü Başarılı' : '❌ Bağ Evi Kontrolü Başarısız'}
              </div>
              
              {/* Kriter durumları */}
              <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Kriter 1:</strong> Dikili alan ≥ 5000 m²: {' '}
                  <span style={{ color: hesaplamaSonucu.yeterlilik.kriter1 ? '#155724' : '#721c24' }}>
                    {hesaplamaSonucu.yeterlilik.kriter1 ? '✅ Sağlanıyor' : '❌ Sağlanmıyor'}
                  </span>
                </div>
                {/* Kriter 2'yi sadece "Dikili vasıflı", "Zeytin ağaçlı + herhangi bir dikili vasıf" ve "… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf" arazi türleri değilse göster */}
                {araziVasfi !== 'Dikili vasıflı' && araziVasfi !== 'Zeytin ağaçlı + herhangi bir dikili vasıf' && araziVasfi !== '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf' && (
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Kriter 2:</strong> Tarla alanı ≥ 20000 m²: {' '}
                    <span style={{ color: hesaplamaSonucu.yeterlilik.kriter2 ? '#155724' : '#721c24' }}>
                      {hesaplamaSonucu.yeterlilik.kriter2 ? '✅ Sağlanıyor' : '❌ Sağlanmıyor'}
                    </span>
                  </div>
                )}
              </div>
              
              {hesaplamaSonucu.alanBilgisi && !hesaplamaSonucu.yeterlilik.kriter1 && (
                <InfoText>
                  Mevcut ağaç yoğunluğu: <strong>%{hesaplamaSonucu.alanBilgisi.oran}</strong>
                  {hesaplamaSonucu.yeterlilik.kriter2 && ' (bilgi amaçlı)'}
                </InfoText>
              )}
              <InfoText>
                Dikili alan: <strong>{dikiliAlan.toLocaleString()} m²</strong>
              </InfoText>
              {araziVasfi !== 'Dikili vasıflı' && araziVasfi !== 'Zeytin ağaçlı + herhangi bir dikili vasıf' && araziVasfi !== '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf' && (
                <InfoText>
                  Tarla alanı: <strong>{tarlaAlani.toLocaleString()} m²</strong>
                </InfoText>
              )}
            </HighlightBox>
          )}

          {hesaplamaSonucu.details && (
            <>
              <p>Aşağıdaki ağaç türleri için beklenen minimum sayılara ulaşılmamıştır:</p>
              <ul>
                {hesaplamaSonucu.details.map((tur: any, index: number) => (
                  <li key={index}>
                    <strong>{tur.turAdi}</strong>: {tur.girilenSayi} adet (gerekli: {tur.gerekliSayi} adet)
                  </li>
                ))}
              </ul>
            </>
          )}

          {hesaplamaSonucu.alanBilgisi && hesaplamaSonucu.yeterlilik.kriter2 && !hesaplamaSonucu.yeterlilik.kriter1 && (
            <>
              <p>
                <strong>Ağaçların kapladığı toplam alan:</strong> {hesaplamaSonucu.alanBilgisi.kaplanAlan.toLocaleString()} m² 
                (Toplam arazinin %{hesaplamaSonucu.alanBilgisi.oran}'si)
              </p>

              {hesaplamaSonucu.alanBilgisi.agacDetaylari && (
                <div style={{ marginTop: '12px' }}>
                  <strong>Ağaç türü detayları (bilgi amaçlı):</strong>
                  <ul style={{ marginTop: '8px' }}>
                    {hesaplamaSonucu.alanBilgisi.agacDetaylari.map((detay: any, index: number) => (
                      <li key={index} style={{ marginBottom: '4px' }}>
                        <strong>{detay.turAdi}:</strong> {detay.sayi} adet → {detay.kaplanAlan.toLocaleString()} m²
                        <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                          (1000m²'de {detay.binMetrekareBasinaGerekli} adet gerekli)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Buton gösterimi - yeterlilik başarılı veya kriter2 sağlanıyorsa */}
          <div style={{ marginTop: '16px' }}>
            {(hesaplamaSonucu.type === 'success' && hesaplamaSonucu.yeterlilik?.yeterli === true) || 
             (hesaplamaSonucu.type === 'error' && hesaplamaSonucu.yeterlilik?.kriter2 === true) ? (
              <div>
                <HighlightBox $variant="success">
                  ✅ Bağ evi kontrolü başarılı. Arazide bağ evi yapılabilir.
                </HighlightBox>
                <Button onClick={devamEt} $variant={
                  hesaplamaSonucu.type === 'success' ? 'success' : 'warning'
                }>
                  ✅ Devam Et
                </Button>
              </div>
            ) : null}
            
            {hesaplamaSonucu.type === 'error' && !hesaplamaSonucu.yeterlilik?.kriter2 && (
              <div>
                <HighlightBox $variant="warning">
                  ❌ Arazide bağ evi yapılamaz. Hiçbir kriter sağlanmıyor.
                </HighlightBox>
                <InfoText size="13px">
                  💡 Çözüm önerileri:
                  <br/>• Dikili alanı 5000 m²'ye çıkarın ve %100 ağaç yoğunluğu sağlayın
                  {araziVasfi !== 'Zeytin ağaçlı + herhangi bir dikili vasıf' && araziVasfi !== '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf' && (
                    <>
                      <br/>• Veya tarla alanını 20000 m²'ye çıkarın
                    </>
                  )}
                </InfoText>
              </div>
            )}
          </div>
        </SonucPanel>
      )}
    </>
  );
};

export default ManuelTab;
