import React, { useState } from 'react';
import styled from 'styled-components';
import SidebarNavigation from './SidebarNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
`;

const Sidebar = styled.aside`
  width: 280px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  z-index: 1000;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: 24px;
  min-height: 100vh;
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

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <LayoutContainer>
      <Sidebar>
        <SidebarNavigation isOpen={sidebarOpen} onToggle={toggleSidebar} />
      </Sidebar>
      <MainContent>
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
