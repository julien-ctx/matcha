"use client"

import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface UIContextType {
    showVisitsList: boolean;
    showLikesList: boolean;
    toggleVisitsList: () => void;
    toggleLikesList: () => void;
}

const UIContext = createContext<UIContextType | null>(null);

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }: { children : ReactNode}) => {
    const [showVisitsList, setShowVisitsList] = useState(false);
    const [showLikesList, setShowLikesList] = useState(false);

    const toggleVisitsList = () => {
        showLikesList && setShowLikesList(false);
        setShowVisitsList(!showVisitsList);
    };
    const toggleLikesList = () => {
        showVisitsList && setShowVisitsList(false);
        setShowLikesList(!showLikesList);
    }

    return (
        <UIContext.Provider value={{showVisitsList, showLikesList, toggleLikesList, toggleVisitsList}}>
            {children}
        </UIContext.Provider>
    );
};
