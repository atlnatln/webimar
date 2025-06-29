import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getCalculationHistory } from '../services/api';

const HistoryContainer = styled.div`
  width: 100%;
  margin-top: 32px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;
const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 18px;
  color: #2563eb;
  display: flex;
  align-items: center;
  gap: 8px;
`;
const GroupTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #555;
  margin: 18px 0 8px 0;
`;
const Item = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
`;
const Type = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;
const DateText = styled.div`
  font-size: 13px;
  color: #888;
  margin-top: 2px;
`;
const Params = styled.pre`
  font-size: 13px;
  color: #444;
  background: #f3f4f6;
  border-radius: 6px;
  padding: 8px;
  margin: 8px 0 0 0;
  overflow-x: auto;
`;
const Result = styled.div`
  font-size: 14px;
  color: #2563eb;
  margin-top: 6px;
`;

function groupByDate(histories: any[]) {
  // Gün/Ay/Yıl bazında gruplama
  const groups: { [key: string]: any[] } = {};
  histories.forEach(item => {
    const date = new Date(item.created_at);
    const key = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  // Yıl > Ay > Gün sıralı diziye çevir
  return Object.entries(groups).sort((a,b) => b[0].localeCompare(a[0]));
}

const CalculationHistoryList: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('access');
        if (!token) {
          setError('Oturum bulunamadı.');
          setLoading(false);
          return;
        }
        const data = await getCalculationHistory(token);
        setHistory(data);
      } catch (e) {
        setError('Geçmiş yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <HistoryContainer>Geçmiş yükleniyor...</HistoryContainer>;
  if (error) return <HistoryContainer style={{color:'#dc2626'}}>{error}</HistoryContainer>;
  if (!history.length) return <HistoryContainer>Henüz bir hesaplama yapılmamış.</HistoryContainer>;

  const grouped = groupByDate(history);

  return (
    <HistoryContainer>
      <Title><span role="img" aria-label="hesap">🧮</span> Hesaplama Geçmişi</Title>
      {grouped.map(([date, items]) => (
        <div key={date}>
          <GroupTitle>{date.replace(/-/g,'.')}</GroupTitle>
          {items.map((item:any) => (
            <Item key={item.id}>
              <Type>{item.calculation_type}</Type>
              <DateText>{new Date(item.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</DateText>
              <Params>{JSON.stringify(item.parameters, null, 2)}</Params>
              {item.result && <Result>Sonuç: {typeof item.result === 'object' ? JSON.stringify(item.result) : String(item.result)}</Result>}
            </Item>
          ))}
        </div>
      ))}
    </HistoryContainer>
  );
};

export default CalculationHistoryList;
