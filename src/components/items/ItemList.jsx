import React, { useState } from "react";
import { motion } from "framer-motion";
import { PlusLg } from "react-bootstrap-icons";
import { useAuth } from "../../context/AuthContext";

import ItemQuickView from "./ItemQuickView";
import Item from "./Item";

const ItemList = ({ productos, onRefresh }) => {
  const { esAdmin } = useAuth(); // Validación de Admin vía contexto
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Abrir modal para Editar
  const handleQuickView = (producto) => {
    setSelectedProduct(producto);
    setShowModal(true);
  };

  // Abrir modal para Crear Nuevo Producto (+)
  const handleAddNew = () => {
    setSelectedProduct(null); // null indica "Nuevo Producto"
    setShowModal(true);
  };

  // BANNERS CATEGORIAS
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
  const productosAgrupados = (productos || []).reduce((acc, producto) => {
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
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const formatTitle = (str) => {
    if (!str || str === "otros") return "Otros";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const entries = Object.entries(productosAgrupados);

  return (
    <>
      {/* SI NO HAY PRODUCTOS Y ES ADMIN, MOSTRAMOS SOLAMENTE EL BOTÓN PARA AGREGAR */}
      {entries.length === 0 && esAdmin && (
        <div className="my-5 text-center">
          <p className="text-muted mb-3">No hay productos en esta categoría.</p>
          <button className="btn btn-warning px-4 py-2" onClick={handleAddNew}>
            <PlusLg size={20} className="me-2" /> Agregar Primer Producto
          </button>
        </div>
      )}

      {entries.map(([subcategoria, lista], categoryIndex) => (
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
            {/* CARD "+" SOLO EN LA PRIMERA CATEGORÍA SI ES ADMIN LOGUEADO */}
            {esAdmin && categoryIndex === 0 && (
              <motion.div variants={itemVariants} className="item-wrapper">
                <div
                  className="item-card item-card-add-new"
                  onClick={handleAddNew}
                  role="button"
                  tabIndex={0}
                >
                  <div className="add-icon-circle">
                    <PlusLg size={32} />
                  </div>
                  
                  <span> Agregar Producto </span>

                </div>
              </motion.div>
            )}

            {/* PRODUCTOS DE LA CATEGORÍA */}
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

      {/* MODAL VISTA RÁPIDA / EDICIÓN Y CREACIÓN */}
      <ItemQuickView
        show={showModal}
        handleClose={() => setShowModal(false)}
        producto={selectedProduct}
        onRefresh={onRefresh}
      />
    </>
  );
};

export default ItemList;