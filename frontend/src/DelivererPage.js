import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DelivererPage.css';

function DelivererPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
    <div className="Deliverer-Page">
      <h4>My Orders</h4>
      <ul>
        {orders.map((order) => {
          const orderDate = new Date(order.ORDER_DATE);
          const formattedDate = orderDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
          });

          return (
            <li key={order.ORDER_ID}> 
              <p>Order ID: {order.ORDER_ID}</p>
              <p>Order Date: {formattedDate}</p>
              <p>Status: {order.STATUS}</p>
              <p>Total Amount: {order.TOTAL_AMOUNT}</p>
            </li>
          );
        })}
      </ul>
      <button onClick={() => navigate('/login')} className="back-button">
        Back
      </button>
    </div>
  );
}

export default DelivererPage;