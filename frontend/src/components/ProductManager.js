import React, { useState } from 'react';
import { productAPI } from '../api';

function ProductManager({ products, refreshData }) {
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', quantity_in_stock: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // New state to hold a single product fetched dynamically by ID
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Explicit implementation of getById for Products
  const handleViewDetails = async (id) => {
    try {
      const response = await productAPI.getById(id);
      setSelectedProduct(response.data);
      setEditingId(null); // Close edit form if open
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to fetch standalone product details.' });
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(null); // Close view panel if open
    setEditingId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity_in_stock: product.quantity_in_stock
    });
    window.scrollTo(0, 0);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', sku: '', price: '', quantity_in_stock: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      if (editingId) {
        await productAPI.update(editingId, formData);
        setMessage({ type: 'success', text: 'Product updated successfully!' });
      } else {
        await productAPI.create(formData);
        setMessage({ type: 'success', text: 'Product added successfully!' });
      }
      
      handleCancelEdit();
      refreshData();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.detail || 'Failed to save product. Ensure SKU is unique.' 
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        setMessage({ type: 'success', text: 'Product deleted successfully!' });
        if (selectedProduct?.id === id) setSelectedProduct(null); // Clear panel if deleted
        refreshData();
      } catch (error) {
        setMessage({ type: 'danger', text: 'Failed to delete product.' });
      }
    }
  };

  return (
    <div className="row">
      {/* LEFT COLUMN: View Details OR Edit Form OR Add Form */}
      <div className="col-md-4 mb-4">
        {selectedProduct ? (
          /* Single Product Details Card (getById) */
          <div className="card shadow-sm border-info">
            <div className="card-header bg-info text-white fw-bold d-flex justify-content-between align-items-center">
              <span>📦 Product Blueprint</span>
              <button className="btn btn-sm btn-light py-0 px-2 text-info fw-bold" onClick={() => setSelectedProduct(null)}>Close</button>
            </div>
            <div className="card-body bg-light">
              <p className="mb-1 text-muted text-uppercase small fw-bold">Internal DB ID</p>
              <p className="fw-mono text-secondary">#PROD-{selectedProduct.id}</p>

              <p className="mb-1 text-muted text-uppercase small fw-bold">SKU Code</p>
              <p><span className="badge bg-secondary fs-6">{selectedProduct.sku}</span></p>
              
              <p className="mb-1 text-muted text-uppercase small fw-bold">Item Name</p>
              <h5 className="fw-bold text-dark">{selectedProduct.name}</h5>
              
              <div className="row mt-3">
                <div className="col-6">
                  <p className="mb-1 text-muted text-uppercase small fw-bold">Unit Price</p>
                  <h5 className="text-success fw-bold">${selectedProduct.price.toFixed(2)}</h5>
                </div>
                <div className="col-6">
                  <p className="mb-1 text-muted text-uppercase small fw-bold">Stock Count</p>
                  <h5 className={selectedProduct.quantity_in_stock < 5 ? 'text-danger fw-bold' : 'text-dark fw-bold'}>
                    {selectedProduct.quantity_in_stock} units
                  </h5>
                </div>
              </div>
              
              <button className="btn btn-sm btn-outline-secondary w-100 mt-4" onClick={() => setSelectedProduct(null)}>
                Back to Creation Form
              </button>
            </div>
          </div>
        ) : (
          /* Add / Edit Form */
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white fw-bold">
              {editingId ? '✏️ Edit Product' : '➕ Add New Product'}
            </div>
            <div className="card-body bg-light">
              {message.text && <div className={`alert alert-${message.type} py-2`}>{message.text}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary">Product Name</label>
                  <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary">SKU / Code</label>
                  <input type="text" className="form-control" name="sku" value={formData.sku} onChange={handleChange} required disabled={editingId !== null} />
                </div>
                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label fw-bold text-secondary">Price ($)</label>
                    <input type="number" step="0.01" min="0.01" className="form-control" name="price" value={formData.price} onChange={handleChange} required />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label fw-bold text-secondary">Quantity</label>
                    <input type="number" min="0" className="form-control" name="quantity_in_stock" value={formData.quantity_in_stock} onChange={handleChange} required />
                  </div>
                </div>
                
                <div className="d-grid gap-2">
                  <button type="submit" className={`btn ${editingId ? 'btn-warning' : 'btn-success'} fw-bold`}>
                    {editingId ? 'Update Product' : 'Save Product'}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-outline-secondary" onClick={handleCancelEdit}>Cancel</button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: The Inventory Table */}
      <div className="col-md-8">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
            <h5 className="fw-bold text-secondary">Current Inventory ({products.length})</h5>
          </div>
          <div className="card-body">
            {products.length === 0 ? (
              <p className="text-muted text-center py-4">No products in inventory.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>SKU</th>
                      <th>Name</th>
                      <th>Stock</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className={selectedProduct?.id === product.id ? 'table-info' : ''}>
                        <td><code>{product.sku}</code></td>
                        <td className="fw-bold">{product.name}</td>
                        <td>
                          <span className={product.quantity_in_stock < 5 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                            {product.quantity_in_stock}
                          </span>
                        </td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-info me-1" onClick={() => handleViewDetails(product.id)}>
                            View
                          </button>
                          <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEditClick(product)}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(product.id)}>
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

export default ProductManager;