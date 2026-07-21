// src/Admin/AdminInicio.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "react-bootstrap";
import AdminSidebar from "../components/AdminSidebar";

const AdminInicio = () => {
  const { user, esAdmin, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="dark" />
        <p>Cargando panel de administración...</p>
      </div>
    );
  }

  if (!user) {
    return <p className="text-center mt-5">⚠️ No estás logueado.</p>;
  }

  if (!esAdmin) {
    return (
      <p className="text-center mt-5">
        🚫 No tenés permisos para acceder a esta página.
      </p>
    );
  }

  return <AdminSidebar />;
};

export default AdminInicio;