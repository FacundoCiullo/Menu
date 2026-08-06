import React, { useState } from "react";
import { FaLocationDot, FaCreditCard } from "react-icons/fa6";
import { Spinner, Badge, Button, Accordion, Nav } from "react-bootstrap";
import "../styles/WidgetOrdenes.css";

const WidgetOrdenes = ({ ordenes = [], loading, onUpdateStatus }) => {
  const [estadosLocales, setEstadosLocales] = useState({});
  const [filtroActivo, setFiltroActivo] = useState("todos");

  // Helper para convertir cualquier formato de fecha de Firestore / JS a objeto Date
  const obtenerFechaDate = (fechaRaw) => {
    if (!fechaRaw) return null;
    return fechaRaw?.toDate ? fechaRaw.toDate() : new Date(fechaRaw);
  };

  const formatFecha = (dateInput) => {
    if (!dateInput) return "DD/MM/AAAA";
    const date = dateInput?.toDate ? dateInput.toDate() : new Date(dateInput);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatHora = (dateInput) => {
    if (!dateInput) return "00:00";
    const date = dateInput?.toDate ? dateInput.toDate() : new Date(dateInput);
    return date.toLocaleTimeString("es-AR", {
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

  const handleCambiarEstado = (ordenId, nuevoEstado) => {
    setEstadosLocales((prev) => ({ ...prev, [ordenId]: nuevoEstado }));
    if (onUpdateStatus) {
      onUpdateStatus(ordenId, nuevoEstado);
    }
  };

  // Resuelve el estado actual priorizando estado local, status o estado de BD.
  const getEstadoActual = (orden) => {
    const estadoBD = orden.status || orden.estado;
    const estadoResuelto = estadosLocales[orden.id] || estadoBD || "pedido";

    return estadoResuelto === "pendiente" ? "pedido" : estadoResuelto;
  };

  // Ordenar de más reciente a más antigua
  const ordenesOrdenadas = [...ordenes].sort((a, b) => {
    const fechaA = obtenerFechaDate(a.createdAt || a.date);
    const fechaB = obtenerFechaDate(b.createdAt || b.date);

    const timeA = fechaA && !isNaN(fechaA.getTime()) ? fechaA.getTime() : 0;
    const timeB = fechaB && !isNaN(fechaB.getTime()) ? fechaB.getTime() : 0;

    return timeB - timeA;
  });

  const ordenesFiltradas = ordenesOrdenadas.filter((orden) => {
    if (filtroActivo === "todos") return true;
    return getEstadoActual(orden) === filtroActivo;
  });

  const contarPorEstado = (est) => {
    return ordenes.filter((o) => getEstadoActual(o) === est).length;
  };

  return (
    <div className="d-flex flex-column h-100">
      {/* Header Widget */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <h5 className="fw-bold m-0">Órdenes en Tiempo Real</h5>
          <small className="text-muted">Se actualiza automáticamente</small>
        </div>
        <Badge bg="danger" className="p-2 px-3 rounded-pill fw-semibold">
          EN VIVO
        </Badge>
      </div>

      {/* Barra de Filtros */}
      <div className="mb-3 border-bottom pb-2">
        <Nav className="gap-1 align-items-center justify-content-center flex-row flex-nowrap">
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

      {/* Listado de Órdenes */}
      {loading ? (
        <div className="text-center my-auto">
          <Spinner animation="border" variant="dark" />
        </div>
      ) : ordenesFiltradas.length === 0 ? (
        <p className="text-muted text-center my-auto py-4">
          No hay pedidos en esta categoría.
        </p>
      ) : (
        <div className="flex-grow-1 custom-scroll overflow-auto pe-1" style={{ maxHeight: "580px" }}>
          <Accordion className="orden-accordion">
            {ordenesFiltradas.map((orden) => {
              const estadoActual = getEstadoActual(orden);

              // Obtención del método de pago
              const metodoPago =
                orden.buyer?.paymentMethod ||
                orden.comprador?.paymentMethod ||
                orden.paymentMethod ||
                orden.metodoPago ||
                orden.medioPago ||
                "Efectivo";

              return (
                <div key={orden.id} className="orden-card mb-3">
                  <Accordion.Item eventKey={orden.id} className="orden-accordion-item border-0 bg-transparent">
                    
                    {/* Estructura Grid Principal de la Tarjeta */}
                    <div className="orden-grid-layout">
                      
                      {/* Columna Izquierda */}
                      <div className="grid-col-left">
                        <div className="orden-fecha-hora">
                          <span className="fecha">{formatFecha(orden.createdAt || orden.date)}</span>
                          <span className="hora">{formatHora(orden.createdAt || orden.date)}</span>
                          <div className="orden-id">
                            id: #{orden.id ? orden.id.slice(-6) : "------"}
                          </div>
                        </div>

                        <div className="cliente-info">
                          <span className="cliente-nombre">{orden.buyer?.name || "Cliente"}</span>
                          
                          <div className="cliente-email">
                            {orden.buyer?.email || "Sin email"}
                          </div>

                          {/* Teléfono y Dirección alineados al lado */}
                          <div className="d-flex align-items-center gap-2 flex-wrap text-muted small mt-1">
                            {orden.buyer?.phone && (
                              <span className="cliente-telefono fw-semibold">({orden.buyer.phone})</span>
                            )}

                            <span className="cliente-direccion">
                              <FaLocationDot className="me-1" />
                              {orden.buyer?.address || (orden.buyer?.deliveryType === 'takeaway' ? 'Retiro por local' : 'Sin dirección')}
                            </span>
                          </div>

                          {/* Método de pago debajo */}
                          <div className="cliente-metodo-pago text-muted small mt-1">
                            <FaCreditCard className="me-1 text-secondary" />
                            <strong>Pago:</strong> <span className="text-capitalize">{metodoPago}</span>
                          </div>
                        </div>

                        {/* Título/Label de Productos */}
                        <div className="orden-items-title mt-2">
                          PRODUCTOS ({orden.items?.length || 0})
                        </div>
                      </div>

                      {/* Columna Central: Estado y Botón de Acordeón */}
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

                        {/* Trigger Desplegable */}
                        <div className="orden-accordion-trigger">
                          <Accordion.Header />
                        </div>
                      </div>

                      {/* Columna Derecha: Total de la orden */}
                      <div className="grid-col-right">
                        <div className="orden-total">
                          ${Number(orden.total || 0).toLocaleString("es-AR")}
                        </div>
                      </div>
                    </div>

                    {/* Cuerpo desplegable del Acordeón (Detalle de Ítems) */}
                    <Accordion.Body className="p-0">
                      <div className="orden-items-container">
                        <ul className="orden-items-list">
                          {orden.items?.map((it, idx) => {
                            const sizeObj = it.sizeSeleccionado || it.size;
                            const nombreTamaño = typeof sizeObj === 'object' && sizeObj !== null
                              ? (sizeObj.nombre || sizeObj.title || '')
                              : sizeObj;

                            const rawAdicionales = it.additionalSeleccionados || it.adicionales || it.extras;
                            let listaAdicionales = null;

                            if (Array.isArray(rawAdicionales) && rawAdicionales.length > 0) {
                              listaAdicionales = rawAdicionales
                                .map((a) => (typeof a === 'object' && a !== null ? (a.nombre || a.title || '') : a))
                                .filter(Boolean)
                                .join(", ");
                            }

                            const cantidad = Number(it.quantity || it.cantidad || 1);
                            const precioUnitario = Number(it.price || it.precioUnitario || it.precio || 0);

                            return (
                              <li key={it.itemKey || idx} className="orden-item-row">
                                <div className="orden-item-inline-details">
                                  <span className="badge-qty">{cantidad} x</span>
                                  <span className="orden-item-titulo">{it.title || it.titulo}</span>

                                  {nombreTamaño ? (
                                    <span className="orden-item-meta"> Tamaño: {nombreTamaño}</span>
                                  ) : null}

                                  {listaAdicionales ? (
                                    <span className="orden-item-meta"> Extras: ({listaAdicionales})</span>
                                  ) : null}
                                </div>
                                <span className="orden-item-precio">
                                  ${(precioUnitario * cantidad).toLocaleString("es-AR")}
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

export default WidgetOrdenes;