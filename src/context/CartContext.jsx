import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

const CartContextProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // CARGAR CARRITO
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cartItems");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (error) {
      console.error("Error cargando carrito:", error);
    }
  }, []);

  // GUARDAR CARRITO
  useEffect(() => {
    try {
      localStorage.setItem("cartItems", JSON.stringify(cart));
    } catch (error) {
      console.error("Error guardando carrito:", error);
    }
  }, [cart]);

  // AGREGAR PRODUCTO (SOLO POR ID)
  const addItem = (item, quantity) => {
    const existe = cart.find(producto => producto.id === item.id);

    if (existe) {
      const actualizado = cart.map(producto => {
        if (producto.id === item.id) {
          return { ...producto, quantity: producto.quantity + quantity };
        }
        return producto;
      });
      setCart(actualizado);
      return;
    }

    const nuevoProducto = {
      id: item.id,
      titulo: item.titulo,
      precio: item.precio,
      quantity,
      marca: item.marca || "",
      imagen: item.imagen || "/img/no-image.png"
    };

    setCart([...cart, nuevoProducto]);
  };

  // ACTUALIZAR CANTIDAD
  const updateQuantity = (id, cantidad) => {
    if (cantidad <= 0) {
      removeItem(id);
      return;
    }
    setCart(cart.map(item => item.id === id ? { ...item, quantity: cantidad } : item));
  };

  // ELIMINAR
  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // LIMPIAR
  const clear = () => {
    setCart([]);
  };

  const cartTotal = () => {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const sumTotal = () => {
    return cart.reduce((total, item) => total + (item.precio * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ cart, addItem, updateQuantity, removeItem, clear, cartTotal, sumTotal, setCart }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContextProvider;