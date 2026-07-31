import React from "react";


import CategoriesCarousel from "../components/sections/CategoriesCarousel";
import Destacados from "../components/sections/Destacados";
import PromosItemList from "../components/sections/PromosItemList"

const Inicio = () => {
  return (
    <div className="inicio-landing">

      <section className="">
        <img className="inicio-banner" src="/img/banner-restaurant.png" alt="" />
      </section>

      <CategoriesCarousel />

      <PromosItemList />

      <Destacados />

    </div>
  );
};

export default Inicio;