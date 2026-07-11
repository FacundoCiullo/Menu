import { useRef, useState } from "react";
import Item from "./Item";
import ItemQuickView from "./ItemQuickView";

import "./style/HorizontalItemList.css";

const HorizontalItemList = ({ productos }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const scrollRef = useRef(null);

  const handleQuickView = (producto) => {
    setSelectedProduct(producto);
    setShowModal(true);
  };

  if (!productos || productos.length === 0) {
    return (
      <p className="text-center text-muted my-4">
        No hay productos destacados.
      </p>
    );
  }

  return (
    <>
      <section className="inicio-slider mt-3">

        <div
          className="horizontal-scroll"
          ref={scrollRef}
        >
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="slider-card-product"
            >
              <Item
                producto={producto}
                handleQuickView={handleQuickView}
              />
            </div>
          ))}
        </div>

      </section>

      <ItemQuickView
        show={showModal}
        handleClose={() => setShowModal(false)}
        producto={selectedProduct}
      />
    </>
  );
};

export default HorizontalItemList;