import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Spinner, Badge, Button, Accordion, Nav } from "react-bootstrap";

// Widgets
import WidgetCaja from "../widgets/WidgetCaja";
import WidgetCalendario from "../widgets/WidgetCalendario";

// Estilos del Widget (Estilos compartidos del listado)
import "../styles/WidgetOrdenes.css";
// Estilos propios del Maquetado de Admin


const AdminOrders = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [estadosLocales, setEstadosLocales] = useState({});
  const [activeKey, setActiveKey] = useState(null);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [fechaFiltro, setFechaFiltro] = useState(new Date());
  
  // Estado de la pestaña de la caja ('dia', 'semana', 'mes')
  const [pestanaCaja, setPestanaCaja] = useState("dia");

  // Escuchar órdenes en tiempo real desde Firestore
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("date", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrdenes(data);
        setCargando(false);
      },
      (error) => {
        console.error("Error al escuchar órdenes:", error);
        setCargando(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Formateadores auxiliares
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

  const obtenerFechaDate = (fechaRaw) => {
    if (!fechaRaw) return null;
    return fechaRaw?.toDate ? fechaRaw.toDate() : new Date(fechaRaw);
  };

  // ==========================================
  // FILTRADOS DINÁMICOS BASADOS EN LA FECHA SELECCIONADA
  // ==========================================

  const ordenesDelDia = ordenes.filter((orden) => {
    const d1 = obtenerFechaDate(orden.createdAt || orden.date);
    const d2 = new Date(fechaFiltro);
    if (!d1 || isNaN(d1.getTime())) return false;

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  });

  const ordenesDeLaSemana = ordenes.filter((orden) => {
    const d1 = obtenerFechaDate(orden.createdAt || orden.date);
    if (!d1 || isNaN(d1.getTime())) return false;

    const refDate = new Date(fechaFiltro);
    const dayOfWeek = refDate.getDay() === 0 ? 6 : refDate.getDay() - 1;
    
    const inicioSemana = new Date(refDate);
    inicioSemana.setDate(refDate.getDate() - dayOfWeek);
    inicioSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    return d1 >= inicioSemana && d1 <= finSemana;
  });

  const ordenesDelMes = ordenes.filter((orden) => {
    const d1 = obtenerFechaDate(orden.createdAt || orden.date);
    const d2 = new Date(fechaFiltro);
    if (!d1 || isNaN(d1.getTime())) return false;

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth()
    );
  });

  // SELECCIÓN DEL PERÍODO ACTIVO
  const ordenesDelPeriodo = 
    pestanaCaja === "semana" ? ordenesDeLaSemana :
    pestanaCaja === "mes" ? ordenesDelMes : 
    ordenesDelDia;

  const ordenesFiltradas = ordenesDelPeriodo.filter((orden) => {
    return filtroEstado === "todos" || getEstadoActual(orden) === filtroEstado;
  });

  const contarPorEstado = (est) => {
    return ordenesDelPeriodo.filter((o) => getEstadoActual(o) === est).length;
  };

  const toggleAccordion = (id) => {
    setActiveKey(activeKey === id ? null : id);
  };

  return (
    <div className="admin-orders-container">
      <header className="admin-orders-header d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="text-white fw-bold m-0">Historial & Control de Pedidos</h1>
          <small className="text-muted">Visualización y gestión operativa en tiempo real</small>
        </div>
        <div className="badge bg-light text-dark border p-2 fs-6">
          <b>Viendo: {pestanaCaja === "semana" ? "Semana Seleccionada" : pestanaCaja === "mes" ? "Mes Seleccionado" : "Día Seleccionado"}</b>
        </div>
      </header>

      <div className="admin-orders-two-columns">
        
        {/* COLUMNA IZQUIERDA: Calendario + Resumen Caja */}
        <div className="columna-izquierda d-flex flex-column gap-3">
          <div className="grid-item widget-1">
            <Accordion defaultActiveKey="0" flush>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Filtro Fecha (Calendario)</Accordion.Header>
                <Accordion.Body className="p-0 pt-2 iqv-compact-calendar">
                  <WidgetCalendario
                    fechaFiltro={fechaFiltro}
                    setFechaFiltro={setFechaFiltro}
                    ordenes={ordenes}
                  />
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>

          <div className="grid-item widget-2">
            <Accordion defaultActiveKey="0" flush>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Resumen de Caja</Accordion.Header>
                <Accordion.Body className="p-0 pt-2">
                  <WidgetCaja
                    todasLasOrdenes={ordenes}
                    ordenesDelDia={ordenesDelDia}
                    ordenesDeLaSemana={ordenesDeLaSemana}
                    ordenesDelMes={ordenesDelMes}
                    fechaSeleccionada={fechaFiltro}
                    pestana={pestanaCaja}
                    setPestana={setPestanaCaja}
                    loading={cargando}
                  />
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        </div>

        {/* COLUMNA DERECHA: Listado Idéntico al Widget */}
        <div className="columna-derecha">
          <div className="grid-item widget-5 p-3 rounded bg-white shadow-sm">
            
            {/* Filtros superiores */}
            <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3 border-bottom pb-2">
              <Nav className="gap-2 align-items-center flex-row flex-wrap">
                <Button
                  size="sm"
                  variant={filtroEstado === "todos" ? "dark" : "outline-secondary"}
                  className="filtro-btn border-0"
                  onClick={() => setFiltroEstado("todos")}
                >
                  Todos <Badge bg="secondary" className="ms-1">{ordenesDelPeriodo.length}</Badge>
                </Button>
                <Button
                  size="sm"
                  variant={filtroEstado === "pedido" ? "warning" : "outline-secondary"}
                  className={`filtro-btn border-0 ${filtroEstado === "pedido" ? "fw-bold" : ""}`}
                  onClick={() => setFiltroEstado("pedido")}
                >
                  Nuevos <Badge bg="dark" className="ms-1">{contarPorEstado("pedido")}</Badge>
                </Button>
                <Button
                  size="sm"
                  variant={filtroEstado === "preparando" ? "info" : "outline-secondary"}
                  className={`filtro-btn border-0 ${filtroEstado === "preparando" ? "fw-bold" : ""}`}
                  onClick={() => setFiltroEstado("preparando")}
                >
                  En Proceso <Badge bg="dark" className="ms-1">{contarPorEstado("preparando")}</Badge>
                </Button>
                <Button
                  size="sm"
                  variant={filtroEstado === "despachado" ? "success" : "outline-secondary"}
                  className={`filtro-btn border-0 ${filtroEstado === "despachado" ? "fw-bold text-white" : ""}`}
                  onClick={() => setFiltroEstado("despachado")}
                >
                  Finalizados <Badge bg="dark" className="ms-1">{contarPorEstado("despachado")}</Badge>
                </Button>
              </Nav>

              <span className="badge bg-secondary text-capitalize" style={{ fontSize: "0.75rem" }}>
                Período: {pestanaCaja}
              </span>
            </div>

            {/* LISTADO IDÉNTICO AL WIDGET */}
            {cargando ? (
              <div className="text-center my-5">
                <Spinner animation="border" variant="dark" />
                <p className="mt-2 text-muted">Cargando órdenes...</p>
              </div>
            ) : ordenesFiltradas.length === 0 ? (
              <div className="text-center py-5 border rounded bg-light">
                <p className="text-muted m-0">No hay órdenes registradas para este período y estado.</p>
              </div>
            ) : (
              <div className="widget-ordenes-container custom-scroll overflow-auto pe-1" style={{ maxHeight: "75vh" }}>
                <Accordion activeKey={activeKey} onSelect={(k) => setActiveKey(k)} className="orden-accordion">
                  {ordenesFiltradas.map((orden) => {
                    const estadoActual = getEstadoActual(orden);
                    const totalOrden = Number(orden.total || 0);

                    return (
                      <div key={orden.id} className="orden-card mb-3">
                        <Accordion.Item eventKey={orden.id} className="orden-accordion-item">
                          
                          <div className="orden-grid-layout">
                            {/* COLUMNA IZQUIERDA */}
                            <div className="grid-col-left">
                              <div className="orden-fecha-hora">
                                <span className="fecha">{formatFecha(orden.createdAt || orden.date)}</span>
                                <span className="hora">{formatHora(orden.createdAt || orden.date)}</span>
                                <div className="orden-id-label">
                                  id: <span className="id-val">#{orden.id ? orden.id.slice(-6) : "------"}</span>
                                </div>
                              </div>


                              <div className="cliente-info mt-1">
                                <span className="cliente-nombre fw-bold">{orden.buyer?.name || "Cliente N/A"}</span>
                                {orden.buyer?.phone && <span className="cliente-telefono text-muted ms-1">({orden.buyer.phone})</span>}
                                {orden.buyer?.email && <div className="cliente-email text-muted small">{orden.buyer.email}</div>}
                              </div>

                              <div className="productos-resumen mt-2">
                                <span className="label-prod">PRODUCTOS ({orden.items?.length || 0})</span>
                              </div>
                            </div>

                            {/* COLUMNA CENTRO: BOTONES DE ESTADO */}
                            <div className="grid-col-center">
                              <span className="estado-label">ESTADO DE LA ORDEN</span>
                              <div className="orden-status-selector">
                                {estados.map((e) => {
                                  const isSelected = estadoActual === e.id;
                                  return (
                                    <button
                                      key={e.id}
                                      type="button"
                                      className={`status-btn ${isSelected ? "active " + e.id : ""}`}
                                      onClick={(evt) => {
                                        evt.stopPropagation();
                                        handleCambiarEstado(orden.id, e.id);
                                      }}
                                    >
                                      {e.label}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Flecha desplegable central */}
                              <div className="desplegar-btn-wrapper text-center mt-2" onClick={() => toggleAccordion(orden.id)}>
                                <i className={`bi bi-chevron-${activeKey === orden.id ? "up" : "down"} toggle-icon`}></i>
                              </div>
                            </div>

                            {/* COLUMNA DERECHA: TOTAL VERDE */}
                            <div className="grid-col-right">
                              <div className="orden-total">${totalOrden.toLocaleString("es-AR")}</div>
                            </div>
                          </div>

                          {/* DESPLIEGUE DE PRODUCTOS */}
                          <Accordion.Body className="p-0 pt-2">
                            <div className="orden-items-container">
                              <ul className="list-unstyled m-0">
                                {orden.items?.map((it, idx) => {
                                  const precioUnitario = Number(it.price || it.precioUnitario || 0);
                                  const subtotal = precioUnitario * it.quantity;
                                  const nombreTamano = it.sizeSeleccionado?.nombre || it.size;
                                  const extrasLista = it.additionalSeleccionados
                                    ? it.additionalSeleccionados.map((a) => a.nombre).join(", ")
                                    : Array.isArray(it.extras)
                                    ? it.extras.join(", ")
                                    : null;

                                  return (
                                    <li key={it.itemKey || `${it.id || "item"}-${idx}`} className="item-row d-flex justify-content-between align-items-center py-1">
                                      <div className="item-detalles">
                                        <span className="item-cant-badge me-2">{it.quantity}x</span>
                                        <span className="item-titulo fw-semibold">{it.title || it.titulo}</span>
                                        {nombreTamano && <span className="item-tamano text-muted ms-1">({nombreTamano})</span>}
                                        {extrasLista && <span className="item-extras text-muted ms-1">+ [{extrasLista}]</span>}
                                      </div>
                                      <span className="item-subtotal fw-bold">${subtotal.toLocaleString("es-AR")}</span>
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
        </div>

      </div>
    </div>
  );
};

export default AdminOrders;