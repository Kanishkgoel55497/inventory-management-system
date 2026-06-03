import React, { useState, useEffect } from 'react';
import { productAPI, customerAPI, orderAPI } from './api';
import Dashboard from './components/Dashboard';
import ProductManager from './components/ProductManager';
import CustomerManager from './components/CustomerManager';
import OrderManager from './components/OrderManager';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  // Fetch all core data globally so any view can access it up-to-date
  const fetchData = async () => {
    try {
      const [prodRes, custRes, ordRes] = await Promise.all([
        productAPI.getAll(),
        customerAPI.getAll(),
        orderAPI.getAll(),
      ]);
      setProducts(prodRes.data);
      setCustomers(custRes.data);
      setOrders(ordRes.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data from backend server.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]); // Refresh data whenever user switches views

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow">
        <div className="container">
          <span className="navbar-brand fw-bold text-info">📦 IMS Pro</span>
          <div className="navbar-nav ms-auto">
            <button 
              className={`nav-link btn px-3 mx-1 ${activeTab === 'dashboard' ? 'active text-info fw-bold' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-link btn px-3 mx-1 ${activeTab === 'products' ? 'active text-info fw-bold' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Products
            </button>
            <button 
              className={`nav-link btn px-3 mx-1 ${activeTab === 'customers' ? 'active text-info fw-bold' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              Customers
            </button>
            <button 
              className={`nav-link btn px-3 mx-1 ${activeTab === 'orders' ? 'active text-info fw-bold' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="container mb-5">
        {error && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center">
            <span>{error}</span>
            <button className="btn btn-sm btn-outline-danger" onClick={fetchData}>Retry Connection</button>
          </div>
        )}

        {/* Dynamic Component Rendering */}
        {activeTab === 'dashboard' && (
          <Dashboard products={products} customers={customers} orders={orders} />
        )}
        {activeTab === 'products' && (
          <ProductManager products={products} refreshData={fetchData} />
        )}
        {activeTab === 'customers' && (
          <CustomerManager customers={customers} refreshData={fetchData} />
        )}
        {activeTab === 'orders' && (
          <OrderManager orders={orders} products={products} customers={customers} refreshData={fetchData} />
        )}
      </div>
    </div>
  );
}

export default App;