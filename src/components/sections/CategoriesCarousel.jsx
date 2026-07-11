import React from "react";
import "./style/Sections.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const cardsData = [
  {
    backgroundImage: 'url("img/banners/banner-hamburguesas.png")',
    title: "Hamburguesas",
    categoryId: "Comidas",
  },
  {
    backgroundImage: 'url("img/banners/banner-pizzas.png")',
    title: "Pizzas",
    categoryId: "Comidas",
  },
  {
    backgroundImage: 'url("img/banners/banner-entradas.png")',
    title: "Entradas",
    categoryId: "Comidas",
  },
  {
    backgroundImage: 'url("img/banners/banner-bebidas.png")',
    title: "Bebidas",
    categoryId: "Bebidas",
  },
];

const CategoriesCarousel = () => {
  return (
    <section className="inicio-slider mt-3 container">
      <section
        className=""
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
      <div className="d-flex destacados">
        <h2 className="fw-bold m-0">Categorias</h2>

        <Link className="link-underline-dark" to="/Productos">
            <p className="text-white">Ver más</p>
        </Link>
      </div>

    </section>
      <div className="horizontal-scroll">
        {cardsData.map((card, index) => (
          <Link
            key={index}
            to={`/category/${card.categoryId}`}
            className="slider-card"
          >
            <div
              className="slider-image"
              style={{
                backgroundImage: card.backgroundImage,
              }}
            >
              <div className="slider-overlay">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {card.title}
                </motion.h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoriesCarousel;