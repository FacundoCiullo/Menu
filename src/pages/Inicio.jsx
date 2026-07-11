import React from "react";
import { Link } from "react-router-dom";
import SocialBar from "../components/layout/SocialBar";
import Testimonials from "../components/sections/Testimonials";
import Button from "react-bootstrap/Button";
import { motion } from "framer-motion";
import Favorites from "../components/user/FavoritesItems";
import { useAuth } from "../context/AuthContext";
import { BsBookmarkStarFill } from "react-icons/bs";

import CategoriesCarousel from "../components/sections/CategoriesCarousel";
import Destacados from "../components/sections/Destacados";

const Inicio = () => {
  const { usuario, loading } = useAuth();

  return (
    <div className="inicio-landing">

      <h1 className="fw-bold mb-3 text-center my-4">
        App Menu Demo
      </h1>


      <CategoriesCarousel />

      <Destacados />

      {!loading && usuario && (
        <motion.section
          className="my-4 container"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-center mb-4 fw-bold">
            Productos Favoritos{" "}
            <BsBookmarkStarFill
              size={36}
              color="#ffcc00"
            />
          </h2>

          <Favorites limit={4} />
        </motion.section>
      )}

      <section className="container my-5">
        <h2 className="text-center mb-4">
          Conectate con nosotros
        </h2>

        <SocialBar inline={false} />
      </section>

      <Testimonials />

      <motion.section
        className="benefits-section text-center py-5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <h2 className="fw-bold mb-4">
            ¿Por qué elegirnos?
          </h2>

          <div className="row justify-content-center">
            <div className="col-md-3 col-10 mb-4">
              <div className="p-3 bg-white rounded-4 shadow-sm h-100">
                <i className="bi bi-truck fs-1 text-primary"></i>
                <h5 className="mt-3 fw-bold">
                  Envíos a todo el país
                </h5>
                <p className="text-muted">
                  Recibí tu pedido rápido y seguro en tu domicilio.
                </p>
              </div>
            </div>

            <div className="col-md-3 col-10 mb-4">
              <div className="p-3 bg-white rounded-4 shadow-sm h-100">
                <i className="bi bi-shield-check fs-1 text-success"></i>
                <h5 className="mt-3 fw-bold">
                  Compra segura
                </h5>
                <p className="text-muted">
                  Pagos protegidos y garantía de satisfacción.
                </p>
              </div>
            </div>

            <div className="col-md-3 col-10 mb-4">
              <div className="p-3 bg-white rounded-4 shadow-sm h-100">
                <i className="bi bi-star fs-1 text-warning"></i>
                <h5 className="mt-3 fw-bold">
                  Calidad garantizada
                </h5>
                <p className="text-muted">
                  Productos seleccionados con los mejores materiales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="contact-section text-center text-light py-5 mt-5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h2 className="fw-bold mb-3">
          ¿Listo para tu próximo look?
        </h2>

        <p className="lead mb-4">
          Encontrá lo que buscás
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