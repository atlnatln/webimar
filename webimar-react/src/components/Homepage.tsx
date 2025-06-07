import React from 'react';
import styled from 'styled-components';
import { useStructureTypes } from '../contexts/StructureTypesContext';

const HomeContainer = styled.div`
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 60px;
  padding: 60px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  margin: -24px -24px 60px -24px;
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const HeroSubtitle = styled.p`
  font-size: 24px;
  margin: 0 0 32px 0;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const HeroDescription = styled.p`
  font-size: 18px;
  opacity: 0.8;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
`;

const FeatureCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 24px;
`;

const FeatureTitle = styled.h3`
  color: #111827;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
`;

const FeatureDescription = styled.p`
  color: #6b7280;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
`;

const StatsSection = styled.div`
  background: #f8fafc;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 60px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  text-align: center;
`;

const StatItem = styled.div`
  color: #111827;
`;

const StatNumber = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: #059669;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
`;

const StructureTypesSection = styled.div`
  margin-bottom: 60px;
`;

const SectionTitle = styled.h2`
  color: #111827;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 40px 0;
`;

const StructureTypesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
`;

const CategorySection = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const CategoryIcon = styled.span`
  font-size: 32px;
  margin-right: 12px;
`;

const CategoryTitle = styled.h3`
  color: #111827;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
`;

const StructureTypeCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  text-align: left;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
    transform: translateY(-2px);
  }
`;

const StructureTypeTitle = styled.h4`
  color: #111827;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  line-height: 1.4;
`;

const GetStartedSection = styled.div`
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  color: white;
`;

const GetStartedTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 16px 0;
`;

const GetStartedDescription = styled.p`
  font-size: 18px;
  opacity: 0.9;
  margin: 0 0 24px 0;
`;

const GetStartedButton = styled.button`
  background: #ffffff;
  color: #1d4ed8;
  border: none;
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f5f9;
    transform: translateY(-2px);
  }
`;

const Homepage: React.FC = () => {
  const { structureCategories, structureTypeLabels, loading, error } = useStructureTypes();

  const features = [
    {
      icon: '🧮',
      title: 'Hassas Hesaplama',
      description: 'Tarım ve Orman Bakanlığı yönetmeliklerine uygun olarak hassas hesaplamalar yapın.'
    },
    {
      icon: '🏗️',
      title: '27 Farklı Yapı Türü',
      description: 'Hayvancılık tesislerinden seralara kadar 27 farklı tarımsal yapı için hesaplama desteği.'
    },
    {
      icon: '📊',
      title: 'Detaylı Raporlama',
      description: 'Hesaplama sonuçlarınızı detaylı raporlarla görüntüleyin ve kaydedin.'
    },
    {
      icon: '🗺️',
      title: 'Harita Entegrasyonu',
      description: 'Parsel bilgilerinizi harita üzerinde görüntüleyin ve analiz edin.'
    },
    {
      icon: '⚡',
      title: 'Hızlı İşlem',
      description: 'Modern teknoloji ile saniyeler içinde doğru sonuçlar alın.'
    },
    {
      icon: '🔒',
      title: 'Güvenli Sistem',
      description: 'Verileriniz güvenli bir şekilde saklanır ve işlenir.'
    }
  ];

  if (loading) {
    return (
      <HomeContainer>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Yapı türleri yükleniyor...</p>
        </div>
      </HomeContainer>
    );
  }

  if (error) {
    return (
      <HomeContainer>
        <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
          <p>Yapı türleri yüklenirken hata oluştu: {error}</p>
        </div>
      </HomeContainer>
    );
  }

  return (
    <HomeContainer>
      <HeroSection>
        <HeroTitle>Webimar</HeroTitle>
        <HeroSubtitle>Tarımsal Yapı Hesaplama Sistemi</HeroSubtitle>
        <HeroDescription>
          Tarımsal arazilerinizde yapılabilecek tarımsal yapıların alanlarını ve kapasitelerini 
          mevzuata uygun olarak hesaplayan modern ve kullanıcı dostu sistem.
        </HeroDescription>
      </HeroSection>

      <StatsSection>
        <StatsGrid>
          <StatItem>
            <StatNumber>27</StatNumber>
            <StatLabel>Farklı Yapı Türü</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>100%</StatNumber>
            <StatLabel>Mevzuat Uyumu</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>⚡</StatNumber>
            <StatLabel>Hızlı Hesaplama</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>🔒</StatNumber>
            <StatLabel>Güvenli Sistem</StatLabel>
          </StatItem>
        </StatsGrid>
      </StatsSection>

      <FeaturesGrid>
        {features.map((feature, index) => (
          <FeatureCard key={index}>
            <FeatureIcon>{feature.icon}</FeatureIcon>
            <FeatureTitle>{feature.title}</FeatureTitle>
            <FeatureDescription>{feature.description}</FeatureDescription>
          </FeatureCard>
        ))}
      </FeaturesGrid>

      <StructureTypesSection>
        <SectionTitle>Desteklenen Yapı Türleri</SectionTitle>
        <StructureTypesGrid>
          {Object.values(structureCategories).map((category, index) => (
            <CategorySection key={index}>
              <CategoryHeader>
                <CategoryIcon>{category.icon}</CategoryIcon>
                <CategoryTitle>{category.name}</CategoryTitle>
              </CategoryHeader>
              <CategoryGrid>
                {category.types.map((type) => (
                  <StructureTypeCard key={type}>
                    <StructureTypeTitle>{structureTypeLabels[type]}</StructureTypeTitle>
                  </StructureTypeCard>
                ))}
              </CategoryGrid>
            </CategorySection>
          ))}
        </StructureTypesGrid>
      </StructureTypesSection>

      <GetStartedSection>
        <GetStartedTitle>Hesaplamaya Başlayın</GetStartedTitle>
        <GetStartedDescription>
          Sol menüden istediğiniz yapı türünü seçerek hemen hesaplamaya başlayabilirsiniz.
        </GetStartedDescription>
        <GetStartedButton>
          Hesaplamaya Başla 🚀
        </GetStartedButton>
      </GetStartedSection>
    </HomeContainer>
  );
};

export default Homepage;
