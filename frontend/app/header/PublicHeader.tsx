"use client"

import React, { useState } from 'react';
import Modal from '../components/Modal';
import Login from '../components/Login';

export default function PublicHeader() {
    const [isModalOpen, setModalOpen] = useState(false);

    return (
        <>
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
                    <Login setModalOpen={setModalOpen}/>
                </Modal>

        </>
    )
}