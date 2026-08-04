import React, { useState } from "react";
import "./style/item.css";
import { HeartFill, Heart, PlusLg, TagFill } from "react-bootstrap-icons";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";

const Item = ({ producto, handleQuickView }) => {
  const [hover, setHover] = useState(false);

  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();

  const esFavorito = isFavorite(producto?.id);

  // Lectura exacta del stock en DB (si no existe o es null/undefined, evalúa a 0)
  const stockDisponible = producto?.stock !== undefined && producto?.stock !== null ? Number(producto.stock) : 0;
  const esAgotado = stockDisponible <= 0;

  // Datos de oferta e imagen directo del producto base
  const tieneOferta = Boolean(producto?.oferta);
  const porcentaje = Number(producto?.descuentoPorcentaje || 0);

  const imagenFinal = producto?.imagen || producto?.pictureUrl || "/img/no-image.png";

  const handleFavorito = (e) => {
    e.stopPropagation();
    if (!user) return;
    toggleFavorite(producto);
  };

  // Precio base directo del producto
  const precioBase = Number(producto?.precio || 0);
  const precioAnterior = Number(producto?.precioAnterior || 0);

  // La oferta es válida si está marcada como oferta y el precio anterior es mayor al precio base
  const mostrarOferta = tieneOferta && precioAnterior > precioBase;

  return (
    <div
      className={`item-card ${hover ? "hover" : ""} ${esAgotado ? "out-of-stock" : ""}`}
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
            <TagFill size={14} /> -{porcentaje}% OFF
          </div>
        )}

        {/* BADGES DIETARIOS (Sin TACC / Vegano) */}
        {(producto?.sinTacc || producto?.vegano) && (
          <div className="item-dietary-badges">
            {producto?.sinTacc && (
              <img
                src="img/sin-tacc.png"
                alt="Sin TACC"
                title="Sin TACC / Sin Gluten"
                className="item-dietary-icon"
              />
            )}
            
            {producto?.vegano && (
              <img
                src="img/vegan_circle.png"
                alt="Apto Vegano"
                title="Apto Vegano"
                className="item-dietary-icon"
              />
            )}
          </div>
        )}

        <img
          src={imagenFinal}
          alt={producto?.titulo || producto?.nombre || "Producto"}
          className="item-img"
        />
        {esAgotado && (
          <span className="item-badge-agotado"> Agotado</span>
        )}
      </div>

      {/* INFO */}
      <div className="item-info">
        <h6 className="item-title">
          {producto?.titulo || producto?.nombre}
        </h6>


        <div className="item-bottom">
          {mostrarOferta && (
            <span className="item-precio-anterior">
              ${precioAnterior.toLocaleString("es-AR")}
            </span>
          )}

          {/* Precio Base */}
          <p className="item-precio">
            ${precioBase.toLocaleString("es-AR")}
          </p>
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