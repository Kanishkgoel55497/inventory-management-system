import React, { useState } from 'react';
import { customerAPI } from '../api';

function CustomerManager({ customers, refreshData }) {
  const [formData, setFormData] = useState({ full_name: '', email: '', phone_number: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // New state to hold a single customer fetched by ID
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Uses getById to fetch a single customer's up-to-date data
  const handleViewDetails = async (id) => {
    try {
      const response = await customerAPI.getById(id);
      setSelectedCustomer(response.data);
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to retrieve specific customer records.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      await customerAPI.create(formData);
      setMessage({ type: 'success', text: 'Customer added successfully!' });
      setFormData({ full_name: '', email: '', phone_number: '' });
      refreshData();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.detail || 'Failed to add customer. Ensure email is unique.' 
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerAPI.delete(id);
        setMessage({ type: 'success', text: 'Customer removed successfully!' });
        if (selectedCustomer?.id === id) setSelectedCustomer(null); // Clear detailed view if deleted
        refreshData();
      } catch (error) {
        setMessage({ type: 'danger', text: 'Failed to delete customer.' });
      }
    }
  };

  return (
    <div className="row">
      {/* LEFT COLUMN: Form OR Single Customer Details View */}
      <div className="col-md-4 mb-4">
        {selectedCustomer ? (
          /* Single Customer Detail Card (getById Implementation) */
          <div className="card shadow-sm border-info">
            <div className="card-header bg-info text-white fw-bold d-flex justify-content-between align-items-center">
              <span>📋 Customer Profile</span>
              <button className="btn btn-sm btn-light py-0 px-2 text-info fw-bold" onClick={() => setSelectedCustomer(null)}>Close</button>
            </div>
            <div className="card-body bg-light">
              <p className="mb-1 text-muted text-uppercase small fw-bold">Customer ID</p>
              <p className="fw-mono text-secondary">#CUST-{selectedCustomer.id}</p>
              
              <p className="mb-1 text-muted text-uppercase small fw-bold">Full Name</p>
              <h5 className="fw-bold text-dark">{selectedCustomer.full_name}</h5>
              
              <p className="mb-1 text-muted text-uppercase small fw-bold mt-3">Email Address</p>
              <p className="text-primary">{selectedCustomer.email}</p>
              
              <p className="mb-1 text-muted text-uppercase small fw-bold mt-3">Phone Line</p>
              <p className="text-dark fw-bold">{selectedCustomer.phone_number}</p>
              
              <button className="btn btn-sm btn-outline-secondary w-100 mt-3" onClick={() => setSelectedCustomer(null)}>
                Back to Registration Form
              </button>
            </div>
          </div>
        ) : (
          /* Default Add Customer Form */
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white fw-bold">👤 Add New Customer</div>
            <div className="card-body bg-light">
              {message.text && <div className={`alert alert-${message.type} py-2`}>{message.text}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary">Full Name</label>
                  <input type="text" className="form-control" name="full_name" value={formData.full_name} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary">Email Address</label>
                  <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary">Phone Number</label>
                  <input type="text" className="form-control" name="phone_number" value={formData.phone_number} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn btn-success w-100 fw-bold">Save Customer</button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Customer Table */}
      <div className="col-md-8">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            <h5 className="fw-bold text-secondary">Registered Customers ({customers.length})</h5>
          </div>
          <div className="card-body">
            {customers.length === 0 ? (
              <p className="text-muted text-center py-4">No customers registered yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id} className={selectedCustomer?.id === customer.id ? 'table-info' : ''}>
                        <td className="fw-bold">{customer.full_name}</td>
                        <td>{customer.email}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleViewDetails(customer.id)}>
                            View
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(customer.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerManager;