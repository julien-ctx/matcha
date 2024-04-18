"use client"

import React, { useState } from 'react';
import './Header.css';
import { AuthStatus } from "../auth/authTypes"
import PublicHeader from './PublicHeader';
import PrivateHeader from './PrivateHeader';
import { useAuth } from '../auth/AuthProvider';

const Header : React.FC = () => {
    const { authStatus } = useAuth();

    return (
        <header>
            {authStatus === AuthStatus.NotValidated ? (
                <PublicHeader />
            ) : authStatus === AuthStatus.Validated ? (
                <PrivateHeader />
            ) : null}
        </header>
    );
}

export default Header;