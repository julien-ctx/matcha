"use client"

import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

interface ModalProp {
    isOpen: boolean,
    onClose: () => void,
    children: ReactNode
}

const Modal: React.FC<ModalProp> = ({ isOpen, onClose, children }) => {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    if (!isOpen) return null;

    return (mounted ? ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
        , document.body) : null
    );
};

export default Modal;