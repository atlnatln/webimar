// Bag Evi specific form fields component
import React from 'react';
import FormField from './FormField';
import SmartDetectionFeedback from './SmartDetectionFeedback';
import { FormGrid } from './styles';

interface BagEviFormFieldsProps {
  formData: any;
  validationErrors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  renderSmartDetectionFeedback: (fieldName: string) => React.ReactNode;
}

const BagEviFormFields: React.FC<BagEviFormFieldsProps> = ({
  formData,
  validationErrors,
  onInputChange,
  renderSmartDetectionFeedback
}) => {
  return (
    <FormGrid>
      {/* Alan bilgileri */}
      <FormField
        label="Alan (m²)"
        name="alan_m2"
        type="number"
        value={formData.alan_m2 || ''}
        onChange={onInputChange}
        placeholder="Örn: 5000"
        min="1"
        step="1"
        required
        error={validationErrors.alan_m2}
      >
        {renderSmartDetectionFeedback('alan_m2')}
      </FormField>

      {/* Tarla + Zeytinlik senaryosu için özel alanlar */}
      {formData.arazi_vasfi === 'Tarla + Zeytinlik' && (
        <>
          <FormField
            label="Tarla Alanı (m²)"
            name="tarla_alani"
            type="number"
            value={formData.tarla_alani || ''}
            onChange={onInputChange}
            placeholder="Tarla alanını giriniz"
            min="1"
            step="1"
            required
            error={validationErrors.tarla_alani}
          >
            {renderSmartDetectionFeedback('tarla_alani')}
          </FormField>

          <FormField
            label="Zeytinlik Alanı (m²)"
            name="zeytinlik_alani"
            type="number"
            value={formData.zeytinlik_alani || ''}
            onChange={onInputChange}
            placeholder="Zeytinlik alanını giriniz"
            min="1"
            step="1"
            required
            error={validationErrors.zeytinlik_alani}
          >
            {renderSmartDetectionFeedback('zeytinlik_alani')}
          </FormField>
        </>
      )}

      {/* Dikili alan için */}
      {(formData.arazi_vasfi === 'Dikili vasıflı' || 
        formData.arazi_vasfi === 'Zeytin ağaçlı + herhangi bir dikili vasıf' ||
        formData.arazi_vasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf') && (
        <FormField
          label="Dikili Alanı (m²)"
          name="dikili_alani"
          type="number"
          value={formData.dikili_alani || ''}
          onChange={onInputChange}
          placeholder="Dikili alanını giriniz"
          min="1"
          step="1"
          required
          error={validationErrors.dikili_alani}
        >
          {renderSmartDetectionFeedback('dikili_alani')}
        </FormField>
      )}

      {/* Zeytin ağacı sayısı alanları */}
      {(formData.arazi_vasfi === '… Adetli Zeytin Ağacı bulunan tarla' ||
        formData.arazi_vasfi === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf') && (
        <>
          <FormField
            label="Tapu Zeytin Ağacı Adedi"
            name="tapu_zeytin_agac_adedi"
            type="number"
            value={formData.tapu_zeytin_agac_adedi || ''}
            onChange={onInputChange}
            placeholder="Tapudaki ağaç sayısı"
            min="1"
            step="1"
            required
            error={validationErrors.tapu_zeytin_agac_adedi}
          />

          <FormField
            label="Mevcut Zeytin Ağacı Adedi"
            name="mevcut_zeytin_agac_adedi"
            type="number"
            value={formData.mevcut_zeytin_agac_adedi || ''}
            onChange={onInputChange}
            placeholder="Mevcut ağaç sayısı"
            min="1"
            step="1"
            required
            error={validationErrors.mevcut_zeytin_agac_adedi}
          />
        </>
      )}
    </FormGrid>
  );
};

export default BagEviFormFields;
