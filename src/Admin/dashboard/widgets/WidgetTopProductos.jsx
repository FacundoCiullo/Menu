import React, { useState } from "react";
import { Spinner } from "react-bootstrap";

const WidgetTopProductos = ({
  ordenes = [],
  todosLosProductos = [],
  loading = false,
  modoInicial = "mas", // 'mas' o 'menos'
}) => {
  const [modo] = useState(modoInicial);

  if (loading) {
    return (
      <div className="py-3 text-center">
        <Spinner animation="border" size="sm" variant="primary" />
      </div>
    );
  }

  // 1. Mapear productos del menú
  const catalogoMap = {};
  todosLosProductos.forEach((prod) => {
    const nombre = prod.nombre || prod.title || "Producto";
    catalogoMap[nombre] = {
      nombre,
      categoria: prod.categoria || prod.category || "Sin Categoría",
      cantidad: 0,
    };
  });

  // 2. Sumar ventas del día
  ordenes.forEach((orden) => {
    const items = orden.items || orden.productos || [];

    items.forEach((item) => {
      const nombre = item.nombre || item.title || "Producto sin nombre";
      const cantidad = Number(item.cantidad || item.quantity || 1);
      const categoria = item.categoria || item.category || "Sin Categoría";

      if (catalogoMap[nombre]) {
        catalogoMap[nombre].cantidad += cantidad;
      } else {
        catalogoMap[nombre] = { nombre, categoria, cantidad };
      }
    });
  });

  // 3. Ordenar
  const listaProductos = Object.values(catalogoMap);

  if (modo === "mas") {
    listaProductos.sort((a, b) => b.cantidad - a.cantidad);
  } else {
    listaProductos.sort((a, b) => {
      if (a.cantidad === b.cantidad) {
        return a.categoria.localeCompare(b.categoria);
      }
      return a.cantidad - b.cantidad;
    });
  }

  const productosMostrar = listaProductos.slice(0, 6);

  if (productosMostrar.length === 0) {
    return (
      <div className="text-center py-3 text-muted fs-7">
        Sin productos registrados.
      </div>
    );
  }

  return (
    <div className="top-productos-list">
      <ul className="list-group list-group-flush">
        {productosMostrar.map((prod, index) => (
          <li
            key={index}
            className="list-group-item d-flex justify-content-between align-items-center px-0 py-1 bg-transparent border-bottom-0"
          >
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <span
                className={`badge rounded-pill small ${
                  modo === "mas" ? "bg-primary" : "bg-secondary"
                }`}
                style={{ fontSize: "0.65rem" }}
              >
                #{index + 1}
              </span>
              <div className="d-flex flex-column overflow-hidden">
                <span
                  className="text-truncate fw-medium fs-7"
                  style={{ maxWidth: "100px" }}
                  title={prod.nombre}
                >
                  {prod.nombre}
                </span>
              </div>
            </div>

            <span
              className={`badge border ${
                prod.cantidad === 0
                  ? "bg-light text-muted border-warning"
                  : "bg-light text-dark"
              }`}
            >
              {prod.cantidad} u.
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WidgetTopProductos;