import { Link, useLocation } from "react-router-dom";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { RiShoppingCart2Line, RiShoppingCart2Fill } from "react-icons/ri";
import { SiHomeassistantcommunitystore } from "react-icons/si";
import { LuNotebookPen,LuNotebookText  } from "react-icons/lu";
import { FaUserCircle } from "react-icons/fa";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/index";
import { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import MobileSidebar from "./MobileSidebar";
import Cart from "../user/Cart"; 
import "./style/MobileNavbar.css";

const MobileNavbar = () => {
  const location = useLocation();
  const path = location.pathname;

  const [user] = useAuthState(auth);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const { cartTotal } = useContext(CartContext);
  const totalCarrito = typeof cartTotal === "function" ? cartTotal() : 0;

  return (
    <>
      {/* 🔽 MOBILE NAVBAR (ABAJO) */}
      <nav className="mobile-nav d-md-none" aria-label="Navegación principal mobile">
        {/* 1. INICIO / TIENDA */}
        <Link 
          to="/Home" 
          className={`nav-item-btn ${path.toLowerCase() === "/home" ? "active" : ""}`}  
          aria-label="Inicio">
          <SiHomeassistantcommunitystore size={22} />
        </Link>

        {/* 2. FAVORITOS */}
        <Link 
          to="/promos" 
          className={`nav-item-btn ${path.toLowerCase() === "/promos" ? "active" : ""}`}  
          aria-label="Promos">
          {path.toLowerCase() === "/promos" ? (
            <BsHeartFill size={20} />
          ) : (
            <BsHeart size={20} />
          )}
        </Link>

        {/* 3. PRODUCTOS / MAS */}
        <Link 
          to="/Productos" 
          className={`nav-item-btn plus-btn ${path.toLowerCase() === "/productos" ? "active" : ""}`}  
          aria-label="Productos">
          {path.toLowerCase() === "/productos" ? (
            <LuNotebookPen  size={22} />
          ) : (
            <LuNotebookText  size={22} />
          )}
        </Link>

        {/* 4. CARRITO */}
        <button 
          type="button"
          className={`nav-item-btn ${showCart ? "active" : ""}`}  
          onClick={() => setShowCart(true)}
          aria-label="Carrito"
        >
          {totalCarrito > 0 && <span className="cart-badge">{totalCarrito}</span>}
          {showCart ? (
            <RiShoppingCart2Fill size={22} />
          ) : (
            <RiShoppingCart2Line size={22} />
          )}
        </button>

        {/* 5. PERFIL DE USUARIO */}
        <button
          className="mobile-avatar-container"
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
            <FaUserCircle className="default-avatar-icon" size={48} />
          )}
        </button>
      </nav>

      {/* MODAL DEL CARRITO */}
      <Cart
        isOpen={showCart} 
        onClose={() => setShowCart(false)} 
      />

      {/* SIDEBAR MOBILE */}
      <MobileSidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        user={user}
      />
    </>
  );
};

export default MobileNavbar;