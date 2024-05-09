"use client"

import React, { ReactNode, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

interface ModalProp {
    isOpen: boolean,
    onClose: () => void,
    children: ReactNode,
    modalStyle?: React.CSSProperties,
}

const Modal: React.FC<ModalProp> = ({ isOpen, onClose, children, modalStyle }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!isOpen) return null;

    return (mounted ? ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={modalStyle}>
                <div className="w-full h-full bg-white p-8 rounded-md border-2">
                {children}
                </div>
            </div>
        </div>
        , document.body) : null
    );
};

export default Modal;
