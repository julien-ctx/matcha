"use client"

import React, { useState } from 'react';
import { AuthStatus } from "../types/authTypes"
import PublicHeader from './PublicHeader';
import PrivateHeader from './PrivateHeader';
import { useAuth } from '../contexts/AuthContext';

const Header : React.FC = () => {
    const { authStatus } = useAuth();

    return (
        <header className="absolute h-20 flex w-full z-50 text-white shadow-md">
            {authStatus === AuthStatus.NotValidated ? (
                <PublicHeader />
            ) : authStatus === AuthStatus.Validated ? (
                <PrivateHeader />
            ) : null}
        </header>
    );
}

export default Header;