import React, { useState } from 'react';
import { useWareHouseAuth } from './WareHouseAuthContext';
import { useNavigate } from 'react-router-dom';

const WareHouseLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useWareHouseAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/warehouse');
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div>
      <h2>Warehouse Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default WareHouseLoginPage;
