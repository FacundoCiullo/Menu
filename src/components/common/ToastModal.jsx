import React from "react";
import { Modal } from "react-bootstrap";
import { motion } from "framer-motion";
import { 
  CheckCircleFill, 
  ExclamationTriangleFill, 
  XCircleFill, 
  InfoCircleFill 
} from "react-bootstrap-icons";

import "./style/toastModal.css";

const ToastModal = ({ 
  show, 
  onHide, 
  type = "success", // 'success' | 'warning' | 'error' | 'info'
  subheading = "", 
  title = "", 
  message = "", 
  btnText = "Aceptar",
  onConfirm = null 
}) => {

  const handleButtonClick = () => {
    if (onConfirm) onConfirm();
    onHide();
  };

  // Renderizado dinámico de icono según tipo
  const renderIcon = () => {
    switch (type) {
      case "warning":
        return <ExclamationTriangleFill className="tm-icon tm-icon-warning" />;
      case "error":
        return <XCircleFill className="tm-icon tm-icon-error" />;
      case "info":
        return <InfoCircleFill className="tm-icon tm-icon-info" />;
      case "success":
      default:
        return <CheckCircleFill className="tm-icon tm-icon-success" />;
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className="tm-modal-custom"
    >
      <Modal.Body className="tm-body">
        <motion.div 
          className="tm-icon-wrapper"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {renderIcon()}
        </motion.div>

        {subheading && <span className="tm-subheading">{subheading}</span>}
        {title && <h3 className="tm-title">{title}</h3>}
        {message && (
          <div className="tm-desc">
            {typeof message === "string" ? <p>{message}</p> : message}
          </div>
        )}

        <button
          className={`tm-btn tm-btn-${type}`}
          onClick={handleButtonClick}
        >
          {btnText}
        </button>
      </Modal.Body>
    </Modal>
  );
};

export default ToastModal;