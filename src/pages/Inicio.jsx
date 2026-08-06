import React from "react";

import HeroCarousel from '../components/sections/HeroCarousel';
import CategoriesCarousel from "../components/sections/CategoriesCarousel";
import Destacados from "../components/sections/Destacados";
import PromosItemList from "../components/sections/PromosItemList"

const Inicio = () => {
  return (
    <div className="inicio-landing">

      <HeroCarousel />

      <CategoriesCarousel />

      <PromosItemList />

      <Destacados />

    </div>
  );
};

export default Inicio;