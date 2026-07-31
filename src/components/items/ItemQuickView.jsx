import React, { useState, useEffect, useRef, useContext } from "react";
import { Modal } from "react-bootstrap";
import { CartContext } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { 
  Heart, 
  HeartFill, 
  Plus, 
  Dash, 
  X, 
  PencilSquare, 
  CheckLg, 
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Trash,
  TagFill,
} from "react-bootstrap-icons";

// CONEXION CON FIREBASE
import { db, storage } from "../../firebase"; 
import { doc, updateDoc, deleteDoc, collection, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// SUB-COMPONENTES
import ToastModal from "../common/ToastModal";
import AdminEditForm from "../common/AdminEditForm";
import ProductOptions from "../common/ProductOptions";

// ESTILOS
import "./style/itemQuickView.css";

// IMAGENES
import sinTaccIcon from "../../assets/sin-tacc.png"; 
import veganoIcon from "../../assets/vegan_circle.png";

const DEFAULT_IMAGE = "/img/edit-1.png";

const ItemQuickView = ({ show, handleClose, producto, onRefresh }) => {
  const isCreationMode = !producto;

  const [cantidad, setCantidad] = useState(1);
  const [sizeSeleccionado, setSizeSeleccionado] = useState(null);
  const [additionalSeleccionados, setAdditionalSeleccionados] = useState([]);
  const [editando, setEditando] = useState(false);
  const [cargandoGuardado, setCargandoGuardado] = useState(false);
  const [cargandoEliminacion, setCargandoEliminacion] = useState(false);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Formulario Admin
  const [formData, setFormData] = useState({});
  const [sizes, setSizes] = useState([]);
  const [additionals, setAdditionals] = useState([]);

  // Subida de imagen
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);

  const fileInputRef = useRef(null);

  const editandoRef = useRef(editando);
  useEffect(() => {
    editandoRef.current = editando;
  }, [editando]);

  const [toastConfig, setToastConfig] = useState({
    show: false,
    type: "success",
    subheading: "",
    title: "",
    message: ""
  });

  const { addItem } = useContext(CartContext);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { esAdmin } = useAuth();

  const isFav = producto ? isFavorite(producto.id) : false;

  useEffect(() => {
    if (!show) return;

    window.history.pushState({ modalOpen: true }, "");

    const handlePopState = () => {
      if (editandoRef.current && !isCreationMode) {
        setEditando(false);
      } else {
        handleClose();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (window.history.state?.modalOpen) {
        window.history.back();
      }
    };
  }, [show, handleClose, isCreationMode]);

  useEffect(() => {
    if (!show) return;

    if (isCreationMode) {
      setFormData({
        titulo: "",
        descripcion: "",
        categoria: "",
        subcategoria: "",
        precio: "",
        precioAnterior: "",
        stock: 0,
        descuentoPorcentaje: 0,
        oferta: false,
        recomendado: false,
        vegetariano: false,
        vegano: false,
        sinTacc: false,
        picante: false,
        disponible: true,
        imagen: "",
        additionalType: "multiple",
        additionalRequired: false,
      });
      setSizes([]);
      setAdditionals([]);
      setEditando(true);
    } else {
      setSizeSeleccionado(producto.size?.length > 0 ? producto.size[0] : null);
      setAdditionalSeleccionados([]);
      setCantidad(1);

      const stockReal = producto.stock !== undefined && producto.stock !== null ? Number(producto.stock) : 0;

      setFormData({
        titulo: producto.titulo || producto.nombre || "",
        descripcion: producto.descripcion || "",
        categoria: producto.categoria || "",
        subcategoria: producto.subcategoria || "",
        precio: producto.precio || 0,
        precioAnterior: producto.precioAnterior || 0,
        stock: stockReal,
        descuentoPorcentaje: producto.descuentoPorcentaje || 0,
        oferta: Boolean(producto.oferta),
        recomendado: Boolean(producto.recomendado),
        vegetariano: Boolean(producto.vegetariano),
        vegano: Boolean(producto.vegano),
        sinTacc: Boolean(producto.sinTacc),
        picante: Boolean(producto.picante),
        disponible: producto.disponible !== false,
        imagen: producto.imagen || producto.pictureUrl || "",
        additionalType: producto.additionalType || "multiple",
        additionalRequired: Boolean(producto.additionalRequired),
      });

      setSizes(producto.size ? producto.size.map(s => ({ ...s })) : []);
      setAdditionals(producto.additional ? producto.additional.map(a => ({ ...a })) : []);
      setEditando(false);
    }

    setSelectedFile(null);
    setImagePreview(null);
    setShowImageUrlInput(false);
    setShowConfirmDelete(false);
  }, [producto, show, isCreationMode]);

  useEffect(() => {
    if (!editando) return;
    const pActual = Number(formData.precio);
    const pAnterior = Number(formData.precioAnterior);

    if (formData.oferta && pAnterior > pActual && pActual > 0) {
      const diff = pAnterior - pActual;
      const pct = Math.round((diff / pAnterior) * 100);
      setFormData((prev) => ({ ...prev, descuentoPorcentaje: pct }));
    } else {
      setFormData((prev) => ({ ...prev, descuentoPorcentaje: 0 }));
    }
  }, [formData.precio, formData.precioAnterior, formData.oferta, editando]);

  const handleChangeAdmin = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: val };
      
      // ✅ Si se edita el stock a mayor que 0, se habilita 'disponible' automáticamente
      if (name === "stock") {
        const nuevoStock = Number(val);
        if (nuevoStock > 0) {
          updated.disponible = true;
        }
      }
      return updated;
    });
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImageToStorage = async (file, folderName) => {
    const sanitizedFolder = folderName
      ? folderName.toLowerCase().trim().replace(/[^a-z0-9]/g, "_")
      : "varios";

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
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
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

  const handleAddSize = () => setSizes((prev) => [...prev, { id: "", nombre: "", precio: 0, precioAnterior: 0 }]);
  
  const handleSizeChange = (index, field, value) => {
    const updated = [...sizes];
    updated[index][field] = field.includes("precio") ? Number(value) : value;
    if (field === "nombre") updated[index].id = value.toLowerCase().trim().replace(/\s+/g, "_");
    setSizes(updated);
  };

  const handleRemoveSize = (index) => setSizes((prev) => prev.filter((_, i) => i !== index));

  const handleAddAdditional = () => setAdditionals((prev) => [...prev, { id: "", nombre: "", precio: 0 }]);
  
  const handleAdditionalChange = (index, field, value) => {
    const updated = [...additionals];
    updated[index][field] = field === "precio" ? Number(value) : value;
    if (field === "nombre") updated[index].id = value.toLowerCase().trim().replace(/\s+/g, "_");
    setAdditionals(updated);
  };

  const handleRemoveAdditional = (index) => setAdditionals((prev) => prev.filter((_, i) => i !== index));

  const handleConfirmarGuardado = async () => {
    if (!formData.titulo || (!formData.precio && sizes.length === 0)) {
      setToastConfig({
        show: true,
        type: "error",
        subheading: "Campo Requerido",
        title: "Faltan Datos",
        message: "Ingresá al menos el Título y el Precio Base o sus Variantes."
      });
      return;
    }

    try {
      setCargandoGuardado(true);
      let finalImageUrl = formData.imagen;

      if (selectedFile) {
        setIsUploading(true);
        try {
          finalImageUrl = await uploadImageToStorage(
            selectedFile,
            formData.subcategoria || formData.categoria
          );
        } catch (error) {
          console.warn("Fallback a imagen por defecto:", error);
          finalImageUrl = formData.imagen || DEFAULT_IMAGE;
        } finally {
          setIsUploading(false);
        }
      }

      const stockNum = Number(formData.stock ?? 0);

      const datosAEnviar = {
        ...formData,
        imagen: finalImageUrl || DEFAULT_IMAGE,
        precio: Number(formData.precio) || 0,
        precioAnterior: formData.oferta ? Number(formData.precioAnterior) || 0 : 0,
        stock: stockNum,
        // ✅ Corregido: Si stock > 0 reactiva el producto automáticamente
        disponible: stockNum > 0 ? true : formData.disponible,
        descuentoPorcentaje: formData.oferta ? formData.descuentoPorcentaje : 0,
        size: sizes,
        additional: additionals
      };

      if (isCreationMode) {
        await addDoc(collection(db, "items"), datosAEnviar);
        setToastConfig({
          show: true,
          type: "success",
          subheading: "Base de Datos",
          title: "¡Producto Creado!",
          message: "El nuevo producto fue guardado correctamente."
        });
      } else {
        const idStr = String(producto.id).padStart(3, "0");
        const docRef = doc(db, "items", idStr);
        await updateDoc(docRef, datosAEnviar);
        Object.assign(producto, datosAEnviar);

        setToastConfig({
          show: true,
          type: "success",
          subheading: "Base de Datos",
          title: "¡Producto Actualizado!",
          message: "Los cambios se guardaron con éxito."
        });
      }

      if (onRefresh) onRefresh();

      setTimeout(() => {
        handleClose();
      }, 1000);

    } catch (error) {
      console.error("Error al guardar en Firestore:", error);
      setToastConfig({
        show: true,
        type: "error",
        subheading: "Error de Guardado",
        title: "Ocurrió un problema",
        message: "No se pudieron guardar los cambios."
      });
    } finally {
      setCargandoGuardado(false);
    }
  };

  const handleConfirmarEliminacionItem = async () => {
    if (!producto) return;

    try {
      setCargandoEliminacion(true);
      const idStr = String(producto.id).padStart(3, "0");
      const docRef = doc(db, "items", idStr);

      await deleteDoc(docRef);
      setShowConfirmDelete(false);

      setToastConfig({
        show: true,
        type: "success",
        subheading: "Base de Datos",
        title: "¡Producto Eliminado!",
        message: "El producto se eliminó correctamente."
      });

      if (onRefresh) onRefresh();

      setTimeout(() => {
        handleClose();
      }, 1000);

    } catch (error) {
      console.error("Error al eliminar item:", error);
      setShowConfirmDelete(false);
      setToastConfig({
        show: true,
        type: "error",
        subheading: "Error de Eliminación",
        title: "Ocurrió un problema",
        message: "No se pudo eliminar el producto."
      });
    } finally {
      setCargandoEliminacion(false);
    }
  };

  // Lógica de Precios
  const subcat = (formData.subcategoria || "").toLowerCase();
  const cat = (formData.categoria || "").toLowerCase();
  const type = (formData.additionalType || "").toLowerCase();

  const esSeleccionUnica = 
    type === "single" || 
    subcat.includes("pasta") || 
    cat.includes("pasta");

  const precioUnitarioBase = sizeSeleccionado ? Number(sizeSeleccionado.precio) : Number(formData.precio || 0);
  const tieneOferta = Boolean(formData.oferta);
  const precioAdditional = additionalSeleccionados.reduce((total, adi) => total + Number(adi.precio || 0), 0);

  const precioUnitarioFinal = precioUnitarioBase + precioAdditional;
  const precioTotal = precioUnitarioFinal * cantidad;

  const precioAnteriorUnitario = sizeSeleccionado?.precioAnterior > 0
    ? Number(sizeSeleccionado.precioAnterior)
    : Number(formData.precioAnterior || 0);

  const precioAnteriorTotal = (precioAnteriorUnitario + precioAdditional) * cantidad;

  let descuentoBadgePct = formData.descuentoPorcentaje;
  if (precioAnteriorUnitario > precioUnitarioBase && precioAnteriorUnitario > 0) {
    descuentoBadgePct = Math.round(((precioAnteriorUnitario - precioUnitarioBase) / precioAnteriorUnitario) * 100);
  }

  const currentPreviewSrc = imagePreview || formData.imagen || DEFAULT_IMAGE;
  const imagenFinal = editando ? currentPreviewSrc : (producto?.imagen || producto?.pictureUrl || DEFAULT_IMAGE);
  
  // ✅ Corregido: Evalúa stock directamente sin quedar bloqueado por la bandera previa
  const stockActual = formData.stock !== undefined ? Number(formData.stock) : (producto?.stock !== undefined ? Number(producto.stock) : 0);
  const sinStock = stockActual <= 0;

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />

      <Modal 
        show={show} 
        onHide={handleClose} 
        centered 
        keyboard={!cargandoGuardado && !cargandoEliminacion}
        backdrop={cargandoGuardado || cargandoEliminacion ? "static" : true}
        className="iqv-modal-custom"
      >
        <Modal.Body className="p-0">
          <div className="iqv-card-container">
            
            <div className="iqv-image-wrapper">
              <img
                src={imagenFinal}
                alt={formData.titulo || producto?.titulo || producto?.nombre || "Producto"}
                className="iqv-main-img"
              />

              {/* ✅ BADGE DE AGOTADO */}
              {sinStock && !editando && (
                <span className="badge-agotado">Agotado</span>
              )}

              <div className="iqv-dietary-badges-container">
                {producto?.sinTacc && (
                  <img 
                    src={sinTaccIcon} 
                    alt="Sin TACC" 
                    title="Apto Sin TACC"
                    className="iqv-dietary-badge" 
                  />
                )}
                {producto?.vegano && (
                  <img 
                    src={veganoIcon} 
                    alt="Apto Vegano" 
                    title="Apto Vegano"
                    className="iqv-dietary-badge" 
                  />
                )}
              </div>

              {editando && (
                <>
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
                    {!isCreationMode && (
                      <button
                        type="button"
                        className="add-product-upload-btn delete-action"
                        onClick={() => setShowConfirmDelete(true)}
                        title="Eliminar producto completo"
                      >
                        <Trash size={18} />
                      </button>
                    )}
                  </div>

                  {isUploading && (
                    <div className="add-product-upload-progress">
                      <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
                      <span>Subiendo {uploadProgress}%</span>
                    </div>
                  )}
                </>
              )}
              
              {esAdmin && !isCreationMode && (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  className={`iqv-floating-edit-btn ${editando ? "active" : ""}`}
                  onClick={() => setEditando(!editando)}
                  title={editando ? "Cancelar edición" : "Editar producto"}
                >
                  {editando ? <ArrowLeft size={20} /> : <PencilSquare size={20} />}
                </motion.button>
              )}

              <button type="button" className="iqv-floating-close" onClick={handleClose} aria-label="Cerrar">
                <X size={26} />
              </button>
            </div>

            {editando && showImageUrlInput && (
              <div className="add-product-url-popover">
                <input
                  type="text"
                  name="imagen"
                  placeholder="Pegá la URL externa aquí..."
                  value={formData.imagen || ""}
                  onChange={handleChangeAdmin}
                  className="add-product-input"
                />
              </div>
            )}

            {/* BADGE DE DESCUENTO */}
            {formData.oferta && descuentoBadgePct > 0 && (
              <div className="add-product-badge-discount">
                <TagFill size={24} /> -{descuentoBadgePct}% OFF
              </div>
            )}

            <div className="iqv-body-content">
              {esAdmin && editando ? (
                <AdminEditForm
                  formData={formData}
                  handleChange={handleChangeAdmin}
                  sizes={sizes}
                  handleAddSize={handleAddSize}
                  handleSizeChange={handleSizeChange}
                  handleRemoveSize={handleRemoveSize}
                  additionals={additionals}
                  handleAddAdditional={handleAddAdditional}
                  handleAdditionalChange={handleAdditionalChange}
                  handleRemoveAdditional={handleRemoveAdditional}
                />
              ) : (
                <>
                  <div className="iqv-header-title-row d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <h2 className="iqv-product-title mb-0">{producto?.titulo}</h2>
                    </div>

                    <motion.button
                      whileTap={{ scale: 1.25 }}
                      type="button"
                      onClick={() => producto && toggleFavorite(producto)}
                      className="iqv-fav-btn"
                    >
                      {isFav ? (
                        <HeartFill size={22} color="#EFBF04" />
                      ) : (
                        <Heart size={22} color="var(--iqv-text-secondary, #a1a1aa)" />
                      )}
                    </motion.button>
                  </div>
                  
                  <p className="iqv-product-description">
                    {producto?.descripcion || "Sin descripción disponible."}
                  </p>

                  <ProductOptions
                    producto={producto}
                    sizeSeleccionado={sizeSeleccionado}
                    handleSelectSize={(s) => setSizeSeleccionado(prev => prev?.id === s.id ? null : s)}
                    additionalSeleccionados={additionalSeleccionados}
                    handleToggleAdditional={(extra) => {
                      setAdditionalSeleccionados(prev => {
                        const exists = prev.some(item => item.id === extra.id);
                        if (esSeleccionUnica) return exists ? [] : [extra];
                        return exists ? prev.filter(item => item.id !== extra.id) : [...prev, extra];
                      });
                    }}
                    esSeleccionUnica={esSeleccionUnica}
                  />

                  <div className="iqv-quantity-price-row">
                    <div className="iqv-qty-selector-wrapper">
                      <span className="iqv-label-text mb-0">Cantidad:</span>
                      <div className="iqv-qty-counter">
                        <button type="button" onClick={() => setCantidad(c => Math.max(1, c - 1))} disabled={cantidad <= 1 || sinStock}>
                          <Dash size={20} />
                        </button>
                        <span className="iqv-qty-value">{cantidad}</span>
                        <button type="button" onClick={() => setCantidad(c => c + 1)} disabled={sinStock}>
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="iqv-price-display d-flex flex-column align-items-end">
                      {tieneOferta && precioAnteriorTotal > precioTotal && (
                        <span className="iqv-price-last text-decoration-line-through">
                          ${precioAnteriorTotal.toLocaleString("es-AR")}
                        </span>
                      )}
                      <span className="fw-bold fs-4">
                        ${precioTotal.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="iqv-footer-actions mt-3">
                {esAdmin && editando ? (
                  <button
                    type="button"
                    className="iqv-btn-primary-action iqv-btn-admin-save text-light"
                    onClick={handleConfirmarGuardado}
                    disabled={cargandoGuardado || cargandoEliminacion}
                  >
                    <CheckLg size={22} />
                    <span>
                      {cargandoGuardado
                        ? "Guardando..."
                        : isCreationMode
                        ? "Crear Producto"
                        : "Confirmar actualización"}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="iqv-btn-primary-action iqv-btn-admin-save text-light"
                    onClick={() => {
                      if (producto && !sinStock) {
                        addItem({
                          ...producto,
                          precioUnitario: precioUnitarioFinal,
                          sizeSeleccionado,
                          additionalSeleccionados
                        }, cantidad);
                        handleClose();
                      }
                    }}
                    disabled={sinStock}
                  >
                    {!sinStock ? <span>+ Agregar</span> : "Sin Stock"}
                  </button>
                )}
              </div>

            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={showConfirmDelete}
        onHide={() => !cargandoEliminacion && setShowConfirmDelete(false)}
        centered
        backdrop="static"
        size="sm"
      >
        <Modal.Header closeButton={!cargandoEliminacion}>
          <Modal.Title className="text-danger fs-6 fw-bold">
            ¿Eliminar Producto?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0" style={{ fontSize: "0.9rem" }}>
            ¿Estás seguro de que deseas eliminar <strong>"{formData.titulo}"</strong>? Esta acción no se puede deshacer.
          </p>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowConfirmDelete(false)}
            disabled={cargandoEliminacion}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm d-flex align-items-center gap-1"
            onClick={handleConfirmarEliminacionItem}
            disabled={cargandoEliminacion}
          >
            {cargandoEliminacion ? "Eliminando..." : <><Trash size={14} /> Eliminar</>}
          </button>
        </Modal.Footer>
      </Modal>

      <ToastModal
        show={toastConfig.show}
        onHide={() => setToastConfig((prev) => ({ ...prev, show: false }))}
        type={toastConfig.type}
        subheading={toastConfig.subheading}
        title={toastConfig.title}
        message={toastConfig.message}
      />
    </>
  );
};

export default ItemQuickView;