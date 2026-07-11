import React from "react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { motion } from "framer-motion";

import CategoriesCarousel from "../components/sections/CategoriesCarousel";
import Destacados from "../components/sections/Destacados";


const Inicio = () => {
  return (
    <div className="inicio-landing">

      <section className="mt-5 container">
        <img className="inicio-banner" src="/img/banner/banner-restaurant.png" alt="" />
      </section>

      <CategoriesCarousel />

      <Destacados />


      <motion.section
        className="contact-section text-center text-light py-5 mt-5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h2 className="fw-bold mb-3">
          ¿Listo para tu próxima expeciencia?
        </h2>

        <p className="lead mb-4">
          Reserva y obten beneficios
        </p>

        <Link to="/contacto">
          <Button variant="light" size="lg">
            Contactanos
          </Button>
        </Link>
      </motion.section>

    </div>
  );
};

export default Inicio;