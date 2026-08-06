import React from 'react';
import { Link } from 'react-router-dom';
import './style/HeroCarousel.css';

// Lista de promociones (puedes cambiar imágenes y textos)
const PROMOS = [
  {
    id: 1,
    title: "2x1 en Hamburguesas",
    subtitle: "¡Todos los martes y jueves! Disfruta la mejor carne smash.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
    interval: 5000,
    link: "/productos"
  },
  {
    id: 2,
    title: "Noche de Pizzas",
    subtitle: "30% OFF en pizzas gigantes a la piedra.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
    interval: 4000,
    link: "/productos"
  },
  {
    id: 3,
    title: "Combos Ejecutivos",
    subtitle: "Plato + Bebida + Postre por un precio especial de mediodía.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    interval: 4000,
    link: "/productos"
  }
];

export default function HeroCarousel() {
  return (
    <div className="hero-carousel-container">
      <div 
        id="heroPromosCarousel" 
        className="carousel slide carousel-fade" 
        data-bs-ride="carousel"
      >
        {/* Indicadores inferiores */}
        <div className="carousel-indicators">
          {PROMOS.map((promo, index) => (
            <button
              key={promo.id}
              type="button"
              data-bs-target="#heroPromosCarousel"
              data-bs-slide-to={index}
              className={index === 0 ? "active" : ""}
              aria-current={index === 0 ? "true" : "false"}
              aria-label={`Promoción ${index + 1}`}
            ></button>
          ))}
        </div>

        {/* Diapositivas */}
        <div className="carousel-inner">
          {PROMOS.map((promo, index) => (
            <div 
              key={promo.id} 
              className={`carousel-item ${index === 0 ? "active" : ""}`}
              data-bs-interval={promo.interval}
            >
              <div className="carousel-img-wrapper">
                <img 
                  src={promo.image} 
                  className="d-block w-100 carousel-promo-img" 
                  alt={promo.title} 
                />
                <div className="carousel-overlay"></div>
              </div>

              <div className="carousel-caption">
                <span className="promo-badge">¡Promoción!</span>
                <h5>{promo.title}</h5>
                <p>{promo.subtitle}</p>
                <Link to={promo.link} className="btn-promo-action">
                  Ver Oferta
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Botones de navegación (Anterior / Siguiente) */}
        <button 
          className="carousel-control-prev" 
          type="button" 
          data-bs-target="#heroPromosCarousel" 
          data-bs-slide="prev"
        >
        </button>

        <button 
          className="carousel-control-next" 
          type="button" 
          data-bs-target="#heroPromosCarousel" 
          data-bs-slide="next"
        >
        </button>
      </div>
    </div>
  );
}