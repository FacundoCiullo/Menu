import React, { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import "./cart.css";

const Cart = () => {
  const {
    cart,
    clear,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    sumTotal,
    cartTotal,
  } = useContext(CartContext);

  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      setShowModal(true);
      return;
    }

    navigate("/checkout");
  };


  if (cart.length === 0) {
    return (
      <div className="cart-empty">

        <div className="empty-box">

          <h2>
            Tu carrito está vacío 🛒
          </h2>

          <p>
            Agregá productos para comenzar tu compra.
          </p>

          <Link
            to="/Productos"
            className="empty-button"
          >
            Ver productos
          </Link>

        </div>

      </div>
    );
  }


  return (

    <main className="cart-page">


      <section className="cart-wrapper">


        <header className="cart-header">

          <h1>
            Productos seleccionados
          </h1>


          <div className="cart-actions">

            <Link
              to="/Productos"
              className="continue-shopping"
            >
              Seguir comprando
            </Link>


            <button
              className="clear-cart"
              onClick={clear}
            >
              Vaciar carrito
            </button>


          </div>


        </header>



        <section className="cart-items">


          {cart.map((item) => (

            <article
              className="cart-card"
              key={item.id}
            >


              <div className="cart-image">

                <img
                  src={item.imagen}
                  alt={item.titulo}
                />

              </div>



              <div className="cart-info">


                <div className="cart-title">


                  <h2>
                    {item.marca && `${item.marca} `}
                    {item.titulo}
                  </h2>


                  <button
                    className="delete-button"
                    onClick={() => removeItem(item.id)}
                  >
                    <i className="bi bi-trash3-fill"></i>
                  </button>


                </div>



                <p className="unit-price">

                  Precio unitario:

                  <strong>
                    ${item.precio}
                  </strong>

                </p>



                <div className="quantity-box">


                  <button
                    className="qty-button"
                    onClick={() =>
                      decreaseQuantity(item.id)
                    }
                  >
                    -
                  </button>


                  <span className="quantity-number">
                    {item.quantity}
                  </span>


                  <button
                    className="qty-button"
                    onClick={() =>
                      increaseQuantity(item.id)
                    }
                  >
                    +
                  </button>


                </div>



                <div className="subtotal">


                  <span>
                    Subtotal
                  </span>


                  <strong>
                    ${item.precio * item.quantity}
                  </strong>


                </div>



              </div>



            </article>

          ))}


        </section>




        <section className="cart-summary">


          <div className="summary-row">

            <span>
              Productos
            </span>

            <strong>
              {cartTotal()}
            </strong>

          </div>



          <div className="summary-row total">


            <span>
              Total a pagar
            </span>


            <strong>
              ${sumTotal()}
            </strong>


          </div>



          <button
            className="checkout-button"
            onClick={handleCheckout}
          >
            Finalizar compra
          </button>



        </section>



      </section>




      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >


        <Modal.Header closeButton>

          <Modal.Title>
            Iniciá sesión
          </Modal.Title>

        </Modal.Header>



        <Modal.Body>

          Para finalizar tu compra necesitás iniciar sesión.

        </Modal.Body>



        <Modal.Footer>


          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >

            Entendido

          </Button>


        </Modal.Footer>



      </Modal>



    </main>

  );
};


export default Cart;