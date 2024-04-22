"use client"

import React, { useState } from 'react';
import Modal from '../components/Modal';
import Login from '../components/Login';

export default function PublicHeader() {
    const [isModalOpen, setModalOpen] = useState(false);

    return (
        <div className="relative w-full">
            <h1 className="absolute top-1/2 -translate-y-1/2 left-5 text-5xl">Matcha</h1>
            <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-400 px-4 hover:brightness-75 text-white"
                onClick={() => {
                setModalOpen(true);
            }}>Log in</button>
                <Modal 
                    isOpen={isModalOpen}
                    onClose={() => {
                        setModalOpen(false)
                    }}
                >
                    <Login setModalOpen={setModalOpen}/>
                </Modal>
        </div>
    )
}