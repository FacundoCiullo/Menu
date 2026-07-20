import React, { useState } from "react";
import { Spinner, Nav } from "react-bootstrap";

const WidgetCaja = ({ todasLasOrdenes = [], ordenesDelDia = [], loading = false }) => {
  const [pestana, setPestana] = useState("dia"); // 'dia', 'semana', 'mes'

  if (loading) {
    return (
      <div className="py-4 text-center">
        <Spinner animation="border" size="sm" variant="success" />
      </div>
    );
  }

  // 1. Elegimos qué lista de órdenes usar según la pestaña
  let ordenesAProcesar = [];

  if (pestana === "dia") {
    // Usa exactamente el mismo array que le funciona a 'Órdenes Recientes' y 'Top 5'
    ordenesAProcesar = ordenesDelDia;
  } else {
    // Para semana/mes usamos todasLasOrdenes y un filtro básico
    const hoy = new Date();
    ordenesAProcesar = todasLasOrdenes.filter((orden) => {
      if (!orden.date) return false;
      const f = orden.date.toDate ? orden.date.toDate() : new Date(orden.date);

      if (pestana === "semana") {
        const haceSieteDias = new Date();
        haceSieteDias.setDate(hoy.getDate() - 7);
        return f >= haceSieteDias;
      }
      if (pestana === "mes") {
        return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
      }
      return true;
    });
  }

  // 2. Sumamos totales y clasificamos (EFECTIVO POR DEFAULT)
  let totalCaja = 0;
  let efectivo = 0;
  let digital = 0;

  ordenesAProcesar.forEach((orden) => {
    const monto = Number(orden.total || 0);
    totalCaja += monto;

    const metodo = String(orden.paymentMethod || orden.metodoPago || "").toLowerCase();

    // Si dice explícitamente MP / Digital / Tarjeta / Transferencia va a Digital, sino TODO A EFECTIVO
    if (
      metodo.includes("mp") ||
      metodo.includes("digital") ||
      metodo.includes("tarjeta") ||
      metodo.includes("transferencia")
    ) {
      digital += monto;
    } else {
      efectivo += monto; // Default
    }
  });

  return (
    <div className="widget-caja-container">
      {/* PESTAÑAS */}
      <Nav
        variant="pills"
        activeKey={pestana}
        onSelect={(selectedKey) => setPestana(selectedKey)}
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
          {pestana === "dia" && "Ingresos del Día"}
          {pestana === "semana" && "Últimos 7 días"}
          {pestana === "mes" && "Acumulado del Mes"}
        </span>
        <h2 className="fw-bold text-success m-0">
          ${totalCaja.toLocaleString("es-AR")}
        </h2>
        <small className="text-muted" style={{ fontSize: "0.75rem" }}>
          {ordenesAProcesar.length} {ordenesAProcesar.length === 1 ? "pedido" : "pedidos"}
        </small>
      </div>

      {/* DESGLOSE EFECTIVO (DEFAULT) Y DIGITAL */}
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