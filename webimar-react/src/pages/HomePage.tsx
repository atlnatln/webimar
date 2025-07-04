import React from 'react';
import styled from 'styled-components';
import { useStructureTypes } from '../contexts/StructureTypesContext';
import LoginModal from '../components/LoginModal';
import { Link } from 'react-router-dom';

const HomeContainer = styled.div`
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 600px) {
    padding: 16px 4px;
    max-width: 100vw;
    overflow-x: hidden;
  }
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 60px;
  padding: 60px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  margin: -24px -24px 60px -24px;
  @media (max-width: 600px) {
    padding: 28px 0;
    margin: -8px -8px 32px -8px;
    border-radius: 8px;
  }
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  @media (max-width: 600px) {
    font-size: 28px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 24px;
  margin: 0 0 32px 0;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  @media (max-width: 600px) {
    font-size: 16px;
    margin-bottom: 16px;
    max-width: 95vw;
  }
`;

const HeroDescription = styled.p`
  font-size: 18px;
  opacity: 0.8;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  @media (max-width: 600px) {
    font-size: 14px;
    max-width: 98vw;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 14px;
    margin-bottom: 24px;
  }
`;

const FeatureCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  @media (max-width: 600px) {
    padding: 16px;
  }
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
  @media (max-width: 600px) {
    width: 40px;
    height: 40px;
    font-size: 18px;
    margin-bottom: 10px;
  }
`;

const FeatureTitle = styled.h3`
  color: #111827;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
  @media (max-width: 600px) {
    font-size: 15px;
    margin-bottom: 6px;
  }
`;

const FeatureDescription = styled.p`
  color: #6b7280;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  @media (max-width: 600px) {
    font-size: 12px;
  }
`;

const StatsSection = styled.div`
  background: #f8fafc;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 60px;
  @media (max-width: 600px) {
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 24px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  text-align: center;
  @media (max-width: 600px) {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
`;

const StatItem = styled.div`
  color: #111827;
`;

const StatNumber = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: #059669;
  margin-bottom: 8px;
  @media (max-width: 600px) {
    font-size: 22px;
    margin-bottom: 2px;
  }
`;

const StatLabel = styled.div`
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
  @media (max-width: 600px) {
    font-size: 11px;
  }
`;

const StructureTypesSection = styled.div`
  margin-bottom: 60px;
  @media (max-width: 600px) {
    margin-bottom: 24px;
  }
`;

const SectionTitle = styled.h2`
  color: #111827;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 40px 0;
  @media (max-width: 600px) {
    font-size: 18px;
    margin-bottom: 16px;
  }
`;

const StructureTypesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  @media (max-width: 600px) {
    gap: 16px;
  }
`;

const CategorySection = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  @media (max-width: 600px) {
    padding: 12px;
    border-radius: 8px;
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  @media (max-width: 600px) {
    margin-bottom: 8px;
  }
`;

const CategoryIcon = styled.span`
  font-size: 32px;
  margin-right: 12px;
  @media (max-width: 600px) {
    font-size: 20px;
    margin-right: 6px;
  }
`;

const CategoryTitle = styled.h3`
  color: #111827;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  @media (max-width: 600px) {
    font-size: 14px;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const StructureTypeButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px;
  text-decoration: none;
  color: #111827;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: none;
  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #1d4ed8;
    text-decoration: none;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
    transform: translateY(-2px);
  }
  @media (max-width: 600px) {
    padding: 8px 10px;
    font-size: 12px;
  }
`;

const StructureTypeIcon = styled.div`
  font-size: 20px;
  margin-right: 6px;
  display: flex;
  align-items: center;
`;

const GetStartedSection = styled.div`
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  color: white;
  @media (max-width: 600px) {
    padding: 16px;
    border-radius: 8px;
  }
`;

const GetStartedTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 16px 0;
  @media (max-width: 600px) {
    font-size: 16px;
    margin-bottom: 8px;
  }
`;

const GetStartedDescription = styled.p`
  font-size: 18px;
  opacity: 0.9;
  margin: 0 0 24px 0;
  @media (max-width: 600px) {
    font-size: 12px;
    margin-bottom: 8px;
  }
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
  @media (max-width: 600px) {
    font-size: 13px;
    padding: 10px 16px;
  }
  &:hover {
    background: #f1f5f9;
    transform: translateY(-2px);
  }
`;

const HomePage: React.FC = () => {
  const { structureTypeLabels, structureCategories } = useStructureTypes();

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

  return (
    <HomeContainer>
      <HeroSection>
        <HeroTitle>Webimar Hesaplama Platformu</HeroTitle>
        <HeroSubtitle>Tarım ve hayvancılık projeleri için hızlı, güvenilir ve güncel hesaplamalar</HeroSubtitle>
        <HeroDescription>
          Webimar, yapılaşma ve izin süreçlerinde size yol gösteren, güncel mevzuata uygun hesaplama ve analizler sunar.
        </HeroDescription>
      </HeroSection>
      <div style={{ display: 'flex', justifyContent: 'flex-end', maxWidth: 1200, margin: '0 auto 16px auto' }}>
        <LoginModal />
      </div>

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
          {Object.values(structureCategories).map((category: any, index) => (
            <CategorySection key={index}>
              <CategoryHeader>
                <CategoryIcon>{category.icon}</CategoryIcon>
                <CategoryTitle>{category.name}</CategoryTitle>
              </CategoryHeader>
              <CategoryGrid>
                {category.types.map((type: string, idx: number) => (
                  <StructureTypeButton key={type + '-' + idx} to={`/${type}`}>
                    <StructureTypeIcon>{category.icon}</StructureTypeIcon>
                    <span>{structureTypeLabels[type as keyof typeof structureTypeLabels] || type}</span>
                  </StructureTypeButton>
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

export default HomePage;
