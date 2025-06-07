import React, { useState } from 'react';
import styled from 'styled-components';
import CalculationForm from './CalculationForm';
import ResultDisplay from './ResultDisplay';
import { CalculationResult, StructureType } from '../types';

interface CalculationPageProps {
  calculationType: StructureType;
  title: string;
  description: string;
}

const PageContainer = styled.div`
  padding: 24px;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f3f4f6;
`;

const PageTitle = styled.h1`
  color: #111827;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
`;

const PageDescription = styled.p`
  color: #6b7280;
  font-size: 18px;
  line-height: 1.6;
  margin: 0;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  
  @media (min-width: 1200px) {
    grid-template-columns: 500px 1fr;
  }
`;

const FormSection = styled.div`
  order: 1;
  
  @media (min-width: 1200px) {
    order: 0;
  }
`;

const ResultSection = styled.div`
  order: 0;
  
  @media (min-width: 1200px) {
    order: 1;
  }
`;

const CalculationPage: React.FC<CalculationPageProps> = ({ 
  calculationType, 
  title, 
  description 
}) => {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculationResult = (newResult: CalculationResult) => {
    setResult(newResult);
    setIsLoading(false);
  };

  const handleCalculationStart = () => {
    setIsLoading(true);
    setResult(null);
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>{title}</PageTitle>
        <PageDescription>{description}</PageDescription>
      </PageHeader>
      
      <ContentGrid>
        <FormSection>
          <CalculationForm
            calculationType={calculationType}
            onResult={handleCalculationResult}
            onCalculationStart={handleCalculationStart}
          />
        </FormSection>
        
        <ResultSection>
          <ResultDisplay
            result={result}
            isLoading={isLoading}
            calculationType={calculationType}
          />
        </ResultSection>
      </ContentGrid>
    </PageContainer>
  );
};

export default CalculationPage;
