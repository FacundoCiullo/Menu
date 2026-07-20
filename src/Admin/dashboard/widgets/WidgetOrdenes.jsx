import React from "react";
import { Table, Accordion, Spinner, Badge } from "react-bootstrap";

const WidgetOrdenes = ({ ordenes = [], loading }) => {
  return (
    <div className="d-flex flex-column h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-bold m-0">Órdenes en Tiempo Real</h5>
          <small className="text-muted">Se actualiza automáticamente</small>
        </div>
        <Badge bg="danger" className="p-2">
          EN VIVO
        </Badge>
      </div>

      {loading ? (
        <div className="text-center my-auto">
          <Spinner animation="border" variant="dark" />
        </div>
      ) : ordenes.length === 0 ? (
        <p className="text-muted text-center my-auto">No hay órdenes aún.</p>
      ) : (
        <div className="table-responsive flex-grow-1" style={{ maxHeight: "350px", overflowY: "auto" }}>
          <Table hover align="middle" className="m-0">
            <thead className="table-light sticky-top">
              <tr>
                <th>Cliente</th>
                <th>Total</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.id}>
                  <td>
                    <div className="fw-bold">{orden.buyer?.name || "Cliente"}</div>
                    <small className="text-muted">{orden.buyer?.email || "Sin email"}</small>
                  </td>
                  <td className="fw-bold text-success">
                    ${orden.total?.toLocaleString("es-AR")}
                  </td>
                  <td>
                    <Accordion flush>
                      <Accordion.Item eventKey={orden.id}>
                        <Accordion.Header>Items ({orden.items?.length || 0})</Accordion.Header>
                        <Accordion.Body className="p-2">
                          <ul className="list-unstyled m-0 small">
                            {orden.items?.map((it, idx) => (
                              <li key={idx} className="border-bottom py-1 d-flex justify-content-between">
                                <span>{it.title} (x{it.quantity})</span>
                                <span className="fw-bold">${it.price * it.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default WidgetOrdenes;