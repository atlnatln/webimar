import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.13);
  padding: 32px 24px 24px 24px;
  min-width: 340px;
  max-width: 95vw;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 16px;
  background: none;
  border: none;
  font-size: 22px;
  color: #888;
  cursor: pointer;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 15px;
  width: 100%;
  margin-bottom: 16px;
`;

const Button = styled.button`
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 0;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 8px;
  transition: background 0.2s;
  &:hover { background: #b91c1c; }
`;

const ErrorMsg = styled.div`
  color: #dc2626;
  font-size: 14px;
  text-align: center;
  margin-bottom: 8px;
`;

const SuccessMsg = styled.div`
  color: #059669;
  font-size: 14px;
  text-align: center;
  margin-bottom: 8px;
`;

interface ChangePasswordModalProps {
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== newPassword2) {
      setError('Yeni şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      const res = await fetch('http://localhost:8000/api/accounts/me/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
      });
      if (res.ok) {
        setSuccess('Şifre başarıyla değiştirildi. Giriş ekranına yönlendiriliyorsunuz...');
        setTimeout(() => {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          onClose();
          navigate('/'); // veya login sayfası
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.detail || 'Şifre değiştirilemedi.');
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose} title="Kapat">×</CloseButton>
        <h2 style={{textAlign:'center',marginBottom:16}}>Şifre Değiştir</h2>
        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            placeholder="Mevcut şifre"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Yeni şifre"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Yeni şifre (tekrar)"
            value={newPassword2}
            onChange={e => setNewPassword2(e.target.value)}
            required
          />
          {error && <ErrorMsg>{error}</ErrorMsg>}
          {success && <SuccessMsg>{success}</SuccessMsg>}
          <Button type="submit" disabled={loading}>{loading ? 'Kaydediliyor...' : 'Şifreyi Değiştir'}</Button>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ChangePasswordModal;
