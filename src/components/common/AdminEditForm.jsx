import React from "react";
import { TagFill } from "react-bootstrap-icons";

const DynamicFieldsSection = ({
  title,
  items = [],
  onAdd,
  onChange,
  onRemove,
  placeholderName,
  placeholderPrice,
  addLabel,
  esOferta = false,
}) => (
  <fieldset className="add-product-fieldset">
    <legend className="add-product-legend">{title}</legend>
    {items.map((item, index) => (
      <div key={item.id || index} className="add-product-dynamic-row">
        <input
          type="text"
          placeholder={placeholderName}
          value={item.nombre || ""}
          onChange={(e) => onChange(index, "nombre", e.target.value)}
          className="add-product-input"
        />
        <input
          type="number"
          placeholder={placeholderPrice}
          value={item.precio ?? ""}
          onChange={(e) => onChange(index, "precio", e.target.value)}
          className="add-product-input cell-price"
        />
        
        {esOferta && (
          <input
            type="number"
            placeholder="Precio Viejo"
            value={item.precioAnterior ?? ""}
            onChange={(e) => onChange(index, "precioAnterior", e.target.value)}
            className="add-product-input cell-price old-price-input"
          />
        )}

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="add-product-btn-remove"
          aria-label="Eliminar fila"
        >
          ✕
        </button>
      </div>
    ))}
    <button type="button" onClick={onAdd} className="add-product-btn-add">
      {addLabel}
    </button>
  </fieldset>
);

const AdminEditForm = ({
  formData = {},
  handleChange,
  sizes = [],
  handleAddSize,
  handleSizeChange,
  handleRemoveSize,
  additionals = [],
  handleAddAdditional,
  handleAdditionalChange,
  handleRemoveAdditional,
}) => {
  return (
    <div className="add-product-form" style={{ padding: 0 }}>
      {/* Título */}
      <div className="add-product-fieldset">
        <label className="add-product-label">Título del Producto</label>
        <input
          type="text"
          name="titulo"
          placeholder="ej: Pizza Fugazzeta"
          value={formData?.titulo || ""}
          onChange={handleChange}
          required
          className="add-product-input"
        />
      </div>

      {/* Descripción */}
      <div className="add-product-fieldset">
        <label className="add-product-label">Descripción</label>
        <textarea
          name="descripcion"
          placeholder="Mozzarella y abundante cebolla caramelizada."
          value={formData?.descripcion || ""}
          onChange={handleChange}
          rows={2}
          className="add-product-textarea"
        />
      </div>

      {/* Categoría & Subcategoría */}
      <div className="add-product-fieldset">
        <label className="add-product-label">Categoría & Subcategoría</label>
        <div className="add-product-row">
          <input
            type="text"
            name="categoria"
            placeholder="Categoría (ej: Comidas)"
            value={formData?.categoria || ""}
            onChange={handleChange}
            className="add-product-input"
          />
          <input
            type="text"
            name="subcategoria"
            placeholder="Subcategoría (ej: Pizzas)"
            value={formData?.subcategoria || ""}
            onChange={handleChange}
            className="add-product-input"
          />
        </div>
      </div>

      {/* Precio, Oferta y Stock */}
      <div className="add-product-fieldset">
        <div className="price-header-labels">
          <label className="add-product-label">
            {formData?.oferta ? "Precio Oferta Base" : "Precio Base"}
          </label>
          {formData?.oferta && (
            <label className="add-product-label old-price-label">Precio Anterior</label>
          )}
          <label className="add-product-checkbox-label highlight-offer">
            <input
              type="checkbox"
              name="oferta"
              checked={Boolean(formData?.oferta)}
              onChange={handleChange}
            />
            <span>Oferta</span>
          </label>
        </div>
        <div className="add-product-row">
          <input
            type="number"
            name="precio"
            placeholder="Precio Actual"
            value={formData?.precio ?? ""}
            onChange={handleChange}
            required
            className="add-product-input cell-price"
          />
          {formData?.oferta && (
            <input
              type="number"
              name="precioAnterior"
              placeholder="Precio Viejo"
              value={formData?.precioAnterior ?? ""}
              onChange={handleChange}
              className="add-product-input cell-price old-price-input"
            />
          )}
        </div>
        {formData?.oferta && (formData?.descuentoPorcentaje || 0) > 0 && (
          <span className="discount-summary-tag">
            <TagFill size={10} /> Aplica un <strong>{formData.descuentoPorcentaje}%</strong> de descuento sobre el precio base.
          </span>
        )}
      </div>

      {/* Stock Unidades */}

      <div className="add-product-fieldset">
        <div className="stock-header-labels">
          <label className="add-product-label">Stock Unidades</label>
          <input
            type="number"
            name="stock"
            placeholder="Stock (ej: 10)"
            value={formData?.stock ?? ""}
            onChange={handleChange}
            min="0"
            className="add-product-input-stock"
          />
        </div>
      </div>

      {/* Atributos */}
      <fieldset className="add-product-fieldset">
        <legend className="add-product-legend">Atributos y Etiquetas</legend>
        <div className="add-product-grid-checks">
          {[
            { name: "recomendado", label: "Recomendado" },
            { name: "vegano", label: "Vegano" },
            { name: "sinTacc", label: "Sin TACC" },
            { name: "picante", label: "Picante" }
          ].map(({ name, label }) => (
            <label key={name} className="add-product-checkbox-label">
              <input
                type="checkbox"
                name={name}
                checked={Boolean(formData?.[name])}
                onChange={handleChange}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Tamaños */}
      <DynamicFieldsSection
        title="Tamaños (Variantes)"
        items={sizes}
        onAdd={handleAddSize}
        onChange={handleSizeChange}
        onRemove={handleRemoveSize}
        placeholderName="Nombre (ej: Individual / Grande)"
        placeholderPrice="Precio Actual"
        addLabel="+ Agregar Tamaño"
        esOferta={Boolean(formData?.oferta)}
      />

      {/* Adicionales */}
      <DynamicFieldsSection
        title="Adicionales y Extras"
        items={additionals}
        onAdd={handleAddAdditional}
        onChange={handleAdditionalChange}
        onRemove={handleRemoveAdditional}
        placeholderName="Nombre Extra (ej: Queso Extra)"
        placeholderPrice="Precio Extra"
        addLabel="+ Agregar Adicional"
      />
    </div>
  );
};

export default AdminEditForm;