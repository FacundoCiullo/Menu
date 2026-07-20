import React, { useState } from "react";
import "./style/Item.css";
import { HeartFill, Heart } from "react-bootstrap-icons";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";

const Item = ({ producto, colorSeleccionado, handleQuickView }) => {
  const [hover, setHover] = useState(false);

  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();

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

  return (
    <div
      className={`item-card ${hover ? "hover" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => handleQuickView(producto)}
      role="button"
      tabIndex={0}
    >
      {/* FAVORITO */}
      <span className="item-fav" onClick={handleFavorito}>
        {esFavorito ? (
          <HeartFill size={22} color="#ffcc00" />
        ) : (
          <Heart size={22} color="white" />
        )}
      </span>

      {/* IMAGEN */}
      <div className="item-img-wrapper">
        <img
          src={imagenFinal}
          alt={producto.titulo || producto.nombre}
          className="item-img"
        />
      </div>

      {/* INFO */}
      <div className="item-info">
        <h6 className="item-title">
          {producto.marca ? `${producto.marca} ` : ""}
          {producto.titulo || producto.nombre}
        </h6>

        {producto.descripcion && (
          <h5 className="item-descripcion">{producto.descripcion}</h5>
        )}

        <div className="item-bottom">
          <p className="item-precio">${producto.precio}</p>
        </div>
      </div>
    </div>
  );
};

export default Item;