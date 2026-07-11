import "./style/Sections.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import HorizontalItemList from "../items/HorizontalItemList";
import Loading from "../ui/Loading";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const Destacados = ({ limit = 8 }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerDestacados = async () => {
      try {
        const db = getFirestore();

        const itemsCollection = collection(db, "items");

        const consulta = query(
          itemsCollection,
          where("oferta", "==", true)
        );

        const resultado = await getDocs(consulta);

        const productos = resultado.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setItems(productos.slice(0, limit));
      } catch (error) {
        console.error("Error al obtener productos destacados:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerDestacados();
  }, [limit]);

  if (loading) {
    return <Loading />;
  }

  return (
    <motion.section
      className=" container"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="d-flex destacados">
        <h2 className="fw-bold m-0">Destacados</h2>

      <Link className="link-underline-dark" to="/Productos">
            <p className="text-white">Ver más</p>
        </Link>
      </div>

      <HorizontalItemList productos={items} />
    </motion.section>
  );
};

export default Destacados;