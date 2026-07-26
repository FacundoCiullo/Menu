import { useContext, useState, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { addDoc, collection } from "firebase/firestore";
import { Navigate, Link } from "react-router-dom";
import { Accordion } from "react-bootstrap";
import { 
  GeoAlt, 
  Shop, 
  CashCoin, 
  CreditCard, 
  QrCode, 
  ArrowRight,
  PersonCheck,
  Truck,
  CreditCard2Front
} from "react-bootstrap-icons";

const Checkout = () => {
  const { cart, clear, sumTotal } = useContext(CartContext);
  const { user } = useAuth();

  // Datos del comprador
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [telefonoError, setTelefonoError] = useState("");

  // Opciones de Entrega (delivery / retiro)
  const [tipoEntrega, setTipoEntrega] = useState("delivery");
  const [direccion, setDireccion] = useState("");
  const [pisoDepto, setPisoDepto] = useState("");
  const [aclaracionesDelivery, setAclaracionesDelivery] = useState("");

  // Opciones de Pago (efectivo / mercadopago / transferencia)
  const [metodoPago, setMetodoPago] = useState("efectivo");

  const [orderId, setOrderId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setNombre(user.displayName || "");
      setEmail(user.email || "");
      setTelefono(user.phoneNumber || "");
    }
  }, [user]);

  const validarTelefono = (value) => {
    const soloNumeros = value.replace(/\D/g, "");
    setTelefono(soloNumeros);

    if (soloNumeros.length === 0) {
      setTelefonoError("");
      return;
    }

    if (soloNumeros.length !== 10 && soloNumeros.length !== 11) {
      setTelefonoError("El teléfono debe tener 10 u 11 dígitos (sin 0 ni 15).");
      return;
    }

    setTelefonoError("");
  };

  const generarOrden = async (e) => {
    e.preventDefault();

    if (!nombre || !email || !telefono) {
      alert("Por favor completá los datos personales requeridos.");
      return;
    }

    if (telefonoError) {
      alert("Corregí el teléfono antes de continuar.");
      return;
    }

    if (tipoEntrega === "delivery" && !direccion.trim()) {
      alert("Ingresá la dirección de entrega.");
      return;
    }

    setIsSubmitting(true);

    const buyer = {
      name: nombre,
      phone: telefono,
      email,
    };

    const shipping = {
      type: tipoEntrega,
      address: tipoEntrega === "delivery" ? direccion : "Retiro en local",
      pisoDepto: tipoEntrega === "delivery" ? pisoDepto : "",
      notes: tipoEntrega === "delivery" ? aclaracionesDelivery : "",
    };

    const payment = {
      method: metodoPago,
      status: metodoPago === "mercadopago" ? "pendiente_pago" : "confirmado",
    };

    const items = cart.map((item) => {
      const precioUnitarioFinal = Number(item.precioUnitario ?? item.precio ?? 0);

      return {
        id: item.id,
        itemKey: item.itemKey || item.id,
        title: item.titulo,
        price: precioUnitarioFinal,
        quantity: item.quantity,
        subtotal: precioUnitarioFinal * item.quantity,
        sizeSeleccionado: item.sizeSeleccionado
          ? {
              id: item.sizeSeleccionado.id,
              nombre: item.sizeSeleccionado.nombre,
              precio: item.sizeSeleccionado.precio,
            }
          : null,
        additionalSeleccionados: item.additionalSeleccionados
          ? item.additionalSeleccionados.map((add) => ({
              id: add.id,
              nombre: add.nombre,
              precio: add.precio,
            }))
          : [],
        imagen: item.imagen || "/img/no-image.png",
      };
    });

    const fecha = new Date();
    const date = fecha.toISOString().slice(0, 16).replace("T", " ");

    const order = {
      buyer,
      shipping,
      payment,
      items,
      date,
      total: sumTotal(),
      status: "pendiente",
    };

    try {
      const docRef = await addDoc(collection(db, "orders"), order);
      setOrderId(docRef.id);
      clear();
    } catch (error) {
      console.error("Error al crear la orden:", error);
      alert("Ocurrió un error al procesar tu compra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderId) {
    return <Navigate to={"/thankyou/" + orderId} />;
  }

  if (cart.length === 0) {
    return (
      <div className="container my-5 text-center">
        <h2>No hay productos en el carrito</h2>
        <Link to="/" className="btn btn-dark mt-3">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="container my-5" style={{ maxWidth: "680px" }}>
      <div className="row mb-4">
        <div className="col text-center">
          <h2 className="fw-bold">Datos de Entrega y Pago</h2>
          <p className="text-muted mb-1">
            Total del pedido: <strong className="text-dark fs-5">${sumTotal().toLocaleString("es-AR")}</strong>
          </p>
        </div>
      </div>

      <form onSubmit={generarOrden}>
        <Accordion defaultActiveKey={["0", "1", "2"]} alwaysOpen className="shadow-sm rounded mb-4">
          
          {/* ACORDEÓN 1: MÉTODO DE ENTREGA */}
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <div className="d-flex align-items-center gap-2 fw-bold">
                <Truck size={20} className="text-dark" />
                <span>1. Método de Entrega</span>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <button
                    type="button"
                    className={`btn w-100 p-3 text-start border ${
                      tipoEntrega === "delivery" ? "btn-dark" : "btn-light"
                    }`}
                    onClick={() => setTipoEntrega("delivery")}
                  >
                    <GeoAlt size={18} className="me-2" />
                    <strong>Delivery</strong>
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    className={`btn w-100 p-3 text-start border ${
                      tipoEntrega === "retiro" ? "btn-dark" : "btn-light"
                    }`}
                    onClick={() => setTipoEntrega("retiro")}
                  >
                    <Shop size={18} className="me-2" />
                    <strong>Retiro en Local</strong>
                  </button>
                </div>
              </div>

              {tipoEntrega === "delivery" && (
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Dirección de entrega *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Calle y altura (Ej: Av. Mitre 1234)"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Piso / Depto</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: 4B"
                      value={pisoDepto}
                      onChange={(e) => setPisoDepto(e.target.value)}
                    />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label small fw-semibold">Aclaraciones / Timbre</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: Portón negro, timbre no funciona"
                      value={aclaracionesDelivery}
                      onChange={(e) => setAclaracionesDelivery(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>

          {/* ACORDEÓN 2: MEDIO DE PAGO */}
          <Accordion.Item eventKey="1">
            <Accordion.Header>
              <div className="d-flex align-items-center gap-2 fw-bold">
                <CreditCard2Front size={20} className="text-dark" />
                <span>2. Forma de Pago</span>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <div className="d-flex flex-column gap-2">
                
                <label
                  className={`p-3 border rounded d-flex align-items-center justify-content-between style-radio ${
                    metodoPago === "efectivo" ? "border-dark bg-light" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="efectivo"
                      checked={metodoPago === "efectivo"}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    />
                    <CashCoin size={20} className="ms-2" />
                    <span className="fw-semibold">Efectivo</span>
                  </div>
                  <span className="badge bg-secondary">Abona al recibir</span>
                </label>

                <label
                  className={`p-3 border rounded d-flex align-items-center justify-content-between style-radio ${
                    metodoPago === "transferencia" ? "border-dark bg-light" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="transferencia"
                      checked={metodoPago === "transferencia"}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    />
                    <QrCode size={20} className="ms-2" />
                    <span className="fw-semibold">Transferencia / Alias</span>
                  </div>
                  <span className="badge bg-info text-dark">Alias al finalizar</span>
                </label>

                <label
                  className={`p-3 border rounded d-flex align-items-center justify-content-between style-radio ${
                    metodoPago === "mercadopago" ? "border-dark bg-light" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="mercadopago"
                      checked={metodoPago === "mercadopago"}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    />
                    <CreditCard size={20} className="ms-2" />
                    <span className="fw-semibold">Mercado Pago / Digital</span>
                  </div>
                  <span className="badge bg-primary">Tarjeta / QR</span>
                </label>

              </div>
            </Accordion.Body>
          </Accordion.Item>

          {/* ACORDEÓN 3: DATOS DE CONTACTO */}
          <Accordion.Item eventKey="2">
            <Accordion.Header>
              <div className="d-flex align-items-center gap-2 fw-bold">
                <PersonCheck size={20} className="text-dark" />
                <span>3. Datos de Contacto</span>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Nombre y Apellido</label>
                  <input type="text" className="form-control" value={nombre} readOnly disabled />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Email</label>
                  <input type="text" className="form-control" value={email} readOnly disabled />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Teléfono de Contacto *</label>
                  <input
                    type="text"
                    className={`form-control ${telefonoError ? "is-invalid" : ""}`}
                    value={telefono}
                    onChange={(e) => validarTelefono(e.target.value)}
                    placeholder="Ej: 1155334455"
                    required
                  />
                  {telefonoError && <div className="invalid-feedback">{telefonoError}</div>}
                </div>
              </div>
            </Accordion.Body>
          </Accordion.Item>

        </Accordion>

        {/* BOTÓN ÚNICO DE CONFIRMACIÓN */}
        <button
          type="submit"
          className="btn btn-dark w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
          disabled={Boolean(telefonoError) || isSubmitting || !telefono}
        >
          {isSubmitting ? (
            "Procesando pedido..."
          ) : (
            <>
              <span>Confirmar y Enviar Pedido (${sumTotal().toLocaleString("es-AR")})</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Checkout;