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

  // Datos de oferta e imagen
  const tieneOferta = Boolean(producto.oferta);
  const porcentaje = Number(producto.descuentoPorcentaje || 0);

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

  // 1. Lógica para obtener el precio base actual (o el mínimo si tiene variantes/sizes)
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
  const precioAnterior = Number(producto.precioAnterior || 0);

  // La oferta es válida si está marcada como oferta y el precio anterior es mayor al actual
  const mostrarOferta = tieneOferta && precioAnterior > precioBase;

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
        {mostrarOferta && porcentaje > 0 && (
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

            
            {mostrarOferta && (
              <span className="item-precio-anterior">
                ${precioAnterior.toLocaleString("es-AR")}
              </span>
            )}

            {/* Precio Nuevo (El que ingresás como precio principal) */}
            <p className="item-precio">
              ${precioBase.toLocaleString("es-AR")}
            </p>

            {/* Precio Viejo Tachado */}


        </div>
          {/* BOTÓN + ILUSTRATIVO */}
        <div className="item-add-btn" title="Ver detalle">
          <PlusLg size={18} />
        </div>

      </div>
    </div>
  );
};

export default Item;