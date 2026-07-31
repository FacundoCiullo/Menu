import { Link, useLocation } from "react-router-dom";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { RiShoppingCart2Line, RiShoppingCart2Fill} from "react-icons/ri";
import {  SiHomeassistantcommunitystore } from "react-icons/si";
import { BsPlusCircle, BsPlusCircleFill  } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import MobileSidebar from "./MobileSidebar";
import "./style/MobileNavbar.css";

const MobileNavbar = () => {
  const location = useLocation();
  const path = location.pathname;

  const [user] = useAuthState(auth);
  const [showSidebar, setShowSidebar] = useState(false);

  const { cartTotal } = useContext(CartContext);
  const totalCarrito = cartTotal();

  return (
    <>
      {/* 🔽 MOBILE NAVBAR (ABAJO) */}
      <nav className="mobile-nav d-md-none" aria-label="Navegación principal mobile">
        <Link 
        to="/Home" 
        className={`nav-center-btn ${path === "/Home" ? "active" : ""}`}  
        aria-label="Inicio">
          {path === "/Home" ? <SiHomeassistantcommunitystore size={28} /> : <SiHomeassistantcommunitystore size={24} />}
        </Link>

        <Link 
        to="/favoritos" 
        className={`nav-center-btn ${path === "/Favoritos" ? "active" : ""}`}  
        aria-label="Favoritos">
          {path === "/favoritos" ? <BsHeartFill size={28} /> : <BsHeart size={24} />}
        </Link>

        <Link 
        to="/Productos" 
        className={`nav-center-btn ${path === "/Productos" ? "active" : ""}`}  
        aria-label="Productos">
          {path === "/Productos"? <BsPlusCircleFill size={38} /> : <BsPlusCircle size={36} />}
        </Link>

        <div className="cart-icon-wrapper" >
          {totalCarrito  > 0 && <span className="cart-badge"> {totalCarrito}</span>}
          <Link 
          to="/cart" 
                  className={`nav-center-btn ${path === "/cart" ? "active" : ""}`}  
          aria-label="Carrito">
            {path === "/cart" ? (
              <RiShoppingCart2Fill size={28} />
            ) : (
              <RiShoppingCart2Line size={24} />
            )}
          </Link>
        </div>

        <button
          className="mobile-avatar-btn "
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
            <FaUserCircle size={46} />
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