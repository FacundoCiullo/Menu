// Estilos (sube un nivel a Admin y entra a styles)
import "../styles/DashboardHome.css";

import React, { useEffect, useState } from "react";
import { Accordion } from "react-bootstrap";
import { db } from "../../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

// Widgets (sube un nivel a Admin y entra a widgets)
import WidgetCaja from "../widgets/WidgetCaja";
import WidgetVacio from "../widgets/WidgetVacio";
import WidgetTopProductos from "../widgets/WidgetTopProductos";
import WidgetCalendario from "../widgets/WidgetCalendario";
import WidgetOrdenes from "../widgets/WidgetOrdenes";
import WidgetUsuarios from "../widgets/WidgetUsuarios";

const DashboardHome = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [productosMenu, setProductosMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaFiltro, setFechaFiltro] = useState(new Date());

  // Estado para la pestaña activa de la caja ('dia', 'semana', 'mes')
  const [pestanaCaja, setPestanaCaja] = useState("dia");

  // 1. Escuchar las Órdenes en tiempo real
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("date", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrdenes(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error al escuchar órdenes en tiempo real:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Traer productos del menú
  useEffect(() => {
    const qProd = query(collection(db, "products"));

    const unsubscribeProd = onSnapshot(
      qProd,
      (snapshot) => {
        const dataProd = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProductosMenu(dataProd);
      },
      (error) => {
        console.error("Error al escuchar productos:", error);
      }
    );

    return () => unsubscribeProd();
  }, []);

  // Helper para normalizar timestamps de Firestore o JS Date
  const obtenerFechaDate = (fechaRaw) => {
    if (!fechaRaw) return null;
    return fechaRaw?.toDate ? fechaRaw.toDate() : new Date(fechaRaw);
  };

  // ==========================================
  // FILTRADOS DINÁMICOS BASADOS EN LA FECHA SELECCIONADA
  // ==========================================

  // 1. Órdenes del DÍA Seleccionado
  const ordenesDelDia = ordenes.filter((orden) => {
    const d1 = obtenerFechaDate(orden.createdAt || orden.date);
    const d2 = new Date(fechaFiltro);
    if (!d1 || isNaN(d1.getTime())) return false;

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  });

  // 2. Órdenes de la SEMANA del día seleccionado (Lunes a Domingo)
  const ordenesDeLaSemana = ordenes.filter((orden) => {
    const d1 = obtenerFechaDate(orden.createdAt || orden.date);
    if (!d1 || isNaN(d1.getTime())) return false;

    const refDate = new Date(fechaFiltro);
    const dayOfWeek = refDate.getDay() === 0 ? 6 : refDate.getDay() - 1; // Ajuste Lunes = 0
    
    const inicioSemana = new Date(refDate);
    inicioSemana.setDate(refDate.getDate() - dayOfWeek);
    inicioSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    return d1 >= inicioSemana && d1 <= finSemana;
  });

  // 3. Órdenes del MES del día seleccionado
  const ordenesDelMes = ordenes.filter((orden) => {
    const d1 = obtenerFechaDate(orden.createdAt || orden.date);
    const d2 = new Date(fechaFiltro);
    if (!d1 || isNaN(d1.getTime())) return false;

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth()
    );
  });

  return (
    <div className="dashboard-container">
      <header className="dashboard-header d-flex justify-content-between align-items-center">
        <div>
          <h1>Dashboard General</h1>
        </div>
        <div className="badge bg-light text-dark border p-2 fs-6">
          Viendo día: <b>{new Date(fechaFiltro).toLocaleDateString("es-AR")}</b>
        </div>
      </header>

      <div className="dashboard-grid">
        
        {/* CASILLA 1: CALENDARIO */}
        <div className="grid-item widget-1">
          <Accordion defaultActiveKey="0" flush>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Filtro Fecha</Accordion.Header>
              <Accordion.Body className="p-0 pt-2 iqv-compact-calendar">
                <WidgetCalendario
                  fechaFiltro={fechaFiltro}
                  setFechaFiltro={setFechaFiltro}
                  ordenes={ordenes}
                />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>

        {/* CASILLA 2: CAJA (Actualiza sus montos según el período seleccionado) */}
        <div className="grid-item widget-2">
          <Accordion defaultActiveKey="0" flush>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Resumen de Caja</Accordion.Header>
              <Accordion.Body className="p-0 pt-2">
                <WidgetCaja
                  todasLasOrdenes={ordenes}
                  ordenesDelDia={ordenesDelDia}
                  ordenesDeLaSemana={ordenesDeLaSemana}
                  ordenesDelMes={ordenesDelMes}
                  fechaSeleccionada={fechaFiltro}
                  pestana={pestanaCaja}
                  setPestana={setPestanaCaja}
                  loading={loading}
                />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>

        {/* CASILLA 3: MÉTRICA ADICIONAL */}
        <div className="grid-item widget-3">
          <Accordion defaultActiveKey="0" flush>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Métrica Adicional</Accordion.Header>
              <Accordion.Body className="p-0 pt-2">
                <WidgetVacio />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>

        {/* CASILLA 4: ESPACIO DISPONIBLE */}
        <div className="grid-item widget-4">
          <Accordion defaultActiveKey="0" flush>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Espacio Disponible</Accordion.Header>
              <Accordion.Body className="p-0 pt-2">
                <WidgetVacio />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>

        {/* CASILLA 5: ÓRDENES EN TIEMPO REAL (Muestra SIEMPRE las órdenes del día) */}
        <div className="grid-item widget-5">
          <Accordion defaultActiveKey="0" flush>
            <Accordion.Item eventKey="0">
              <Accordion.Body className="p-0 pt-2">
                <WidgetOrdenes
                  ordenes={ordenesDelDia}
                  loading={loading}
                  fechaFiltro={fechaFiltro}
                />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>

        {/* COLUMNA DERECHA (CASILLAS 6, 7, 8 Y 9) */}
        <div className="widget-columna-derecha">
          {/* CASILLA 6: CLIENTES FRECUENTES */}
          <div className="grid-item widget-6">
            <Accordion defaultActiveKey="0" flush>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Clientes Frecuentes</Accordion.Header>
                <Accordion.Body className="p-0 pt-2">
                  <WidgetUsuarios ordenes={ordenesDelDia} loading={loading} />
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>

          {/* CASILLA 7: NUEVA MÉTRICA ADICIONAL */}
          <div className="grid-item widget-7">
            <Accordion defaultActiveKey="0" flush>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Métrica Adicional</Accordion.Header>
                <Accordion.Body className="p-0 pt-2">
                  <WidgetVacio />
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>

          {/* FILA CON CASILLAS 8 Y 9 (MÁS Y MENOS VENDIDOS) */}
          <div className="subgrid-8">
            
            {/* CASILLA 8: MÁS VENDIDOS */}
            <div className="grid-item widget-8">
              <Accordion defaultActiveKey="0" flush>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>🔥 Más Vendidos</Accordion.Header>
                  <Accordion.Body className="p-0 pt-2">
                    <WidgetTopProductos
                      ordenes={ordenesDelDia}
                      todosLosProductos={productosMenu}
                      loading={loading}
                      modoInicial="mas"
                    />
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardHome;