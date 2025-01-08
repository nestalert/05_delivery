import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const ModifyPage = () => {
  const [userData, setUserData] = useState({
    UNAME: '',
    PWD: '',
    EMAIL: '',
    ADDR: '',
    ROLE: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = localStorage.getItem('uid');
        const token = localStorage.getItem('token');

        const response = await fetch(`http://localhost:8080/users/${uid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error, e.g., display an error message to the user
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (event) => {
    setUserData({ ...userData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
        const uid = localStorage.getItem('uid');
        const token = localStorage.getItem('token');
    
        const hash = CryptoJS.SHA256(userData.PWD).toString();
        userData.PWD = hash; 
        const response = await fetch(`http://localhost:8080/users/update/${uid}/` + JSON.stringify(userData), {
          method: 'PATCH', 
          headers: {
            Authorization: `Bearer ${token}`
          },
        });
    
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
    
        // Handle successful update (e.g., display a success message)
        console.log('User data updated successfully!');

      } catch (error) {
        console.error('Error updating user data:', error);
        // Handle error (e.g., display an error message to the user)
      }
    };
  return (
    <div>
      <h2>Modify Account</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="UNAME">Username:</label>
        <input
          type="text"
          id="UNAME"
          name="UNAME"
          value={userData.UNAME}
          onChange={handleChange}
        />
        <label htmlFor="PWD">Password:</label>
        <input
          type="password"
          id="PWD"
          name="PWD"
          value={userData.PWD}
          onChange={handleChange}
        />
        <label htmlFor="EMAIL">Email:</label>
        <input
          type="email"
          id="EMAIL"
          name="EMAIL"
          value={userData.EMAIL}
          onChange={handleChange}
        />
        <label htmlFor="ADDR">Address:</label>
        <input
          type="text"
          id="ADDR"
          name="ADDR"
          value={userData.ADDR}
          onChange={handleChange}
        />
        <label htmlFor="ROLE">Role:</label>
        <select
          id="ROLE"
          name="ROLE"
          value={userData.ROLE}
          onChange={handleChange}
        >
          <option value="CUSTOMER">CUSTOMER</option>
          <option value="KITCHEN">KITCHEN</option>
          <option value="DELIVERER">DELIVERER</option>
        </select>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default ModifyPage;