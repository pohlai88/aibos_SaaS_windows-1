import React, { useEffect, useState } from 'react';
import { IntercompanyTransfer, IntercompanyBalance, ApiResponse } from '../types/intercompany';

const API_URL = 'http://localhost:4001/api';

function getToken() {
  return localStorage.getItem('jwt_token') || '';
}

function setToken(token: string) {
  localStorage.setItem('jwt_token', token);
}

function removeToken() {
  localStorage.removeItem('jwt_token');
}

export default function App() {
  const [transfers, setTransfers] = useState<IntercompanyTransfer[]>([]);
  const [balances, setBalances] = useState<IntercompanyBalance[]>([]);
  const [fromEntity, setFromEntity] = useState('');
  const [toEntity, setToEntity] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setTokenState] = useState(getToken());
  const [role, setRole] = useState<string>('');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransfers();
    fetchBalances();
  }, []);

  async function fetchTransfers() {
    const res = await fetch(`${API_URL}/transfers`);
    const data: ApiResponse<IntercompanyTransfer[]> = await res.json();
    if (data.success && data.data) setTransfers(data.data);
  }

  async function fetchBalances() {
    const res = await fetch(`${API_URL}/balances`);
    const data: ApiResponse<IntercompanyBalance[]> = await res.json();
    if (data.success && data.data) setBalances(data.data);
  }

  async function handleCreateTransfer(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`${API_URL}/transfers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromEntity, toEntity, amount, currency })
    });
    const data: ApiResponse<IntercompanyTransfer> = await res.json();
    setLoading(false);
    if (data.success && data.data) {
      setFromEntity('');
      setToEntity('');
      setAmount(0);
      fetchTransfers();
      fetchBalances();
    } else {
      setError(data.error || 'Failed to create transfer');
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    // Simulate login (replace with real API call)
    if (loginUser === 'admin' && loginPass === 'password') {
      const fakeToken = 'FAKE.JWT.TOKEN';
      setToken(fakeToken);
      setTokenState(fakeToken);
      setRole('treasury_admin');
    } else {
      setLoginError('Invalid credentials');
    }
  }

  function handleLogout() {
    removeToken();
    setTokenState('');
    setRole('');
  }

  if (!token) {
    return (
      <div style={{ maxWidth: 400, margin: '4rem auto', fontFamily: 'sans-serif' }}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input placeholder="Username" value={loginUser} onChange={e => setLoginUser(e.target.value)} required />
          <input type="password" placeholder="Password" value={loginPass} onChange={e => setLoginPass(e.target.value)} required />
          <button type="submit">Login</button>
        </form>
        {loginError && <div style={{ color: 'red' }}>{loginError}</div>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Intercompany Treasury Dashboard</h1>
        <div>
          <span>Role: {role} </span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <form onSubmit={handleCreateTransfer} style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
        {/* Only show if user is treasury_admin */}
        {role === 'treasury_admin' ? (
          <>
            <input placeholder="From Entity" value={fromEntity} onChange={e => setFromEntity(e.target.value)} required />
            <input placeholder="To Entity" value={toEntity} onChange={e => setToEntity(e.target.value)} required />
            <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(Number(e.target.value))} required min={0.01} step={0.01} />
            <input placeholder="Currency" value={currency} onChange={e => setCurrency(e.target.value)} required />
            <button type="submit" disabled={loading}>Create Transfer</button>
          </>
        ) : (
          <span style={{ color: 'gray' }}>You do not have permission to create transfers.</span>
        )}
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <h2>Transfers</h2>
      <table border={1} cellPadding={6} style={{ width: '100%', marginBottom: 24 }}>
        <thead>
          <tr>
            <th>ID</th><th>From</th><th>To</th><th>Amount</th><th>Currency</th><th>Date</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map(t => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.fromEntity}</td>
              <td>{t.toEntity}</td>
              <td>{t.amount}</td>
              <td>{t.currency}</td>
              <td>{new Date(t.date).toLocaleString()}</td>
              <td>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Balances</h2>
      <table border={1} cellPadding={6} style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>From</th><th>To</th><th>Balance</th><th>Currency</th>
          </tr>
        </thead>
        <tbody>
          {balances.map(b => (
            <tr key={b.fromEntity + b.toEntity + b.currency}>
              <td>{b.fromEntity}</td>
              <td>{b.toEntity}</td>
              <td>{b.balance}</td>
              <td>{b.currency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
