import React from "react";
import { ListGroup, Badge, Spinner } from "react-bootstrap";

const WidgetUsuarios = ({ ordenes = [], loading }) => {
  const rankingClientes = React.useMemo(() => {
    const mapa = {};
    ordenes.forEach((o) => {
      const email = o.buyer?.email || "Anónimo";
      const nombre = o.buyer?.name || "Sin nombre";

      if (!mapa[email]) {
        mapa[email] = { nombre, email, compras: 0, totalGastado: 0 };
      }
      mapa[email].compras += 1;
      mapa[email].totalGastado += o.total || 0;
    });

    return Object.values(mapa)
      .sort((a, b) => b.compras - a.compras)
      .slice(0, 5);
  }, [ordenes]);

  return (
    <div className="d-flex flex-column h-100">
      <h5 className="fw-bold mb-1">Clientes Frecuentes</h5>
      <small className="text-muted mb-3">Top compradores en el sistema</small>

      {loading ? (
        <div className="text-center my-auto">
          <Spinner animation="border" size="sm" />
        </div>
      ) : (
        <ListGroup variant="flush" className="flex-grow-1">
          {rankingClientes.map((cliente, index) => (
            <ListGroup.Item
              key={index}
              className="d-flex justify-content-between align-items-center px-0 py-2 border-bottom"
            >
              <div>
                <div className="fw-bold small">{cliente.nombre}</div>
                <div className="text-muted style-email" style={{ fontSize: "0.75rem" }}>
                  {cliente.email}
                </div>
              </div>
              <Badge bg="dark" pill>
                {cliente.compras} {cliente.compras === 1 ? "compra" : "compras"}
              </Badge>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default WidgetUsuarios;