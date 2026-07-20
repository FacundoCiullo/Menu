import React from "react";
import "./style/Sections.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const cardsData = [
  {
    backgroundImage: 'url("/img/banners/banner-hamburguesas.png")',
    title: "Hamburguesas",
  },
  {
    backgroundImage: 'url("/img/banners/banner-pizzas.png")',
    title: "Pizzas",
  },
  {
    backgroundImage: 'url("/img/banners/banner-entradas.png")',
    title: "Entradas",
  },
  {
    backgroundImage: 'url("/img/banners/banner-pastas.png")',
    title: "Pastas",
  },
  {
    backgroundImage: 'url("/img/banners/banner-postres.png")',
    title: "Postres",
  },
  {
    backgroundImage: 'url("/img/banners/banner-bebidas.png")',
    title: "Bebidas",
  },
];

const CategoriesCarousel = () => {
  return (
    <section className="inicio-slider mt-3 container">
      <motion.div
        initial={{
          opacity: 0,
          y: 40,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
        viewport={{
          once: true,
        }}
      >
        <div className="d-flex destacados">
          <h2 className="fw-bold m-0">Categorías</h2>

          <Link className="link-underline-dark" to="/Productos">
            <p className="text-white m-0">Ver más</p>
          </Link>
        </div>
      </motion.div>

      <div className="horizontal-scroll">
        {cardsData.map((card) => (
          <Link
            key={card.title}
            to={`/Productos?subcategoria=${encodeURIComponent(card.title)}`}
            className="slider-card"
          >
            {/* Círculo de la imagen */}
            <div
              className="slider-image"
              style={{
                backgroundImage: card.backgroundImage,
              }}
            />

            {/* Texto de la categoría fuera del contenedor recortado */}
            <motion.h2
              className="category-title"
              initial={{
                opacity: 0,
                y: 10,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.4,
              }}
              viewport={{
                once: true,
              }}
            >
              {card.title}
            </motion.h2>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoriesCarousel;