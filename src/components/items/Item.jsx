import React, { useState } from "react";
import "./style/item.css";
import { HeartFill, Heart, PlusLg, TagFill } from "react-bootstrap-icons";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";

const Item = ({ producto, colorSeleccionado, handleQuickView }) => {
  const [hover, setHover] = useState(false);

  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();

  const esFavorito = isFavorite(producto.id);

  // Obtener el porcentaje de descuento directamente
  const porcentaje = Number(producto.descuentoPorcentaje || 0);
  const tieneOferta = Boolean(producto.oferta) && porcentaje > 0;

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

  // Lógica para calcular el precio base (mínimo si tiene tamaños/size)
  const obtenerPrecioBase = () => {
    if (producto.size && producto.size.length > 0) {
      const precios = producto.size.map((s) => Number(s.precio)).filter((p) => !isNaN(p));
      if (precios.length > 0) {
        return Math.min(...precios);
      }
    }
    return Number(producto.precio || 0);
  };

  const precioBase = obtenerPrecioBase();
  
  // Calcular precio final con descuento si aplica
  const precioFinal = tieneOferta 
    ? precioBase * (1 - porcentaje / 100) 
    : precioBase;

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
        {/* BADGE DE DESCUENTO */}
        {tieneOferta && (
          <div className="item-product-badge-discount">
            <TagFill size={12} /> -{porcentaje}% OFF
          </div>
        )}

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
          <div className="item-precio-wrapper">
            <p className="item-precio">
              ${precioFinal.toLocaleString("es-AR")}
            </p>
            {tieneOferta && (
              <span className="item-precio-anterior">
                ${precioBase.toLocaleString("es-AR")}
              </span>
            )}
          </div>
          
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