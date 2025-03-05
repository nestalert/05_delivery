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
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedQuantities, setSelectedQuantities] = useState({});
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

  const incrementQuantity = (menuItem) => {
    const key = buildKey(menuItem);
    setSelectedQuantities((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1,
    }));
  };

  const addToCart = (menuItem) => {
    const key = buildKey(menuItem);
    const quantity = selectedQuantities[key] || 0; //Selected quality
  
    if (quantity === 0) return;
  
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.key === key);
      if (existingItem) {
        return prevItems.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [...prevItems, { ...menuItem, quantity, key }];
      }
    });
  
    setSelectedQuantities((prev) => ({ ...prev, [key]: 0 })); //Reset selected quality
  };
  

  const removeFromCart = (menuItem) => {
    const key = buildKey(menuItem);
    const quantity = selectedQuantities[key] || 0;
    setSelectedQuantities((prev) => ({
      ...prev,
      [key]: Math.max((prev[key] || 0) - 1, 0),
    }));
    if(quantity===0){
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );}
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
    const randomIndex = Math.floor(Math.random() * (data.length));
    console.log("Data length:", data.length);
    console.log("Random index:", randomIndex);
    const firstDelivererData = data[randomIndex];
    const firstDeliverer = firstDelivererData.UID;

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
                      <span>{selectedQuantities[buildKey(menuItem)] || 0}</span>
                      <button onClick={() => incrementQuantity(menuItem)}>+</button>
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
