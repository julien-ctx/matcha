"use client"

import React, { ReactNode, createContext, useContext, useState } from 'react';

interface UIContextType {
    showLogin: boolean;
    showVisitsList: boolean;
    showLikesList: boolean;
    anotherConnection: boolean;
    toggleVisitsList: (show: boolean) => void;
    toggleLikesList: (show: boolean) => void;
    toggleLogin: (show: boolean) => void;
    toggleAnotherConnection: (show: boolean) => void;
}

const UIContext = createContext<UIContextType | null>(null);

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }: { children : ReactNode}) => {
    const [showVisitsList, setShowVisitsList] = useState(false);
    const [showLikesList, setShowLikesList] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [anotherConnection, setAnotherConnection] = useState(false);

    const toggleLogin = (show: boolean) => {
        setShowLogin(show);
    }

    const toggleVisitsList = (show: boolean) => {
        showLikesList && setShowLikesList(false);
        setShowVisitsList(show);
    };
    const toggleLikesList = (show: boolean) => {
        showVisitsList && setShowVisitsList(false);
        setShowLikesList(show);
    }
    const toggleAnotherConnection = (show: boolean) => {
        setAnotherConnection(show);
    }

    return (
        <UIContext.Provider value={{showLogin, showVisitsList, showLikesList, anotherConnection, toggleLikesList, toggleVisitsList, toggleLogin, toggleAnotherConnection}}>
            {children}
        </UIContext.Provider>
    );
};
