import React, { useState, useEffect } from 'react';
const token = localStorage.getItem('token');

function RestaurantDropdown() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurantMenu, setRestaurantMenu] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://localhost:8080/menu/`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
      const data = await response.json();
      setRestaurants(data);
    };

    fetchData();
  }, []);

  const handleSelect = (event) => {
    setSelectedRestaurant(event.target.value);
    setRestaurantMenu(null); // Reset menu when a new restaurant is selected
  };

  const handleSubmit = async () => {
    if (selectedRestaurant) {
      const response = await fetch(`http://localhost:8080/menu/${selectedRestaurant}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
      const data = await response.json();
      setRestaurantMenu(data);
    }
  };

  return (
    <div>
      <h2>Select Restaurant</h2>
      <select onChange={handleSelect}>
        <option value="">-- Select Restaurant --</option>
        {restaurants.map((restaurant) => (
          <option key={restaurant.UID} value={restaurant.UNAME}>
            {restaurant.UNAME}
          </option>
        ))}
      </select>
      <button onClick={handleSubmit}>Submit</button>

      {/* Conditionally render the restaurant menu */}
      {restaurantMenu && (
        <div>
          <h3>Menu</h3>
          {/* Display the menu data here based on its structure */}
          <ul>
            {restaurantMenu.map((menuItem) => (
              <li key={menuItem.UID}>{menuItem.FOOD_NAME} - {menuItem.PRICE}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default RestaurantDropdown;