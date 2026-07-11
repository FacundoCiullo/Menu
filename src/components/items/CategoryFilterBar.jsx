// src/components/items/CategoryFilterBar.jsx

import { useMemo } from "react";
import "./style/CategoryFilterBar.css";

const CategoryFilterBar = ({
  productos = [],
  filtros,
  setFiltros,
}) => {
  const subcategorias = useMemo(() => {
    // Ordenar por ID (001, 002, 003...)
    const productosOrdenados = [...productos].sort(
      (a, b) => Number(a.id) - Number(b.id)
    );

    // Obtener subcategorías únicas respetando ese orden
    const lista = [];
    const usadas = new Set();

    productosOrdenados.forEach((producto) => {
      if (
        producto.subcategoria &&
        !usadas.has(producto.subcategoria)
      ) {
        usadas.add(producto.subcategoria);
        lista.push(producto.subcategoria);
      }
    });

    return ["Todo", ...lista];
  }, [productos]);

  const cambiarSubcategoria = (subcategoria) => {
    setFiltros({
      subcategorias: subcategoria === "Todo" ? [] : [subcategoria],
    });
  };

  return (
    <div className="filters-scroll">
      {subcategorias.map((subcategoria) => {
        const active =
          subcategoria === "Todo"
            ? (filtros.subcategorias ?? []).length === 0
            : (filtros.subcategorias ?? []).includes(subcategoria);

        return (
          <button
            key={subcategoria}
            type="button"
            className={`filter-btn ${active ? "active" : ""}`}
            onClick={() => cambiarSubcategoria(subcategoria)}
          >
            {subcategoria}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilterBar;