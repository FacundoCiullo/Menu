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

  // Helper para parsear cualquier tipo de número o string con formato
  const parsearMonto = (valor) => {
    if (typeof valor === "number") return isNaN(valor) ? 0 : valor;
    if (typeof valor === "string") {
      const limpio = valor.replace(/[^0-9.-]/g, "");
      const num = parseFloat(limpio);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  // Sumamos totales y clasificamos por método de pago
  let totalCaja = 0;
  let efectivo = 0;
  let transferencia = 0;
  let digital = 0;

  ordenesAProcesar.forEach((orden) => {
    const monto = parsearMonto(
      orden.total ?? orden.monto ?? orden.totalAmount ?? orden.precioTotal ?? 0
    );
    
    totalCaja += monto;

    // Extraemos el método de pago buscando tanto en la raíz como dentro de buyer/comprador
    const metodo = String(
      orden.buyer?.paymentMethod ||
      orden.comprador?.paymentMethod ||
      orden.paymentMethod ||
      orden.metodoPago ||
      orden.medioPago ||
      orden.formaPago ||
      ""
    ).toLowerCase();

    if (
      metodo.includes("transferencia") ||
      metodo.includes("transf") ||
      metodo.includes("cbu") ||
      metodo.includes("alias") ||
      metodo.includes("banco")
    ) {
      transferencia += monto;
    } else if (
      metodo.includes("mp") ||
      metodo.includes("mercado") ||
      metodo.includes("digital") ||
      metodo.includes("tarjeta") ||
      metodo.includes("débito") ||
      metodo.includes("crédito")
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

      {/* DESGLOSE EFECTIVO, TRANSFERENCIA Y OTROS DIGITALES */}
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
            🏦 Transferencia
          </span>
          <strong className="text-dark fs-7">
            ${transferencia.toLocaleString("es-AR")}
          </strong>
        </div>

        {digital > 0 && (
          <div className="bg-light p-2 rounded flex-fill text-center">
            <span className="d-block text-muted" style={{ fontSize: "0.7rem" }}>
              💳 MP / Digital
            </span>
            <strong className="text-dark fs-7">
              ${digital.toLocaleString("es-AR")}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default WidgetCaja;