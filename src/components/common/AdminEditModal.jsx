import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import AdminEditForm from "./AdminEditForm";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";

const AdminEditModal = ({ show, handleClose, producto, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    categoria: "",
    subcategoria: "",
    precio: "",
    precioAnterior: "",
    stock: 0, // 👈 AGREGADO: Manejo de stock
    oferta: false,
    descuentoPorcentaje: 0,
    recomendado: false,
    vegetariano: false,
    vegano: false,
    sinTacc: false,
    picante: false,
    disponible: true,
  });
  const [sizes, setSizes] = useState([]);
  const [additionals, setAdditionals] = useState([]);

  useEffect(() => {
    if (producto && show) {
      setFormData({
        titulo: producto.titulo || producto.nombre || "",
        descripcion: producto.descripcion || "",
        categoria: producto.categoria || "",
        subcategoria: producto.subcategoria || "",
        precio: producto.precio ?? "",
        precioAnterior: producto.precioAnterior ?? "",
        stock: producto.stock ?? 0, // 👈 Cargar stock actual de Firestore
        oferta: Boolean(producto.oferta),
        descuentoPorcentaje: producto.descuentoPorcentaje || 0,
        recomendado: Boolean(producto.recomendado),
        vegetariano: Boolean(producto.vegetariano),
        vegano: Boolean(producto.vegano),
        sinTacc: Boolean(producto.sinTacc),
        picante: Boolean(producto.picante),
        imagen: producto.imagen || producto.pictureUrl || "",
        disponible: producto.disponible !== false,
      });

      setSizes(
        producto.size
          ? producto.size.map((s) => ({ ...s, id: s.id || crypto.randomUUID() }))
          : []
      );
      setAdditionals(
        producto.additional
          ? producto.additional.map((a) => ({ ...a, id: a.id || crypto.randomUUID() }))
          : []
      );
    }
  }, [producto, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: val };

      if (name === "precio" || name === "precioAnterior" || name === "oferta") {
        const precioActual = Number(name === "precio" ? val : updated.precio) || 0;
        const precioViejo = Number(name === "precioAnterior" ? val : updated.precioAnterior) || 0;
        const enOferta = name === "oferta" ? val : updated.oferta;

        if (enOferta && precioViejo > precioActual && precioViejo > 0) {
          updated.descuentoPorcentaje = Math.round(
            ((precioViejo - precioActual) / precioViejo) * 100
          );
        } else {
          updated.descuentoPorcentaje = 0;
        }
      }

      // 👈 AGREGADO: Si editas el stock a > 0, reactiva automáticamente 'disponible'
      if (name === "stock") {
        const nuevoStock = Number(val);
        if (nuevoStock > 0) {
          updated.disponible = true;
        }
      }

      return updated;
    });
  };

  const handleAddSize = () => {
    setSizes((prev) => [
      ...prev,
      { id: crypto.randomUUID(), nombre: "", precio: "" },
    ]);
  };

  const handleSizeChange = (index, field, value) => {
    setSizes((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: field === "precio" ? value : value };
      return copy;
    });
  };

  const handleRemoveSize = (index) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddAdditional = () => {
    setAdditionals((prev) => [
      ...prev,
      { id: crypto.randomUUID(), nombre: "", precio: "" },
    ]);
  };

  const handleAdditionalChange = (index, field, value) => {
    setAdditionals((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: field === "precio" ? value : value };
      return copy;
    });
  };

  const handleRemoveAdditional = (index) => {
    setAdditionals((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!producto?.id) return;

    setLoading(true);

    try {
      const nuevoStock = Number(formData.stock || 0);

      const payload = {
        ...formData,
        precio: Number(formData.precio || 0),
        precioAnterior: formData.oferta ? Number(formData.precioAnterior || 0) : null,
        stock: nuevoStock, // Guarda el stock numérico
        disponible: nuevoStock > 0 ? true : formData.disponible, // Asegura disponibilidad si stock > 0
        size: sizes
          .filter((s) => s.nombre.trim() !== "")
          .map((s) => ({ ...s, precio: Number(s.precio || 0) })),
        additional: additionals
          .filter((a) => a.nombre.trim() !== "")
          .map((a) => ({ ...a, precio: Number(a.precio || 0) })),
        updatedAt: new Date(),
      };

      const productRef = doc(db, "productos", producto.id);
      await updateDoc(productRef, payload);

      if (typeof onRefresh === "function") {
        await onRefresh();
      }

      handleClose();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      alert("Hubo un error al guardar los cambios.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" className="admin-edit-modal">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Editar Producto</Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: "75vh", overflowY: "auto" }}>
          <AdminEditForm
            formData={formData}
            handleChange={handleChange}
            sizes={sizes}
            handleAddSize={handleAddSize}
            handleSizeChange={handleSizeChange}
            handleRemoveSize={handleRemoveSize}
            additionals={additionals}
            handleAddAdditional={handleAddAdditional}
            handleAdditionalChange={handleAdditionalChange}
            handleRemoveAdditional={handleRemoveAdditional}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="warning" type="submit" disabled={loading} className="fw-bold">
            {loading ? <Spinner animation="border" size="sm" /> : "Guardar Cambios"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AdminEditModal;