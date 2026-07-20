import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

const CartContextProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  /* ===========================
      CARGAR CARRITO
  =========================== */

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cartItems");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (err) {
      console.error("Error cargando carrito:", err);
    }
  }, []);

  /* ===========================
      GUARDAR CARRITO
  =========================== */

  useEffect(() => {
    try {
      localStorage.setItem("cartItems", JSON.stringify(cart));
    } catch (err) {
      console.error("Error guardando carrito:", err);
    }
  }, [cart]);

  /* ===========================
      AGREGAR PRODUCTO
  =========================== */

  const addItem = (item, quantity = 1) => {
    const existe = cart.find(producto => producto.id === item.id);

    if (existe) {
      setCart(
        cart.map(producto =>
          producto.id === item.id
            ? {
                ...producto,
                quantity: producto.quantity + quantity,
              }
            : producto
        )
      );

      return;
    }

    setCart([
      ...cart,
      {
        id: item.id,
        titulo: item.titulo,
        precio: Number(item.precio),
        quantity,
        marca: item.marca || "",
        imagen: item.imagen || "/img/no-image.png",
      },
    ]);
  };

  /* ===========================
      ACTUALIZAR CANTIDAD
  =========================== */

  const updateQuantity = (id, quantity) => {
    const cantidad = Number(quantity);

    if (cantidad <= 0) {
      removeItem(id);
      return;
    }

    setCart(
      cart.map(item =>
        item.id === id
          ? {
              ...item,
              quantity: cantidad,
            }
          : item
      )
    );
  };

  /* ===========================
      AUMENTAR
  =========================== */

  const increaseQuantity = id => {
    setCart(
      cart.map(item =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  /* ===========================
      DISMINUIR
  =========================== */

  const decreaseQuantity = id => {
    const producto = cart.find(item => item.id === id);

    if (!producto) return;

    if (producto.quantity <= 1) {
      removeItem(id);
      return;
    }

    setCart(
      cart.map(item =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
    );
  };

  /* ===========================
      ELIMINAR
  =========================== */

  const removeItem = id => {
    setCart(cart.filter(item => item.id !== id));
  };

  /* ===========================
      LIMPIAR
  =========================== */

  const clear = () => {
    setCart([]);
  };

  /* ===========================
      TOTAL PRODUCTOS
  =========================== */

  const cartTotal = () => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  };

  /* ===========================
      TOTAL $
  =========================== */

  const sumTotal = () => {
    return cart.reduce(
      (acc, item) => acc + item.quantity * Number(item.precio),
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,
        clear,
        cartTotal,
        sumTotal,
        setCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContextProvider;