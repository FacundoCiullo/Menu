import React from "react";
import { Form } from "react-bootstrap";

const AdminEditForm = ({
  formAdmin,
  handleInputChangeAdmin,
  handleSizeChangeAdmin,
  handleAdditionalChangeAdmin,
}) => {
  return (
    <div className="iqv-admin-form-container d-flex flex-column gap-3">
      <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-1 iqv-admin-header">
        <span className="badge iqv-admin-badge">
          Modo Edición Activado ✏️
        </span>
        <small className="iqv-admin-subtitle">Edición de datos y precios</small>
      </div>

      <Form.Group>
        <Form.Label className="iqv-input-label">Título del Producto</Form.Label>
        <Form.Control
          type="text"
          name="titulo"
          value={formAdmin.titulo}
          onChange={handleInputChangeAdmin}
          className="iqv-editable-input"
        />
      </Form.Group>

      <Form.Group>
        <Form.Label className="iqv-input-label">Descripción</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          name="descripcion"
          value={formAdmin.descripcion}
          onChange={handleInputChangeAdmin}
          className="iqv-editable-input"
        />
      </Form.Group>

      <Form.Group>
        <Form.Label className="iqv-input-label">Precio Base ($)</Form.Label>
        <Form.Control
          type="number"
          name="precio"
          value={formAdmin.precio}
          onChange={handleInputChangeAdmin}
          className="iqv-editable-input"
        />
      </Form.Group>

      {/* TAMAÑOS EN ADMIN */}
      {formAdmin.size && formAdmin.size.length > 0 && (
        <div className="iqv-edit-section rounded">
          <span className="iqv-label-text fw-bold iqv-accent-text">
            Precios por Tamaño (Size):
          </span>
          <div className="d-flex flex-column gap-2 mt-2">
            {formAdmin.size.map((s, idx) => (
              <div key={s.id || idx} className="d-flex gap-2 align-items-center">
                <Form.Control
                  type="text"
                  value={s.nombre}
                  onChange={(e) => handleSizeChangeAdmin(idx, "nombre", e.target.value)}
                  placeholder="Nombre"
                  className="iqv-editable-input"
                />
                <Form.Control
                  type="number"
                  value={s.precio}
                  onChange={(e) => handleSizeChangeAdmin(idx, "precio", e.target.value)}
                  placeholder="Precio $"
                  className="iqv-editable-input"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADICIONALES EN ADMIN */}
      {formAdmin.additional && formAdmin.additional.length > 0 && (
        <div className="iqv-edit-section rounded">
          <span className="iqv-label-text fw-bold iqv-accent-text">
            Precios de Adicionales / Salsas:
          </span>
          <div className="d-flex flex-column gap-2 mt-2">
            {formAdmin.additional.map((adi, idx) => (
              <div key={adi.id || idx} className="d-flex gap-2 align-items-center">
                <Form.Control
                  type="text"
                  value={adi.nombre}
                  onChange={(e) => handleAdditionalChangeAdmin(idx, "nombre", e.target.value)}
                  placeholder="Extra / Salsa"
                  className="iqv-editable-input"
                />
                <Form.Control
                  type="number"
                  value={adi.precio}
                  onChange={(e) => handleAdditionalChangeAdmin(idx, "precio", e.target.value)}
                  placeholder="Precio $"
                  className="iqv-editable-input"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEditForm;