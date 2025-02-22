import { useNavigate } from 'react-router-dom';
import './CustomerPage.css';

function DeliveryPage() {
  const navigate = useNavigate();

  const handlePlaceOrder = () => {
    navigate('/order');
  };

  const handleModifyInformation = () => {
    navigate('/modify');
  };

  return (
    <div className="container">
      <h1>Welcome to the Delivery Page</h1>
      <button onClick={handlePlaceOrder}>Place Order</button>
      <button onClick={handleModifyInformation}>Modify Information</button>
    </div>
  );
}

export default DeliveryPage;
