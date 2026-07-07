import { createContext, useContext, useState, useEffect } from "react";

const TemplateContext = createContext();

export const TemplateProvider = ({ children }) => {
  const [template, setTemplate] = useState("cafe");
  const [mode, setMode] = useState("light");

  useEffect(() => {
    // 🔥 Esto es lo importante
    document.documentElement.setAttribute(
      "data-theme",
      `${template}-${mode}`
    );
  }, [template, mode]);

  return (
    <TemplateContext.Provider
      value={{ template, setTemplate, mode, setMode }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplate = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error("useTemplate debe usarse dentro de TemplateProvider");
  }
  return context;
};