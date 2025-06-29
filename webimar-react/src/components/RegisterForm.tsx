import React, { useState } from 'react';
import styled from 'styled-components';

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 32px 24px;
  max-width: 350px;
  margin: 0 auto;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 15px;
`;

const Button = styled.button`
  background: #059669;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 0;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #047857; }
`;

const ErrorMsg = styled.div`
  color: #dc2626;
  font-size: 14px;
  text-align: center;
`;

const SuccessMsg = styled.div`
  color: #059669;
  font-size: 14px;
  text-align: center;
`;

const RegisterForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== password2) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Kayıt başarılı! Giriş yapabilirsiniz.');
        setUsername('');
        setPassword('');
        setPassword2('');
        if (onSuccess) onSuccess();
      } else {
        setError(data.detail || 'Kayıt başarısız.');
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <h2 style={{textAlign:'center',marginBottom:8}}>Kayıt Ol</h2>
      <Input
        type="text"
        placeholder="Kullanıcı adı"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Şifre (tekrar)"
        value={password2}
        onChange={e => setPassword2(e.target.value)}
        required
      />
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {success && <SuccessMsg>{success}</SuccessMsg>}
      <Button type="submit" disabled={loading}>{loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}</Button>
    </FormContainer>
  );
};

export default RegisterForm;
