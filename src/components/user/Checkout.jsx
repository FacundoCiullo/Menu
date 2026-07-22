// src/components/Checkout.jsx
import { useContext, useState, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { addDoc, collection } from "firebase/firestore";
import { Navigate, Link } from "react-router-dom";

const Checkout = () => {
  const { cart, clear, sumTotal } = useContext(CartContext);
  const { user } = useAuth();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [telefonoError, setTelefonoError] = useState("");
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

  const generarOrden = (e) => {
    e.preventDefault();

    if (!nombre || !email || !telefono) {
      alert("Por favor completá todos los datos del comprador.");
      return;
    }

    if (telefonoError) {
      alert("El teléfono no es válido.");
      return;
    }

    setIsSubmitting(true);

    const buyer = { name: nombre, phone: telefono, email };

    // GUARDAMOS SOLO LA VARIABLE SELECCIONADA Y EL PRECIO APLICADO
    const items = cart.map((item) => {
      const precioFinalUnitario = item.variable ? item.variable.precio : item.precio;
      return {
        id: item.id,
        title: item.titulo,
        price: precioFinalUnitario,
        quantity: item.quantity,
        subtotal: precioFinalUnitario * item.quantity,
        variable: item.variable
          ? {
              id: item.variable.id,
              nombre: item.variable.nombre,
              precio: item.variable.precio,
            }
          : null,
        imagen: item.imagen || "/img/no-image.png",
      };
    });

    const fecha = new Date();
    const date = fecha.toISOString().slice(0, 16).replace("T", " ");
    const total = sumTotal();

    const order = { buyer, items, date, total };

    addDoc(collection(db, "orders"), order)
      .then((resultado) => {
        setOrderId(resultado.id);
        clear();
      })
      .catch((error) => {
        console.error("Error! No se pudo completar la compra:", error);
        alert("Ocurrió un error al procesar tu compra.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (orderId) {
    return <Navigate to={"/thankyou/" + orderId} />;
  }

  if (cart.length === 0) {
    return (
      <div className="container my-5 text-center">
        <h2>No hay productos en el carrito</h2>
        <Link to="/" className="btn btn-dark mt-3">Volver a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row mb-4">
        <div className="col text-center">
          <h2>Confirmación de Orden</h2>
        </div>
      </div>

      <div className="row g-4">
        {/* FORMULARIO */}
        <div className="col-md-5 offset-md-1">
          <form onSubmit={generarOrden}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Nombre</label>
              <input type="text" className="form-control" value={nombre} readOnly disabled />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input type="text" className="form-control" value={email} readOnly disabled />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Teléfono</label>
              <input
                type="text"
                className={`form-control ${telefonoError ? "is-invalid" : ""}`}
                value={telefono}
                onChange={(e) => validarTelefono(e.target.value)}
                placeholder="Ej: 1155334455"
                required
              />
              {telefonoError && (
                <div className="invalid-feedback">{telefonoError}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-dark w-100"
              disabled={Boolean(telefonoError) || isSubmitting || !telefono}
            >
              {isSubmitting ? "Procesando orden..." : "Generar Orden"}
            </button>
          </form>
        </div>

        {/* RESUMEN DEL CARRITO */}
        <div className="col-md-5">
          <div className="card p-3 shadow-sm">
            <h5 className="card-title mb-3">Resumen de compra</h5>
            <table className="table align-middle">
              <tbody>
                {cart.map((item, index) => {
                  const precioUnitario = item.variable ? item.variable.precio : item.precio;
                  const itemKey = item.cartItemId || `${item.id}-${index}`;

                  return (
                    <tr key={itemKey}>
                      <td style={{ width: "70px" }}>
                        <img
                          src={item.imagen}
                          alt={item.titulo}
                          width={65}
                          className="img-fluid rounded"
                        />
                      </td>

                      <td>
                        <strong>{item.titulo}</strong>
                        {item.variable && (
                          <div className="small text-muted fw-semibold">
                            Opción: {item.variable.nombre}
                          </div>
                        )}
                      </td>

                      <td className="text-nowrap text-center">
                        {item.quantity} x ${precioUnitario}
                      </td>

                      <td className="text-end fw-bold">
                        ${item.quantity * precioUnitario}
                      </td>
                    </tr>
                  );
                })}

                <tr>
                  <td colSpan={3} className="text-end fw-bold pt-3">
                    Total a pagar:
                  </td>
                  <td className="fw-bold text-end pt-3 fs-5">
                    ${sumTotal()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;