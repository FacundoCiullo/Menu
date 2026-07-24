// src/components/layout/NavBar.jsx
import './style/layout.css';
import { Navbar, Nav, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BsBoxes } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa";
import CartWidget from "../user/CartWidget";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import Sidebar from "./Sidebar";
import { useState } from "react";

const NavBar = () => {
  const [user] = useAuthState(auth);
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <>
      <Navbar expand="lg" fixed="top" className="navbar-custom shadow-sm px-4 py-2">
        <div className="d-flex align-items-center navbar-custom2 w-100">

          {/* Logo */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <BsBoxes size={28} className="nav-brand-icon me-2" />
          </Navbar.Brand>

          {/* Links Desktop */}
          <Nav className="d-none d-lg-flex align-items-center gap-4">
            <Nav.Link as={Link} to="/" className="nav-underline">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/Productos" className="nav-underline">Menú</Nav.Link>
            <Nav.Link as={Link} to="/Contactos" className="nav-underline">Contactos</Nav.Link>
          </Nav>

          {/* Área de usuario y Carrito */}
          <div className="d-flex align-items-center gap-3">
            <CartWidget />

            {/* Avatar abre sidebar */}
            <Button 
              variant="link" 
              className="p-0 border-0" 
              onClick={() => setShowSidebar(true)}
              aria-label="Menú de usuario"
            >
              {user ? (
                <img 
                  src={user.photoURL} 
                  alt="usuario" 
                  className="nav-avatar" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <FaUserCircle size={28} className="text-secondary" />
              )}
            </Button>
          </div>

        </div>
      </Navbar>

      <Sidebar show={showSidebar} onClose={() => setShowSidebar(false)} />
    </>
  );
};

export default NavBar;