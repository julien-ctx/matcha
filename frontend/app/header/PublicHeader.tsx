"use client"

import React from 'react';
import { useUI } from '../contexts/UIContext';

export default function PublicHeader() {
    const { toggleLogin } = useUI();

    return (
        <div className="relative w-full">
            <h1 className="absolute top-1/2 -translate-y-1/2 left-5 text-5xl cursor-pointer" onClick={() => window.location.reload()}>Matcha</h1>
            <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 px-5 py-1 border-2 border-white text-xl rounded-sm hover:brightness-110 hover:border-rose-500 hover:text-rose-500 duration-200"
                style={{backgroundColor: 'rgba(255, 255, 255, 0.6)'}}
                onClick={() => {
                    toggleLogin(true);
            }}>Log in</button>
        </div>
    )
}