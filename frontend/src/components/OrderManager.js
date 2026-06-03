import React, { useState } from 'react';
import { orderAPI } from '../api';

function OrderManager({ orders, products, customers, refreshData }) {
  const [formData, setFormData] = useState({ customer_id: '', product_id: '', quantity: 1 });
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // New state to hold individual order context fetched by ID
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseInt(e.target.value) || e.target.value });
  };

  const getCustomerName = (id) => customers.find(c => c.id === id)?.full_name || `Unknown (ID: ${id})`;
  const getProductName = (id) => products.find(p => p.id === id)?.name || `Unknown (ID: ${id})`;

  // Uses getById to fetch a single standalone order record
  const handleViewDetails = async (id) => {
    try {
      const response = await orderAPI.getById(id);
      setSelectedOrder(response.data);
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({ type: 'danger', text: 'Could not fetch order invoice breakdown.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!formData.customer_id || !formData.product_id) {
      setMessage({ type: 'danger', text: 'Please select both a customer and a product.' });
      return;
    }

    try {
      await orderAPI.create(formData);
      setMessage({ type: 'success', text: '🛒 Order placed successfully! Stock updated.' });
      setFormData({ customer_id: '', product_id: '', quantity: 1 });
      refreshData();
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data?.detail || 'Failed to place order.' });
    }
  };

  const handleCancelOrder = async (id) => {
    if (window.confirm('Are you sure you want to cancel this order? This will restore product stock levels.')) {
      try {
        await orderAPI.delete(id);
        setMessage({ type: 'success', text: 'Order cancelled and stock restored.' });
        if (selectedOrder?.id === id) setSelectedOrder(null); // Clear detailed panel if cancelled
        refreshData();
      } catch (error) {
        setMessage({ type: 'danger', text: 'Failed to cancel order.' });
      }
    }
  };

  return (
    <div className="row">
      {/* LEFT COLUMN: Create Order OR Specific Order Invoice View */}
      <div className="col-md-4 mb-4">
        {selectedOrder ? (
          /* Single Order Detailed Invoice Widget (getById Implementation) */
          <div className="card shadow-sm border-dark">
            <div className="card-header bg-dark text-white fw-bold d-flex justify-content-between align-items-center">
              <span>🧾 Invoice Breakdown</span>
              <button className="btn btn-sm btn-outline-light py-0 px-2" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
            <div className="card-body bg-light">
              <div className="text-center mb-3">
                <span className="badge bg-secondary p-2 fs-6">#ORD-{selectedOrder.id}</span>
              </div>
              <hr />
              <div className="mb-2">
                <span className="text-muted d-block small font-uppercase">Billed To:</span>
                <strong className="text-dark">{getCustomerName(selectedOrder.customer_id)}</strong>
              </div>
              <div className="mb-2">
                <span className="text-muted d-block small font-uppercase">Item Description:</span>
                <strong className="text-dark">{getProductName(selectedOrder.product_id)}</strong>
              </div>
              <div className="mb-2">
                <span className="text-muted d-block small font-uppercase">Units Purchased:</span>
                <span className="badge bg-dark">{selectedOrder.quantity} units</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center bg-white p-2 rounded border border-dashed">
                <span className="fw-bold text-secondary">Total Paid:</span>
                <h4 className="mb-0 fw-bold text-success">${selectedOrder.total_amount.toFixed(2)}</h4>
              </div>
              <button className="btn btn-sm btn-secondary w-100 mt-4" onClick={() => setSelectedOrder(null)}>
                Back to New Order Form
              </button>
            </div>
          </div>
        ) : (
          /* Default Order Entry Form */
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white fw-bold">🛍️ Place New Order</div>
            <div className="card-body bg-light">
              {message.text && <div className={`alert alert-${message.type} py-2`}>{message.text}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary">Select Customer</label>
                  <select className="form-select" name="customer_id" value={formData.customer_id} onChange={handleChange} required>
                    <option value="">-- Choose Customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary">Select Product</label>
                  <select className="form-select" name="product_id" value={formData.product_id} onChange={handleChange} required>
                    <option value="">-- Choose Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id} disabled={p.quantity_in_stock <= 0}>
                        {p.name} - ${p.price.toFixed(2)} ({p.quantity_in_stock} available)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary">Quantity</label>
                  <input type="number" min="1" className="form-control" name="quantity" value={formData.quantity} onChange={handleChange} required />
                </div>

                <button type="submit" className="btn btn-info text-white w-100 fw-bold">Place Order</button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Orders Table Log */}
      <div className="col-md-8">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            <h5 className="fw-bold text-secondary">Order Fulfillment Logs ({orders.length})</h5>
          </div>
          <div className="card-body">
            {orders.length === 0 ? (
              <p className="text-muted text-center py-4">No orders placed yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Total Amount</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className={selectedOrder?.id === order.id ? 'table-secondary' : ''}>
                        <td><code>#ORD-{order.id}</code></td>
                        <td className="fw-bold">{getCustomerName(order.customer_id)}</td>
                        <td className="text-success fw-bold">${order.total_amount.toFixed(2)}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleViewDetails(order.id)}>
                            View
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancelOrder(order.id)}>
                            Cancel
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

export default OrderManager;