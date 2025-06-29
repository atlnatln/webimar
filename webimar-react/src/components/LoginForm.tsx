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
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 0;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #1d4ed8; }
`;

const ErrorMsg = styled.div`
  color: #dc2626;
  font-size: 14px;
  text-align: center;
`;

const LoginForm: React.FC<{ onLogin?: () => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.access) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        // Uyum için ek anahtarlar
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        if (onLogin) onLogin();
      } else {
        setError(data.detail || 'Giriş başarısız.');
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <h2 style={{textAlign:'center',marginBottom:8}}>Giriş Yap</h2>
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
      {error && <ErrorMsg>{error}</ErrorMsg>}
      <Button type="submit" disabled={loading}>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</Button>
    </FormContainer>
  );
};

export default LoginForm;
