import { useState, useEffect, useContext } from "react";
import { CartContext } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import ItemCount from "./ItemCount";
import { Carousel, Button, Form } from "react-bootstrap";
import { motion } from "framer-motion";
import { BsBookmarkStarFill } from "react-icons/bs";

const ItemDetail = ({ producto }) => {
  const { addItem } = useContext(CartContext);
  const { toggleFavorite, isFavorite } = useFavorites();

  const [color, setColor] = useState("");
  const [talle, setTalle] = useState("");
  const [sizeSeleccionado, setSizeSeleccionado] = useState(null);
  const [additionalSeleccionados, setAdditionalSeleccionados] = useState([]);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    if (producto) {
      setColor(producto.colores?.[0] || "");
      setTalle(producto.talles?.[0] || "");
      
      // Inicializar el tamaño por defecto si existe la lista
      if (producto.size && producto.size.length > 0) {
        setSizeSeleccionado(producto.size[0]);
      } else {
        setSizeSeleccionado(null);
      }

      setAdditionalSeleccionados([]);
      setCantidad(1);
    }
  }, [producto]);

  if (!producto) return null;

  // Lógica de imágenes
  const imagenes =
    color && producto.imagenesPorColor?.[color]
      ? producto.imagenesPorColor[color]
      : producto.imagen
      ? [producto.imagen]
      : [producto.pictureUrl || "/img/no-image.png"];

  // Toggle de Adicionales
  const handleToggleAdditional = (itemAdd) => {
    setAdditionalSeleccionados((prev) => {
      const existe = prev.some((a) => a.id === itemAdd.id);
      if (existe) {
        return prev.filter((a) => a.id !== itemAdd.id);
      } else {
        return [...prev, itemAdd];
      }
    });
  };

  // Cálculo de precio unitario dinámico
  const precioBase = sizeSeleccionado
    ? Number(sizeSeleccionado.precio)
    : Number(producto.precio || 0);

  const totalAdicionales = additionalSeleccionados.reduce(
    (acc, add) => acc + Number(add.precio || 0),
    0
  );

  const precioUnitario = precioBase + totalAdicionales;

  const handleAdd = () => {
    // Si el producto define sizes y no hay ninguno seleccionado
    if (producto.size?.length > 0 && !sizeSeleccionado) {
      alert("Por favor selecciona un tamaño/variante.");
      return;
    }

    const itemParaCarrito = {
      ...producto,
      color,
      talle,
      sizeSeleccionado,
      additionalSeleccionados,
      precioUnitario,
    };

    addItem(itemParaCarrito, cantidad);
  };

  const handleFavorite = () => {
    toggleFavorite(producto);
  };

  return (
    <div className="container my-5">
      <div className="row align-items-center">
        {/* IMÁGENES */}
        <div className="col-md-6 text-center">
          {imagenes.length > 1 ? (
            <Carousel indicators={false}>
              {imagenes.map((img, i) => (
                <Carousel.Item key={i}>
                  <img
                    src={img}
                    alt={`${producto.titulo || producto.nombre} ${i + 1}`}
                    className="img-fluid rounded-4 shadow-sm mb-3"
                    style={{
                      maxHeight: "380px",
                      objectFit: "cover",
                      width: "100%",
                    }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <img
              src={imagenes[0]}
              alt={producto.titulo || producto.nombre}
              className="img-fluid rounded-4 shadow-sm mb-3"
              style={{ maxHeight: "380px", objectFit: "cover" }}
            />
          )}
        </div>

        {/* INFORMACIÓN DE PRODUCTO */}
        <div className="col-md-6">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h2 className="mb-0">
              {producto.marca ? `${producto.marca} ` : ""}
              {producto.titulo || producto.nombre}
            </h2>

            <motion.div
              whileTap={{ scale: 1.3 }}
              animate={{
                scale: isFavorite(producto.id) ? [1, 1.3, 1] : 1,
                transition: { duration: 0.3 },
              }}
              onClick={handleFavorite}
              style={{ cursor: "pointer" }}
            >
              <BsBookmarkStarFill
                size={26}
                color={isFavorite(producto.id) ? "#ffcc00" : "gray"}
              />
            </motion.div>
          </div>

          <h3 className="fw-bold text-success mb-3">
            ${precioUnitario.toLocaleString("es-AR")}
          </h3>

          <p className="text-muted">
            {producto.descripcion || "Sin descripción disponible."}
          </p>

          {/* OPCIONES DE TAMAÑO (SIZE) */}
          {producto.size?.length > 0 && (
            <div className="mb-3">
              <strong>Tamaño:</strong>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {producto.size.map((s) => (
                  <Button
                    key={s.id || s.nombre}
                    variant={
                      sizeSeleccionado?.id === s.id || sizeSeleccionado?.nombre === s.nombre
                        ? "dark"
                        : "outline-dark"
                    }
                    size="sm"
                    onClick={() => setSizeSeleccionado(s)}
                  >
                    {s.nombre} (${Number(s.precio).toLocaleString("es-AR")})
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* OPCIONES DE ADICIONALES (ADDITIONAL) */}
          {producto.additional?.length > 0 && (
            <div className="mb-3">
              <strong>Adicionales / Extras:</strong>
              <div className="mt-2">
                {producto.additional.map((add) => {
                  const estaSeleccionado = additionalSeleccionados.some(
                    (a) => a.id === add.id
                  );
                  return (
                    <Form.Check
                      key={add.id || add.nombre}
                      type="checkbox"
                      id={`add-${add.id}`}
                      label={`${add.nombre} (+$${Number(add.precio).toLocaleString("es-AR")})`}
                      checked={estaSeleccionado}
                      onChange={() => handleToggleAdditional(add)}
                      className="mb-1"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* TALLE */}
          {producto.talles?.length > 0 && (
            <div className="mb-3">
              <strong>Talle:</strong>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {producto.talles.map((t) => (
                  <Button
                    key={t}
                    variant={talle === t ? "dark" : "outline-dark"}
                    size="sm"
                    onClick={() => setTalle(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* COLOR */}
          {producto.colores?.length > 0 && (
            <div className="mb-3">
              <strong>Color:</strong>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {producto.colores.map((c) => (
                  <Button
                    key={c}
                    variant={color === c ? "dark" : "outline-dark"}
                    size="sm"
                    onClick={() => setColor(c)}
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* CANTIDAD */}
          <div className="mt-3">
            <strong>Cantidad:</strong>
            <ItemCount
              stock={producto.stock ?? 10}
              initial={1}
              onAdd={(q) => setCantidad(q)}
            />
          </div>

          {/* BOTÓN CARRITO */}
          <div className="mt-4">
            <Button
              variant="dark"
              size="lg"
              className="w-100"
              onClick={handleAdd}
              disabled={producto.disponible === false}
            >
              {producto.disponible === false ? "Agotado" : "🛒 Agregar al carrito"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;