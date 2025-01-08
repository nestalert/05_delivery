import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  const handlePlaceOrder = () => {
    navigate('/order');
  };

  const handleModifyInformation = () => {
    navigate('/modify');
  };

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <button onClick={handlePlaceOrder}>Place Order</button>
      <button onClick={handleModifyInformation}>Modify Information</button>
    </div>
  );
}

export default HomePage;