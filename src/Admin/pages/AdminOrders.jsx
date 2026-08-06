import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Spinner, Badge, Button, Accordion, Nav } from "react-bootstrap";
import { FaLocationDot, FaCreditCard } from "react-icons/fa6";

// Widgets
import WidgetCaja from "../widgets/WidgetCaja";
import WidgetCalendario from "../widgets/WidgetCalendario";

// Estilos compartidos del Widget
import "../styles/WidgetOrdenes.css";

const AdminOrders = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [estadosLocales, setEstadosLocales] = useState({});

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [fechaFiltro, setFechaFiltro] = useState(new Date());

  // Estado de la pestaña de la caja ('dia', 'semana', 'mes')
  const [pestanaCaja, setPestanaCaja] = useState("dia");

  // Helper para convertir cualquier formato de fecha de Firestore / JS a objeto Date
  const obtenerFechaDate = (fechaRaw) => {
    if (!fechaRaw) return null;
    return fechaRaw?.toDate ? fechaRaw.toDate() : new Date(fechaRaw);
  };

  // Escuchar órdenes en tiempo real desde Firestore y ordenar por fecha/hora descendente
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("date", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Ordenar localmente por timestamp descendente (más reciente arriba)
        const ordenadas = data.sort((a, b) => {
          const fechaA = obtenerFechaDate(a.createdAt || a.date);
          const fechaB = obtenerFechaDate(b.createdAt || b.date);

          const timeA = fechaA && !isNaN(fechaA.getTime()) ? fechaA.getTime() : 0;
          const timeB = fechaB && !isNaN(fechaB.getTime()) ? fechaB.getTime() : 0;

          return timeB - timeA;
        });

        setOrdenes(ordenadas);
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
      ? "00:00"
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

  // Normalización de estado (Soporte "pendiente" -> "pedido")
  const getEstadoActual = (orden) => {
    const estadoBD = orden.status || orden.estado;
    const estadoResuelto = estadosLocales[orden.id] || estadoBD || "pedido";
    return estadoResuelto === "pendiente" ? "pedido" : estadoResuelto;
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
    pestanaCaja === "semana"
      ? ordenesDeLaSemana
      : pestanaCaja === "mes"
      ? ordenesDelMes
      : ordenesDelDia;

  const ordenesFiltradas = ordenesDelPeriodo.filter((orden) => {
    return filtroEstado === "todos" || getEstadoActual(orden) === filtroEstado;
  });

  const contarPorEstado = (est) => {
    return ordenesDelPeriodo.filter((o) => getEstadoActual(o) === est).length;
  };

  return (
    <div className="admin-orders-container">
      {/* Header Admin */}
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
            {/* Barra de Filtros */}
            <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3 border-bottom pb-2">
              <Nav className="gap-1 align-items-center justify-content-center flex-row flex-nowrap">
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

            {/* Listado de Órdenes */}
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
              <div className="custom-scroll overflow-auto pe-1" style={{ maxHeight: "75vh" }}>
                <Accordion className="orden-accordion">
                  {ordenesFiltradas.map((orden) => {
                    const estadoActual = getEstadoActual(orden);

                    // Método de pago resuelto
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

                              {/* Trigger Desplegable Bootstrap */}
                              <div className="orden-accordion-trigger">
                                <Accordion.Header />
                              </div>
                            </div>

                            {/* Columna Derecha: Total */}
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
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;