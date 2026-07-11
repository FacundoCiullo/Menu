// src/components/items/Item.jsx
import "./style/Item.css";
import { useState, useContext } from "react";
import { HeartFill, Heart } from "react-bootstrap-icons";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";

const Item = ({ producto, colorSeleccionado, handleQuickView }) => {
  const [hover, setHover] = useState(false);
  const [agregado, setAgregado] = useState(false);

  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();

  const { addItem } = useContext(CartContext);

  const esFavorito = isFavorite(producto.id);

  const imagenFinal =
    colorSeleccionado &&
    producto.imagenesPorColor &&
    producto.imagenesPorColor[colorSeleccionado]
      ? producto.imagenesPorColor[colorSeleccionado]
      : producto.imagen;

  const handleFavorito = (e) => {
    e.stopPropagation();

    if (!user) return;

    toggleFavorite(producto);
  };

  const handleAgregarCarrito = (e) => {
    e.stopPropagation();

    addItem(
      {
        ...producto,
        color: colorSeleccionado || null,
        talle: null,
      },
      1
    );

    // Mostrar check verde durante 1.5 segundos
    setAgregado(true);

    setTimeout(() => {
      setAgregado(false);
    }, 1500);
  };

  return (
    <div
      className={`item-card ${hover ? "hover" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => handleQuickView(producto)}
    >
      {/* Favorito */}
      <span className="item-fav" onClick={handleFavorito}>
        {esFavorito ? (
          <HeartFill size={22} color="#ffcc00" />
        ) : (
          <Heart size={22} color="gray" />
        )}
      </span>

      {/* Imagen */}
      <div className="item-img-wrapper">
        <img
          src={imagenFinal}
          alt={producto.titulo}
          className="item-img"
        />
      </div>

      {/* Información */}
      <div className="item-info">
        <h6 className="item-title">
          {producto.marca} {producto.titulo}
        </h6>

        <h5 className="item-descripcion">
          {producto.descripcion}
        </h5>

        <div className="item-bottom">
          <p className="item-precio">${producto.precio}</p>

          <button
            className={`item-add-btn ${agregado ? "success" : ""}`}
            onClick={handleAgregarCarrito}
            aria-label="Agregar al carrito"
          >
            {agregado ? (
              <i className="bi bi-check-circle-fill"></i>
            ) : (
              <i className="bi bi-plus-circle"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Item;