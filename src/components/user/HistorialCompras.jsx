// src/components/HistorialCompras.jsx
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import Spinner from "react-bootstrap/Spinner";

const HistorialCompras = () => {
  const { user, loading: authLoading } = useAuth();
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Helpers de Fecha y Hora (igual que en el Widget)
  const obtenerFechaDate = (fechaRaw) => {
    if (!fechaRaw) return null;
    return fechaRaw?.toDate ? fechaRaw.toDate() : new Date(fechaRaw);
  };

  const formatFecha = (dateInput) => {
    if (!dateInput) return "DD/MM/AAAA";
    const date = obtenerFechaDate(dateInput);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatHora = (dateInput) => {
    if (!dateInput) return "00:00";
    const date = obtenerFechaDate(dateInput);
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // 🔹 Helper para el color del estado
  const getEstadoBadge = (estadoRaw) => {
    const estado = (estadoRaw || "pedido").toLowerCase();
    if (estado === "pedido" || estado === "pendiente") return <span className="badge bg-warning text-dark">Pedido</span>;
    if (estado === "preparando") return <span className="badge bg-info text-dark">En Preparación</span>;
    if (estado === "despachado" || estado === "finalizado") return <span className="badge bg-success">Finalizado</span>;
    return <span className="badge bg-secondary">{estadoRaw}</span>;
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const cargarOrdenes = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("buyer.email", "==", user.email)
        );

        const querySnapshot = await getDocs(q);
        const resultados = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 🔹 Ordenar de más reciente a más antigua
        resultados.sort((a, b) => {
          const fechaA = obtenerFechaDate(a.createdAt || a.date);
          const fechaB = obtenerFechaDate(b.createdAt || b.date);

          const timeA = fechaA && !isNaN(fechaA.getTime()) ? fechaA.getTime() : 0;
          const timeB = fechaB && !isNaN(fechaB.getTime()) ? fechaB.getTime() : 0;

          return timeB - timeA; // Descendente: más reciente arriba
        });

        setOrdenes(resultados);
      } catch (error) {
        console.error("Error cargando historial:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarOrdenes();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="dark" />
      </div>
    );
  }

  if (!user) {
    return (
      <h3 className="text-center mt-5">
        Debes iniciar sesión para ver tu historial.
      </h3>
    );
  }

  if (ordenes.length === 0) {
    return (
      <h4 className="text-center mt-5 text-muted">
        No tienes compras registradas todavía.
      </h4>
    );
  }

  return (
    <div className="container my-5" style={{ maxWidth: "800px" }}>
      <h2 className="mb-4 fw-bold">Mi Historial de Compras</h2>

      {ordenes.map((ord) => {
        const fechaRaw = ord.createdAt || ord.date;
        const tipoEntrega = ord.buyer?.deliveryType === 'takeaway' ? 'Retiro por local' : 'Envío a domicilio';

        return (
          <div key={ord.id} className="card shadow-sm mb-4 border-0" style={{ borderLeft: "4px solid #212529" }}>
            <div className="card-body">
              
              {/* Header de la orden */}
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="card-title fw-bold mb-1">Orden #{ord.id ? ord.id.slice(-6) : "------"}</h5>
                  <div className="text-muted small">
                    <i className="bi bi-calendar-event me-1"></i> {formatFecha(fechaRaw)} - {formatHora(fechaRaw)} hs
                  </div>
                </div>
                <div className="text-end">
                  {getEstadoBadge(ord.status || ord.estado)}
                </div>
              </div>

              {/* Info de Entrega */}
              <div className="bg-light p-3 rounded mb-3 text-secondary small">
                <div className="row">
                  <div className="col-sm-6 mb-2 mb-sm-0">
                    <strong>Modalidad:</strong> {tipoEntrega}
                  </div>
                  <div className="col-sm-6">
                    <strong>Dirección/Contacto:</strong> {ord.buyer?.address || ord.buyer?.phone || "N/A"}
                  </div>
                </div>
              </div>

              <h6 className="fw-bold mb-3">Productos ({ord.items?.length || 0})</h6>

              {/* Items de la orden */}
              {ord.items?.map((item, idx) => {
                // Lógica de extracción de variantes (igual que el panel de administración)
                const sizeObj = item.sizeSeleccionado || item.size;
                const nombreTamaño = typeof sizeObj === 'object' && sizeObj !== null
                  ? (sizeObj.nombre || sizeObj.title || '')
                  : sizeObj;

                const rawAdicionales = item.additionalSeleccionados || item.adicionales || item.extras;
                let listaAdicionales = null;

                if (Array.isArray(rawAdicionales) && rawAdicionales.length > 0) {
                  listaAdicionales = rawAdicionales
                    .map((a) => (typeof a === 'object' && a !== null ? (a.nombre || a.title || '') : a))
                    .filter(Boolean)
                    .join(", ");
                }

                const cantidad = Number(item.quantity || item.cantidad || 1);
                const precioUnitario = Number(item.price || item.precioUnitario || item.precio || 0);

                return (
                  <div
                    key={item.itemKey || item.id || idx}
                    className="d-flex align-items-center mb-3 p-2 border-bottom"
                  >
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-bold">{item.title || item.titulo}</h6>
                      <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                        <span className="me-2"><strong>Cant:</strong> {cantidad}</span>
                        {nombreTamaño && <span className="me-2">| <strong>Tamaño:</strong> {nombreTamaño}</span>}
                      </div>
                      {listaAdicionales && (
                        <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                          <strong>Extras:</strong> {listaAdicionales}
                        </div>
                      )}
                    </div>

                    <div className="text-end">
                      <div className="text-muted small">${precioUnitario.toLocaleString("es-AR")} c/u</div>
                      <span className="fw-bold fs-6">${(precioUnitario * cantidad).toLocaleString("es-AR")}</span>
                    </div>
                  </div>
                );
              })}

              {/* Total de la orden */}
              <div className="d-flex justify-content-between align-items-center mt-4 pt-2">
                <span className="text-muted">Total pagado</span>
                <strong className="fs-4">${Number(ord.total || 0).toLocaleString("es-AR")}</strong>
              </div>
              
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HistorialCompras;