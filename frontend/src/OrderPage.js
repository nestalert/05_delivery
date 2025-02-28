import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigate = useNavigate();
  const MainMenu = () => {
    navigate('/customer');
  };

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
    const selected = restaurants.find(
      (restaurant) => restaurant.UNAME === event.target.value
    );
    setSelectedRestaurant(selected.UNAME);
    setRestaurantMenu(null);
    setCartItems([]);
    setKitchenID(selected.UID);
  };

  const handleSubmit = async () => {
    if (selectedRestaurant) {
      const response = await fetch(
        `http://localhost:8080/menu/${selectedRestaurant}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setRestaurantMenu(data);
    }
  };

  // Build a unique key based on properties that differentiate items
  const buildKey = (menuItem) => {
    return `${menuItem.UID}-${menuItem.FOOD_NAME}-${menuItem.PRICE}`;
  };

  const addToCart = (menuItem) => {
    const key = buildKey(menuItem);
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.key === key);
      if (existingItem) {
        // Increase quantity if exactly the same item exists
        return prevItems.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new entry if item is different
        return [...prevItems, { ...menuItem, quantity: 1, key }];
      }
    });
  };

  const removeFromCart = (menuItem) => {
    const key = buildKey(menuItem);
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const calculateTotalAmount = () => {
    return cartItems.reduce(
      (total, item) => total + parseFloat(item.PRICE) * item.quantity,
      0
    );
  };

  const finalizeOrder = async () => {
    // Fetch deliverer information
    const response = await fetch(`http://localhost:8080/deliverers/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    const firstDeliverer = data[0]?.UID;
    setDelivererID(firstDeliverer);

    const order = {
      customer_id: parseInt(customerUID),
      kitchen_id: kitchenID,
      deliverer_id: firstDeliverer,
      total_amount: calculateTotalAmount(),
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
      setTotalAmount(calculateTotalAmount());
      setOrderConfirmed(true);
      console.log("Order created successfully!");
    } else {
      console.error("Error creating order:", await createOrderResponse.text());
    }
  };

  const resetOrder = () => {
    setOrderConfirmed(false);
    setSelectedRestaurant(null);
    setRestaurantMenu(null);
    setCartItems([]);
    setTotalAmount(0);
  };

  return (
    <div className="order-container">
      {orderConfirmed ? (
        <div className="confirmation-message">
          <h2>Thank you for your order!</h2>
          <p>
            Your total cost is <strong>${totalAmount.toFixed(2)}</strong>.
          </p>
          <button className="back" onClick={resetOrder}>
            Back
          </button>
          <button className="Home" onClick={resetOrder && MainMenu}>
          Home
          </button>
        </div>
      ) : (
        <>
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
              {restaurantMenu.map((menuItem) => {
                const key = buildKey(menuItem);
                // Determine current quantity in cart (if any) for this particular menu item.
                const currentQuantity =
                  cartItems.find((item) => item.key === key)?.quantity || 0;
                return (
                  <div key={key} className="menu-item">
                    <span>
                      {menuItem.FOOD_NAME} - ${menuItem.PRICE}
                    </span>
                    <div className="quantity-controls">
                      <button onClick={() => removeFromCart(menuItem)}>-</button>
                      <span>{currentQuantity}</span>
                      <button onClick={() => addToCart(menuItem)}>+</button>
                    </div>
                    <button onClick={() => addToCart(menuItem)}>Add to Cart</button>
                  </div>
                );
              })}
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="cart-section">
              <h3>Cart Items</h3>
              <ul>
                {cartItems.map((menuItem) => (
                  <li key={menuItem.key}>
                    {menuItem.FOOD_NAME} x{menuItem.quantity} - $
                    {(menuItem.PRICE * menuItem.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
              <h3 className="total">
                Total: ${calculateTotalAmount().toFixed(2)}
              </h3>
              <button onClick={finalizeOrder}>Finalize Order</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RestaurantDropdown;
