import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useStructureTypes } from '../contexts/StructureTypesContext';
import { Link } from 'react-router-dom';

const HomeContainer = styled.div`
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  background: #f7f3f0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(
        45deg,
        rgba(139, 69, 19, 0.02) 0px,
        rgba(139, 69, 19, 0.02) 2px,
        transparent 2px,
        transparent 20px
      );
    pointer-events: none;
  }
  
  @media (max-width: 600px) {
    padding: 16px 4px;
    max-width: 100vw;
    overflow-x: hidden;
  }
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 60px;
  padding: 60px 40px;
  background: 
    linear-gradient(135deg, rgba(139, 69, 19, 0.9) 0%, rgba(101, 67, 33, 0.9) 100%),
    url('data:image/svg+xml;utf8,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="wood" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="%23D2691E"/><path d="M0 0L20 20M20 0L0 20" stroke="%23A0522D" stroke-width="0.5" opacity="0.3"/></pattern></defs><rect width="100%" height="100%" fill="url(%23wood)"/></svg>');
  background-size: 100px 100px, cover;
  border-radius: 0;
  color: #f5f5dc;
  margin: -24px -24px 60px -24px;
  position: relative;
  box-shadow: 
    inset 0 0 0 3px rgba(139, 69, 19, 0.3),
    0 8px 32px rgba(139, 69, 19, 0.2);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(
        0deg,
        rgba(139, 69, 19, 0.1) 0px,
        transparent 1px,
        transparent 8px,
        rgba(139, 69, 19, 0.1) 9px
      );
    pointer-events: none;
  }
  
  @media (max-width: 600px) {
    padding: 28px 20px;
    margin: -8px -8px 32px -8px;
  }
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: 800;
  margin: 0 0 16px 0;
  font-family: 'Playfair Display', 'Georgia', serif;
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(245, 245, 220, 0.3);
  color: #f5f5dc;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 3px;
    background: linear-gradient(90deg, transparent, #d2691e, transparent);
    border-radius: 2px;
  }
  
  @media (max-width: 600px) {
    font-size: 28px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 24px;
  margin: 24px 0 32px 0;
  opacity: 0.95;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-family: 'Crimson Text', 'Georgia', serif;
  font-weight: 500;
  color: #f5f5dc;
  font-style: italic;
  
  @media (max-width: 600px) {
    font-size: 16px;
    margin: 16px 0;
    max-width: 95vw;
  }
`;

const HeroDescription = styled.p`
  font-size: 18px;
  opacity: 0.9;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.8;
  font-family: 'Crimson Text', 'Georgia', serif;
  color: #f5f5dc;
  
  @media (max-width: 600px) {
    font-size: 14px;
    max-width: 98vw;
  }
`;

const StatsSection = styled.div`
  background: 
    linear-gradient(135deg, #f5f1ec 0%, #ede4d8 100%);
  border-radius: 0;
  padding: 28px 16px;
  margin-bottom: 32px;
  position: relative;
  border: 2px solid #d2691e;
  box-shadow: 
    inset 0 0 0 2px rgba(139, 69, 19, 0.1),
    0 4px 16px rgba(139, 69, 19, 0.08);
  overflow: hidden;
  perspective: 1000px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(
        90deg,
        transparent 0px,
        rgba(139, 69, 19, 0.03) 1px,
        rgba(139, 69, 19, 0.03) 2px,
        transparent 3px,
        transparent 40px
      );
    pointer-events: none;
  }
  
  &::after {
    content: '🌾';
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 24px;
    opacity: 0.3;
  }
  
  @media (max-width: 600px) {
    padding: 14px 4px;
    margin-bottom: 18px;
    border-width: 1px;
    overflow: hidden;
  }
`;

const StatsGridWrapper = styled.div`
  display: flex;
  width: max-content;
  align-items: center;
`;

const StatsGrid = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  position: relative;
  z-index: 1;
  min-height: 64px;
  width: fit-content;
  
  @media (max-width: 900px) {
    gap: 24px;
  }
  
  @media (max-width: 600px) {
    margin: 0 auto;
    white-space: nowrap;
    will-change: transform;
    min-height: 48px;
    animation: slideMarquee var(--animation-duration, 12s) linear infinite;

    &:hover {
      animation-play-state: paused;
    }
  }
  
  @keyframes slideMarquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(calc(-1 * var(--marquee-width, 320px))); }
  }
