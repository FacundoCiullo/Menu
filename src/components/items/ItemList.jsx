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


  // RELACIÓN CATEGORIA - IMAGEN
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


  // Agrupar productos
  const productosAgrupados = productos.reduce((acc, producto) => {

    const subcategoria = producto.subcategoria?.toLowerCase() || "otros";

    if (!acc[subcategoria]) {
      acc[subcategoria] = [];
    }

    acc[subcategoria].push(producto);
    return acc;

  }, {});



  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition:{
        staggerChildren:0.12
      }
    }
  };


  const itemVariants = {
    hidden:{
      opacity:0,
      y:40
    },
    show:{
      opacity:1,
      y:0,
      transition:{
        duration:0.5,
        ease:"easeOut"
      }
    }
  };



  return (
    <>


      {Object.entries(productosAgrupados).map(([subcategoria, lista]) => (

        <div key={subcategoria} className="category-section">

          <img
            className="category-banner"
            src={
              banners[subcategoria] 
              || "/img/banners/default.jpg"
            }
            alt={subcategoria}
          />

          <motion.div

            className="items-container"

            variants={containerVariants}

            initial="hidden"

            animate="show"

          >

            {lista.map((producto)=>(

              <motion.div

                key={`${producto.id}-${producto.colorForzado || "default"}`}

                variants={itemVariants}

                className="item-wrapper"
              >

                <Item

                  producto={producto}

                  colorSeleccionado={
                    producto.colorForzado || null
                  }
                  handleQuickView={handleQuickView}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      ))}



      <ItemQuickView

        show={showModal}

        handleClose={() => setShowModal(false)}

        producto={selectedProduct}

      />


    </>
  );
};


export default ItemList;