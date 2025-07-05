import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SidebarNavigation from './SidebarNavigation';
import { useIsMobile } from '../hooks/useMediaQuery';
import LoginModalWrapper from './LoginModalWrapper';
import EditProfileModal from './EditProfileModal';

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
  z-index: 1201;
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
  background: 
    linear-gradient(135deg, #f5f1ec 0%, #ede4d8 100%);
  border-bottom: 3px solid #d2691e;
  padding: 16px 24px;
  margin: -24px -24px 24px -24px;
  box-shadow: 
    inset 0 2px 8px rgba(139, 69, 19, 0.1),
    0 4px 12px rgba(139, 69, 19, 0.1);
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
        90deg,
        transparent 0px,
        rgba(139, 69, 19, 0.02) 1px,
        rgba(139, 69, 19, 0.02) 2px,
        transparent 3px,
        transparent 40px
      );
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    margin: -16px -16px 16px -16px;
  }
`;

const AnimatedHeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 8px;
  min-height: 60px;
  
  @media (max-width: 768px) {
    min-height: 50px;
    margin-bottom: 4px;
  }
`;

const WaveBackground = styled.div`
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 0;
  z-index: 0;
  pointer-events: none;
  background: 
    linear-gradient(120deg, #d2691e 0%, #b8860b 30%, #8b4513 70%, #a0522d 100%);
  opacity: 0.3;
  border-radius: 0;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    left: 0; right: 0; top: 0; bottom: 0;
    background: 
      repeating-linear-gradient(
        -45deg,
        transparent 0px,
        rgba(139, 69, 19, 0.1) 1px,
        rgba(139, 69, 19, 0.1) 2px,
        transparent 3px,
        transparent 20px
      );
    animation: woodGrain 6s linear infinite;
    opacity: 0.5;
  }
  
  @keyframes woodGrain {
    0% { background-position: 0 0; }
    100% { background-position: 40px 40px; }
  }
`;

const ModernHeaderTitle = styled.h1`
  position: relative;
  z-index: 1;
  font-size: 2.5rem;
  font-family: 'Playfair Display', 'Georgia', serif;
  font-weight: 900;
  letter-spacing: 2px;
  text-align: center;
  margin: 0;
  background: linear-gradient(90deg, #654321 0%, #8b4513 30%, #a0522d 60%, #d2691e 100%);
  background-size: 200% auto;
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: rustGradient 4s ease-in-out infinite alternate;
  filter: drop-shadow(0 2px 8px rgba(139, 69, 19, 0.3));
  user-select: none;
  display: inline-block;
  text-shadow: 2px 2px 4px rgba(139, 69, 19, 0.2);
  
  @keyframes rustGradient {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    letter-spacing: 1px;
  }
`;

const ContentArea = styled.div`
  background: 
    linear-gradient(135deg, #faf8f5 0%, #f5f1ec 100%);
  border-radius: 0;
  box-shadow: 
    inset 0 0 0 2px rgba(139, 69, 19, 0.1),
    0 4px 12px rgba(139, 69, 19, 0.1);
  border: 2px solid #d2691e;
  min-height: calc(100vh - 140px);
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
        transparent 0px,
        rgba(139, 69, 19, 0.01) 1px,
        rgba(139, 69, 19, 0.01) 2px,
        transparent 3px,
        transparent 60px
      );
    pointer-events: none;
  }
`;

const UserActionsWrapper = styled.div`
  position: absolute;
  top: 50%;
  right: 24px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  z-index: 10;

  @media (max-width: 768px) {
    top: 12px;
    right: 12px;
    transform: none;
    align-items: flex-end;
  }
`;

const UserActions = styled.div`
  display: flex;
  gap: 8px;
  z-index: 10;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
  }
`;

const UserButton = styled.button`
  background: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  .mobile-icon {
    display: none;
  }
  
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    background: #f3f4f6;
    transform: translateY(1px);
  }
  
  &.login {
    background: #3b82f6;
    color: #ffffff;
    border-color: #2563eb;
    
    &:hover {
      background: #2563eb;
      border-color: #1d4ed8;
    }
    
    &:active {
      background: #1d4ed8;
    }
  }
  
  &.profile {
    background: #059669;
    color: #ffffff;
    border-color: #047857;
    
    &:hover {
      background: #047857;
      border-color: #065f46;
    }
    
    &:active {
      background: #065f46;
    }
  }
  
  &.logout {
    background: #ef4444;
    color: #ffffff;
    border-color: #dc2626;
    
    &:hover {
      background: #dc2626;
      border-color: #b91c1c;
    }
    
    &:active {
      background: #b91c1c;
    }
  }
  
  @media (max-width: 768px) {
    padding: 8px;
    font-size: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    
    .mobile-icon {
      display: block;
      font-size: 14px;
    }
    
    .desktop-text {
      display: none;
    }
  }
`;

