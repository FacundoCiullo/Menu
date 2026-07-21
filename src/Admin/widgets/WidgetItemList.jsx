import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ItemList from "./ItemList";
import CategoryFilterBar from "./CategoryFilterBar";

import {
  getFirestore,
  collection,
  getDocs,
  where,
  query,
} from "firebase/firestore";

import Loading from "../ui/Loading";

const WidgetItemList = ({ limit }) => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();

  const [searchParams] = useSearchParams();
  const subcategoriaURL = searchParams.get("subcategoria");

  const [filtros, setFiltros] = useState({
    subcategorias: subcategoriaURL ? [subcategoriaURL] : [],
  });


  // ===========================
  // CARGAR PRODUCTOS FIREBASE
  // ===========================

  useEffect(() => {
    const db = getFirestore();
    const itemsCollection = collection(db, "items");

    const q = id
      ? query(itemsCollection, where("categoria", "==", id))
      : itemsCollection;

    getDocs(q).then((resultado) => {

      if (resultado.size > 0) {

        const data = resultado.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setItems(data);

      } else {

        console.warn("No se encontraron productos.");
      }
      setLoading(false);
    });

  }, [id]);


  // ===========================
  // CARGAR FILTRO DESDE URL
  // ===========================

  useEffect(() => {

    if (subcategoriaURL) {

      setFiltros({
        subcategorias: [subcategoriaURL],
      });

    } else {

      setFiltros({
        subcategorias: [],
      });
    }
  }, [subcategoriaURL]);

  // ===========================
  // FILTRAR PRODUCTOS
  // ===========================

  useEffect(() => {
    let productos = [...items];

    if (filtros.subcategorias.length > 0) {
      productos = productos.filter((item) =>
        filtros.subcategorias.includes(item.subcategoria)
      );
    }

    setFiltered(
      limit
        ? productos.slice(0, limit)
        : productos
    );
  }, [items, filtros, limit]);

  if (loading) return <Loading />;

  return (
    <div className="container-1">

      <CategoryFilterBar
        productos={items}
        filtros={filtros}
        setFiltros={setFiltros}
      />

      <ItemList productos={filtered} />
    </div>

  );
};


export default WidgetItemList;