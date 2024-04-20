"use client"

import React, { useState } from 'react';
import { AuthStatus } from "../auth/authTypes"
import PublicHeader from './PublicHeader';
import PrivateHeader from './PrivateHeader';
import { useAuth } from '../auth/AuthProvider';

const Header : React.FC = () => {
    const { authStatus } = useAuth();

    return (
        <header className="absolute bg-none h-20 flex w-full bg-rose-200 z-30">
            {authStatus === AuthStatus.NotValidated ? (
                <PublicHeader />
            ) : authStatus === AuthStatus.Validated ? (
                <PrivateHeader />
            ) : null}
        </header>
    );
}

export default Header;