import './style/App.css';

import Inicio from './pages/Inicio';
import Error404 from './pages/Error404';
import ThankYou from './pages/ThankYou';
import Productos from './pages/Productos';
import Favorites from './pages/Favorites';

import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';

import Cart from './components/user/Cart';
import Checkout from './components/user/Checkout';

import HistorialCompras from './components/user/HistorialCompras';

import ItemListContainer from './components/items/ItemListContainer';
import ItemDetailContainer from './components/items/ItemDetailContainer';

// Importaciones del Panel de Administración (Componentes y Páginas)
import AdminLayout from "./Admin/components/AdminLayout";
import DashboardHome from "./Admin/pages/DashboardHome";
import AdminOrders from "./Admin/pages/AdminOrders";


import CartContextProvider from './context/CartContext';
import { FavoritesProvider } from "./context/FavoritesContext";
import { AuthProvider } from "./context/AuthContext";

import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import MobileNavbar from "./components/layout/MobileNavbar";

// Layout para las vistas públicas/cliente (incluye Navbar y Footer)
const LayoutPublico = () => (
  <>
    <NavBar />
    <main>
      <Outlet />
    </main>
    <Footer />
    <MobileNavbar />
  </>
);

function App() {
  return (
    <div className='App'>
      <AuthProvider>
        <FavoritesProvider>
          <CartContextProvider>
            <BrowserRouter>
              <Routes>
                {/* RUTAS DEL PANEL DE ADMINISTRACIÓN (LAYOUT Y RUTAS ANIDADAS) */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<DashboardHome />} />
                  <Route path="ordenes" element={<AdminOrders />} />
                  <Route path="productos" element={<DashboardHome />} />
                  <Route path="usuarios" element={<div className="p-4">Sección Usuarios (Próximamente)</div>} />
                  <Route path="mensajes" element={<div className="p-4">Sección Mensajes (Próximamente)</div>} />
                  <Route path="analiticas" element={<div className="p-4">Sección Analíticas (Próximamente)</div>} />
                  <Route path="configuracion" element={<div className="p-4">Sección Configuración (Próximamente)</div>} />
                </Route>

                {/* RUTAS PÚBLICAS Y DE CLIENTE (CON NAVBAR, FOOTER Y MOBILE NAVBAR) */}
                <Route element={<LayoutPublico />}>
                  <Route path="/" element={<Inicio />} />
                  <Route path="/Home" element={<Inicio />} />
                  <Route path="/Productos" element={<Productos />} />
                  <Route path="/historial" element={<HistorialCompras />} />
                  <Route path="/favoritos" element={<Favorites />} />
                  <Route path="/category/:id" element={<ItemListContainer />} />
                  <Route path="/item/:id" element={<ItemDetailContainer />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/thankyou/:orderId" element={<ThankYou />} />
                  <Route path="/*" element={<Error404 />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </CartContextProvider>
        </FavoritesProvider>
      </AuthProvider>
    </div>
  );
}

export default App;