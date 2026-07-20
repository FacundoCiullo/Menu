import { useRef, useState } from "react";
import ItemQuickView from "../items/ItemQuickView";
import "./style/PromosItemList.css";

// Agregamos `= []` como fallback por si 'productos' llega undefined
const PromosItemList = ({ productos = [] }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const scrollRef = useRef(null);

  const handleQuickView = (producto) => {
    setSelectedProduct(producto);
    setShowModal(true);
  };

  // Guardia de seguridad: si no hay productos o no es un array, mostramos un mensaje o nada
  if (!productos || !Array.isArray(productos) || productos.length === 0) {
    return (
      <p className="text-center text-muted my-3">
        No hay promociones disponibles en este momento.
      </p>
    );
  }

  return (
    <>
      <div className="promos-scroll-container" ref={scrollRef}>
        {productos.map((producto) => {
          const precioViejo =
            producto.precioAnterior || producto.precioBase || producto.precio;
          const precioNuevo = producto.precioOferta || producto.precio;

          return (
            <div
              key={producto.id}
              className="promo-card-wrapper"
              onClick={() => handleQuickView(producto)}
              role="button"
              tabIndex={0}
            >
              <div className="promo-card">
                <img
                  src={producto.imagen || producto.img}
                  alt={producto.titulo || producto.nombre}
                  className="promo-card-img"
                />

                <div className="promo-badge">OFERTA</div>

                <div className="promo-card-overlay">
                  <h3 className="promo-card-title">
                    {producto.titulo || producto.nombre}
                  </h3>

                  <div className="promo-card-prices">
                    {precioViejo && precioViejo !== precioNuevo && (
                      <span className="price-old">${precioViejo}</span>
                    )}
                    <span className="price-new">${precioNuevo}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ItemQuickView
        show={showModal}
        handleClose={() => setShowModal(false)}
        producto={selectedProduct}
      />
    </>
  );
};

export default PromosItemList;