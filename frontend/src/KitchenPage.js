import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './KitchenPage.css';

const token = localStorage.getItem('token');
const uid = localStorage.getItem('uid');

function KitchenPage() {
  const [restaurantMenu, setRestaurantMenu] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {

      try {
        const response = await fetch(`http://localhost:8080/menu/Joes_Souvlaki`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          },
        });

        // Ελέγχουμε την απάντηση του API
        console.log('API Response Status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`+uid);
        }

        const data = await response.json();
        

        if (Array.isArray(data)) {
          setRestaurantMenu(data);
        } else {
          throw new Error('Data is not an array');
        }
      } catch (error) {
        console.error("Error fetching menu data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!restaurantMenu || restaurantMenu.length === 0) {
    return <div>No menu items available.</div>;
  }

  return (
    <div className="kitchen-container">
      <h2>Menu</h2>
      <div className="menu-section">
        {restaurantMenu.map((item) => (
          <div key={item.MENU_ID} className="menu-item">
            <span>{item.FOOD_NAME} - ${item.PRICE}</span>
            {item.FOOD_ALLERGENS && <p><strong>Allergens:</strong> {item.FOOD_ALLERGENS}</p>}
          </div>
        ))}
      </div>
      <button onClick={() => navigate('/login')} className="back-button">
        Back
      </button>
    </div>
  );
}

export default KitchenPage;
