"use client"

import React, { useState } from 'react';
import { AuthStatus } from "../auth/authTypes"
import PublicHeader from './PublicHeader';
import PrivateHeader from './PrivateHeader';
import { useAuth } from '../auth/AuthProvider';

const Header : React.FC = () => {
    const { authStatus } = useAuth();

    return (
        <header className="absolute h-20 flex w-full z-30 bg-gradient-to-r-main text-white shadow-md">
            {authStatus === AuthStatus.NotValidated ? (
                <PublicHeader />
            ) : authStatus === AuthStatus.Validated ? (
                <PrivateHeader />
            ) : null}
        </header>
    );
}

export default Header;