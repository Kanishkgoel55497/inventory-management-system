import React from 'react';

function Dashboard({ products, customers, orders }) {
  // Define low stock threshold as anything strictly under 5 units
  const lowStockProducts = products.filter(p => p.quantity_in_stock < 5);

  return (
    <div>
      <h2 className="mb-4 text-secondary">System Summary Dashboard</h2>
      
      {/* Metric Cards Layout */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card shadow-sm bg-primary text-white border-0 h-100">
            <div className="card-body text-center py-4">
              <h6 className="text-uppercase mb-2 text-white-50">Total Products</h6>
              <h2 className="display-4 fw-bold">{products.length}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card shadow-sm bg-success text-white border-0 h-100">
            <div className="card-body text-center py-4">
              <h6 className="text-uppercase mb-2 text-white-50">Total Customers</h6>
              <h2 className="display-4 fw-bold">{customers.length}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm bg-info text-white border-0 h-100">
            <div className="card-body text-center py-4">
              <h6 className="text-uppercase mb-2 text-white-50">Total Orders</h6>
              <h2 className="display-4 fw-bold">{orders.length}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm bg-danger text-white border-0 h-100">
            <div className="card-body text-center py-4">
              <h6 className="text-uppercase mb-2 text-white-50">Low Stock Items</h6>
              <h2 className="display-4 fw-bold">{lowStockProducts.length}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Stock Warning List */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-warning text-dark fw-bold">
          ⚠️ Critical Action Needed: Low Stock Alerts (&lt; 5 items left)
        </div>
        <div className="card-body p-0">
          {lowStockProducts.length === 0 ? (
            <div className="p-4 text-center text-muted">
              All inventory levels are looking healthy! No low stock items detected.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product Name</th>
                    <th>SKU / Code</th>
                    <th>Current Price</th>
                    <th className="text-center">Stock Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map(product => (
                    <tr key={product.id} className="table-danger">
                      <td className="fw-bold">{product.name}</td>
                      <td><code>{product.sku}</code></td>
                      <td>${product.price.toFixed(2)}</td>
                      <td className="text-center fw-bold text-danger">{product.quantity_in_stock} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;