import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getProfile } from '../services/api';
import EditProfileModal from '../components/EditProfileModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import CalculationHistoryList from '../components/CalculationHistoryList';

const Container = styled.div`
  max-width: 480px;
  margin: 48px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Avatar = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: #fff;
  margin-bottom: 24px;
`;

const Info = styled.div`
  width: 100%;
  margin-bottom: 32px;
`;

const Label = styled.div`
  font-size: 13px;
  color: #888;
  margin-bottom: 4px;
`;

const Value = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  justify-content: center;
`;

const Button = styled.button`
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #1d4ed8; }
`;

const AccountPage: React.FC = () => {
  const [user, setUser] = useState<{ username: string; email: string; initials: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access');
        if (!token) {
          setError('Kullanıcı oturumu bulunamadı.');
          setLoading(false);
          return;
        }
        const data = await getProfile(token);
        setUser({
          username: data.username,
          email: data.email,
          initials: (data.first_name?.[0] || data.username?.[0] || '?').toUpperCase() + (data.last_name?.[0] || '')
        });
        setLoading(false);
      } catch (err: any) {
        setError('Kullanıcı bilgileri alınamadı.');
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = (updated: { username: string; email: string }) => {
    setUser(u => u ? { ...u, ...updated, initials: (updated.username?.[0] || '?').toUpperCase() } : null);
  };

  if (loading) return <Container><div>Yükleniyor...</div></Container>;
  if (error) return <Container><div style={{color:'#dc2626'}}>{error}</div></Container>;
  if (!user) return null;

  return (
    <Container>
      {editOpen && user && (
        <EditProfileModal user={user} onClose={() => setEditOpen(false)} onProfileUpdate={handleProfileUpdate} />
      )}
      {passwordOpen && <ChangePasswordModal onClose={() => setPasswordOpen(false)} />}
      <Avatar>{user.initials}</Avatar>
      <Info>
        <Label>Kullanıcı Adı</Label>
        <Value>{user.username}</Value>
        <Label>E-posta</Label>
        <Value>{user.email}</Value>
      </Info>
      <ButtonRow>
        <Button onClick={() => setEditOpen(true)}>Profili Düzenle</Button>
        <Button style={{background:'#dc2626'}} onClick={() => setPasswordOpen(true)}>Şifre Değiştir</Button>
      </ButtonRow>
      <CalculationHistoryList />
    </Container>
  );
};

export default AccountPage;
