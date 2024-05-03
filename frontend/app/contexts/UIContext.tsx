"use client"

import React, { ReactNode, createContext, useContext, useState } from 'react';

interface UIContextType {
    showVisitsList: boolean;
    showLikesList: boolean;
    toggleVisitsList: (show: boolean) => void;
    toggleLikesList: (show: boolean) => void;
}

const UIContext = createContext<UIContextType | null>(null);

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }: { children : ReactNode}) => {
    const [showVisitsList, setShowVisitsList] = useState(false);
    const [showLikesList, setShowLikesList] = useState(false);

    const toggleVisitsList = (show: boolean) => {
        showLikesList && setShowLikesList(false);
        setShowVisitsList(show);
    };
    const toggleLikesList = (show: boolean) => {
        showVisitsList && setShowVisitsList(false);
        setShowLikesList(show);
    }

    return (
        <UIContext.Provider value={{showVisitsList, showLikesList, toggleLikesList, toggleVisitsList}}>
            {children}
        </UIContext.Provider>
    );
};
