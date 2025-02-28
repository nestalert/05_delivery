import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './KitchenPage.css';

const token = localStorage.getItem('token');
const uid = localStorage.getItem('uid');

function KitchenPage() {
  const [restaurantMenu, setRestaurantMenu] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/menu/` + parseInt(uid), {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          },
        });

        console.log('API Response Status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} ` + uid);
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

  const toggleAllergens = (menuId) => {
    setSelectedItem(selectedItem === menuId ? null : menuId);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!restaurantMenu || restaurantMenu.length === 0) return <div>No menu items available.</div>;

  return (
    <div className="kitchen-container">
      <h4>Menu</h4>
      <div className="menu-section">
        {restaurantMenu.map((item) => (
          <div key={item.MENU_ID} className="menu-item">
            {/* Food name & price - Make sure it's on its own line */}
            <div 
              onClick={() => toggleAllergens(item.MENU_ID)} 
              style={{ 
                cursor: "pointer", 
                padding: "20px", 
                borderBottom: "2px solid #ddd", 
                display: "block"
              }}
            >
              {item.FOOD_NAME} : ${item.PRICE}
            </div>
            
            {/* Allergens below the food name */}
            {selectedItem === item.MENU_ID && item.FOOD_ALLERGENS && (
              <div style={{ marginTop: "5px", fontSize: "14px", color: "#d9534f" }}>
                <strong>Allergens:</strong> {item.FOOD_ALLERGENS}
              </div>
            )}
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
