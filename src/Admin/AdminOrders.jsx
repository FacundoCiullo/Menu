// src/components/admin/AdminOrders.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Table, Spinner, Accordion } from "react-bootstrap";

const AdminOrders = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerOrdenes = async () => {
      try {
        const q = query(collection(db, "orders"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrdenes(data);
      } catch (error) {
        console.error("Error al obtener las órdenes:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerOrdenes();
  }, []);

  if (cargando) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="dark" />
        <p>Cargando órdenes...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2>Gestión de Pedidos</h2>
        <p className="text-muted">Órdenes recibidas en la tienda</p>
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Total</th>
            <th>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map((orden, index) => (
            <tr key={orden.id}>
              <td>{index + 1}</td>
              <td>{orden.date || "Sin fecha"}</td>
              <td>{orden.buyer?.name || "N/A"}</td>
              <td>{orden.buyer?.email || "N/A"}</td>
              <td>{orden.buyer?.phone || "N/A"}</td>
              <td>${orden.total?.toLocaleString("es-AR") || "0"}</td>
              <td>
                <Accordion>
                  <Accordion.Item eventKey={orden.id}>
                    <Accordion.Header>Ver detalle</Accordion.Header>
                    <Accordion.Body>
                      {orden.items?.length > 0 ? (
                        <ul className="mb-2 list-unstyled">
                          {orden.items.map((item) => (
                            <li
                              key={item.id}
                              className="d-flex justify-content-between align-items-center border-bottom py-2"
                            >
                              <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
                                <span className="fw-bold">{item.title}</span>
                                <div className="d-flex gap-3 text-muted small">
                                  {item.color && <span>Color: {item.color}</span>}
                                  {item.talle && <span>Talle: {item.talle}</span>}
                                </div>
                              </div>

                              <div className="text-end">
                                x{item.quantity} — ${item.price * item.quantity}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>Sin productos.</p>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminOrders;