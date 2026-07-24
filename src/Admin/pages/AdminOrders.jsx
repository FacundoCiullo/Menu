// src/components/admin/AdminOrders.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../firebase/";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Table, Spinner, Accordion, Badge } from "react-bootstrap";

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
        <p className="mt-2 text-muted">Cargando órdenes...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid my-4">
      <div className="mb-4">
        <h2>Gestión de Pedidos</h2>
        <p className="text-muted">Órdenes recibidas en la tienda</p>
      </div>

      {ordenes.length === 0 ? (
        <div className="text-center py-5 border rounded bg-light">
          <p className="text-muted m-0">No hay órdenes registradas aún.</p>
        </div>
      ) : (
        <Table striped bordered hover responsive align="middle">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>ID Orden</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Total</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((orden, index) => {
              const totalOrden = Number(orden.total || 0);

              return (
                <tr key={orden.id}>
                  <td>{index + 1}</td>
                  <td className="font-monospace text-muted small">
                    #{orden.id ? orden.id.slice(-6) : "------"}
                  </td>
                  <td>{orden.date || "Sin fecha"}</td>
                  <td className="fw-semibold">{orden.buyer?.name || "N/A"}</td>
                  <td>{orden.buyer?.email || "N/A"}</td>
                  <td>{orden.buyer?.phone || "N/A"}</td>
                  <td className="fw-bold text-success">
                    ${totalOrden.toLocaleString("es-AR")}
                  </td>
                  <td>
                    <Accordion>
                      <Accordion.Item eventKey={orden.id} className="border-0">
                        <Accordion.Header>Ver detalle</Accordion.Header>
                        <Accordion.Body className="p-2">
                          {orden.items?.length > 0 ? (
                            <ul className="mb-0 list-unstyled">
                              {orden.items.map((item, idx) => {
                                const precioUnitario = Number(item.price || item.precioUnitario || 0);
                                const subtotal = precioUnitario * item.quantity;

                                // Extraer Tamaño
                                const nombreTamano = item.sizeSeleccionado?.nombre || item.size;

                                // Extraer Adicionales
                                const extrasLista = item.additionalSeleccionados
                                  ? item.additionalSeleccionados.map((a) => a.nombre).join(", ")
                                  : Array.isArray(item.extras)
                                  ? item.extras.join(", ")
                                  : null;

                                const itemKey = item.itemKey || `${item.id || "item"}-${idx}`;

                                return (
                                  <li
                                    key={itemKey}
                                    className="d-flex justify-content-between align-items-start border-bottom py-2"
                                  >
                                    <div className="d-flex flex-column gap-1">
                                      <div className="d-flex align-items-center gap-2">
                                        <Badge bg="dark">{item.quantity}x</Badge>
                                        <span className="fw-bold">{item.title || item.titulo}</span>
                                      </div>

                                      {/* Detalles de Opciones */}
                                      <div className="d-flex flex-wrap gap-2 text-muted small ps-4">
                                        {nombreTamano && (
                                          <span>
                                            <strong>Tamaño:</strong> {nombreTamano}
                                          </span>
                                        )}
                                        {extrasLista && (
                                          <span>
                                            <strong>Extras:</strong> {extrasLista}
                                          </span>
                                        )}
                                        {item.color && (
                                          <span>
                                            <strong>Color:</strong> {item.color}
                                          </span>
                                        )}
                                        {item.talle && (
                                          <span>
                                            <strong>Talle:</strong> {item.talle}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="text-end text-nowrap fw-semibold">
                                      ${subtotal.toLocaleString("es-AR")}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="text-muted small m-0">Sin productos especificados.</p>
                          )}
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default AdminOrders;