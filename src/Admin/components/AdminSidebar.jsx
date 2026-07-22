// src/Admin/components/AdminSidebar.jsx
import React, { useState } from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Speedometer,
  Envelope,
  PieChart,
  Calendar3,
  Person,
  Folder,
  Gear,
  ChevronLeft,
  ChevronRight,
} from "react-bootstrap-icons";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import "../styles/AdminSidebar.css";


const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(true); // Inicializa colapsado como en tu captura
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/home");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const isActive = (path) => location.pathname === path;
  const toggleCollapse = () => setCollapsed(!collapsed);

  const menuItems = [
    { label: "Dashboard", icon: <Speedometer />, path: "/admin" },
    { label: "Analíticas", icon: <PieChart />, path: "/admin/analiticas" },
    { label: "Órdenes", icon: <Calendar3 />, path: "/admin/ordenes" },
    { label: "Productos", icon: <Folder />, path: "/admin/productos" },
    { label: "Mensajes", icon: <Envelope />, path: "/admin/mensajes" },
    { label: "Usuarios", icon: <Person />, path: "/admin/usuarios" },
    { label: "Configuración", icon: <Gear />, path: "Home" },
  ];

  return (
    <>
      <aside
        className={`full-height-sidebar ${
          collapsed ? "sidebar-collapsed" : "sidebar-expanded"
        }`}
      >
        {/* Botón flotante en el borde derecho para expandir/colapsar */}
        <button
          className="toggle-sidebar-btn"
          onClick={toggleCollapse}
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        <div className="sidebar-inner d-flex flex-column h-100 p-3">
          {/* Header con Perfil de Admin */}
          <div className="profile-header d-flex align-items-center mb-4 pb-3 border-bottom-dark">
            <div className="profile-avatar-container position-relative flex-shrink-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="profile-avatar"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="profile-avatar empty-avatar d-flex align-items-center justify-content-center">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "A"}
                </div>
              )}
            </div>

            {!collapsed && (
              <div className="user-details ms-3 overflow-hidden">
                <span className="user-role d-block text-uppercase fw-semibold">
                  Administrador
                </span>
                <span className="user-name d-block text-truncate fw-bold">
                  {user?.displayName || "Admin User"}
                </span>
              </div>
            )}
          </div>

          {/* Etiqueta Menú */}


          {/* Opciones de Navegación */}
          <Nav className="flex-column gap-2 mb-auto custom-nav-list">
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

          {/* Footer / Botón de Cerrar Sesión */}
          <div className="sidebar-footer pt-3 mt-auto border-top-dark">
            <button
              className={`logout-btn d-flex align-items-center border-0 bg-transparent w-100 ${
                collapsed ? "justify-content-center px-0" : "px-3"
              }`}
              onClick={handleLogout}
              title="Cerrar sesión"
              type="button"
            >
              <FiLogOut className="logout-icon" size={18} />
              {!collapsed && <span className="ms-3 fw-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;