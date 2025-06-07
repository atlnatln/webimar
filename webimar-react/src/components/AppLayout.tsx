import React, { useState } from 'react';
import styled from 'styled-components';
import SidebarNavigation from './SidebarNavigation';
import { useIsMobile } from '../hooks/useMediaQuery';

interface AppLayoutProps {
  children: React.ReactNode;
}

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
`;

const Sidebar = styled.aside<{ $isOpen: boolean }>`
  width: ${props => props.$isOpen ? '280px' : '60px'};
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  z-index: 1000;
  transition: all 0.3s ease;
  
  /* Mobilde tamamen ekran dışına çık */
  @media (max-width: 768px) {
    width: ${props => props.$isOpen ? '280px' : '0px'};
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    border-right: ${props => props.$isOpen ? '1px solid #e5e7eb' : 'none'};
  }
`;

const MainContent = styled.main<{ $sidebarOpen: boolean }>`
  flex: 1;
  margin-left: ${props => props.$sidebarOpen ? '280px' : '60px'};
  padding: 24px;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
  
  /* Mobilde sidebar margin'ı kaldır */
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 16px;
  }
`;

const Header = styled.header`
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 24px;
  margin: -24px -24px 24px -24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const HeaderTitle = styled.h1`
  color: #111827;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
`;

const HeaderSubtitle = styled.p`
  color: #6b7280;
  font-size: 16px;
  margin: 4px 0 0 0;
`;

const ContentArea = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  min-height: calc(100vh - 140px);
`;

/* Mobilde floating toggle button */
const MobileToggleButton = styled.button<{ $sidebarOpen: boolean }>`
  display: none;
  position: fixed;
  top: 20px;
  left: ${props => props.$sidebarOpen ? '300px' : '20px'};
  z-index: 1001;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    background: #2980b9;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

/* Mobilde sidebar açıkken overlay */
const MobileOverlay = styled.div<{ $isVisible: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.$isVisible ? 1 : 0};
  visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = () => {
    // Mobilde navigation tıklandığında sidebar'ı kapat
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <LayoutContainer>
      <Sidebar $isOpen={sidebarOpen}>
        <SidebarNavigation 
          isOpen={sidebarOpen} 
          onToggle={toggleSidebar}
          onNavigate={handleNavigation}
        />
      </Sidebar>
      
      {/* Mobilde floating toggle button */}
      <MobileToggleButton $sidebarOpen={sidebarOpen} onClick={toggleSidebar}>
        {sidebarOpen ? '✕' : '☰'}
      </MobileToggleButton>
      
      {/* Mobilde sidebar açıkken overlay */}
      <MobileOverlay $isVisible={sidebarOpen} onClick={toggleSidebar} />
      
      <MainContent $sidebarOpen={sidebarOpen}>
        <Header>
          <HeaderTitle>Webimar - Tarımsal Yapı Hesaplama Sistemi</HeaderTitle>
          <HeaderSubtitle>Tarımsal arazilerde yapılabilecek yapıların hesaplama sistemi</HeaderSubtitle>
        </Header>
        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default AppLayout;
