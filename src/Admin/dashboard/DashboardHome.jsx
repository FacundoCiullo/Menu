import "./style/DashboardHome.css";

import React, { useEffect, useState } from "react";
import { Accordion } from "react-bootstrap";
import { db } from "../../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

import WidgetCaja from "./widgets/WidgetCaja";
import WidgetVacio from "./widgets/WidgetVacio";
import WidgetTopProductos from "./widgets/WidgetTopProductos";
import WidgetCalendario from "./widgets/WidgetCalendario";
import WidgetOrdenes from "./widgets/WidgetOrdenes";
import WidgetUsuarios from "./widgets/WidgetUsuarios";

const DashboardHome = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [productosMenu, setProductosMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaFiltro, setFechaFiltro] = useState(new Date());

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

  const esMismoDia = (fechaOrden, fechaSeleccionada) => {
    if (!fechaOrden || !fechaSeleccionada) return false;
    const d1 = fechaOrden.toDate ? fechaOrden.toDate() : new Date(fechaOrden);
    const d2 = new Date(fechaSeleccionada);

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const ordenesDelDia = ordenes.filter((orden) =>
    esMismoDia(orden.date, fechaFiltro)
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header d-flex justify-content-between align-items-center">
        <div>
          <h1>Dashboard General</h1>
          <p className="text-muted mb-0">Métricas y órdenes en tiempo real</p>
        </div>
        <div className="badge bg-light text-dark border p-2 fs-6">
          📅 Viendo día: <b>{new Date(fechaFiltro).toLocaleDateString("es-AR")}</b>
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

        {/* CASILLA 2: CAJA */}
        <div className="grid-item widget-2">
          <Accordion defaultActiveKey="0" flush>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Resumen de Caja</Accordion.Header>
              <Accordion.Body className="p-0 pt-2">
                <WidgetCaja
                  todasLasOrdenes={ordenes}
                  ordenesDelDia={ordenesDelDia}
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

        {/* CASILLA 5: ÓRDENES EN TIEMPO REAL */}
        <div className="grid-item widget-5">
          <Accordion defaultActiveKey="0" flush>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Órdenes Recientes</Accordion.Header>
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
          <div className="subgrid-8-9">
            
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

            {/* CASILLA 9: MENOS VENDIDOS */}
            <div className="grid-item widget-9">
              <Accordion defaultActiveKey="0" flush>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>📉 Menos Vendidos</Accordion.Header>
                  <Accordion.Body className="p-0 pt-2">
                    <WidgetTopProductos
                      ordenes={ordenesDelDia}
                      todosLosProductos={productosMenu}
                      loading={loading}
                      modoInicial="menos"
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