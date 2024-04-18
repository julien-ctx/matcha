"use client"

import React, { useState } from 'react'

import Modal from "./Modal"

export default function Match() {
    const [isModalOpen, setModalOpen] = useState(false);

    return (
        <div className="h-full bg-fuchsia-300 w-3/4 min-w-48 pt-16">
            <button onClick={() => setModalOpen(true)}>
                <img className="w-14 h-14" src="parameters.svg" alt="parameters" />
            </button>
            <h1>Match</h1>
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <div>
                    {/* Here advanced options for browsing */}
                    <h1>Parameters</h1>
                    <button onClick={() => setModalOpen(false)}>close</button>
                </div>
            </Modal>
        </div>
    )
}