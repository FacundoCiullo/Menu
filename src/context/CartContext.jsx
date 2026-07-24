import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

// Función auxiliar para generar un hash/ID único basado en el producto y sus personalizaciones
const generateItemKey = (item) => {
  const sizeId = item.sizeSeleccionado?.id || "nosize";
  const additionalIds = item.additionalSeleccionados
    ? item.additionalSeleccionados
        .map((a) => a.id)
        .sort()
        .join("-")
    : "noadd";

  return `${item.id}_${sizeId}_${additionalIds}`;
};

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
    const itemKey = generateItemKey(item);
    const precioUnitarioCalculado = Number(item.precioUnitario ?? item.precio ?? 0);

    const existe = cart.find((producto) => producto.itemKey === itemKey);

    if (existe) {
      setCart(
        cart.map((producto) =>
          producto.itemKey === itemKey
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
        itemKey,
        id: item.id,
        titulo: item.titulo,
        precio: Number(item.precio || 0),
        precioUnitario: precioUnitarioCalculado,
        quantity,
        marca: item.marca || "",
        imagen: item.imagen || "/img/no-image.png",
        sizeSeleccionado: item.sizeSeleccionado || null,
        additionalSeleccionados: item.additionalSeleccionados || [],
      },
    ]);
  };

  /* ===========================
      ACTUALIZAR CANTIDAD
  =========================== */
  const updateQuantity = (keyOrId, quantity) => {
    const cantidad = Number(quantity);

    if (cantidad <= 0) {
      removeItem(keyOrId);
      return;
    }

    setCart(
      cart.map((item) =>
        item.itemKey === keyOrId || item.id === keyOrId
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
  const increaseQuantity = (keyOrId) => {
    setCart(
      cart.map((item) =>
        item.itemKey === keyOrId || item.id === keyOrId
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
  const decreaseQuantity = (keyOrId) => {
    const producto = cart.find(
      (item) => item.itemKey === keyOrId || item.id === keyOrId
    );

    if (!producto) return;

    if (producto.quantity <= 1) {
      removeItem(keyOrId);
      return;
    }

    setCart(
      cart.map((item) =>
        item.itemKey === keyOrId || item.id === keyOrId
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
  const removeItem = (keyOrId) => {
    setCart(
      cart.filter((item) => item.itemKey !== keyOrId && item.id !== keyOrId)
    );
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
    return cart.reduce((acc, item) => {
      const precio = Number(item.precioUnitario ?? item.precio ?? 0);
      return acc + item.quantity * precio;
    }, 0);
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