`;

const StatItem = styled.div`
  width: 80px;
  flex: 0 0 80px;
  text-align: center;
  color: #654321;
  position: relative;
  transform-origin: center;
  animation: gentleRotate 8s ease-in-out infinite;
  padding: 0 10px;
  min-width: 80px;
  
  &:last-child {
    margin-right: 0;
  }
  
  &:nth-child(1) {
    animation-delay: 0s;
    transform: rotate(-8deg);
  }
  
  &:nth-child(2) {
    animation-delay: 2s;
    transform: rotate(5deg);
  }
  
  &:nth-child(3) {
    animation-delay: 4s;
    transform: rotate(-6deg);
  }
  
  &:nth-child(4) {
    animation-delay: 6s;
    transform: rotate(7deg);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, transparent, #d2691e, transparent);
    border-radius: 2px;
  }
  
  @keyframes gentleRotate {
    0%, 100% { 
      transform: rotate(var(--initial-rotation, 0deg)) scale(1);
    }
    25% { 
      transform: rotate(calc(var(--initial-rotation, 0deg) + 3deg)) scale(1.05);
    }
    50% { 
      transform: rotate(calc(var(--initial-rotation, 0deg) - 2deg)) scale(1.02);
    }
    75% { 
      transform: rotate(calc(var(--initial-rotation, 0deg) + 1deg)) scale(1.08);
    }
  }
  
  @media (max-width: 600px) {
    width: 80px;
    min-width: 80px;
    padding: 0;
    animation: none;
    transform: none;
  }
`;

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: #b8860b;
  margin-bottom: 4px;
  font-family: 'Playfair Display', 'Georgia', serif;
  text-shadow: 
    2px 2px 4px rgba(139, 69, 19, 0.2),
    0 0 20px rgba(184, 134, 11, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    color: #d2691e;
  }
  
  @media (max-width: 600px) {
    font-size: 22px;
    margin-bottom: 2px;
  }
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #8b4513;
  font-weight: 600;
  font-family: 'Crimson Text', 'Georgia', serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
  margin-bottom: 0;
  
  @media (max-width: 600px) {
    font-size: 10px;
    white-space: normal;
  }
`;

const StructureTypesSection = styled.div`
  margin-bottom: 60px;
  background: 
    linear-gradient(135deg, #faf8f5 0%, #f5f1ec 100%);
  padding: 40px;
  border: 2px solid #d2691e;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(
        0deg,
        transparent 0px,
        rgba(139, 69, 19, 0.02) 1px,
        rgba(139, 69, 19, 0.02) 2px,
        transparent 3px,
        transparent 30px
      );
    pointer-events: none;
  }
  
  @media (max-width: 600px) {
    margin-bottom: 40px;
    padding: 20px;
    border-width: 1px;
  }
`;

const SectionTitle = styled.h2`
  color: #654321;
  font-size: 36px;
  font-weight: 800;
  text-align: center;
  margin: 0 0 50px 0;
  font-family: 'Playfair Display', 'Georgia', serif;
  text-shadow: 
    2px 2px 4px rgba(139, 69, 19, 0.2),
    0 0 20px rgba(139, 69, 19, 0.1);
  position: relative;
  
  &::before {
    content: '🌾';
    position: absolute;
    top: 50%;
    left: 20px;
    transform: translateY(-50%);
    font-size: 24px;
    opacity: 0.3;
  }
  
  &::after {
    content: '🌾';
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    font-size: 24px;
    opacity: 0.3;
  }
  
  @media (max-width: 600px) {
    font-size: 22px;
    margin-bottom: 30px;
    
    &::before,
    &::after {
      display: none;
    }
  }
`;

const StructureTypesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 50px;
  
  @media (max-width: 600px) {
    gap: 30px;
  }
