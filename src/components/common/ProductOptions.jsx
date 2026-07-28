import React from "react";

const ProductOptions = ({
  producto,
  sizeSeleccionado,
  handleSelectSize,
  additionalSeleccionados = [],
  handleToggleAdditional,
  esSeleccionUnica,
}) => {
  // Verificación segura utilizando optional chaining
  const sizes = producto?.size ?? [];
  const additionals = producto?.additional ?? [];

  const tieneSizes = sizes.length > 0;
  const tieneAdditionals = additionals.length > 0;

  if (!tieneSizes && !tieneAdditionals) return null;

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
            {sizes.map((s) => {
              const isSelected = sizeSeleccionado?.id === s.id;
              return (
                <div
                  key={s.id || s.nombre}
                  className={`iqv-option-card ${isSelected ? "active" : ""}`}
                  onClick={() => handleSelectSize(s)}
                >
                  <span className="iqv-option-name">{s.nombre}</span>
                  <b className="iqv-option-price">
                    ${(s.precio || 0).toLocaleString("es-AR")}
                  </b>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECCIÓN ADICIONALES / SALSAS */}
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
            {additionals.map((adi) => {
              const estaSeleccionado = additionalSeleccionados.some(
                (item) => item.id === adi.id
              );
              return (
                <div
                  key={adi.id || adi.nombre}
                  className={`iqv-option-card ${estaSeleccionado ? "active" : ""}`}
                  onClick={() => handleToggleAdditional(adi)}
                >
                  <span className="iqv-option-name">{adi.nombre}</span>
                  <b className="iqv-option-price">
                    {adi.precio > 0
                      ? `+ $${adi.precio.toLocaleString("es-AR")}`
                      : "Sin cargo"}
                  </b>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductOptions;