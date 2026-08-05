import React from "react";
import "./style/Sections.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const cardsData = [
  {
    backgroundImage: 'url("https://img.icons8.com/laces/100/hamburger.png")',
    title: "Hamburguesas",
  },
  {
    backgroundImage: 'url("https://img.icons8.com/laces/100/pizza.png")',
    title: "Pizzas",
  },
  {
    backgroundImage: 'url("https://img.icons8.com/laces/100/french-fries.png")',
    title: "Entradas",
  },
  {
    backgroundImage: 'url("https://img.icons8.com/laces/100/spaghetti.png")',
    title: "Pastas",
  },
  {
    backgroundImage: 'url("https://img.icons8.com/laces/64/confectionery.png")',
    title: "Postres",
  },
  {
    backgroundImage: 'url("https://img.icons8.com/laces/100/bar.png")',
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
            <p className="text-white">Ver más</p>
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