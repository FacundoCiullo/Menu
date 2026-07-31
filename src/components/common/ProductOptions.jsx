import React from "react";

// Sub-componente interno para cada opción
const OptionCard = ({ title, priceText, isSelected, onClick }) => (
  <div
    role="button"
    tabIndex={0}
    className={`iqv-option-card ${isSelected ? "active" : ""}`}
    onClick={onClick}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
  >
    <span className="iqv-option-name">{title}</span>
    <b className="iqv-option-price">{priceText}</b>
  </div>
);

const ProductOptions = ({
  producto,
  sizeSeleccionado,
  handleSelectSize,
  additionalSeleccionados = [],
  handleToggleAdditional,
  esSeleccionUnica,
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
    <>
      {/* SECCIÓN TAMAÑOS */}
      {tieneSizes && (
        <div className="iqv-options-group mt-2">
          <span className="iqv-group-title">
            Tamaño:
            {sizeSeleccionado && (
              <small className="iqv-selected-badge ms-2">
                ({sizeSeleccionado.nombre})
              </small>
            )}
          </span>
          <div className="iqv-options-list">
            {sizes.map((s, index) => {
              const isSelected = sizeSeleccionado
                ? sizeSeleccionado.id && s.id
                  ? sizeSeleccionado.id === s.id
                  : sizeSeleccionado.nombre === s.nombre
                : false;

              const precioFormateado = `$${Number(s.precio || 0).toLocaleString("es-AR")}`;

              return (
                <OptionCard
                  key={s.id || `${s.nombre}-${index}`}
                  title={s.nombre}
                  priceText={precioFormateado}
                  isSelected={isSelected}
                  onClick={() => handleSelectSize(s)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* SECCIÓN ADICIONALES */}
      {tieneAdditionals && (
        <div className="iqv-options-group mt-3">
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
          <div className="iqv-options-list">
            {additionals.map((adi, index) => {
              const estaSeleccionado = isItemSelected(additionalSeleccionados, adi);
              const precioFormateado =
                Number(adi.precio) > 0
                  ? `+ $${Number(adi.precio).toLocaleString("es-AR")}`
                  : "Sin cargo";

              return (
                <OptionCard
                  key={adi.id || `${adi.nombre}-${index}`}
                  title={adi.nombre}
                  priceText={precioFormateado}
                  isSelected={estaSeleccionado}
                  onClick={() => handleToggleAdditional(adi)}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductOptions;