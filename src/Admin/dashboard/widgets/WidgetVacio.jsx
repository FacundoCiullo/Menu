import React from "react";

const WidgetVacio = () => {
  return (
    <div className="h-100 d-flex flex-column justify-content-center align-items-center text-center text-muted">
      <i className="bx bx-plus-circle fs-2 mb-2"></i>
      <h6>Espacio Disponible</h6>
      <small>Próximas estadísticas</small>
    </div>
  );
};

export default WidgetVacio;