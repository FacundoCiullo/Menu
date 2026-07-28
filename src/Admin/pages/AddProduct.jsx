import { useState, useEffect, useRef } from "react";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/index"; // Asegúrate de que esta ruta apunte a tu firebase/index.js
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  X,
  Upload,
  Pencil,
  TagFill,
  Trash,
  Image as ImageIcon,
} from "react-bootstrap-icons";
import "../styles/AddProduct.css";

const DEFAULT_IMAGE = "/img/edit-1.png";

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
  additionalType: "multiple",
  additionalRequired: false,
};

const AddProduct = ({ isOpen = true, onClose, onProductAdded }) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [sizes, setSizes] = useState([]);
  const [additionals, setAdditionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);

  // Subida de imagen
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Cálculo dinámico de descuento
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

  const handleClose = () => {
    if (onClose) onClose();
    else navigate("/admin/productos");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Manejo de archivo e imagen
  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imagen: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Subida a Firebase Storage con Timeout de seguridad
  const uploadImageToStorage = async (file, folderName) => {
    const sanitizedFolder = folderName
      ? folderName.toLowerCase().trim().replace(/[^a-z0-9]/g, "_")
      : "varios";

    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const storageRef = ref(storage, `img/${sanitizedFolder}/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      // Si a los 8 segundos la subida no responde, fuerza el rechazo para no congelar la APP
      const timer = setTimeout(() => {
        uploadTask.cancel();
        reject(new Error("Timeout en Storage (posible bloqueo CORS o Red)"));
      }, 8000);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
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

  // Tamaños y Adicionales
  const handleAddSize = () => {
    setSizes((prev) => [...prev, { id: "", nombre: "", precio: 0 }]);
  };

  const handleSizeChange = (index, field, value) => {
    const updated = [...sizes];
    updated[index][field] = field === "precio" ? Number(value) : value;
    if (field === "nombre") {
      updated[index].id = value.toLowerCase().trim().replace(/\s+/g, "_");
    }
    setSizes(updated);
  };

  const handleRemoveSize = (index) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddAdditional = () => {
    setAdditionals((prev) => [...prev, { id: "", nombre: "", precio: 0 }]);
  };

  const handleAdditionalChange = (index, field, value) => {
    const updated = [...additionals];
    updated[index][field] = field === "precio" ? Number(value) : value;
    if (field === "nombre") {
      updated[index].id = value.toLowerCase().trim().replace(/\s+/g, "_");
    }
    setAdditionals(updated);
  };

  const handleRemoveAdditional = (index) => {
    setAdditionals((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit / Guardado de producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let finalImageUrl = formData.imagen;

    // 1. Intento de subida de archivo
    if (selectedFile) {
      setIsUploading(true);
      try {
        finalImageUrl = await uploadImageToStorage(
          selectedFile,
          formData.subcategoria || formData.categoria
        );
      } catch (error) {
        console.warn(
          "No se pudo subir la imagen a Storage, guardando producto con fallback:",
          error
        );
        finalImageUrl = DEFAULT_IMAGE;
      } finally {
        setIsUploading(false);
      }
    }

    // 2. Crear documento en Firestore
    try {
      const newProduct = {
        ...formData,
        imagen: finalImageUrl || DEFAULT_IMAGE,
        precio: Number(formData.precio) || 0,
        precioAnterior: formData.oferta ? Number(formData.precioAnterior) || 0 : 0,
        descuentoPorcentaje: formData.oferta ? formData.descuentoPorcentaje : 0,
        stock: Number(formData.stock),
        ...(sizes.length > 0 && { size: sizes }),
        ...(additionals.length > 0 && {
          additional: additionals,
          additionalType: formData.additionalType,
          additionalRequired: formData.additionalRequired,
        }),
      };

      const docRef = await addDoc(collection(db, "items"), newProduct);
      console.log("¡Producto creado con éxito en Firestore! ID:", docRef.id);

      if (onProductAdded) {
        onProductAdded({ id: docRef.id, ...newProduct });
      }

      setFormData(INITIAL_STATE);
      setSizes([]);
      setAdditionals([]);
      handleRemoveImage();
      handleClose();
    } catch (error) {
      console.error("Error al guardar en Firestore:", error);
      alert("Error al guardar en Firestore: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentPreviewSrc = imagePreview || formData.imagen || DEFAULT_IMAGE;
  const hasCustomImage = Boolean(imagePreview || formData.imagen);

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
        {/* COLUMNA IZQUIERDA: Preview */}
        <div className="add-product-preview-column">
          <div className="add-product-image-header">
            <img
              src={currentPreviewSrc}
              alt="Preview Producto"
              className="add-product-header-img"
            />

            <button
              type="button"
              className="add-product-float-btn left-btn"
              onClick={handleClose}
            >
              <ArrowLeft size={20} />
            </button>

            <button
              type="button"
              className="add-product-float-btn right-btn"
              onClick={handleClose}
            >
              <X size={22} />
            </button>

            <div className="add-product-img-actions">
              <button
                type="button"
                className="add-product-upload-btn"
                onClick={handleTriggerFileInput}
                title="Subir desde dispositivo"
              >
                <Upload size={18} />
              </button>

              <button
                type="button"
                className="add-product-upload-btn secondary-action"
                onClick={() => setShowImageUrlInput(!showImageUrlInput)}
                title="Ingresar URL externa"
              >
                <ImageIcon size={18} />
              </button>

              {hasCustomImage && (
                <button
                  type="button"
                  className="add-product-upload-btn delete-action"
                  onClick={handleRemoveImage}
                  title="Eliminar imagen"
                >
                  <Trash size={18} />
                </button>
              )}
            </div>

            {formData.oferta && formData.descuentoPorcentaje > 0 && (
              <div className="add-product-badge-discount">
                <TagFill size={12} /> -{formData.descuentoPorcentaje}% OFF
              </div>
            )}

            {isUploading && (
              <div className="add-product-upload-progress">
                <div
                  className="upload-progress-bar"
                  style={{ width: `${uploadProgress}%` }}
                />
                <span>Subiendo {uploadProgress}%</span>
              </div>
            )}
          </div>

          {showImageUrlInput && (
            <div className="add-product-url-popover">
              <input
                type="text"
                name="imagen"
                placeholder="Pegá la URL externa aquí..."
                value={formData.imagen}
                onChange={handleChange}
                className="add-product-input"
              />
            </div>
          )}

          <div className="add-product-mode-bar">
            <div className="mode-title">
              <span>Modo Edición Activado</span>
              <Pencil size={14} className="pencil-icon" />
            </div>
            <span className="mode-subtitle">Edición de datos y precios</span>
          </div>
        </div>

        {/* COLUMNA DERECHA: Formulario */}
        <div className="add-product-form-column">
          <form onSubmit={handleSubmit} className="add-product-form">
            <div className="add-product-field-group">
              <label className="add-product-label">Título del Producto</label>
              <input
                type="text"
                name="titulo"
                placeholder="ej: Pizza Fugazzeta"
                value={formData.titulo}
                onChange={handleChange}
                required
                className="add-product-input"
              />
            </div>

            <div className="add-product-field-group">
              <label className="add-product-label">Descripción</label>
              <textarea
                name="descripcion"
                placeholder="Mozzarella y abundante cebolla caramelizada."
                value={formData.descripcion}
                onChange={handleChange}
                rows={2}
                className="add-product-textarea"
              />
            </div>

            <div className="add-product-field-group">
              <label className="add-product-label">Categoría & Subcategoría</label>
              <div className="add-product-row">
                <input
                  type="text"
                  name="categoria"
                  placeholder="Categoría (ej: Comidas)"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="add-product-input"
                />
                <input
                  type="text"
                  name="subcategoria"
                  placeholder="Subcategoría (ej: Pizzas)"
                  value={formData.subcategoria}
                  onChange={handleChange}
                  className="add-product-input"
                />
              </div>
            </div>

            <div className="add-product-field-group py-3">
              <div className="price-header-labels">
                <label className="add-product-label">
                  {formData.oferta ? "Precio Oferta / Actual ($)" : "Precio Base ($)"}
                </label>
                {formData.oferta && (
                  <label className="add-product-label old-price-label">Precio Anterior ($)</label>
                )}
                <label className="add-product-checkbox-label highlight-offer">
                  <input
                    type="checkbox"
                    name="oferta"
                    checked={formData.oferta}
                    onChange={handleChange}
                  />
                  <span>En Oferta</span>
                </label>
              </div>
              <div className="add-product-row">
                <input
                  type="number"
                  name="precio"
                  placeholder="Precio Actual"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  className="add-product-input cell-price"
                />
                {formData.oferta && (
                  <input
                    type="number"
                    name="precioAnterior"
                    placeholder="Precio Viejo"
                    value={formData.precioAnterior}
                    onChange={handleChange}
                    className="add-product-input cell-price old-price-input"
                  />
                )}
              </div>
              {formData.oferta && formData.descuentoPorcentaje > 0 && (
                <span className="discount-summary-tag">
                  Aplica un <strong>{formData.descuentoPorcentaje}%</strong> de descuento sobre el precio original.
                </span>
              )}
            </div>

            <fieldset className="add-product-fieldset">
              <legend className="add-product-legend">Atributos y Etiquetas</legend>
              <div className="add-product-grid-checks">
                <label className="add-product-checkbox-label">
                  <input type="checkbox" name="recomendado" checked={formData.recomendado} onChange={handleChange} />
                  Recomendado
                </label>
                <label className="add-product-checkbox-label">
                  <input type="checkbox" name="vegetariano" checked={formData.vegetariano} onChange={handleChange} />
                  Vegetariano
                </label>
                <label className="add-product-checkbox-label">
                  <input type="checkbox" name="vegano" checked={formData.vegano} onChange={handleChange} />
                  Vegano
                </label>
                <label className="add-product-checkbox-label">
                  <input type="checkbox" name="sinTacc" checked={formData.sinTacc} onChange={handleChange} />
                  Sin TACC
                </label>
                <label className="add-product-checkbox-label">
                  <input type="checkbox" name="picante" checked={formData.picante} onChange={handleChange} />
                  Picante
                </label>
              </div>
            </fieldset>

            <fieldset className="add-product-fieldset">
              <legend className="add-product-legend">Tamaños (Variantes)</legend>
              {sizes.map((s, index) => (
                <div key={index} className="add-product-dynamic-row">
                  <input
                    type="text"
                    placeholder="Nombre (ej: Individual / Grande)"
                    value={s.nombre}
                    onChange={(e) => handleSizeChange(index, "nombre", e.target.value)}
                    className="add-product-input"
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={s.precio}
                    onChange={(e) => handleSizeChange(index, "precio", e.target.value)}
                    className="add-product-input"
                  />
                  <button type="button" onClick={() => handleRemoveSize(index)} className="add-product-btn-remove">
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" onClick={handleAddSize} className="add-product-btn-add">
                + Agregar Tamaño
              </button>
            </fieldset>

            <fieldset className="add-product-fieldset">
              <legend className="add-product-legend">Adicionales y Extras</legend>
              {additionals.map((add, index) => (
                <div key={index} className="add-product-dynamic-row">
                  <input
                    type="text"
                    placeholder="Nombre Extra (ej: Queso Extra)"
                    value={add.nombre}
                    onChange={(e) => handleAdditionalChange(index, "nombre", e.target.value)}
                    className="add-product-input"
                  />
                  <input
                    type="number"
                    placeholder="Precio Extra"
                    value={add.precio}
                    onChange={(e) => handleAdditionalChange(index, "precio", e.target.value)}
                    className="add-product-input"
                  />
                  <button type="button" onClick={() => handleRemoveAdditional(index)} className="add-product-btn-remove">
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" onClick={handleAddAdditional} className="add-product-btn-add">
                + Agregar Adicional
              </button>
            </fieldset>

            <div className="add-product-actions">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="add-product-btn-cancel"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="add-product-btn-submit"
              >
                {loading ? "Guardando..." : "Guardar Producto"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;