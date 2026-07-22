// src/components/WidgetOrders.jsx
import React from "react";

const WidgetOrders = ({ order }) => {
  if (!order) return null;

  return (
    <div className="card p-3 my-3 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="m-0">Orden #{order.id}</h5>
        <span className="badge bg-secondary">{order.date}</span>
      </div>

      <p className="mb-1"><strong>Cliente:</strong> {order.buyer?.name}</p>
      <p className="mb-1"><strong>Teléfono:</strong> {order.buyer?.phone}</p>
      <p className="mb-3"><strong>Email:</strong> {order.buyer?.email}</p>

      <h6>Productos:</h6>
      <ul className="list-group list-group-flush mb-3">
        {order.items?.map((item, idx) => (
          <li key={idx} className="list-group-item d-flex justify-content-between align-items-center px-0">
            <div>
              <strong>{item.title}</strong> x {item.quantity}
              
              {/* VARIABLE REFLEJADA EN LA ORDEN */}
              {item.variable && (
                <div className="small text-muted">
                  Opción: {item.variable.nombre} (${item.variable.precio})
                </div>
              )}
            </div>
            
            <span className="fw-bold">
              ${(item.price || 0) * item.quantity}
            </span>
          </li>
        ))}
      </ul>

      <div className="text-end fw-bold fs-5">
        Total: ${order.total}
      </div>
    </div>
  );
};

export default WidgetOrders;