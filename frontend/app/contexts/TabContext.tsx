"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { generateUUID } from '../utils';

const TAB_KEY = 'activeTab';

interface TabContextType {
    tabActivated: boolean;

}

const TabContext = createContext<TabContextType | null>(null);

export const useTab = () => useContext(TabContext);

export const TabProvider = ({ children }) => {
    const { user, socket } = useAuth();
    const [tabId, setTabId] = useState(generateUUID());
    const [tabActivated, setTabActivated] = useState(true);

    useEffect(() => {
        if (!user) return;

        localStorage.setItem(TAB_KEY, tabId);
    }, [user])


    useEffect(() => {
        window.addEventListener('storage', event => {
            if (event.key === TAB_KEY) {
                setTabActivated(false);
                socket?.disconnect();
            }
        })
    }, [socket])

    return (
        <TabContext.Provider value={{ tabActivated }}>
            {children}
        </TabContext.Provider>
    );
};
