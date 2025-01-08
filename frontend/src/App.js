import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import CreateAccountPage from './CreateAccountPage';
import OrderPage from './OrderPage';
import CustomerPage from './CustomerPage';
import ModifyPage from './ModifyPage';
import DelivererPage from './DelivererPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/modify" element={<ModifyPage />} />
          <Route path="/deliverer" element={<DelivererPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