/* Kullanıcı Bilgi Göstergesi */
const UserInfo = styled.div`
  margin-top: 4px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 10px;
  color: #6b7280;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 5;
  pointer-events: none;
  text-align: right;
  @media (max-width: 768px) {
    text-align: center;
    align-self: center;
    margin-top: 2px;
  }
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email?: string; username?: string } | null>(null);
  const isMobile = useIsMobile();

  // Giriş durumunu kontrol et
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Kullanıcı bilgilerini al
          const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
          const response = await fetch(`${API_BASE_URL}/user/profile/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUserInfo(userData);
            setUserEmail(userData.email || userData.username || 'Kullanıcı');
            setIsLoggedIn(true);
          } else {
            // Token geçersizse temizle
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setIsLoggedIn(false);
            setUserEmail('');
            setUserInfo(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          setIsLoggedIn(false);
          setUserEmail('');
          setUserInfo(null);
        }
      }
    };

    checkAuthStatus();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = () => {
    // Mobilde navigation tıklandığında sidebar'ı kapat
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Giriş başarılı olduğunda durumu yeniden kontrol et
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsLoggedIn(true);
      // Kullanıcı bilgilerini tekrar al
      const checkUser = async () => {
        try {
          const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
          const response = await fetch(`${API_BASE_URL}/user/profile/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUserInfo(userData);
            setUserEmail(userData.email || userData.username || 'Kullanıcı');
          }
        } catch (error) {
          console.error('Failed to fetch user info:', error);
        }
      };
      checkUser();
    }
  };

  const handleLogout = () => {
    // Çıkış işlemi
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setIsLoggedIn(false);
    setUserEmail('');
    setUserInfo(null);
    console.log('Kullanıcı çıkış yaptı');
  };

  const handleProfile = () => {
    setShowProfileModal(true);
  };

  const handleProfileUpdate = (updatedUser: { username: string; email: string }) => {
    setUserInfo(updatedUser);
    setUserEmail(updatedUser.email || updatedUser.username);
    setShowProfileModal(false);
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
          <AnimatedHeaderWrapper>
            <WaveBackground />
            <ModernHeaderTitle>
              <span style={{letterSpacing: '2px'}}>web</span>
              <span style={{display:'inline-block', width: '0.35em'}}></span>
              <span style={{letterSpacing: '2px'}}>imar</span>
            </ModernHeaderTitle>
          </AnimatedHeaderWrapper>
          <UserActionsWrapper>
            <UserActions>
              {!isLoggedIn ? (
                <UserButton className="login" onClick={handleLogin}>
                  <span className="mobile-icon">👤</span>
                  <span className="desktop-text">Giriş Yap</span>
                </UserButton>
              ) : (
                <>
                  <UserButton className="profile" onClick={handleProfile}>
                    <span className="mobile-icon">👤</span>
                    <span className="desktop-text">Hesabım</span>
                  </UserButton>
                  <UserButton className="logout" onClick={handleLogout}>
                    <span className="mobile-icon">🚪</span>
                    <span className="desktop-text">Çıkış</span>
                  </UserButton>
                </>
              )}
            </UserActions>
            {isLoggedIn && userEmail && (
              <UserInfo>
                {userEmail}
              </UserInfo>
            )}
          </UserActionsWrapper>
        </Header>
        <ContentArea>
          {children}
        </ContentArea>
        
        {/* Login Modal */}
        {showLoginModal && (
          <LoginModalWrapper 
            onClose={() => setShowLoginModal(false)} 
            onLoginSuccess={handleLoginSuccess}
          />
        )}
        
        {/* Profile Modal */}
        {showProfileModal && userInfo && (
          <EditProfileModal 
            user={{
              username: userInfo.username || '',
              email: userInfo.email || ''
            }}
            onClose={() => setShowProfileModal(false)}
            onProfileUpdate={handleProfileUpdate}
          />
        )}
      </MainContent>
    </LayoutContainer>
  );
};

export default AppLayout;
