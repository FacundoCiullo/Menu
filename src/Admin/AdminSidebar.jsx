import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import "./styles/AdminSidebar.css";


const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <i className="bi bi-box-arrow-left icon"></i>
      <div className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        
        <div className="logo-details">
          <i className="bi bi-box-arrow-right "></i>
          <div className="logo_name">Admin Panel</div>
          <i
            className={`bi ${isOpen ? "bi bi-box-arrow-left" : "bx-menu"}`}
            id="btn"
            onClick={toggleSidebar}
          ></i>
        </div>

        <ul className="nav-list">
          {/* MENÚ DE OPINIONES Y SECCIONES */}
          <li>
            <Link to="/admin">
              <i className="bi bi-columns-gap"></i>
              <span className="links_name">Dashboard</span>
            </Link>
            <span className="tooltip">Dashboard</span>
          </li>

          <li>
            <Link to="/admin/usuarios">
              <i className="bi bi-journal-check"></i>
              <span className="links_name">Pedidos / Órdenes</span>
            </Link>
            <span className="tooltip">Órdenes</span>
          </li>

          <li>
            <Link to="/admin/productos">
              <i className="bi bi-box2"></i>
              <span className="links_name">Productos</span>
            </Link>
            <span className="tooltip">Productos</span>
          </li>

          <li>
            <Link to="/admin/usuarios">
              <i className="bi bi-folder-symlink"></i>
              <span className="links_name">Archivos</span>
            </Link>
            <span className="tooltip">Archivos</span>
          </li>

          <li>
            <Link to="/admin/usuarios">
              <i className="bi bi-person-lines-fill"></i>
              <span className="links_name">Usuarios</span>
            </Link>
            <span className="tooltip">Usuarios</span>
          </li>

          <li>
            <Link to="/admin/usuarios">
              <i className="bi bi-inbox-fill"></i>
              <span className="links_name">Mensajes</span>
            </Link>
            <span className="tooltip">Mensajes</span>
          </li>

          <li>
            <Link to="/admin/configuracion">
              <i className="bi bi-gear"></i>
              <span className="links_name">Configuración</span>
            </Link>
            <span className="tooltip">Configuración</span>
          </li>

          <li>
            <Link to="/Home">
              <i className="bi bi-gear"></i>
              <span className="links_name">Inicio</span>
            </Link>
            <span className="tooltip">Inicio</span>
          </li>

          {/* PERFIL */}
          <li className="profile">
            <div className="profile-details">
              <img src="/assets/profile-placeholder.png" alt="Perfil Admin" />
              <div className="name_job">
                <div className="name">Administrador</div>
                <div className="job">Admin Store</div>
              </div>
            </div>
            <i className="bx bx-log-out" id="log_out"></i>
          </li>
        </ul>
      </div>

      {/* ÁREA DE CONTENIDO DINÁMICO */}
      <section className={`home-section ${isOpen ? "open" : ""}`}>
        <div className="container-1">
          {/* Aquí se renderizará el componente de la ruta hija actual */}
          <Outlet />
        </div>
      </section>
    </div>
  );
};

export default AdminSidebar;