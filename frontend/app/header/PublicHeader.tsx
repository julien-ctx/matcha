"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../components/Modal';
import Login from '../components/Login';

export default function PublicHeader() {
    const [isModalOpen, setModalOpen] = useState(false);
    const router = useRouter();

    return (
        <div className="relative w-full">
            <h1 className="absolute top-1/2 -translate-y-1/2 left-5 text-5xl cursor-pointer" onClick={() => router.push('/')}>Matcha</h1>
            <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 px-5 py-1 border-2 border-white text-xl rounded-sm hover:brightness-95"
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