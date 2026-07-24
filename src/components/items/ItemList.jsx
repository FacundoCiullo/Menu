// src/components/items/ItemList.jsx

import React, { useState } from "react";
import { motion } from "framer-motion";

import ItemQuickView from "./ItemQuickView";
import Item from "./Item";

const ItemList = ({ productos }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleQuickView = (producto) => {
    setSelectedProduct(producto);
    setShowModal(true);
  };

  if (!productos || productos.length === 0) {
    return (
      <p className="text-center text-muted my-5">
        No hay productos disponibles.
      </p>
    );
  }

  // RELACIÓN CATEGORIA/SUBCATEGORIA - IMAGEN
  const banners = {
    pizzas: "/img/banners/banner-pizzas.png",
    hamburguesas: "/img/banners/banner-hamburguesas.png",
    entradas: "/img/banners/banner-entradas.png",
    pastas: "/img/banners/banner-pastas.png",
    ensaladas: "/img/banners/banner-ensaladas.png",
    veganos: "/img/banners/banner-ensaladas.png",
    postres: "/img/banners/banner-postres.png",
    bebidas: "/img/banners/banner-bebidas.png",
  };

  // Agrupar productos por subcategoría o categoría
  const productosAgrupados = productos.reduce((acc, producto) => {
    const rawSubcat = producto.subcategoria || producto.categoria || "otros";
    const subcategoriaKey = rawSubcat.toLowerCase().trim();

    if (!acc[subcategoriaKey]) {
      acc[subcategoriaKey] = [];
    }

    acc[subcategoriaKey].push(producto);
    return acc;
  }, {});

  // Variantes de animación Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 35,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const formatTitle = (str) => {
    if (!str || str === "otros") return "Otros";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <>
      {Object.entries(productosAgrupados).map(([subcategoria, lista]) => (
        <div key={subcategoria} className="category-section">
          {/* BANNER DE SUBCATEGORÍA */}
          <div className="category-banner-wrapper">
            <img
              className="category-banner"
              src={banners[subcategoria] || "/img/banners/default.jpg"}
              alt={subcategoria}
            />
            <h2 className="category-title-overlay">{formatTitle(subcategoria)}</h2>
          </div>

          {/* CONTENEDOR ANIMA-GRID */}
          <motion.div
            className="items-container"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {lista.map((producto) => {
              const uniqueKey = `${producto.id}_${producto.colorForzado || "default"}`;

              return (
                <motion.div
                  key={uniqueKey}
                  variants={itemVariants}
                  className="item-wrapper"
                >
                  <Item
                    producto={producto}
                    colorSeleccionado={producto.colorForzado || null}
                    handleQuickView={handleQuickView}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      ))}

      {/* MODAL VISTA RÁPIDA */}
      <ItemQuickView
        show={showModal}
        handleClose={() => setShowModal(false)}
        producto={selectedProduct}
      />
    </>
  );
};

export default ItemList;