import { useState, useEffect, useRef } from "react";
import { doc, updateDoc, deleteDoc, collection, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { ArrowLeft, X, Upload, Pencil, TagFill, Trash, Image as ImageIcon } from "react-bootstrap-icons";
import "../styles/AddProduct.css"; // Usa los estilos compartidos que ya tenías

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop";

const INITIAL_STATE = {
  titulo: "",
  descripcion: "",
  categoria: "",
  subcategoria: "",
  imagen: "",
  precio: "",
  precioAnterior: "",
  descuentoPorcentaje: 0,
  stock: 999,
  oferta: false,
  nuevo: true,
  masVendido: false,
  recomendado: false,
  vegetariano: false,
  vegano: false,
  sinTacc: false,
  picante: false,
  disponible: true,
};

const ProductModal = ({ isOpen, onClose, productToEdit, onProductSaved, onProductDeleted }) => {
  const isEditing = Boolean(productToEdit?.id);

  const [formData, setFormData] = useState(INITIAL_STATE);
  const [sizes, setSizes] = useState([]);
  const [additionals, setAdditionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);

  // Estados para imagen
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        ...INITIAL_STATE,
        ...productToEdit,
        precio: productToEdit.precio || "",
        precioAnterior: productToEdit.precioAnterior || "",
      });
      setSizes(productToEdit.size || []);
      setAdditionals(productToEdit.additional || []);
      setImagePreview(productToEdit.imagen || null);
    } else {
      setFormData(INITIAL_STATE);
      setSizes([]);
      setAdditionals([]);
      setImagePreview(null);
    }
  }, [productToEdit, isOpen]);

  // Cálculo de descuento
  useEffect(() => {
    const pActual = Number(formData.precio);
    const pAnterior = Number(formData.precioAnterior);

    if (formData.oferta && pAnterior > 0 && pActual > 0 && pAnterior > pActual) {
      const diff = pAnterior - pActual;
      const pct = Math.round((diff / pAnterior) * 100);
      setFormData((prev) => ({ ...prev, descuentoPorcentaje: pct }));
    } else {
      setFormData((prev) => ({ ...prev, descuentoPorcentaje: 0 }));
    }
  }, [formData.precio, formData.precioAnterior, formData.oferta]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imagen: "" }));
  };

  const uploadImageToStorage = async (file, folderName) => {
    const sanitizedFolder = folderName ? folderName.toLowerCase().trim().replace(/[^a-z0-9]/g, "_") : "varios";
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const storageRef = ref(storage, `img/${sanitizedFolder}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        uploadTask.cancel();
        reject(new Error("Timeout en Storage"));
      }, 8000);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        },
        async () => {
          clearTimeout(timer);
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  // GUARDAR (CREAR O EDITAR)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let finalImageUrl = formData.imagen;

    if (selectedFile) {
      setIsUploading(true);
      try {
        finalImageUrl = await uploadImageToStorage(selectedFile, formData.subcategoria || formData.categoria);
      } catch (err) {
        console.warn("Storage falló, usando imagen fallback:", err);
        finalImageUrl = imagePreview || DEFAULT_IMAGE;
      } finally {
        setIsUploading(false);
      }
    }

    const payload = {
      ...formData,
      imagen: finalImageUrl || DEFAULT_IMAGE,
      precio: Number(formData.precio) || 0,
      precioAnterior: formData.oferta ? Number(formData.precioAnterior) || 0 : 0,
      descuentoPorcentaje: formData.oferta ? formData.descuentoPorcentaje : 0,
      stock: Number(formData.stock),
      ...(sizes.length > 0 && { size: sizes }),
      ...(additionals.length > 0 && { additional: additionals }),
    };

    try {
      if (isEditing) {
        const docRef = doc(db, "items", productToEdit.id);
        await updateDoc(docRef, payload);
        if (onProductSaved) onProductSaved({ id: productToEdit.id, ...payload });
      } else {
        const docRef = await addDoc(collection(db, "items"), payload);
        if (onProductSaved) onProductSaved({ id: docRef.id, ...payload });
      }
      onClose();
    } catch (error) {
      console.error("Error al guardar en Firestore:", error);
      alert("Error al guardar el producto: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // BORRAR PRODUCTO
  const handleDeleteProduct = async () => {
    if (!productToEdit?.id) return;
    const confirmDelete = window.confirm(`¿Estás seguro de borrar "${formData.titulo}"?`);
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, "items", productToEdit.id));
      if (onProductDeleted) onProductDeleted(productToEdit.id);
      onClose();
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      alert("Error al borrar producto: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentPreviewSrc = imagePreview || formData.imagen || DEFAULT_IMAGE;

  return (
    <div className="add-product-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />

      <div className="add-product-card">
        {/* PREVIEW + IMAGEN */}
        <div className="add-product-preview-column">
          <div className="add-product-image-header">
            <img src={currentPreviewSrc} alt="Preview" className="add-product-header-img" />

            <button type="button" className="add-product-float-btn left-btn" onClick={onClose}>
              <ArrowLeft size={20} />
            </button>
            <button type="button" className="add-product-float-btn right-btn" onClick={onClose}>
              <X size={22} />
            </button>

            <div className="add-product-img-actions">
              <button type="button" className="add-product-upload-btn" onClick={() => fileInputRef.current?.click()}>
                <Upload size={18} />
              </button>
              <button type="button" className="add-product-upload-btn secondary-action" onClick={() => setShowImageUrlInput(!showImageUrlInput)}>
                <ImageIcon size={18} />
              </button>
              {isEditing && (
                <button type="button" className="add-product-upload-btn delete-action" onClick={handleDeleteProduct} title="Eliminar Producto de la DB">
                  <Trash size={18} />
                </button>
              )}
            </div>

            {formData.oferta && formData.descuentoPorcentaje > 0 && (
              <div className="add-product-badge-discount">
                <TagFill size={12} /> -{formData.descuentoPorcentaje}% OFF
              </div>
            )}
          </div>

          {showImageUrlInput && (
            <div className="add-product-url-popover">
              <input
                type="text"
                name="imagen"
                placeholder="Pegá la URL de la imagen aquí..."
                value={formData.imagen}
                onChange={handleChange}
                className="add-product-input"
              />
            </div>
          )}

          <div className="add-product-mode-bar">
            <div className="mode-title">
              <span>{isEditing ? "Modo Edición Activado" : "Nuevo Producto"}</span>
              <Pencil size={14} className="pencil-icon" />
            </div>
            <span className="mode-subtitle">{isEditing ? `ID: ${productToEdit.id}` : "Crea un producto nuevo"}</span>
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="add-product-form-column">
          <form onSubmit={handleSubmit} className="add-product-form">
            <div className="add-product-field-group">
              <label className="add-product-label">Título del Producto</label>
              <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} required className="add-product-input" />
            </div>

            <div className="add-product-field-group">
              <label className="add-product-label">Descripción</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2} className="add-product-textarea" />
            </div>

            <div className="add-product-field-group">
              <label className="add-product-label">Categoría & Subcategoría</label>
              <div className="add-product-row">
                <input type="text" name="categoria" placeholder="Categoría" value={formData.categoria} onChange={handleChange} className="add-product-input" />
                <input type="text" name="subcategoria" placeholder="Subcategoría" value={formData.subcategoria} onChange={handleChange} className="add-product-input" />
              </div>
            </div>

            <div className="add-product-field-group py-3">
              <div className="price-header-labels">
                <label className="add-product-label">Precio ($)</label>
                <label className="add-product-checkbox-label highlight-offer">
                  <input type="checkbox" name="oferta" checked={formData.oferta} onChange={handleChange} />
                  <span>En Oferta</span>
                </label>
              </div>
              <div className="add-product-row">
                <input type="number" name="precio" value={formData.precio} onChange={handleChange} required className="add-product-input cell-price" />
                {formData.oferta && (
                  <input type="number" name="precioAnterior" placeholder="Precio Anterior" value={formData.precioAnterior} onChange={handleChange} className="add-product-input cell-price old-price-input" />
                )}
              </div>
            </div>

            <fieldset className="add-product-fieldset">
              <legend className="add-product-legend">Atributos</legend>
              <div className="add-product-grid-checks">
                <label className="add-product-checkbox-label">
                  <input type="checkbox" name="vegano" checked={formData.vegano} onChange={handleChange} /> Vegano
                </label>
                <label className="add-product-checkbox-label">
                  <input type="checkbox" name="sinTacc" checked={formData.sinTacc} onChange={handleChange} /> Sin TACC
                </label>
                <label className="add-product-checkbox-label">
                  <input type="checkbox" name="vegetariano" checked={formData.vegetariano} onChange={handleChange} /> Vegetariano
                </label>
              </div>
            </fieldset>

            <div className="add-product-actions">
              {isEditing && (
                <button type="button" onClick={handleDeleteProduct} disabled={loading} className="add-product-btn-cancel" style={{ color: "#ff4d4d", borderColor: "#ff4d4d" }}>
                  Borrar Producto
                </button>
              )}
              <button type="submit" disabled={loading} className="add-product-btn-submit">
                {loading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Producto"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;