import React, { useState, useEffect } from 'react';
import './OrderPage.css';

const token = localStorage.getItem('token');
const customerUID = localStorage.getItem('uid');

function RestaurantDropdown() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurantMenu, setRestaurantMenu] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [kitchenID, setKitchenID] = useState(null);
  const [delivererID, setDelivererID] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://localhost:8080/menu/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setRestaurants(data);
    };

    fetchData();
  }, []);

  const handleSelect = (event) => {
    const selectedRestaurant = restaurants.find(restaurant => restaurant.UNAME === event.target.value);
    setSelectedRestaurant(event.target.value);
    setRestaurantMenu(null);
    setCartItems([]);
    setKitchenID(selectedRestaurant.UID);
  };

  const handleSubmit = async () => {
    if (selectedRestaurant) {
      const response = await fetch(`http://localhost:8080/menu/${selectedRestaurant}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setRestaurantMenu(data);
    }
  };

  const addToCart = (menuItem) => {
    setCartItems((prevItems) => [...prevItems, menuItem]);
  };

  const removeFromCart = (menuItem) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.UID !== menuItem.UID));
  };

  const calculateTotalAmount = () => {
    return cartItems.reduce((total, item) => total + parseFloat(item.PRICE), 0);
  };

  const finalizeOrder = async () => {
    const response = await fetch(`http://localhost:8080/deliverers/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setDelivererID(data[0]?.UID || null);

    if (!delivererID) {
      console.error("No deliverer found!");
      return;
    }

    const totalCost = calculateTotalAmount().toFixed(2);

    const order = {
      customer_id: parseInt(customerUID),
      kitchen_id: kitchenID,
      deliverer_id: delivererID,
      total_amount: totalCost,
    };

    const createOrderResponse = await fetch(`http://localhost:8080/order/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify(order),
    });

    if (createOrderResponse.ok) {
      alert(`Thank you for your order! Your total cost is $${totalCost}`);
      console.log("Order created successfully!");
    } else {
      console.error("Error creating order:", await createOrderResponse.text());
    }
  };

  return (
    <div className="order-container">
      <div className="order-box">
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

        {restaurantMenu && (
          <div className="menu-section">
            <h3>Menu</h3>
            {restaurantMenu.map((menuItem) => (
              <div className="menu-item" key={menuItem.UID}>
                {menuItem.FOOD_NAME} - ${menuItem.PRICE}
                <button onClick={() => addToCart(menuItem)}>Add to Cart</button>
              </div>
            ))}
          </div>
        )}

        <div className="cart-section">
          <h3>Cart</h3>
          {cartItems.length > 0 ? (
            <ul>
              {cartItems.map((menuItem) => (
                <li key={menuItem.UID}>
                  {menuItem.FOOD_NAME} - ${menuItem.PRICE}
                  <button className="remove" onClick={() => removeFromCart(menuItem)}>Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Your cart is empty.</p>
          )}
        </div>

        <h3 className="total">Total: ${calculateTotalAmount().toFixed(2)}</h3>
        <button onClick={finalizeOrder}>Finalize Order</button>
      </div>
    </div>
  );
}

export default RestaurantDropdown;
