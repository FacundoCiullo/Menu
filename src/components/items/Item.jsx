import "./style/Item.css";
import { useState, useContext } from "react";
import { HeartFill, Heart } from "react-bootstrap-icons";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";

const Item = ({ producto, colorSeleccionado, handleQuickView }) => {
  const [hover, setHover] = useState(false);
  const [mostrarCantidad, setMostrarCantidad] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [estadoAgregar, setEstadoAgregar] = useState("normal");

  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const { addItem } = useContext(CartContext);

  const esFavorito = isFavorite(producto.id);

  const imagenFinal = colorSeleccionado && producto.imagenesPorColor && producto.imagenesPorColor[colorSeleccionado]
    ? producto.imagenesPorColor[colorSeleccionado]
    : producto.imagen;

  // PRECIO DINÁMICO
  const precioActual = producto.precio * cantidad;

  const handleFavorito = (e) => {
    e.stopPropagation();
    if (!user) return;
    toggleFavorite(producto);
  };

  const aumentarCantidad = (e) => {
    e.stopPropagation();
    setCantidad(prev => prev + 1);
  };

  const disminuirCantidad = (e) => {
    e.stopPropagation();
    setCantidad(prev => {
      if (prev <= 1) {
        setMostrarCantidad(false);
        return 1;
      }
      return prev - 1;
    });
  };

  const agregarCarrito = (e) => {
    e.stopPropagation();
    // Primer click abre selector
    if (!mostrarCantidad) {
      setMostrarCantidad(true);
      setCantidad(1);
      return;
    }
    // Segundo click agrega
    addItem(producto, cantidad);
    // Animación botón
    setEstadoAgregar("verde");
    setTimeout(() => {
      setEstadoAgregar("check");
    }, 400);
    setTimeout(() => {
      setEstadoAgregar("normal");
    }, 1500);
    // cerrar selector
    setMostrarCantidad(false);
    setCantidad(1);
  };

  return (
    <div
      className={`item-card ${hover ? "hover" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => handleQuickView(producto)}
    >
      {/* FAVORITO */}
      <span className="item-fav" onClick={handleFavorito}>
        {esFavorito ? <HeartFill size={22} color="#ffcc00" /> : <Heart size={22} color="gray" />}
      </span>
      {/* IMAGEN */}
      <div className="item-img-wrapper">
        <img src={imagenFinal} alt={producto.titulo} className="item-img" />
      </div>
      {/* INFO */}
      <div className="item-info">
        <h6 className="item-title">
          {producto.marca} {" "} {producto.titulo}
        </h6>
        <h5 className="item-descripcion">
          {producto.descripcion}
        </h5>
        <div className="item-bottom">
          <p className="item-precio">
            ${mostrarCantidad ? precioActual : producto.precio}
          </p>
          <div className="add-container">
            {mostrarCantidad && (
              <div className="quantity-pill">
                <button onClick={disminuirCantidad}>−</button>
                <span>{cantidad}</span>
                <button onClick={aumentarCantidad}>+</button>
              </div>
            )}
            <button className={`item-add-btn ${estadoAgregar}`} onClick={agregarCarrito}>
              {estadoAgregar === "check" ? <i className="bi bi-check-circle-fill"></i> : <i className="bi bi-plus-circle"></i>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Item;