// src/Admin/components/AdminSidebar.jsx
import React, { useState } from "react";
import { Nav, Offcanvas, Form, InputGroup } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom"; // 1. Importamos useNavigate
import {
  HouseDoorFill,
  Envelope,
  PieChart,
  Calendar3,
  Person,
  Folder,
  Gear,
  Search,
  List,
} from "react-bootstrap-icons";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import "../styles/AdminSidebar.css";

const AdminSidebar = ({ showMobile, onHideMobile }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate(); // 2. Instanciamos el hook de navegación

  // Consumimos el contexto de autenticación
  const { user, logout } = useAuth();

  // 3. Función para cerrar sesión y redirigir
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/home"); // Redirige a /home tras cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Función para saber si un link está activo según la ruta actual
  const isActive = (path) => location.pathname === path;

  const toggleCollapse = () => setCollapsed(!collapsed);

  const menuItems = [
    { label: "Dashboard", icon: <HouseDoorFill />, path: "/admin" },
    { label: "Mensajes", icon: <Envelope />, path: "/admin/mensajes" },
    { label: "Analíticas", icon: <PieChart />, path: "/admin/analiticas" },
    { label: "Órdenes / Schedules", icon: <Calendar3 />, path: "/admin/ordenes" },
    { label: "Usuarios / Clientes", icon: <Person />, path: "/admin/usuarios" },
    { label: "Productos / Menú", icon: <Folder />, path: "/admin/productos" },
    { label: "Configuración", icon: <Gear />, path: "/admin/configuracion" },
  ];

  const MenuContent = () => (
    <div className="sidebar-inner d-flex flex-column h-100 p-3">
      {/* Header con Título y Botón Hamburguesa */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        {!collapsed && <h4 className="fw-bold text-white m-0 logo-text">Dashboard</h4>}
        <button 
          className="btn btn-dark-custom btn-icon-only ms-auto"
          onClick={toggleCollapse}
          title="Colapsar menú"
        >
          <List size={20} />
        </button>
      </div>

      {/* Buscador */}
      {!collapsed ? (
        <InputGroup className="mb-4 search-box">
          <InputGroup.Text className="bg-transparent border-0 text-muted ps-3">
            <Search size={16} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search..."
            className="bg-transparent border-0 text-white shadow-none ps-2"
          />
        </InputGroup>
      ) : (
        <div className="d-flex justify-content-center mb-4">
          <button className="btn btn-dark-custom btn-icon-only">
            <Search size={18} />
          </button>
        </div>
      )}

      {/* Etiqueta Navegación */}
      {!collapsed && (
        <span className="text-uppercase nav-section-title mb-3">Navigation</span>
      )}

      {/* Menú de Links */}
      <Nav className="flex-column gap-2 mb-auto">
        {menuItems.map((item, index) => {
          const active = isActive(item.path);
          return (
            <Nav.Link
              key={index}
              as={Link}
              to={item.path}
              className={`custom-nav-item d-flex align-items-center ${
                active ? "active-item" : ""
              } ${collapsed ? "justify-content-center px-0" : "px-3"}`}
              title={collapsed ? item.label : ""}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-text ms-3">{item.label}</span>}
            </Nav.Link>
          );
        })}
      </Nav>

      {/* Footer / Usuario Logueado */}
      <div className="sidebar-footer pt-3 mt-auto border-top-dark d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3 overflow-hidden">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="User Avatar"
              className="rounded-3 profile-avatar"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="rounded-3 profile-avatar empty-avatar d-flex align-items-center justify-content-center bg-secondary text-white">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          {!collapsed && (
            <div className="user-info text-truncate">
              <small className="text-muted d-block font-size-xs">{user?.email}</small>
              <span className="fw-semibold text-white small">
                {user?.displayName || 'Usuario'}
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button 
            className="btn btn-dark-custom btn-icon-sm" 
            onClick={handleLogout} 
            title="Cerrar sesión"
            type="button"
          >
            <FiLogOut size={14} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* VERSIÓN DESKTOP */}
      <aside
        className={`d-none d-lg-block dark-sidebar position-sticky top-0 vh-100 ${
          collapsed ? "sidebar-collapsed" : "sidebar-expanded"
        }`}
      >
        <MenuContent />
      </aside>

      {/* VERSIÓN MOBILE (Offcanvas) */}
      <Offcanvas
        show={showMobile}
        onHide={onHideMobile}
        responsive="lg"
        className="d-lg-none dark-sidebar-mobile"
      >
        <Offcanvas.Body className="p-0">
          <MenuContent />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default AdminSidebar;