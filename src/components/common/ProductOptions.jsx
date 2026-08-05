import React from "react";

// Sub-componente Toggle/Switch tipo iOS/Android
const SwitchToggle = ({ isChecked }) => (
  <div className={`iqv-switch ${isChecked ? "checked" : ""}`}>
    <div className="iqv-switch-thumb" />
  </div>
);

const ProductOptions = ({
  producto,
  sizeSeleccionado,
  handleSelectSize,
  additionalSeleccionados = [],
  handleToggleAdditional,
  esSeleccionUnica,
  // Props de cantidad y precios originales
  cantidad = 1,
  handleIncrement,
  handleDecrement,
  precioFinal,
  precioAnterior, // Muestra el precio viejo tachado
}) => {
  const sizes = producto?.size ?? [];
  const additionals = producto?.additional ?? [];

  const tieneSizes = sizes.length > 0;
  const tieneAdditionals = additionals.length > 0;

  if (!tieneSizes && !tieneAdditionals) return null;

  // Helper de comparación por id o nombre
  const isItemSelected = (list, item) => {
    return list.some((selected) =>
      selected.id && item.id
        ? selected.id === item.id
        : selected.nombre === item.nombre
    );
  };

  return (
    <div className="iqv-customization-card">
      {/* SECCIÓN TAMAÑOS CON TÍTULO Y BADGE ORIGINAL */}
      {tieneSizes && (
        <div className="iqv-options-group">
          <span className="iqv-group-title">
            Tamaño:
            {sizeSeleccionado && (
              <small className="iqv-selected-badge ms-2">
                ({sizeSeleccionado.nombre})
              </small>
            )}
          </span>
          <div className="iqv-sizes-pills">
            {sizes.map((s, index) => {
              const isSelected = sizeSeleccionado
                ? sizeSeleccionado.id && s.id
                  ? sizeSeleccionado.id === s.id
                  : sizeSeleccionado.nombre === s.nombre
                : false;

              return (
                <button
                  key={s.id || `${s.nombre}-${index}`}
                  type="button"
                  className={`iqv-size-pill ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectSize(s)}
                >
                  {s.nombre}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SECCIÓN ADICIONALES / EXTRAS / SALSAS CON TÍTULOS Y BADGE ORIGINAL */}
      {tieneAdditionals && (
        <div className="iqv-options-group">
          <span className="iqv-group-title">
            {esSeleccionUnica ? "Elección:" : "Adicionales extras:"}
            {additionalSeleccionados.length > 0 && (
              <small className="iqv-selected-badge ms-2">
                ({esSeleccionUnica
                  ? additionalSeleccionados[0]?.nombre
                  : `${additionalSeleccionados.length} selec.`})
              </small>
            )}
          </span>

          <div className="iqv-additionals-list">
            {additionals.map((adi, index) => {
              const estaSeleccionado = isItemSelected(additionalSeleccionados, adi);
              const precioFormateado =
                Number(adi.precio) > 0
                  ? `+$${Number(adi.precio).toLocaleString("es-AR")}`
                  : "Sin cargo";

              return (
                <div
                  key={adi.id || `${adi.nombre}-${index}`}
                  className="iqv-additional-row"
                  onClick={() => handleToggleAdditional(adi)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleToggleAdditional(adi)}
                >
                  <span className="iqv-additional-name">{adi.nombre}</span>

                  <div className="iqv-additional-right">
                    <span className="iqv-additional-price">{precioFormateado}</span>
                    <SwitchToggle isChecked={estaSeleccionado} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductOptions;