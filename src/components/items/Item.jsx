import React, { useState } from "react";
import "./style/item.css";
import { HeartFill, Heart, PlusLg } from "react-bootstrap-icons";
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
      : producto.imagen || producto.pictureUrl || "/img/no-image.png";

  const handleFavorito = (e) => {
    e.stopPropagation();
    if (!user) return;
    toggleFavorite(producto);
  };

  // Lógica para mostrar el precio correcto (mínimo si tiene tamaños/size)
  const obtenerPrecioDisplay = () => {
    if (producto.size && producto.size.length > 0) {
      const precios = producto.size.map((s) => Number(s.precio)).filter((p) => !isNaN(p));
      if (precios.length > 0) {
        const precioMinimo = Math.min(...precios);
        return `$${precioMinimo.toLocaleString("es-AR")}`;
      }
    }

    const precioBase = Number(producto.precio || 0);
    return `$${precioBase.toLocaleString("es-AR")}`;
  };

  return (
    <div
      className={`item-card ${hover ? "hover" : ""} ${producto.disponible === false ? "out-of-stock" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => handleQuickView(producto)}
      role="button"
      tabIndex={0}
    >
      {/* FAVORITO */}
      <span className="item-fav" onClick={handleFavorito} title="Favorito">
        {esFavorito ? (
          <HeartFill size={20} color="#ffcc00" />
        ) : (
          <Heart size={20} color="var(--iqv-text-primary, #ffffff)" />
        )}
      </span>

      {/* IMAGEN */}
      <div className="item-img-wrapper">
        <img
          src={imagenFinal}
          alt={producto.titulo || producto.nombre}
          className="item-img"
        />
        {producto.disponible === false && (
          <span className="badge-agotado">Agotado</span>
        )}
      </div>

      {/* INFO */}
      <div className="item-info">
        <h6 className="item-title">
          {producto.titulo || producto.nombre}
        </h6>

        {producto.descripcion && (
          <h5 className="item-descripcion">{producto.descripcion}</h5>
        )}

        <div className="item-bottom">
          <p className="item-precio">{obtenerPrecioDisplay()}</p>
          
          {/* BOTÓN + ILUSTRATIVO */}
          <div className="item-add-btn" title="Ver detalle">
            <PlusLg size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Item;