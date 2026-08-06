import React, { useState, useContext, useEffect } from 'react';
import { CartContext } from '../../context/CartContext';
import { db, auth } from '../../firebase/index'; // Asegúrate de exportar 'auth' desde tu firebaseConfig
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { IoTrashOutline } from "react-icons/io5";
import './style/cart.css';

export const Cart = ({ isOpen, show, onClose, handleClose }) => {
  const isModalOpen = isOpen !== undefined ? isOpen : show;
  const closeModal = onClose || handleClose || (() => {});

  const { 
    cart, 
    removeItem, 
    increaseQuantity, 
    decreaseQuantity, 
    clear, 
    sumTotal,
    discount = 0 // Extraemos descuento si existe en el Contexto (default 0)
  } = useContext(CartContext);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [buyer, setBuyer] = useState({
    name: '',
    email: '',
    phone: '',
    deliveryType: 'local', // 'local' o 'delivery'
    address: '',
    paymentMethod: 'efectivo'
  });

  const [errors, setErrors] = useState({});

  // Carga automática de los datos de la cuenta de Google / Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setBuyer(prev => ({
          ...prev,
          name: currentUser.displayName || prev.name,
          email: currentUser.email || prev.email,
          phone: currentUser.phoneNumber || prev.phone
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isModalOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBuyer(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!buyer.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!buyer.phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    if (buyer.deliveryType === 'delivery' && !buyer.address.trim()) {
      newErrors.address = 'La dirección es obligatoria para Delivery';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const totalAmount = sumTotal();

      const orderData = {
        buyer: {
          name: buyer.name,
          email: buyer.email,
          phone: buyer.phone,
          deliveryType: buyer.deliveryType,
          address: buyer.deliveryType === 'delivery' ? buyer.address : 'Retiro por local',
          paymentMethod: buyer.paymentMethod
        },
        items: cart.map(item => ({
          itemKey: item.itemKey,
          id: item.id,
          titulo: item.titulo,
          cantidad: item.quantity,
          precioUnitario: item.precioUnitario ?? item.precio,
          size: item.sizeSeleccionado || null,
          adicionales: item.additionalSeleccionados || []
        })),
        descuento: discount,
        total: totalAmount,
        date: serverTimestamp(),
        status: 'pedido' // 👈 CAMBIADO: 'pendiente' por 'pedido'
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderId(docRef.id);

      clear();
      setStep(3);

    } catch (error) {
      console.error('Error al procesar la orden:', error);
      alert('Ocurrió un error al enviar el pedido.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setStep(1);
    closeModal();
  };

  // Cálculo de total de ítems acumulados
  const totalItemsCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <div className="cart-overlay" onClick={handleCloseModal}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* PASO 1: CARRITO */}
        {step === 1 && (
          <>
            <div className="cart-header">
              <div>
                <h1>Tu Pedido</h1>
                <span className="cart-badge-count">({cart.length} ítems)</span>
              </div>
              <button className="cart-close-icon" onClick={handleCloseModal}>✕</button>
            </div>

            <div className="ticket-divider-container">
              <div className="ticket-notch left"></div>
              <div className="ticket-divider-line"></div>
              <div className="ticket-notch right"></div>
            </div>

            {cart.length === 0 ? (
              <div className="empty-box">
                <div className="empty-icon-wrapper">🛒</div>
                <h2>Carrito Vacío</h2>
                <p>Agregá tus productos favoritos para comenzar.</p>
                <button className="empty-button" onClick={handleCloseModal}>
                  Ver Menú
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item, index) => {
                    const unitPrice = item.precioUnitario ?? item.precio ?? 0;
                    const itemSubtotal = unitPrice * item.quantity;

                    return (
                      <React.Fragment key={item.itemKey || index}>
                        <div className="cart-card">
                          {item.imagen && (
                            <div className="cart-image">
                              <img src={item.imagen} alt={item.titulo} />
                            </div>
                          )}

                          <div className="cart-info">
                            <div className="cart-title">
                              <h2>{item.titulo}</h2>
                              <button 
                                className="delete-button" 
                                onClick={() => removeItem(item.itemKey)}
                              >
                                <IoTrashOutline />
                              </button>
                            </div>

                            {/* Renderizado Seguro de Tamaño */}
                            {item.sizeSeleccionado && (
                              <span className="cart-extras-list"> 
                                • {typeof item.sizeSeleccionado === 'object'
                                  ? (item.sizeSeleccionado.nombre || item.sizeSeleccionado.title)
                                  : item.sizeSeleccionado}
                              </span>
                            )}

                            {/* Renderizado Seguro de Adicionales */}
                            {item.additionalSeleccionados && item.additionalSeleccionados.length > 0 && (
                              <div className="cart-extras-list">
                                <ul>
                                  {item.additionalSeleccionados.map((add, idx) => {
                                    const nombreAdd = typeof add === 'object' ? (add.nombre || add.title) : add;
                                    const precioAdd = typeof add === 'object' && add.precio ? `(+$${add.precio})` : '';
                                    return (
                                      <li key={add.id || idx}>
                                        • {nombreAdd} {precioAdd}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}

                            <div className="cart-controls-row">
                              <div className="quantity-box">
                                <button className="qty-button" onClick={() => decreaseQuantity(item.itemKey)}>-</button>
                                <span className="quantity-number">{item.quantity}</span>
                                <button className="qty-button" onClick={() => increaseQuantity(item.itemKey)}>+</button>
                              </div>

                              <div className="subtotal-box">
                                <small>Subtotal</small>
                                <strong>${itemSubtotal.toLocaleString()}</strong>
                              </div>
                            </div>
                          </div>
                        </div>

                        {index < cart.length - 1 && (
                          <div className="ticket-divider-container">
                            <div className="ticket-divider-line"></div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="ticket-divider-container">
                  <div className="ticket-notch left"></div>
                  <div className="ticket-divider-line"></div>
                  <div className="ticket-notch right"></div>
                </div>

                <div className="cart-summary">
                  {/* CANTIDAD DE PRODUCTOS Y DESCUENTO (PASO 1) */}
                  <div className="checkout-summary-details" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                    <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#a1a1aa' }}>
                      <span>Cantidad de productos:</span>
                      <strong>{totalItemsCount} {totalItemsCount === 1 ? 'producto' : ''}</strong>
                    </div>

                    {discount > 0 && (
                      <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#22c55e' }}>
                        <span>Descuento:</span>
                        <strong>-${discount.toLocaleString()}</strong>
                      </div>
                    )}
                  </div>

                  <div className="summary-row total">
                    <span>Total a pagar :</span>
                    <strong>${sumTotal().toLocaleString()}</strong>
                  </div>

                  <button className="checkout-button" onClick={() => setStep(2)}>
                    Iniciar Pedido
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* PASO 2: CHECKOUT */}
        {step === 2 && (
          <>
            <div className="cart-header">
              <h1>Datos del Pedido</h1>
              <button className="cart-close-icon" onClick={handleCloseModal}>✕</button>
            </div>

            <div className="ticket-divider-container">
              <div className="ticket-notch left"></div>
              <div className="ticket-divider-line"></div>
              <div className="ticket-notch right"></div>
            </div>

            <form onSubmit={handleConfirmOrder} className="checkout-form">
              {/* DATOS DE CUENTA DE GOOGLE */}
              <div className="checkout-field">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Ej: Facundo Ciullo"
                  className="checkout-input"
                  value={buyer.name}
                  onChange={handleInputChange}
                />
                {errors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.name}</span>}
              </div>

              <div className="checkout-field">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Ej: 1123456789"
                  className="checkout-input"
                  value={buyer.phone}
                  onChange={handleInputChange}
                />
                {errors.phone && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.phone}</span>}
              </div>

              {/* TIPO DE ENTREGA */}
              <div className="checkout-field">
                <label>Modalidad de Entrega</label>
                <div className="payment-methods">
                  <label className={`payment-option ${buyer.deliveryType === 'local' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="local"
                      checked={buyer.deliveryType === 'local'}
                      onChange={handleInputChange}
                    />
                    🛍️ Retiro
                  </label>
                  <label className={`payment-option ${buyer.deliveryType === 'delivery' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="delivery"
                      checked={buyer.deliveryType === 'delivery'}
                      onChange={handleInputChange}
                    />
                    🛵 Delivery
                  </label>
                </div>
              </div>

              {/* DIRECCIÓN DE UBICACIÓN (SI ES DELIVERY) */}
              {buyer.deliveryType === 'delivery' && (
                <div className="checkout-field">
                  <label>Ubicación / Dirección de envío</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Ej: Av. Mitre 1234, Depto 2B"
                    className="checkout-input"
                    value={buyer.address}
                    onChange={handleInputChange}
                  />
                  {errors.address && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.address}</span>}
                </div>
              )}

              {/* MÉTODO DE PAGO */}
              <div className="checkout-field">
                <label>Método de Pago</label>
                <div className="payment-methods">
                  <label className={`payment-option ${buyer.paymentMethod === 'efectivo' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="efectivo"
                      checked={buyer.paymentMethod === 'efectivo'}
                      onChange={handleInputChange}
                    />
                    💵 Efectivo
                  </label>
                  <label className={`payment-option ${buyer.paymentMethod === 'transferencia' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transferencia"
                      checked={buyer.paymentMethod === 'transferencia'}
                      onChange={handleInputChange}
                    />
                    💳 Transferencia
                  </label>
                </div>
              </div>

              {/* DESGLOSE DE ALIAS SI ES TRANSFERENCIA */}
              {buyer.paymentMethod === 'transferencia' && (
                <div className="checkout-field" style={{
                  background: 'rgba(255, 140, 0, 0.08)',
                  border: '1px dashed var(--iqv-accent, #ff8c00)',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '0.85rem'
                }}>
                  <strong style={{ color: 'var(--iqv-accent, #ff8c00)', display: 'block', marginBottom: '4px' }}>
                    Datos para Transferir:
                  </strong>
                  <div><strong>Alias:</strong> CODEFOXLAB.MP</div>
                  <div><strong>CBU/CVU:</strong> 0000003100012345678901</div>
                  <div><strong>Titular:</strong> Code Fox Lab</div>
                </div>
              )}

              {/* DIVISOR ESTILO TICKET */}
              <div className="ticket-divider-container">
                <div className="ticket-notch left"></div>
                <div className="ticket-divider-line"></div>
                <div className="ticket-notch right"></div>
              </div>

              {/* CANTIDAD DE PRODUCTOS Y DESCUENTO (PASO 2) */}
              <div className="checkout-summary-details" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#a1a1aa' }}>
                  <span>Cantidad de productos:</span>
                  <strong>{totalItemsCount} {totalItemsCount === 1 ? 'producto' : 'productos'}</strong>
                </div>

                {discount > 0 && (
                  <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#22c55e' }}>
                    <span>Descuento:</span>
                    <strong>-${discount.toLocaleString()}</strong>
                  </div>
                )}
              </div>

              <div className="summary-row total" style={{ marginTop: '6px' }}>
                <span>Total a pagar :</span>
                <strong> ${sumTotal().toLocaleString()}</strong>
              </div>

              <div className="checkout-actions-row">
                <button type="button" className="btn-back-actions" onClick={() => setStep(1)} disabled={loading}>
                  Volver
                </button>
                <button type="submit" className="checkout-button" disabled={loading}>
                  {loading ? 'Enviando...' : 'Confirmar Pedido'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* PASO 3: CONFIRMACIÓN Y GRACIAS */}
        {step === 3 && (
          <div className="success-box">
            <div className="success-icon">✓</div>
            <h2>¡Gracias por tu compra!</h2>
            <p>Tu orden ha sido registrada correctamente. Te notificaremos el estado de tu pedido.</p>
            
            <div className="order-id-badge">Orden N°: {orderId}</div>

            <button className="checkout-button" style={{ width: '100%', marginTop: '16px' }} onClick={handleCloseModal}>
              Cerrar
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export const CartModal = Cart;
export default Cart;