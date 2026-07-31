import React from "react";
import { Spinner, Nav } from "react-bootstrap";

const WidgetCaja = ({ 
  todasLasOrdenes = [], 
  ordenesDelDia = [], 
  ordenesDeLaSemana = [], 
  ordenesDelMes = [], 
  fechaSeleccionada = new Date(),
  pestana = "dia",
  setPestana,
  loading = false 
}) => {

  if (loading) {
    return (
      <div className="py-4 text-center">
        <Spinner animation="border" size="sm" variant="success" />
      </div>
    );
  }

  // Selección de la lista de órdenes a procesar según la pestaña compartida
  let ordenesAProcesar = [];

  if (pestana === "dia") {
    ordenesAProcesar = ordenesDelDia;
  } else if (pestana === "semana") {
    ordenesAProcesar = ordenesDeLaSemana;
  } else if (pestana === "mes") {
    ordenesAProcesar = ordenesDelMes;
  }

  // Sumamos totales y clasificamos
  let totalCaja = 0;
  let efectivo = 0;
  let digital = 0;

  ordenesAProcesar.forEach((orden) => {
    const monto = Number(orden.total || 0);
    totalCaja += monto;

    const metodo = String(orden.paymentMethod || orden.metodoPago || "").toLowerCase();

    if (
      metodo.includes("mp") ||
      metodo.includes("digital") ||
      metodo.includes("tarjeta") ||
      metodo.includes("transferencia")
    ) {
      digital += monto;
    } else {
      efectivo += monto;
    }
  });

  const fechaObj = new Date(fechaSeleccionada);
  const nombreMes = fechaObj.toLocaleDateString("es-AR", { month: "long", year: "numeric" });

  return (
    <div className="widget-caja-container">
      {/* PESTAÑAS */}
      <Nav
        variant="pills"
        activeKey={pestana}
        onSelect={(selectedKey) => setPestana && setPestana(selectedKey)}
        className="nav-justified mb-2 bg-light p-1 rounded"
        style={{ fontSize: "0.78rem" }}
      >
        <Nav.Item>
          <Nav.Link eventKey="dia" className="py-1 px-2">
            Día
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="semana" className="py-1 px-2">
            Semana
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="mes" className="py-1 px-2">
            Mes
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* TOTAL ACUMULADO */}
      <div className="text-center my-2">
        <span className="text-muted small d-block">
          {pestana === "dia" && `Ingresos del Día (${fechaObj.toLocaleDateString("es-AR")})`}
          {pestana === "semana" && "Semana de la fecha seleccionada"}
          {pestana === "mes" && `Acumulado de ${nombreMes}`}
        </span>
        <h2 className="fw-bold text-success m-0">
          ${totalCaja.toLocaleString("es-AR")}
        </h2>
        <small className="text-muted" style={{ fontSize: "0.75rem" }}>
          {ordenesAProcesar.length} {ordenesAProcesar.length === 1 ? "pedido" : "pedidos"}
        </small>
      </div>

      {/* DESGLOSE EFECTIVO Y DIGITAL */}
      <div className="pt-2 border-top d-flex justify-content-between align-items-center gap-2">
        <div className="bg-light p-2 rounded flex-fill text-center">
          <span className="d-block text-muted" style={{ fontSize: "0.7rem" }}>
            💵 Efectivo
          </span>
          <strong className="text-dark fs-7">
            ${efectivo.toLocaleString("es-AR")}
          </strong>
        </div>

        <div className="bg-light p-2 rounded flex-fill text-center">
          <span className="d-block text-muted" style={{ fontSize: "0.7rem" }}>
            💳 Digital / MP
          </span>
          <strong className="text-dark fs-7">
            ${digital.toLocaleString("es-AR")}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default WidgetCaja;