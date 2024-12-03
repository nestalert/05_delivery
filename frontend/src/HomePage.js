import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <img
        src="/logo.png"
        alt="Delivery logo"
        className="home-logo"
      />
      <h1>Welcome to UNIWA eats</h1>
      <p>Your favorite meals delivered fresh to your doorstep!</p>
      <div className="home-buttons">
        <button onClick={() => navigate('/login')} className="login-button">
          Login
        </button>
        <button
          onClick={() => navigate('/create-account')}
          className="create-account-button"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

export default HomePage;
