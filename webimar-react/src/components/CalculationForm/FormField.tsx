import React from 'react';
import { FormGroup, Label, Input, ErrorMessage, RequiredIndicator } from './styles';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'email';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
  error?: string;
  helpText?: string;
  children?: React.ReactNode; // For additional content like smart detection feedback
  disabled?: boolean; // Form alanının devre dışı bırakılması için
  onClick?: () => void; // Devre dışı durumdayken tıklanınca çağrılacak fonksiyon
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  min,
  max,
  step,
  error,
  helpText,
  children,
  disabled = false,
  onClick
}) => {
  const handleClick = () => {
    if (disabled && onClick) {
      onClick();
    }
  };

  return (
    <FormGroup>
      <Label>
        {label} {required && <RequiredIndicator>*</RequiredIndicator>}
      </Label>
      <Input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        required={required}
        disabled={disabled}
        onClick={handleClick}
        style={{
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
          backgroundColor: disabled ? '#f5f5f5' : undefined
        }}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {children}
      {helpText && (
        <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>
          {helpText}
        </div>
      )}
    </FormGroup>
  );
};

export default FormField;
