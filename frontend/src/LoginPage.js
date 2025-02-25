import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import CryptoJS from 'crypto-js';


function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const hash = CryptoJS.SHA256(password).toString();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null); // State for error message
 

  const handleLogin = async (e) => {
    e.preventDefault();
    // Check user existence before proceeding
    try {
      const response = await fetch(`http://localhost:8080/login/${username}/${hash}`);
      if (!response.ok) {
        // Handle 404 error
        if (response.status === 404) {
          setErrorMessage('User does not exist!');
        } else {
          setErrorMessage('An error occurred during login.');
        }
        return;
      }
      else {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('uid',data.uid);
      
        switch (data.role) {
          case "KITCHEN":
            navigate('/kitchen');
            break;
          case "DELIVERER":
            navigate('/deliverer');
            break;
          default: // Default to CUSTOMER
            navigate('/customer');
            break;
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setErrorMessage('An error occurred during login.');
      return;
    }
  };

  useEffect(() => {
    setErrorMessage(null); // Clear error message on form changes
  }, [username, password]); // Re-run on username or password change

  return (
    <div className="login-page">
      <h2>Login to Your Account</h2>
      <form onSubmit={handleLogin}>
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
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit">Login</button>
        <button onClick={() => navigate('/')} className="back-button">
          Back
        </button>
      </form>
      
    </div>
  );
}

export default LoginPage;   
