import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './OrderPage.css';

function OrderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || 'Guest';

  const [cart, setCart] = useState([]);

  const foodItems = [
    { id: 1, name: 'Pizza', price: 10 },
    { id: 2, name: 'Gyro', price: 8 },
    { id: 3, name: 'Burger', price: 12 },
    { id: 4, name: 'Salad', price: 6 },
  ];

  // Add an item to the cart or increment its quantity if it already exists
  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Decrement the quantity of an item in the cart or remove it if quantity is 0
  const removeFromCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem?.quantity > 1) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      );
    } else {
      setCart(cart.filter((cartItem) => cartItem.id !== item.id));
    }
  };

  // Calculate the total price
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="order-page">
      <header>
        <h2>Welcome, {username}!</h2>
      </header>
      <h3>Menu</h3>
      <ul className="food-list">
        {foodItems.map((item) => (
          <li key={item.id}>
            <span>{item.name} - ${item.price}</span>
            <button onClick={() => addToCart(item)}>+</button>
            <button onClick={() => removeFromCart(item)}>-</button>
          </li>
        ))}
      </ul>
      <h3>Cart</h3>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul className="cart-list">
          {cart.map((item) => (
            <li key={item.id}>
              <span>
                {item.name} - {item.quantity}x (${item.price * item.quantity})
              </span>
              <button onClick={() => addToCart(item)}>+</button>
              <button onClick={() => removeFromCart(item)}>-</button>
            </li>
          ))}
        </ul>
      )}
      <h3>Total: ${calculateTotal()}</h3>
      <footer>
        <button onClick={() => navigate('/')} className="back-home">
          Back to Home
        </button>
      </footer>
    </div>
  );
}

export default OrderPage;
