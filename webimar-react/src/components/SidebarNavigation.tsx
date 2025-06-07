import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { NavigationItem, StructureType } from '../types';
import { useStructureTypes } from '../contexts/StructureTypesContext';

const SidebarContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: ${props => props.$isOpen ? '280px' : '60px'};
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: white;
  transition: width 0.3s ease;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div<{ $isOpen: boolean }>`
  padding: 20px;
  border-bottom: 1px solid #34495e;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 60px;
`;

const Logo = styled.div`
  font-size: 24px;
  color: #3498db;
`;

const Title = styled.h1<{ $isOpen: boolean }>`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  opacity: ${props => props.$isOpen ? 1 : 0};
  transition: opacity 0.3s ease;
  overflow: hidden;
  white-space: nowrap;
`;

const CategoryTitle = styled.div<{ $isOpen: boolean }>`
  padding: 16px 20px 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #bdc3c7;
  opacity: ${props => props.$isOpen ? 1 : 0};
  transition: opacity 0.3s ease;
`;

const NavItem = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: ${props => props.$isActive ? '#3498db' : '#ecf0f1'};
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 3px solid ${props => props.$isActive ? '#3498db' : 'transparent'};
  background: ${props => props.$isActive ? 'rgba(52, 152, 219, 0.1)' : 'transparent'};

  &:hover {
    background: rgba(52, 152, 219, 0.1);
    color: #3498db;
  }
`;

const NavIcon = styled.div`
  font-size: 18px;
  min-width: 20px;
  text-align: center;
`;

const NavLabel = styled.span<{ $isOpen: boolean }>`
  margin-left: 12px;
  opacity: ${props => props.$isOpen ? 1 : 0};
  transition: opacity 0.3s ease;
  overflow: hidden;
  white-space: nowrap;
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 20px;
  right: -15px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #3498db;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  z-index: 1001;

  &:hover {
    background: #2980b9;
  }
`;

interface SidebarNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
}

const categoryIcons = {
  livestock: '🐄',
  agriculture: '🌱',
  storage: '📦',
  residential: '🏠',
  other: '🏗️'
};

const categoryNames = {
  livestock: 'Hayvancılık Tesisleri',
  agriculture: 'Özel Üretim Tesisleri',
  storage: 'Depolama ve İşleme',
  residential: 'Barınma',
  other: 'Diğer Yapılar'
};

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { structureCategories, structureTypeLabels, loading } = useStructureTypes();

  // Navigation items oluştur
  const generateNavigationItems = (): NavigationItem[] => {
    const items: NavigationItem[] = [
      {
        id: 'home',
        label: 'Ana Sayfa',
        path: '/',
        category: 'other'
      },
      {
        id: 'map-test',
        label: '🗺️ Harita Testi',
        path: '/map-test',
        category: 'other'
      }
    ];

    // Her kategori için navigation items oluştur
    Object.entries(structureCategories).forEach(([categoryKey, category]) => {
      category.types.forEach((structureType: StructureType) => {
        items.push({
          id: structureType,
          label: structureTypeLabels[structureType] || structureType,
          path: `/${structureType}`,
          structureType: structureType,
          category: categoryKey === 'livestock' ? 'livestock' : 
                   categoryKey === 'special_production' ? 'agriculture' : 'storage'
        });
      });
    });

    return items;
  };

  if (loading) {
    return (
      <SidebarContainer $isOpen={isOpen}>
        <ToggleButton onClick={onToggle}>
          {isOpen ? '←' : '→'}
        </ToggleButton>
        
        <Header $isOpen={isOpen}>
          <Logo>🌾</Logo>
          <Title $isOpen={isOpen}>Webimar</Title>
        </Header>

        <div style={{ padding: '20px', color: '#bdc3c7', fontSize: '14px' }}>
          Yükleniyor...
        </div>
      </SidebarContainer>
    );
  }

  const navigationItems = generateNavigationItems();

  const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  return (
    <SidebarContainer $isOpen={isOpen}>
      <ToggleButton onClick={onToggle}>
        {isOpen ? '←' : '→'}
      </ToggleButton>
      
      <Header $isOpen={isOpen}>
        <Logo>🌾</Logo>
        <Title $isOpen={isOpen}>Webimar</Title>
      </Header>

      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category}>
          <CategoryTitle $isOpen={isOpen}>
            {categoryIcons[category as keyof typeof categoryIcons]} {categoryNames[category as keyof typeof categoryNames]}
          </CategoryTitle>
          {items.map((item) => (
            <NavItem
              key={item.id}
              to={item.path}
              $isActive={location.pathname === item.path}
            >
              <NavIcon>
                {category === 'livestock' ? '🐄' : 
                 category === 'agriculture' ? '🌱' : 
                 category === 'storage' ? '📦' :
                 category === 'residential' ? '🏠' : '⚙️'}
              </NavIcon>
              <NavLabel $isOpen={isOpen}>{item.label}</NavLabel>
            </NavItem>
          ))}
        </div>
      ))}
    </SidebarContainer>
  );
};

export default SidebarNavigation;
