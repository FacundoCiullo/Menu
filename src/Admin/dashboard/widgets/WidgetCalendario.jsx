import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const WidgetCalendario = ({ fechaFiltro, setFechaFiltro }) => {
  return (
    <div className="d-flex flex-column align-items-center">
      <Calendar
        onChange={setFechaFiltro}
        value={fechaFiltro}
        className="border-0 shadow-sm rounded p-2 text-sm"
      />
    </div>
  );
};

export default WidgetCalendario;