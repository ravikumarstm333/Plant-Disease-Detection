import React, { useEffect, useState } from 'react';
import { ordersAPI } from '../../services/api';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    ordersAPI.getMyOrders().then((res) => setOrders(res.data.orders || []));
  }, []);

  return (
    <div className="page">
      <h2>Orders</h2>
      {orders.map((o) => (
        <div key={o._id} style={{ border: '1px solid #ddd', marginBottom: 8, padding: 10 }}>
          <p>{o.vegetableName}</p>
          <p>Qty: {o.quantityKg} kg</p>
          <p>Total: {o.totalPrice}</p>
          <p>Status: {o.orderStatus}</p>
        </div>
      ))}
    </div>
  );
};

export default OrdersPage;
