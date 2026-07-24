import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineHome, AiFillHome, AiOutlineArrowLeft } from "react-icons/ai";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { RiShoppingCart2Line, RiShoppingCart2Fill } from "react-icons/ri";
import { LuBoxes } from "react-icons/lu";
import { FaUserCircle } from "react-icons/fa";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import MobileSidebar from "./MobileSidebar";
import "./style/MobileNavbar.css";

const MobileNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const [user] = useAuthState(auth);
  const [showSidebar, setShowSidebar] = useState(false);

  const { cartTotal } = useContext(CartContext);
  const totalCarrito = cartTotal();

  // Títulos automáticos según la ruta
  const titles = {
    "/Home": "App Menu Demo",
    "/favoritos": "Favoritos",
    "/Productos": "Menú",
    "/cart": "Carrito",
    "/admin": "Administrador",
    "/historial": "Historial",
  };

  const pageTitle = titles[path] || "Mi Tienda";

  return (
    <>
      {/* 🔼 MOBILE TOP HEADER */}
      <header className="mobile-header d-md-none">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Volver atrás">
          <AiOutlineArrowLeft size={22} />
        </button>

        <h2 className="header-title">{pageTitle}</h2>

        <div className="header-cart">
          {totalCarrito > 0 && <span className="cart-badge">{totalCarrito}</span>}

          <Link to="/cart" aria-label="Ver carrito">
            {path === "/cart" ? (
              <RiShoppingCart2Fill size={24} />
            ) : (
              <RiShoppingCart2Line size={24} />
            )}
          </Link>
        </div>
      </header>

      {/* 🔽 MOBILE NAVBAR (ABAJO) */}
      <nav className="mobile-nav d-md-none" aria-label="Navegación principal mobile">
        <Link to="/Home" className={path === "/Home" ? "active" : ""} aria-label="Inicio">
          {path === "/Home" ? <AiFillHome size={24} /> : <AiOutlineHome size={24} />}
        </Link>

        <Link to="/favoritos" className={path === "/favoritos" ? "active" : ""} aria-label="Favoritos">
          {path === "/favoritos" ? <BsHeartFill size={22} /> : <BsHeart size={22} />}
        </Link>

        <Link to="/Productos" className={path === "/Productos" ? "active" : ""} aria-label="Productos">
          <LuBoxes size={26} />
        </Link>

        <div className="cart-icon-wrapper">
          {totalCarrito > 0 && <span className="cart-badge">{totalCarrito}</span>}
          <Link to="/cart" className={path === "/cart" ? "active" : ""} aria-label="Carrito">
            {path === "/cart" ? (
              <RiShoppingCart2Fill size={26} />
            ) : (
              <RiShoppingCart2Line size={26} />
            )}
          </Link>
        </div>

        <button
          className="mobile-avatar-btn"
          onClick={() => setShowSidebar(!showSidebar)}
          aria-label="Abrir menú de usuario"
          type="button"
        >
          {user ? (
            <img
              src={user.photoURL}
              className="mobile-avatar"
              alt="Avatar del usuario"
              referrerPolicy="no-referrer"
            />
          ) : (
            <FaUserCircle size={24} />
          )}
        </button>
      </nav>

      <MobileSidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        user={user}
      />
    </>
  );
};

export default MobileNavbar;