import React, { useState } from "react";
import { Spinner, Badge, Button, Accordion, Nav } from "react-bootstrap";
import "../styles/WidgetOrdenes.css";

const WidgetOrdenes = ({ ordenes = [], loading, onUpdateStatus }) => {
  const [estadosLocales, setEstadosLocales] = useState({});
  const [filtroActivo, setFiltroActivo] = useState("todos");

  // Formateador para Día-Mes-Año
  const formatFecha = (dateInput) => {
    if (!dateInput) return "DD/MM/AAAA";
    const date = dateInput?.toDate ? dateInput.toDate() : new Date(dateInput);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Formateador para Hora 24hs
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
        <Nav variant="pills" className="gap-1 align-items-center justify-content-center">
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
        <div className="flex-grow-1 pe-2 custom-scroll" style={{ maxHeight: "580px", overflowY: "auto" }}>
          <Accordion className="orden-accordion">
            {ordenesFiltradas.map((orden) => {
              const estadoActual = getEstadoActual(orden);

              return (
                <div key={orden.id} className="orden-card p-3 mb-3 rounded-3 shadow-sm">
                  
                  {/* FILA 1: Fecha/Hora | Label Estado | ID de Orden */}
                  <div className="row align-items-center text-muted small mb-1">
                    <div className="col-4">
                      <span className="fw-semibold text-dark me-2">
                        {formatFecha(orden.createdAt || orden.date)}
                      </span>
                      <span>{formatHora(orden.createdAt || orden.date)}</span>
                    </div>
                    <div className="col-4 text-center">
                      <span className="text-uppercase fw-bold" style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}>
                        ESTADO DE LA ORDEN
                      </span>
                    </div>
                    <div className="col-4 text-end font-monospace">
                      id: #{orden.id.slice(-6)}
                    </div>
                  </div>

                  {/* FILA 2: Nombre + Teléfono | Pills de Estado | Total */}
                  <div className="row align-items-center py-1">
                    <div className="col-4">
                      <span className="fw-bold fs-6 text-dark d-inline me-2">
                        {orden.buyer?.name || "Cliente"}
                      </span>
                      {orden.buyer?.phone && (
                        <small className="text-secondary">({orden.buyer.phone})</small>
                      )}
                    </div>

                    <div className="col-4 text-center">
                      <div className="d-inline-flex gap-1 bg-light p-1 rounded-pill border">
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

                    <div className="col-4 text-end">
                      <span className="fs-4 fw-bold text-success lh-1">
                        ${orden.total?.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>

                  {/* FILA 3: Email - Dirección | Botón Flecha Acordeón */}
                  <div className="row align-items-center text-muted small mt-1">
                    <div className="col-10">
                      <span>{orden.buyer?.email || "Sin email"}</span>
                      {orden.buyer?.address && (
                        <span> — {orden.buyer.address}</span>
                      )}
                    </div>

                    <div className="col-2 text-end">
                      <Accordion.Item eventKey={orden.id} className="border-0 bg-transparent d-inline-block">
                        <Accordion.Header />
                      </Accordion.Item>
                    </div>
                  </div>

                  {/* CONTENIDO DEL ACORDEÓN (Detalles del Pedido) */}
                  <Accordion.Item eventKey={orden.id} className="border-0 bg-transparent">
                    <Accordion.Body className="p-3">
                      <div className="fw-bold mb-2 text-uppercase text-muted" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                        ITEMS ({orden.items?.length || 0})
                      </div>
                      <ul className="list-unstyled m-0">
                        {orden.items?.map((it, idx) => (
                          <li key={idx} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                            <div>
                              <span className="badge-qty me-2">{it.quantity}x</span>
                              <span className="fw-bold text-dark">{it.title}</span>
                              
                              {(it.size || (it.extras && it.extras.length > 0)) && (
                                <div className="text-muted ps-4" style={{ fontSize: "0.8rem" }}>
                                  {it.size && <span>Tamaño: {it.size} </span>}
                                  {it.extras && <span>({it.extras.join(", ")})</span>}
                                </div>
                              )}
                            </div>
                            <span className="fw-bold text-dark">
                              ${(it.price * it.quantity).toLocaleString("es-AR")}
                            </span>
                          </li>
                        ))}
                      </ul>
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