`;

const CategorySection = styled.div`
  background: 
    linear-gradient(135deg, #ffffff 0%, #faf8f5 100%);
  border-radius: 0;
  padding: 40px;
  box-shadow: 
    inset 0 0 0 2px rgba(139, 69, 19, 0.1),
    0 8px 24px rgba(139, 69, 19, 0.1);
  border: 2px solid #d2691e;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 15px;
    left: 15px;
    right: 15px;
    bottom: 15px;
    border: 1px solid rgba(139, 69, 19, 0.1);
    pointer-events: none;
  }
  
  @media (max-width: 600px) {
    padding: 24px;
    border-width: 1px;
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  
  @media (max-width: 600px) {
    margin-bottom: 20px;
  }
`;

const CategoryIcon = styled.span`
  font-size: 40px;
  margin-right: 16px;
  text-shadow: 0 2px 4px rgba(139, 69, 19, 0.2);
  
  @media (max-width: 600px) {
    font-size: 28px;
    margin-right: 10px;
  }
`;

const CategoryTitle = styled.h3`
  color: #654321;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  font-family: 'Playfair Display', 'Georgia', serif;
  text-shadow: 0 1px 2px rgba(139, 69, 19, 0.1);
  
  @media (max-width: 600px) {
    font-size: 18px;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const StructureTypeButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  background: 
    linear-gradient(135deg, #f5f1ec 0%, #ede4d8 100%);
  border: 2px solid #d2691e;
  border-radius: 0;
  padding: 16px 20px;
  text-decoration: none;
  color: #654321;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Crimson Text', 'Georgia', serif;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 
    inset 0 1px 4px rgba(255, 255, 255, 0.3),
    0 2px 8px rgba(139, 69, 19, 0.1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    border: 1px solid rgba(139, 69, 19, 0.1);
    pointer-events: none;
  }
  
  &:hover {
    border-color: #b8860b;
    background: 
      linear-gradient(135deg, #ede4d8 0%, #e6d4c4 100%);
    color: #8b4513;
    text-decoration: none;
    box-shadow: 
      inset 0 1px 4px rgba(255, 255, 255, 0.4),
      0 4px 12px rgba(139, 69, 19, 0.2);
    transform: translateY(-2px);
  }
  
  @media (max-width: 600px) {
    padding: 12px 16px;
    font-size: 13px;
  }
`;

const StructureTypeIcon = styled.div`
  font-size: 22px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  text-shadow: 0 1px 2px rgba(139, 69, 19, 0.2);
  
  @media (max-width: 600px) {
    font-size: 18px;
    margin-right: 6px;
  }
`;

const GetStartedSection = styled.div`
  background: 
    linear-gradient(135deg, rgba(139, 69, 19, 0.95) 0%, rgba(160, 82, 45, 0.95) 100%),
    url('data:image/svg+xml;utf8,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="rustic" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="%23A0522D" opacity="0.3"/></pattern></defs><rect width="100%" height="100%" fill="url(%23rustic)"/></svg>');
  border-radius: 0;
  padding: 50px 40px;
  text-align: center;
  color: #f5f5dc;
  position: relative;
  border: 3px solid #d2691e;
  box-shadow: 
    inset 0 0 0 2px rgba(139, 69, 19, 0.2),
    0 8px 24px rgba(139, 69, 19, 0.2);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(
        -45deg,
        transparent 0px,
        rgba(139, 69, 19, 0.1) 1px,
        rgba(139, 69, 19, 0.1) 2px,
        transparent 3px,
        transparent 20px
      );
    pointer-events: none;
  }
  
  &::after {
    content: '🏡';
    position: absolute;
    top: 20px;
    left: 20px;
    font-size: 24px;
    opacity: 0.4;
  }
  
  @media (max-width: 600px) {
    padding: 30px 20px;
    border-width: 2px;
  }
`;

const GetStartedTitle = styled.h2`
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 20px 0;
  font-family: 'Playfair Display', 'Georgia', serif;
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(245, 245, 220, 0.3);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #d2691e, transparent);
    border-radius: 2px;
  }
  
  @media (max-width: 600px) {
    font-size: 20px;
    margin-bottom: 12px;
  }
`;

const GetStartedDescription = styled.p`
  font-size: 18px;
  opacity: 0.95;
  margin: 0 0 30px 0;
  font-family: 'Crimson Text', 'Georgia', serif;
  line-height: 1.6;
  font-style: italic;
  
  @media (max-width: 600px) {
    font-size: 14px;
    margin-bottom: 20px;
  }
`;

const GetStartedButton = styled.button`
  background: 
    linear-gradient(135deg, #d2691e 0%, #b8860b 100%);
  color: #f5f5dc;
  border: 2px solid #8b4513;
  padding: 16px 32px;
  border-radius: 0;
  font-size: 18px;
  font-weight: 700;
  font-family: 'Playfair Display', 'Georgia', serif;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 
    inset 0 2px 8px rgba(255, 255, 255, 0.2),
    0 4px 12px rgba(139, 69, 19, 0.3);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    border: 1px solid rgba(245, 245, 220, 0.3);
    pointer-events: none;
  }
  
  &:hover {
    background: 
      linear-gradient(135deg, #b8860b 0%, #d2691e 100%);
    transform: translateY(-2px);
    box-shadow: 
      inset 0 2px 8px rgba(255, 255, 255, 0.3),
      0 6px 16px rgba(139, 69, 19, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 600px) {
    font-size: 14px;
    padding: 12px 24px;
  }
`;

const HomePage: React.FC = () => {
  const { structureTypeLabels, structureCategories } = useStructureTypes();

  const stats = [
    { number: '27', label: 'Farklı Yapı Türü' },
    { number: '100%', label: 'Mevzuat Uyumu' },
    { number: '⚡', label: 'Hızlı Hesaplama' },
    { number: '🔒', label: 'Güvenli Sistem' },
  ];

  const [marqueeWidth, setMarqueeWidth] = useState(0);
  const [animationDuration, setAnimationDuration] = useState(12);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateWidth = () => {
      if (marqueeRef.current && window.innerWidth <= 600) {
        const width = marqueeRef.current.scrollWidth / 2;
        setMarqueeWidth(width);
        if (width > 0) {
          const duration = width / 40; // 40px/s hız
          setAnimationDuration(duration < 5 ? 5 : duration); // Minimum süre 5 saniye
        }
      }
    };

    calculateWidth();

    const debouncedCalculateWidth = () => {
      setTimeout(calculateWidth, 200);
    };

    window.addEventListener('resize', debouncedCalculateWidth);

    return () => window.removeEventListener('resize', debouncedCalculateWidth);
  }, []);

  const features = [
    {
      icon: '📏',
      title: 'Hassas Ölçümler',
      description: 'Geleneksel ustalık ile modern teknolojinin buluştuğu hassas hesaplama sistemi.'
    },
    {
      icon: '�️',
      title: 'Köklü Yapı Türleri',
      description: 'Asırlık deneyimle şekillenen 27 farklı geleneksel ve modern yapı türü desteği.'
    },
    {
      icon: '�',
      title: 'El Yazması Raporlar',
      description: 'Ustaca hazırlanmış, detaylı ve anlaşılır raporlama sistemi.'
    },
    {
      icon: '🗺️',
      title: 'Toprak Bilgisi',
      description: 'Toprağın hikayesini bilen, arazi bilgilerini harita üzerinde gösteren sistem.'
    },
    {
      icon: '⚡',
      title: 'Çabuk İş',
      description: 'Tecrübeli ustanın elinden çıkmış gibi hızlı ve güvenilir sonuçlar.'
    },
    {
      icon: '�️',
      title: 'Güvenli Muhafaza',
      description: 'Değerli bilgileriniz sandık gibi korunur, emanet gibi saklanır.'
    }
  ];

  return (
    <HomeContainer>
      <HeroSection>
        <HeroTitle>Tarımsal Arazilerde Yapılabilecek Yapıların Hesaplama Sistemi</HeroTitle>
        <HeroSubtitle>Tarım ve hayvancılık projeleri için hızlı, güvenilir ve güncel hesaplamalar</HeroSubtitle>
        <HeroDescription>
          Webimar, yapılaşma ve izin süreçlerinde size yol gösteren, güncel mevzuata uygun hesaplama ve analizler sunar.
        </HeroDescription>
      </HeroSection>

      <StatsSection>
        <div style={{ overflow: 'hidden', width: '100%' }}>
          <StatsGrid
            ref={marqueeRef}
            style={marqueeWidth && window.innerWidth <= 600 ? {
              ["--marquee-width" as any]: `${marqueeWidth}px`,
              ["--animation-duration" as any]: `${animationDuration}s`,
            } : {}}
          >
            {[...stats, ...stats].map((item, idx) => (
              <StatItem key={idx} data-marquee-item>
                <StatNumber>{item.number}</StatNumber>
                <StatLabel>{item.label}</StatLabel>
              </StatItem>
            ))}
          </StatsGrid>
        </div>
      </StatsSection>

      <GetStartedSection>
        <GetStartedTitle>Hesaplamaya Başlayın</GetStartedTitle>
        <GetStartedDescription>
          Sol menüden istediğiniz yapı türünü seçarak hemen hesaplamaya başlayabilirsiniz.
        </GetStartedDescription>
      </GetStartedSection>

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

      {/* Özellik kartları şimdilik gizlendi */}
      {/*
      <FeaturesGrid>
        {features.map((feature, index) => (
          <FeatureCard key={index}>
            <FeatureIcon>{feature.icon}</FeatureIcon>
            <FeatureTitle>{feature.title}</FeatureTitle>
            <FeatureDescription>{feature.description}</FeatureDescription>
          </FeatureCard>
        ))}
      </FeaturesGrid>
      */}
    </HomeContainer>
  );
};

export default HomePage;
