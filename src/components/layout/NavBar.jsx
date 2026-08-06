// src/components/layout/NavBar.jsx
import "./style/layout.css";
import { Navbar, Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { RiShoppingCart2Line, RiShoppingCart2Fill } from "react-icons/ri";
import { SiHomeassistantcommunitystore } from "react-icons/si";
import { LuNotebookPen, LuNotebookText } from "react-icons/lu";
import { FaUserCircle } from "react-icons/fa";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import Sidebar from "./Sidebar";
import Cart from "../user/Cart";

const NavBar = () => {
  const location = useLocation();
  const path = location.pathname;

  const [user] = useAuthState(auth);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const { cartTotal } = useContext(CartContext);
  const totalCarrito = typeof cartTotal === "function" ? cartTotal() : 0;

  return (
    <>
      <Navbar fixed="top" className="navbar-custom shadow-sm px-4 py-2">
        <div className="d-flex align-items-center justify-content-between w-100">
          
          {/* Links Principales (Mismos items que la barra mobile) */}
          <Nav className="d-none d-md-flex align-items-center gap-4 mx-auto">
            
            {/* 1. INICIO / TIENDA */}
            <Link
              to="/Home"
              className={`nav-desktop-btn ${path.toLowerCase() === "/home" ? "active" : ""}`}
            >
              <SiHomeassistantcommunitystore size={20} />
              <span>Inicio</span>
            </Link>

            {/* 2. PROMOS / FAVORITOS */}
            <Link
              to="/promos"
              className={`nav-desktop-btn ${path.toLowerCase() === "/promos" ? "active" : ""}`}
            >
              {path.toLowerCase() === "/promos" ? (
                <BsHeartFill size={19} />
              ) : (
                <BsHeart size={19} />
              )}
              <span>Promos</span>
            </Link>

            {/* 3. PRODUCTOS / MENÚ */}
            <Link
              to="/Productos"
              className={`nav-desktop-btn ${path.toLowerCase() === "/productos" ? "active" : ""}`}
            >
              {path.toLowerCase() === "/productos" ? (
                <LuNotebookPen size={20} />
              ) : (
                <LuNotebookText size={20} />
              )}
              <span>Menú</span>
            </Link>
          </Nav>

          {/* Acciones Derecha (Carrito + Avatar) */}
          <div className="d-flex align-items-center gap-3 ms-auto">
            
            {/* Botón Carrito */}
            <button
              type="button"
              className={`nav-desktop-btn position-relative ${showCart ? "active" : ""}`}
              onClick={() => setShowCart(true)}
              aria-label="Abrir carrito"
            >
              {totalCarrito > 0 && <span className="cart-badge-desktop">{totalCarrito}</span>}
              {showCart ? (
                <RiShoppingCart2Fill size={22} />
              ) : (
                <RiShoppingCart2Line size={22} />
              )}
              <span className="d-none d-lg-inline">Carrito</span>
            </button>

            {/* Avatar / Perfil de Usuario */}
            <button
              className="desktop-avatar-container ms-2"
              onClick={() => setShowSidebar(true)}
              aria-label="Menú de usuario"
              type="button"
            >
              {user ? (
                <img
                  src={user.photoURL}
                  className="desktop-avatar"
                  alt="Avatar del usuario"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <FaUserCircle className="default-avatar-icon" size={38} />
              )}
            </button>
          </div>

        </div>
      </Navbar>

      {/* Modal / Offcanvas del Carrito */}
      <Cart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
      />

      {/* Sidebar Desktop */}
      <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} />
    </>
  );
};

export default NavBar;