import React, { useState } from "react";
import { motion } from "framer-motion";
import { useFavorites } from "../../context/FavoritesContext";
import Item from "../items/Item";
import ItemQuickView from "../items/ItemQuickView";

const FavoritesList = () => {
  const { favorites } = useFavorites();
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleQuickView = (producto) => {
    setSelectedProduct(producto);
    setShowModal(true);
  };

  if (!favorites || favorites.length === 0) {
    return (
      <div className="text-center text-muted my-5">
        <h5>No tienes productos en favoritos</h5>
        <p>Explorá los productos y marcá algunos con el corazón.</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <>
      <h2 className="text-center my-4 fw-bold "> </h2>

      <motion.div
        className="items-container container"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {favorites.map((producto) => (
          <motion.div
            key={`${producto.id}-${producto.colorForzado || "default"}`}
            variants={itemVariants}
            className="item-wrapper"
          >
            <Item
              producto={producto}
              colorSeleccionado={producto.colorForzado || null}
              handleQuickView={handleQuickView}
            />
          </motion.div>
        ))}
      </motion.div>

      <ItemQuickView
        show={showModal}
        handleClose={() => setShowModal(false)}
        producto={selectedProduct}
      />
    </>
  );
};

export default FavoritesList;
