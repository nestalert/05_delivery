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
  const [role, setRole] = useState('');  
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
      const response = await fetch('http://localhost:8080/create/' + JSON.stringify(userData), {
        method: 'POST'
      });

      if (response.ok) {
        // Handle successful response, e.g., navigate to a different page
        navigate('/order', { state: { username } });
      } else {
        // Handle error response, e.g., display an error message
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
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </label>
        <p>A bank token will be generated automatically.</p>
        <button type="submit">Create Account</button>
      </form>
      <button onClick={() => navigate('/')} className="back-button">
        Back
      </button>
    </div>
  );
}

export default CreateAccountPage;