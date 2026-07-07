// src/components/items/Item.jsx
import "./style/Item.css";
import { useState } from "react";
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
    // Evita que se abra QuickView
    e.stopPropagation();

    // Si no está logueado → no agrega el favorito
    if (!user) return;

    toggleFavorite(producto);
  };

  return (
    <div
      className={`item-card ${hover ? "hover" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => handleQuickView(producto)} // QuickView solo al tocar la card
    >
      {/* Badge 
      <span className="item-badge">new</span>
      */}

      
      {/* Favorito - NO abre QuickView */}
      <span className="item-fav" onClick={handleFavorito}>
        {esFavorito ? (
          <HeartFill size={22} color="#ffcc00" />
        ) : (
          <Heart size={22} color="gray" />
        )}
      </span>

      {/* Imagen */}
      <div className="item-img-wrapper">
        <img src={imagenFinal} alt={producto.titulo} className="item-img" />
      </div>

      {/* Info */}
      <div className="item-info">
        <h6 className="item-title">
          {producto.marca} {producto.titulo}
        </h6>
        <p> {producto.descripcion} </p>
        
        <p className="item-precio"> ${producto.precio}</p>
      </div>
    </div>
  );
};

export default Item;
