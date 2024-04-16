"use client"

import React, { useState } from 'react';
import './Header.css';
import Modal from '../components/Modal';
import Login from '../components/Login';

const Header : React.FC = () => {
    const [isModalOpen, setModalOpen] = useState(false);

    return (
        <header>
        <h1>Matcha</h1>
        <button onClick={() => {
            setModalOpen(true);
        }}>login</button>
            <Modal 
                isOpen={isModalOpen}
                onClose={() => {
                    setModalOpen(false)
                }}
            >
                <Login />
            </Modal>

        </header>
    );
}

export default Header;