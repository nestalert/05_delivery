import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateAccountPage.css';
import CryptoJS from 'crypto-js';

function tokenGenerate(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';  

  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;  
}

function CreateAccountPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');  
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('customer');  // Default role set to "customer"
  const token = tokenGenerate(15);
  const navigate = useNavigate();

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    const hash = CryptoJS.SHA256(password).toString();
    const userData = {
      username,
      hash,
      email,
      address,
      role,
      token
    };

    try {
      const response = await fetch('http://localhost:8080/newuser/' + JSON.stringify(userData), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
      });

      if (response.ok) {
        navigate('/login', { state: { username } });
      } else {
        console.error('Error creating account:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating account:', error);  
    }
  };

  return (
    <div className="create-account-page">
      <h2>Create an Account</h2>
      <form onSubmit={handleCreateAccount}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Address:
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </label>
        <label>
          Role:
          <div className="role-selection">
            <label>
              <input
                type="radio"
                value="customer"
                checked={role === 'customer'}
                onChange={(e) => setRole(e.target.value)}
              />
              Customer
            </label>
            <label>
              <input
                type="radio"
                value="kitchen"
                checked={role === 'kitchen'}
                onChange={(e) => setRole(e.target.value)}
              />
              Kitchen
              </label>
            <label>
              <input
                type="radio"
                value="delivery"
                checked={role === 'delivery'}
                onChange={(e) => setRole(e.target.value)}
              />
              Delivery Man
            </label>
          </div>
        </label>
        <p>A bank token will be generated automatically.</p>
        <button type="submit">Create Account</button>
        <button onClick={() => navigate('/')} className="back-button">
          Back
        </button>
      </form>
      
    </div>
  );
}

export default CreateAccountPage;
