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
    abrigos: "/img/banners/banner-hamburguesas.png",
    pantalon: "/img/banners/banner-pizzas.png",
    remeras: "/img/banners/banner-bebidas.png",
    zapatillas: "/img/banners/banner-postres.png",
  };


  // Agrupar productos
  const productosAgrupados = productos.reduce((acc, producto) => {

    const categoria = producto.categoria?.toLowerCase() || "otros";

    if (!acc[categoria]) {
      acc[categoria] = [];
    }

    acc[categoria].push(producto);
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


      {Object.entries(productosAgrupados).map(([categoria, lista]) => (

        <div key={categoria} className="category-section">

          <img
            className="category-banner"
            src={
              banners[categoria] 
              || "/img/banners/default.jpg"
            }
            alt={categoria}
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