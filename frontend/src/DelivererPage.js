import React, { useState, useEffect } from 'react';

function DelivererPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');

      try {
        const response = await fetch(`http://localhost:8080/order/3/` + parseInt(uid), {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); 
        setOrders(data); 
      } catch (error) {
        console.error("Error fetching order data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (orders.length === 0) {
    return <div>No orders found for this deliverer.</div>;
  }

  return (
    <div>
      <h2>My Orders</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.ORDER_ID}> 
            <p>Order ID: {order.ORDER_ID}</p>
            <p>Order Date: {order.ORDER_DATE}</p>
            <p>Status: {order.STATUS}</p>
            <p>Total Amount: {order.TOTAL_AMOUNT}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DelivererPage;