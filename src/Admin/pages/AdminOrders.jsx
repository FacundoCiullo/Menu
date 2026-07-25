// src/components/admin/AdminOrders.jsx
import React, { useEffect, useState } from "react";
import { db } from "../../firebase/";
import { collection, getDocs, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { Spinner, Badge, Button, Accordion, Nav } from "react-bootstrap";
import "../styles/WidgetOrdenes.css";


const AdminOrders = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [estadosLocales, setEstadosLocales] = useState({});
  const [filtroActivo, setFiltroActivo] = useState("todos");

  // Llamado a la base de datos (se mantiene tu lógica idéntica)
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

  // Formateadores de fecha y hora
  const formatFecha = (dateInput) => {
    if (!dateInput) return "DD/MM/AAAA";
    const date = dateInput?.toDate ? dateInput.toDate() : new Date(dateInput);
    return isNaN(date.getTime())
      ? String(dateInput).slice(0, 10)
      : date.toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  };

  const formatHora = (dateInput) => {
    if (!dateInput) return "00:00";
    const date = dateInput?.toDate ? dateInput.toDate() : new Date(dateInput);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
  };

  const estados = [
    { id: "pedido", label: "Pedido" },
    { id: "preparando", label: "Preparando" },
    { id: "despachado", label: "Despachado" },
  ];

  // Actualizador de estado (actualiza localmente y en Firestore opcionalmente)
  const handleCambiarEstado = async (ordenId, nuevoEstado) => {
    setEstadosLocales((prev) => ({ ...prev, [ordenId]: nuevoEstado }));
    try {
      const orderRef = doc(db, "orders", ordenId);
      await updateDoc(orderRef, { status: nuevoEstado });
    } catch (error) {
      console.error("Error al actualizar estado en Firestore:", error);
    }
  };

  const getEstadoActual = (orden) => {
    return estadosLocales[orden.id] || orden.status || "pedido";
  };

  const ordenesFiltradas = ordenes.filter((orden) => {
    if (filtroActivo === "todos") return true;
    return getEstadoActual(orden) === filtroActivo;
  });

  const contarPorEstado = (est) => {
    return ordenes.filter((o) => getEstadoActual(o) === est).length;
  };

  return (
    <div className="container-fluid my-4">
      {/* Header Widget */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold m-0">Gestión de Pedidos</h2>
          <small className="text-muted">Órdenes recibidas en la tienda</small>
        </div>
        <Badge bg="danger" className="p-2 px-3 rounded-pill fw-semibold">
          EN VIVO
        </Badge>
      </div>

      {/* Barra de Filtros estilo Widget */}
      <div className="mb-4 border-bottom pb-3">
        <Nav variant="pills" className="gap-2 align-items-center justify-content-start">
          <Button
            size="sm"
            variant={filtroActivo === "todos" ? "dark" : "outline-secondary"}
            className="filtro-btn border-0"
            onClick={() => setFiltroActivo("todos")}
          >
            Todos <Badge bg="secondary" className="ms-1">{ordenes.length}</Badge>
          </Button>
          <Button
            size="sm"
            variant={filtroActivo === "pedido" ? "warning" : "outline-secondary"}
            className={`filtro-btn border-0 ${filtroActivo === "pedido" ? "fw-bold" : ""}`}
            onClick={() => setFiltroActivo("pedido")}
          >
            Nuevos <Badge bg="dark" className="ms-1">{contarPorEstado("pedido")}</Badge>
          </Button>
          <Button
            size="sm"
            variant={filtroActivo === "preparando" ? "info" : "outline-secondary"}
            className={`filtro-btn border-0 ${filtroActivo === "preparando" ? "fw-bold" : ""}`}
            onClick={() => setFiltroActivo("preparando")}
          >
            En Proceso <Badge bg="dark" className="ms-1">{contarPorEstado("preparando")}</Badge>
          </Button>
          <Button
            size="sm"
            variant={filtroActivo === "despachado" ? "success" : "outline-secondary"}
            className={`filtro-btn border-0 ${filtroActivo === "despachado" ? "fw-bold text-white" : ""}`}
            onClick={() => setFiltroActivo("despachado")}
          >
            Finalizados <Badge bg="dark" className="ms-1">{contarPorEstado("despachado")}</Badge>
          </Button>
        </Nav>
      </div>

      {/* Estados de Carga y Vacío */}
      {cargando ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="dark" />
          <p className="mt-2 text-muted">Cargando órdenes...</p>
        </div>
      ) : ordenesFiltradas.length === 0 ? (
        <div className="text-center py-5 border rounded bg-light">
          <p className="text-muted m-0">No hay órdenes registradas en esta categoría.</p>
        </div>
      ) : (
        /* Listado estilo Widget (Grid + Accordion) */
        <div className="custom-scroll overflow-auto pe-1">
          <Accordion className="orden-accordion">
            {ordenesFiltradas.map((orden) => {
              const estadoActual = getEstadoActual(orden);
              const totalOrden = Number(orden.total || 0);

              return (
                <div key={orden.id} className="orden-card mb-3">
                  
                  {/* Estructura Grid Principal */}
                  <div className="orden-grid-layout">
                    
                    {/* Columna Izquierda: Fecha, Hora, Cliente, Teléfono e Email */}
                    <div className="grid-col-left">
                      <div className="orden-fecha-hora">
                        <span className="fecha">{formatFecha(orden.createdAt || orden.date)}</span>
                        <span className="hora">{formatHora(orden.createdAt || orden.date)}</span>
                      </div>
                      <div className="cliente-info">
                        <span className="cliente-nombre">{orden.buyer?.name || "Cliente N/A"}</span>
                        {orden.buyer?.phone && (
                          <span className="cliente-telefono">({orden.buyer.phone})</span>
                        )}
                      </div>
                      <div className="cliente-email">
                        {orden.buyer?.email || "Sin email"}
                      </div>
                    </div>

                    {/* Columna Central: Status Selector */}
                    <div className="grid-col-center">
                      <div className="orden-estado-label">ESTADO DE LA ORDEN</div>
                      <div className="orden-status-selector">
                        {estados.map((e) => {
                          const isSelected = estadoActual === e.id;
                          return (
                            <button
                              key={e.id}
                              type="button"
                              className={`pill-status ${isSelected ? `active-${e.id}` : ""}`}
                              onClick={() => handleCambiarEstado(orden.id, e.id)}
                            >
                              {e.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Columna Derecha: ID, Total y Trigger de Acordeón */}
                    <div className="grid-col-right">
                      <div className="orden-id">
                        id: #{orden.id ? orden.id.slice(-6) : "------"}
                      </div>
                      <div className="orden-total">
                        ${totalOrden.toLocaleString("es-AR")}
                      </div>
                      <div className="orden-accordion-trigger">
                        <Accordion.Item eventKey={orden.id} className="orden-accordion-item">
                          <Accordion.Header />
                        </Accordion.Item>
                      </div>
                    </div>

                  </div>

                  {/* Detalle Desplegable de Ítems */}
                  <Accordion.Item eventKey={orden.id} className="border-0 bg-transparent">
                    <Accordion.Body className="p-0">
                      <div className="orden-items-container">
                        <div className="orden-items-title">
                          PRODUCTOS ({orden.items?.length || 0})
                        </div>
                        <ul className="orden-items-list">
                          {orden.items?.map((it, idx) => {
                            const precioUnitario = Number(it.price || it.precioUnitario || 0);
                            const subtotal = precioUnitario * it.quantity;

                            // Extraer Tamaño
                            const nombreTamano = it.sizeSeleccionado?.nombre || it.size;

                            // Extraer Adicionales / Extras
                            const extrasLista = it.additionalSeleccionados
                              ? it.additionalSeleccionados.map((a) => a.nombre).join(", ")
                              : Array.isArray(it.extras)
                              ? it.extras.join(", ")
                              : null;

                            const itemKey = it.itemKey || `${it.id || "item"}-${idx}`;

                            return (
                              <li key={itemKey} className="orden-item-row">
                                <div className="orden-item-inline-details">
                                  <span className="badge-qty">{it.quantity} x</span>
                                  <span className="orden-item-titulo">{it.title || it.titulo}</span>

                                  {nombreTamano && (
                                    <span className="orden-item-meta"> Tamaño: {nombreTamano}</span>
                                  )}

                                  {extrasLista && (
                                    <span className="orden-item-meta"> Extras: ({extrasLista})</span>
                                  )}

                                  {it.color && (
                                    <span className="orden-item-meta"> Color: {it.color}</span>
                                  )}

                                  {it.talle && (
                                    <span className="orden-item-meta"> Talle: {it.talle}</span>
                                  )}
                                </div>
                                <span className="orden-item-precio">
                                  ${subtotal.toLocaleString("es-AR")}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>

                </div>
              );
            })}
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;