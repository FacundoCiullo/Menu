import React, { useState } from "react";
import { Spinner, Badge, Button, Accordion, Nav } from "react-bootstrap";
import "../styles/WidgetOrdenes.css";

const WidgetOrdenes = ({ ordenes = [], loading, onUpdateStatus }) => {
  const [estadosLocales, setEstadosLocales] = useState({});
  const [filtroActivo, setFiltroActivo] = useState("todos");

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
        <div className="flex-grow-1 custom-scroll overflow-auto pe-1" style={{ maxHeight: "580px" }}>
          <Accordion className="orden-accordion">
            {ordenesFiltradas.map((orden) => {
              const estadoActual = getEstadoActual(orden);

              return (
                <div key={orden.id} className="orden-card mb-3">
                  
                  {/* Estructura Grid Principal de la Tarjeta */}
                  <div className="orden-grid-layout">
                    
                    {/* Columna Izquierda: Fecha, Cliente, Teléfono e Email */}
                    <div className="grid-col-left">
                      <div className="orden-fecha-hora">
                        <span className="fecha">{formatFecha(orden.createdAt || orden.date)}</span>
                        <span className="hora">{formatHora(orden.createdAt || orden.date)}</span>
                      </div>
                      <div className="cliente-info">
                        <span className="cliente-nombre">{orden.buyer?.name || "Cliente"}</span>
                        {orden.buyer?.phone && (
                          <span className="cliente-telefono">({orden.buyer.phone})</span>
                        )}
                      </div>
                      <div className="cliente-email">
                        {orden.buyer?.email || "Sin email"}
                      </div>
                    </div>

                    {/* Columna Central: Label y Pills de Estado */}
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

                    {/* Columna Derecha: ID, Total y Disparador de Acordeón */}
                    <div className="grid-col-right">
                      <div className="orden-id">
                        id: #{orden.id ? orden.id.slice(-6) : "------"}
                      </div>
                      <div className="orden-total">
                        ${Number(orden.total || 0).toLocaleString("es-AR")}
                      </div>
                      <div className="orden-accordion-trigger">
                        <Accordion.Item eventKey={orden.id} className="orden-accordion-item">
                          <Accordion.Header />
                        </Accordion.Item>
                      </div>
                    </div>

                  </div>

                  {/* Cuerpo desplegable del Acordeón (Detalle de Ítems) */}
                  <Accordion.Item eventKey={orden.id} className="border-0 bg-transparent">
                    <Accordion.Body className="p-0">
                      <div className="orden-items-container">
                        <div className="orden-items-title">
                          ITEMS ({orden.items?.length || 0})
                        </div>
                        <ul className="orden-items-list">
                          {orden.items?.map((it, idx) => {
                            const nombreTamaño = it.sizeSeleccionado?.nombre || it.size;
                            const listaAdicionales = it.additionalSeleccionados
                              ? it.additionalSeleccionados.map((a) => a.nombre).join(", ")
                              : Array.isArray(it.extras)
                              ? it.extras.join(", ")
                              : null;

                            const precioUnitario = Number(it.price || it.precioUnitario || 0);

                            return (
                              <li key={it.itemKey || idx} className="orden-item-row">
                                <div className="orden-item-inline-details">
                                  <span className="badge-qty">{it.quantity} x</span>
                                  <span className="orden-item-titulo">{it.title || it.titulo}</span>

                                  {nombreTamaño && (
                                    <span className="orden-item-meta"> Tamaño: {nombreTamaño}</span>
                                  )}

                                  {listaAdicionales && (
                                    <span className="orden-item-meta"> Extras: ({listaAdicionales})</span>
                                  )}
                                </div>
                                <span className="orden-item-precio">
                                  ${(precioUnitario * it.quantity).toLocaleString("es-AR")}
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