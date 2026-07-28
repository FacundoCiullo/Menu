import React from "react";
import { TagFill } from "react-bootstrap-icons";

const AdminEditForm = ({
  formData,
  handleChange,
  sizes,
  handleAddSize,
  handleSizeChange,
  handleRemoveSize,
  additionals,
  handleAddAdditional,
  handleAdditionalChange,
  handleRemoveAdditional,
}) => {
  return (
    <div className="add-product-form" style={{ padding: 0 }}>
      {/* Título */}
      <div className="add-product-field-group">
        <label className="add-product-label">Título del Producto</label>
        <input
          type="text"
          name="titulo"
          placeholder="ej: Pizza Fugazzeta"
          value={formData.titulo || ""}
          onChange={handleChange}
          required
          className="add-product-input"
        />
      </div>

      {/* Descripción */}
      <div className="add-product-field-group">
        <label className="add-product-label">Descripción</label>
        <textarea
          name="descripcion"
          placeholder="Mozzarella y abundante cebolla caramelizada."
          value={formData.descripcion || ""}
          onChange={handleChange}
          rows={2}
          className="add-product-textarea"
        />
      </div>

      {/* Categoría & Subcategoría */}
      <div className="add-product-field-group">
        <label className="add-product-label">Categoría & Subcategoría</label>
        <div className="add-product-row">
          <input
            type="text"
            name="categoria"
            placeholder="Categoría (ej: Comidas)"
            value={formData.categoria || ""}
            onChange={handleChange}
            className="add-product-input"
          />
          <input
            type="text"
            name="subcategoria"
            placeholder="Subcategoría (ej: Pizzas)"
            value={formData.subcategoria || ""}
            onChange={handleChange}
            className="add-product-input"
          />
        </div>
      </div>

      {/* Precio, Oferta y Precio Anterior */}
      <div className="add-product-field-group py-2">
        <div className="price-header-labels">
          <label className="add-product-label">
            {formData.oferta ? "Precio Oferta ($)" : "Precio Base ($)"}
          </label>
          {formData.oferta && (
            <label className="add-product-label old-price-label">Precio Anterior ($)</label>
          )}
          <label className="add-product-checkbox-label highlight-offer">
            <input
              type="checkbox"
              name="oferta"
              checked={Boolean(formData.oferta)}
              onChange={handleChange}
            />
            <span>En Oferta</span>
          </label>
        </div>
        <div className="add-product-row">
          <input
            type="number"
            name="precio"
            placeholder="Precio Actual"
            value={formData.precio ?? ""}
            onChange={handleChange}
            required
            className="add-product-input cell-price"
          />
          {formData.oferta && (
            <input
              type="number"
              name="precioAnterior"
              placeholder="Precio Viejo"
              value={formData.precioAnterior ?? ""}
              onChange={handleChange}
              className="add-product-input cell-price old-price-input"
            />
          )}
        </div>
        {formData.oferta && formData.descuentoPorcentaje > 0 && (
          <span className="discount-summary-tag">
            <TagFill size={10} /> Aplica un <strong>{formData.descuentoPorcentaje}%</strong> de descuento sobre el precio original.
          </span>
        )}
      </div>

      {/* Atributos y Etiquetas */}
      <fieldset className="add-product-fieldset">
        <legend className="add-product-legend">Atributos y Etiquetas</legend>
        <div className="add-product-grid-checks">
          <label className="add-product-checkbox-label">
            <input type="checkbox" name="recomendado" checked={Boolean(formData.recomendado)} onChange={handleChange} />
            Recomendado
          </label>
          <label className="add-product-checkbox-label">
            <input type="checkbox" name="vegetariano" checked={Boolean(formData.vegetariano)} onChange={handleChange} />
            Vegetariano
          </label>
          <label className="add-product-checkbox-label">
            <input type="checkbox" name="vegano" checked={Boolean(formData.vegano)} onChange={handleChange} />
            Vegano
          </label>
          <label className="add-product-checkbox-label">
            <input type="checkbox" name="sinTacc" checked={Boolean(formData.sinTacc)} onChange={handleChange} />
            Sin TACC
          </label>
          <label className="add-product-checkbox-label">
            <input type="checkbox" name="picante" checked={Boolean(formData.picante)} onChange={handleChange} />
            Picante
          </label>
        </div>
      </fieldset>

      {/* Tamaños (Variantes) */}
      <fieldset className="add-product-fieldset">
        <legend className="add-product-legend">Tamaños (Variantes)</legend>
        {sizes.map((s, index) => (
          <div key={index} className="add-product-dynamic-row">
            <input
              type="text"
              placeholder="Nombre (ej: Individual / Grande)"
              value={s.nombre || ""}
              onChange={(e) => handleSizeChange(index, "nombre", e.target.value)}
              className="add-product-input"
            />
            <input
              type="number"
              placeholder="Precio"
              value={s.precio ?? ""}
              onChange={(e) => handleSizeChange(index, "precio", e.target.value)}
              className="add-product-input"
            />
            <button type="button" onClick={() => handleRemoveSize(index)} className="add-product-btn-remove">
              ✕
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddSize} className="add-product-btn-add">
          + Agregar Tamaño
        </button>
      </fieldset>

      {/* Adicionales y Extras */}
      <fieldset className="add-product-fieldset">
        <legend className="add-product-legend">Adicionales y Extras</legend>
        {additionals.map((add, index) => (
          <div key={index} className="add-product-dynamic-row">
            <input
              type="text"
              placeholder="Nombre Extra (ej: Queso Extra)"
              value={add.nombre || ""}
              onChange={(e) => handleAdditionalChange(index, "nombre", e.target.value)}
              className="add-product-input"
            />
            <input
              type="number"
              placeholder="Precio Extra"
              value={add.precio ?? ""}
              onChange={(e) => handleAdditionalChange(index, "precio", e.target.value)}
              className="add-product-input"
            />
            <button type="button" onClick={() => handleRemoveAdditional(index)} className="add-product-btn-remove">
              ✕
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddAdditional} className="add-product-btn-add">
          + Agregar Adicional
        </button>
      </fieldset>
    </div>
  );
};

export default AdminEditForm;