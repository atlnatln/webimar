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
  step?: string;
  error?: string;
  helpText?: string;
  children?: React.ReactNode; // For additional content like smart detection feedback
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
  step,
  error,
  helpText,
  children
}) => {
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
        step={step}
        required={required}
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
