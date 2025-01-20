import React, { useState, useEffect } from 'react';

const token = localStorage.getItem('token');
const customerUID = localStorage.getItem('uid');

function RestaurantDropdown() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurantMenu, setRestaurantMenu] = useState(null);
  const [cartItems, setCartItems] = useState([]); // Add state to store cart items
  const [kitchenID, setKitchenID] = useState(null); // Add state to store kitchen ID
  const [delivererID, setDelivererID] = useState(null); // Add state to store deliverer ID

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
    setRestaurantMenu(null); // Reset menu when a new restaurant is selected
    setCartItems([]); // Reset cart items when a new restaurant is selected
    setKitchenID(selectedRestaurant.UID); // Update kitchen ID based on selected restaurant
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

  // Function to remove item from cart
  const removeFromCart = (menuItem) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.UID !== menuItem.UID));
  };

  const displayCart = () => {
    if (cartItems.length > 0) {
      return (
        <div>
          <h3>Cart Items</h3>
          <ul>
            {cartItems.map((menuItem) => (
              <li key={menuItem.UID}>
                {menuItem.FOOD_NAME} - {menuItem.PRICE}
                <button onClick={() => removeFromCart(menuItem)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      );
    } else {
      return <p>Your cart is empty.</p>;
    }
  };

  const calculateTotalAmount = () => {
    let total = 0;
    cartItems.forEach((item) => (total += parseFloat(item.PRICE)));
    return total;
  };

  const finalizeOrder = async () => {
    const response = await fetch(`http://localhost:8080/deliverers/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    const firstDeliverer = data[0].UID;
    setDelivererID(firstDeliverer);
    const order = {
      customer_id: parseInt(customerUID),
      kitchen_id: kitchenID,
      deliverer_id: delivererID,
      total_amount: calculateTotalAmount(),
    };
    console.log(JSON.stringify(order));
    const createOrderResponse = await fetch(`http://localhost:8080/order/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, 
      },
      body: JSON.stringify(order),
    });

    if (createOrderResponse.ok) {
      // Handle successful order creation (e.g., display success message)
      console.log("Order created successfully!");
    } else {
      // Handle error (e.g., display error message)
      console.error("Error creating order:", await createOrderResponse.text());
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
          {restaurantMenu.map((menuItem) => (
            <div key={menuItem.UID}>
              {menuItem.FOOD_NAME} - {menuItem.PRICE}
              <button onClick={() => addToCart(menuItem)}>Add to Cart</button>
            </div>
          ))}
        </div>
      )}

      {displayCart()}

      <button onClick={finalizeOrder}>Finalize Order</button>
    </div>
  );
}

export default RestaurantDropdown;