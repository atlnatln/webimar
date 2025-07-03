import React, { useState } from 'react';
import styled from 'styled-components';

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
  background: #2563eb;
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
  &:hover { background: #1d4ed8; }
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

interface EditProfileModalProps {
  user: { username: string; email: string };
  onClose: () => void;
  onProfileUpdate: (user: { username: string; email: string }) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onProfileUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
      const token = localStorage.getItem('access');
      const res = await fetch(`${API_BASE_URL}/accounts/me/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email })
      });
      if (res.ok) {
        setSuccess('Profil başarıyla güncellendi.');
        onProfileUpdate({ username, email });
        setTimeout(onClose, 1200);
      } else {
        const data = await res.json();
        setError(data.detail || 'Güncelleme başarısız.');
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
        <h2 style={{textAlign:'center',marginBottom:16}}>Profili Düzenle</h2>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Kullanıcı adı"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          {error && <ErrorMsg>{error}</ErrorMsg>}
          {success && <SuccessMsg>{success}</SuccessMsg>}
          <Button type="submit" disabled={loading}>{loading ? 'Kaydediliyor...' : 'Kaydet'}</Button>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditProfileModal;
