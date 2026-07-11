import React from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  writeBatch
} from "firebase/firestore";

import productos from "../json/productos.json";

import { Button } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { BsCloudArrowDown } from "react-icons/bs";

const ActualizarProductos = () => {

  const actualizarFirestore = async () => {
    try {

      const batch = writeBatch(db);
      const coleccion = collection(db, "items");

      productos.forEach((producto) => {

        const idStr = String(producto.id).padStart(3, "0");

        const docRef = doc(coleccion, idStr);

        batch.set(docRef, {
          ...producto,
          id: idStr,
        });

      });

      await batch.commit();

      toast.success(
        `✅ ${productos.length} productos actualizados correctamente`,
        {
          position: "top-center",
          autoClose: 2500,
        }
      );

    } catch (error) {

      console.error("Error al actualizar Firestore:", error);

      toast.error(
        "❌ Error al actualizar Firestore",
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
    }
  };

  return (
    <>
      <div className="text-center">

        <Button
          variant="outline-secondary"
          className="w-100"
          onClick={actualizarFirestore}
        >
          <BsCloudArrowDown className="me-2" />
          Actualizar Productos
        </Button>

      </div>

      <ToastContainer />
    </>
  );
};

export default ActualizarProductos;