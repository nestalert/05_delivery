import React, { useState, useEffect } from 'react';

function RestaurantDropdown() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurantMenu, setRestaurantMenu] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:8080/menu/');
      const data = await response.json();
      setRestaurants(data);
    };

    fetchData();
  }, []);

  const handleSelect = (event) => {
    setSelectedRestaurant(event.target.value);
  };

  const handleSubmit = async () => {
    if (selectedRestaurant) {
      const response = await fetch(`http://localhost:8080/menu/${selectedRestaurant}`);
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
    </div>
  );
}

export default RestaurantDropdown;