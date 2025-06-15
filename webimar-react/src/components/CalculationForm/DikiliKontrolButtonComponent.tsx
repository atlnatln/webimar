import React from 'react';
import { FormGroup, Label, DikiliKontrolButton } from './styles';

interface DikiliKontrolButtonProps {
  araziVasfi: string;
  calculationType: string;
  dikiliKontrolSonucu?: any;
  onOpenControl: () => void;
}

const DikiliKontrolButtonComponent: React.FC<DikiliKontrolButtonProps> = ({
  araziVasfi,
  calculationType,
  dikiliKontrolSonucu,
  onOpenControl
}) => {
  // Dikili kontrol butonu gösterilecek durumları kontrol et
  const shouldShowButton = calculationType === 'bag-evi' && (
    araziVasfi === 'Tarla + herhangi bir dikili vasıflı' ||
    araziVasfi === 'Dikili vasıflı' ||
    araziVasfi === 'Tarla + Zeytinlik' ||
    araziVasfi === 'Zeytin ağaçlı + herhangi bir dikili vasıf' ||
    araziVasfi === '… Adetli Zeytin Ağacı bulunan tarla' ||
    araziVasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf'
  );

  if (!shouldShowButton) return null;

  const getButtonText = () => {
    if (araziVasfi === '… Adetli Zeytin Ağacı bulunan tarla') {
      return '🗺️ Haritadan Kontrol';
    }
    return araziVasfi === 'Tarla + herhangi bir dikili vasıflı' || araziVasfi === 'Dikili vasıflı' 
      ? '🌳 Dikili Alan Kontrolü' 
      : '🗺️ Haritadan Kontrol';
  };

  const getStatusDisplay = () => {
    if (!dikiliKontrolSonucu) return null;

    const statusStyle = {
      marginTop: '8px',
      padding: '8px',
      background: dikiliKontrolSonucu.directTransfer 
        ? '#e8f5e8' 
        : dikiliKontrolSonucu.dikiliAlanKontrolSonucu?.yeterlilik?.yeterli === true 
          ? '#d4edda' 
          : '#f8d7da',
      border: '1px solid ' + (dikiliKontrolSonucu.directTransfer 
        ? '#c3e6cb' 
        : dikiliKontrolSonucu.dikiliAlanKontrolSonucu?.yeterlilik?.yeterli === true 
          ? '#c3e6cb' 
          : '#f5c6cb'),
      borderRadius: '4px',
      fontSize: '12px',
      color: dikiliKontrolSonucu.directTransfer 
        ? '#155724' 
        : dikiliKontrolSonucu.dikiliAlanKontrolSonucu?.yeterlilik?.yeterli === true 
          ? '#155724' 
          : '#721c24'
    };

    return (
      <div style={statusStyle}>
        {dikiliKontrolSonucu.directTransfer ? (
          <>
            🚀 Doğrudan aktarım yapıldı
            <div style={{ fontSize: '11px', marginTop: '2px' }}>
              {araziVasfi === 'Tarla + Zeytinlik' ? (
                `Tarla: ${dikiliKontrolSonucu.tarlaAlani?.toLocaleString()} m² | Zeytinlik: ${dikiliKontrolSonucu.zeytinlikAlani?.toLocaleString()} m²`
              ) : araziVasfi === '… Adetli Zeytin Ağacı bulunan tarla' ? (
                `Tarla Alanı: ${dikiliKontrolSonucu.tarlaAlani?.toLocaleString()} m²`
              ) : araziVasfi === 'Zeytin ağaçlı + herhangi bir dikili vasıf' ? (
                `Dikili Alan: ${dikiliKontrolSonucu.dikiliAlan?.toLocaleString()} m² | Zeytin Ağacı: ${dikiliKontrolSonucu.zeytinlikAlani?.toLocaleString()} adet`
              ) : araziVasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf' ? (
                `Dikili Alan: ${dikiliKontrolSonucu.dikiliAlan?.toLocaleString()} m²`
              ) : (
                `Dikili alan: ${dikiliKontrolSonucu.dikiliAlan?.toLocaleString()} m² | Tarla alanı: ${dikiliKontrolSonucu.tarlaAlani?.toLocaleString()} m²`
              )}
            </div>
          </>
        ) : dikiliKontrolSonucu.dikiliAlanKontrolSonucu?.yeterlilik?.yeterli === true ? (
          <>
            ✅ Dikili alan kontrolü başarılı
          </>
        ) : (
          <>
            ❌ Dikili alan kontrolü başarısız
            <div style={{ fontSize: '11px', marginTop: '2px' }}>
              {dikiliKontrolSonucu.dikiliAlanKontrolSonucu?.yeterlilik?.kriter1 === false && dikiliKontrolSonucu.dikiliAlanKontrolSonucu?.yeterlilik?.kriter2 === false ?
                `Dikili alan: ${dikiliKontrolSonucu.dikiliAlan?.toLocaleString()} m² < 5000 m² ve Tarla alanı: ${dikiliKontrolSonucu.tarlaAlani?.toLocaleString()} m² < 20000 m²` :
                (dikiliKontrolSonucu.dikiliAlanKontrolSonucu?.yeterlilik?.oran !== undefined && dikiliKontrolSonucu.dikiliAlanKontrolSonucu?.yeterlilik?.minimumOran !== undefined) ?
                  `Yoğunluk yetersiz: %${dikiliKontrolSonucu.dikiliAlanKontrolSonucu?.yeterlilik?.oran?.toFixed(1)} < %${dikiliKontrolSonucu.dikiliAlanKontrolSonucu?.yeterlilik?.minimumOran}` :
                  'Ağaç yoğunluğu hesaplaması yapılmamıştır'}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <FormGroup>
      <Label>
        {araziVasfi === '… Adetli Zeytin Ağacı bulunan tarla' ? 'Alan Kontrolü' : 
         araziVasfi === 'Zeytin ağaçlı + herhangi bir dikili vasıf' ? 'Alan Kontrolü' :
         araziVasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf' ? 'Alan Kontrolü' :
         'Dikili Alan Kontrolü'}
      </Label>
      <DikiliKontrolButton
        type="button"
        onClick={onOpenControl}
      >
        {getButtonText()}
      </DikiliKontrolButton>
      {getStatusDisplay()}
    </FormGroup>
  );
};

export default DikiliKontrolButtonComponent;
